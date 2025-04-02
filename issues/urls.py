from django.urls import path, include
from rest_framework_nested import routers
from .views import IssueViewSet, IssueStatusViewSet, CommentViewSet, AttachmentViewSet

router = routers.SimpleRouter()
router.register(r"", IssueViewSet)

# Nested routes for issue statuses, comments, and attachments
issue_router = routers.NestedSimpleRouter(router, r"", lookup="issue")
issue_router.register(r"statuses", IssueStatusViewSet, basename="issue-statuses")
issue_router.register(r"comments", CommentViewSet, basename="issue-comments")
issue_router.register(r"attachments", AttachmentViewSet, basename="issue-attachments")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(issue_router.urls)),
]
