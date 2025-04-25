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
from .permissions import IsRegistrar, IsAssignedFaculty
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
import logging

# Set up logging
logger = logging.getLogger(__name__)

User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_issues(request):
    user = request.user

    # Filter issues assigned to the logged-in user
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
@permission_classes([IsAuthenticated, IsAssignedFaculty])
def resolve_issue(request, issue_id):
    """
    Endpoint for faculty to resolve an issue assigned to them.
    """
    try:
        user = request.user
        issue = get_object_or_404(Issue, id=issue_id)

        # Log the request
        logger.info(
            f"Resolve request for issue {issue_id} by user {user.id} ({user.email})"
        )

        # Check if the user is assigned to this issue
        if issue.assigned_to != user and not user.is_staff:
            return Response(
                {"error": "You are not authorized to resolve this issue."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Mark the issue as resolved
        issue.current_status = "RESOLVED"
        issue.save()

        # Create a status update
        status_update = IssueStatus.objects.create(
            issue=issue,
            status="RESOLVED",
            updated_by=user,
            notes=request.data.get("notes", "Issue resolved by faculty."),
        )

        # Create notification for the issue submitter
        if issue.submitted_by != user:
            Notification.objects.create(
                user=issue.submitted_by,
                content_type=ContentType.objects.get_for_model(Issue),
                object_id=issue.id,
                message=f"Your issue '{issue.title}' has been resolved",
                notification_type="ISSUE_RESOLVED",
                is_read=False,
            )

        return Response(
            {"message": "Issue resolved successfully."},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        logger.error(f"Error resolving issue: {str(e)}")
        return Response(
            {"error": f"Failed to resolve issue: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


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

    @action(detail=True, methods=["post"])
    def add_status(self, request, pk=None):
        """
        Add a status update to an issue.
        """
        issue = self.get_object()
        serializer = IssueStatusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(issue=issue, updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def statuses(self, request, pk=None):
        """
        Get all status updates for an issue.
        """
        issue = self.get_object()
        statuses = IssueStatus.objects.filter(issue=issue)
        serializer = IssueStatusSerializer(statuses, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsRegistrar]
    )
    def assign(self, request, pk=None):
        """
        Assign an issue to a faculty member.
        """
        issue = self.get_object()
        faculty_id = request.data.get("faculty_id")
        faculty_name = request.data.get("faculty_name")
        department = request.data.get("department")

        # Handle unassignment
        if faculty_id is None and faculty_name is None:
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

        # Handle assignment by faculty name
        if faculty_name:
            # Try to find faculty by name and department
            faculty_query = Q(first_name__icontains=faculty_name.split()[0])

            if len(faculty_name.split()) > 1:
                faculty_query |= Q(last_name__icontains=faculty_name.split()[1])

            if department:
                faculty_query &= Q(department__iexact=department)

            faculty = User.objects.filter(faculty_query, role="FACULTY").first()

            if not faculty:
                return Response(
                    {"error": f"Faculty with name '{faculty_name}' not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # Handle assignment by faculty ID
            if not faculty_id:
                return Response(
                    {"error": "Either faculty_id or faculty_name is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if faculty_id is a string ID (like "maria-namusoke-cs")
            if isinstance(faculty_id, str) and "-" in faculty_id:
                parts = faculty_id.split("-")
                if len(parts) >= 2:
                    # Try to find faculty by name parts
                    first_name = parts[0].capitalize()
                    last_name = parts[1].capitalize()
                    dept = parts[2].upper() if len(parts) > 2 else None

                    faculty_query = Q(first_name__icontains=first_name) & Q(
                        last_name__icontains=last_name
                    )
                    if dept:
                        faculty_query &= Q(department__iexact=dept)

                    faculty = User.objects.filter(faculty_query, role="FACULTY").first()

                    if not faculty:
                        return Response(
                            {"error": f"Faculty with ID {faculty_id} not found"},
                            status=status.HTTP_404_NOT_FOUND,
                        )
                else:
                    return Response(
                        {"error": f"Invalid faculty ID format: {faculty_id}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                # Try to convert to integer for database lookup
                try:
                    if isinstance(faculty_id, str):
                        faculty_id = int(faculty_id)
                except ValueError:
                    return Response(
                        {
                            "error": f"Invalid faculty ID: {faculty_id}. Must be an integer or name-based ID."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Find faculty by numeric ID
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

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def faculty_issues(self, request):
        """
        Endpoint for faculty members to view issues assigned to them.
        """
        user = request.user
        if user.role != "FACULTY":
            return Response(
                {"detail": "You do not have permission to access this resource."},
                status=status.HTTP_403_FORBIDDEN,
            )

        issues = Issue.objects.filter(assigned_to=user)
        serializer = IssueSerializer(issues, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsAssignedFaculty],
    )
    def escalate(self, request, pk=None):
        """Escalate an issue to admin."""
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
                is_read=False,
            )

        return Response(
            {"message": "Issue escalated successfully"}, status=status.HTTP_200_OK
        )


class IssueStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing issue statuses.
    """

    serializer_class = IssueStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsAssignedFaculty]

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
