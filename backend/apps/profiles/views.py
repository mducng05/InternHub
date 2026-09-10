from rest_framework import generics, permissions
from .models import StudentProfile
from .serializers import StudentProfileSerializer


class StudentProfileMeView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        default_name = user.get_full_name() or user.username or (user.email.split("@")[0] if user.email else "Sinh viên")
        profile, _ = StudentProfile.objects.get_or_create(
            user=user,
            defaults={"full_name": default_name},
        )
        return profile
