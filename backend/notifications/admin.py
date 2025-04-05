from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "notification_type", "message", "read", "created_at")
    list_filter = ("notification_type", "read", "created_at")
    search_fields = ("user__email", "message")
    date_hierarchy = "created_at"
