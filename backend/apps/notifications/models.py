from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        APPLICATION_STATUS = "application_status", "Cập nhật trạng thái ứng tuyển"
        INTERVIEW_INVITE = "interview_invite", "Lời mời phỏng vấn"
        JOB_APPROVED = "job_approved", "Tin tuyển dụng được duyệt"
        SYSTEM = "system", "Thông báo hệ thống"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=30, choices=Type.choices)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.PositiveIntegerField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
