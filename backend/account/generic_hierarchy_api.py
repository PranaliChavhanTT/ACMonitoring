# from django.db import transaction
# from django.shortcuts import get_object_or_404
# from rest_framework import serializers, status
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework.exceptions import ValidationError

# from .models import (
#     Customer, OrgUnitType, BankOrgUnitType, OrgHierarchyRule, OrgUnit,
#     OrgUnitGeoCoverage, Branch, Role, HierarchyType,
# )


# def scoped_customer(request, customer_id):
#     """Resolve the customer and enforce both access scope and hierarchy mode.

#     Generic OrgUnit endpoints are deliberately ZONAL-only. GEOGRAPHICAL
#     customers continue to use the existing State/District/Taluka/City models
#     and their existing Branch foreign keys without any changes.
#     """
#     customer = get_object_or_404(Customer, pk=customer_id)
#     user = request.user
#     if user.role == Role.ORG_SUPER_ADMIN:
#         if customer.organization_id != user.organization_id:
#             raise ValidationError("Customer does not belong to your organization.")
#     elif user.role in (Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER):
#         if customer.pk != user.customer_id:
#             raise ValidationError("Customer does not belong to your account.")
#     else:
#         raise ValidationError("You do not have access to this customer.")

#     if customer.hierarchy_type != HierarchyType.ZONAL:
#         raise ValidationError(
#             "Generic organisational hierarchy is available only for Zonal customers. "
#             "This customer uses the existing Geographical hierarchy "
#             "(State → District → Taluka → City → Branch), which is unchanged."
#         )
#     return customer


# class OrgUnitTypeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = OrgUnitType
#         fields = ["id", "code", "name", "description", "is_active", "sort_order"]


# class OrgUnitSerializer(serializers.ModelSerializer):
#     type_code = serializers.CharField(source="unit_type.code", read_only=True)
#     type_name = serializers.SerializerMethodField()
#     parent_name = serializers.CharField(source="parent.name", read_only=True)

#     class Meta:
#         model = OrgUnit
#         fields = [
#             "id", "customer", "unit_type", "type_code", "type_name", "parent",
#             "parent_name", "name", "code", "is_active", "latitude",
#             "longitude", "created_at",
#         ]
#         read_only_fields = ["id", "created_at"]

#     def get_type_name(self, obj):
#         config = BankOrgUnitType.objects.filter(
#             customer=obj.customer, unit_type=obj.unit_type
#         ).first()
#         return config.display_name if config and config.display_name else obj.unit_type.name

#     def validate(self, attrs):
#         customer = attrs.get("customer") or getattr(self.instance, "customer", None)
#         parent = attrs.get("parent", getattr(self.instance, "parent", None))
#         unit_type = attrs.get("unit_type", getattr(self.instance, "unit_type", None))
#         if not customer:
#             raise serializers.ValidationError({"customer": "Customer is required."})
#         if customer.hierarchy_type != HierarchyType.ZONAL:
#             raise serializers.ValidationError({"customer": "Generic organisational units cannot be created for Geographical customers."})
#         if parent and parent.customer_id != customer.pk:
#             raise serializers.ValidationError({"parent": "Parent must belong to the selected bank."})
#         if unit_type and not BankOrgUnitType.objects.filter(
#             customer=customer, unit_type=unit_type, is_enabled=True
#         ).exists():
#             raise serializers.ValidationError({"unit_type": "Enable this type for the selected bank first."})
#         return attrs


# class OrgUnitTypeList(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         customer_id = request.query_params.get("customer")
#         qs = OrgUnitType.objects.filter(is_active=True)
#         if customer_id:
#             customer = scoped_customer(request, customer_id)
#             enabled = BankOrgUnitType.objects.filter(
#                 customer=customer, is_enabled=True
#             ).values_list("unit_type_id", flat=True)
#             qs = qs.filter(id__in=enabled)
#         return Response(OrgUnitTypeSerializer(qs, many=True).data)


# class CustomerOrgConfig(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, customer_id):
#         customer = scoped_customer(request, customer_id)
#         types = BankOrgUnitType.objects.filter(customer=customer).select_related("unit_type")
#         rules = OrgHierarchyRule.objects.filter(customer=customer).select_related("parent_type", "child_type")
#         return Response({
#             "customer_id": customer.id,
#             "hierarchy_type": customer.hierarchy_type,
#             "types": [{
#                 "id": x.unit_type_id,
#                 "code": x.unit_type.code,
#                 "name": x.label,
#                 "is_enabled": x.is_enabled,
#                 "is_terminal": x.is_terminal,
#             } for x in types],
#             "rules": [{
#                 "id": x.id,
#                 "parent_type_id": x.parent_type_id,
#                 "parent_type": x.parent_type.name if x.parent_type else None,
#                 "child_type_id": x.child_type_id,
#                 "child_type": x.child_type.name,
#                 "is_allowed": x.is_allowed,
#             } for x in rules],
#         })

