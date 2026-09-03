from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Industry, JobCategory, Location
from .serializers import IndustrySerializer, JobCategorySerializer, LocationSerializer


class IndustryListView(generics.ListAPIView):
    queryset = Industry.objects.order_by("name")
    serializer_class = IndustrySerializer
    permission_classes = [AllowAny]


class JobCategoryListView(generics.ListAPIView):
    queryset = JobCategory.objects.order_by("name")
    serializer_class = JobCategorySerializer
    permission_classes = [AllowAny]


class LocationListView(generics.ListAPIView):
    queryset = Location.objects.order_by("name")
    serializer_class = LocationSerializer
    permission_classes = [AllowAny]
