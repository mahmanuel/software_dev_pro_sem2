from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet
from . import views

router = DefaultRouter()
router.register(r"", NotificationViewSet, basename="notifications")

urlpatterns = [
    path("", include(router.urls)),
    path("unread-count/", views.unread_count, name="unread_count"),
]
