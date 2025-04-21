from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Issue
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
from notifications.models import Notification
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
def get_user_issues(request):
    user = request.user

    # Ensure the user is a lecturer
    if user.role != "FACULTY":
        return Response({"error": "Unauthorized access"}, status=403)

    # Filter issues assigned to the logged-in lecturer
    issues = Issue.objects.filter(assigned_to=user)
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
def assign_issue(request):
    issue_id = request.data.get("issue_id")
    faculty_id = request.data.get("faculty_id")

    try:
        issue = Issue.objects.get(id=issue_id)
        faculty = User.objects.get(id=faculty_id, role="FACULTY")
        issue.assigned_to = faculty
        issue.save()
        return Response(
            {"detail": "Issue assigned successfully."}, status=status.HTTP_200_OK
        )
    except Issue.DoesNotExist:
        return Response(
            {"detail": "Issue not found."}, status=status.HTTP_404_NOT_FOUND
        )
    except User.DoesNotExist:
        return Response(
            {"detail": "Faculty not found."}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
            content_type=ContentType.objects.get_for_model(Issue),
            object_id=issue.id,
            message=f"You have been assigned to issue: {issue.title}",
            notification_type="ISSUE_ASSIGNED",
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