#     @transaction.atomic
#     def put(self, request, customer_id):
#         customer = scoped_customer(request, customer_id)
#         if request.user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER):
#             raise ValidationError("You cannot modify hierarchy configuration.")

#         type_rows = request.data.get("types", [])
#         rule_rows = request.data.get("rules", [])
#         if not isinstance(type_rows, list) or not isinstance(rule_rows, list):
#             raise ValidationError("types and rules must be arrays.")

#         enabled_ids = set()
#         normalized_types = []
#         for row in type_rows:
#             type_id = row.get("type_id")
#             unit_type = get_object_or_404(OrgUnitType, pk=type_id, is_active=True)
#             enabled = bool(row.get("is_enabled", True))
#             if enabled:
#                 enabled_ids.add(unit_type.pk)
#             normalized_types.append((unit_type, row, enabled))

#         # Do not let configuration changes strand already-created units.
#         used_type_ids = set(OrgUnit.objects.filter(customer=customer).values_list("unit_type_id", flat=True))
#         disabled_used = used_type_ids - enabled_ids
#         if disabled_used:
#             raise ValidationError({
#                 "types": "Cannot disable a type that is already used by organisational units. "
#                 "Move or remove those units first."
#             })

#         normalized_rules = set()
#         for row in rule_rows:
#             child_id = int(row.get("child_type_id"))
#             parent_id = int(row["parent_type_id"]) if row.get("parent_type_id") else None
#             if child_id not in enabled_ids or (parent_id is not None and parent_id not in enabled_ids):
#                 raise ValidationError("Enable both parent and child types before adding their relationship.")
#             normalized_rules.add((parent_id, child_id))

#         # Existing roots and parent-child links must remain permitted.
#         for unit in OrgUnit.objects.filter(customer=customer).select_related("parent", "unit_type"):
#             expected = (unit.parent.unit_type_id if unit.parent_id else None, unit.unit_type_id)
#             if expected not in normalized_rules:
#                 raise ValidationError(
#                     "The proposed rules would invalidate an existing organisational unit. "
#                     "Keep its current parent-child rule or move the unit first."
#                 )

#         for unit_type, row, enabled in normalized_types:
#             BankOrgUnitType.objects.update_or_create(
#                 customer=customer,
#                 unit_type=unit_type,
#                 defaults={
#                     "display_name": row.get("display_name", ""),
#                     "is_enabled": enabled,
#                     "is_terminal": bool(row.get("is_terminal", False)),
#                 },
#             )

#         OrgHierarchyRule.objects.filter(customer=customer).delete()
#         for parent_id, child_id in normalized_rules:
#             OrgHierarchyRule.objects.create(
#                 customer=customer,
#                 parent_type_id=parent_id,
#                 child_type_id=child_id,
#                 is_allowed=True,
#             )
#         return self.get(request, customer_id)


# class AllowedOrgChildren(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         customer_id = request.query_params.get("customer")
#         parent_id = request.query_params.get("parent_id")
#         if not customer_id:
#             raise ValidationError({"customer": "customer is required."})
#         customer = scoped_customer(request, customer_id)
#         parent = get_object_or_404(OrgUnit, pk=parent_id, customer=customer) if parent_id else None
#         parent_type_id = parent.unit_type_id if parent else None
#         allowed_ids = OrgHierarchyRule.objects.filter(
#             customer=customer, parent_type_id=parent_type_id, is_allowed=True
#         ).values_list("child_type_id", flat=True)
#         rows = BankOrgUnitType.objects.filter(
#             customer=customer, unit_type_id__in=allowed_ids, is_enabled=True
#         ).select_related("unit_type")
#         return Response([{
#             "id": x.unit_type_id,
#             "code": x.unit_type.code,
#             "name": x.label,
#             "is_terminal": x.is_terminal,
#         } for x in rows])


