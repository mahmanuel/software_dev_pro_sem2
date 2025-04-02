from django.shortcuts import render

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from .models import Issue, IssueStatus, Comment, Attachment, StatusType
from .serializers import (
    IssueSerializer,
    IssueDetailSerializer,
    IssueStatusSerializer,
    CommentSerializer,
    AttachmentSerializer,
    AssignIssueSerializer,
    EscalateIssueSerializer,
)
from users.permissions import IsAdminUser, IsFacultyUser, IsOwnerOrStaffOrAdmin
from notifications.utils import create_notification


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "priority"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "priority"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user

        # Admin can see all issues
        if user.is_admin:
            queryset = Issue.objects.all()
        # Faculty can see issues submitted by them or assigned to them
        elif user.is_faculty:
            queryset = Issue.objects.filter(Q(submitted_by=user) | Q(assigned_to=user))
        # Students can only see their own issues
        else:
            queryset = Issue.objects.filter(submitted_by=user)

        # Filter by status if provided
        status_param = self.request.query_params.get("status", None)
        if status_param:
            # Get issues with the latest status matching the requested status
            issue_ids = IssueStatus.objects.filter(status=status_param).values_list(
                "issue_id", flat=True
            )
            queryset = queryset.filter(id__in=issue_ids)

        # Filter by assigned_to if provided
        assigned_to = self.request.query_params.get("assigned_to", None)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)

        # Filter by submitted_by if provided
        submitted_by = self.request.query_params.get("submitted_by", None)
        if submitted_by:
            queryset = queryset.filter(submitted_by_id=submitted_by)

        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return IssueDetailSerializer
        if self.action == "assign":
            return AssignIssueSerializer
        if self.action == "escalate":
            return EscalateIssueSerializer
        return IssueSerializer

    def get_permissions(self):
        if self.action in ["assign", "escalate"]:
            permission_classes = [permissions.IsAuthenticated, IsFacultyUser]
        else:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaffOrAdmin]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        issue = serializer.save()

        # Send real-time update to admin users
        channel_layer = get_channel_layer()

        # Get all admin users
        from django.contrib.auth import get_user_model

        User = get_user_model()
        admins = User.objects.filter(role="ADMIN")

        for admin in admins:
            create_notification(
                user=admin,
                notification_type="ISSUE_CREATED",
                message=f"New issue created: {issue.title}",
                related_object=issue,
            )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsAdminUser],
    )
    def assign(self, request, pk=None):
        issue = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            faculty = serializer.validated_data["faculty_id"]
            issue.assigned_to = faculty
            issue.save()

            # Create a new status
            status_obj = IssueStatus.objects.create(
                issue=issue,
                status=StatusType.ASSIGNED,
                notes=f"Assigned to {faculty.get_full_name() or faculty.email}",
                updated_by=request.user,
            )

            # Create notifications
            create_notification(
                user=faculty,
                notification_type="ISSUE_ASSIGNED",
                message=f"You have been assigned to issue: {issue.title}",
                related_object=issue,
            )

            create_notification(
                user=issue.submitted_by,
                notification_type="STATUS_UPDATED",
                message=f"Your issue '{issue.title}' has been assigned to a faculty member",
                related_object=issue,
            )

            # Send real-time update to issue channel
            channel_layer = get_channel_layer()
            status_data = IssueStatusSerializer(status_obj).data

            async_to_sync(channel_layer.group_send)(
                f"issue_{issue.id}",
                {
                    "type": "status_updated",
                    "status": status_data,
                    "issue_id": str(issue.id),
                },
            )

            return Response(
                {"message": "Issue assigned successfully"}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsFacultyUser],
    )
    def escalate(self, request, pk=None):
        issue = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            reason = serializer.validated_data["reason"]

            # Create a new status
            IssueStatus.objects.create(
                issue=issue,
                status=StatusType.ESCALATED,
                notes=reason,
                updated_by=request.user,
            )

            # Notify all admins
            from django.contrib.auth import get_user_model

            User = get_user_model()
            admins = User.objects.filter(role="ADMIN")

            for admin in admins:
                create_notification(
                    user=admin,
                    notification_type="ISSUE_ESCALATED",
                    message=f"Issue '{issue.title}' has been escalated: {reason}",
                    related_object=issue,
                )

            # Notify the submitter
            create_notification(
                user=issue.submitted_by,
                notification_type="STATUS_UPDATED",
                message=f"Your issue '{issue.title}' has been escalated for further review",
                related_object=issue,
            )

            return Response(
                {"message": "Issue escalated successfully"}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IssueStatusViewSet(viewsets.ModelViewSet):
    queryset = IssueStatus.objects.all()
    serializer_class = IssueStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaffOrAdmin]

    def get_queryset(self):
        return IssueStatus.objects.filter(issue_id=self.kwargs.get("issue_pk"))

    def perform_create(self, serializer):
        issue = get_object_or_404(Issue, pk=self.kwargs.get("issue_pk"))
        status_type = serializer.validated_data["status"]

        # Create the status
        status_obj = serializer.save(issue=issue, updated_by=self.request.user)

        # Create notifications
        if issue.submitted_by != self.request.user:
            create_notification(
                user=issue.submitted_by,
                notification_type="STATUS_UPDATED",
                message=f"Your issue '{issue.title}' status has been updated to {status_type}",
                related_object=issue,
            )

        # If there's an assigned faculty and the updater is not them, notify them too
        if issue.assigned_to and issue.assigned_to != self.request.user:
            create_notification(
                user=issue.assigned_to,
                notification_type="STATUS_UPDATED",
                message=f"Issue '{issue.title}' status has been updated to {status_type}",
                related_object=issue,
            )
        
        # Send real-time update to issue channel
        channel_layer = get_channel_layer()
        status_data = IssueStatusSerializer(status_obj).data
        
        async_to_sync(channel_layer.group_send)(
            f'issue_{issue.id}',
            {
                'type': 'status_updated',
                'status': status_data,
                'issue_id': str(issue.id)
            }

        return status_obj


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaffOrAdmin]

    def get_queryset(self):
        return Comment.objects.filter(issue_id=self.kwargs.get("issue_pk"))

    def perform_create(self, serializer):
        issue = get_object_or_404(Issue, pk=self.kwargs.get("issue_pk"))
        comment = serializer.save(issue=issue, user=self.request.user)

        # Create notifications for relevant parties
        # Notify the submitter if they didn't make the comment
        if issue.submitted_by != self.request.user:
            create_notification(
                user=issue.submitted_by,
                notification_type="COMMENT_ADDED",
                message=f"New comment on your issue '{issue.title}'",
                related_object=comment,
            )

        # Notify assigned faculty if they didn't make the comment
        if issue.assigned_to and issue.assigned_to != self.request.user:
            create_notification(
                user=issue.assigned_to,
                notification_type="COMMENT_ADDED",
                message=f"New comment on issue '{issue.title}'",
                related_object=comment,
            )

        # Send real-time update to issue channel
        channel_layer = get_channel_layer()
        comment_data = CommentSerializer(comment).data
        
        async_to_sync(channel_layer.group_send)(
            f'issue_{issue.id}',
            {
                'type': 'comment_added',
                'comment': comment_data,
                'issue_id': str(issue.id)
            }
        )
        
        return comment   

