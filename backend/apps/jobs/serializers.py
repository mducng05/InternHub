# pyrefly: ignore [missing-import]
from uuid import uuid4

from django.utils.text import slugify
from rest_framework import serializers

from .models import Job


class JobListSerializer(serializers.ModelSerializer):
    employer = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    job_category = serializers.SerializerMethodField()
    internship_type_display = serializers.CharField(source="get_internship_type_display", read_only=True)
    is_demo = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            "id", "title", "description", "employer", "location", "job_category",
            "salary_min", "salary_max", "internship_type", "internship_type_display",
            "is_featured", "is_demo", "deadline", "created_at",
        )

    def get_is_demo(self, obj):
        return obj.slug.startswith("demo-")

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
    is_demo = serializers.SerializerMethodField()

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
            "views_count", "is_demo", "created_at", "updated_at",
        )

    def get_is_demo(self, obj):
        return obj.slug.startswith("demo-")

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


class EmployerJobSerializer(serializers.ModelSerializer):
    job_category_name = serializers.CharField(source="job_category.name", read_only=True, default="")
    location_name = serializers.CharField(source="location.name", read_only=True, default="")
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    application_count = serializers.IntegerField(read_only=True, default=0)
    pending_application_count = serializers.IntegerField(read_only=True, default=0)
    shortlisted_application_count = serializers.IntegerField(read_only=True, default=0)
    interview_application_count = serializers.IntegerField(read_only=True, default=0)
    accepted_application_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Job
        fields = (
            "id", "title", "description", "requirements", "job_category", "job_category_name",
            "location", "location_name", "internship_type", "duration_months",
            "salary_min", "salary_max", "is_salary_negotiable", "experience_level",
            "min_academic_year", "num_positions", "deadline", "status", "status_display",
            "views_count", "application_count", "pending_application_count",
            "shortlisted_application_count", "interview_application_count",
            "accepted_application_count", "created_at",
        )
        read_only_fields = ("id", "status", "status_display", "views_count", "created_at")

    def validate(self, attrs):
        salary_min = attrs.get("salary_min")
        salary_max = attrs.get("salary_max")
        if salary_min is not None and salary_max is not None and salary_min > salary_max:
            raise serializers.ValidationError({"salary_max": "Mức lương tối đa phải lớn hơn hoặc bằng mức tối thiểu."})
        return attrs

    def create(self, validated_data):
        title_slug = slugify(validated_data["title"]) or "viec-lam"
        validated_data["slug"] = f"{title_slug}-{uuid4().hex[:8]}"
        return super().create(validated_data)