# class OrgUnitListCreate(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         customer_id = request.query_params.get("customer")
#         if not customer_id:
#             if request.user.role == Role.ORG_SUPER_ADMIN:
#                 return Response([])
#             customer_id = request.user.customer_id
#         customer = scoped_customer(request, customer_id)
#         qs = OrgUnit.objects.filter(customer=customer).select_related("unit_type", "parent")
#         if "parent_id" in request.query_params:
#             qs = qs.filter(parent_id=request.query_params.get("parent_id") or None)
#         return Response(OrgUnitSerializer(qs, many=True, context={"request": request}).data)

#     @transaction.atomic
#     def post(self, request):
#         customer = scoped_customer(request, request.data.get("customer"))
#         if request.user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER):
#             raise ValidationError("You cannot create organisational units.")
#         payload = request.data.copy()
#         payload["customer"] = customer.pk
#         serializer = OrgUnitSerializer(data=payload, context={"request": request})
#         serializer.is_valid(raise_exception=True)
#         unit = serializer.save()
#         return Response(
#             OrgUnitSerializer(unit, context={"request": request}).data,
#             status=status.HTTP_201_CREATED,
#         )


# class OrgUnitTree(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, unit_id):
#         root = get_object_or_404(OrgUnit.objects.select_related("unit_type", "customer"), pk=unit_id)
#         customer = scoped_customer(request, root.customer_id)
#         descendants = []
#         queue = [root]
#         seen = set()
#         while queue:
#             node = queue.pop(0)
#             if str(node.pk) in seen:
#                 continue
#             seen.add(str(node.pk))
#             children = list(
#                 node.children.filter(is_active=True).select_related("unit_type").order_by("name")
#             )
#             coverage = list(node.geographical_coverage.select_related(
#                 "state", "district", "taluka", "city"
#             ).values(
#                 "coverage_type", "state_id", "state__name", "district_id",
#                 "district__name", "taluka_id", "taluka__name", "city_id", "city__name"
#             ))
#             descendants.append({
#                 "id": str(node.id),
#                 "name": node.name,
#                 "code": node.code,
#                 "type": node.unit_type.code,
#                 "type_name": node.unit_type.name,
#                 "parent_id": str(node.parent_id) if node.parent_id else None,
#                 "children": [str(x.id) for x in children],
#                 # Read-only map overlay; never used as an organisational parent.
#                 "geographical_coverage": coverage,
#             })
#             queue.extend(children)

#         descendant_ids = [row["id"] for row in descendants]
#         branches = Branch.objects.filter(
#             customer=customer,
#             org_unit_id__in=descendant_ids,
#         ).order_by("name")
#         return Response({
#             "root_id": str(root.id),
#             "units": descendants,
#             "branches": list(branches.values(
#                 "id", "name", "code", "latitude", "longitude", "org_unit_id"
#             )),
#         })


from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .models import (
    Customer, OrgUnitType, BankOrgUnitType, OrgHierarchyRule, OrgUnit,
    OrgUnitGeoCoverage, Branch, Role, HierarchyType,
    build_zonal_geographical_mapping,
)


def scoped_customer(request, customer_id):
    """Resolve the customer and enforce both access scope and hierarchy mode.

    Generic OrgUnit endpoints are deliberately ZONAL-only. GEOGRAPHICAL
    customers continue to use the existing State/District/Taluka/City models
    and their existing Branch foreign keys without any changes.
    """
    customer = get_object_or_404(Customer, pk=customer_id)
    user = request.user
    if user.role == Role.ORG_SUPER_ADMIN:
        if customer.organization_id != user.organization_id:
            raise ValidationError("Customer does not belong to your organization.")
    elif user.role in (Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER):
        if customer.pk != user.customer_id:
            raise ValidationError("Customer does not belong to your account.")
    else:
        raise ValidationError("You do not have access to this customer.")

    if customer.hierarchy_type != HierarchyType.ZONAL:
        raise ValidationError(
            "Generic organisational hierarchy is available only for Zonal customers. "
            "This customer uses the existing Geographical hierarchy "
            "(State → District → Taluka → City → Branch), which is unchanged."
        )
    return customer


class OrgUnitTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrgUnitType
        fields = ["id", "code", "name", "description", "is_active", "sort_order"]


