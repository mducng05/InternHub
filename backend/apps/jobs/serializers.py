# pyrefly: ignore [missing-import]
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


class JobDetailSerializer(serializers.ModelSerializer):
    employer = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    job_category = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    internship_type_display = serializers.CharField(source="get_internship_type_display", read_only=True)
    experience_level_display = serializers.CharField(source="get_experience_level_display", read_only=True)
    min_academic_year_display = serializers.CharField(source="get_min_academic_year_display", read_only=True)

    class Meta:
        model = Job
        fields = (
            "id", "title", "slug", "description", "requirements",
            "employer", "location", "job_category", "skills",
            "internship_type", "internship_type_display",
            "duration_months", "salary_min", "salary_max", "is_salary_negotiable",
            "experience_level", "experience_level_display",
            "min_academic_year", "min_academic_year_display",
            "num_positions", "deadline", "status", "is_featured",
            "views_count", "created_at", "updated_at",
        )

    def get_employer(self, obj):
        request = self.context.get("request")
        logo = obj.employer.logo.url if obj.employer.logo else None
        if logo and request:
            logo = request.build_absolute_uri(logo)
        return {
            "id": obj.employer.id,
            "company_name": obj.employer.company_name,
            "logo": logo,
            "description": obj.employer.description,
            "company_size": obj.employer.company_size,
            "company_size_display": obj.employer.get_company_size_display(),
            "website": obj.employer.website,
            "address": obj.employer.address,
            "industry": {
                "id": obj.employer.industry.id,
                "name": obj.employer.industry.name,
            } if obj.employer.industry else None,
        }

    def get_location(self, obj):
        if not obj.location:
            return None
        return {"id": obj.location_id, "name": obj.location.name}

    def get_job_category(self, obj):
        if not obj.job_category:
            return None
        return {"id": obj.job_category_id, "name": obj.job_category.name}

    def get_skills(self, obj):
        return [{"id": s.id, "name": s.name} for s in obj.skills.all()]