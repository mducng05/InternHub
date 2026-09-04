from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminApplicationViewSet, AdminJobViewSet, AdminReportViewSet, AdminUserViewSet, admin_stats

router = DefaultRouter()
router.register("users", AdminUserViewSet, basename="admin-user")
router.register("jobs", AdminJobViewSet, basename="admin-job")
router.register("applications", AdminApplicationViewSet, basename="admin-application")
router.register("reports", AdminReportViewSet, basename="admin-report")

urlpatterns = [
    path("stats/", admin_stats, name="admin-stats"),
    path("", include(router.urls)),
]
