from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing notifications.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return notifications for the current user.
        """
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        """
        Mark a notification as read.
        """
        notification = self.get_object()
        notification.read = True
        notification.save(update_fields=["read"])
        return Response({"message": "Notification marked as read"})

    @action(detail=False, methods=["post"])
    def mark_all_as_read(self, request):
        """
        Mark all notifications as read.
        """
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"message": "All notifications marked as read"})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """
        Get the count of unread notifications.
        """
        count = Notification.objects.filter(user=request.user, read=False).count()
        return Response({"count": count})

    @action(detail=False, methods=["get"])
    def recent(self, request):
        """
        Get recent notifications (both read and unread).
        """
        limit = int(request.query_params.get("limit", 10))
        notifications = self.get_queryset().order_by("-created_at")[:limit]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
