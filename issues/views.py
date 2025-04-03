from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Issue, IssueStatus, Comment, Attachment
from .serializers import (
    IssueSerializer,
    IssueListSerializer,
    IssueStatusSerializer,
    CommentSerializer,
    AttachmentSerializer,
)
from notifications.models import Notification
from django.db.models import Q
from django.contrib.auth.models import User


class IssueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing issues.
    """

    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

    def get_serializer_class(self):
        if self.action == "list":
            return IssueListSerializer
        return IssueSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Issue.objects.all()

        # Filter by user role
        if user.role == "STUDENT":
            queryset = queryset.filter(submitted_by=user)
        elif user.role == "FACULTY":
            queryset = queryset.filter(Q(assigned_to=user) | Q(submitted_by=user))
        # Admins can see all issues

        # Apply filters from query params
        status_filter = self.request.query_params.get("status", None)
        if status_filter:
            queryset = queryset.filter(current_status=status_filter)

        category_filter = self.request.query_params.get("category", None)
        if category_filter:
            queryset = queryset.filter(category=category_filter)

        priority_filter = self.request.query_params.get("priority", None)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)

        return queryset

    def perform_create(self, serializer):
        issue = serializer.save()

        # Create initial status
        IssueStatus.objects.create(
            issue=issue,
            status="SUBMITTED",
            notes="Issue submitted",
            updated_by=self.request.user,
        )

        # Create notification for admins
        if self.request.user.role == "STUDENT":
            for admin in User.objects.filter(role="ADMIN"):
                Notification.objects.create(
                    user=admin,
                    content_type="issues.issue",
                    object_id=issue.id,
                    message=f"New issue submitted: {issue.title}",
                    notification_type="ISSUE_CREATED",
                )

    @action(detail=False, methods=["get"])
    def my_issues(self, request):
        """
        Return issues submitted by the current user.
        """
        issues = Issue.objects.filter(submitted_by=request.user)

        # Apply filters
        status_filter = request.query_params.get("status", None)
        if status_filter:
            issues = issues.filter(current_status=status_filter)

        page = self.paginate_queryset(issues)
        if page is not None:
            serializer = IssueListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = IssueListSerializer(issues, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        """
        Assign an issue to a faculty member.
        """
        issue = self.get_object()
        faculty_id = request.data.get("faculty_id")

        if not faculty_id:
            return Response(
                {"error": "Faculty ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            faculty = User.objects.get(id=faculty_id, role="FACULTY")
        except User.DoesNotExist:
            return Response(
                {"error": "Faculty not found"}, status=status.HTTP_404_NOT_FOUND
            )

        issue.assigned_to = faculty
        issue.current_status = "ASSIGNED"
        issue.save()

        # Create status update
        IssueStatus.objects.create(
            issue=issue,
            status="ASSIGNED",
            notes=f"Assigned to {faculty.first_name} {faculty.last_name}",
            updated_by=request.user,
        )

        # Create notification for faculty
        Notification.objects.create(
            user=faculty,
            content_type="issues.issue",
            object_id=issue.id,
            message=f"You have been assigned to issue: {issue.title}",
            notification_type="ISSUE_ASSIGNED",
        )

        return Response(
            {"message": f"Issue assigned to {faculty.email}"}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def escalate(self, request, pk=None):
        """
        Escalate an issue to admin.
        """
        issue = self.get_object()
        reason = request.data.get("reason", "No reason provided")

        issue.current_status = "ESCALATED"
        issue.save()

        # Create status update
        IssueStatus.objects.create(
            issue=issue,
            status="ESCALATED",
            notes=f"Escalated: {reason}",
            updated_by=request.user,
        )

        # Create notification for admins
        for admin in User.objects.filter(role="ADMIN"):
            Notification.objects.create(
                user=admin,
                content_type="issues.issue",
                object_id=issue.id,
                message=f"Issue escalated: {issue.title}",
                notification_type="ISSUE_ESCALATED",
            )

        return Response(
            {"message": "Issue escalated successfully"}, status=status.HTTP_200_OK
        )


class IssueStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing issue statuses.
    """

    serializer_class = IssueStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        issue_id = self.kwargs.get("issue_pk")
        return IssueStatus.objects.filter(issue_id=issue_id)

    def perform_create(self, serializer):
        issue_id = self.kwargs.get("issue_pk")
        issue = get_object_or_404(Issue, id=issue_id)

        # Update the issue's current status
        status_value = serializer.validated_data.get("status")
        issue.current_status = status_value
        issue.save()

        # Save the status update
        status_update = serializer.save(issue=issue, updated_by=self.request.user)

        # Create notification for the issue submitter
        if issue.submitted_by != self.request.user:
            Notification.objects.create(
                user=issue.submitted_by,
                content_type="issues.issue",
                object_id=issue.id,
                message=f"Status updated to {status_update.get_status_display()} for your issue: {issue.title}",
                notification_type="STATUS_UPDATED",
            )


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing comments.
    """

    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        issue_id = self.kwargs.get("issue_pk")
        return Comment.objects.filter(issue_id=issue_id)

    def perform_create(self, serializer):
        issue_id = self.kwargs.get("issue_pk")
        issue = get_object_or_404(Issue, id=issue_id)

        # Save the comment
        comment = serializer.save(issue=issue, user=self.request.user)

        # Create notification for the issue submitter and assignee
        recipients = []
        if issue.submitted_by != self.request.user:
            recipients.append(issue.submitted_by)

        if issue.assigned_to and issue.assigned_to != self.request.user:
            recipients.append(issue.assigned_to)

        for recipient in recipients:
            Notification.objects.create(
                user=recipient,
                content_type="issues.issue",
                object_id=issue.id,
                message=f"New comment on issue: {issue.title}",
                notification_type="COMMENT_ADDED",
            )


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing attachments.
    """

    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        issue_id = self.kwargs.get("issue_pk")
        return Attachment.objects.filter(issue_id=issue_id)

    def perform_create(self, serializer):
        issue_id = self.kwargs.get("issue_pk")
        issue = get_object_or_404(Issue, id=issue_id)
        serializer.save(issue=issue, uploaded_by=self.request.user)
