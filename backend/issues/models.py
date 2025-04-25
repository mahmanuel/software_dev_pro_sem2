from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import PermissionDenied


class Issue(models.Model):
    """Model for academic issues submitted by students."""

    CATEGORY_CHOICES = (
        ("GRADE_DISPUTE", "Grade Dispute"),
        ("CLASS_SCHEDULE", "Class Schedule"),
        ("FACULTY_CONCERN", "Faculty Concern"),
        ("COURSE_REGISTRATION", "Course Registration"),
        ("GRADUATION_REQUIREMENT", "Graduation Requirement"),
        ("OTHER", "Other"),
    )

    PRIORITY_CHOICES = (
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("URGENT", "Urgent"),
    )

    STATUS_CHOICES = (
        ("SUBMITTED", "Submitted"),
        ("ASSIGNED", "Assigned"),
        ("IN_PROGRESS", "In Progress"),
        ("PENDING_INFO", "Pending Information"),
        ("RESOLVED", "Resolved"),
        ("CLOSED", "Closed"),
        ("ESCALATED", "Escalated"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=50, choices=CATEGORY_CHOICES, default="OTHER"
    )
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default="MEDIUM"
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="submitted_issues",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="assigned_issues",
        null=True,
        blank=True,
    )
    current_status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="SUBMITTED"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    external_reference = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def assign_to(self, faculty, registrar):
        """Assign the issue to a lecturer."""
        if not registrar.is_staff:  # Assuming registrars are staff users
            raise PermissionDenied("Only registrars can assign issues.")
        self.assigned_to = faculty
        self.current_status = "ASSIGNED"
        self.save()
        print(
            f"Issue {self.id} assigned to {faculty.email} with status {self.current_status}"
        )

    def resolve(self, lecturer):
        """Mark the issue as resolved by the assigned lecturer."""
        if self.assigned_to != lecturer:
            raise PermissionDenied("Only the assigned lecturer can resolve this issue.")
        self.current_status = "RESOLVED"
        self.save()
        IssueStatus.objects.create(
            issue=self,
            status="RESOLVED",
            updated_by=lecturer,
            notes="Issue resolved by lecturer.",
        )


class IssueStatus(models.Model):
    """Model for tracking status changes of an issue."""

    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="statuses")
    status = models.CharField(max_length=20, choices=Issue.STATUS_CHOICES)
    notes = models.TextField(null=True, blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="status_updates",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Issue Statuses"

    def __str__(self):
        return f"{self.issue.title} - {self.status}"


class Comment(models.Model):
    """Model for comments on issues."""

    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.user.email} on {self.issue.title}"


class Attachment(models.Model):
    """Model for file attachments to issues."""

    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="attachments"
    )
    file = models.FileField(upload_to="attachments/")
    filename = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    size = models.PositiveIntegerField(default=0)  # File size in bytes

    def __str__(self):
        return self.filename
