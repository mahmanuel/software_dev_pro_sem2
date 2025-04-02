from django.shortcuts import render

# Create your views here.
from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.db.models import Count, Avg, F, ExpressionWrapper, fields, Q
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from issues.models import Issue, IssueStatus, StatusType
from users.permissions import IsAdminUser


class IssueCountByStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Get the latest status for each issue
        latest_statuses = {}
        for status in IssueStatus.objects.order_by("issue_id", "-created_at"):
            if status.issue_id not in latest_statuses:
                latest_statuses[status.issue_id] = status.status

        # Count issues by status
        status_counts = {}
        for status in StatusType.values:
            status_counts[status] = list(latest_statuses.values()).count(status)

        return Response(status_counts)


class IssueCountByCategoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        categories = (
            Issue.objects.values("category")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return Response(categories)


class AverageResolutionTimeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Find issues that have been resolved
        resolved_issues = Issue.objects.filter(
            statuses__status=StatusType.RESOLVED
        ).distinct()

        if not resolved_issues.exists():
            return Response({"averageTimeInHours": 0, "totalResolved": 0})

        total_time = timedelta(0)
        count = 0

        for issue in resolved_issues:
            # Get submitted status
            submitted_status = (
                issue.statuses.filter(status=StatusType.SUBMITTED)
                .order_by("created_at")
                .first()
            )
            # Get resolved status
            resolved_status = (
                issue.statuses.filter(status=StatusType.RESOLVED)
                .order_by("created_at")
                .first()
            )

            if submitted_status and resolved_status:
                resolution_time = (
                    resolved_status.created_at - submitted_status.created_at
                )
                total_time += resolution_time
                count += 1

        if count == 0:
            average_time_hours = 0
        else:
            average_time_hours = total_time.total_seconds() / 3600 / count

        return Response(
            {"averageTimeInHours": round(average_time_hours, 1), "totalResolved": count}
        )


class FacultyPerformanceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        from django.contrib.auth import get_user_model

        User = get_user_model()

        # Get all faculty members
        faculty_members = User.objects.filter(role="FACULTY")

        metrics = []

        for faculty in faculty_members:
            # Get assigned issues
            assigned_issues_count = Issue.objects.filter(assigned_to=faculty).count()

            # Get resolved issues
            resolved_issues = Issue.objects.filter(
                assigned_to=faculty, statuses__status=StatusType.RESOLVED
            ).distinct()
            resolved_issues_count = resolved_issues.count()

            # Calculate average resolution time
            total_time = timedelta(0)
            count = 0

            for issue in resolved_issues:
                # Get assigned status
                assigned_status = (
                    issue.statuses.filter(status=StatusType.ASSIGNED)
                    .order_by("created_at")
                    .first()
                )
                # Get resolved status
                resolved_status = (
                    issue.statuses.filter(status=StatusType.RESOLVED)
                    .order_by("created_at")
                    .first()
                )

                if assigned_status and resolved_status:
                    resolution_time = (
                        resolved_status.created_at - assigned_status.created_at
                    )
                    total_time += resolution_time
                    count += 1

            if count == 0:
                average_time_hours = 0
            else:
                average_time_hours = total_time.total_seconds() / 3600 / count

            resolution_rate = 0
            if assigned_issues_count > 0:
                resolution_rate = (resolved_issues_count / assigned_issues_count) * 100

            metrics.append(
                {
                    "faculty": {
                        "id": faculty.id,
                        "name": f"{faculty.first_name} {faculty.last_name}",
                        "email": faculty.email,
                    },
                    "assignedIssues": assigned_issues_count,
                    "resolvedIssues": resolved_issues_count,
                    "resolutionRate": round(resolution_rate, 1),
                    "averageResolutionTimeInHours": round(average_time_hours, 1),
                }
            )

        return Response(metrics)


class IssueTrendsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        period = request.query_params.get("period", "month")

        # Determine start date based on period
        now = timezone.now()
        if period == "week":
            start_date = now - timedelta(days=7)
            truncate_func = TruncDate
        elif period == "month":
            start_date = now - timedelta(days=30)
            truncate_func = TruncDate
        else:  # year
            start_date = now - timedelta(days=365)
            truncate_func = TruncMonth

        # Get created issues by date
        created_issues = (
            Issue.objects.filter(created_at__gte=start_date)
            .annotate(date=truncate_func("created_at"))
            .values("date")
            .annotate(created=Count("id"))
            .order_by("date")
        )

        # Get resolved issues by date
        resolved_issues = (
            IssueStatus.objects.filter(
                status=StatusType.RESOLVED, created_at__gte=start_date
            )
            .annotate(date=truncate_func("created_at"))
            .values("date")
            .annotate(resolved=Count("id"))
            .order_by("date")
        )

        # Combine the data
        date_dict = {}

        for item in created_issues:
            date_str = (
                item["date"].strftime("%Y-%m-%d")
                if isinstance(item["date"], timezone.datetime)
                else str(item["date"])
            )
            if date_str not in date_dict:
                date_dict[date_str] = {"date": date_str, "created": 0, "resolved": 0}
            date_dict[date_str]["created"] = item["created"]

        for item in resolved_issues:
            date_str = (
                item["date"].strftime("%Y-%m-%d")
                if isinstance(item["date"], timezone.datetime)
                else str(item["date"])
            )
            if date_str not in date_dict:
                date_dict[date_str] = {"date": date_str, "created": 0, "resolved": 0}
            date_dict[date_str]["resolved"] = item["resolved"]

        # Convert to list and sort by date
        result = list(date_dict.values())
        result.sort(key=lambda x: x["date"])

        return Response(result)
