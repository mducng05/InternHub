from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.accounts.models import User
from apps.catalog.models import Industry, JobCategory, Location, Skill, StudentSkill
from apps.applications.models import Application
from apps.jobs.models import Job, JobSkill
from apps.moderation.models import Report
from apps.profiles.models import EmployerProfile, StudentProfile
from .permissions import IsQLPMAdmin
from .serializers import AdminApplicationSerializer, AdminEmployerProfileSerializer, AdminIndustrySerializer, AdminJobCategorySerializer, AdminStudentSkillSerializer, AdminLocationSerializer, AdminSkillSerializer, AdminJobSkillSerializer, AdminJobSerializer, AdminReportSerializer, AdminStudentProfileSerializer, AdminUserSerializer


class AdminJobCategoryViewSet(viewsets.ModelViewSet):
    queryset = JobCategory.objects.all().order_by("name")
    serializer_class = AdminJobCategorySerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("name", "slug")


class AdminStudentSkillViewSet(viewsets.ModelViewSet):
    queryset = StudentSkill.objects.select_related("student_profile__user", "skill").all().order_by("student_profile__full_name", "skill__name")
    serializer_class = AdminStudentSkillSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("student_profile__full_name", "student_profile__user__email", "skill__name")
    filterset_fields = ("student_profile", "skill", "level")


class AdminIndustryViewSet(viewsets.ModelViewSet):
    queryset = Industry.objects.all().order_by("name")
    serializer_class = AdminIndustrySerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("name", "slug")


class AdminLocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by("name")
    serializer_class = AdminLocationSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("name", "slug")


class AdminSkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all().order_by("name")
    serializer_class = AdminSkillSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("name", "slug")


class AdminEmployerProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployerProfile.objects.select_related("user", "industry").all().order_by("-created_at")
    serializer_class = AdminEmployerProfileSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("company_name", "tax_code", "user__email")
    filterset_fields = ("company_size", "is_verified", "industry")


class AdminStudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.select_related("user").all().order_by("-created_at")
    serializer_class = AdminStudentProfileSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("full_name", "university", "major", "user__email")


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("email", "username", "first_name", "last_name")


class AdminJobSkillViewSet(viewsets.ModelViewSet):
    queryset = JobSkill.objects.select_related("job", "skill").all().order_by("job__title", "skill__name")
    serializer_class = AdminJobSkillSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("job__title", "skill__name")
    filterset_fields = ("job", "skill")


class AdminJobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.select_related("employer").all().order_by("-created_at")
    serializer_class = AdminJobSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("title", "slug")
    filterset_fields = ("status", "is_featured")


class AdminApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.select_related("student_profile__user", "job").all().order_by("-applied_at")
    serializer_class = AdminApplicationSerializer
    permission_classes = [IsQLPMAdmin]
    filterset_fields = ("status",)


class AdminReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.select_related("reporter").all().order_by("-created_at")
    serializer_class = AdminReportSerializer
    permission_classes = [IsQLPMAdmin]
    filterset_fields = ("status", "target_type")


@api_view(["GET"])
@permission_classes([IsQLPMAdmin])
def admin_stats(request):
    return Response({
        "users": User.objects.count(),
        "jobs": Job.objects.count(),
        "pending_jobs": Job.objects.filter(status=Job.Status.PENDING).count(),
        "applications": Application.objects.count(),
        "pending_reports": Report.objects.filter(status=Report.Status.PENDING).count(),
        "users_by_role": list(User.objects.values("role").annotate(total=Count("id")).order_by("role")),
    })
