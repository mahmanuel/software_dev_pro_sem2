from django.contrib.contenttypes.models import ContentType
from .models import Notification


def create_notification(user, notification_type, message, related_object=None):
    """
    Create a notification for a user.

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
    return notification
