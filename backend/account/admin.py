# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    User, Organization, Customer, Zone, Circle, Branch, Site, LoginAudit,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ("email", "name", "role", "scope_name", "is_active", "is_staff")
    list_filter   = ("role", "is_active", "is_staff")
    search_fields = ("email", "name")
    ordering      = ("name",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("name", "phone")}),
        ("Role & Scope", {
            "fields": (
                "role",
                "organization", "customer", "zone", "circle", "branch", "site",
            )
        }),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined", "last_login_ip")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "name", "password1", "password2",
                "role", "organization", "customer", "zone",
                "circle", "branch", "site",
                "is_active", "is_staff",
            ),
        }),
    )


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display  = ("name", "code", "is_active")
    list_filter   = ("is_active",)
    search_fields = ("name", "code")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    # was ("name", ...) — model field is `company`, not `name`
    list_display   = ("company", "code", "organization", "is_active")
    list_filter    = ("organization", "is_active")
    search_fields  = ("company", "code", "company_email",
                      "contact_person", "contact_person_email", "phone")
    readonly_fields = ("created_at", "updated_at")


# @admin.register(Zone)
# class ZoneAdmin(admin.ModelAdmin):
#     list_display = ("name", "code", "customer", "is_active")
#     list_filter = ("customer", "is_active")


# @admin.register(Circle)
# class CircleAdmin(admin.ModelAdmin):
#     list_display = ("name", "code", "zone", "is_active")
#     list_filter = ("zone", "is_active")


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display  = ("name", "code", "circle", "is_active")
    list_filter   = ("circle", "is_active")

# @admin.register(Branch)
# class BranchAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "customer",
        "city",
        "division",
        "is_active",
    )

    list_filter = (
        "is_active",
        "customer",
    )

    search_fields = (
        "name",
        "code",
        "customer__company",
        "city__name",
        "division__name",
    )


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display  = ("name", "code", "branch", "is_active")
    list_filter   = ("branch", "is_active")


@admin.register(LoginAudit)
class LoginAuditAdmin(admin.ModelAdmin):
    list_display    = ("email_attempted", "role_attempted", "success", "ip_address", "created_at")
    list_filter     = ("success", "role_attempted")
    readonly_fields = [f.name for f in LoginAudit._meta.fields]
    