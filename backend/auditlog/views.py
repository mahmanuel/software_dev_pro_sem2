from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer
from .filters import AuditLogFilter


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = AuditLogFilter
    search_fields = ["action", "object_repr", "content_type_name", "details"]
    ordering_fields = ["timestamp", "action"]
    ordering = ["-timestamp"]

    def get_permissions(self):
        # Allow both admin and registrar users to access audit logs
        if self.action in ["list", "retrieve"]:
            permission_classes = [IsAuthenticated]
            return [permission() for permission in permission_classes]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()

        # Get the user role from the request
        user = self.request.user
        user_role = getattr(user, "role", "").upper() if hasattr(user, "role") else ""

        # If the user is not an admin or registrar, return empty queryset
        if user_role not in ["ADMIN", "REGISTRAR"]:
            return AuditLog.objects.none()

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Apply additional filters from query params
        action = request.query_params.get("action")
        if action:
            queryset = queryset.filter(action=action)

        search = request.query_params.get("search")
        if search:
            from django.db.models import Q

            queryset = queryset.filter(
                Q(object_repr__icontains=search)
                | Q(content_type_name__icontains=search)
                | Q(details__icontains=search)
            )

        user = request.query_params.get("user")
        if user:
            queryset = queryset.filter(user__id=user)

        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