class OrgUnitSerializer(serializers.ModelSerializer):
    type_code = serializers.CharField(source="unit_type.code", read_only=True)
    type_name = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source="parent.name", read_only=True)

    class Meta:
        model = OrgUnit
        fields = [
            "id", "customer", "unit_type", "type_code", "type_name", "parent",
            "parent_name", "name", "code", "is_active", "latitude",
            "longitude", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_type_name(self, obj):
        config = BankOrgUnitType.objects.filter(
            customer=obj.customer, unit_type=obj.unit_type
        ).first()
        return config.display_name if config and config.display_name else obj.unit_type.name

    def validate(self, attrs):
        customer = attrs.get("customer") or getattr(self.instance, "customer", None)
        parent = attrs.get("parent", getattr(self.instance, "parent", None))
        unit_type = attrs.get("unit_type", getattr(self.instance, "unit_type", None))
        if not customer:
            raise serializers.ValidationError({"customer": "Customer is required."})
        if customer.hierarchy_type != HierarchyType.ZONAL:
            raise serializers.ValidationError({"customer": "Generic organisational units cannot be created for Geographical customers."})
        if parent and parent.customer_id != customer.pk:
            raise serializers.ValidationError({"parent": "Parent must belong to the selected bank."})
        if unit_type and not BankOrgUnitType.objects.filter(
            customer=customer, unit_type=unit_type, is_enabled=True
        ).exists():
            raise serializers.ValidationError({"unit_type": "Enable this type for the selected bank first."})
        return attrs


class OrgUnitTypeList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer_id = request.query_params.get("customer")
        qs = OrgUnitType.objects.filter(is_active=True)
        if customer_id:
            customer = scoped_customer(request, customer_id)
            enabled = BankOrgUnitType.objects.filter(
                customer=customer, is_enabled=True
            ).values_list("unit_type_id", flat=True)
            qs = qs.filter(id__in=enabled)
        return Response(OrgUnitTypeSerializer(qs, many=True).data)


class CustomerOrgConfig(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, customer_id):
        customer = scoped_customer(request, customer_id)
        types = BankOrgUnitType.objects.filter(customer=customer).select_related("unit_type")
        rules = OrgHierarchyRule.objects.filter(customer=customer).select_related("parent_type", "child_type")
        return Response({
            "customer_id": customer.id,
            "hierarchy_type": customer.hierarchy_type,
            "zonal_hierarchy_config": {
                **(customer.zonal_hierarchy_config or {}),
                "geographical_mapping": build_zonal_geographical_mapping(
                    (customer.zonal_hierarchy_config or {}).get("levels", [])
                ),
            },
            "types": [{
                "id": x.unit_type_id,
                "code": x.unit_type.code,
                "name": x.label,
                "is_enabled": x.is_enabled,
                "is_terminal": x.is_terminal,
            } for x in types],
            "rules": [{
                "id": x.id,
                "parent_type_id": x.parent_type_id,
                "parent_type": x.parent_type.name if x.parent_type else None,
                "child_type_id": x.child_type_id,
                "child_type": x.child_type.name,
                "is_allowed": x.is_allowed,
            } for x in rules],
        })

    @transaction.atomic
    def put(self, request, customer_id):
        customer = scoped_customer(request, customer_id)
        if request.user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER):
            raise ValidationError("You cannot modify hierarchy configuration.")

        type_rows = request.data.get("types", [])
        rule_rows = request.data.get("rules", [])
        if not isinstance(type_rows, list) or not isinstance(rule_rows, list):
            raise ValidationError("types and rules must be arrays.")

        enabled_ids = set()
        normalized_types = []
        for row in type_rows:
            type_id = row.get("type_id")
            unit_type = get_object_or_404(OrgUnitType, pk=type_id, is_active=True)
            enabled = bool(row.get("is_enabled", True))
            if enabled:
                enabled_ids.add(unit_type.pk)
            normalized_types.append((unit_type, row, enabled))

        # Do not let configuration changes strand already-created units.
        used_type_ids = set(OrgUnit.objects.filter(customer=customer).values_list("unit_type_id", flat=True))
        disabled_used = used_type_ids - enabled_ids
        if disabled_used:
            raise ValidationError({
                "types": "Cannot disable a type that is already used by organisational units. "
                "Move or remove those units first."
            })

        normalized_rules = set()
        for row in rule_rows:
            child_id = int(row.get("child_type_id"))
            parent_id = int(row["parent_type_id"]) if row.get("parent_type_id") else None
            if child_id not in enabled_ids or (parent_id is not None and parent_id not in enabled_ids):
                raise ValidationError("Enable both parent and child types before adding their relationship.")
            normalized_rules.add((parent_id, child_id))

        # Existing roots and parent-child links must remain permitted.
        for unit in OrgUnit.objects.filter(customer=customer).select_related("parent", "unit_type"):
            expected = (unit.parent.unit_type_id if unit.parent_id else None, unit.unit_type_id)
            if expected not in normalized_rules:
                raise ValidationError(
                    "The proposed rules would invalidate an existing organisational unit. "
                    "Keep its current parent-child rule or move the unit first."
                )

        for unit_type, row, enabled in normalized_types:
            BankOrgUnitType.objects.update_or_create(
                customer=customer,
                unit_type=unit_type,
                defaults={
                    "display_name": row.get("display_name", ""),
                    "is_enabled": enabled,
                    "is_terminal": bool(row.get("is_terminal", False)),
                },
            )

        OrgHierarchyRule.objects.filter(customer=customer).delete()
        for parent_id, child_id in normalized_rules:
            OrgHierarchyRule.objects.create(
                customer=customer,
                parent_type_id=parent_id,
                child_type_id=child_id,
                is_allowed=True,
            )
        return self.get(request, customer_id)


