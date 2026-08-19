from django.conf import settings
from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Chờ xử lý"
        SHORTLISTED = "shortlisted", "Đã chọn vào danh sách rút gọn"
        INTERVIEW_INVITED = "interview_invited", "Mời phỏng vấn"
        ACCEPTED = "accepted", "Được nhận"
        REJECTED = "rejected", "Bị từ chối"
        CANCELLED = "cancelled", "Đã hủy"

    student_profile = models.ForeignKey(
        "profiles.StudentProfile", on_delete=models.CASCADE, related_name="applications"
    )
    job = models.ForeignKey("jobs.Job", on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True)
    cv_snapshot = models.FileField(upload_to="cv_snapshots/")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student_profile", "job"], name="unique_student_job_application")
        ]

    def __str__(self):
        return f"{self.student_profile} -> {self.job}"


class ApplicationStatusLog(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="status_logs")
    status = models.CharField(max_length=20, choices=Application.Status.choices)
    note = models.CharField(max_length=255, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="application_status_changes",
    )
