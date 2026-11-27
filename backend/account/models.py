from django.db import models

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid

from jsonschema import ValidationError
from django.core.exceptions import ValidationError

class ACData(models.Model):
    timestamp = models.DateTimeField()
    ac_id = models.CharField(max_length=50)
    indoor_temperature = models.FloatField()
    outdoor_temperature = models.FloatField()
    indoor_humidity = models.FloatField()
    outdoor_humidity = models.FloatField()
    voltage = models.FloatField()
    current = models.FloatField()

    def __str__(self):
        return f"{self.ac_id} - {self.timestamp}"


class Role(models.TextChoices):
    ORG_SUPER_ADMIN = "ORG_SUPER_ADMIN", "Organization (Super Admin)"
    CUSTOMER = "CUSTOMER", "Customer"
    BR_ADMIN = "BR_ADMIN", "Branch Admin"
    ENGINEER = "ENGINEER", "Engineer"


class HierarchyType(models.TextChoices):
    GEOGRAPHICAL = "GEOGRAPHICAL", "Geographical (State → District → Taluka → City → Branch)"
    ZONAL = "ZONAL", "Zonal (customer-configurable Zone → Circle → Region → Division → Branch)"


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    # 3TP tenant mapping
    tpt_tenant_id = models.CharField(max_length=100, unique=True, null=True, blank=True, db_index=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "organizations"
        ordering = ["name"]

    def __str__(self):
        return self.name


def default_zonal_hierarchy_config():
    """Default customer-specific structure with optional admin levels and physical locations."""
    return {
        "version": 1,
        "levels": ["zone", "circle", "branch", "building", "floor", "room"],
        "labels": {
            "zone": "Zone", "circle": "Circle", "region": "Region",
            "division": "Division", "branch": "Branch",
            "building": "Building", "floor": "Floor", "room": "Room",
        },
    }


def build_zonal_geographical_mapping(levels):
    """Derive geographical classifications for the customer's ordered Zonal levels.

    Rules agreed for this application:
    - 2 levels: State, City
    - 3 levels: State, District, City
    - 4 levels: State, District, Taluka, City
    - 5+ levels: map the first four levels to State/District/Taluka/City;
      remaining organizational levels have no geographical classification.
    Physical levels (building/floor/room) are never geographical levels.
    """
    organizational = [
        level for level in (levels or [])
        if level in ("zone", "circle", "region", "division", "branch")
    ]
    geography = ["STATE", "DISTRICT", "TALUKA", "CITY"]
    count = len(organizational)

    if count <= 0:
        return {}
    if count == 1:
        assigned = ["STATE"]
    elif count == 2:
        assigned = ["STATE", "CITY"]
    elif count == 3:
        assigned = ["STATE", "DISTRICT", "CITY"]
    else:
        assigned = geography[:min(count, 4)]

    mapping = {level: None for level in organizational}
    for level, geo_type in zip(organizational, assigned):
        mapping[level] = geo_type
    return mapping


def validate_zonal_hierarchy_config(config):
    """Validate an ordered subset of the canonical zonal hierarchy.

    Administrative levels are selected from Zone -> Circle -> Region ->
    Division -> Branch. Circle and Region may both be present; Division
    requires Region. Physical levels are Branch -> [Building] -> Floor ->
    [Room], or Branch -> Floor -> [Room].
    """
    if not isinstance(config, dict):
        raise ValidationError({"zonal_hierarchy_config": "Hierarchy configuration must be an object."})

    levels = config.get("levels")
    if not isinstance(levels, list) or not all(isinstance(x, str) for x in levels):
        raise ValidationError({"zonal_hierarchy_config": "levels must be an ordered list of hierarchy levels."})

    canonical = ["zone", "circle", "region", "division", "branch", "building", "floor", "room"]
    if len(levels) != len(set(levels)) or any(level not in canonical for level in levels):
        raise ValidationError({"zonal_hierarchy_config": "Hierarchy levels must be valid and cannot be repeated."})

    if not levels or levels[0] != "zone" or "branch" not in levels:
        raise ValidationError({"zonal_hierarchy_config": "Zone must be first and Branch is required."})

    branch_index = levels.index("branch")
    administrative = levels[: branch_index + 1]
    if administrative[-1] != "branch" or any(level not in canonical[:5] for level in administrative):
        raise ValidationError({"zonal_hierarchy_config": "Administrative levels must end at Branch."})
    if administrative != [level for level in canonical[:5] if level in administrative]:
        raise ValidationError({"zonal_hierarchy_config": "Administrative levels must preserve Zone → Circle → Region → Division → Branch order."})
    if "division" in administrative and "region" not in administrative:
        raise ValidationError({"zonal_hierarchy_config": "Division requires Region."})

    physical = levels[branch_index + 1 :]
    valid_physical = (["floor"], ["floor", "room"], ["building", "floor"], ["building", "floor", "room"])
    if physical not in valid_physical:
        raise ValidationError({"zonal_hierarchy_config": "After Branch choose Floor directly, or Building → Floor; Room is optional after Floor."})

    # Customer-specific display labels; internal level keys remain canonical.
    labels = config.get("labels", {})
    if not isinstance(labels, dict):
        raise ValidationError({"zonal_hierarchy_config": "labels must be an object keyed by hierarchy level."})
    allowed_labels = set(canonical)
    if any(key not in allowed_labels for key in labels):
        raise ValidationError({"zonal_hierarchy_config": "labels contains an unknown hierarchy level."})
    for key, value in labels.items():
        if not isinstance(value, str) or not value.strip() or len(value.strip()) > 60:
            raise ValidationError({"zonal_hierarchy_config": f"The display name for {key} must contain 1–60 characters."})

    # The geographical mapping is derived from the customer's ordered
    # organizational levels. Reject stale or manually incompatible mappings.
    supplied_mapping = config.get("geographical_mapping")
    if supplied_mapping is not None:
        if not isinstance(supplied_mapping, dict):
            raise ValidationError({"zonal_hierarchy_config": "geographical_mapping must be an object."})
        expected_mapping = build_zonal_geographical_mapping(levels)
        normalized_mapping = {
            str(key): (str(value).upper() if value not in (None, "") else None)
            for key, value in supplied_mapping.items()
        }
        if normalized_mapping != expected_mapping:
            raise ValidationError({
                "zonal_hierarchy_config": (
                    "Geographical mapping does not match the selected Zonal levels. "
                    "Refresh the mapping using the current customer hierarchy."
                )
            })
    return True


class Customer(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="customers")

    # 3TP mapping
    tpt_customer_id = models.CharField(max_length=100, null=True, blank=True, unique=True)

    company = models.CharField(max_length=255, help_text="Bank name")
    code = models.CharField(max_length=50, help_text="Unique bank code within the organization")
    bank_short_name = models.CharField(max_length=50, blank=True, default="")

    BANK_TYPE_CHOICES = [
        ("PUBLIC_SECTOR", "Public Sector Bank"),
        ("PRIVATE_SECTOR", "Private Sector Bank"),
    ]
    bank_type = models.CharField(max_length=30, choices=BANK_TYPE_CHOICES, blank=True, default="")

    company_email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    website = models.CharField(max_length=255, blank=True, default="")
    gstin = models.CharField(max_length=15, blank=True, default="")
    pan = models.CharField(max_length=10, blank=True, default="")
    registration_number = models.CharField(max_length=100, blank=True, default="")

    # Head office
    address_line_1 = models.CharField(max_length=255, blank=True, default="")
    # address_line_2 = models.CharField(max_length=255, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    district = models.CharField(max_length=100, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    pincode = models.CharField(max_length=6, blank=True, default="")
    # Primary bank admin
    contact_person = models.CharField(max_length=255, blank=True)
    contact_person_email = models.EmailField(blank=True)
    # admin_designation = models.CharField(max_length=150, blank=True, default="")
    # admin_mobile = models.CharField(max_length=30, blank=True, default="")

    # Customer-specific Zonal path. Geographical hierarchy deliberately ignores
    # this field and always uses the fixed geographical structure.
    zonal_hierarchy_config = models.JSONField(
        default=default_zonal_hierarchy_config,
        blank=True,
        help_text="Ordered customer-specific zonal levels; Geographical customers do not use this setting.",
    )

    hierarchy_type = models.CharField(
        max_length=20,
        choices=HierarchyType.choices,
        blank=False,
        null=False,
        help_text=(
            "Required: Geographical or Zonal. "
            "Cannot be changed once branches have been created."
        ),
    )

    head_office_state = models.ForeignKey(
        "State",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="head_office_state_customers",
    )

    head_office_district = models.ForeignKey(
        "District",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="head_office_district_customers",
    )

    head_office_city = models.ForeignKey(
        "City",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="head_office_customers",
    )
    
    head_office_division = models.ForeignKey(
        "Division",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="head_office_customers",
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("organization", "code")
        ordering = ["company"]

    def __str__(self):
        return f"{self.company} ({self.code})"

    def clean(self):
        super().clean()

        if not self.hierarchy_type:
            raise ValidationError({
                "hierarchy_type": "Select Geographical or Zonal."
            })

        valid_hierarchies = {
            value for value, _label in HierarchyType.choices
        }

        if self.hierarchy_type not in valid_hierarchies:
            raise ValidationError({
                "hierarchy_type": "Invalid hierarchy type."
            })

        if self.hierarchy_type == HierarchyType.ZONAL:
            validate_zonal_hierarchy_config(self.zonal_hierarchy_config)
        elif self.hierarchy_type == HierarchyType.GEOGRAPHICAL:
            # Keep the zonal definition inert for geographical customers.
            self.zonal_hierarchy_config = default_zonal_hierarchy_config()

        if self.pk and Branch.objects.filter(customer_id=self.pk).exists():
            original_hierarchy = (
                Customer.objects
                .filter(pk=self.pk)
                .values_list("hierarchy_type", flat=True)
                .first()
            )

            if original_hierarchy != self.hierarchy_type:
                raise ValidationError({
                    "hierarchy_type": (
                        "Hierarchy cannot be changed once branches "
                        "have been created for this customer."
                    )
                })

class Country(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=3, unique=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Countries"

    def __str__(self):
        return self.name


class Zone(models.Model):
    ZONE_TYPE_CHOICES = [
        ("GEOGRAPHICAL", "Geographical Zone"),
        ("STATE_BASED", "State-based Zone"),
        ("CITY_BASED", "City-based Zone"),
        ("BUSINESS", "Business Zone"),
        ("ADMINISTRATIVE", "Administrative Zone"),
        ("FUNCTIONAL", "Functional Zone"),
    ]
    GEOGRAPHY_MODE_CHOICES = [
        ("STATE", "State-wise"),
        ("CITY", "City-wise"),
    ]
    zone_type = models.CharField(max_length=20, choices=ZONE_TYPE_CHOICES, null=True, blank=True)
    # Internal level keys use the existing relational models. Display labels are customer-editable.
    hierarchy_config = models.JSONField(default=dict, blank=True)
    # Optional geographical classification used when branches are directly
    # organized under this Zone. It is independent of the administrative tree.
    geography_mode = models.CharField(
        max_length=10,
        choices=GEOGRAPHY_MODE_CHOICES,
        null=True,
        blank=True,
        default=None,
    )
    country = models.ForeignKey(
        "account.Country",
        on_delete=models.PROTECT,
        related_name="zones",
        null=True,
        blank=True,
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="zones")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "zones"
        unique_together = ("customer", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Circle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name="circles")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "circles"
        unique_together = ("zone", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Region(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Legacy Circle -> Region and new direct Zone -> Region are both supported.
    circle = models.ForeignKey(Circle, on_delete=models.CASCADE, related_name="regions", null=True, blank=True)
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name="regions", null=True, blank=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "regions"
        unique_together = ("circle", "name")
        ordering = ["name"]
        constraints = [
            models.CheckConstraint(
                condition=(models.Q(circle__isnull=False, zone__isnull=True) | models.Q(circle__isnull=True, zone__isnull=False)),
                name="region_has_one_parent",
            ),
        ]

    def __str__(self):
        return self.name


class Division(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name="divisions")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "divisions"
        unique_together = ("region", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class State(models.Model):
    country = models.ForeignKey(
        "account.Country",
        on_delete=models.PROTECT,
        related_name="states",
        null=True,
        blank=True,
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="states")
    name = models.CharField(max_length=255)
    # code = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "states"
        unique_together = (
            ("customer", "name"),
            ("customer", "code"),
        )
        ordering = ["name"]

    def __str__(self):
        return self.name


class District(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name="districts")
    name = models.CharField(max_length=255)
    # code = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
            db_table = "districts"
            unique_together = (
                ("state", "name"),
                ("state", "code"),
            )
            ordering = ["name"]

    def __str__(self):
        return self.name


# class Taluka(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     district = models.ForeignKey(District, on_delete=models.CASCADE, related_name="talukas")
#     name = models.CharField(max_length=255)
#     code = models.CharField(max_length=50, unique=True)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "talukas"
#         unique_together = ("district", "name")
#         ordering = ["name"]

#     def __str__(self):
#         return self.name

class Taluka(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name="talukas"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)  # Removed unique=True
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "talukas"
        unique_together = (
            ("district", "name"),
            ("district", "code"),
        )
        ordering = ["name"]

    def __str__(self):
        return self.name

# class City(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     taluka = models.ForeignKey(Taluka, on_delete=models.CASCADE, related_name="cities")
#     name = models.CharField(max_length=255)
#     code = models.CharField(max_length=50, unique=True)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "cities"
#         unique_together = ("taluka", "name")
#         ordering = ["name"]

#     def __str__(self):
#         return self.name

class City(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    taluka = models.ForeignKey(
        Taluka,
        on_delete=models.CASCADE,
        related_name="cities"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)  # Removed unique=True
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cities"
        unique_together = (
            ("taluka", "name"),
            ("taluka", "code"),
        )
        ordering = ["name"]

    def __str__(self):
        return self.name

class Branch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Optional link to the generic organisational tree. Legacy parent fields remain active during migration.
    org_unit = models.ForeignKey("OrgUnit", on_delete=models.SET_NULL, null=True, blank=True, related_name="branches")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="branches", null=True, blank=True)
    
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="branches", null=True, blank=True)
    # New direct geographical parent: a branch can be attached to a Taluka
    # without requiring a City node. Existing city-linked branches are retained.
    taluka = models.ForeignKey(Taluka, on_delete=models.CASCADE, related_name="branches", null=True, blank=True)
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name="branches", null=True, blank=True)
    circle = models.ForeignKey(Circle, on_delete=models.CASCADE, related_name="branches", null=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name="branches", null=True, blank=True)
    # Direct Zone parent is allowed when the customer skips Circle/Region/Division.
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name="branches", null=True, blank=True)

    # For Zonal customers whose Branch is directly under a Zone, keep the
    # actual geographical location separately from the organizational parent.
    geographic_state = models.ForeignKey(
        State, on_delete=models.PROTECT, related_name="zonal_branches",
        null=True, blank=True,
    )
    geographic_city = models.ForeignKey(
        City, on_delete=models.PROTECT, related_name="zonal_branches",
        null=True, blank=True,
    )

    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, default="")
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True
    )
    pincode = models.CharField(
        max_length=6,
        blank=True,
        default=""
    )
    ifsc_code = models.CharField(
        max_length=11,
        blank=True,
        default="",
        db_index=True,
    )

    # 3TP represents each local Branch as an ASSET.
    tpt_asset_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    tpt_sync_status = models.CharField(max_length=20, default="PENDING")
    tpt_sync_error = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "branches"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["city", "name"], name="unique_branch_per_city"),
            models.UniqueConstraint(fields=["division", "name"], name="unique_branch_per_division"),
            models.UniqueConstraint(fields=["taluka", "name"], name="unique_branch_per_taluka"),
            models.UniqueConstraint(fields=["circle", "name"], name="unique_branch_per_circle"),
            models.UniqueConstraint(fields=["region", "name"], name="unique_branch_per_region"),
            models.UniqueConstraint(fields=["zone", "name"], name="unique_branch_per_zone"),
            models.CheckConstraint(
                condition=(
                    models.Q(city__isnull=False, taluka__isnull=True, division__isnull=True, circle__isnull=True, region__isnull=True, zone__isnull=True)
                    | models.Q(city__isnull=True, taluka__isnull=False, division__isnull=True, circle__isnull=True, region__isnull=True, zone__isnull=True)
                    | models.Q(city__isnull=True, taluka__isnull=True, division__isnull=False, circle__isnull=True, region__isnull=True, zone__isnull=True)
                    | models.Q(city__isnull=True, taluka__isnull=True, division__isnull=True, circle__isnull=False, region__isnull=True, zone__isnull=True)
                    | models.Q(city__isnull=True, taluka__isnull=True, division__isnull=True, circle__isnull=True, region__isnull=False, zone__isnull=True)
                    | models.Q(city__isnull=True, taluka__isnull=True, division__isnull=True, circle__isnull=True, region__isnull=True, zone__isnull=False)
                ),
                name="branch_has_exactly_one_parent",
            ),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.customer_id:
            raise ValidationError("A branch must belong to a customer.")

        # Generic organisational links are optional and are only valid for
        # ZONAL customers. They never replace the existing geographical parent.
        if self.org_unit_id:
            if self.customer.hierarchy_type != HierarchyType.ZONAL:
                raise ValidationError({"org_unit": "Geographical customers cannot use organisational hierarchy links."})
            if self.org_unit.customer_id != self.customer_id:
                raise ValidationError({"org_unit": "The organisational unit must belong to the same customer."})
            if self.org_unit.unit_type.code != "BO":
                raise ValidationError({"org_unit": "A Branch can only link to an organisational unit of type BO."})

        ht = self.customer.hierarchy_type if self.customer_id else None
        if ht == HierarchyType.GEOGRAPHICAL and not (self.city_id or self.taluka_id):
            raise ValidationError("This customer follows the Geographical hierarchy: select a Taluka or City.")
        if ht == HierarchyType.ZONAL:
            related_zone = self.zone if self.zone_id else None
            if not related_zone and self.circle_id:
                related_zone = self.circle.zone
            if not related_zone and self.region_id:
                related_zone = self.region.zone if self.region.zone_id else self.region.circle.zone
            if not related_zone and self.division_id:
                region = self.division.region
                related_zone = region.zone if region.zone_id else region.circle.zone
            zone_config = related_zone.hierarchy_config if related_zone and related_zone.hierarchy_config else self.customer.zonal_hierarchy_config
            levels = (zone_config or default_zonal_hierarchy_config()).get("levels", [])
            branch_index = levels.index("branch") if "branch" in levels else -1
            expected = levels[branch_index - 1] if branch_index > 0 else None
            parent_ids = {
                "zone": self.zone_id,
                "circle": self.circle_id,
                "region": self.region_id,
                "division": self.division_id,
            }
            if expected not in parent_ids or not parent_ids[expected]:
                raise ValidationError(
                    f"This customer requires {str(expected or 'a configured level').title()} as the direct Branch parent."
                )
            if any(value for key, value in parent_ids.items() if key != expected):
                raise ValidationError("Branch parent does not match this customer's configured zonal hierarchy.")
            if self.city_id or self.taluka_id:
                raise ValidationError("Zonal branches cannot use Geographical parents.")

            if expected == "zone" and self.zone.customer_id != self.customer_id:
                raise ValidationError("The selected Zone does not belong to this customer.")
            if expected == "circle" and self.circle.zone.customer_id != self.customer_id:
                raise ValidationError("The selected Circle does not belong to this customer.")
            if expected == "region":
                region_customer_id = self.region.zone.customer_id if self.region.zone_id else self.region.circle.zone.customer_id
                if region_customer_id != self.customer_id:
                    raise ValidationError("The selected Region does not belong to this customer.")
                if "circle" in levels and not self.region.circle_id:
                    raise ValidationError("This customer requires the selected Region to belong to a Circle.")
            if expected == "division":
                division_region = self.division.region
                division_zone_id = (
                    division_region.zone_id if division_region.zone_id
                    else (division_region.circle.zone_id if division_region.circle_id else None)
                )
                if not division_zone_id or Zone.objects.get(pk=division_zone_id).customer_id != self.customer_id:
                    raise ValidationError("The selected Division does not belong to this customer.")
                if "circle" in levels and not division_region.circle_id:
                    raise ValidationError("This customer's Division must belong to a Region under a Circle.")

        parents = (self.city_id, self.taluka_id, self.division_id, self.circle_id, self.region_id, self.zone_id)
        if sum(bool(value) for value in parents) != 1:
            raise ValidationError("A branch must belong to exactly one hierarchy parent.")


