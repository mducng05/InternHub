from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminApplicationViewSet, AdminEmployerProfileViewSet, AdminIndustryViewSet, AdminJobCategoryViewSet, AdminStudentSkillViewSet, AdminLocationViewSet, AdminSkillViewSet, AdminJobSkillViewSet, AdminJobViewSet, AdminReportViewSet, AdminStudentProfileViewSet, AdminUserViewSet, admin_stats

router = DefaultRouter()
router.register("job-categories", AdminJobCategoryViewSet, basename="admin-job-category")
router.register("student-skills", AdminStudentSkillViewSet, basename="admin-student-skill")
router.register("industries", AdminIndustryViewSet, basename="admin-industry")
router.register("skills", AdminSkillViewSet, basename="admin-skill")
router.register("locations", AdminLocationViewSet, basename="admin-location")
router.register("employer-profiles", AdminEmployerProfileViewSet, basename="admin-employer-profile")
router.register("student-profiles", AdminStudentProfileViewSet, basename="admin-student-profile")
router.register("users", AdminUserViewSet, basename="admin-user")
router.register("job-skills", AdminJobSkillViewSet, basename="admin-job-skill")
router.register("jobs", AdminJobViewSet, basename="admin-job")
router.register("applications", AdminApplicationViewSet, basename="admin-application")
router.register("reports", AdminReportViewSet, basename="admin-report")

urlpatterns = [
    path("stats/", admin_stats, name="admin-stats"),
    path("", include(router.urls)),
]
