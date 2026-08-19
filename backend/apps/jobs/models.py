from django.conf import settings
from django.db import models


class Job(models.Model):
    class InternshipType(models.TextChoices):
        FULL_TIME = "full_time", "Full-time"
        PART_TIME = "part_time", "Part-time"
        REMOTE = "remote", "Remote"
        HYBRID = "hybrid", "Hybrid"

    class ExperienceLevel(models.TextChoices):
        NO_EXPERIENCE = "no_experience", "Không yêu cầu kinh nghiệm"
        UNDER_1_YEAR = "under_1_year", "Dưới 1 năm"
        ONE_YEAR = "1_year", "1 năm"
        TWO_YEARS_PLUS = "2_years_plus", "Trên 2 năm"

    class AcademicYear(models.TextChoices):
        YEAR_2 = "year_2", "Năm 2"
        YEAR_3 = "year_3", "Năm 3"
        YEAR_4 = "year_4", "Năm 4"
        GRADUATED = "graduated", "Đã tốt nghiệp"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Chờ duyệt"
        APPROVED = "approved", "Đã duyệt"
        REJECTED = "rejected", "Bị từ chối"
        CLOSED = "closed", "Đã đóng"
        EXPIRED = "expired", "Hết hạn"

    employer = models.ForeignKey(
        "profiles.EmployerProfile", on_delete=models.CASCADE, related_name="jobs"
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    requirements = models.TextField(blank=True)

    job_category = models.ForeignKey(
        "catalog.JobCategory", on_delete=models.SET_NULL, null=True, related_name="jobs"
    )
    location = models.ForeignKey(
        "catalog.Location", on_delete=models.SET_NULL, null=True, related_name="jobs"
    )
    skills = models.ManyToManyField("catalog.Skill", through="JobSkill", related_name="jobs")

    internship_type = models.CharField(
        max_length=20, choices=InternshipType.choices, default=InternshipType.FULL_TIME
    )
    duration_months = models.PositiveIntegerField(blank=True, null=True)

    salary_min = models.PositiveIntegerField(blank=True, null=True, help_text="VNĐ")
    salary_max = models.PositiveIntegerField(blank=True, null=True, help_text="VNĐ")
    is_salary_negotiable = models.BooleanField(default=False)

    experience_level = models.CharField(
        max_length=20, choices=ExperienceLevel.choices, default=ExperienceLevel.NO_EXPERIENCE
    )
    min_academic_year = models.CharField(max_length=20, choices=AcademicYear.choices, blank=True)

    num_positions = models.PositiveIntegerField(default=1)
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    is_featured = models.BooleanField(default=False)
    featured_until = models.DateTimeField(blank=True, null=True)

    views_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["status", "job_category", "location"]),
            models.Index(fields=["status", "is_featured"]),
            models.Index(fields=["deadline"]),
        ]
        verbose_name_plural = "jobs"

    def __str__(self):
        return self.title


class JobSkill(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="job_skills")
    skill = models.ForeignKey("catalog.Skill", on_delete=models.CASCADE, related_name="job_skills")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["job", "skill"], name="unique_job_skill")]

    def __str__(self):
        return f"{self.job} - {self.skill}"


class JobView(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="job_views")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="job_views",
    )
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["job", "viewed_at"])]


class SavedJob(models.Model):
    student_profile = models.ForeignKey(
        "profiles.StudentProfile", on_delete=models.CASCADE, related_name="saved_jobs"
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="saved_by")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student_profile", "job"], name="unique_saved_job")
        ]
