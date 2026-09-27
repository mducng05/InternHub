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

    def validate_cv_file(self, uploaded_file):
        if not uploaded_file:
            return uploaded_file
        if not uploaded_file.name.lower().endswith((".pdf", ".doc", ".docx")):
            raise serializers.ValidationError("CV phải có định dạng PDF, DOC hoặc DOCX.")
        if uploaded_file.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("CV không được vượt quá 10MB.")
        return uploaded_file

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get("graduation_year") == "" or data.get("graduation_year") == 0:
                data["graduation_year"] = None
        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        previous_cv = instance.cv_file
        cv_was_updated = "cv_file" in validated_data
        full_name = validated_data.get("full_name")
        if full_name:
            instance.user.first_name = full_name.strip()
            instance.user.save(update_fields=["first_name"])
        updated_profile = super().update(instance, validated_data)
        if cv_was_updated and previous_cv and (
            not updated_profile.cv_file or previous_cv.name != updated_profile.cv_file.name
        ):
            previous_cv.delete(save=False)
        return updated_profile


class EmployerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.first_name", required=False, max_length=150)
    email = serializers.EmailField(source="user.email", required=False)
    phone = serializers.CharField(source="user.phone", required=False, allow_blank=True, max_length=20)
    industry_name = serializers.CharField(source="industry.name", read_only=True, default="")
    logo = serializers.ImageField(required=False, allow_null=True)
    remove_logo = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = EmployerProfile
        fields = (
            "id", "full_name", "email", "phone", "company_name", "industry", "industry_name",
            "company_size", "website", "tax_code", "address", "description", "logo", "remove_logo", "is_verified",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "industry_name", "is_verified", "created_at", "updated_at")

    def to_internal_value(self, data):
        if hasattr(data, "copy") and data.get("industry") == "":
            data = data.copy()
            data["industry"] = None
        return super().to_internal_value(data)

    def validate_email(self, value):
        user = self.instance.user
        if type(user).objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Email này đã được sử dụng.")
        return value

    def validate_logo(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Logo công ty không được vượt quá 5MB.")
        return image

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        remove_logo = validated_data.pop("remove_logo", False)
        if remove_logo and "logo" in validated_data and validated_data["logo"]:
            raise serializers.ValidationError({"logo": "Không thể tải logo mới và xóa logo cùng lúc."})
        previous_logo = instance.logo
        if remove_logo:
            validated_data["logo"] = None
        for field in ("first_name", "email", "phone"):
            if field in user_data:
                setattr(instance.user, field, user_data[field])
        if user_data:
            instance.user.save(update_fields=list(user_data.keys()))
        updated_profile = super().update(instance, validated_data)
        if previous_logo and (
            not updated_profile.logo or previous_logo.name != updated_profile.logo.name
        ):
            previous_logo.delete(save=False)
        return updated_profile


class PublicCompanySerializer(serializers.ModelSerializer):
    industry = serializers.SerializerMethodField()
    company_size_display = serializers.CharField(source="get_company_size_display", read_only=True)
    logo = serializers.SerializerMethodField()
    public_jobs_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = EmployerProfile
        fields = (
            "id", "company_name", "logo", "description", "industry", "company_size",
            "company_size_display", "website", "address", "is_verified", "public_jobs_count",
            "created_at",
        )

    def get_industry(self, obj):
        if not obj.industry:
            return None
        return {"id": obj.industry_id, "name": obj.industry.name}

    def get_logo(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        logo_url = obj.logo.url
        return request.build_absolute_uri(logo_url) if request else logo_url
