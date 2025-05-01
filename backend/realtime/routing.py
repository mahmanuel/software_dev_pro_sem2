from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r"ws/enhanced-notifications/$", consumers.EnhancedNotificationConsumer.as_asgi()
    ),
    re_path(
        r"ws/enhanced-issues/(?P<issue_id>\w+)/$",
        consumers.EnhancedIssueConsumer.as_asgi(),
    ),
]
