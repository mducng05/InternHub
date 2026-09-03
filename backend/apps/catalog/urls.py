from django.urls import path

from . import views

app_name = "catalog"

urlpatterns = [
    path("industries/", views.IndustryListView.as_view(), name="industry-list"),
    path("locations/", views.LocationListView.as_view(), name="location-list"),
    path("job-categories/", views.JobCategoryListView.as_view(), name="job-category-list"),
]
