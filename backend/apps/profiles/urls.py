from django.urls import path
from .views import EmployerProfileMeView, PublicCompanyDetailView, StudentProfileMeView

app_name = "profiles"

urlpatterns = [
    path("student/me/", StudentProfileMeView.as_view(), name="student-profile-me"),
    path("employer/me/", EmployerProfileMeView.as_view(), name="employer-profile-me"),
    path("companies/<int:pk>/", PublicCompanyDetailView.as_view(), name="public-company-detail"),
]
