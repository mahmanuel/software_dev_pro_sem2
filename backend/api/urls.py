import api.views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import CreateUserView
from api.views import CreateUserAPIView 
from .views import (
    UserViewSet,
    ProfileViewSet,
    ForumViewSet,
    PostViewSet,
    ResearchMaterialViewSet,
    CollaborationGroupViewSet,
    TaskViewSet,
    EventViewSet,
    MentorshipViewSet,
    NotificationViewSet,
    MessageViewSet,
    CreateUserView,
)

# Router setup
router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"profiles", ProfileViewSet)
router.register(r"forums", ForumViewSet)
router.register(r"posts", PostViewSet)
router.register(r"research-materials", ResearchMaterialViewSet)
router.register(r"collaboration-groups", CollaborationGroupViewSet)
router.register(r"tasks", TaskViewSet)
router.register(r"mentorships", MentorshipViewSet)
router.register(r"notifications", NotificationViewSet)
router.register(r"messages", MessageViewSet)
router.register(r"events", EventViewSet)

# URL patterns
urlpatterns = [
    path("api/", include(router.urls)),
    path("api/register/", CreateUserView.as_view(), name="user-register"),
]
def get_create_user_view():
    from api.views import CreateUserView  
    return CreateUserView
