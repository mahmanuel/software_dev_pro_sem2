from .models import AuditLog
from django.contrib.contenttypes.models import ContentType


def log_create(user, instance, details=None, request=None):
    """Log a creation action"""
    from .signals import log_action

    return log_action(user, "CREATE", instance, details, request)


def log_update(user, instance, details=None, request=None):
    """Log an update action"""
    from .signals import log_action

    return log_action(user, "UPDATE", instance, details, request)


def log_delete(user, instance, details=None, request=None):
    """Log a deletion action"""
    from .signals import log_action

    return log_action(user, "DELETE", instance, details, request)


def log_assign(user, instance, details=None, request=None):
    """Log an assignment action"""
    from .signals import log_action

    return log_action(user, "ASSIGN", instance, details, request)


def log_status_change(user, instance, details=None, request=None):
    """Log a status change action"""
    from .signals import log_action

    return log_action(user, "STATUS_CHANGE", instance, details, request)


def log_comment(user, instance, details=None, request=None):
    """Log a comment action"""
    from .signals import log_action

    return log_action(user, "COMMENT", instance, details, request)


def log_custom_action(user, action, instance=None, details=None, request=None):
    """Log a custom action"""
    from .signals import log_action

    return log_action(user, action, instance, details, request)
