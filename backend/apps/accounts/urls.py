from django.urls import path

from .views import RegisterView, MeView, GoogleLoginView, ChangePasswordView

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
