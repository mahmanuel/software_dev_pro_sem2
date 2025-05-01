from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import user_logged_in, user_logged_out
from django.utils import timezone

from issues.models import Issue, IssueStatus, Comment
from .models import UserActivity, DashboardStat


@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    """
    Track user login activity.
    """
    UserActivity.objects.create(
        user=user,
        activity_type="LOGIN",
        ip_address=request.META.get("REMOTE_ADDR"),
        user_agent=request.META.get("HTTP_USER_AGENT"),
    )


@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    """
    Track user logout activity.
    """
    if user:
        UserActivity.objects.create(
            user=user,
            activity_type="LOGOUT",
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT"),
        )


@receiver(post_save, sender=Issue)
def issue_saved_handler(sender, instance, created, **kwargs):
    """
    Track issue creation and updates.
    """
    # Invalidate dashboard stats cache
    try:
        dashboard_stats = DashboardStat.objects.get(key="dashboard_stats")
        dashboard_stats.delete()
    except DashboardStat.DoesNotExist:
        pass

    if created:
        # Track issue creation
        UserActivity.objects.create(
            user=instance.submitted_by,
            activity_type="ISSUE_CREATE",
            related_issue=instance,
            additional_data={
                "title": instance.title,
                "category": instance.category,
                "priority": instance.priority,
            },
        )
    else:
        # Track issue update
        UserActivity.objects.create(
            user=instance.submitted_by,
            activity_type="ISSUE_UPDATE",
            related_issue=instance,
            additional_data={
                "title": instance.title,
                "category": instance.category,
                "priority": instance.priority,
                "status": instance.current_status,
            },
        )


@receiver(post_save, sender=IssueStatus)
def issue_status_saved_handler(sender, instance, created, **kwargs):
    """
    Track issue status changes.
    """
    if created:
        UserActivity.objects.create(
            user=instance.updated_by,
            activity_type="STATUS_CHANGE",
            related_issue=instance.issue,
            additional_data={"status": instance.status, "notes": instance.notes},
        )


@receiver(post_save, sender=Comment)
def comment_saved_handler(sender, instance, created, **kwargs):
    """
    Track comment creation.
    """
    if created:
        UserActivity.objects.create(
            user=instance.user,
            activity_type="COMMENT_ADD",
            related_issue=instance.issue,
            additional_data={
                "content": instance.content[:100]
                + ("..." if len(instance.content) > 100 else "")
            },
        )
