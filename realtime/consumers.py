import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        # Reject the connection if the user is not authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return

        # Create a user-specific notification group
        self.notification_group_name = f"user_{self.user.id}_notifications"

        # Join the notification group
        await self.channel_layer.group_add(
            self.notification_group_name, self.channel_name
        )

        await self.accept()

        # Send initial unread count
        unread_count = await self.get_unread_count()
        await self.send(
            text_data=json.dumps({"type": "unread_count", "count": unread_count})
        )

    async def disconnect(self, close_code):
        # Leave the notification group
        await self.channel_layer.group_discard(
            self.notification_group_name, self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type")

        if message_type == "mark_as_read":
            notification_id = text_data_json.get("id")
            if notification_id:
                await self.mark_notification_as_read(notification_id)

                # Send updated unread count
                unread_count = await self.get_unread_count()
                await self.send(
                    text_data=json.dumps(
                        {"type": "unread_count", "count": unread_count}
                    )
                )

        elif message_type == "mark_all_as_read":
            await self.mark_all_notifications_as_read()

            # Send updated unread count
            await self.send(text_data=json.dumps({"type": "unread_count", "count": 0}))

    # Receive message from notification group
    async def notification_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_unread_count(self):
        from notifications.models import Notification

        return Notification.objects.filter(user=self.user, read=False).count()

    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        from notifications.models import Notification

        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False

    @database_sync_to_async
    def mark_all_notifications_as_read(self):
        from notifications.models import Notification

        Notification.objects.filter(user=self.user, read=False).update(read=True)
        return True


class IssueConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        # Reject the connection if the user is not authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return

        self.issue_id = self.scope["url_route"]["kwargs"]["issue_id"]

        # Check if the user has permission to access this issue
        if not await self.can_access_issue():
            await self.close()
            return

        # Create an issue-specific group
        self.issue_group_name = f"issue_{self.issue_id}"

        # Join the issue group
        await self.channel_layer.group_add(self.issue_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the issue group
        await self.channel_layer.group_discard(self.issue_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        # We don't expect to receive messages from the client for this consumer
        pass

    # Receive message from issue group
    async def issue_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    # Receive comment message from issue group
    async def comment_added(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    # Receive status update message from issue group
    async def status_updated(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def can_access_issue(self):
        from issues.models import Issue

        # Admin can access all issues
        if self.user.is_admin:
            return True

        try:
            issue = Issue.objects.get(id=self.issue_id)

            # Check if user is the submitter or assigned faculty
            if issue.submitted_by == self.user or issue.assigned_to == self.user:
                return True

            # Faculty can access issues in their department
            if (
                self.user.is_faculty
                and issue.submitted_by.department == self.user.department
            ):
                return True

            return False
        except Issue.DoesNotExist:
            return False
