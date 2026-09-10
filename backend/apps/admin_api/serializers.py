from rest_framework import serializers

from apps.accounts.models import User
from apps.applications.models import Application
from apps.jobs.models import Job, JobSkill
from apps.moderation.models import Report
from apps.catalog.models import Industry, JobCategory, Location, Skill, StudentSkill
from apps.profiles.models import EmployerProfile, StudentProfile


class AdminJobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = ("id", "name", "slug")
        read_only_fields = ("id",)


class AdminStudentSkillSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student_profile.full_name", read_only=True)
    student_email = serializers.EmailField(source="student_profile.user.email", read_only=True)
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = StudentSkill
        fields = ("id", "student_profile", "student_name", "student_email", "skill", "skill_name", "level")
        read_only_fields = ("id", "student_name", "student_email", "skill_name")


class AdminIndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ("id", "name", "slug")
        read_only_fields = ("id",)


class AdminLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("id", "name", "slug")
        read_only_fields = ("id",)


class AdminSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ("id", "name", "slug")
        read_only_fields = ("id",)


class AdminEmployerProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = EmployerProfile
        fields = ("id", "user", "user_email", "company_name", "logo", "description", "industry", "company_size", "website", "tax_code", "address", "is_verified", "created_at", "updated_at")
        read_only_fields = ("id", "user_email", "logo", "created_at", "updated_at")


class AdminStudentProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = StudentProfile
        fields = ("id", "user", "user_email", "full_name", "university", "major", "graduation_year", "bio", "address", "is_profile_complete", "created_at", "updated_at")
        read_only_fields = ("id", "user_email", "created_at", "updated_at")


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "phone", "role", "password", "is_verified", "is_active", "is_staff", "date_joined")
        read_only_fields = ("id", "date_joined")

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=["password"])
        return user


class AdminJobSkillSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = JobSkill
        fields = ("id", "job", "job_title", "skill", "skill_name")
        read_only_fields = ("id", "job_title", "skill_name")


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
