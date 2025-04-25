from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_admin


class IsFacultyUser(permissions.BasePermission):
    """
    Allows access only to faculty users.
    """

    def has_permission(self, request, view):
        return request.user and (request.user.is_faculty or request.user.is_admin)


class IsSelfOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow users to edit their own profile
    or admins to edit any profile.
    """

    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.user.is_admin


class IsOwnerOrStaffOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Faculty can view all issues assigned to them.
    Admins can view and edit all issues.
    """

    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.is_admin:
            return True

        # Check if the object has a submitted_by attribute
        if hasattr(obj, "submitted_by"):
            # Owner can view and edit
            if obj.submitted_by == request.user:
                return True

            # Faculty can view if assigned to them
            if (
                hasattr(obj, "assigned_to")
                and obj.assigned_to == request.user
                and request.method in permissions.SAFE_METHODS
            ):
                return True

        return False
