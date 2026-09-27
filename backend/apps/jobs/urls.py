# pyrefly: ignore [missing-import]
from django.urls import path
from . import views

app_name = "jobs"

urlpatterns = [
    path("salary-insights/", views.JobSalaryInsightsView.as_view(), name="job-salary-insights"),
    path("market-insights/", views.JobMarketInsightsView.as_view(), name="job-market-insights"),
    path("", views.JobListView.as_view(), name="job-list"),
    path("manage/", views.EmployerJobListCreateView.as_view(), name="employer-job-list-create"),
    path("manage/<int:pk>/", views.EmployerJobDetailView.as_view(), name="employer-job-detail"),
    path("manage/<int:pk>/close/", views.EmployerJobCloseView.as_view(), name="employer-job-close"),
    path("manage/<int:pk>/applications/", views.EmployerJobApplicationsView.as_view(), name="employer-job-applications"),
    path("manage/<int:pk>/applications/<int:application_id>/status/", views.EmployerJobApplicationsView.as_view(), name="employer-application-status"),
    path("saved/", views.SavedJobListView.as_view(), name="job-saved-list"),
    path("<int:pk>/", views.JobDetailView.as_view(), name="job-detail"),
    path("<int:pk>/save/", views.SaveJobView.as_view(), name="job-save"),
    # path("recommendations/", views.RecommendedJobsView.as_view(), name="job-recommendations"),
]
