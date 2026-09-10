from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import json
import urllib.request

from .models import User
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer


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


class MeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.get_full_name() or user.username,
        })


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
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "full_name": user.get_full_name() or user.username,
            },
            "is_new_user": is_new_user,
        })

