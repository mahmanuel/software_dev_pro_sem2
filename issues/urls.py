from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IssueViewSet,
    IssueStatusViewSet,
    CommentViewSet,
    AttachmentViewSet,
    my_issues,
    resolve_issue,
)

router = DefaultRouter()
router.register(r"", IssueViewSet, basename="issues")

urlpatterns = [
    path("", include(router.urls)),
    path("my-issues/", my_issues, name="my_issues"),
    path("<int:issue_id>/resolve/", resolve_issue, name="resolve_issue"),
    path(
        "<int:issue_pk>/status/",
        IssueStatusViewSet.as_view({"get": "list", "post": "create"}),
        name="issue_status",
    ),
    path(
        "<int:issue_pk>/comments/",
        CommentViewSet.as_view({"get": "list", "post": "create"}),
        name="issue_comments",
    ),
    path(
        "<int:issue_pk>/attachments/",
        AttachmentViewSet.as_view({"get": "list", "post": "create"}),
        name="issue_attachments",
    ),
]
