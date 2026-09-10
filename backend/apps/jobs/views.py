from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Job, SavedJob
from .serializers import JobListSerializer, JobDetailSerializer
from apps.profiles.models import StudentProfile


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
