from django.db import models
from django.conf import settings


class FrontendApiCall(models.Model):
    """Model to track API calls made from backend to frontend."""

    CALL_TYPES = (
        ("NOTIFICATION", "Send Notification"),
        ("DATA_UPDATE", "Update Data"),
        ("USER_ACTION", "User Action"),
        ("SYSTEM_EVENT", "System Event"),
    )

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("RETRYING", "Retrying"),
    )

    call_type = models.CharField(max_length=20, choices=CALL_TYPES)
    endpoint = models.CharField(max_length=255)
    payload = models.JSONField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    response = models.TextField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="api_calls",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.call_type} to {self.endpoint} - {self.status}"


class FrontendEndpoint(models.Model):
    """Model to store frontend endpoints that the backend can call."""

    name = models.CharField(max_length=100)
    url = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    requires_auth = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
