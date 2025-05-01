from django.contrib import admin
from .models import FrontendApiCall, FrontendEndpoint


@admin.register(FrontendApiCall)
class FrontendApiCallAdmin(admin.ModelAdmin):
    list_display = ("call_type", "endpoint", "status", "created_at", "retry_count")
    list_filter = ("call_type", "status", "created_at")
    search_fields = ("endpoint", "payload", "response", "error_message")
    date_hierarchy = "created_at"


@admin.register(FrontendEndpoint)
class FrontendEndpointAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "requires_auth", "is_active")
    list_filter = ("requires_auth", "is_active")
    search_fields = ("name", "url", "description")
