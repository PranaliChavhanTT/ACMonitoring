from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db import transaction
from .models import (
    ACData, User, Organization, Customer, HierarchyType,
    Zone, Circle, Region, Division,
    State, District, Taluka, City,
    Branch, Floor, Site, Role,
)

class ACDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = ACData
        fields = [
            "id",
            "timestamp",
            "ac_id",
            "indoor_temperature",
            "outdoor_temperature",
            "indoor_humidity",
            "outdoor_humidity",
            "voltage",
            "current",
        ]

# class ACDataSerializer(serializers.ModelSerializer):
#     state  = serializers.CharField(source="branch.state",  read_only=True)
#     city   = serializers.CharField(source="branch.city",   read_only=True)
#     branch = serializers.CharField(source="branch.name",   read_only=True)
#     floor  = serializers.CharField(source="floor",         read_only=True)

#     class Meta:
#         model = ACData
#         fields = "__all__"

# ---------------- HIERARCHY ----------------
class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, min_length=6,
    )
    login_email = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = "__all__"
        # `organization` is filled in by the view from the logged-in user.
        # (unique_together would otherwise force clients to send it.)
        read_only_fields = ["organization"]
        validators = []

    def get_login_email(self, obj):
        return (
            User.objects.filter(customer=obj, role=Role.CUSTOMER)
            .values_list("email", flat=True)
            .first()
        )

    @staticmethod
    def _login_email_for(customer):
        return (customer.contact_person_email or customer.company_email or "").strip().lower()

    def _ensure_login(self, customer, password):
        """Create (or reset the password of) the customer's login account."""
        login = User.objects.filter(customer=customer, role=Role.CUSTOMER).first()
        if login:
            login.set_password(password)
            login.save()
            return login

        email = self._login_email_for(customer)
        if not email:
            raise serializers.ValidationError(
                {"contact_person_email": "An email is required to create the customer's login."}
            )
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                {"contact_person_email": "A user with this email already exists."}
            )

        login = User(
            email=email,
            name=customer.contact_person or customer.company,
            phone=customer.phone,
            role=Role.CUSTOMER,
            organization=customer.organization,
            customer=customer,
            is_active=customer.is_active,
        )
        login.set_password(password)
        login.save()
        return login

    def create(self, validated_data):
        password = validated_data.pop("password", "")
        with transaction.atomic():
            customer = super().create(validated_data)
            if password:
                self._ensure_login(customer, password)
        return customer

    def update(self, instance, validated_data):
        password = validated_data.pop("password", "")
        with transaction.atomic():
            customer = super().update(instance, validated_data)
            if password:
                self._ensure_login(customer, password)
        return customer

    def validate(self, attrs):
        # (organization, code) must be unique — checked by hand because the
        # organization is not part of the request body.
        request = self.context.get("request")
        org_id = (
            self.instance.organization_id
            if self.instance is not None
            else getattr(getattr(request, "user", None), "organization_id", None)
        )
        code = attrs.get("code") or getattr(self.instance, "code", None)
        if org_id and code:
            dupes = Customer.objects.filter(organization_id=org_id, code=code)
            if self.instance is not None:
                dupes = dupes.exclude(pk=self.instance.pk)
            if dupes.exists():
                raise serializers.ValidationError(
                    {"code": "A customer with this code already exists in your organization."}
                )

        # hierarchy_type is required going forward and, once branches exist
        # under the customer, can no longer be switched.
        if self.instance is None:
            if not attrs.get("hierarchy_type"):
                raise serializers.ValidationError(
                    {"hierarchy_type": "Select Geographical or Zonal before creating the customer."}
                )
        else:
            new_value = attrs.get("hierarchy_type")
            if (
                new_value
                and new_value != self.instance.hierarchy_type
                and self.instance.branches.exists()
            ):
                raise serializers.ValidationError(
                    {"hierarchy_type": "This customer already has branches; the hierarchy type is locked."}
                )
        return attrs


# ---------------- ZONAL CHAIN: Zone -> Circle -> Region -> Division ----------------

class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = "__all__"


class CircleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Circle
        fields = "__all__"


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = "__all__"


class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = "__all__"


