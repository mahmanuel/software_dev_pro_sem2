from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from .serializers import NotificationSerializer
from issues.models import Comment, IssueStatus
from django.contrib.contenttypes.models import ContentType


@receiver(post_save, sender=Notification)
def notification_created(sender, instance, created, **kwargs):
    """
    Send notification to user via WebSocket when a new notification is created.
    """
    if created:
        try:
            channel_layer = get_channel_layer()
            notification_group = f"notifications_{instance.user.id}"

            # Serialize notification
            serializer = NotificationSerializer(instance)

            # Send notification to user's notification group
            async_to_sync(channel_layer.group_send)(
                notification_group,
                {"type": "notification_message", "notification": serializer.data},
            )

            # Also send updated unread count
            unread_count = Notification.objects.filter(
                user=instance.user, read=False
            ).count()
            async_to_sync(channel_layer.group_send)(
                notification_group,
                {"type": "unread_count_message", "count": unread_count},
            )
        except Exception as e:
            print(f"Error sending notification via WebSocket: {str(e)}")


@receiver(post_save, sender=Comment)
def comment_added_notification(sender, instance, created, **kwargs):
    """
    Create notification when a comment is added to an issue.
    """
    if created:
        issue = instance.issue

        # Notify the issue submitter if they didn't add the comment
        if issue.submitted_by != instance.user:
            content_type = ContentType.objects.get_for_model(issue)
            Notification.objects.create(
                user=issue.submitted_by,
                content_type=content_type,
                object_id=issue.id,
                message=f"New comment on issue: {issue.title}",
                notification_type="COMMENT_ADDED",
            )

        # Notify the assigned user if they didn't add the comment
        if issue.assigned_to and issue.assigned_to != instance.user:
            content_type = ContentType.objects.get_for_model(issue)
            Notification.objects.create(
                user=issue.assigned_to,
                content_type=content_type,
                object_id=issue.id,
                message=f"New comment on issue: {issue.title}",
                notification_type="COMMENT_ADDED",
            )


@receiver(post_save, sender=IssueStatus)
def status_updated_notification(sender, instance, created, **kwargs):
    """
    Create notification when an issue status is updated.
    """
    if created:
        issue = instance.issue

        # Notify the issue submitter if they didn't update the status
        if issue.submitted_by != instance.updated_by:
            content_type = ContentType.objects.get_for_model(issue)
            Notification.objects.create(
                user=issue.submitted_by,
                content_type=content_type,
                object_id=issue.id,
                message=f"Status updated to {instance.get_status_display()} for your issue: {issue.title}",
                notification_type="STATUS_UPDATED",
            )