def zonal_branch_parent_level(config):
    """Return the configured administrative level directly above Branch."""
    levels = (config or default_zonal_hierarchy_config()).get("levels", [])
    try:
        branch_index = levels.index("branch")
    except (AttributeError, ValueError):
        return None
    return levels[branch_index - 1] if branch_index > 0 else None


def get_branch_zone_id(branch):
    """Resolve the Zone for direct Zone, Circle, Region or Division branch parents."""
    if getattr(branch, "zone_id", None):
        return branch.zone_id
    if getattr(branch, "circle_id", None):
        return branch.circle.zone_id
    if getattr(branch, "region_id", None):
        region = branch.region
        if region.zone_id:
            return region.zone_id
        return region.circle.zone_id if region.circle_id else None
    if getattr(branch, "division_id", None):
        region = branch.division.region
        if region.zone_id:
            return region.zone_id
        return region.circle.zone_id if region.circle_id else None
    return None


class Building(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="buildings")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "buildings"
        unique_together = ("branch", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.branch.name} - {self.name}"


class Floor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="floors")
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="floors", null=True, blank=True)
    name = models.CharField(max_length=255)  # e.g. "Ground Floor", "Floor 2"
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "floors"
        unique_together = ("branch", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.branch.name} - {self.name}"

    def clean(self):
        if self.building_id and self.branch_id and self.building.branch_id != self.branch_id:
            raise ValidationError("The selected building belongs to a different branch.")
        if self.branch_id and self.branch.customer_id and self.branch.customer.hierarchy_type == HierarchyType.ZONAL:
            levels = (self.branch.customer.zonal_hierarchy_config or default_zonal_hierarchy_config()).get("levels", [])
            if "floor" not in levels:
                raise ValidationError("Floor is not enabled in this customer's hierarchy configuration.")
            if "building" in levels and not self.building_id:
                raise ValidationError("Select a Building because this customer's hierarchy includes Building.")
            if "building" not in levels and self.building_id:
                raise ValidationError("Building is not enabled in this customer's hierarchy configuration.")


