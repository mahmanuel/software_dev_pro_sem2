from rest_framework.permissions import BasePermission


class IsRegistrar(BasePermission):
    """
    Custom permission to allow only registrars (admins) to assign issues.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsAssignedFaculty(BasePermission):
    """
    Custom permission to allow only the assigned faculty member to resolve issues.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and obj.assigned_to == request.user
