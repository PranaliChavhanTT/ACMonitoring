
"""Django signals for account scope validation and customer geography sync.

This module intentionally does NOT create demo Organizations, Customers,
Users, Zones, Circles, Regions, Divisions, Branches, Floors or Sites.
Real Organizations/Customers should be created by the application's normal
provisioning/API flow (for example, the 3TP tenant/customer sync).
"""

import json
import logging
from pathlib import Path

from django.conf import settings
from django.db import connection, transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from rest_framework.exceptions import ValidationError as DRFValidationError

from .models import (
    User,
    Role,
    Site,
    Branch,
    Zone,
    Customer,
    Country,
    State,
    District,
    Taluka,
    City,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# User role/scope validation
# ---------------------------------------------------------------------------

ROLE_KEEP_FIELDS = {
    Role.ORG_SUPER_ADMIN: set(),
    Role.CUSTOMER: {"customer"},
    Role.BR_ADMIN: {"customer", "zone", "circle", "branch"},
    Role.ENGINEER: {"customer", "zone", "circle", "branch", "site"},
}

ROLE_REQUIRED_FIELD = {
    Role.ORG_SUPER_ADMIN: None,
    Role.CUSTOMER: "customer",
    Role.BR_ADMIN: "customer",
    Role.ENGINEER: "customer",
}

ALL_SCOPE_FIELDS = ("customer", "zone", "circle", "branch", "site")


@receiver(pre_save, sender=User)
def validate_user_scope(sender, instance, **kwargs):
    """Validate role scope and derive customer/branch from assigned objects."""
    if not instance.role:
        raise DRFValidationError("User must have a role.")

    if instance.role not in ROLE_KEEP_FIELDS:
        raise DRFValidationError(f"Unknown role: {instance.role}")

    keep = ROLE_KEEP_FIELDS[instance.role]

    # Derive the parent scope from the most specific selected object.
    if "site" in keep and instance.site_id:
        try:
            site = Site.objects.select_related("branch").get(pk=instance.site_id)
        except Site.DoesNotExist:
            raise DRFValidationError("Selected site does not exist.")

        site_customer_id = site.branch.customer_id if site.branch_id else None
        if (
            instance.customer_id
            and site_customer_id
            and instance.customer_id != site_customer_id
        ):
            raise DRFValidationError(
                "Selected site does not belong to this customer."
            )

        if site.branch_id:
            instance.branch_id = site.branch_id
        instance.customer_id = site_customer_id or instance.customer_id

    if "branch" in keep and instance.branch_id and not instance.site_id:
        branch_customer_id = (
            Branch.objects.filter(pk=instance.branch_id)
            .values_list("customer_id", flat=True)
            .first()
        )
        if (
            instance.customer_id
            and branch_customer_id
            and instance.customer_id != branch_customer_id
        ):
            raise DRFValidationError(
                "Selected branch does not belong to this customer."
            )
        instance.customer_id = branch_customer_id or instance.customer_id

    if "zone" in keep and instance.zone_id:
        zone_customer_id = (
            Zone.objects.filter(pk=instance.zone_id)
            .values_list("customer_id", flat=True)
            .first()
        )
        if (
            instance.customer_id
            and zone_customer_id
            and instance.customer_id != zone_customer_id
        ):
            raise DRFValidationError(
                "Selected zone does not belong to this customer."
            )
        instance.customer_id = zone_customer_id or instance.customer_id

    # Some account-creation flows save the user before assigning its scope.
    required_field = ROLE_REQUIRED_FIELD.get(instance.role)
    if required_field and not getattr(instance, "_skip_scope_check", False):
        if not getattr(instance, f"{required_field}_id"):
            raise DRFValidationError(
                f"Role '{instance.role}' requires '{required_field}' to be set."
            )

    # Clear scope fields that are not valid for this role.
    # Organization is deliberately not included here, so an org admin keeps it.
    for field in ALL_SCOPE_FIELDS:
        if field not in keep:
            setattr(instance, f"{field}_id", None)


@receiver(post_save, sender=User)
def set_staff_flag(sender, instance, created, **kwargs):
    """Allow organization/customer administrators into Django admin if needed."""
    if instance.role in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER) and not instance.is_staff:
        # QuerySet.update avoids recursively triggering post_save.
        User.objects.filter(pk=instance.pk).update(is_staff=True)


# ---------------------------------------------------------------------------
# Geographical hierarchy sync
# ---------------------------------------------------------------------------


def get_geographical_json_path():
    return (
        Path(settings.BASE_DIR)
        / "data"
        / "locationData_geographical.json"
    )


@transaction.atomic
def sync_geographical_hierarchy(customer):
    """Import country/state/district/taluka/city data for one customer.

    This function creates geographical reference rows only. It does not
    create Customer or Organization records.
    """
    json_path = get_geographical_json_path()

    if not json_path.exists():
        logger.error("Geographical JSON file not found: %s", json_path)
        return

    try:
        with json_path.open("r", encoding="utf-8") as file:
            tree = json.load(file)
    except (OSError, json.JSONDecodeError):
        logger.exception("Unable to read geographical hierarchy JSON: %s", json_path)
        return

    for country_data in tree:
        country_code = country_data.get("country_id")
        country_name = country_data.get("country_name")
        if not country_code or not country_name:
            continue

        country, _ = Country.objects.get_or_create(
            code=country_code,
            defaults={"name": country_name},
        )

        for state_data in country_data.get("states", []):
            state_code = state_data.get("state_id")
            state_name = state_data.get("state_name")
            if not state_code or not state_name:
                continue

            state, _ = State.objects.update_or_create(
                customer=customer,
                code=state_code,
                defaults={
                    "country": country,
                    "name": state_name,
                    "is_active": True,
                },
            )

            for district_data in state_data.get("districts", []):
                district_code = district_data.get("district_id")
                district_name = district_data.get("district_name")
                if not district_code or not district_name:
                    continue

                district, _ = District.objects.update_or_create(
                    state=state,
                    code=district_code,
                    defaults={
                        "name": district_name,
                        "is_active": True,
                    },
                )

                for taluka_data in district_data.get("talukas", []):
                    taluka_code = taluka_data.get("taluka_id")
                    taluka_name = taluka_data.get("taluka_name")
                    if not taluka_code or not taluka_name:
                        continue

                    taluka, _ = Taluka.objects.update_or_create(
                        district=district,
                        code=taluka_code,
                        defaults={
                            "name": taluka_name,
                            "is_active": True,
                        },
                    )

                    for city_data in taluka_data.get("cities", []):
                        city_code = city_data.get("city_id")
                        city_name = city_data.get("city_name")
                        if not city_code or not city_name:
                            continue

                        City.objects.update_or_create(
                            taluka=taluka,
                            code=city_code,
                            defaults={
                                "name": city_name,
                                "is_active": True,
                            },
                        )

    logger.info(
        "Geographical hierarchy synced for customer %s",
        customer.pk,
    )


@receiver(post_save, sender=Customer)
def customer_geographical_hierarchy_signal(
    sender, instance, created, raw=False, **kwargs
):
    """Sync geography for geographical customers after they are saved.

    Skip fixture loading (raw=True). The sync uses update_or_create, so it is
    repeatable, though it may run on each save of a geographical customer.
    """
    if raw:
        return

    if getattr(instance, "hierarchy", None) != "GEOGRAPHICAL":
        return

    try:
        sync_geographical_hierarchy(instance)
    except Exception:
        # Do not make customer creation fail because optional geography data
        # could not be imported. The error remains visible in application logs.
        logger.exception(
            "Failed to sync geographical hierarchy for customer %s",
            instance.pk,
        )
