from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsViewSet, UserActivityViewSet

router = DefaultRouter()
router.register(r"", AnalyticsViewSet, basename="analytics")
router.register(r"", UserActivityViewSet, basename="user-activity")

urlpatterns = [
    path("", include(router.urls)),
]
