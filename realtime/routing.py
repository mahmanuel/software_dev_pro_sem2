from django.urls import re_path
from . import consumers
from .middleware import JWTAuthMiddleware
from channels.auth import AuthMiddlewareStack

websocket_urlpatterns = [
    re_path(
        r"ws/notifications/$",
        JWTAuthMiddleware(consumers.NotificationConsumer.as_asgi()),
    ),
    re_path(
        r"ws/issues/(?P<issue_id>\w+)/$",
        JWTAuthMiddleware(consumers.IssueConsumer.as_asgi()),
    ),
]
