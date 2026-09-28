from datetime import timedelta

from django.db.models import Count, F, Max, Min, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.applications.models import Application, ApplicationStatusLog
from apps.notifications.models import Notification
from .models import Job, SavedJob
from .serializers import EmployerJobSerializer, JobListSerializer, JobDetailSerializer
from apps.profiles.models import EmployerProfile, StudentProfile


class IsEmployer(permissions.BasePermission):
	def has_permission(self, request, view):
		return bool(request.user and request.user.is_authenticated and request.user.role == "employer")


def get_employer_profile(user):
	company_name = user.get_full_name() or user.email.split("@")[0]
	profile, _ = EmployerProfile.objects.get_or_create(
		user=user,
		defaults={"company_name": company_name or f"Doanh nghiệp {user.pk}"},
	)
	return profile


class EmployerJobListCreateView(generics.ListCreateAPIView):
	permission_classes = [permissions.IsAuthenticated, IsEmployer]
	serializer_class = EmployerJobSerializer

	def get_profile(self):
		return get_employer_profile(self.request.user)

	def get_queryset(self):
		return (
			Job.objects.filter(employer=self.get_profile())
			.select_related("job_category", "location")
			.annotate(
				application_count=Count("applications"),
				pending_application_count=Count(
					"applications",
					filter=Q(applications__status=Application.Status.PENDING),
				),
				shortlisted_application_count=Count(
					"applications",
					filter=Q(applications__status=Application.Status.SHORTLISTED),
				),
				interview_application_count=Count(
					"applications",
					filter=Q(applications__status=Application.Status.INTERVIEW_INVITED),
				),
				accepted_application_count=Count(
					"applications",
					filter=Q(applications__status=Application.Status.ACCEPTED),
				),
			)
			.order_by("-created_at")
		)

	def list(self, request, *args, **kwargs):
		jobs = self.get_queryset()
		profile = self.get_profile()
		return Response({
			"profile": {
				"company_name": profile.company_name,
				"is_verified": profile.is_verified,
			},
			"count": jobs.count(),
			"results": self.get_serializer(jobs, many=True).data,
		})

	def perform_create(self, serializer):
		serializer.save(employer=self.get_profile(), status=Job.Status.PENDING)


class EmployerJobDetailView(generics.RetrieveUpdateAPIView):
	permission_classes = [permissions.IsAuthenticated, IsEmployer]
	serializer_class = EmployerJobSerializer
	lookup_url_kwarg = "pk"

	def get_queryset(self):
		return (
			Job.objects.filter(employer=get_employer_profile(self.request.user))
			.annotate(
				application_count=Count("applications"),
				pending_application_count=Count(
					"applications",
					filter=Q(applications__status=Application.Status.PENDING),
				),
				shortlisted_application_count=Count(
					"applications",
					filter=Q(applications__status=Application.Status.SHORTLISTED),
				),
				interview_application_count=Count(
					"applications",
					filter=Q(applications__status=Application.Status.INTERVIEW_INVITED),
				),
				accepted_application_count=Count(
					"applications",
					filter=Q(applications__status=Application.Status.ACCEPTED),
				),
			)
		)

	def perform_update(self, serializer):
		previous_status = serializer.instance.status
		if previous_status in (Job.Status.APPROVED, Job.Status.REJECTED):
			serializer.save(status=Job.Status.PENDING)
			return
		serializer.save()


class EmployerJobCloseView(generics.GenericAPIView):
	permission_classes = [permissions.IsAuthenticated, IsEmployer]

	def get_queryset(self):
		return Job.objects.filter(employer=get_employer_profile(self.request.user))

	def post(self, request, pk):
		job = get_object_or_404(self.get_queryset(), pk=pk)
		if job.status == Job.Status.CLOSED:
			return Response({"detail": "Tin tuyển dụng đã được đóng."}, status=400)
		job.status = Job.Status.CLOSED
		job.save(update_fields=["status", "updated_at"])
		return Response({"status": job.status, "status_display": job.get_status_display()})


