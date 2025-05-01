from rest_framework import serializers
from .models import Notification
from django.contrib.contenttypes.models import ContentType


class NotificationSerializer(serializers.ModelSerializer):
    content_type_str = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "content_type",
            "content_type_str",
            "object_id",
            "message",
            "notification_type",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "content_type",
            "content_type_str",
            "object_id",
            "message",
            "notification_type",
            "created_at",
        ]

    def get_content_type_str(self, obj):
        if obj.content_type:
            return f"{obj.content_type.app_label}.{obj.content_type.model}"
        return None
