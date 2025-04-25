from django.urls import path
from .views import UserRegistrationView, UserProfileView, PasswordChangeView
from .views import get_faculty_list

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("me/", UserProfileView.as_view(), name="user-profile"),
    path("change-password/", PasswordChangeView.as_view(), name="change-password"),
    path("faculty/", get_faculty_list, name="faculty-list"),
]
