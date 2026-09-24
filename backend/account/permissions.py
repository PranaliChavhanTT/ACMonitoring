# from rest_framework.permissions import BasePermission, SAFE_METHODS

# from .models import Customer, Role


# class IsOrgSuperAdmin(BasePermission):
#     message = "Only organization admins can modify customers."

#     def has_permission(self, request, view):
#         if request.method in SAFE_METHODS:
#             return True
#         return bool(
#             request.user
#             and request.user.is_authenticated
#             and request.user.role == Role.ORG_SUPER_ADMIN
#         )

# class IsOrgAdminOrCustomerAdmin(BasePermission):
#     message = "Only organization admins and customer admins can modify admins."

#     def has_permission(self, request, view):
#         if request.method in SAFE_METHODS:
#             return bool(request.user and request.user.is_authenticated)

#         user = request.user
#         if not user or not user.is_authenticated:
#             return False

#         return user.role in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER)

# class CustomerScopeMixin:
#     def get_queryset(self):
#         user = self.request.user
#         base = Customer.objects.select_related("organization")

#         if user.role == Role.ORG_SUPER_ADMIN:
#             return base.filter(organization_id=user.organization_id)
#         if user.customer_id:
#             return base.filter(pk=user.customer_id)
#         return base.none()


from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Customer, Role


# ============================================================
# ROLE SETS
# ============================================================

ORG_ROLES = {Role.ORG_SUPER_ADMIN}

CUSTOMER_ADMIN_ROLES = {
    Role.ORG_SUPER_ADMIN,
    Role.CUSTOMER,
}

BRANCH_ADMIN_ROLES = {
    Role.ORG_SUPER_ADMIN,
    Role.CUSTOMER,
    Role.BR_ADMIN,
}


# ============================================================
# BASE HELPERS
# ============================================================

def _authed(user):
    return bool(user and user.is_authenticated)


def _has_role(user, roles):
    return _authed(user) and user.role in roles


# ============================================================
# CUSTOMERS
#
#   Only ORG_SUPER_ADMIN can create / update / delete customers.
#   Any authenticated user can read within their scope.
# ============================================================

class IsOrgSuperAdmin(BasePermission):
    message = "Only organization admins can modify customers."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return _authed(request.user)
        return _has_role(request.user, ORG_ROLES)


class CustomerScopeMixin:
    """
    Scope Customer querysets by role:

      ORG_SUPER_ADMIN -> all customers in the org
      CUSTOMER      -> only their own customer
      BR_ADMIN        -> only their own customer (read-only via IsOrgSuperAdmin)
      ENGINEER        -> only their own customer (read-only via IsOrgSuperAdmin)
    """

    def get_queryset(self):
        user = self.request.user
        base = Customer.objects.select_related("organization")

        if not _authed(user):
            return base.none()

        if user.role == Role.ORG_SUPER_ADMIN:
            return base.filter(organization_id=user.organization_id)

        if user.role in (Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER):
            if not user.customer_id:
                return base.none()
            return base.filter(pk=user.customer_id)

        return base.none()


# ============================================================
# ADMINS / ENGINEERS
#
#   ORG_SUPER_ADMIN + CUSTOMER can create / update / delete.
#   BR_ADMIN + ENGINEER can only read, and only within their scope.
# ============================================================

class IsOrgAdminOrCustomerAdmin(BasePermission):
    message = "Only organization admins and customer admins can modify admins."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return _authed(request.user)
        return _has_role(request.user, CUSTOMER_ADMIN_ROLES)


class IsOrgAdminOrCustomerOrBranchAdmin(BasePermission):
    """
    Use this if BR_ADMIN should also be able to write.
    For now it's an alias — switch the view to it if the
    requirement changes.
    """

    message = "Only organization, customer, and branch admins can modify this."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return _authed(request.user)
        return _has_role(request.user, BRANCH_ADMIN_ROLES)


# ============================================================
# SCOPE MIXIN FOR USERS (ADMINS + ENGINEERS)
# ============================================================

class UserScopeMixin:
    """
    Scope any User queryset by role:

      ORG_SUPER_ADMIN -> all users in the org
      CUSTOMER      -> all users under their customer
      BR_ADMIN        -> only users in their own branch
      ENGINEER        -> only themselves
    """

    def get_queryset(self):
        user = self.request.user
        base = self._get_base_queryset()

        if not _authed(user):
            return base.none()

        if user.role == Role.ORG_SUPER_ADMIN:
            return base.filter(organization_id=user.organization_id)

        if user.role == Role.CUSTOMER:
            if not user.customer_id:
                return base.none()
            return base.filter(customer_id=user.customer_id)

        if user.role == Role.BR_ADMIN:
            if not user.branch_id:
                return base.none()
            return base.filter(branch_id=user.branch_id)

        if user.role == Role.ENGINEER:
            return base.filter(pk=user.pk)

        return base.none()

    def _get_base_queryset(self):
        from .models import User
        return User.objects.select_related(
            "organization", "customer", "zone", "circle", "branch", "site"
        )