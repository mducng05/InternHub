from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

from .models import User


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
        email = validated_data["email"]
        user = User(
            username=email,
            first_name=full_name,
            **validated_data,
        )
        user.set_password(validated_data.pop("password"))
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Trả thêm thông tin user (role...) cùng với access/refresh token,
    để frontend biết điều hướng vào dashboard nào sau khi đăng nhập."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "role": self.user.role,
            "full_name": self.user.get_full_name() or self.user.username,
        }
        return data
