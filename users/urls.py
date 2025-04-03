from django.urls import path
from .views import UserRegistrationView, UserProfileView, PasswordChangeView

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("me/", UserProfileView.as_view(), name="user-profile"),
    path("change-password/", PasswordChangeView.as_view(), name="change-password"),
]
