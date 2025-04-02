from django.shortcuts import render

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response(
            {"message": "Notification marked as read"}, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["post"])
    def mark_all_as_read(self, request):
        self.get_queryset().update(read=True)
        return Response(
            {"message": "All notifications marked as read"}, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = self.get_queryset().filter(read=False).count()
        return Response({"count": count}, status=status.HTTP_200_OK)
