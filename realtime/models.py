from django.db import models
from django.conf import settings
from issues.models import Issue


class OnlineUser(models.Model):
    """Model to track online users."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="online_status"
    )
    is_online = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    channel_name = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {'Online' if self.is_online else 'Offline'}"


class IssueActivity(models.Model):
    """Model to track real-time issue activity."""

    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="realtime_activities"
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.issue.title} - {self.activity_type} by {self.user.email}"


class TypingStatus(models.Model):
    """Model to track who is typing in an issue thread."""

    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="typing_users"
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_typing = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("issue", "user")

    def __str__(self):
        return f"{self.user.email} {'is' if self.is_typing else 'is not'} typing in {self.issue.title}"
