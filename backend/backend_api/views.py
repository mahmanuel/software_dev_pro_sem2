from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FrontendApiCall, FrontendEndpoint
from .serializers import FrontendApiCallSerializer, FrontendEndpointSerializer
from .services import FrontendApiService


class FrontendApiCallViewSet(viewsets.ModelViewSet):
    """
    ViewSet for frontend API calls.
    """

    queryset = FrontendApiCall.objects.all()
    serializer_class = FrontendApiCallSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter API calls based on user role.
        """
        user = self.request.user

        # Admins can see all API calls
        if user.role == "ADMIN":
            return FrontendApiCall.objects.all()

        # Others can only see their own API calls
        return FrontendApiCall.objects.filter(initiated_by=user)

    @action(detail=False, methods=["post"])
    def make_call(self, request):
        """
        Make a new API call to the frontend.
        """
        endpoint_name = request.data.get("endpoint_name")
        payload = request.data.get("payload")
        call_type = request.data.get("call_type", "DATA_UPDATE")

        if not endpoint_name or not payload:
            return Response(
                {"error": "endpoint_name and payload are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        api_call = FrontendApiService.call_frontend_api(
            endpoint_name=endpoint_name,
            payload=payload,
            call_type=call_type,
            user=request.user,
        )

        if api_call:
            serializer = self.get_serializer(api_call)
            return Response(serializer.data)
        else:
            return Response(
                {"error": "Failed to make API call to frontend"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def retry_failed(self, request):
        """
        Retry failed API calls.
        """
        max_retries = request.data.get("max_retries", 3)
        retried_count = FrontendApiService.retry_failed_calls(max_retries)

        return Response(
            {
                "message": f"Retried {retried_count} failed API calls",
                "retried_count": retried_count,
            }
        )


class FrontendEndpointViewSet(viewsets.ModelViewSet):
    """
    ViewSet for frontend endpoints.
    """

    queryset = FrontendEndpoint.objects.all()
    serializer_class = FrontendEndpointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Only admins can create, update, or delete endpoints.
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
