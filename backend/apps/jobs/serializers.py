from rest_framework import serializers

from .models import Job


class JobListSerializer(serializers.ModelSerializer):
    employer = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    job_category = serializers.SerializerMethodField()
    internship_type_display = serializers.CharField(source="get_internship_type_display", read_only=True)

    class Meta:
        model = Job
        fields = (
            "id", "title", "description", "employer", "location", "job_category",
            "salary_min", "salary_max", "internship_type", "internship_type_display",
            "is_featured", "deadline", "created_at",
        )

    def get_employer(self, obj):
        request = self.context.get("request")
        logo = obj.employer.logo.url if obj.employer.logo else None
        if logo and request:
            logo = request.build_absolute_uri(logo)
        return {"company_name": obj.employer.company_name, "logo": logo}

    def get_location(self, obj):
        if not obj.location:
            return None
        return {"id": obj.location_id, "name": obj.location.name}

    def get_job_category(self, obj):
        if not obj.job_category:
            return None
        return {"id": obj.job_category_id, "name": obj.job_category.name}