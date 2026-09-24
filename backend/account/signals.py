# account/signals.py
from django.db import connection
from django.db.models.signals import post_save, pre_save, post_migrate
from django.dispatch import receiver
from django.core.exceptions import ValidationError

from .models import (
    User, Role, Organization, Customer, HierarchyType,
    Zone, Circle, Region, Division, Branch, Floor, Site, LoginAudit,
)

from rest_framework.exceptions import ValidationError as DRFValidationError

DEMO_PASSWORD = "Admin@123"

ROLE_SCOPE_FIELD = {
    Role.ORG_SUPER_ADMIN:"organization",
    Role.CUSTOMER: "customer",
    Role.BR_ADMIN: "branch",
    Role.ENGINEER: "site",
}


@receiver(pre_save, sender=User)
def validate_user_scope(sender, instance, **kwargs):
    if not instance.role:
        raise DRFValidationError("User must have a role.")

    required_field = ROLE_SCOPE_FIELD.get(instance.role)
    if not required_field:
        raise DRFValidationError(f"Unknown role: {instance.role}")

    # Pending-create flow — skip scope validation, clear downstream scopes.
    if getattr(instance, "_skip_scope_check", False):
        for f in ["customer", "zone", "circle", "branch", "site"]:
            setattr(instance, f"{f}_id", None)
        return

    if instance.role != Role.ORG_SUPER_ADMIN:
        if not getattr(instance, f"{required_field}_id"):
            raise DRFValidationError(
                f"Role '{instance.role}' requires '{required_field}' to be set."
            )

    # Clear unrelated DOWNSTREAM scopes — never organization.
    for f in ["customer", "zone", "circle", "branch", "site"]:
        if f != required_field:
            setattr(instance, f"{f}_id", None)

@receiver(post_save, sender=User)
def set_staff_flag(sender, instance, created, **kwargs):
    if instance.role in [Role.ORG_SUPER_ADMIN, Role.CUSTOMER]:
        if not instance.is_staff:
            User.objects.filter(pk=instance.pk).update(is_staff=True)


def _table_ready(model) -> bool:
    return model._meta.db_table in connection.introspection.table_names()


@receiver(post_migrate)
def seed_demo_data(sender, **kwargs):
    if sender.name != "account":
        return
    if not all(
        _table_ready(m)
        for m in (Organization, Customer, User, Zone, Circle, Region, Division, Branch, Site)
    ):
        return

    try:
        org, _ = Organization.objects.get_or_create(
            code="DEMO-ORG",
            defaults={"name": "Demo Organization", "is_active": True},
        )

        customer, _ = Customer.objects.get_or_create(
            organization=org,
            code="CUST-01",
            defaults={
                "company": "TowerLink Infra",
                "company_email": "contact@towerlink.com",
                "contact_person": "Demo Contact",
                "contact_person_email": "contact@towerlink.com",
                "phone": "+91-9123456789",
                "hierarchy_type": HierarchyType.ZONAL,
                "is_active": True,
            },
        )

        zone, _ = Zone.objects.get_or_create(
            code="ZONE-NORTH",
            defaults={"customer": customer, "name": "North Zone"},
        )

        circle, _ = Circle.objects.get_or_create(
            code="CIR-DELHI",
            defaults={"zone": zone, "name": "Delhi Circle"},
        )

        region, _ = Region.objects.get_or_create(
            code="REG-DELHI-C",
            defaults={"circle": circle, "name": "Delhi Central Region"},
        )

        division, _ = Division.objects.get_or_create(
            code="DIV-KB",
            defaults={"region": region, "name": "Karol Bagh Division"},
        )

        branch, _ = Branch.objects.get_or_create(
            code="BR-101",
            defaults={"customer": customer, "division": division, "name": "Karol Bagh Branch"},
        )

        floor, _ = Floor.objects.get_or_create(
            code="BR-101-F1",
            defaults={"branch": branch, "name": "Floor 1"},
        )

        # Direct-under-branch AC (no floor)
        site, _ = Site.objects.get_or_create(
            code="SITE-9001",
            defaults={
                "branch": branch,
                "floor": None,
                "name": "SITE-9001",
                "address": "Rooftop, Karol Bagh, New Delhi",
                "latitude": 28.6519,
                "longitude": 77.1909,
            },
        )

        # AC under a specific floor
        Site.objects.get_or_create(
            code="SITE-9002",
            defaults={
                "branch": branch,
                "floor": floor,
                "name": "SITE-9002",
                "address": "Floor 1, Karol Bagh, New Delhi",
                "latitude": 28.6519,
                "longitude": 77.1909,
            },
        )

        users = [
            dict(
                email="superadmin@org.com",
                name="Ravi Menon",
                role=Role.ORG_SUPER_ADMIN,
                organization=org,
                is_staff=True,
                is_superuser=True,
            ),
            dict(
                email="custadmin@customer.com",
                name="Priya Sharma",
                role=Role.CUSTOMER,
                customer=customer,
            ),
            dict(
                email="branch@customer.com",
                name="Mohit Raj",
                role=Role.BR_ADMIN,
                branch=branch,
            ),
            dict(
                email="engineer@customer.com",
                name="Kiran Das",
                role=Role.ENGINEER,
                site=site,
            ),
        ]

        for data in users:
            email = data.pop("email")
            user, created = User.objects.get_or_create(email=email, defaults=data)

            # Always (re)apply scope + password
            for k, v in data.items():
                setattr(user, k, v)
            user.set_password(DEMO_PASSWORD)
            user.save()

            # print(f"[seed] {'Created' if created else 'Refreshed'} user: {email} ({user.role})")

        # print("[seed] Demo hierarchy + users ready.")
        # print(f"[seed] All demo users share password: {DEMO_PASSWORD}")

    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("seed_demo_data skipped: %s", exc)
    