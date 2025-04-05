from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OnlineUserViewSet, IssueActivityViewSet, TypingStatusViewSet

router = DefaultRouter()
router.register(r"online-users", OnlineUserViewSet, basename="online-user")
router.register(r"issue-activity", IssueActivityViewSet, basename="issue-activity")
router.register(r"typing-status", TypingStatusViewSet, basename="typing-status")

urlpatterns = [
    path("", include(router.urls)),
]
