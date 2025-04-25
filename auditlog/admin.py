from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "user", "action", "content_type_name", "object_repr")
    list_filter = ("action", "timestamp", "content_type")
    search_fields = ("user__email", "object_repr", "content_type_name")
    readonly_fields = (
        "timestamp",
        "user",
        "action",
        "content_type",
        "object_id",
        "object_repr",
        "content_type_name",
        "ip_address",
        "details",
    )
    date_hierarchy = "timestamp"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
