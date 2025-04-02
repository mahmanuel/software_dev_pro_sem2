from django.urls import path
from .views import (
    IssueCountByStatusView,
    IssueCountByCategoryView,
    AverageResolutionTimeView,
    FacultyPerformanceView,
    IssueTrendsView,
)

urlpatterns = [
    path(
        "issue-count-by-status/",
        IssueCountByStatusView.as_view(),
        name="issue-count-by-status",
    ),
    path(
        "issue-count-by-category/",
        IssueCountByCategoryView.as_view(),
        name="issue-count-by-category",
    ),
    path(
        "average-resolution-time/",
        AverageResolutionTimeView.as_view(),
        name="average-resolution-time",
    ),
    path(
        "faculty-performance/",
        FacultyPerformanceView.as_view(),
        name="faculty-performance",
    ),
    path("issue-trends/", IssueTrendsView.as_view(), name="issue-trends"),
]
