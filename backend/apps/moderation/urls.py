from django.urls import path
from .views import ReportCreateView

app_name = "moderation"

urlpatterns = [
    path("reports/", ReportCreateView.as_view(), name="report-create"),
    # path("jobs/pending/", views.PendingJobsView.as_view(), name="pending-jobs"),
    # path("jobs/<int:pk>/approve/", views.ApproveJobView.as_view(), name="approve-job"),
    # path("reports/", views.ReportListView.as_view(), name="report-list"),
]
