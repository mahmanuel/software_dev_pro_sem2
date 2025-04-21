from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    IssueViewSet,
    IssueStatusViewSet,
    CommentViewSet,
    AttachmentViewSet,
    my_issues,
    assign_issue,
    resolve_issue,
    lecturer_assigned_issues,
)

router = routers.SimpleRouter()
router.register(r"", IssueViewSet)

# Nested routes for issue statuses, comments, and attachments
issue_router = routers.NestedSimpleRouter(router, r"", lookup="issue")
issue_router.register(r"status", IssueStatusViewSet, basename="issue-status")
issue_router.register(r"comments", CommentViewSet, basename="issue-comments")
issue_router.register(r"attachments", AttachmentViewSet, basename="issue-attachments")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(issue_router.urls)),
    path("assign/", assign_issue, name="assign_issue"),
    path("my-issues/", my_issues, name="my_issues"),
    path("lecturer_issues/", lecturer_assigned_issues, name="lecturer_assigned_issues"),
    path("resolve/<int:issue_id>/", resolve_issue, name="resolve_issue"),
]
