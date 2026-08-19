from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("email", "username", "role", "is_verified", "is_active", "date_joined")
    fieldsets = UserAdmin.fieldsets + (
        ("Role info", {"fields": ("role", "phone", "is_verified")}),
    )
