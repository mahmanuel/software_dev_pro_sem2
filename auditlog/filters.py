import django_filters
from .models import AuditLog
from django.db import models


class AuditLogFilter(django_filters.FilterSet):
    action = django_filters.CharFilter(lookup_expr="exact")
    timestamp_after = django_filters.DateTimeFilter(
        field_name="timestamp", lookup_expr="gte"
    )
    timestamp_before = django_filters.DateTimeFilter(
        field_name="timestamp", lookup_expr="lte"
    )
    user = django_filters.NumberFilter(field_name="user__id")
    content_type_name = django_filters.CharFilter(lookup_expr="icontains")
    search = django_filters.CharFilter(method="search_filter")

    class Meta:
        model = AuditLog
        fields = [
            "action",
            "timestamp_after",
            "timestamp_before",
            "user",
            "content_type_name",
        ]

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            models.Q(object_repr__icontains=value)
            | models.Q(content_type_name__icontains=value)
            | models.Q(details__icontains=value)
        )
