from django.db import models
from django.conf import settings
from django.utils import timezone
from issues.models import Issue


class UserActivity(models.Model):
    """Model to track user activity in the system."""

    ACTIVITY_TYPES = (
        ("LOGIN", "User Login"),
        ("LOGOUT", "User Logout"),
        ("ISSUE_CREATE", "Issue Created"),
        ("ISSUE_UPDATE", "Issue Updated"),
        ("ISSUE_VIEW", "Issue Viewed"),
        ("COMMENT_ADD", "Comment Added"),
        ("STATUS_CHANGE", "Status Changed"),
        ("ASSIGNMENT", "Issue Assigned"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activities"
    )
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    related_issue = models.ForeignKey(
        Issue,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activities",
    )
    additional_data = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "User Activities"

    def __str__(self):
        return f"{self.user.email} - {self.activity_type} - {self.timestamp}"


class IssueMetrics(models.Model):
    """Model to store aggregated metrics about issues."""

    date = models.DateField(unique=True)
    total_issues = models.IntegerField(default=0)
    new_issues = models.IntegerField(default=0)
    resolved_issues = models.IntegerField(default=0)
    avg_resolution_time = models.FloatField(null=True, blank=True)  # in hours
    issues_by_category = models.JSONField(default=dict)
    issues_by_priority = models.JSONField(default=dict)
    issues_by_status = models.JSONField(default=dict)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Issue Metrics for {self.date}"


class UserMetrics(models.Model):
    """Model to store aggregated metrics about user activity."""

    date = models.DateField(unique=True)
    active_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    active_students = models.IntegerField(default=0)
    active_faculty = models.IntegerField(default=0)
    active_admins = models.IntegerField(default=0)
    logins = models.IntegerField(default=0)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"User Metrics for {self.date}"


class DashboardStat(models.Model):
    """Model to store pre-calculated dashboard statistics."""

    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key
