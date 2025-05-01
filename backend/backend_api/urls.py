from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FrontendApiCallViewSet, FrontendEndpointViewSet

router = DefaultRouter()
router.register(r"api-calls", FrontendApiCallViewSet, basename="api-call")
router.register(r"endpoints", FrontendEndpointViewSet, basename="endpoint")

urlpatterns = [
    path("", include(router.urls)),
]
