from django.contrib import admin
from .models import UserActivity, IssueMetrics, UserMetrics, DashboardStat


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ("user", "activity_type", "timestamp", "ip_address", "related_issue")
    list_filter = ("activity_type", "timestamp", "user")
    search_fields = ("user__email", "ip_address")
    date_hierarchy = "timestamp"


@admin.register(IssueMetrics)
class IssueMetricsAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "total_issues",
        "new_issues",
        "resolved_issues",
        "avg_resolution_time",
    )
    list_filter = ("date",)
    date_hierarchy = "date"


@admin.register(UserMetrics)
class UserMetricsAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "active_users",
        "new_users",
        "active_students",
        "active_faculty",
        "active_admins",
        "logins",
    )
    list_filter = ("date",)
    date_hierarchy = "date"


@admin.register(DashboardStat)
class DashboardStatAdmin(admin.ModelAdmin):
    list_display = ("key", "last_updated")
    search_fields = ("key",)
