from rest_framework import serializers

from apps.accounts.models import User
from apps.applications.models import Application
from apps.jobs.models import Job
from apps.moderation.models import Report


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "phone", "role", "is_verified", "is_active", "is_staff", "date_joined")
        read_only_fields = ("id", "date_joined")


class AdminJobSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source="employer.company_name", read_only=True)

    class Meta:
        model = Job
        fields = ("id", "title", "slug", "employer", "employer_name", "job_category", "location", "status", "internship_type", "deadline", "is_featured", "views_count", "created_at")
        read_only_fields = ("id", "employer_name", "views_count", "created_at")


class AdminApplicationSerializer(serializers.ModelSerializer):
    student_email = serializers.EmailField(source="student_profile.user.email", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)

    class Meta:
        model = Application
        fields = ("id", "student_profile", "student_email", "job", "job_title", "status", "cover_letter", "applied_at", "updated_at")
        read_only_fields = ("id", "student_email", "job_title", "applied_at", "updated_at")


class AdminReportSerializer(serializers.ModelSerializer):
    reporter_email = serializers.EmailField(source="reporter.email", read_only=True)

    class Meta:
        model = Report
        fields = ("id", "reporter", "reporter_email", "target_type", "target_id", "reason", "description", "status", "resolved_by", "resolved_at", "created_at")
        read_only_fields = ("id", "reporter_email", "resolved_by", "resolved_at", "created_at")
