from rest_framework import serializers
from .models import UserActivity, IssueMetrics, UserMetrics, DashboardStat


class UserActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = UserActivity
        fields = [
            "id",
            "user",
            "user_email",
            "activity_type",
            "timestamp",
            "ip_address",
            "user_agent",
            "related_issue",
            "additional_data",
        ]
        read_only_fields = ["id", "timestamp"]

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None


class IssueMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueMetrics
        fields = [
            "date",
            "total_issues",
            "new_issues",
            "resolved_issues",
            "avg_resolution_time",
            "issues_by_category",
            "issues_by_priority",
            "issues_by_status",
        ]


class UserMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMetrics
        fields = [
            "date",
            "active_users",
            "new_users",
            "active_students",
            "active_faculty",
            "active_admins",
            "logins",
        ]


class DashboardStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardStat
        fields = ["key", "value", "last_updated"]
