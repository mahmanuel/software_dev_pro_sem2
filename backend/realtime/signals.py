from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import OnlineUser, IssueActivity, TypingStatus
from .serializers import (
    OnlineUserSerializer,
    IssueActivitySerializer,
    TypingStatusSerializer,
)


@receiver(post_save, sender=OnlineUser)
def online_user_saved(sender, instance, created, **kwargs):
    """
    Broadcast online status changes to all users.
    """
    channel_layer = get_channel_layer()

    # Broadcast to global group
    async_to_sync(channel_layer.group_send)(
        "global_notifications",
        {
            "type": "user_status",
            "user_id": instance.user.id,
            "status": "online" if instance.is_online else "offline",
            "user_email": instance.user.email,
            "user_role": instance.user.role,
        },
    )


@receiver(post_save, sender=IssueActivity)
def issue_activity_saved(sender, instance, created, **kwargs):
    """
    Broadcast issue activity to issue group.
    """
    if created:
        channel_layer = get_channel_layer()
        issue_group = f"issue_{instance.issue.id}"

        # Serialize activity
        serializer = IssueActivitySerializer(instance)

        # Broadcast to issue group
        async_to_sync(channel_layer.group_send)(
            issue_group, {"type": "issue_activity", "activity": serializer.data}
        )


@receiver(post_save, sender=TypingStatus)
def typing_status_saved(sender, instance, created, **kwargs):
    """
    Broadcast typing status changes to issue group.
    """
    channel_layer = get_channel_layer()
    issue_group = f"issue_{instance.issue.id}"

    # Broadcast to issue group
    async_to_sync(channel_layer.group_send)(
        issue_group,
        {
            "type": "typing_update",
            "user_id": instance.user.id,
            "user_email": instance.user.email,
            "is_typing": instance.is_typing,
        },
    )
