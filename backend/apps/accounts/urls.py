from django.urls import path

from .views import RegisterView

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    # path("me/", views.MeView.as_view(), name="me"),
]
