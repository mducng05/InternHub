from django.utils import timezone
from django.utils.text import slugify
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from apps.jobs.models import Job
from apps.jobs.serializers import JobListSerializer
from apps.catalog.models import Skill, Location, StudentSkill
from apps.applications.models import Application
from .cv_scanner import scan_cv, extract_skills
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
    If no cv_file is provided, uses the user's existing StudentProfile.cv_file.
    Returns: { skills, address, candidate, raw_text_preview }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        uploaded = request.FILES.get("cv_file")
        if not uploaded:
            profile = StudentProfile.objects.filter(user=request.user).first()
            if profile and profile.cv_file:
                try:
                    uploaded = profile.cv_file.open("rb")
                except Exception:
                    uploaded = None

        if not uploaded:
            return Response(
                {"detail": "Vui lòng gửi kèm file CV hoặc tải CV lên hồ sơ của bạn trước."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name = getattr(uploaded, "name", "").lower()
        allowed_ext = (".pdf", ".doc", ".docx")
        if not any(name.endswith(ext) for ext in allowed_ext):
            return Response(
                {"detail": "Chỉ hỗ trợ định dạng PDF, DOC, DOCX."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if hasattr(uploaded, "size") and uploaded.size > 10 * 1024 * 1024:
            return Response(
                {"detail": "File CV không được vượt quá 10 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        db_skills = list(Skill.objects.values_list("name", flat=True))
        result = scan_cv(uploaded, extra_skills=db_skills)
        return Response(result, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Recommend jobs from CV — POST /api/v1/profiles/student/recommend-from-cv/
# ---------------------------------------------------------------------------

class RecommendedJobsFromCvView(APIView):
    """
    POST body: multipart/form-data with field `cv_file` (optional if user has uploaded CV).
    Scans CV, extracts skills and address, matches against active jobs,
    and returns top approved jobs sorted by % match score.
    """
    permission_classes = [permissions.IsAuthenticated]
    MAX_RESULTS = 8

    def post(self, request):
        uploaded = request.FILES.get("cv_file")
        if not uploaded:
            profile = StudentProfile.objects.filter(user=request.user).first()
            if profile and profile.cv_file:
                try:
                    uploaded = profile.cv_file.open("rb")
                except Exception:
                    uploaded = None

        if not uploaded:
            return Response(
                {"detail": "Vui lòng chọn file CV để phân tích hoặc tải CV lên hồ sơ cá nhân."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name = getattr(uploaded, "name", "").lower()
        if not any(name.endswith(ext) for ext in (".pdf", ".doc", ".docx")):
            return Response(
                {"detail": "Chỉ hỗ trợ định dạng PDF, DOC, DOCX."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if hasattr(uploaded, "size") and uploaded.size > 10 * 1024 * 1024:
            return Response(
                {"detail": "File CV không được vượt quá 10 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        db_skills = list(Skill.objects.all())
        db_skill_names = [s.name for s in db_skills]
        scan_result = scan_cv(uploaded, extra_skills=db_skill_names)
        skills_found = scan_result.get("skills", [])
        address_found = scan_result.get("address")
        candidate_info = scan_result.get("candidate", {})

        # Match skills against DB Skill records
        matched_skill_ids = set()
        if skills_found:
            skills_lower = {s.lower() for s in skills_found}
            for db_skill in db_skills:
                if db_skill.name.lower() in skills_lower:
                    matched_skill_ids.add(db_skill.pk)

        # Match location against DB Location records
        matched_location_ids = set()
        if address_found:
            addr_lower = address_found.lower()
            for loc in Location.objects.all():
                loc_lower = loc.name.lower()
                if loc_lower in addr_lower or addr_lower in loc_lower:
                    matched_location_ids.add(loc.pk)

        # Fetch active, non-expired jobs
        approved_jobs = (
            Job.objects.filter(
                status=Job.Status.APPROVED,
                deadline__gte=timezone.localdate(),
            )
            .exclude(slug__startswith="demo-")
            .select_related("employer", "employer__industry", "location", "job_category")
            .prefetch_related("skills")
            .order_by("-is_featured", "-created_at")
        )

        # Exclude jobs candidate already applied to
        applied_job_ids = set()
        if request.user.is_authenticated and getattr(request.user, "role", None) == "student":
            student_profile = StudentProfile.objects.filter(user=request.user).first()
            if student_profile:
                applied_job_ids = set(
                    Application.objects.filter(student_profile=student_profile).values_list("job_id", flat=True)
                )

        scored = []
        for job in approved_jobs:
            if job.id in applied_job_ids:
                continue

            # Combine explicit skills and skills extracted from job title, requirements, description
            explicit_skills = {s.name for s in job.skills.all()}
            job_text = f"{job.title} {job.requirements or ''} {job.description or ''}"
            text_skills = set(extract_skills(job_text, extra_skills=db_skill_names))
            all_job_skills = sorted(list(explicit_skills | text_skills))

            skills_found_lower = {s.lower() for s in skills_found}
            matched_in_job = [s for s in all_job_skills if s.lower() in skills_found_lower]
            missing_in_job = [s for s in all_job_skills if s.lower() not in skills_found_lower]

            # Skill ratio calculation
            if all_job_skills:
                skill_ratio = len(matched_in_job) / len(all_job_skills)
            elif skills_found:
                skill_ratio = 0.25
            else:
                skill_ratio = 0.05

            # Location match calculation
            loc_matched = False
            if address_found and job.location:
                loc_lower = job.location.name.lower()
                addr_lower = address_found.lower()
                if loc_lower in addr_lower or addr_lower in loc_lower:
                    loc_matched = True

            # Weighted final score (0.0 to 1.0)
            if job.location_id:
                score = skill_ratio * 0.70 + (0.30 if loc_matched else 0.05)
            else:
                score = skill_ratio * 0.85 + 0.15

            # Build human-readable match reasons
            reasons = []
            if matched_in_job:
                reasons.append(f"Khớp {len(matched_in_job)}/{len(all_job_skills)} kỹ năng yêu cầu: {', '.join(matched_in_job[:4])}")
            if loc_matched and job.location:
                reasons.append(f"Khu vực phù hợp: {job.location.name}")

            # Keep items with reasonable relevance or general openings
            scored.append((score, job, matched_in_job, missing_in_job, reasons))

        # Sort primarily by score, then featured, then newest
        scored.sort(key=lambda t: (-t[0], -t[1].is_featured, -t[1].created_at.timestamp() if t[1].created_at else 0))
        top_candidates = scored[:self.MAX_RESULTS]

        serializer = JobListSerializer([item[1] for item in top_candidates], many=True, context={"request": request})
        results_with_score = []
        for index, item in enumerate(serializer.data):
            _, job_obj, matched_skills, missing_skills, reasons = top_candidates[index]
            score_val = round(top_candidates[index][0], 2)
            pct = min(max(round(score_val * 100), 10), 99)
            item_dict = dict(item)
            item_dict["match_score"] = score_val
            item_dict["match_percentage"] = pct
            item_dict["matched_skills"] = matched_skills
            item_dict["missing_skills"] = missing_skills
            item_dict["match_reasons"] = reasons
            results_with_score.append(item_dict)

        # Build URL query params for /jobs
        url_parts = []
        if skills_found:
            url_parts.append(f"keyword={skills_found[0]}")
        if matched_location_ids:
            url_parts.append(f"location={list(matched_location_ids)[0]}")
        jobs_url_params = "&".join(url_parts)

        return Response({
            "skills_found": skills_found,
            "address_found": address_found,
            "candidate": candidate_info,
            "recommendations": results_with_score,
            "jobs_url_params": jobs_url_params,
        }, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Sync Skills into StudentProfile — POST /api/v1/profiles/student/sync-skills/
# ---------------------------------------------------------------------------

class SyncStudentSkillsView(APIView):
    """
    POST /api/v1/profiles/student/sync-skills/
    Body: { "skills": ["Python", "Django", "React"] }
    Syncs/saves selected skills into the student's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if getattr(request.user, "role", None) != "student":
            return Response({"detail": "Chức năng chỉ dành cho tài khoản sinh viên."}, status=status.HTTP_403_FORBIDDEN)

        profile = StudentProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Chưa tìm thấy hồ sơ sinh viên."}, status=status.HTTP_404_NOT_FOUND)

        skill_names = request.data.get("skills", [])
        if not isinstance(skill_names, list):
            return Response({"detail": "Danh sách kỹ năng phải là mảng chuỗi."}, status=status.HTTP_400_BAD_REQUEST)

        added = []
        for raw_name in skill_names:
            name = str(raw_name).strip()
            if not name or len(name) > 100:
                continue

            skill_obj = Skill.objects.filter(name__iexact=name).first()
            if not skill_obj:
                slug = slugify(name) or f"skill-{name.lower()}"
                base_slug = slug
                counter = 1
                while Skill.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                skill_obj = Skill.objects.create(name=name, slug=slug)

            _, created = StudentSkill.objects.get_or_create(
                student_profile=profile,
                skill=skill_obj,
                defaults={"level": StudentSkill.Level.INTERMEDIATE},
            )
            if created:
                added.append(skill_obj.name)

        all_current_skills = list(
            profile.student_skills.select_related("skill").values_list("skill__name", flat=True)
        )
        return Response({
            "success": True,
            "added_count": len(added),
            "added_skills": added,
            "all_skills": all_current_skills,
            "message": f"Đã thêm thành công {len(added)} kỹ năng vào hồ sơ của bạn." if added else "Các kỹ năng đã có sẵn trong hồ sơ của bạn.",
        }, status=status.HTTP_200_OK)