# ---------------- GEOGRAPHICAL CHAIN: State -> District -> Taluka -> City ----------------

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = "__all__"


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = "__all__"


class TalukaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taluka
        fields = "__all__"


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = "__all__"

class BranchSerializer(serializers.ModelSerializer):
    # ----- Geographical ancestors -----
    city_name     = serializers.CharField(source="city.name",                         read_only=True, default=None)
    taluka_name   = serializers.CharField(source="city.taluka.name",                  read_only=True, default=None)
    district_name = serializers.CharField(source="city.taluka.district.name",         read_only=True, default=None)
    state_name    = serializers.CharField(source="city.taluka.district.state.name",   read_only=True, default=None)

    # ----- Zonal ancestors -----
    division_name = serializers.CharField(source="division.name",                          read_only=True, default=None)
    region_name   = serializers.CharField(source="division.region.name",                   read_only=True, default=None)
    circle_name   = serializers.CharField(source="division.region.circle.name",            read_only=True, default=None)
    zone_name     = serializers.CharField(source="division.region.circle.zone.name",       read_only=True, default=None)

    customer_name = serializers.CharField(source="customer.company", read_only=True, default=None)

    class Meta:
        model  = Branch
        fields = "__all__"


# class FloorSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Floor
#         fields = "__all__"

class FloorSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(
        source="branch.name",
        read_only=True
    )

    customer_id = serializers.IntegerField(
        source="branch.customer_id",
        read_only=True
    )

    class Meta:
        model = Floor
        fields = [
            "id",
            "name",
            "code",
            "branch",
            "branch_name",
            "customer_id",
            "is_active",
            "created_at",
        ]

class SiteSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    floor_name = serializers.CharField(source="floor.name", read_only=True, default=None)

    class Meta:
        model = Site
        fields = "__all__"

    def validate(self, attrs):
        branch = attrs.get("branch") or getattr(self.instance, "branch", None)
        floor = attrs.get("floor", getattr(self.instance, "floor", None))
        if floor and branch and floor.branch_id != branch.id:
            raise serializers.ValidationError({"floor": "Selected floor does not belong to the selected branch."})
        return attrs

class UserSerializer(serializers.ModelSerializer):
    scope_name = serializers.CharField(read_only=True)
    scope_id = serializers.SerializerMethodField()
    customer_hierarchy_type = serializers.SerializerMethodField()
    zone_name = serializers.CharField(source="zone.name", read_only=True, default=None)
    circle_name = serializers.CharField(source="circle.name", read_only=True, default=None)
    state_name = serializers.CharField(source="state.name", read_only=True, default=None)
    district_name = serializers.CharField(source="district.name", read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            "id", "email", "name", "phone", "role",
            "organization", "customer", "zone", "circle", "state", "district", "branch", "site",
            "scope_name", "scope_id", "customer_hierarchy_type",
            "zone_name", "circle_name", "state_name", "district_name",
            "is_active", "date_joined", "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def get_scope_id(self, obj):
        _, scope_id = obj.get_scope()
        return str(scope_id) if scope_id else None

    def get_customer_hierarchy_type(self, obj):
        return obj.customer.hierarchy_type if obj.customer_id and obj.customer else None


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=Role.choices)

    def validate(self, data):
        user = authenticate(
            request=self.context.get("request"),
            username=data["email"],
            password=data["password"],
        )
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is disabled.")
        if user.role != data["role"]:
            raise serializers.ValidationError(
                f"This account belongs to '{user.get_role_display()}'. "
                f"Please select the correct role."
            )
        data["user"] = user
        return data

# class CustomerSerializer(serializers.ModelSerializer):
#     organization_name = serializers.CharField(
#         source="organization.name", read_only=True
#     )

#     class Meta:
#         model = Customer
#         fields = [
#             "id",
#             "organization",
#             "organization_name",
#             "company",
#             "code",
#             "company_email",
#             "contact_person",
#             "contact_person_email",
#             "phone",
#             "is_active",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = ["id", "organization", "created_at", "updated_at"]

#     def validate_company(self, value):
#         value = value.strip()
#         if not value:
#             raise serializers.ValidationError("Company name is required.")
#         return value

