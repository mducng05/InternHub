from django.contrib import admin

from .models import EmployerProfile, StudentProfile

admin.site.register(StudentProfile)
admin.site.register(EmployerProfile)
