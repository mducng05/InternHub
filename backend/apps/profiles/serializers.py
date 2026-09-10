from rest_framework import serializers
from .models import StudentProfile, EmployerProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = StudentProfile
        fields = (
            "id",
            "email",
            "full_name",
            "university",
            "major",
            "graduation_year",
            "address",
            "bio",
            "cv_file",
            "avatar",
            "is_profile_complete",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "email", "created_at", "updated_at")

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get("graduation_year") == "" or data.get("graduation_year") == 0:
                data["graduation_year"] = None
        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        full_name = validated_data.get("full_name")
        if full_name:
            instance.user.first_name = full_name.strip()
            instance.user.save(update_fields=["first_name"])
        return super().update(instance, validated_data)
