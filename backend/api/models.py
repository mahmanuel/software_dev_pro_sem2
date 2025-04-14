from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from PIL import Image


# Create your models here.
# User Model
class User(AbstractUser):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"
    ROLE_CHOICES = [
        (STUDENT, "Student"),
        (FACULTY, "Faculty"),
        (ADMIN, "Admin"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=STUDENT)

    groups = models.ManyToManyField(
        "auth.Group", related_name="custom_user_set", blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission", related_name="custom_user_permissions_set", blank=True
    )


# Profile Module
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )
    university = models.CharField(max_length=255, blank=True, null=True)
    interests = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.profile_picture:
            img = Image.open(self.profile_picture.path)
            if img.height > 300 or img.width > 300:
                output_size = (300, 300)
                img.thumbnail(output_size)
                img.save(self.profile_picture.path)


# Automatically create a profile when a new user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:  # Ensure its a new user
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
# Ensure profile exists before saving
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


# Automatically create authentication tokens for new users
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


# Forum Model
class Forum(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class Post(models.Model):
    forum = models.ForeignKey(Forum, related_name="posts", on_delete=models.CASCADE)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


# Research Material Model
class ResearchMaterial(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="research_materials/")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


# Collaboration Group Model
class CollaborationGroup(models.Model):
    name = models.CharField(max_length=255)
    members = models.ManyToManyField(User)
    created_at = models.DateTimeField(auto_now_add=True)


class Task(models.Model):
    group = models.ForeignKey(
        CollaborationGroup, related_name="tasks", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE)
    due_date = models.DateTimeField()
    completed = models.BooleanField(default=False)


# Event Model
class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)


# Mentorship Program Model
class Mentorship(models.Model):
    mentor = models.ForeignKey(
        User, related_name="mentorship_mentor", on_delete=models.CASCADE
    )
    mentee = models.ForeignKey(
        User, related_name="mentorship_mentee", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)


# Notifications Model
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


# Messages Model for User Chat
class Message(models.Model):
    sender = models.ForeignKey(
        User, related_name="sent_messages", on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        User, related_name="received_messages", on_delete=models.CASCADE
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
