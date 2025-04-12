from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, F, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
import json

from .models import UserActivity, IssueMetrics, UserMetrics, DashboardStat
from .serializers import (
    UserActivitySerializer,
    IssueMetricsSerializer,
    UserMetricsSerializer,
    DashboardStatSerializer,
)
from issues.models import Issue, IssueStatus
from django.contrib.auth import get_user_model

User = get_user_model()


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for analytics data.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Override to ensure only admin and faculty can access analytics.
        """
        if self.action in [
            "list",
            "retrieve",
            "dashboard_stats",
            "issue_trends",
            "user_activity",
        ]:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=["get"])
    def dashboard_stats(self, request):
        """
        Get dashboard statistics.
        """
        # Check if we have cached stats
        try:
            dashboard_stats = DashboardStat.objects.get(key="dashboard_stats")
            # Check if stats are fresh (less than 1 hour old)
            if dashboard_stats.last_updated > timezone.now() - timedelta(hours=1):
                return Response(dashboard_stats.value)
        except DashboardStat.DoesNotExist:
            dashboard_stats = None

        # Calculate fresh stats
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        # Total issues
        total_issues = Issue.objects.count()

        # Issues by status
        issues_by_status = Issue.objects.values("current_status").annotate(
            count=Count("id")
        )
        status_data = {
            item["current_status"]: item["count"] for item in issues_by_status
        }

        # Issues by category
        issues_by_category = Issue.objects.values("category").annotate(
            count=Count("id")
        )
        category_data = {item["category"]: item["count"] for item in issues_by_category}

        # Issues by priority
        issues_by_priority = Issue.objects.values("priority").annotate(
            count=Count("id")
        )
        priority_data = {item["priority"]: item["count"] for item in issues_by_priority}

        # Recent activity
        recent_activity = UserActivity.objects.select_related("user").order_by(
            "-timestamp"
        )[:10]
        recent_activity_data = UserActivitySerializer(recent_activity, many=True).data

        # New issues today
        new_issues_today = Issue.objects.filter(created_at__date=today).count()

        # Resolved issues today
        resolved_today = (
            IssueStatus.objects.filter(status="RESOLVED", created_at__date=today)
            .values("issue")
            .distinct()
            .count()
        )

        # Active users today
        active_users_today = (
            UserActivity.objects.filter(timestamp__date=today)
            .values("user")
            .distinct()
            .count()
        )

        # Compile stats
        stats = {
            "total_issues": total_issues,
            "issues_by_status": status_data,
            "issues_by_category": category_data,
            "issues_by_priority": priority_data,
            "recent_activity": recent_activity_data,
            "new_issues_today": new_issues_today,
            "resolved_today": resolved_today,
            "active_users_today": active_users_today,
            "generated_at": timezone.now().isoformat(),
        }

        # Cache the stats
        if dashboard_stats:
            dashboard_stats.value = stats
            dashboard_stats.save()
        else:
            DashboardStat.objects.create(key="dashboard_stats", value=stats)

        return Response(stats)

    @action(detail=False, methods=["get"])
    def issue_trends(self, request):
        """
        Get issue trends over time.
        """
        days = int(request.query_params.get("days", 30))
        start_date = timezone.now().date() - timedelta(days=days)

        # Get issue metrics for the period
        metrics = IssueMetrics.objects.filter(date__gte=start_date).order_by("date")

        # If we don't have enough metrics, calculate them
        if metrics.count() < days:
            self._calculate_missing_metrics(start_date)
            metrics = IssueMetrics.objects.filter(date__gte=start_date).order_by("date")

        serializer = IssueMetricsSerializer(metrics, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def user_activity(self, request):
        """
        Get user activity trends.
        """
        days = int(request.query_params.get("days", 30))
        start_date = timezone.now().date() - timedelta(days=days)

        # Get user metrics for the period
        metrics = UserMetrics.objects.filter(date__gte=start_date).order_by("date")

        # If we don't have enough metrics, calculate them
        if metrics.count() < days:
            self._calculate_missing_user_metrics(start_date)
            metrics = UserMetrics.objects.filter(date__gte=start_date).order_by("date")

        serializer = UserMetricsSerializer(metrics, many=True)
        return Response(serializer.data)

    def _calculate_missing_metrics(self, start_date):
        """
        Calculate missing issue metrics.
        """
        end_date = timezone.now().date()
        current_date = start_date

        while current_date <= end_date:
            # Skip if we already have metrics for this date
            if IssueMetrics.objects.filter(date=current_date).exists():
                current_date += timedelta(days=1)
                continue

            # Calculate metrics for this date
            total_issues = Issue.objects.filter(
                created_at__date__lte=current_date
            ).count()
            new_issues = Issue.objects.filter(created_at__date=current_date).count()

            # Resolved issues on this date
            resolved_issues = (
                IssueStatus.objects.filter(
                    status="RESOLVED", created_at__date=current_date
                )
                .values("issue")
                .distinct()
                .count()
            )

            # Average resolution time for issues resolved on this date
            resolved_issues_ids = (
                IssueStatus.objects.filter(
                    status="RESOLVED", created_at__date=current_date
                )
                .values_list("issue_id", flat=True)
                .distinct()
            )

            avg_resolution_time = None
            if resolved_issues_ids:
                # For each resolved issue, find the time between creation and resolution
                resolution_times = []
                for issue_id in resolved_issues_ids:
                    try:
                        issue = Issue.objects.get(id=issue_id)
                        resolution_status = (
                            IssueStatus.objects.filter(
                                issue_id=issue_id, status="RESOLVED"
                            )
                            .order_by("created_at")
                            .first()
                        )

                        if resolution_status:
                            time_diff = resolution_status.created_at - issue.created_at
                            resolution_times.append(
                                time_diff.total_seconds() / 3600
                            )  # Convert to hours
                    except Issue.DoesNotExist:
                        continue

                if resolution_times:
                    avg_resolution_time = sum(resolution_times) / len(resolution_times)

            # Issues by category
            issues_by_category = (
                Issue.objects.filter(created_at__date__lte=current_date)
                .values("category")
                .annotate(count=Count("id"))
            )
            category_data = {
                item["category"]: item["count"] for item in issues_by_category
            }

            # Issues by priority
            issues_by_priority = (
                Issue.objects.filter(created_at__date__lte=current_date)
                .values("priority")
                .annotate(count=Count("id"))
            )
            priority_data = {
                item["priority"]: item["count"] for item in issues_by_priority
            }

            # Issues by status
            issues_by_status = (
                Issue.objects.filter(created_at__date__lte=current_date)
                .values("current_status")
                .annotate(count=Count("id"))
            )
            status_data = {
                item["current_status"]: item["count"] for item in issues_by_status
            }

            # Create metrics record
            IssueMetrics.objects.create(
                date=current_date,
                total_issues=total_issues,
                new_issues=new_issues,
                resolved_issues=resolved_issues,
                avg_resolution_time=avg_resolution_time,
                issues_by_category=category_data,
                issues_by_priority=priority_data,
                issues_by_status=status_data,
            )

            current_date += timedelta(days=1)

    def _calculate_missing_user_metrics(self, start_date):
        """
        Calculate missing user metrics.
        """
        end_date = timezone.now().date()
        current_date = start_date

        while current_date <= end_date:
            # Skip if we already have metrics for this date
            if UserMetrics.objects.filter(date=current_date).exists():
                current_date += timedelta(days=1)
                continue

            # Active users on this date
            active_users = (
                UserActivity.objects.filter(timestamp__date=current_date)
                .values("user")
                .distinct()
                .count()
            )

            # New users on this date
            new_users = User.objects.filter(date_joined__date=current_date).count()

            # Active users by role
            active_students = (
                UserActivity.objects.filter(
                    timestamp__date=current_date, user__role="STUDENT"
                )
                .values("user")
                .distinct()
                .count()
            )

            active_faculty = (
                UserActivity.objects.filter(
                    timestamp__date=current_date, user__role="FACULTY"
                )
                .values("user")
                .distinct()
                .count()
            )

            active_admins = (
                UserActivity.objects.filter(
                    timestamp__date=current_date, user__role="ADMIN"
                )
                .values("user")
                .distinct()
                .count()
            )

            # Login count
            logins = UserActivity.objects.filter(
                timestamp__date=current_date, activity_type="LOGIN"
            ).count()

            # Create metrics record
            UserMetrics.objects.create(
                date=current_date,
                active_users=active_users,
                new_users=new_users,
                active_students=active_students,
                active_faculty=active_faculty,
                active_admins=active_admins,
                logins=logins,
            )

            current_date += timedelta(days=1)


class UserActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user activity.
    """

    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter activities based on user role.
        """
        user = self.request.user

        # Admins can see all activities
        if user.role == "ADMIN":
            return UserActivity.objects.all()

        # Faculty can see their own activities and activities related to issues assigned to them
        if user.role == "FACULTY":
            return UserActivity.objects.filter(
                Q(user=user) | Q(related_issue__assigned_to=user)
            )

        # Students can only see their own activities
        return UserActivity.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        """
        Create a new activity record.
        """
        # Set the user to the current user if not provided
        if "user" not in request.data:
            request.data["user"] = request.user.id

        # Get IP address and user agent
        ip_address = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT")

        if ip_address:
            request.data["ip_address"] = ip_address

        if user_agent:
            request.data["user_agent"] = user_agent

        return super().create(request, *args, **kwargs)
