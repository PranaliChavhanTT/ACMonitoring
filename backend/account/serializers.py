from rest_framework import serializers
from django.contrib.auth import authenticate
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
    class Meta:
        model = Customer
        fields = "__all__"

    def validate(self, attrs):
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


# ---------------- SHARED LEAF: Branch -> Floor(s) -> Site (AC point) ----------------

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"

    def validate(self, attrs):
        customer = attrs.get("customer") or getattr(self.instance, "customer", None)
        city = attrs.get("city", getattr(self.instance, "city", None))
        division = attrs.get("division", getattr(self.instance, "division", None))

        if not customer:
            raise serializers.ValidationError({"customer": "Customer is required."})
        if bool(city) == bool(division):
            raise serializers.ValidationError(
                "Set exactly one parent: 'city' (Geographical) or 'division' (Zonal)."
            )
        if customer.hierarchy_type == HierarchyType.GEOGRAPHICAL and not city:
            raise serializers.ValidationError(
                {"city": "This customer follows the Geographical hierarchy."}
            )
        if customer.hierarchy_type == HierarchyType.ZONAL and not division:
            raise serializers.ValidationError(
                {"division": "This customer follows the Zonal hierarchy."}
            )
        return attrs


class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = "__all__"


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

    class Meta:
        model = User
        fields = [
            "id", "email", "name", "phone", "role",
            "organization", "customer", "zone", "circle", "branch", "site",
            "scope_name", "scope_id",
            "is_active", "date_joined", "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def get_scope_id(self, obj):
        _, scope_id = obj.get_scope()
        return str(scope_id) if scope_id else None


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

    class Meta:
        model = User
        fields = [
            "id", "email", "name", "phone", "role",
            "organization", "customer", "zone", "circle", "branch", "site",
            "scope_name", "scope_id",
            "password",
            "is_active", "date_joined", "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login", "scope_name", "scope_id"]
        extra_kwargs = {
            # Fill in from the logged-in admin at create time
            "organization": {"required": False},
            "customer":     {"required": False},
            "zone":         {"required": False},
            "circle":       {"required": False},
            "branch":       {"required": False},
            "site":         {"required": False},
        }

    def get_scope_id(self, obj):
        _, scope_id = obj.get_scope()
        return str(scope_id) if scope_id else None

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
            "ZONAL_ADMIN":     "zone",
            "CIRCLE_ADMIN":    "circle",
        }.get(instance.role)

        if instance.role == "ORG_SUPER_ADMIN" or (
            scope_field and getattr(instance, f"{scope_field}_id")
        ):
            instance.is_active = True

        instance.save()
        return instance
