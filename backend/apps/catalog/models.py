from django.db import models


class Industry(models.Model):
    """Lĩnh vực hoạt động của doanh nghiệp (gắn với EmployerProfile)."""

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Location(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Skill(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class JobCategory(models.Model):
    """Danh mục vị trí công việc (Backend Developer, Marketing Intern...),
    khác với Industry (lĩnh vực hoạt động của công ty)."""

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)

    class Meta:
        verbose_name_plural = "job categories"

    def __str__(self):
        return self.name


class StudentSkill(models.Model):
    class Level(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    student_profile = models.ForeignKey(
        "profiles.StudentProfile", on_delete=models.CASCADE, related_name="student_skills"
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="student_skills")
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student_profile", "skill"], name="unique_student_skill")
        ]

    def __str__(self):
        return f"{self.student_profile} - {self.skill}"
