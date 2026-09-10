from django.urls import path
from .views import StudentProfileMeView

app_name = "profiles"

urlpatterns = [
    path("student/me/", StudentProfileMeView.as_view(), name="student-profile-me"),
]
