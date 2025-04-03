from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from issues.models import Comment, IssueStatus
from .serializers import NotificationSerializer


@receiver(post_save, sender=Notification)
def notification_created(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        notification_group = f"notifications_{instance.user.id}"

        # Serialize notification
        serializer = NotificationSerializer(instance)

        # Send notification to user's notification group
        async_to_sync(channel_layer.group_send)(
            notification_group,
            {"type": "notification_message", "notification": serializer.data},
        )


@receiver(post_save, sender=Comment)
def comment_added(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        issue_group = f"issue_{instance.issue.id}"

        # Serialize comment
        from issues.serializers import CommentSerializer

        serializer = CommentSerializer(instance)

        # Send comment to issue group
        async_to_sync(channel_layer.group_send)(
            issue_group, {"type": "comment_added", "comment": serializer.data}
        )


@receiver(post_save, sender=IssueStatus)
def status_updated(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        issue_group = f"issue_{instance.issue.id}"

        # Serialize status
        from issues.serializers import IssueStatusSerializer

        serializer = IssueStatusSerializer(instance)

        # Send status update to issue group
        async_to_sync(channel_layer.group_send)(
            issue_group, {"type": "status_updated", "status": serializer.data}
        )
