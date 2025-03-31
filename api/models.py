#importing django
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from PIL import Image
from rest_framework import serializers
from rest_framework import serializers, permissions
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.


# Custom User Model
class User(AbstractUser):
    is_verified = models.BooleanField(default=False)

    class Role(models.TextChoices):
        STUDENT = "Student", _("Student")
        FACULTY = "Faculty", _("Faculty")
        ADMIN = "Admin", _("Admin")

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)

    groups = models.ManyToManyField(Group, related_name="api_users", blank=True)
    user_permissions = models.ManyToManyField(
        Permission, related_name="api_users_permissions", blank=True
    )

    def __str__(self):
        return self.username


# Profile Model
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


# Issue Model
class Issue(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("escalated", "Escalated"),
    ]
    CATEGORY_CHOICES = [
        ("grade_dispute", "Grade Dispute"),
        ("schedule_error", "Schedule Error"),
        ("faculty_concern", "Faculty Concern"),
        ("other", "Other"),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_issues"
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="assigned_issues",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# Issue Assignment Model
class Assignment(models.Model):
    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="assignments"
    )
    faculty = models.ForeignKey(
        User, on_delete=models.CASCADE, limit_choices_to={"role": User.Role.FACULTY}
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.faculty.username} assigned to {self.issue.title}"


# Notifications Model
class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


# Audit Log Model
class AuditLog(models.Model):
    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="audit_logs"
    )
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
