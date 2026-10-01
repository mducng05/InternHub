from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

from .models import User
from apps.profiles.models import EmployerProfile


class AccountMeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="first_name", required=False, max_length=150)
    has_usable_password = serializers.SerializerMethodField()
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ("id", "full_name", "email", "phone", "role", "avatar", "has_usable_password")
        read_only_fields = ("id", "role", "has_usable_password")

    def get_has_usable_password(self, obj):
        return obj.has_usable_password()

    def validate_avatar(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Ảnh đại diện không được vượt quá 5MB.")
        return image

    def update(self, instance, validated_data):
        previous_avatar = instance.avatar
        avatar_was_updated = "avatar" in validated_data
        updated_user = super().update(instance, validated_data)
        if avatar_was_updated and previous_avatar and (
            not updated_user.avatar or previous_avatar.name != updated_user.avatar.name
        ):
            previous_avatar.delete(save=False)
        return updated_user


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("full_name", "email", "phone", "role", "password", "password_confirm")

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Mật khẩu xác nhận không khớp."})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop("full_name").strip()
        password = validated_data.pop("password")
        email = validated_data["email"]
        user = User(
            username=email,
            first_name=full_name,
            **validated_data,
        )
        user.set_password(password)
        user.save()
        if user.role == User.Role.EMPLOYER:
            EmployerProfile.objects.create(user=user, company_name=full_name)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Trả thêm thông tin user (role...) cùng với access/refresh token,
    để frontend biết điều hướng vào dashboard nào sau khi đăng nhập."""

    def validate(self, attrs):
        data = super().validate(attrs)
        request = self.context.get("request")
        avatar = self.user.avatar.url if self.user.avatar else None
        if avatar and request:
            avatar = request.build_absolute_uri(avatar)
        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "role": self.user.role,
            "full_name": self.user.get_full_name() or self.user.username,
            "phone": self.user.phone,
            "avatar": avatar,
            "has_usable_password": self.user.has_usable_password(),
        }
        return data