#     def validate_code(self, value):
#         value = value.strip().upper()
#         if not value:
#             raise serializers.ValidationError("Code is required.")
#         return value

#     def validate_phone(self, value):
#         return value.strip()

#     def validate_company_email(self, value):
#         return value.strip().lower()

#     def validate_contact_person_email(self, value):
#         return value.strip().lower()

#     # -------- object-level validation --------

#     def validate(self, attrs):
#         """
#         Enforce (organization, code) uniqueness manually so we return a
#         friendly DRF error instead of a raw IntegrityError.
#         """
#         request = self.context.get("request")
#         user = getattr(request, "user", None)

#         # Determine the org this customer belongs to.
#         if self.instance is not None:
#             org = self.instance.organization
#         else:
#             org = getattr(user, "organization", None)

#         if org is None:
#             raise serializers.ValidationError(
#                 {"organization": "Could not determine organization for this customer."}
#             )

#         code = attrs.get("code") or getattr(self.instance, "code", None)
#         if code:
#             qs = Customer.objects.filter(organization=org, code=code)
#             if self.instance is not None:
#                 qs = qs.exclude(pk=self.instance.pk)
#             if qs.exists():
#                 raise serializers.ValidationError(
#                     {"code": "A customer with this code already exists in your organization."}
#                 )

#         return attrs