class AllowedOrgChildren(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer_id = request.query_params.get("customer")
        parent_id = request.query_params.get("parent_id")
        if not customer_id:
            raise ValidationError({"customer": "customer is required."})
        customer = scoped_customer(request, customer_id)
        parent = get_object_or_404(OrgUnit, pk=parent_id, customer=customer) if parent_id else None
        parent_type_id = parent.unit_type_id if parent else None
        allowed_ids = OrgHierarchyRule.objects.filter(
            customer=customer, parent_type_id=parent_type_id, is_allowed=True
        ).values_list("child_type_id", flat=True)
        rows = BankOrgUnitType.objects.filter(
            customer=customer, unit_type_id__in=allowed_ids, is_enabled=True
        ).select_related("unit_type")
        return Response([{
            "id": x.unit_type_id,
            "code": x.unit_type.code,
            "name": x.label,
            "is_terminal": x.is_terminal,
            "geographical_type": build_zonal_geographical_mapping(
                (customer.zonal_hierarchy_config or {}).get("levels", [])
            ).get((x.unit_type.code or "").strip().lower()),
        } for x in rows])


class OrgUnitListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer_id = request.query_params.get("customer")
        if not customer_id:
            if request.user.role == Role.ORG_SUPER_ADMIN:
                return Response([])
            customer_id = request.user.customer_id
        customer = scoped_customer(request, customer_id)
        qs = OrgUnit.objects.filter(customer=customer).select_related("unit_type", "parent")
        if "parent_id" in request.query_params:
            qs = qs.filter(parent_id=request.query_params.get("parent_id") or None)
        return Response(OrgUnitSerializer(qs, many=True, context={"request": request}).data)

    @transaction.atomic
    def post(self, request):
        customer = scoped_customer(request, request.data.get("customer"))
        if request.user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER):
            raise ValidationError("You cannot create organisational units.")
        payload = request.data.copy()
        payload["customer"] = customer.pk
        serializer = OrgUnitSerializer(data=payload, context={"request": request})
        serializer.is_valid(raise_exception=True)
        unit = serializer.save()
        return Response(
            OrgUnitSerializer(unit, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class OrgUnitTree(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, unit_id):
        root = get_object_or_404(OrgUnit.objects.select_related("unit_type", "customer"), pk=unit_id)
        customer = scoped_customer(request, root.customer_id)
        descendants = []
        queue = [root]
        seen = set()
        while queue:
            node = queue.pop(0)
            if str(node.pk) in seen:
                continue
            seen.add(str(node.pk))
            children = list(
                node.children.filter(is_active=True).select_related("unit_type").order_by("name")
            )
            coverage = list(node.geographical_coverage.select_related(
                "state", "district", "taluka", "city"
            ).values(
                "coverage_type", "state_id", "state__name", "district_id",
                "district__name", "taluka_id", "taluka__name", "city_id", "city__name"
            ))
            descendants.append({
                "id": str(node.id),
                "name": node.name,
                "code": node.code,
                "type": node.unit_type.code,
                "type_name": node.unit_type.name,
                "parent_id": str(node.parent_id) if node.parent_id else None,
                "children": [str(x.id) for x in children],
                # Read-only map overlay; never used as an organisational parent.
                "geographical_coverage": coverage,
            })
            queue.extend(children)

        descendant_ids = [row["id"] for row in descendants]
        branches = Branch.objects.filter(
            customer=customer,
            org_unit_id__in=descendant_ids,
        ).order_by("name")
        return Response({
            "root_id": str(root.id),
            "units": descendants,
            "branches": list(branches.values(
                "id", "name", "code", "latitude", "longitude", "org_unit_id"
            )),
        })
