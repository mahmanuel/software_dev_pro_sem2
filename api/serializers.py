from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AuditLog, Issue, Notification, Assignment, User
from .utils import send_verification_email

User = get_user_model()


# User Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "role",
            "phone_number",
            "department",
            "profile_picture",
            "bio",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            role=validated_data.get("role", User.Role.STUDENT),
            phone_number=validated_data.get("phone_number", ""),
            department=validated_data.get("department", ""),
            profile_picture=validated_data.get("profile_picture", None),
            bio=validated_data.get("bio", ""),
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


# User Login Serializer
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


#  User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "role",
            "phone_number",
            "department",
            "profile_picture",
            "created_at",
        ]


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
