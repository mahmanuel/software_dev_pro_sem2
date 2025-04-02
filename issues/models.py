from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Category(models.TextChoices):
    GRADE_DISPUTE = "GRADE_DISPUTE", _("Grade Dispute")
    CLASS_SCHEDULE = "CLASS_SCHEDULE", _("Class Schedule")
    FACULTY_CONCERN = "FACULTY_CONCERN", _("Faculty Concern")
    COURSE_REGISTRATION = "COURSE_REGISTRATION", _("Course Registration")
    GRADUATION_REQUIREMENT = "GRADUATION_REQUIREMENT", _("Graduation Requirement")
    OTHER = "OTHER", _("Other")


class Priority(models.TextChoices):
    LOW = "LOW", _("Low")
    MEDIUM = "MEDIUM", _("Medium")
    HIGH = "HIGH", _("High")
    URGENT = "URGENT", _("Urgent")


class StatusType(models.TextChoices):
    SUBMITTED = "SUBMITTED", _("Submitted")
    ASSIGNED = "ASSIGNED", _("Assigned")
    IN_PROGRESS = "IN_PROGRESS", _("In Progress")
    PENDING_INFO = "PENDING_INFO", _("Pending Information")
    RESOLVED = "RESOLVED", _("Resolved")
    CLOSED = "CLOSED", _("Closed")
    ESCALATED = "ESCALATED", _("Escalated")


class Issue(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=Category.choices)
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.MEDIUM
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def current_status(self):
        latest_status = self.statuses.order_by("-created_at").first()
        return latest_status.status if latest_status else None


class IssueStatus(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="statuses")
    status = models.CharField(max_length=20, choices=StatusType.choices)
    notes = models.TextField(blank=True, null=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="issue_status_updates",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.issue.title} - {self.status}"


class Comment(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.user.email} on {self.issue.title}"


class Attachment(models.Model):
    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="attachments"
    )
    file = models.FileField(upload_to="attachments/")
    filename = models.CharField(max_length=255)
    mimetype = models.CharField(max_length=100)
    size = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_attachments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename
