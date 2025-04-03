import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import Notification

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token from query string
        token = self.scope["query_string"].decode().split("=")[1]

        # Validate token and get user
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            self.user = await self.get_user(user_id)

            if not self.user:
                await self.close()
                return

            # Add user to their personal notification group
            self.notification_group = f"notifications_{self.user.id}"
            await self.channel_layer.group_add(
                self.notification_group, self.channel_name
            )

            await self.accept()

            # Send initial unread count
            unread_count = await self.get_unread_count()
            await self.send(
                text_data=json.dumps({"type": "unread_count", "count": unread_count})
            )

        except TokenError:
            await self.close()

    async def disconnect(self, close_code):
        # Remove user from notification group
        if hasattr(self, "notification_group"):
            await self.channel_layer.group_discard(
                self.notification_group, self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "mark_as_read":
            notification_id = data.get("id")
            await self.mark_as_read(notification_id)

            # Send updated unread count
            unread_count = await self.get_unread_count()
            await self.send(
                text_data=json.dumps({"type": "unread_count", "count": unread_count})
            )

        elif message_type == "mark_all_as_read":
            await self.mark_all_as_read()

            # Send updated unread count
            await self.send(text_data=json.dumps({"type": "unread_count", "count": 0}))

    async def notification_message(self, event):
        # Send notification to WebSocket
        await self.send(
            text_data=json.dumps(
                {"type": "notification_message", "notification": event["notification"]}
            )
        )

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_unread_count(self):
        return Notification.objects.filter(user=self.user, read=False).count()

    @database_sync_to_async
    def mark_as_read(self, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False

    @database_sync_to_async
    def mark_all_as_read(self):
        Notification.objects.filter(user=self.user, read=False).update(read=True)
        return True


class IssueConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token and issue_id from query string
        query_string = self.scope["query_string"].decode()
        token = query_string.split("token=")[1].split("&")[0]
        self.issue_id = self.scope["url_route"]["kwargs"]["issue_id"]

        # Validate token and get user
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            self.user = await self.get_user(user_id)

            if not self.user:
                await self.close()
                return

            # Add user to issue group
            self.issue_group = f"issue_{self.issue_id}"
            await self.channel_layer.group_add(self.issue_group, self.channel_name)

            await self.accept()

        except TokenError:
            await self.close()

    async def disconnect(self, close_code):
        # Remove user from issue group
        if hasattr(self, "issue_group"):
            await self.channel_layer.group_discard(self.issue_group, self.channel_name)

    async def comment_added(self, event):
        # Send comment to WebSocket
        await self.send(
            text_data=json.dumps({"type": "comment_added", "comment": event["comment"]})
        )

    async def status_updated(self, event):
        # Send status update to WebSocket
        await self.send(
            text_data=json.dumps({"type": "status_updated", "status": event["status"]})
        )

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
