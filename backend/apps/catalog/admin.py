from django.contrib import admin

from .models import Industry, JobCategory, Location, Skill, StudentSkill

admin.site.register(Industry)
admin.site.register(Location)
admin.site.register(Skill)
admin.site.register(JobCategory)
admin.site.register(StudentSkill)
