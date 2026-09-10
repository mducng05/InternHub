# pyrefly: ignore [missing-import]
from django.urls import path
from . import views

app_name = "jobs"

urlpatterns = [
    path("", views.JobListView.as_view(), name="job-list"),
    path("saved/", views.SavedJobListView.as_view(), name="job-saved-list"),
    path("<int:pk>/", views.JobDetailView.as_view(), name="job-detail"),
    path("<int:pk>/save/", views.SaveJobView.as_view(), name="job-save"),
    # path("recommendations/", views.RecommendedJobsView.as_view(), name="job-recommendations"),
]
