from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, unread_count

router = DefaultRouter()
router.register(r"", NotificationViewSet, basename="notifications")

urlpatterns = [
    path("", include(router.urls)),
    path("unread-count/", unread_count, name="unread_count"),
    path(
        "<int:pk>/read/",
        NotificationViewSet.as_view({"post": "mark_as_read"}),
        name="mark_as_read",
    ),
    path(
        "mark-all-read/",
        NotificationViewSet.as_view({"post": "mark_all_as_read"}),
        name="mark_all_as_read",
    ),
]
