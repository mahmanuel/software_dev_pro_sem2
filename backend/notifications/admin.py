from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "notification_type", "message", "created_at")  # removed "read"
    list_filter = ("notification_type", "created_at")  # removed "read"
    search_fields = ("user__email", "message")
    date_hierarchy = "created_at"
