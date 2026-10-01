from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_profile"
    )
    full_name = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    university = models.CharField(max_length=255, blank=True)
    major = models.CharField(max_length=255, blank=True)
    graduation_year = models.PositiveIntegerField(blank=True, null=True)
    bio = models.TextField(blank=True)
    cv_file = models.FileField(upload_to="cvs/", blank=True, null=True)
    address = models.CharField(max_length=255, blank=True)
    is_profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.user.email


class EmployerProfile(models.Model):
    class CompanySize(models.TextChoices):
        SMALL = "1-50", "1-50 nhân viên"
        MEDIUM = "51-200", "51-200 nhân viên"
        LARGE = "201-1000", "201-1000 nhân viên"
        ENTERPRISE = "1000+", "Trên 1000 nhân viên"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="employer_profile"
    )
    company_name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="logos/", blank=True, null=True)
    description = models.TextField(blank=True)
    industry = models.ForeignKey(
        "catalog.Industry", on_delete=models.SET_NULL, null=True, related_name="employers"
    )
    company_size = models.CharField(max_length=20, choices=CompanySize.choices, blank=True)
    website = models.URLField(blank=True)
    tax_code = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False, db_default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name
