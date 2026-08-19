"""
URL configuration for config project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import CustomTokenObtainPairView
from apps.common.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/v1/health/', health_check, name='health-check'),

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
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
