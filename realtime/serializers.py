from rest_framework import serializers
from .models import OnlineUser, IssueActivity, TypingStatus
from users.serializers import UserSerializer


class OnlineUserSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = OnlineUser
        fields = ["id", "user", "is_online", "last_activity", "user_details"]
        read_only_fields = ["id", "last_activity"]


class IssueActivitySerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = IssueActivity
        fields = [
            "id",
            "issue",
            "user",
            "activity_type",
            "timestamp",
            "data",
            "user_details",
        ]
        read_only_fields = ["id", "timestamp"]


class TypingStatusSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = TypingStatus
        fields = ["id", "issue", "user", "is_typing", "last_updated", "user_details"]
        read_only_fields = ["id", "last_updated"]
