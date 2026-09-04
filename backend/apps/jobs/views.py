from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Job
from .serializers import JobListSerializer


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

		if keyword:
			queryset = queryset.filter(
				Q(title__icontains=keyword)
				| Q(description__icontains=keyword)
				| Q(requirements__icontains=keyword)
			)
		if params.get("category"):
			queryset = queryset.filter(job_category_id=params["category"])
		if params.get("industry"):
			queryset = queryset.filter(employer__industry_id=params["industry"])
		if params.get("location"):
			location = params["location"]
			queryset = queryset.filter(
				Q(location_id=location) | Q(location__name__iexact=location) | Q(location__slug__iexact=location)
			)
		if params.get("salary_min"):
			queryset = queryset.filter(salary_max__gte=params["salary_min"])
		if params.get("salary_max"):
			queryset = queryset.filter(salary_min__lte=params["salary_max"])

		return queryset
