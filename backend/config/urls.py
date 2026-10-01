"""
URL configuration for config project.
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import CustomTokenObtainPairView, RegisterView
from apps.common.views import health_check

urlpatterns = [
    path('api/v1/health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    
    # Auth (JWT)
    path('api/v1/auth/token/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/v1/auth/', include('apps.accounts.urls')),

    # Domain APIs
    path('api/v1/catalog/', include('apps.catalog.urls')),
    path('api/v1/jobs/', include('apps.jobs.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/moderation/', include('apps.moderation.urls')),
    path('api/v1/admin/', include('apps.admin_api.urls')),
    path('api/v1/profiles/', include('apps.profiles.urls')),
    path('api/v1/chat/', include('apps.chat.urls')),

    path('register/', RegisterView.as_view(), name='register'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
