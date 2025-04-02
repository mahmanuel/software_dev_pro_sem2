from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "message",
            "read",
            "created_at",
            "content_type",
            "object_id",
        ]
        read_only_fields = [
            "id",
            "type",
            "message",
            "created_at",
            "content_type",
            "object_id",
        ]
