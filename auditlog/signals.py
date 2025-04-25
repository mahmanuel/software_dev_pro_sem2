from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in, user_logged_out
from .models import AuditLog

User = get_user_model()


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def log_action(user, action, instance=None, details=None, request=None):
    """
    Create an audit log entry for the given action
    """
    ip_address = None
    if request:
        ip_address = get_client_ip(request)

    log_entry = AuditLog(
        user=user, action=action, details=details, ip_address=ip_address
    )

    if instance:
        content_type = ContentType.objects.get_for_model(instance)
        log_entry.content_type = content_type
        log_entry.object_id = instance.pk
        log_entry.object_repr = str(instance)
        log_entry.content_type_name = instance.__class__.__name__

    log_entry.save()
    return log_entry


# Signal handlers for login/logout
@receiver(user_logged_in)
def user_logged_in_callback(sender, request, user, **kwargs):
    log_action(user, "LOGIN", request=request)


@receiver(user_logged_out)
def user_logged_out_callback(sender, request, user, **kwargs):
    if user and user.is_authenticated:
        log_action(user, "LOGOUT", request=request)
