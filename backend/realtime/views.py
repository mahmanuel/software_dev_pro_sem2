from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

from .models import OnlineUser, IssueActivity, TypingStatus
from .serializers import (
    OnlineUserSerializer,
    IssueActivitySerializer,
    TypingStatusSerializer,
)
from issues.models import Issue


class OnlineUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing online users.
    """

    serializer_class = OnlineUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get users who were active in the last 5 minutes
        five_minutes_ago = timezone.now() - timedelta(minutes=5)
        return OnlineUser.objects.filter(
            is_online=True, last_activity__gte=five_minutes_ago
        ).select_related("user")


class IssueActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing issue activity.
    """

    serializer_class = IssueActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Filter by issue if provided
        issue_id = self.request.query_params.get("issue_id")
        if issue_id:
            queryset = IssueActivity.objects.filter(issue_id=issue_id)
        else:
            queryset = IssueActivity.objects.all()

        # Filter based on user role
        if user.role == "ADMIN":
            return queryset
        elif user.role == "FACULTY":
            return queryset.filter(
                Q(issue__assigned_to=user) | Q(issue__submitted_by=user)
            )
        else:  # Student
            return queryset.filter(issue__submitted_by=user)


class TypingStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing typing status.
    """

    serializer_class = TypingStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get typing statuses for a specific issue
        issue_id = self.request.query_params.get("issue_id")
        if not issue_id:
            return TypingStatus.objects.none()

        # Only return statuses from the last minute
        one_minute_ago = timezone.now() - timedelta(minutes=1)
        return TypingStatus.objects.filter(
            issue_id=issue_id, is_typing=True, last_updated__gte=one_minute_ago
        ).exclude(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Set the user to the current user
        request.data["user"] = request.user.id

        # Check if the issue exists
        issue_id = request.data.get("issue")
        try:
            Issue.objects.get(id=issue_id)
        except Issue.DoesNotExist:
            return Response(
                {"error": "Issue not found"}, status=status.HTTP_404_NOT_FOUND
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Ensure users can only update their own typing status
        instance = self.get_object()
        if instance.user != request.user:
            return Response(
                {"error": "You can only update your own typing status"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(request, *args, **kwargs)
