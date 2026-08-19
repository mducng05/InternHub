from django.contrib import admin

from .models import Job, JobSkill, JobView, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "employer", "status", "is_featured", "deadline")
    list_filter = ("status", "is_featured", "internship_type")


admin.site.register(JobSkill)
admin.site.register(JobView)
admin.site.register(SavedJob)
