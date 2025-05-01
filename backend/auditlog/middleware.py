from django.utils.deprecation import MiddlewareMixin
import threading

# Thread local storage to store request information
_thread_locals = threading.local()


def get_current_request():
    """Return the current request if available"""
    return getattr(_thread_locals, "request", None)


def get_current_user():
    """Return the current user if available"""
    request = get_current_request()
    if request and hasattr(request, "user"):
        return request.user
    return None


class AuditLogMiddleware(MiddlewareMixin):
    """Middleware to capture request information for audit logging"""

    def process_request(self, request):
        _thread_locals.request = request

    def process_response(self, request, response):
        if hasattr(_thread_locals, "request"):
            del _thread_locals.request
        return response
