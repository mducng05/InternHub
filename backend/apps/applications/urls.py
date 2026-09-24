from django.urls import path
from . import views

app_name = "applications"

urlpatterns = [
    path("", views.ApplyJobView.as_view(), name="application-create"),
    path("my/", views.MyApplicationsView.as_view(), name="my-applications"),
    path("check/<int:pk>/", views.CheckAppliedView.as_view(), name="application-check"),
]
