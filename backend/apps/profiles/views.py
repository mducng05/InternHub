from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count, Q
from apps.jobs.models import Job
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
