import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import OnlineUser, IssueActivity, TypingStatus
from issues.models import Issue
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class EnhancedNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token from query string
        query_string = self.scope["query_string"].decode()
        token_part = (
            query_string.split("token=")[1] if "token=" in query_string else None
        )
        token = token_part.split("&")[0] if token_part else None

        if not token:
            await self.close()
            return

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

            # Add user to the global group
            self.global_group = "global_notifications"
            await self.channel_layer.group_add(self.global_group, self.channel_name)

            # Update user's online status
            await self.update_online_status(True, self.channel_name)

            # Send online users list
            online_users = await self.get_online_users()
            await self.send(
                text_data=json.dumps({"type": "online_users", "users": online_users})
            )

            # Broadcast user online status to all users
            await self.channel_layer.group_send(
                self.global_group,
                {
                    "type": "user_status",
                    "user_id": self.user.id,
                    "status": "online",
                    "user_email": self.user.email,
                    "user_role": self.user.role,
                },
            )

            await self.accept()

        except TokenError:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, "user"):
            # Update user's online status
            await self.update_online_status(False, None)

            # Broadcast user offline status to all users
            await self.channel_layer.group_send(
                self.global_group,
                {
                    "type": "user_status",
                    "user_id": self.user.id,
                    "status": "offline",
                    "user_email": self.user.email,
                    "user_role": self.user.role,
                },
            )

        # Remove user from notification groups
        if hasattr(self, "notification_group"):
            await self.channel_layer.group_discard(
                self.notification_group, self.channel_name
            )

        if hasattr(self, "global_group"):
            await self.channel_layer.group_discard(self.global_group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "mark_as_read":
            notification_id = data.get("id")
            await self.mark_as_read(notification_id)

        elif message_type == "mark_all_as_read":
            await self.mark_all_as_read()

        elif message_type == "typing_status":
            issue_id = data.get("issue_id")
            is_typing = data.get("is_typing", False)
            await self.update_typing_status(issue_id, is_typing)

            # Broadcast typing status to issue group
            issue_group = f"issue_{issue_id}"
            await self.channel_layer.group_send(
                issue_group,
                {
                    "type": "typing_update",
                    "user_id": self.user.id,
                    "user_email": self.user.email,
                    "is_typing": is_typing,
                },
            )

    async def notification_message(self, event):
        # Send notification to WebSocket
        await self.send(
            text_data=json.dumps(
                {"type": "notification_message", "notification": event["notification"]}
            )
        )

    async def user_status(self, event):
        # Send user status update to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_status",
                    "user_id": event["user_id"],
                    "status": event["status"],
                    "user_email": event["user_email"],
                    "user_role": event["user_role"],
                }
            )
        )

    async def typing_update(self, event):
        # Send typing status update to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing_update",
                    "user_id": event["user_id"],
                    "user_email": event["user_email"],
                    "is_typing": event["is_typing"],
                }
            )
        )

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def update_online_status(self, is_online, channel_name):
        online_user, created = OnlineUser.objects.get_or_create(user=self.user)
        online_user.is_online = is_online
        online_user.channel_name = channel_name
        online_user.save()
        return online_user

    @database_sync_to_async
    def get_online_users(self):
        # Get users who were active in the last 5 minutes
        five_minutes_ago = timezone.now() - timedelta(minutes=5)
        online_users = OnlineUser.objects.filter(
            is_online=True, last_activity__gte=five_minutes_ago
        ).select_related("user")

        return [
            {
                "id": online.user.id,
                "email": online.user.email,
                "role": online.user.role,
                "first_name": online.user.first_name,
                "last_name": online.user.last_name,
            }
            for online in online_users
        ]

    @database_sync_to_async
    def update_typing_status(self, issue_id, is_typing):
        try:
            issue = Issue.objects.get(id=issue_id)
            typing_status, created = TypingStatus.objects.get_or_create(
                issue=issue, user=self.user, defaults={"is_typing": is_typing}
            )

            if not created:
                typing_status.is_typing = is_typing
                typing_status.save()

            return typing_status
        except Issue.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_as_read(self, notification_id):
        from notifications.models import Notification

        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False

    @database_sync_to_async
    def mark_all_as_read(self):
        from notifications.models import Notification

        Notification.objects.filter(user=self.user, read=False).update(read=True)
        return True


class EnhancedIssueConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token and issue_id from query string
        query_string = self.scope["query_string"].decode()
        token_part = (
            query_string.split("token=")[1] if "token=" in query_string else None
        )
        token = token_part.split("&")[0] if token_part else None

        self.issue_id = self.scope["url_route"]["kwargs"]["issue_id"]

        if not token:
            await self.close()
            return

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

            # Record user viewing the issue
            await self.record_issue_view()

            # Send currently typing users
            typing_users = await self.get_typing_users()
            await self.send(
                text_data=json.dumps({"type": "typing_users", "users": typing_users})
            )

            # Send currently viewing users
            viewing_users = await self.get_viewing_users()
            await self.channel_layer.group_send(
                self.issue_group, {"type": "viewing_update", "users": viewing_users}
            )

            await self.accept()

        except TokenError:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, "user") and hasattr(self, "issue_id"):
            # Clear typing status
            await self.update_typing_status(False)

        # Remove user from issue group
        if hasattr(self, "issue_group"):
            await self.channel_layer.group_discard(self.issue_group, self.channel_name)

            # Send updated viewing users
            viewing_users = await self.get_viewing_users()
            await self.channel_layer.group_send(
                self.issue_group, {"type": "viewing_update", "users": viewing_users}
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "typing_status":
            is_typing = data.get("is_typing", False)
            await self.update_typing_status(is_typing)

            # Broadcast to all users in the issue group
            await self.channel_layer.group_send(
                self.issue_group,
                {
                    "type": "typing_update",
                    "user_id": self.user.id,
                    "user_email": self.user.email,
                    "is_typing": is_typing,
                },
            )

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

    async def typing_update(self, event):
        # Send typing update to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing_update",
                    "user_id": event["user_id"],
                    "user_email": event["user_email"],
                    "is_typing": event["is_typing"],
                }
            )
        )

    async def viewing_update(self, event):
        # Send viewing users update to WebSocket
        await self.send(
            text_data=json.dumps({"type": "viewing_update", "users": event["users"]})
        )

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def record_issue_view(self):
        try:
            issue = Issue.objects.get(id=self.issue_id)
            IssueActivity.objects.create(
                issue=issue,
                user=self.user,
                activity_type="VIEW",
                data={"timestamp": timezone.now().isoformat()},
            )

            # Also record in analytics
            from analytics.models import UserActivity

            UserActivity.objects.create(
                user=self.user, activity_type="ISSUE_VIEW", related_issue=issue
            )

            return True
        except Issue.DoesNotExist:
            return False

    @database_sync_to_async
    def update_typing_status(self, is_typing):
        try:
            issue = Issue.objects.get(id=self.issue_id)
            typing_status, created = TypingStatus.objects.get_or_create(
                issue=issue, user=self.user, defaults={"is_typing": is_typing}
            )

            if not created:
                typing_status.is_typing = is_typing
                typing_status.save()

            return typing_status
        except Issue.DoesNotExist:
            return None

    @database_sync_to_async
    def get_typing_users(self):
        try:
            # Get users who are currently typing
            typing_statuses = TypingStatus.objects.filter(
                issue_id=self.issue_id,
                is_typing=True,
                last_updated__gte=timezone.now() - timedelta(minutes=1),
            ).select_related("user")

            return [
                {
                    "id": status.user.id,
                    "email": status.user.email,
                    "first_name": status.user.first_name,
                    "last_name": status.user.last_name,
                }
                for status in typing_statuses
                if status.user != self.user
            ]
        except Exception:
            return []

    @database_sync_to_async
    def get_viewing_users(self):
        try:
            # Get users who viewed the issue in the last 5 minutes
            five_minutes_ago = timezone.now() - timedelta(minutes=5)
            activities = (
                IssueActivity.objects.filter(
                    issue_id=self.issue_id,
                    activity_type="VIEW",
                    timestamp__gte=five_minutes_ago,
                )
                .select_related("user")
                .order_by("user")
                .distinct("user")
            )

            return [
                {
                    "id": activity.user.id,
                    "email": activity.user.email,
                    "first_name": activity.user.first_name,
                    "last_name": activity.user.last_name,
                }
                for activity in activities
            ]
        except Exception:
            return []
