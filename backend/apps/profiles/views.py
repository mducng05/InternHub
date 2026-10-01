from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from apps.jobs.models import Job
from apps.jobs.serializers import JobListSerializer
from apps.catalog.models import Skill, Location
from .cv_scanner import scan_cv
from .models import EmployerProfile, StudentProfile
from .serializers import EmployerProfileSerializer, PublicCompanySerializer, StudentProfileSerializer


class StudentProfileMeView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        default_name = user.get_full_name() or user.username or (user.email.split("@")[0] if user.email else "Sinh viên")
        profile, _ = StudentProfile.objects.get_or_create(
            user=user,
            defaults={"full_name": default_name},
        )
        return profile


class EmployerProfileMeView(generics.RetrieveUpdateAPIView):
    serializer_class = EmployerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.role != "employer":
            raise PermissionDenied("Chỉ tài khoản nhà tuyển dụng mới được cập nhật hồ sơ doanh nghiệp.")
        company_name = user.get_full_name() or user.email.split("@")[0]
        profile, _ = EmployerProfile.objects.get_or_create(
            user=user,
            defaults={"company_name": company_name or f"Doanh nghiệp {user.pk}"},
        )
        return profile


class PublicCompanyDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicCompanySerializer
    queryset = (
        EmployerProfile.objects.select_related("industry")
        .annotate(
            public_jobs_count=Count(
                "jobs",
                filter=Q(jobs__status=Job.Status.APPROVED),
                distinct=True,
            )
        )
    )


# ---------------------------------------------------------------------------
# CV Scan — POST /api/v1/profiles/student/scan-cv/
# ---------------------------------------------------------------------------

class CvScanView(APIView):
    """
    POST body: multipart/form-data with field `cv_file` (PDF/DOC/DOCX).
    Returns: { skills, address, raw_text_preview }
    Requires authentication (any role).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        uploaded = request.FILES.get("cv_file")
        if not uploaded:
            return Response(
                {"detail": "Vui lòng gửi kèm file CV (field: cv_file)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        allowed_ext = (".pdf", ".doc", ".docx")
        if not uploaded.name.lower().endswith(allowed_ext):
            return Response(
                {"detail": "Chỉ hỗ trợ định dạng PDF, DOC, DOCX."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if uploaded.size > 10 * 1024 * 1024:
            return Response(
                {"detail": "File CV không được vượt quá 10 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        result = scan_cv(uploaded)
        return Response(result, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Recommend jobs from CV — POST /api/v1/profiles/student/recommend-from-cv/
# ---------------------------------------------------------------------------

class RecommendedJobsFromCvView(APIView):
    """
    POST body: multipart/form-data with field `cv_file`.
    Scans CV, matches extracted skills against Job.skills and address against
    Job.location, returns top-N approved jobs sorted by match score.
    """
    permission_classes = [permissions.IsAuthenticated]
    MAX_RESULTS = 5

    def post(self, request):
        uploaded = request.FILES.get("cv_file")
        if not uploaded:
            return Response(
                {"detail": "Vui lòng gửi kèm file CV (field: cv_file)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not uploaded.name.lower().endswith((".pdf", ".doc", ".docx")):
            return Response(
                {"detail": "Chỉ hỗ trợ định dạng PDF, DOC, DOCX."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if uploaded.size > 10 * 1024 * 1024:
            return Response(
                {"detail": "File CV không được vượt quá 10 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        scan_result = scan_cv(uploaded)
        skills_found = scan_result.get("skills", [])
        address_found = scan_result.get("address")

        # --- Match skills against DB Skill records ---
        matched_skill_ids = []
        if skills_found:
            skills_lower = [s.lower() for s in skills_found]
            for db_skill in Skill.objects.all():
                if db_skill.name.lower() in skills_lower:
                    matched_skill_ids.append(db_skill.pk)

        # --- Match location ---
        matched_location_ids = []
        if address_found:
            addr_lower = address_found.lower()
            for loc in Location.objects.all():
                if loc.name.lower() in addr_lower or addr_lower in loc.name.lower():
                    matched_location_ids.append(loc.pk)

        # --- Fetch approved jobs and score them ---
        approved_jobs = (
            Job.objects.filter(status=Job.Status.APPROVED)
            .select_related("employer", "employer__industry", "location", "job_category")
            .prefetch_related("skills")
            .order_by("-is_featured", "-created_at")
        )

        scored = []
        for job in approved_jobs:
            job_skill_ids = set(job.skills.values_list("pk", flat=True))

            skill_score = 0.0
            if job_skill_ids and matched_skill_ids:
                skill_score = len(job_skill_ids & set(matched_skill_ids)) / len(job_skill_ids)
            elif matched_skill_ids and not job_skill_ids:
                skill_score = 0.1

            loc_score = 0.0
            if matched_location_ids and job.location_id in matched_location_ids:
                loc_score = 0.3

            score = skill_score * 0.7 + loc_score
            scored.append((score, job))

        scored.sort(key=lambda t: (-t[0], -t[1].is_featured, t[1].pk))
        top_jobs = [job for _, job in scored[:self.MAX_RESULTS]]
        top_scores = {job.pk: round(score, 2) for score, job in scored[:self.MAX_RESULTS]}

        serializer = JobListSerializer(top_jobs, many=True, context={"request": request})
        results_with_score = []
        for item in serializer.data:
            item = dict(item)
            item["match_score"] = top_scores.get(item["id"], 0.0)
            results_with_score.append(item)

        # Build URL params for /jobs?keyword=...&location=...
        url_parts = []
        if skills_found:
            url_parts.append(f"keyword={skills_found[0]}")
        if matched_location_ids:
            url_parts.append(f"location={matched_location_ids[0]}")
        jobs_url_params = "&".join(url_parts)

        return Response({
            "skills_found": skills_found,
            "address_found": address_found,
            "recommendations": results_with_score,
            "jobs_url_params": jobs_url_params,
        }, status=status.HTTP_200_OK)
