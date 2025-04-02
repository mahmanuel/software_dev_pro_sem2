from django.contrib.contenttypes.models import ContentType
from .models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from .serializers import NotificationSerializer


def create_notification(user, notification_type, message, related_object=None):
    """
    Create a notification for a user and send it via WebSocket.

    Args:
        user: The user to notify
        notification_type: Type of notification (from NotificationType choices)
        message: The notification message
        related_object: Optional related object (Issue, Comment, etc.)

    Returns:
        The created notification
    """
    notification = Notification(user=user, type=notification_type, message=message)

    if related_object:
        content_type = ContentType.objects.get_for_model(related_object)
        notification.content_type = content_type
        notification.object_id = related_object.id

    notification.save()

    # Send real-time notification via WebSocket
    channel_layer = get_channel_layer()
    notification_data = NotificationSerializer(notification).data

    async_to_sync(channel_layer.group_send)(
        f"user_{user.id}_notifications",
        {
            "type": "notification_message",
            "message": notification_data,
            "unread_count": Notification.objects.filter(user=user, read=False).count(),
        },
    )

    return notification
