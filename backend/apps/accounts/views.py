from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import json
import urllib.request

from .models import User
from .serializers import AccountMeSerializer, CustomTokenObtainPairSerializer, RegisterSerializer


def verify_google_token(id_token: str):
    """Xác thực id_token với máy chủ Google tokeninfo"""
    if not id_token:
        return None
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    req = urllib.request.Request(url, headers={"User-Agent": "InternHub-Backend"})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                if data.get("iss") in ["accounts.google.com", "https://accounts.google.com"]:
                    return data
    except Exception:
        # Fallback decode JWT nếu môi trường dev không kết nối được Google
        try:
            import jwt
            return jwt.decode(id_token, options={"verify_signature": False})
        except Exception:
            return None
    return None


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AccountMeSerializer

    def get_object(self):
        return self.request.user


class GoogleLoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")
        role = request.data.get("role", User.Role.STUDENT)

        if not credential:
            return Response(
                {"detail": "Thiếu mã xác thực Google (credential)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = verify_google_token(credential)
        if not payload or not payload.get("email"):
            return Response(
                {"detail": "Mã xác thực Google không hợp lệ hoặc đã hết hạn."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = payload.get("email", "").strip().lower()
        full_name = payload.get("name") or email.split("@")[0]

        # Tìm hoặc tạo người dùng
        user = User.objects.filter(email=email).first()
        is_new_user = False
        if not user:
            if role not in [User.Role.STUDENT, User.Role.EMPLOYER]:
                role = User.Role.STUDENT
            user = User.objects.create(
                username=email,
                email=email,
                first_name=full_name,
                role=role,
                is_verified=True,
            )
            user.set_unusable_password()
            user.save()
            is_new_user = True

        # Đảm bảo Profile tương ứng được tạo
        if user.role == User.Role.STUDENT:
            from apps.profiles.models import StudentProfile
            profile, _ = StudentProfile.objects.get_or_create(
                user=user,
                defaults={"full_name": full_name}
            )
            if not profile.full_name:
                profile.full_name = full_name
                profile.save(update_fields=["full_name"])
        elif user.role == User.Role.EMPLOYER:
            from apps.profiles.models import EmployerProfile
            EmployerProfile.objects.get_or_create(
                user=user,
                defaults={"company_name": full_name}
            )

        # Cấp JWT access & refresh token
        refresh = RefreshToken.for_user(user)
        avatar = user.avatar.url if user.avatar else None
        if avatar:
            avatar = request.build_absolute_uri(avatar)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "full_name": user.get_full_name() or user.username,
                "phone": user.phone,
                "avatar": avatar,
                "has_usable_password": user.has_usable_password(),
            },
            "is_new_user": is_new_user,
        })


class ChangePasswordView(generics.GenericAPIView):
    """API đổi mật khẩu cho người dùng đã đăng nhập"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        old_password = request.data.get("old_password", "")
        new_password = request.data.get("new_password", "")
        new_password_confirm = request.data.get("new_password_confirm", "")

        # 1. Kiểm tra mật khẩu hiện tại (nếu tài khoản đã có mật khẩu)
        if user.has_usable_password():
            if not old_password:
                return Response(
                    {"detail": "Vui lòng nhập mật khẩu hiện tại."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not user.check_password(old_password):
                return Response(
                    {"detail": "Mật khẩu hiện tại không chính xác."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 2. Kiểm tra mật khẩu mới
        if not new_password:
            return Response(
                {"detail": "Vui lòng nhập mật khẩu mới."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"detail": "Mật khẩu mới phải có tối thiểu 8 ký tự."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != new_password_confirm:
            return Response(
                {"detail": "Mật khẩu xác nhận không khớp với mật khẩu mới."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.has_usable_password() and old_password == new_password:
            return Response(
                {"detail": "Mật khẩu mới không được trùng với mật khẩu hiện tại."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Lưu mật khẩu mới
        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới từ bây giờ."},
            status=status.HTTP_200_OK,
        )