class EmployerJobApplicationsView(generics.GenericAPIView):
	permission_classes = [permissions.IsAuthenticated, IsEmployer]

	def get_queryset(self):
		return Job.objects.filter(employer=get_employer_profile(self.request.user))

	def get(self, request, pk):
		job = get_object_or_404(self.get_queryset(), pk=pk)
		applications = (
			Application.objects.filter(job=job)
			.select_related("student_profile", "student_profile__user")
			.order_by("-applied_at")
		)
		results = []
		for application in applications:
			student = application.student_profile
			cv_url = request.build_absolute_uri(application.cv_snapshot.url) if application.cv_snapshot else None
			results.append({
				"id": application.pk,
				"full_name": student.full_name,
				"email": student.user.email,
				"phone": student.user.phone,
				"university": student.university,
				"major": student.major,
				"graduation_year": student.graduation_year,
				"cv_url": cv_url,
				"cover_letter": application.cover_letter,
				"status": application.status,
				"status_display": application.get_status_display(),
				"applied_at": application.applied_at,
			})
		return Response({
			"job": {"id": job.pk, "title": job.title},
			"count": len(results),
			"results": results,
		})

	def patch(self, request, pk, application_id):
		job = get_object_or_404(self.get_queryset(), pk=pk)
		application = get_object_or_404(Application, pk=application_id, job=job)
		new_status = request.data.get("status")
		allowed_statuses = {
			Application.Status.PENDING,
			Application.Status.SHORTLISTED,
			Application.Status.INTERVIEW_INVITED,
			Application.Status.ACCEPTED,
			Application.Status.REJECTED,
		}
		if new_status not in allowed_statuses:
			return Response({"status": "Trạng thái hồ sơ không hợp lệ."}, status=400)
		if application.status == Application.Status.CANCELLED:
			return Response({"status": "Không thể cập nhật hồ sơ đã được ứng viên hủy."}, status=400)

		previous_status = application.status
		application.status = new_status
		application.save(update_fields=["status", "updated_at"])
		if previous_status != new_status:
			ApplicationStatusLog.objects.create(
				application=application,
				status=new_status,
				note=request.data.get("note", "")[:255],
				changed_by=request.user,
			)
			is_interview = new_status == Application.Status.INTERVIEW_INVITED
			Notification.objects.create(
				user=application.student_profile.user,
				type=Notification.Type.INTERVIEW_INVITE if is_interview else Notification.Type.APPLICATION_STATUS,
				title="Bạn được mời phỏng vấn" if is_interview else "Đơn ứng tuyển có cập nhật mới",
				content=f"Đơn ứng tuyển vị trí {application.job.title} đã chuyển sang trạng thái: {application.get_status_display()}.",
				related_object_type="application",
				related_object_id=application.pk,
			)
		return Response({
			"id": application.pk,
			"status": application.status,
			"status_display": application.get_status_display(),
		})