class AdminSerializer(serializers.ModelSerializer):
    password   = serializers.CharField(write_only=True, required=False, allow_blank=True)
    scope_name = serializers.CharField(read_only=True)
    scope_id   = serializers.SerializerMethodField()
    customer_hierarchy_type = serializers.SerializerMethodField()
    zone_name = serializers.CharField(source="zone.name", read_only=True, default=None)
    circle_name = serializers.CharField(source="circle.name", read_only=True, default=None)
    state_name = serializers.CharField(source="state.name", read_only=True, default=None)
    district_name = serializers.CharField(source="district.name", read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            "id", "email", "name", "phone", "role",
            "organization", "customer", "zone", "circle", "state", "district", "branch", "site",
            "scope_name", "scope_id", "customer_hierarchy_type",
            "zone_name", "circle_name", "state_name", "district_name",
            "password",
            "is_active", "date_joined", "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login", "scope_name", "scope_id"]
        extra_kwargs = {
            "organization": {"required": False},
            "customer":     {"required": False},
            "zone":         {"required": False},
            "circle":       {"required": False},
            "region":       {"required": False},
            "division":     {"required": False},
            "state":        {"required": False},
            "district":     {"required": False},
            "taluka":       {"required": False},
            "city":         {"required": False},
            "branch":       {"required": False},
            "site":         {"required": False},
        }

    def get_scope_id(self, obj):
        _, scope_id = obj.get_scope()
        return str(scope_id) if scope_id else None

    def get_customer_hierarchy_type(self, obj):
        return obj.customer.hierarchy_type if obj.customer_id and obj.customer else None

    CREATABLE_ROLES = (Role.BR_ADMIN, Role.ENGINEER)

    def validate_role(self, value):
        if self.instance is not None and self.instance.role == value:
            return value
        if value not in self.CREATABLE_ROLES:
            raise serializers.ValidationError(
                "Only Branch Admin and Engineer accounts can be created here. "
                "Customers are created from the Customers page."
            )
        return value

    def validate_customer(self, value):
        request = self.context.get("request")
        acting = getattr(request, "user", None)
        if value is None or acting is None:
            return value
        if acting.role == Role.ORG_SUPER_ADMIN and value.organization_id != acting.organization_id:
            raise serializers.ValidationError("Customer does not belong to your organization.")
        if acting.role == Role.CUSTOMER and value.pk != acting.customer_id:
            raise serializers.ValidationError("You can only assign users to your own customer.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        customer = attrs.get("customer") or getattr(self.instance, "customer", None)
        zone = attrs.get("zone") if "zone" in attrs else getattr(self.instance, "zone", None)
        circle = attrs.get("circle") if "circle" in attrs else getattr(self.instance, "circle", None)
        state = attrs.get("state") if "state" in attrs else getattr(self.instance, "state", None)
        district = attrs.get("district") if "district" in attrs else getattr(self.instance, "district", None)

        if not customer:
            return attrs

        if zone and zone.customer_id != customer.pk:
            raise serializers.ValidationError({"zone": "Selected zone does not belong to the selected customer."})
        if circle and (not zone or circle.zone_id != zone.pk):
            raise serializers.ValidationError({"circle": "Selected circle must belong to the selected zone."})
        if state and state.customer_id != customer.pk:
            raise serializers.ValidationError({"state": "Selected state does not belong to the selected customer."})
        if district and (not state or district.state_id != state.pk):
            raise serializers.ValidationError({"district": "Selected district must belong to the selected state."})

        if customer.hierarchy_type == HierarchyType.GEOGRAPHICAL and (zone or circle):
            raise serializers.ValidationError({"zone": "This customer uses the Geographical hierarchy; assign State/District instead."})
        if customer.hierarchy_type == HierarchyType.ZONAL and (state or district):
            raise serializers.ValidationError({"state": "This customer uses the Zonal hierarchy; assign Zone/Circle instead."})

        return attrs

        geo_chain = ["state", "district", "taluka", "city"]
        zon_chain = ["zone", "circle", "region", "division"]

        def _chain_ok(chain, attrs_or_instance, expected_hierarchy):
            filled = [
                (name, attrs_or_instance.get(name)
                    if isinstance(attrs_or_instance, dict)
                    else getattr(attrs_or_instance, name, None))
                for name in chain
            ]
            # Drop nulls, keep order
            filled = [(n, v) for n, v in filled if v is not None]
            # The chain must be contiguous from the top (no gaps)
            if not filled:
                return
            # Verify each step links to the previous
            for i in range(1, len(filled)):
                prev_name, prev_obj = filled[i - 1]
                name, obj = filled[i]
                parent_attr = {
                    "district": "state",
                    "taluka":   "district",
                    "city":     "taluka",
                    "circle":   "zone",
                    "region":   "circle",
                    "division": "region",
                }[name]
                if getattr(obj, f"{parent_attr}_id") != prev_obj.pk:
                    raise serializers.ValidationError(
                        {name: f"Selected {name} does not belong to the selected {parent_attr}."}
                    )
            # Verify the top of the chain belongs to the customer
            top_name, top_obj = filled[0]
            if top_obj.customer_id != customer.pk:
                raise serializers.ValidationError({top_name: "Does not belong to the selected customer."})

        # Get values for whichever fields the request actually sends
        payload = {}
        for name in geo_chain + zon_chain:
            if name in attrs:
                payload[name] = attrs[name]
            elif self.instance is not None:
                payload[name] = getattr(self.instance, name, None)

        # Hierarchy must match the customer
        if customer.hierarchy_type == HierarchyType.GEOGRAPHICAL:
            if any(payload.get(n) for n in zon_chain):
                raise serializers.ValidationError(
                    {"zone": "This customer uses the Geographical hierarchy; assign State/District/Taluka/City instead."}
                )
            _chain_ok(geo_chain, payload, "GEOGRAPHICAL")
        elif customer.hierarchy_type == HierarchyType.ZONAL:
            if any(payload.get(n) for n in geo_chain):
                raise serializers.ValidationError(
                    {"state": "This customer uses the Zonal hierarchy; assign Zone/Circle/Region/Division instead."}
                )
            _chain_ok(zon_chain, payload, "ZONAL")

    def create(self, validated_data):
        password = validated_data.pop("password", "") or "changeme123"
        user = User(**validated_data)
        user.set_password(password)
        user._skip_scope_check = True       # ← bypass scope check on this save
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)

        # Activate the user once the required scope is present.
        scope_field = {
            "ORG_SUPER_ADMIN": "organization",
            "CUSTOMER":      "customer",
            "BR_ADMIN":        "branch",
            "ENGINEER":        "site",
            # "ZONAL_ADMIN":     "zone",
            # "CIRCLE_ADMIN":    "circle",
        }.get(instance.role)

        if instance.role == "ORG_SUPER_ADMIN" or (
            scope_field and getattr(instance, f"{scope_field}_id")
        ):
            instance.is_active = True

        instance.save()
        return instance

