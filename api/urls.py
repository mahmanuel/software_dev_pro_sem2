from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    UserProfileView,
    VerifyEmailView,
    LoginView,
    LogoutView,
    IssueListCreateView,
    IssueDetailView,
    AssignIssueView,
    NotificationListView,
    AuditLogListView,
)

urlpatterns = [
    # Authentication Endpoints
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/profile/", UserProfileView.as_view(), name="profile"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/verify-email/", VerifyEmailView.as_view(), name="verify_email"),
    # Issue management endpoints
    path("issues/", IssueListCreateView.as_view(), name="issues"),
    path("issues/<int:pk>/", IssueDetailView.as_view(), name="issue_detail"),
    path(
        "issues/<int:issue_id>/assign/", AssignIssueView.as_view(), name="assign_issue"
    ),
    # Notification & logs
    path("notifications/", NotificationListView.as_view(), name="notifications"),
    path("audit-logs/", AuditLogListView.as_view(), name="audit_logs"),
]
