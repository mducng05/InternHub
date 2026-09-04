from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.accounts.models import User
from apps.applications.models import Application
from apps.jobs.models import Job
from apps.moderation.models import Report
from .permissions import IsQLPMAdmin
from .serializers import AdminApplicationSerializer, AdminJobSerializer, AdminReportSerializer, AdminUserSerializer


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsQLPMAdmin]
    search_fields = ("email", "username", "first_name", "last_name")


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
