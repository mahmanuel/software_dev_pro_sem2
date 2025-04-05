from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_email_notification(to_email, subject, template, context):
    """
    Send an email notification using a template.

    Args:
        to_email: Recipient email address
        subject: Email subject
        template: Path to the HTML template
        context: Context data for the template

    Returns:
        Boolean indicating success or failure
    """
    html_message = render_to_string(template, context)
    plain_message = strip_tags(html_message)

    return send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )


# Email templates
def issue_created_email(issue):
    """Send email notification when an issue is created"""
    context = {
        "issue": issue,
        "app_url": settings.FRONTEND_URL,
    }

    # Send to admins
    from django.contrib.auth import get_user_model

    User = get_user_model()
    admins = User.objects.filter(role="ADMIN")

    for admin in admins:
        send_email_notification(
            to_email=admin.email,
            subject=f"New Issue Created: {issue.title}",
            template="emails/issue_created.html",
            context=context,
        )


def issue_assigned_email(issue, faculty):
    """Send email notification when an issue is assigned"""
    context = {
        "issue": issue,
        "faculty": faculty,
        "app_url": settings.FRONTEND_URL,
    }

    send_email_notification(
        to_email=faculty.email,
        subject=f"Issue Assigned: {issue.title}",
        template="emails/issue_assigned.html",
        context=context,
    )


def status_updated_email(issue, status, user):
    """Send email notification when an issue status is updated"""
    context = {
        "issue": issue,
        "status": status,
        "user": user,
        "app_url": settings.FRONTEND_URL,
    }

    # Notify submitter if they didn't make the update
    if issue.submitted_by != user:
        send_email_notification(
            to_email=issue.submitted_by.email,
            subject=f"Issue Status Updated: {issue.title}",
            template="emails/status_updated.html",
            context=context,
        )

    # Notify assigned faculty if they didn't make the update
    if issue.assigned_to and issue.assigned_to != user:
        send_email_notification(
            to_email=issue.assigned_to.email,
            subject=f"Issue Status Updated: {issue.title}",
            template="emails/status_updated.html",
            context=context,
        )


def comment_added_email(comment):
    """Send email notification when a comment is added"""
    issue = comment.issue
    user = comment.user

    context = {
        "issue": issue,
        "comment": comment,
        "user": user,
        "app_url": settings.FRONTEND_URL,
    }

    # Notify submitter if they didn't make the comment
    if issue.submitted_by != user:
        send_email_notification(
            to_email=issue.submitted_by.email,
            subject=f"New Comment on Issue: {issue.title}",
            template="emails/comment_added.html",
            context=context,
        )

    # Notify assigned faculty if they didn't make the comment
    if issue.assigned_to and issue.assigned_to != user:
        send_email_notification(
            to_email=issue.assigned_to.email,
            subject=f"New Comment on Issue: {issue.title}",
            template="emails/comment_added.html",
            context=context,
        )
