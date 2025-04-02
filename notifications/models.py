from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class NotificationType(models.TextChoices):
    ISSUE_CREATED = "ISSUE_CREATED", "Issue Created"
    ISSUE_ASSIGNED = "ISSUE_ASSIGNED", "Issue Assigned"
    STATUS_UPDATED = "STATUS_UPDATED", "Status Updated"
    COMMENT_ADDED = "COMMENT_ADDED", "Comment Added"
    ISSUE_ESCALATED = "ISSUE_ESCALATED", "Issue Escalated"


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    message = models.CharField(max_length=255)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Generic relation to the related object (Issue, Comment, etc.)
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} for {self.user.email}"
