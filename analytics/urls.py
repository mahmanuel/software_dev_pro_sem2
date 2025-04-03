from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsViewSet, UserActivityViewSet

router = DefaultRouter()
router.register(r"analytics", AnalyticsViewSet, basename="analytics")
router.register(r"user-activity", UserActivityViewSet, basename="user-activity")

urlpatterns = [
    path("", include(router.urls)),
]
