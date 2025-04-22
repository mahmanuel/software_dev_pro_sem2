#importing django modules
from django.contrib.auth.models import User
from rest_framework import serializers
from api.models import Profile, User
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AuditLog, Issue, Notification, Assignment, User

User = get_user_model()


# User Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data.get("role", "Student"),
        )
        user.is_verified = False
        user.save()
        return user


# User Login Serializer
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


# Logout Serializer (Blacklist Token)
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class AssignmentSerializer(serializers.ModelSerializer):
    faculty = UserRegistrationSerializer(read_only=True)
    assigned_by = UserRegistrationSerializer(read_only=True)

    class Meta:
        model = Assignment
        fields = ["id", "issue", "faculty", "assigned_by", "assigned_at"]


class IssueSerializer(serializers.ModelSerializer):
    created_by = UserRegistrationSerializer(read_only=True)
    assigned_to = UserRegistrationSerializer(read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id",
            "title",
            "description",
            "category",
            "status",
            "created_by",
            "assigned_to",
            "created_at",
            "updated_at",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    user = UserRegistrationSerializer(read_only=True)
    issue = IssueSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "user", "issue", "message", "timestamp", "is_read"]


class AuditLogSerializer(serializers.ModelSerializer):
    created_by = UserRegistrationSerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = ["id", "title", "description", "created_by", "created_at"]
        
        
       
