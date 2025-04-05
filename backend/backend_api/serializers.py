from rest_framework import serializers
from .models import FrontendApiCall, FrontendEndpoint


class FrontendApiCallSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrontendApiCall
        fields = [
            "id",
            "call_type",
            "endpoint",
            "payload",
            "status",
            "created_at",
            "updated_at",
            "response",
            "error_message",
            "retry_count",
            "initiated_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FrontendEndpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrontendEndpoint
        fields = ["id", "name", "url", "description", "requires_auth", "is_active"]
        read_only_fields = ["id"]
