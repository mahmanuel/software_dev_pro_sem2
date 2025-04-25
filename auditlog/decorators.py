from functools import wraps
from .services import log_custom_action
from .middleware import get_current_request


def log_view_action(action, get_instance=None, get_details=None):
    """
    Decorator to log actions performed in views

    Parameters:
    - action: The action to log (e.g., 'CREATE', 'UPDATE')
    - get_instance: A function that takes the view, request, *args, **kwargs and returns the instance to log
    - get_details: A function that takes the view, request, *args, **kwargs and returns details to log
    """

    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(view, request, *args, **kwargs):
            response = view_func(view, request, *args, **kwargs)

            # Only log if the request was successful
            if hasattr(response, "status_code") and 200 <= response.status_code < 300:
                user = request.user if request.user.is_authenticated else None

                instance = None
                if get_instance:
                    instance = get_instance(view, request, *args, **kwargs)

                details = None
                if get_details:
                    details = get_details(view, request, *args, **kwargs)

                log_custom_action(user, action, instance, details, request)

            return response

        return wrapped_view

    return decorator
