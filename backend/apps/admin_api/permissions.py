from rest_framework.permissions import BasePermission


class IsQLPMAdmin(BasePermission):
    message = "Chỉ quản trị viên mới có quyền truy cập API này."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.role == "admin" or user.is_staff or user.is_superuser))
