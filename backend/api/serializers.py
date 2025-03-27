from django.contrib.auth.models import User
from rest_framework import serializers
from .serializers import UserSerializer

from .models import (
    User,
    Profile,
    Forum,
    Post,
    ResearchMaterial,
    CollaborationGroup,
    Task,
    Event,
    Mentorship,
    Notification,
    Message,
)


# User serializer
class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Profile
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)  # Allow nested profile input

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "password", "profile"]
        extra_kwargs = {"password": {"write_only": True}}  # Hide password in responses

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", None)  # Extract profile data
        user = User.objects.create_user(**validated_data)  # Create User

        if profile_data:  # If profile data is provided, create profile
            Profile.objects.create(user=user, **profile_data)

        return user


# Forum Serializer
class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = "__all__"


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = "__all__"


# Research Material Serializer
class ResearchMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchMaterial
        fields = "__all__"


# Collaboration Group Serializer
class CollaborationGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollaborationGroup
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"


# Event Serializer
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


# Mentorship Serializer
class MentorshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mentorship
        fields = "__all__"


# Notification Serializer
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


# Message Serializer
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
