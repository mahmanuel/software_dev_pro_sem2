from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from .models import Issue, IssueStatus, Comment, Attachment
from .serializers import (
    IssueSerializer,
    IssueStatusSerializer,
    CommentSerializer,
    AttachmentSerializer,
)
from notifications.models import (
    Notification,
)  # Import from notifications app, not issues
from django.db.models import Q
from .permissions import IsRegistrar, IsAssignedLecturer
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_issues(request):
    user = request.user

    # Filter issues assigned to the logged-in user
    issues = Issue.objects.filter(assigned_to=user)
    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUserIssues(request):
    """
    Endpoint for users to view issues assigned to them.
    This is an alias for get_user_issues to maintain compatibility with frontend.
    """
    user = request.user

    # Filter issues based on user role
    if user.role == "FACULTY":
        issues = Issue.objects.filter(assigned_to=user)
    else:
        # For students and other roles, show issues they submitted
        issues = Issue.objects.filter(submitted_by=user)

    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUserIssues(request):
    """
    Endpoint for users to view issues assigned to them.
    This is an alias for get_user_issues to maintain compatibility with frontend.
    """
    user = request.user

    # Filter issues based on user role
    if user.role == "FACULTY":
        issues = Issue.objects.filter(assigned_to=user)
    else:
        # For students and other roles, show issues they submitted
        issues = Issue.objects.filter(submitted_by=user)

    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def update_status(request, issue_id):
    print(request.data)  # Debugging: Log the payload
    # ...existing code...
    if not request.data.get("status"):
        return Response(
            {"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAssignedLecturer])
def resolve_issue(request, issue_id):
    """
    Endpoint for lecturers to resolve an issue assigned to them.
    """
    user = request.user
    issue = get_object_or_404(Issue, id=issue_id)

    if issue.assigned_to != user:
        return Response(
            {"error": "You are not authorized to resolve this issue."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Mark the issue as resolved
    issue.current_status = "RESOLVED"
    issue.save()

    # Create a status update
    IssueStatus.objects.create(
        issue=issue,
        status="RESOLVED",
        updated_by=user,
        notes="Issue resolved by lecturer.",
    )

    return Response(
        {"message": "Issue resolved successfully."}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAssignedLecturer])
def lecturer_assigned_issues(request):
    """
    Endpoint for lecturers to view issues assigned to them.
    """
    user = request.user
    issues = Issue.objects.filter(assigned_to=user)
    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data)


class IssueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing issues.
    """

    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Issue.objects.all()

        # Filter by user role
        if user.role == "STUDENT":
            queryset = queryset.filter(submitted_by=user)
        elif user.role == "FACULTY":
            queryset = queryset.filter(Q(assigned_to=user) | Q(submitted_by=user))
        # Admins can see all issues

        return queryset


@action(
    detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsRegistrar]
)
def assign(self, request, pk=None):
    issue = self.get_object()
    faculty_id = request.data.get("faculty_id")

    # Handle unassignment
    if faculty_id is None:
        issue.assigned_to = None
        issue.current_status = "SUBMITTED"  # Or appropriate status
        issue.save()

        IssueStatus.objects.create(
            issue=issue,
            status=issue.current_status,
            notes="Issue unassigned",
            updated_by=request.user,
        )

        return Response(
            {"message": "Issue unassigned successfully"}, status=status.HTTP_200_OK
        )

    # Log the incoming payload for debugging
    print(f"Assigning issue {issue.id} with payload: {request.data}")

    if not faculty_id:
        return Response(
            {"error": "Faculty ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Ensure faculty_id is an integer
    try:
        faculty_id = int(faculty_id)
    except (ValueError, TypeError):
        return Response(
            {"error": f"Invalid faculty ID: {faculty_id}. Must be an integer."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if the faculty exists and has the correct role
    try:
        faculty = User.objects.get(id=faculty_id, role="FACULTY")
    except User.DoesNotExist:
        return Response(
            {
                "error": f"Faculty with ID {faculty_id} not found or is not a faculty member"
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # Assign the issue to the faculty
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
        content_type=ContentType.objects.get_for_model(Issue),
        object_id=issue.id,
        message=f"You have been assigned to issue: {issue.title}",
        notification_type="ISSUE_ASSIGNED",
        is_read=False,
    )

    return Response(
        {"message": f"Issue assigned to {faculty.email}", "success": True},
        status=status.HTTP_200_OK,
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

    # Get ContentType for Issue model
    issue_content_type = ContentType.objects.get_for_model(Issue)

    # Create notification for admins
    for admin in User.objects.filter(role="ADMIN"):
        Notification.objects.create(
            user=admin,
            content_type=issue_content_type,
            object_id=issue.id,
            message=f"Issue escalated: {issue.title}",
            notification_type="ISSUE_ESCALATED",
            is_read=False,  # Use is_read instead of read
        )

    return Response(
        {"message": "Issue escalated successfully"}, status=status.HTTP_200_OK
    )


class IssueStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing issue statuses.
    """

    serializer_class = IssueStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsAssignedLecturer]

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
        serializer.save(issue=issue, updated_by=self.request.user)


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

        # Get ContentType for Issue model
        issue_content_type = ContentType.objects.get_for_model(Issue)

        # Create notification for the issue submitter and assignee
        recipients = []
        if issue.submitted_by != self.request.user:
            recipients.append(issue.submitted_by)

        if issue.assigned_to and issue.assigned_to != self.request.user:
            recipients.append(issue.assigned_to)

        for recipient in recipients:
            Notification.objects.create(
                user=recipient,
                content_type=issue_content_type,
                object_id=issue.id,
                message=f"New comment on issue: {issue.title}",
                notification_type="COMMENT_ADDED",
                is_read=False,  # Use is_read instead of read
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


class MyIssuesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        my_issues = Issue.objects.filter(submitted_by=user)
        serializer = IssueSerializer(my_issues, many=True)
        return Response(serializer.data)