class JobListView(generics.ListAPIView):
	serializer_class = JobListSerializer
	permission_classes = [AllowAny]

	def get_queryset(self):
		queryset = (
			Job.objects.filter(status=Job.Status.APPROVED)
			.select_related("employer", "employer__industry", "location", "job_category")
			.order_by("-is_featured", "-created_at")
		)
		params = self.request.query_params
		keyword = params.get("keyword", "").strip()
		employer_id = params.get("employer")
		if employer_id:
			try:
				queryset = queryset.filter(employer_id=int(employer_id))
			except (TypeError, ValueError):
				return queryset.none()

		# 1. Từ khóa (tiêu đề, mô tả, yêu cầu, tên công ty)
		if keyword:
			queryset = queryset.filter(
				Q(title__icontains=keyword)
				| Q(description__icontains=keyword)
				| Q(requirements__icontains=keyword)
				| Q(employer__company_name__icontains=keyword)
			)

		# 2. Vị trí công việc / Danh mục (ID, Slug, hoặc Tên)
		category = params.get("category") or params.get("cat") or params.get("position")
		if category and category != "all":
			if str(category).isdigit():
				queryset = queryset.filter(job_category_id=int(category))
			else:
				queryset = queryset.filter(
					Q(job_category__slug__iexact=category)
					| Q(job_category__name__icontains=category)
					| Q(title__icontains=category)
				)

		# 3. Lĩnh vực (Industry)
		if params.get("industry") and params.get("industry") != "all":
			ind = params["industry"]
			if str(ind).isdigit():
				queryset = queryset.filter(employer__industry_id=int(ind))
			else:
				queryset = queryset.filter(
					Q(employer__industry__slug__iexact=ind)
					| Q(employer__industry__name__icontains=ind)
				)

		# 4. Địa điểm làm việc (Hỗ trợ danh sách nhiều địa điểm)
		locations = params.getlist("location")
		if not locations and params.get("location"):
			locations = [params.get("location")]
		locations = [loc.strip() for loc in locations if loc and loc.strip() and loc.strip() != "all"]
		if locations:
			loc_q = Q()
			for loc in locations:
				if loc.isdigit():
					loc_q |= Q(location_id=int(loc))
				else:
					loc_q |= Q(location__name__icontains=loc) | Q(location__slug__icontains=loc)
			queryset = queryset.filter(loc_q)

		# 5. Mức lương (Hỗ trợ preset nhanh và min/max số cụ thể)
		salary_range = params.get("salary_range") or params.get("salary")
		if salary_range == "under_3m":
			queryset = queryset.filter(
				Q(salary_max__lte=3000000) | (Q(salary_min__lte=3000000) & Q(salary_max__isnull=True))
			)
		elif salary_range == "3m_5m":
			queryset = queryset.filter(
				Q(salary_max__gte=3000000, salary_min__lte=5000000)
				| Q(salary_min__range=(3000000, 5000000))
			)
		elif salary_range == "5m_10m":
			queryset = queryset.filter(
				Q(salary_max__gte=5000000, salary_min__lte=10000000)
				| Q(salary_min__range=(5000000, 10000000))
			)
		elif salary_range == "over_10m":
			queryset = queryset.filter(
				Q(salary_min__gte=10000000) | Q(salary_max__gte=10000000)
			)
		elif salary_range == "negotiable":
			queryset = queryset.filter(
				Q(is_salary_negotiable=True)
				| (Q(salary_min__isnull=True) & Q(salary_max__isnull=True))
				| (Q(salary_min=0) & Q(salary_max=0))
			)

		if params.get("salary_min"):
			try:
				queryset = queryset.filter(salary_max__gte=int(params["salary_min"]))
			except (ValueError, TypeError):
				pass

		if params.get("salary_max"):
			try:
				queryset = queryset.filter(salary_min__lte=int(params["salary_max"]))
			except (ValueError, TypeError):
				pass

		# 6. Hình thức làm việc (Full-time, Part-time, Remote, Hybrid)
		if params.get("internship_type") and params.get("internship_type") != "all":
			queryset = queryset.filter(internship_type=params["internship_type"])

		# 7. Sắp xếp (Sort)
		sort = params.get("sort") or params.get("ordering")
		if sort == "salary_desc":
			queryset = queryset.order_by("-salary_max", "-salary_min", "-created_at")
		elif sort == "salary_asc":
			queryset = queryset.order_by("salary_min", "salary_max", "-created_at")
		elif sort == "views":
			queryset = queryset.order_by("-views_count", "-created_at")
		elif sort == "deadline":
			queryset = queryset.order_by("deadline", "-created_at")

		return queryset


class JobSalaryInsightsView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		queryset = Job.objects.filter(status=Job.Status.APPROVED, is_salary_negotiable=False).exclude(slug__startswith="demo-").exclude(
			Q(salary_min__isnull=True, salary_max__isnull=True)
		)
		params = request.query_params
		for key, field in (("category", "job_category_id"), ("location", "location_id")):
			value = params.get(key)
			if value:
				try:
					queryset = queryset.filter(**{field: int(value)})
				except (TypeError, ValueError):
					return Response({"count": 0, "salary_min": None, "salary_median": None, "salary_max": None})
		if params.get("internship_type"):
			queryset = queryset.filter(internship_type=params["internship_type"])

		rows = list(queryset.values("salary_min", "salary_max", "job_category__name", "location__name"))
		if not rows:
			return Response({"count": 0, "salary_min": None, "salary_median": None, "salary_max": None})

		midpoints = []
		lower_bounds = []
		upper_bounds = []
		for row in rows:
			lower = row["salary_min"] if row["salary_min"] is not None else row["salary_max"]
			upper = row["salary_max"] if row["salary_max"] is not None else row["salary_min"]
			lower_bounds.append(lower)
			upper_bounds.append(upper)
			midpoints.append((lower + upper) / 2)

		midpoints.sort()
		middle = len(midpoints) // 2
		median = midpoints[middle] if len(midpoints) % 2 else (midpoints[middle - 1] + midpoints[middle]) / 2
		return Response({
			"count": len(rows),
			"salary_min": min(lower_bounds),
			"salary_median": round(median),
			"salary_max": max(upper_bounds),
			"source": "approved_job_listings",
		})


