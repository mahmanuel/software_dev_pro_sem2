from django.contrib import admin
from .models import OnlineUser, IssueActivity, TypingStatus


@admin.register(OnlineUser)
class OnlineUserAdmin(admin.ModelAdmin):
    list_display = ("user", "is_online", "last_activity")
    list_filter = ("is_online", "last_activity")
    search_fields = ("user__email",)


@admin.register(IssueActivity)
class IssueActivityAdmin(admin.ModelAdmin):
    list_display = ("issue", "user", "activity_type", "timestamp")
    list_filter = ("activity_type", "timestamp")
    search_fields = ("issue__title", "user__email")
    date_hierarchy = "timestamp"


@admin.register(TypingStatus)
class TypingStatusAdmin(admin.ModelAdmin):
    list_display = ("issue", "user", "is_typing", "last_updated")
    list_filter = ("is_typing", "last_updated")
    search_fields = ("issue__title", "user__email")