class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name="rooms")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rooms"
        unique_together = ("floor", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.floor} - {self.name}"


class Site(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="sites")
    branch = models.ForeignKey(
        "Branch",
        on_delete=models.CASCADE,   # keep whatever you already have
        related_name="sites",       # keep your existing related_name
        null=True,
        blank=True,
    )
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name="sites", null=True, blank=True)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="sites", null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, related_name="sites", null=True, blank=True)
    pincode = models.CharField(max_length=6, blank=True, default="")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # 3TP synchronization fields
    tpt_site_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    tpt_sync_status = models.CharField(max_length=20, default="PENDING")
    tpt_sync_error = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "sites"
        unique_together = ("branch", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.floor_id and self.floor.branch_id != self.branch_id:
            raise ValidationError("Selected floor does not belong to the selected branch.")
        if self.building_id and self.building.branch_id != self.branch_id:
            raise ValidationError("Selected building does not belong to the selected branch.")
        if self.floor_id and self.building_id and self.floor.building_id != self.building_id:
            raise ValidationError("Selected floor does not belong to the selected building.")
        if self.room_id and (not self.floor_id or self.room.floor_id != self.floor_id):
            raise ValidationError("Selected room does not belong to the selected floor.")


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.ORG_SUPER_ADMIN)
        extra_fields.setdefault("is_active", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=30, choices=Role.choices, db_index=True)

    organization = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    customer = models.ForeignKey(Customer, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")

    # Zonal hierarchy
    zone = models.ForeignKey(Zone, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    circle = models.ForeignKey(Circle, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    region = models.ForeignKey(Region, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    division = models.ForeignKey(Division, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")

    # Geographical hierarchy
    state = models.ForeignKey(State, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    district = models.ForeignKey(District, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    taluka = models.ForeignKey(Taluka, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    city = models.ForeignKey(City, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")

    branch = models.ForeignKey(Branch, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    site = models.ForeignKey(Site, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    # 3TP synchronization fields
    tpt_user_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    tpt_sync_status = models.CharField(max_length=20, default="PENDING")
    tpt_sync_error = models.TextField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "role"]

    class Meta:
        db_table = "users"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} <{self.email}> [{self.role}]"

    def get_scope(self):
        if self.role == Role.ORG_SUPER_ADMIN:
            return "ORGANIZATION", self.organization_id

        if self.role == Role.CUSTOMER:
            return "CUSTOMER", self.customer_id

        if self.role == Role.BR_ADMIN:
            hierarchy = getattr(self.customer, "hierarchy_type", None) if self.customer_id else None
            if hierarchy == HierarchyType.GEOGRAPHICAL and self.state_id:
                return "STATE", self.state_id
            if hierarchy == HierarchyType.ZONAL and self.zone_id:
                return "ZONE", self.zone_id
            if self.branch_id:
                return "BRANCH", self.branch_id
            return None, None

        if self.role == Role.ENGINEER:
            return "SITE", self.site_id

        return None, None

    @property
    def scope_name(self):
        if self.role == Role.ORG_SUPER_ADMIN:
            return self.organization.name if self.organization else ""

        if self.role == Role.CUSTOMER:
            return self.customer.company if self.customer else ""

        if self.role == Role.BR_ADMIN:
            hierarchy = getattr(self.customer, "hierarchy_type", None) if self.customer_id else None
            if hierarchy == HierarchyType.GEOGRAPHICAL and self.state_id:
                return self.state.name if self.state else ""
            if hierarchy == HierarchyType.ZONAL and self.zone_id:
                return self.zone.name if self.zone else ""
            return self.branch.name if self.branch else ""

        if self.role == Role.ENGINEER:
            return self.site.name if self.site else ""

        return ""


class LoginAudit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="login_audits", null=True)
    email_attempted = models.EmailField(blank=True)
    role_attempted = models.CharField(max_length=30, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    success = models.BooleanField(default=False)
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "login_audits"
        ordering = ["-created_at"]


class LocationZone(models.Model):
    zone_code = models.CharField(max_length=20, unique=True)
    zone_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "location_zones"
        ordering = ["zone_name"]

    def __str__(self):
        return self.zone_name


class LocationState(models.Model):
    state_code = models.CharField(max_length=20)
    state_name = models.CharField(max_length=100)
    zone = models.ForeignKey(LocationZone, on_delete=models.CASCADE, related_name="states")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "location_states"
        ordering = ["state_name"]
        constraints = [
            models.UniqueConstraint(fields=["zone", "state_name"], name="unique_state_per_zone"),
            models.UniqueConstraint(fields=["zone", "state_code"], name="unique_state_code_per_zone"),
        ]

    def __str__(self):
        return self.state_name


class LocationCircle(models.Model):
    circle_code = models.CharField(max_length=30)
    circle_name = models.CharField(max_length=100)
    state = models.ForeignKey(LocationState, on_delete=models.CASCADE, related_name="circles")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "location_circles"
        ordering = ["circle_name"]
        constraints = [
            models.UniqueConstraint(fields=["state", "circle_name"], name="unique_circle_per_state"),
            models.UniqueConstraint(fields=["state", "circle_code"], name="unique_circle_code_per_state"),
        ]

    def __str__(self):
        return self.circle_name


class ACDevice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ac_id = models.CharField(max_length=100, unique=True, db_index=True)
    device_name = models.CharField(max_length=255, blank=True)
    # New direct hierarchy relationship. Keep nullable during migration so
    # existing devices can be backfilled from their legacy Site.branch.
    
    is_simulated = models.BooleanField(
        default=False,
        db_index=True
    )

    branch = models.ForeignKey(
        "Branch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ac_devices",
    )
    # Legacy compatibility only. Do not use this field in new workflows.
    site = models.ForeignKey(
        Site,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ac_devices",
    )
    status = models.CharField(max_length=20, default="OFF")
    capacity_ton = models.FloatField(null=True, blank=True)
    installation_date = models.DateField(null=True, blank=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_ac_devices"
    )
    assigned_admin = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="allocated_ac_devices",
        limit_choices_to={"role": Role.BR_ADMIN},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 3TP synchronization fields
    tpt_device_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    tpt_sync_status = models.CharField(max_length=20, default="PENDING")
    tpt_sync_error = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "ac_devices"
        ordering = ["ac_id"]

    def __str__(self):
        return f"{self.ac_id} - {self.device_name}"


# ============================================================
# CUSTOMER ↔ SITE MAPPING
# ============================================================
class CustomerSiteMapping(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="site_mappings")
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name="customer_mappings")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tpt_sync_status = models.CharField(
        max_length=20,
        default="PENDING",
        db_index=True,
    )
    tpt_sync_error = models.TextField(
        blank=True,
        default="",
    )

    class Meta:
        db_table = "customer_site_mappings"
        constraints = [
            models.UniqueConstraint(fields=["customer", "site"], name="unique_customer_site_mapping"),
        ]

    def __str__(self):
        return f"{self.customer.company} -> {self.site.name}"

# SITE to DEVICE MAPPING
class SiteDeviceMapping(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name="device_mappings")
    device = models.ForeignKey(ACDevice, on_delete=models.CASCADE, related_name="site_mappings")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "site_device_mappings"
        constraints = [
            models.UniqueConstraint(fields=["site", "device"], name="unique_site_device_mapping"),
        ]

    def __str__(self):
        return f"{self.site.name} -> {self.device.ac_id}"


class CustomerDeviceMapping(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="device_mappings")
    device = models.ForeignKey(ACDevice, on_delete=models.CASCADE, related_name="customer_mappings")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customer_device_mappings"
        constraints = [
            models.UniqueConstraint(fields=["customer", "device"], name="unique_customer_device_mapping"),
        ]

    def __str__(self):
        return f"{self.customer.company} -> {self.device.ac_id}"


class DashboardPreference(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dashboard_preferences")
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, null=True, blank=True, related_name="dashboard_preferences"
    )
    name = models.CharField(max_length=255, default="My Dashboard")
    main_filters = models.JSONField(default=dict, blank=True)
    card_filters = models.JSONField(default=dict, blank=True)
    visible_widgets = models.JSONField(default=dict, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "dashboard_preferences"
        ordering = ["-is_default", "-updated_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "name"], name="unique_dashboard_name_per_user"),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.name}"


class LatestTelemetry(models.Model):
    """Latest accepted telemetry snapshot: exactly one row per registered AC device."""
    device = models.OneToOneField(
        ACDevice, on_delete=models.CASCADE, related_name="latest_telemetry"
    )
    device_timestamp = models.DateTimeField(db_index=True)
    voltage = models.FloatField(null=True, blank=True)
    current = models.FloatField(null=True, blank=True)
    active_power = models.FloatField(null=True, blank=True)
    energy_consumption = models.FloatField(null=True, blank=True)
    frequency = models.FloatField(null=True, blank=True)
    power_factor = models.FloatField(null=True, blank=True)
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    alarm_status = models.IntegerField(default=0)
    relay = models.IntegerField(default=0)
    raw_payload = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        db_table = "latest_telemetry"
        indexes = [models.Index(fields=["device_timestamp"], name="latest_tel_ts_idx")]

    def __str__(self):
        return f"Latest telemetry: {self.device.ac_id}"


class TelemetryAggregate(models.Model):
    """One row per AC per time bucket; raw telemetry remains in ThingsBoard.

    The active minute bucket is updated as new readings arrive. Historical
    buckets remain available for local chart/AI queries.
    """
    device_id = models.CharField(max_length=100, db_index=True)
    bucket_start = models.DateTimeField(db_index=True)
    interval_seconds = models.PositiveIntegerField(default=60)
    sample_count = models.PositiveIntegerField(default=0)
    # Per-metric counts keep averages correct when a telemetry packet omits fields.
    voltage_sample_count = models.PositiveIntegerField(default=0)
    current_sample_count = models.PositiveIntegerField(default=0)
    power_sample_count = models.PositiveIntegerField(default=0)
    temperature_sample_count = models.PositiveIntegerField(default=0)
    humidity_sample_count = models.PositiveIntegerField(default=0)
    first_timestamp = models.DateTimeField(null=True, blank=True)
    last_timestamp = models.DateTimeField(db_index=True)

    # Running sums are retained so averages can be updated incrementally.
    sum_voltage = models.FloatField(default=0)
    sum_current = models.FloatField(default=0)
    sum_power = models.FloatField(default=0)
    sum_temperature = models.FloatField(default=0)
    sum_humidity = models.FloatField(default=0)

    avg_voltage = models.FloatField(null=True, blank=True)
    min_voltage = models.FloatField(null=True, blank=True)
    max_voltage = models.FloatField(null=True, blank=True)
    avg_current = models.FloatField(null=True, blank=True)
    avg_power = models.FloatField(null=True, blank=True)
    min_power = models.FloatField(null=True, blank=True)
    max_power = models.FloatField(null=True, blank=True)
    avg_temperature = models.FloatField(null=True, blank=True)
    min_temperature = models.FloatField(null=True, blank=True)
    max_temperature = models.FloatField(null=True, blank=True)
    avg_humidity = models.FloatField(null=True, blank=True)
    min_humidity = models.FloatField(null=True, blank=True)
    max_humidity = models.FloatField(null=True, blank=True)

    # Latest values in the bucket support live cards without a second table.
    latest_voltage = models.FloatField(null=True, blank=True)
    latest_current = models.FloatField(null=True, blank=True)
    latest_power = models.FloatField(null=True, blank=True)
    latest_energy_counter = models.FloatField(null=True, blank=True)
    energy_delta = models.FloatField(default=0)
    latest_frequency = models.FloatField(null=True, blank=True)
    latest_power_factor = models.FloatField(null=True, blank=True)
    latest_temperature = models.FloatField(null=True, blank=True)
    latest_humidity = models.FloatField(null=True, blank=True)
    latest_alarm_status = models.IntegerField(default=0)
    latest_relay = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "telemetry_aggregate"
        ordering = ["-bucket_start", "device_id"]
        constraints = [
            models.UniqueConstraint(
                fields=["device_id", "bucket_start", "interval_seconds"],
                name="uniq_telemetry_aggregate_bucket",
            ),
        ]
        indexes = [
            models.Index(fields=["interval_seconds", "bucket_start"], name="telemetry_bucket_idx"),
            models.Index(fields=["device_id", "last_timestamp"], name="telemetry_device_ts_idx"),
        ]

    def __str__(self):
        return f"{self.device_id} @ {self.bucket_start.isoformat()}"

# Generic, bank-configurable organisational hierarchy. The legacy Zone/Circle/
# Region/Division tables above remain in place during the migration period.
class OrgUnitType(models.Model):
    code = models.SlugField(max_length=40, unique=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True, default="")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        db_table = "org_unit_types"

    def __str__(self):
        return self.name


class BankOrgUnitType(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="org_type_configs")
    unit_type = models.ForeignKey(OrgUnitType, on_delete=models.PROTECT, related_name="bank_configs")
    display_name = models.CharField(max_length=100, blank=True, default="")
    is_enabled = models.BooleanField(default=True)
    is_terminal = models.BooleanField(default=False, help_text="True when this type is a leaf such as Branch.")

    class Meta:
        db_table = "bank_org_unit_types"
        constraints = [models.UniqueConstraint(fields=["customer", "unit_type"], name="uniq_bank_org_unit_type")]
        ordering = ["unit_type__sort_order", "unit_type__name"]

    @property
    def label(self):
        return self.display_name or self.unit_type.name

    def __str__(self):
        return f"{self.customer}: {self.label}"


class OrgHierarchyRule(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="org_hierarchy_rules")
    # NULL parent_type means this type is allowed as a root.
    parent_type = models.ForeignKey(OrgUnitType, on_delete=models.CASCADE, null=True, blank=True, related_name="child_rules")
    child_type = models.ForeignKey(OrgUnitType, on_delete=models.CASCADE, related_name="parent_rules")
    is_allowed = models.BooleanField(default=True)

    class Meta:
        db_table = "org_hierarchy_rules"
        constraints = [models.UniqueConstraint(fields=["customer", "parent_type", "child_type"], name="uniq_org_hierarchy_rule")]


class OrgUnit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="org_units")
    unit_type = models.ForeignKey(OrgUnitType, on_delete=models.PROTECT, related_name="units")
    parent = models.ForeignKey("self", on_delete=models.PROTECT, null=True, blank=True, related_name="children")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=60)
    is_active = models.BooleanField(default=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "org_units"
        constraints = [models.UniqueConstraint(fields=["customer", "code"], name="uniq_org_unit_code_per_bank")]
        ordering = ["name"]

    def clean(self):
        super().clean()
        # This generic tree is strictly for ZONAL customers. GEOGRAPHICAL
        # customers continue to use State -> District -> Taluka -> City -> Branch.
        if self.customer_id and self.customer.hierarchy_type != HierarchyType.ZONAL:
            raise ValidationError({"customer": "Generic organisational units are only available for Zonal customers. Geographical hierarchy is managed separately."})
        if self.parent_id:
            if self.parent.customer_id != self.customer_id:
                raise ValidationError({"parent": "Parent must belong to the same bank."})
            if self.pk and self.parent_id == self.pk:
                raise ValidationError({"parent": "An organisational unit cannot be its own parent."})
            ancestor = self.parent
            visited = set()
            while ancestor is not None:
                if ancestor.pk == self.pk:
                    raise ValidationError({"parent": "This parent assignment would create a hierarchy cycle."})
                if ancestor.pk in visited:
                    raise ValidationError({"parent": "The selected parent already belongs to a cyclic hierarchy."})
                visited.add(ancestor.pk)
                ancestor = ancestor.parent
        rule = OrgHierarchyRule.objects.filter(
            customer_id=self.customer_id,
            parent_type_id=self.parent.unit_type_id if self.parent_id else None,
            child_type_id=self.unit_type_id,
            is_allowed=True,
        ).exists()
        if not rule:
            raise ValidationError({"unit_type": "This unit type is not allowed under the selected parent."})
        enabled = BankOrgUnitType.objects.filter(
            customer_id=self.customer_id, unit_type_id=self.unit_type_id, is_enabled=True
        ).exists()
        if not enabled:
            raise ValidationError({"unit_type": "This unit type is not enabled for this bank."})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.unit_type.code})"


class OrgUnitGeoCoverage(models.Model):
    COVERAGE_CHOICES = [("ASSIGNED", "Assigned coverage"), ("LOCATED", "Physical location")]
    org_unit = models.ForeignKey(OrgUnit, on_delete=models.CASCADE, related_name="geographical_coverage")
    state = models.ForeignKey(State, on_delete=models.PROTECT, null=True, blank=True, related_name="org_unit_coverage")
    district = models.ForeignKey(District, on_delete=models.PROTECT, null=True, blank=True, related_name="org_unit_coverage")
    taluka = models.ForeignKey(Taluka, on_delete=models.PROTECT, null=True, blank=True, related_name="org_unit_coverage")
    city = models.ForeignKey(City, on_delete=models.PROTECT, null=True, blank=True, related_name="org_unit_coverage")
    coverage_type = models.CharField(max_length=12, choices=COVERAGE_CHOICES, default="ASSIGNED")

    class Meta:
        db_table = "org_unit_geo_coverage"

    def clean(self):
        super().clean()
        # This table is an optional map-coverage overlay for ZONAL units only.
        # It does not create, move, or alter State/District/Taluka/City records.
        if self.org_unit_id and self.org_unit.customer.hierarchy_type != HierarchyType.ZONAL:
            raise ValidationError({"org_unit": "Geographical customers cannot have organisational coverage overlays."})
        geography = [self.state, self.district, self.taluka, self.city]
        if not any(geography):
            raise ValidationError("Select at least one geographical area.")
        if self.state_id and self.state.customer_id != self.org_unit.customer_id:
            raise ValidationError({"state": "State must belong to the same customer as the organisational unit."})
        if self.district and self.district.state.customer_id != self.org_unit.customer_id:
            raise ValidationError({"district": "District must belong to the same customer as the organisational unit."})
        if self.taluka and self.taluka.district.state.customer_id != self.org_unit.customer_id:
            raise ValidationError({"taluka": "Taluka must belong to the same customer as the organisational unit."})
        if self.city and self.city.taluka.district.state.customer_id != self.org_unit.customer_id:
            raise ValidationError({"city": "City must belong to the same customer as the organisational unit."})
        if self.district and self.state_id and self.district.state_id != self.state_id:
            raise ValidationError({"district": "District must belong to the selected state."})
        if self.taluka and self.district_id and self.taluka.district_id != self.district_id:
            raise ValidationError({"taluka": "Taluka must belong to the selected district."})
        if self.city and self.taluka_id and self.city.taluka_id != self.taluka_id:
            raise ValidationError({"city": "City must belong to the selected taluka."})
