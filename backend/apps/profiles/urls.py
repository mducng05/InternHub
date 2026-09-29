from django.urls import path
from .views import (
    EmployerProfileMeView,
    PublicCompanyDetailView,
    StudentProfileMeView,
    CvScanView,
    RecommendedJobsFromCvView,
)

app_name = "profiles"

urlpatterns = [
    path("student/me/", StudentProfileMeView.as_view(), name="student-profile-me"),
    path("student/scan-cv/", CvScanView.as_view(), name="student-scan-cv"),
    path("student/recommend-from-cv/", RecommendedJobsFromCvView.as_view(), name="student-recommend-from-cv"),
    path("employer/me/", EmployerProfileMeView.as_view(), name="employer-profile-me"),
    path("companies/<int:pk>/", PublicCompanyDetailView.as_view(), name="public-company-detail"),
]
