
# account/hierarchy_persistence.py

from uuid import uuid4

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q

from .models import (
    Customer,
    State, District, Taluka, City,
    Zone, Circle, Region, Division,
    Branch, Building, Floor, Room, HierarchyType, zonal_branch_parent_level,
)


def _code(prefix):
    return f"{prefix}-{uuid4().hex[:12].upper()}"


@transaction.atomic
def persist_customer_branch_floor(customer, body, hierarchy, location_type):
    """
    Persist one customer's hierarchy path, branch and optional floor.

    Returns:
        branch, floor_or_none, path
    """
    hierarchy = hierarchy.strip().upper()
    location_type = location_type.strip().upper()

    if not customer or not customer.is_active:
        raise ValidationError("An active customer is required.")

    if customer.hierarchy_type != hierarchy:
        raise ValidationError(
            "The requested hierarchy does not match this customer."
        )

    if hierarchy == HierarchyType.GEOGRAPHICAL:
        state_name = str(body.get("state_name") or "").strip()
        district_name = str(body.get("district_name") or "").strip()
        taluka_name = str(body.get("taluka_name") or "").strip()
        city_name = str(body.get("city_name") or "").strip()

        if not all([state_name, district_name, taluka_name, city_name]):
            raise ValidationError(
                "State, district, taluka and city are required."
            )

        state, _ = State.objects.get_or_create(
            customer=customer,
            name=state_name,
            defaults={"code": _code("ST")},
        )
        district, _ = District.objects.get_or_create(
            state=state,
            name=district_name,
            defaults={"code": _code("DT")},
        )
        taluka, _ = Taluka.objects.get_or_create(
            district=district,
            name=taluka_name,
            defaults={"code": _code("TL")},
        )
        city, _ = City.objects.get_or_create(
            taluka=taluka,
            name=city_name,
            defaults={"code": _code("CT")},
        )

        branch_name = str(body.get("branch_name") or "").strip()
        if not branch_name:
            raise ValidationError("branch_name is required.")

        branch, _ = Branch.objects.get_or_create(
            city=city,
            name=branch_name,
            defaults={
                "customer": customer,
                "code": _code("BR"),
                "pincode": str(body.get("pincode") or "").strip(),
            },
        )

        path = {
            "state_id": str(state.pk),
            "state_name": state.name,
            "district_id": str(district.pk),
            "district_name": district.name,
            "taluka_id": str(taluka.pk),
            "taluka_name": taluka.name,
            "city_id": str(city.pk),
            "city_name": city.name,
        }

    elif hierarchy == HierarchyType.ZONAL:
        zone_name = str(body.get("zone_name") or "").strip()
        branch_name = str(body.get("branch_name") or "").strip()
        if not zone_name or not branch_name:
            raise ValidationError("Zone and branch name are required.")

        levels = (customer.zonal_hierarchy_config or {}).get("levels", ["zone", "circle", "branch", "floor"])
        zone, _ = Zone.objects.get_or_create(
            customer=customer, name=zone_name,
            defaults={"code": _code("ZN")},
        )

        circle = None
        region = None
        division = None

        if "circle" in levels:
            circle_name = str(body.get("circle_name") or "").strip()
            if not circle_name:
                raise ValidationError("Circle is required by this customer's zonal configuration.")
            circle, _ = Circle.objects.get_or_create(
                zone=zone, name=circle_name, defaults={"code": _code("CR")}
            )

        if "region" in levels:
            region_name = str(body.get("region_name") or "").strip()
            if not region_name:
                raise ValidationError("Region is required by this customer's zonal configuration.")
            if circle:
                region, _ = Region.objects.get_or_create(
                    circle=circle, name=region_name, defaults={"code": _code("RG")}
                )
            else:
                region = Region.objects.filter(
                    Q(zone=zone) | Q(circle__zone=zone), name__iexact=region_name
                ).first()
                if region is None:
                    region = Region.objects.create(
                        zone=zone, circle=None, name=region_name, code=_code("RG")
                    )

        if "division" in levels:
            division_name = str(body.get("division_name") or "").strip()
            if not division_name or not region:
                raise ValidationError("Division and its parent Region are required by this customer's zonal configuration.")
            division, _ = Division.objects.get_or_create(
                region=region, name=division_name, defaults={"code": _code("DV")}
            )

        parent_level = zonal_branch_parent_level(customer.zonal_hierarchy_config)
        parent = {"zone": zone, "circle": circle, "region": region, "division": division}.get(parent_level)
        if not parent:
            raise ValidationError(f"{str(parent_level or 'Configured parent').title()} is required for this customer's Branch.")

        branch, _ = Branch.objects.get_or_create(
            customer=customer,
            name=branch_name,
            **{parent_level: parent},
            defaults={"code": _code("BR"), "pincode": str(body.get("pincode") or "").strip()},
        )
        path = {"zone_id": str(zone.pk), "zone_name": zone.name}
        if circle:
            path.update({"circle_id": str(circle.pk), "circle_name": circle.name})
        if region:
            path.update({"region_id": str(region.pk), "region_name": region.name})
        if division:
            path.update({"division_id": str(division.pk), "division_name": division.name})

    else:
        raise ValidationError(
            "hierarchy must be GEOGRAPHICAL or ZONAL."
        )

    # Validate existing branch ownership and hierarchy consistency.
    if branch.customer_id != customer.pk:
        raise ValidationError(
            "This branch is already associated with a different customer."
        )

    if location_type == "BRANCH":
        floor = None

    elif location_type == "FLOOR":
        floor_name = str(body.get("floor_name") or "").strip()
        if not floor_name:
            raise ValidationError("floor_name is required.")
        if hierarchy == HierarchyType.ZONAL:
            levels = (customer.zonal_hierarchy_config or {}).get("levels", [])
            if "floor" not in levels:
                raise ValidationError("Floor is not enabled in this customer's hierarchy configuration.")
        building = None
        building_name = str(body.get("building_name") or "").strip()
        if hierarchy == HierarchyType.ZONAL and "building" in levels and not building_name:
            raise ValidationError("Building name is required by this customer's hierarchy configuration.")
        if building_name:
            if hierarchy != HierarchyType.ZONAL or "building" not in levels:
                raise ValidationError("Building is not enabled in this customer's hierarchy configuration.")
            building, _ = Building.objects.get_or_create(
                branch=branch, name=building_name, defaults={"code": _code("BL")},
            )
        floor, _ = Floor.objects.get_or_create(
            branch=branch, building=building,
            name=floor_name,
            defaults={"code": _code("FL")},
        )

    else:
        raise ValidationError("location_type must be BRANCH or FLOOR.")

    path.update({
        "branch_id": str(branch.pk),
        "branch_name": branch.name,
    })

    if floor:
        path.update({
            "floor_id": str(floor.pk),
            "floor_name": floor.name,
        })

    return branch, floor, path
