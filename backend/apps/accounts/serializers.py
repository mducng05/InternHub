from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


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
