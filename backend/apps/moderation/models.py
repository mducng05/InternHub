from django.conf import settings
from django.db import models


class Report(models.Model):
    class TargetType(models.TextChoices):
        JOB = "job", "Tin tuyển dụng"
        USER = "user", "Người dùng"

    class Status(models.TextChoices):
        PENDING = "pending", "Chờ xử lý"
        RESOLVED = "resolved", "Đã xử lý"
        DISMISSED = "dismissed", "Bỏ qua"

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports_made",
    )
    target_type = models.CharField(max_length=20, choices=TargetType.choices)
    target_id = models.PositiveIntegerField()
    reason = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports_resolved",
    )
    resolved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_target_type_display()} #{self.target_id} - {self.reason}"