class JobMarketInsightsView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		jobs = Job.objects.filter(status=Job.Status.APPROVED).exclude(slug__startswith="demo-")
		thirty_days_ago = timezone.now() - timedelta(days=30)
		recent_jobs = jobs.filter(created_at__gte=thirty_days_ago)

		def top_values(field, limit=5):
			return list(
				jobs.exclude(**{f"{field}__isnull": True})
				.values(name=F(f"{field}__name"))
				.annotate(jobs_count=Count("id"), openings=Sum("num_positions"))
				.order_by("-jobs_count", "name")[:limit]
			)

		type_breakdown = list(
			jobs.values("internship_type")
			.annotate(jobs_count=Count("id"), openings=Sum("num_positions"))
			.order_by("-jobs_count")
		)
		for item in type_breakdown:
			item["label"] = Job.InternshipType(item["internship_type"]).label

		return Response({
			"total_jobs": jobs.count(),
			"total_openings": jobs.aggregate(total=Sum("num_positions"))["total"] or 0,
			"recent_jobs_30_days": recent_jobs.count(),
			"top_categories": top_values("job_category"),
			"top_locations": top_values("location"),
			"work_types": type_breakdown,
			"salary": {
				"count": jobs.filter(is_salary_negotiable=False).exclude(
					Q(salary_min__isnull=True, salary_max__isnull=True)
				).count(),
				"salary_min": jobs.filter(is_salary_negotiable=False).aggregate(value=Min("salary_min"))["value"],
				"salary_max": jobs.filter(is_salary_negotiable=False).aggregate(value=Max("salary_max"))["value"],
			},
			"updated_at": timezone.now(),
		})


class JobDetailView(generics.RetrieveAPIView):
	serializer_class = JobDetailSerializer
	permission_classes = [AllowAny]
	queryset = (
		Job.objects.select_related("employer", "employer__industry", "location", "job_category")
		.prefetch_related("skills")
	)

	def retrieve(self, request, *args, **kwargs):
		instance = self.get_object()
		Job.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
		serializer = self.get_serializer(instance)
		data = serializer.data
		is_saved = False
		if request.user.is_authenticated:
			is_saved = SavedJob.objects.filter(
				student_profile__user=request.user, job=instance
			).exists()
		data["is_saved"] = is_saved
		return Response(data)


class SavedJobListView(generics.ListAPIView):
	permission_classes = [IsAuthenticated]
	serializer_class = JobListSerializer

	def get_queryset(self):
		user = self.request.user
		return (
			Job.objects.filter(saved_by__student_profile__user=user)
			.select_related("employer", "employer__industry", "location", "job_category")
			.order_by("-saved_by__saved_at")
		)

	def list(self, request, *args, **kwargs):
		queryset = self.get_queryset()
		serializer = self.get_serializer(queryset, many=True)
		job_ids = list(queryset.values_list("id", flat=True))
		return Response({
			"results": serializer.data,
			"saved_job_ids": job_ids,
			"count": len(job_ids),
		})


class SaveJobView(generics.GenericAPIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, pk):
		job = get_object_or_404(Job, pk=pk)
		default_name = (
			request.user.get_full_name()
			or request.user.username
			or (request.user.email.split("@")[0] if request.user.email else "Sinh viên")
		)
		profile, _ = StudentProfile.objects.get_or_create(
			user=request.user,
			defaults={"full_name": default_name},
		)
		saved_obj, created = SavedJob.objects.get_or_create(
			student_profile=profile,
			job=job,
		)
		if not created:
			saved_obj.delete()
			return Response({"saved": False, "message": "Đã bỏ lưu tin tuyển dụng"})
		return Response({"saved": True, "message": "Đã lưu tin tuyển dụng"})
