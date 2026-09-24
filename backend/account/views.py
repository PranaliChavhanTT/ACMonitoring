from django.shortcuts import render

import json
import os

from django.conf import settings
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS

from rest_framework.authtoken.models import Token
from django.contrib.auth import login as django_login, logout as django_logout
from django.utils import timezone

from .models import (
    LocationCircle, LocationState, LocationZone, User, Organization, Customer,
    Zone, Circle, Branch, Site, LoginAudit, Role,
)
from .serializers import (
    AdminSerializer, LoginSerializer, UserSerializer,
    OrganizationSerializer, CustomerSerializer, ZoneSerializer,
    CircleSerializer, BranchSerializer, SiteSerializer,
)

from .permissions import CustomerScopeMixin, IsOrgSuperAdmin
from rest_framework import status, generics, permissions, filters

from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError


class ReadOnlyOrAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


BASE_DATA_DIR = os.path.join(settings.BASE_DIR, "data")

DATA_FILE = os.path.join(BASE_DATA_DIR, "ac_data.json")

GEOGRAPHICAL_LOCATION_FILE = os.path.join( BASE_DATA_DIR, "locationData_geographical.json")

ZONAL_LOCATION_FILE = os.path.join( BASE_DATA_DIR, "locationData_zonal.json")

DEVICE_LOCATION_MAP_FILE = os.path.join(BASE_DATA_DIR, "DeviceLocationMap.json")


def load_location_tree(location_file):
    if not os.path.exists(location_file):
        return []

    with open(location_file, "r", encoding="utf-8-sig") as file:
        return json.load(file)

def save_location_tree(tree, location_file):
    with open(location_file, "w", encoding="utf-8") as file:
        json.dump(tree, file, indent=4)

def iter_branches(tree, hierarchy_type):
    hierarchy_type = hierarchy_type.upper()

    if hierarchy_type == "GEOGRAPHICAL":

        for state in tree:
            for district in state.get("districts", []):
                for taluka in district.get("talukas", []):
                    for city in taluka.get("cities", []):
                        for branch in city.get("branches", []):

                            context = {
                                "hierarchy_type": "GEOGRAPHICAL",

                                "state_id": state.get("state_id", ""),
                                "state_name": state.get("state_name", ""),

                                "district_id": district.get("district_id", ""),
                                "district_name": district.get("district_name", ""),

                                "taluka_id": taluka.get("taluka_id", ""),
                                "taluka_name": taluka.get("taluka_name", ""),

                                "city_id": city.get("city_id", ""),
                                "city_name": city.get("city_name", ""),

                                "branch_id": branch.get("branch_id", ""),
                                "branch_name": branch.get("branch_name", ""),
                            }

                            yield branch, context

    elif hierarchy_type == "ZONAL":

        for zone in tree:
            for circle in zone.get("circles", []):
                for region in circle.get("regions", []):
                    for division in region.get("divisions", []):
                        for branch in division.get("branches", []):

                            context = {
                                "hierarchy_type": "ZONAL",

                                "zone_id": zone.get("zone_id", ""),
                                "zone_name": zone.get("zone_name", ""),

                                "circle_id": circle.get("circle_id", ""),
                                "circle_name": circle.get("circle_name", ""),

                                "region_id": region.get("region_id", ""),
                                "region_name": region.get("region_name", ""),

                                "division_id": division.get("division_id", ""),
                                "division_name": division.get("division_name", ""),

                                "branch_id": branch.get("branch_id", ""),
                                "branch_name": branch.get("branch_name", ""),
                            }

                            yield branch, context


def find_location_target(tree, hierarchy_type, branch_id="", floor_id=""):
    for branch, context in iter_branches(tree, hierarchy_type):
        if floor_id:
            for floor in branch.get("floors", []):
                if str(floor.get("floor_id", "")) == str(floor_id):
                    return {
                        "branch": branch,
                        "floor": floor,
                        "context": context,
                    }

        if branch_id:
            if str(branch.get("branch_id", "")) == str(branch_id):
                return {
                    "branch": branch,
                    "floor": None,
                    "context": context,
                }
    return None

def remove_site_from_tree(tree, site_id):
    removed = False
    for hierarchy_type in ["GEOGRAPHICAL", "ZONAL"]:
        for branch, _ in iter_branches(tree, hierarchy_type):

            branch_sites = branch.get("sites", [])

            new_branch_sites = [
                site for site in branch_sites
                if str(site.get("site_id", "")) != str(site_id)
            ]

            if len(new_branch_sites) != len(branch_sites):
                removed = True

            branch["sites"] = new_branch_sites

            # Floor sites
            for floor in branch.get("floors", []):

                floor_sites = floor.get("sites", [])

                new_floor_sites = [
                    site for site in floor_sites
                    if str(site.get("site_id", "")) != str(site_id)
                ]

                if len(new_floor_sites) != len(floor_sites):
                    removed = True

                floor["sites"] = new_floor_sites
    return removed

def build_location_index():

    index = {}
    geographical_tree = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)

    for branch, context in iter_branches(geographical_tree, "GEOGRAPHICAL"):

        branch_id = branch.get("branch_id")

        if branch_id:
            index[branch_id] = {
                **context,
                "location_type": "BRANCH",
            }

        for floor in branch.get("floors", []):

            floor_id = floor.get("floor_id")

            if not floor_id:
                continue

            index[floor_id] = {
                **context,
                "floor_id": floor_id,
                "floor_name": floor.get("floor_name", ""),
                "location_type": "FLOOR",
            }

            for site in floor.get("sites", []):

                site_id = site.get("site_id")

                if site_id:
                    index[site_id] = {
                        **context,
                        "floor_id": floor_id,
                        "floor_name": floor.get("floor_name", ""),
                        "site_id": site_id,
                        "device_name": site.get("device_name", ""),
                        "location_type": "FLOOR",
                    }

        for site in branch.get("sites", []):

            site_id = site.get("site_id")

            if site_id:
                index[site_id] = {
                    **context,
                    "site_id": site_id,
                    "device_name": site.get("device_name", ""),
                    "location_type": "DIRECT_BRANCH",
                }

    zonal_tree = load_location_tree(ZONAL_LOCATION_FILE)

    for branch, context in iter_branches(zonal_tree, "ZONAL"):

        branch_id = branch.get("branch_id")

        if branch_id:
            index[branch_id] = {
                **context,
                "location_type": "BRANCH",
            }

        for floor in branch.get("floors", []):

            floor_id = floor.get("floor_id")

            if not floor_id:
                continue

            index[floor_id] = {
                **context,
                "floor_id": floor_id,
                "floor_name": floor.get("floor_name", ""),
                "location_type": "FLOOR",
            }

            for site in floor.get("sites", []):

                site_id = site.get("site_id")

                if site_id:
                    index[site_id] = {
                        **context,
                        "floor_id": floor_id,
                        "floor_name": floor.get("floor_name", ""),
                        "site_id": site_id,
                        "device_name": site.get("device_name", ""),
                        "location_type": "FLOOR",
                    }

        for site in branch.get("sites", []):

            site_id = site.get("site_id")

            if site_id:
                index[site_id] = {
                    **context,
                    "site_id": site_id,
                    "device_name": site.get("device_name", ""),
                    "location_type": "DIRECT_BRANCH",
                }

    return index


def build_device_location_map():

    if not os.path.exists(DEVICE_LOCATION_MAP_FILE):
        return {}

    try:
        with open(DEVICE_LOCATION_MAP_FILE, "r", encoding="utf-8-sig") as file:
            mappings = json.load(file)

        if isinstance(mappings, list):
            return {
                item.get("ac_id"): item
                for item in mappings
                if isinstance(item, dict) and item.get("ac_id")
            }

        # Backward compatibility with old dict format
        if isinstance(mappings, dict):
            result = {}
            for ac_id, value in mappings.items():
                if isinstance(value, dict):
                    item = dict(value)
                    item.setdefault("ac_id", ac_id)
                    result[ac_id] = item
                else:
                    result[ac_id] = {
                        "ac_id": ac_id,
                        "floor_id": value,
                    }
            return result

        return {}

    except (json.JSONDecodeError, TypeError):
        return {}


def save_device_location_map(device_map):

    # Save as LIST because DEVICE_LOCATION.json uses a list of records.
    mappings = list(device_map.values())

    with open(DEVICE_LOCATION_MAP_FILE, "w", encoding="utf-8") as file:
        json.dump(mappings, file, indent=4)


# ============================================================
# GET AC NAME
# ============================================================

def get_ac_device_name(ac_id):

    if not os.path.exists(DATA_FILE):
        return ac_id

    try:
        with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
            data = json.load(file)

        # Find latest occurrence of AC
        for record in reversed(data):
            if str(record.get("ac_id", "")) == str(ac_id):
                return record.get("device_name") or ac_id

    except Exception:
        pass

    return ac_id


# ============================================================
# DEVICES API
# ============================================================

@api_view(["GET", "POST"])
def devices(request):

    device_map = build_device_location_map()

    # ========================================================
    # GET
    # ========================================================

    if request.method == "GET":

        location_index = build_location_index()

        result = []

        for ac_id, mapping in device_map.items():

            location_key = (
                mapping.get("floor_id")
                or mapping.get("branch_id")
                or mapping.get("site_id")
            )

            location = location_index.get(location_key, {})

            result.append({
                "ac_id": ac_id,
                **mapping,
                **location,
            })

        return JsonResponse({
            "status": "success",
            "count": len(result),
            "data": result,
        })

    # ========================================================
    # POST
    # ========================================================

    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Invalid JSON body"},
            status=400,
        )

    ac_id = str(body.get("ac_id", "")).strip()
    hierarchy_type = str(body.get("hierarchy_type", "")).strip().upper()
    floor_id = str(body.get("floor_id", "")).strip()
    branch_id = str(body.get("branch_id", "")).strip()
    site_id = str(body.get("site_id", "")).strip()
    device_name = str(body.get("device_name", "")).strip()
    status_value = str(body.get("status", "OFF")).strip().upper()

    # --------------------------------------------------------
    # Required validation
    # --------------------------------------------------------

    if not ac_id:
        return JsonResponse(
            {"status": "error", "message": "ac_id is required"},
            status=400,
        )

    if hierarchy_type not in {"GEOGRAPHICAL", "ZONAL"}:
        return JsonResponse(
            {
                "status": "error",
                "message": "hierarchy_type must be 'GEOGRAPHICAL' or 'ZONAL'",
            },
            status=400,
        )

    if not floor_id and not branch_id:
        return JsonResponse(
            {
                "status": "error",
                "message": "Either floor_id or branch_id is required",
            },
            status=400,
        )

    # --------------------------------------------------------
    # Default values
    # --------------------------------------------------------

    if not site_id:
        site_id = ac_id  # Keep AC ID and site ID linked

    if not device_name:
        device_name = get_ac_device_name(ac_id)

    if status_value not in {"ON", "OFF"}:
        status_value = "OFF"

    # --------------------------------------------------------
    # Select correct location file
    # --------------------------------------------------------

    if hierarchy_type == "GEOGRAPHICAL":
        location_file = GEOGRAPHICAL_LOCATION_FILE
    else:
        location_file = ZONAL_LOCATION_FILE

    tree = load_location_tree(location_file)

    # --------------------------------------------------------
    # Find target branch/floor
    # --------------------------------------------------------

    target = find_location_target(
        tree,
        hierarchy_type,
        branch_id=branch_id,
        floor_id=floor_id,
    )

    if not target:
        return JsonResponse(
            {
                "status": "error",
                "message": (
                    "Selected floor/branch was not found "
                    "in the selected hierarchy"
                ),
            },
            status=404,
        )

    branch = target["branch"]
    floor = target["floor"]
    context = target["context"]

    # --------------------------------------------------------
    # Remove previous location of this AC
    # --------------------------------------------------------

    old_mapping = device_map.get(ac_id, {})
    old_site_id = old_mapping.get("site_id") or ac_id

    remove_site_from_tree(tree, old_site_id)

    # Also remove AC ID if used as site_id previously
    if old_site_id != ac_id:
        remove_site_from_tree(tree, ac_id)

    # --------------------------------------------------------
    # Create new site
    # --------------------------------------------------------

    site = {
        "site_id": site_id,
        "device_name": device_name,
        "status": status_value,
    }

    if floor is not None:

        # AC under FLOOR
        floor.setdefault("sites", [])
        floor["sites"].append(site)

        location_type = "FLOOR"
        assigned_floor_id = floor.get("floor_id", "")
        assigned_floor_name = floor.get("floor_name", "")

    else:

        # AC directly under BRANCH
        branch.setdefault("sites", [])
        branch["sites"].append(site)

        location_type = "DIRECT_BRANCH"
        assigned_floor_id = ""
        assigned_floor_name = ""

    # --------------------------------------------------------
    # Save location tree
    # --------------------------------------------------------

    save_location_tree(tree, location_file)

    # --------------------------------------------------------
    # Save device mapping
    # --------------------------------------------------------

    mapping = dict(old_mapping)

    mapping.update({
        "ac_id": ac_id,
        "site_id": site_id,
        "device_name": device_name,
        "location_type": location_type,
        "hierarchy_type": hierarchy_type,

        "branch_id": branch.get("branch_id", ""),
        "branch_name": branch.get("branch_name", ""),

        "floor_id": assigned_floor_id,
        "floor_name": assigned_floor_name,
    })

    # Add hierarchy-specific context
    mapping.update(context)

    device_map[ac_id] = mapping

    save_device_location_map(device_map)

    # --------------------------------------------------------
    # Success response
    # --------------------------------------------------------

    return JsonResponse(
        {
            "status": "success",
            "message": f"{ac_id} assigned successfully",
            "data": {
                "ac_id": ac_id,
                "site_id": site_id,
                "device_name": device_name,
                "hierarchy_type": hierarchy_type,
                "location_type": location_type,
                "branch_id": branch.get("branch_id", ""),
                "branch_name": branch.get("branch_name", ""),
                "floor_id": assigned_floor_id,
                "floor_name": assigned_floor_name,
            },
        },
        status=201,
    )


# ============================================================
# LOCATION HELPERS
# ============================================================

def make_code_id(existing_ids, name, prefix=""):
    """Generate a short, unique, human-readable id for a location node."""
    words = [w for w in name.strip().split() if w]

    if len(words) >= 2:
        base = (words[0][0] + words[1][0]).upper()
    else:
        base = name.strip()[:2].upper()

    base = f"{prefix}{base}" if prefix else base

    candidate = base
    suffix = 1

    while candidate in existing_ids:
        suffix += 1
        candidate = f"{base}{suffix}"

    return candidate


# ============================================================
# LOCATIONS API (GET tree, POST create)
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([ReadOnlyOrAuthenticated])
def locations(request):

    # ================================================================
    # GET
    # ================================================================
    if request.method == "GET":

        hierarchy = request.GET.get("hierarchy", "").strip().upper()

        try:
            if hierarchy == "GEOGRAPHICAL":
                data = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)
                return JsonResponse(
                    {
                        "success": True,
                        "hierarchy_type": "GEOGRAPHICAL",
                        "data": data,
                    },
                    safe=True,
                )

            if hierarchy == "ZONAL":
                data = load_location_tree(ZONAL_LOCATION_FILE)
                return JsonResponse(
                    {
                        "success": True,
                        "hierarchy_type": "ZONAL",
                        "data": data,
                    },
                    safe=True,
                )

            geographical_data = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)
            zonal_data = load_location_tree(ZONAL_LOCATION_FILE)

            return JsonResponse(
                {
                    "success": True,
                    "geographical": {
                        "hierarchy_type": "GEOGRAPHICAL",
                        "data": geographical_data,
                    },
                    "zonal": {
                        "hierarchy_type": "ZONAL",
                        "data": zonal_data,
                    },
                },
                safe=True,
            )

        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON format"},
                status=500,
            )

        except Exception as e:
            return JsonResponse(
                {"success": False, "message": str(e)},
                status=500,
            )

    # ================================================================
    # POST
    # ================================================================

    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "message": "Invalid JSON body"},
            status=400,
        )

    hierarchy = str(body.get("hierarchy_type", "")).strip().upper()

    if hierarchy not in {"ZONAL", "GEOGRAPHICAL"}:
        return JsonResponse(
            {
                "success": False,
                "message": "hierarchy_type must be 'ZONAL' or 'GEOGRAPHICAL'",
            },
            status=400,
        )

    location_file = (
        ZONAL_LOCATION_FILE if hierarchy == "ZONAL" else GEOGRAPHICAL_LOCATION_FILE
    )

    try:
        tree = load_location_tree(location_file)
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "message": "Invalid JSON format"},
            status=500,
        )

    # ================================================================
    # ZONAL HIERARCHY
    #
    # India -> Zone -> Circle -> Region -> Division -> Branch -> Floor -> Site
    # ================================================================

    if hierarchy == "ZONAL":

        zone_name = str(body.get("zone_name", "")).strip()
        circle_name = str(body.get("circle_name", "")).strip()
        region_name = str(body.get("region_name", "")).strip()
        division_name = str(body.get("division_name", "")).strip()
        branch_name = str(body.get("branch_name", "")).strip()
        floor_name = str(body.get("floor_name", "")).strip()

        missing = [
            field
            for field, value in [
                ("zone_name", zone_name),
                ("circle_name", circle_name),
                ("region_name", region_name),
                ("division_name", division_name),
                ("branch_name", branch_name),
                ("floor_name", floor_name),
            ]
            if not value
        ]

        if missing:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Missing required field(s): " + ", ".join(missing),
                },
                status=400,
            )

        # ------------------------------------------------------------
        # ZONE
        # ------------------------------------------------------------

        zone = next(
            (
                z for z in tree
                if z.get("zone_name", "").strip().lower() == zone_name.lower()
            ),
            None,
        )

        if zone is None:
            zone_ids = {z.get("zone_id", "") for z in tree}

            zone = {
                "zone_id": make_code_id(zone_ids, zone_name, prefix="ZN-"),
                "zone_name": zone_name,
                "circles": [],
            }
            tree.append(zone)

        # ------------------------------------------------------------
        # CIRCLE
        # ------------------------------------------------------------

        circle = next(
            (
                c for c in zone.get("circles", [])
                if c.get("circle_name", "").strip().lower() == circle_name.lower()
            ),
            None,
        )

        if circle is None:
            circle_ids = {
                c.get("circle_id", "")
                for z in tree
                for c in z.get("circles", [])
            }

            circle = {
                "circle_id": make_code_id(
                    circle_ids, circle_name, prefix=f"{zone['zone_id']}-C"
                ),
                "circle_name": circle_name,
                "regions": [],
            }
            zone.setdefault("circles", []).append(circle)

        # ------------------------------------------------------------
        # REGION
        # ------------------------------------------------------------

        region = next(
            (
                r for r in circle.get("regions", [])
                if r.get("region_name", "").strip().lower() == region_name.lower()
            ),
            None,
        )

        if region is None:
            region_ids = {
                r.get("region_id", "")
                for z in tree
                for c in z.get("circles", [])
                for r in c.get("regions", [])
            }

            region = {
                "region_id": make_code_id(
                    region_ids, region_name, prefix=f"{circle['circle_id']}-R"
                ),
                "region_name": region_name,
                "divisions": [],
            }
            circle.setdefault("regions", []).append(region)

        # ------------------------------------------------------------
        # DIVISION
        # ------------------------------------------------------------

        division = next(
            (
                d for d in region.get("divisions", [])
                if d.get("division_name", "").strip().lower() == division_name.lower()
            ),
            None,
        )

        if division is None:
            division_ids = {
                d.get("division_id", "")
                for z in tree
                for c in z.get("circles", [])
                for r in c.get("regions", [])
                for d in r.get("divisions", [])
            }

            division = {
                "division_id": make_code_id(
                    division_ids, division_name, prefix=f"{region['region_id']}-D"
                ),
                "division_name": division_name,
                "branches": [],
            }
            region.setdefault("divisions", []).append(division)

        # ------------------------------------------------------------
        # BRANCH
        # ------------------------------------------------------------

        branch = next(
            (
                b for b in division.get("branches", [])
                if b.get("branch_name", "").strip().lower() == branch_name.lower()
            ),
            None,
        )

        if branch is None:
            branch_index = len(division.get("branches", [])) + 1

            branch = {
                "branch_id": f"{division['division_id']}-B{branch_index:02d}",
                "branch_name": branch_name,
                "floors": [],
                "sites": [],
            }
            division.setdefault("branches", []).append(branch)

        # ------------------------------------------------------------
        # FLOOR
        # ------------------------------------------------------------

        if any(
            f.get("floor_name", "").strip().lower() == floor_name.lower()
            for f in branch.get("floors", [])
        ):
            return JsonResponse(
                {
                    "success": False,
                    "message": f"Floor '{floor_name}' already exists in this branch",
                },
                status=409,
            )

        floor_index = len(branch.get("floors", [])) + 1

        floor = {
            "floor_id": f"{branch['branch_id']}-F{floor_index:02d}",
            "floor_name": floor_name,
            "sites": [],
        }
        branch.setdefault("floors", []).append(floor)

        save_location_tree(tree, location_file)

        return JsonResponse(
            {
                "success": True,
                "hierarchy_type": "ZONAL",
                "data": {
                    "zone_id": zone["zone_id"],
                    "zone_name": zone["zone_name"],

                    "circle_id": circle["circle_id"],
                    "circle_name": circle["circle_name"],

                    "region_id": region["region_id"],
                    "region_name": region["region_name"],

                    "division_id": division["division_id"],
                    "division_name": division["division_name"],

                    "branch_id": branch["branch_id"],
                    "branch_name": branch["branch_name"],

                    "floor_id": floor["floor_id"],
                    "floor_name": floor["floor_name"],
                },
            },
            status=201,
        )

    # ================================================================
    # GEOGRAPHICAL HIERARCHY
    #
    # India -> State -> District -> Taluka -> City -> Branch -> Floor -> Site
    # ================================================================

    state_name = str(body.get("state_name", "")).strip()
    district_name = str(body.get("district_name", "")).strip()
    taluka_name = str(body.get("taluka_name", "")).strip()
    city_name = str(body.get("city_name", "")).strip()
    branch_name = str(body.get("branch_name", "")).strip()
    floor_name = str(body.get("floor_name", "")).strip()

    missing = [
        field
        for field, value in [
            ("state_name", state_name),
            ("district_name", district_name),
            ("taluka_name", taluka_name),
            ("city_name", city_name),
            ("branch_name", branch_name),
            ("floor_name", floor_name),
        ]
        if not value
    ]

    if missing:
        return JsonResponse(
            {
                "success": False,
                "message": "Missing required field(s): " + ", ".join(missing),
            },
            status=400,
        )

    # ------------------------------------------------------------
    # STATE
    # ------------------------------------------------------------

    state = next(
        (
            s for s in tree
            if s.get("state_name", "").strip().lower() == state_name.lower()
        ),
        None,
    )

    if state is None:
        state_ids = {s.get("state_id", "") for s in tree}

        state = {
            "state_id": make_code_id(state_ids, state_name),
            "state_name": state_name,
            "districts": [],
        }
        tree.append(state)

    # ------------------------------------------------------------
    # DISTRICT
    # ------------------------------------------------------------

    district = next(
        (
            d for d in state.get("districts", [])
            if d.get("district_name", "").strip().lower() == district_name.lower()
        ),
        None,
    )

    if district is None:
        district_index = len(state.get("districts", [])) + 1

        district = {
            "district_id": f"{state['state_id']}-D{district_index:02d}",
            "district_name": district_name,
            "talukas": [],
        }
        state.setdefault("districts", []).append(district)

    # ------------------------------------------------------------
    # TALUKA
    # ------------------------------------------------------------

    taluka = next(
        (
            t for t in district.get("talukas", [])
            if t.get("taluka_name", "").strip().lower() == taluka_name.lower()
        ),
        None,
    )

    if taluka is None:
        taluka_index = len(district.get("talukas", [])) + 1

        taluka = {
            "taluka_id": f"{district['district_id']}-T{taluka_index:02d}",
            "taluka_name": taluka_name,
            "cities": [],
        }
        district.setdefault("talukas", []).append(taluka)

    # ------------------------------------------------------------
    # CITY
    # ------------------------------------------------------------

    city = next(
        (
            c for c in taluka.get("cities", [])
            if c.get("city_name", "").strip().lower() == city_name.lower()
        ),
        None,
    )

    if city is None:
        city_index = len(taluka.get("cities", [])) + 1

        city = {
            "city_id": f"{taluka['taluka_id']}-C{city_index:02d}",
            "city_name": city_name,
            "branches": [],
        }
        taluka.setdefault("cities", []).append(city)

    # ------------------------------------------------------------
    # BRANCH
    # ------------------------------------------------------------

    branch = next(
        (
            b for b in city.get("branches", [])
            if b.get("branch_name", "").strip().lower() == branch_name.lower()
        ),
        None,
    )

    if branch is None:
        branch_index = len(city.get("branches", [])) + 1

        branch = {
            "branch_id": f"{city['city_id']}-B{branch_index:02d}",
            "branch_name": branch_name,
            "floors": [],
            "sites": [],
        }
        city.setdefault("branches", []).append(branch)

    # ------------------------------------------------------------
    # FLOOR
    # ------------------------------------------------------------

    if any(
        f.get("floor_name", "").strip().lower() == floor_name.lower()
        for f in branch.get("floors", [])
    ):
        return JsonResponse(
            {
                "success": False,
                "message": f"Floor '{floor_name}' already exists in this branch",
            },
            status=409,
        )

    floor_index = len(branch.get("floors", [])) + 1

    floor = {
        "floor_id": f"{branch['branch_id']}-F{floor_index:02d}",
        "floor_name": floor_name,
        "sites": [],
    }
    branch.setdefault("floors", []).append(floor)

    save_location_tree(tree, location_file)

    return JsonResponse(
        {
            "success": True,
            "hierarchy_type": "GEOGRAPHICAL",
            "data": {
                "state_id": state["state_id"],
                "state_name": state["state_name"],

                "district_id": district["district_id"],
                "district_name": district["district_name"],

                "taluka_id": taluka["taluka_id"],
                "taluka_name": taluka["taluka_name"],

                "city_id": city["city_id"],
                "city_name": city["city_name"],

                "branch_id": branch["branch_id"],
                "branch_name": branch["branch_name"],

                "floor_id": floor["floor_id"],
                "floor_name": floor["floor_name"],
            },
        },
        status=201,
    )


# ============================================================
# FILTERING & ENRICHMENT HELPERS
# ============================================================

def matches(value, selected):
    if not selected:
        return True
    return str(value).strip().lower() == str(selected).strip().lower()

GEOGRAPHICAL_FIELDS = [
    "state_id", "state_name",
    "district_id", "district_name",
    "taluka_id", "taluka_name",
    "city_id", "city_name",
    "branch_id", "branch_name",
    "floor_id", "floor_name",
    "site_id",
]

ZONAL_FIELDS = [
    "zone_id", "zone_name",
    "circle_id", "circle_name",
    "region_id", "region_name",
    "division_id", "division_name",
    "branch_id", "branch_name",
    "floor_id", "floor_name",
    "site_id",
]


def resolve_ac_location(ac_id, device_map):
    mapping = device_map.get(ac_id, {})

    if not mapping:
        return {
            "geographical": {},
            "zonal": {},
            "site_id": "",
            "device_name": "",
            "location_type": "",
            "hierarchy_type": "",
        }

    # --- Nested shape (seeded data) --------------------------------
    if "geographical" in mapping or "zonal" in mapping:
        geo = mapping.get("geographical") or {}
        zon = mapping.get("zonal") or {}

        hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()
        if not hierarchy_type:
            # Both blocks are usually present in the seeded data, so
            # don't assume one over the other for filtering purposes.
            hierarchy_type = ""

        return {
            "geographical": geo,
            "zonal": zon,
            "site_id": mapping.get("site_id", ""),
            "device_name": mapping.get("device_name", ""),
            "location_type": mapping.get("location_type", ""),
            "hierarchy_type": hierarchy_type,
        }

    # --- Flat shape (written by /devices/ POST) ---------------------
    hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()

    geo = {}
    zon = {}

    if hierarchy_type == "GEOGRAPHICAL":
        geo = {field: mapping.get(field, "") for field in GEOGRAPHICAL_FIELDS}
    elif hierarchy_type == "ZONAL":
        zon = {field: mapping.get(field, "") for field in ZONAL_FIELDS}

    return {
        "geographical": geo,
        "zonal": zon,
        "site_id": mapping.get("site_id", ""),
        "device_name": mapping.get("device_name", ""),
        "location_type": mapping.get("location_type", ""),
        "hierarchy_type": hierarchy_type,
    }


def filter_by_location(data, request):
    hierarchy = request.GET.get("hierarchy", "").strip().upper()

    zone     = request.GET.get("zone", "").strip()
    state    = request.GET.get("state", "").strip()
    district = request.GET.get("district", "").strip()
    taluka   = request.GET.get("taluka", "").strip()
    circle   = request.GET.get("circle", "").strip()
    region   = request.GET.get("region", "").strip()
    division = request.GET.get("division", "").strip()
    city     = request.GET.get("city", "").strip()
    branch   = request.GET.get("branch", "").strip()
    floor    = request.GET.get("floor", "").strip()

    # Nothing to filter on → return everything
    if not any([hierarchy, zone, state, district, taluka, circle,
                region, division, city, branch, floor]):
        return data

    device_map = build_device_location_map()

    def keep(record):
        ac_id = record.get("ac_id", "")
        loc   = resolve_ac_location(ac_id, device_map)
        geo   = loc["geographical"]
        zon   = loc["zonal"]

        if hierarchy == "GEOGRAPHICAL":
            if not geo:
                return False
            return (
                matches(geo.get("state_name", ""),    state)
                and matches(geo.get("district_name", ""), district)
                and matches(geo.get("taluka_name", ""),   taluka)
                and matches(geo.get("city_name", ""),     city)
                and matches(geo.get("branch_name", ""),   branch)
                and matches(geo.get("floor_name", ""),    floor)
            )

        if hierarchy == "ZONAL":
            if not zon:
                return False
            return (
                matches(zon.get("zone_name", ""),     zone)
                and matches(zon.get("circle_name", ""),   circle)
                and matches(zon.get("region_name", ""),   region)
                and matches(zon.get("division_name", ""), division)
                and matches(zon.get("branch_name", ""),   branch)
                and matches(zon.get("floor_name", ""),    floor)
            )

        # No hierarchy specified — fall back to matching whatever
        # individual filters were sent against whichever block has
        # that field.
        branch_name = geo.get("branch_name") or zon.get("branch_name") or ""
        floor_name  = geo.get("floor_name") or zon.get("floor_name") or ""

        return (
            matches(geo.get("state_name", ""),    state)
            and matches(geo.get("district_name", ""), district)
            and matches(geo.get("taluka_name", ""),   taluka)
            and matches(geo.get("city_name", ""),     city)
            and matches(zon.get("zone_name", ""),     zone)
            and matches(zon.get("circle_name", ""),   circle)
            and matches(zon.get("region_name", ""),   region)
            and matches(zon.get("division_name", ""), division)
            and matches(branch_name, branch)
            and matches(floor_name, floor)
        )

    return [record for record in data if keep(record)]


def attach_location(record, device_map):
    enriched = dict(record)
    ac_id    = record.get("ac_id", "")
    loc      = resolve_ac_location(ac_id, device_map)

    enriched.update(loc["geographical"])
    enriched.update(loc["zonal"])

    if loc["site_id"]:
        enriched["site_id"] = loc["site_id"]
    if loc["device_name"]:
        enriched["device_name"] = loc["device_name"]

    enriched["location_type"] = loc["location_type"]
    enriched["hierarchy_type"] = loc["hierarchy_type"]

    return enriched


@api_view(["GET"])
@permission_classes([AllowAny])
def ac_data_with_location(request):
    try:
        if not os.path.exists(DATA_FILE):
            return JsonResponse(
                {"status": "error", "message": "ac_data.json file not found"},
                status=404,
            )

        with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
            data = json.load(file)

        data = filter_by_location(data, request)

        device_map = build_device_location_map()
        data = [attach_location(rec, device_map) for rec in data]

        return JsonResponse(
            {"status": "success", "count": len(data), "data": data},
            safe=True,
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Invalid JSON format"},
            status=500,
        )

    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": str(e)},
            status=500,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def ac_data(request):
    try:
        if not os.path.exists(DATA_FILE):
            return JsonResponse(
                {"status": "error", "message": "ac_data.json file not found"},
                status=404,
            )

        with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
            data = json.load(file)

        data = filter_by_location(data, request)

        device_map = build_device_location_map()
        data = [attach_location(rec, device_map) for rec in data]

        return JsonResponse(
            {"status": "success", "count": len(data), "data": data},
            safe=True,
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Invalid JSON format"},
            status=500,
        )

    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": str(e)},
            status=500,
        )


@api_view(["GET"])
def latest_ac_data(request):
    try:
        if not os.path.exists(DATA_FILE):
            return JsonResponse(
                {"status": "error", "message": "ac_data.json file not found"},
                status=404,
            )

        with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
            data = json.load(file)

        if not data:
            return JsonResponse({"status": "success", "data": None})

        return JsonResponse({"status": "success", "data": data[-1]})

    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": str(e)},
            status=500,
        )


# ============================================================
# AUTH VIEWS
# ============================================================

def get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_attempt(request, success, user=None, email="", role="", reason=""):
    LoginAudit.objects.create(
        user=user,
        email_attempted=email,
        role_attempted=role,
        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
        success=success,
        reason=reason,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Body: { "email": "...", "password": "...", "role": "ORG_SUPER_ADMIN" }
    """
    serializer = LoginSerializer(data=request.data, context={"request": request})

    if not serializer.is_valid():
        log_attempt(
            request,
            success=False,
            email=request.data.get("email", ""),
            role=request.data.get("role", ""),
            reason=str(serializer.errors),
        )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.validated_data["user"]

    user.last_login = timezone.now()
    user.last_login_ip = get_client_ip(request)
    user.save(update_fields=["last_login", "last_login_ip"])

    django_login(request, user)
    token, _ = Token.objects.get_or_create(user=user)

    log_attempt(request, success=True, user=user, email=user.email, role=user.role)

    return Response(
        {
            "token": token.key,
            "user": UserSerializer(user).data,
            "redirect": _dashboard_path(user.role),
        },
        status=status.HTTP_200_OK,
    )


def _dashboard_path(role):
    return {
        Role.ORG_SUPER_ADMIN: "/org/dashboard",
        Role.CUSTOMER: "/customer/dashboard",
        Role.BR_ADMIN: "/admin/dashboard",
        Role.ENGINEER: "/engineer/dashboard",
    }.get(role, "/login")


@api_view(["POST"])
def logout_view(request):
    """POST /api/auth/logout/"""
    if request.user.is_authenticated:
        Token.objects.filter(user=request.user).delete()
        django_logout(request)
    return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


@api_view(["GET"])
def me_view(request):
    """GET /api/auth/me/ — returns current user's profile & scope."""
    return Response(UserSerializer(request.user).data)


# ============================================================
# SCOPED QUERYSET HELPER
# ============================================================

def scoped_queryset(model, user, level_map):
    level, scope_id = user.get_scope()
    if level == "ORGANIZATION":
        return model.objects.filter(
            **{f"{level_map['ORGANIZATION']}": user.organization_id}
        )
    if level in level_map and scope_id:
        return model.objects.filter(**{level_map[level]: scope_id})
    return model.objects.none()


# ============================================================
# ORGANIZATION / CUSTOMER VIEWS
# ============================================================

class OrganizationListView(generics.ListAPIView):
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ORG_SUPER_ADMIN:
            return Organization.objects.filter(pk=user.organization_id)
        return Organization.objects.none()


class CustomerListView(CustomerScopeMixin, generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsOrgSuperAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "company", "code", "company_email",
        "contact_person", "contact_person_email", "phone",
    ]
    ordering_fields = ["company", "code", "created_at"]
    ordering = ["company"]

    def get_queryset(self):
        qs = super().get_queryset()

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

        return qs

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class CustomerDetailView(CustomerScopeMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsOrgSuperAdmin]
    lookup_field = "pk"

    def perform_destroy(self, instance):
        instance.delete()


# ============================================================
# ADMIN / ENGINEER VIEWS
# ============================================================

ADMIN_ROLES = [
    Role.ORG_SUPER_ADMIN,
    Role.CUSTOMER,
    Role.BR_ADMIN,
    Role.ENGINEER,
]


from .permissions import (
    CustomerScopeMixin,
    IsOrgSuperAdmin,
    IsOrgAdminOrCustomerAdmin,   # ← import the new one
)


class AdminListView(generics.ListCreateAPIView):
    serializer_class = AdminSerializer
    permission_classes = [IsOrgAdminOrCustomerAdmin]   # ← was IsOrgSuperAdmin
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "phone", "role"]
    ordering_fields = ["name", "email", "date_joined"]
    ordering = ["name"]

    def get_queryset(self):
        user = self.request.user
        base = User.objects.select_related(
            "organization", "customer", "zone", "circle", "branch", "site"
        )

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = base.filter(organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = base.filter(customer_id=user.customer_id)
        elif user.role == Role.BR_ADMIN:
            qs = base.filter(branch_id=user.branch_id)
        else:
            return base.none()

        qs = qs.filter(role__in=ADMIN_ROLES)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

        return qs

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == Role.CUSTOMER:
            serializer.save(
                organization=user.organization,
                customer=user.customer,
            )
        else:
            serializer.save(organization=user.organization)

class AdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminSerializer
    permission_classes = [IsOrgAdminOrCustomerAdmin]   # ← was IsOrgSuperAdmin
    lookup_field = "pk"

    def get_queryset(self):
        user = self.request.user
        base = User.objects.all()

        if user.role == Role.ORG_SUPER_ADMIN:
            return base.filter(organization_id=user.organization_id)
        if user.role == Role.CUSTOMER:
            return base.filter(customer_id=user.customer_id)
        if user.role == Role.BR_ADMIN:
            return base.filter(branch_id=user.branch_id)
        return base.none()
    
class EngListView(generics.ListCreateAPIView):
    serializer_class = AdminSerializer  # same shape as admins
    permission_classes = [IsOrgSuperAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "phone"]
    ordering_fields = ["name", "email", "date_joined"]
    ordering = ["name"]

    def get_queryset(self):
        user = self.request.user
        base = User.objects.select_related(
            "organization", "customer", "zone", "circle", "branch", "site"
        ).filter(role=Role.ENGINEER)  # engineers only

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = base.filter(organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = base.filter(customer_id=user.customer_id)
        elif user.role == Role.BR_ADMIN:
            qs = base.filter(branch_id=user.branch_id)
        else:
            return base.none()

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

        return qs

    # def perform_create(self, serializer):
    #     # Force role to ENGINEER regardless of what the client sends
    #     serializer.save(
    #         role=Role.ENGINEER,
    #         organization=self.request.user.organization,
    #     )

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == Role.CUSTOMER:
            serializer.save(
                role=Role.ENGINEER,
                organization=user.organization,
                customer=user.customer,
            )
        else:
            serializer.save(
                role=Role.ENGINEER,
                organization=user.organization,
            )


class EngDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminSerializer
    permission_classes = [IsOrgSuperAdmin]
    lookup_field = "pk"

    def get_queryset(self):
        user = self.request.user
        base = User.objects.filter(role=Role.ENGINEER)

        if user.role == Role.ORG_SUPER_ADMIN:
            return base.filter(organization_id=user.organization_id)
        if user.role == Role.CUSTOMER:
            return base.filter(customer_id=user.customer_id)
        if user.role == Role.BR_ADMIN:
            return base.filter(branch_id=user.branch_id)
        return base.none()


class ZoneListView(generics.ListAPIView):
    serializer_class = ZoneSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ORG_SUPER_ADMIN:
            return Zone.objects.filter(customer__organization_id=user.organization_id)
        if user.role == Role.CUSTOMER:
            return Zone.objects.filter(customer_id=user.customer_id)
        if user.role in [Role.BR_ADMIN, Role.ENGINEER]:
            return Zone.objects.filter(pk=user.zone_id)
        return Zone.objects.none()


class CircleListView(generics.ListAPIView):
    serializer_class = CircleSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ORG_SUPER_ADMIN:
            return Circle.objects.filter(zone__customer__organization_id=user.organization_id)
        if user.role == Role.CUSTOMER:
            return Circle.objects.filter(zone__customer_id=user.customer_id)
        if user.role in [Role.BR_ADMIN, Role.ENGINEER]:
            return Circle.objects.filter(pk=user.circle_id)
        return Circle.objects.none()


class BranchListView(generics.ListAPIView):
    serializer_class = BranchSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ORG_SUPER_ADMIN:
            return Branch.objects.filter(circle__zone__customer__organization_id=user.organization_id)
        if user.role == Role.CUSTOMER:
            return Branch.objects.filter(circle__zone__customer_id=user.customer_id)
        if user.role == Role.BR_ADMIN:
            return Branch.objects.filter(pk=user.branch_id)
        if user.role == Role.ENGINEER:
            return Branch.objects.filter(pk=user.branch_id)
        return Branch.objects.none()


class SiteListView(generics.ListAPIView):
    serializer_class = SiteSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ORG_SUPER_ADMIN:
            return Site.objects.filter(branch__circle__zone__customer__organization_id=user.organization_id)
        if user.role == Role.CUSTOMER:
            return Site.objects.filter(branch__circle__zone__customer_id=user.customer_id)
        if user.role == Role.BR_ADMIN:
            return Site.objects.filter(branch_id=user.branch_id)
        if user.role == Role.ENGINEER:
            return Site.objects.filter(pk=user.site_id)
        return Site.objects.none()


class UserListView(generics.ListCreateAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ORG_SUPER_ADMIN:
            return User.objects.filter(organization_id=user.organization_id)
        if user.role == Role.CUSTOMER:
            return User.objects.filter(customer_id=user.customer_id)
        if user.role == Role.BR_ADMIN:
            return User.objects.filter(branch_id=user.branch_id)
        return User.objects.none()


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

# @api_view(["GET"])
# def dashboard_summary_view(request):
#     user = request.user
#     data = {"role": user.role, "scope_name": user.scope_name}

#     if user.role == Role.ORG_SUPER_ADMIN:
#         data.update({
#             "customers": Customer.objects.filter(organization_id=user.organization_id).count(),
#             "zones":     Zone.objects.filter(customer__organization_id=user.organization_id).count(),
#             "circles":   Circle.objects.filter(zone__customer__organization_id=user.organization_id).count(),
#             "branches":  Branch.objects.filter(circle__zone__customer__organization_id=user.organization_id).count(),
#             "sites":     Site.objects.filter(branch__circle__zone__customer__organization_id=user.organization_id).count(),
#             "engineers": User.objects.filter(
#                 role=Role.ENGINEER, organization_id=user.organization_id
#             ).count(),
#         })

#     elif user.role == Role.CUSTOMER:
#         data.update({
#             "zones":     Zone.objects.filter(customer_id=user.customer_id).count(),
#             "circles":   Circle.objects.filter(zone__customer_id=user.customer_id).count(),
#             "branches":  Branch.objects.filter(circle__zone__customer_id=user.customer_id).count(),
#             "sites":     Site.objects.filter(branch__circle__zone__customer_id=user.customer_id).count(),
#             "engineers": User.objects.filter(role=Role.ENGINEER, customer_id=user.customer_id).count(),
#         })

#     elif user.role == Role.ZONAL_ADMIN:
#         data.update({
#             "circles":   Circle.objects.filter(zone_id=user.zone_id).count(),
#             "branches":  Branch.objects.filter(circle__zone_id=user.zone_id).count(),
#             "sites":     Site.objects.filter(branch__circle__zone_id=user.zone_id).count(),
#             "engineers": User.objects.filter(role=Role.ENGINEER, zone_id=user.zone_id).count(),
#         })

#     elif user.role == Role.CIRCLE_ADMIN:
#         data.update({
#             "branches":  Branch.objects.filter(circle_id=user.circle_id).count(),
#             "sites":     Site.objects.filter(branch__circle_id=user.circle_id).count(),
#             "engineers": User.objects.filter(role=Role.ENGINEER, circle_id=user.circle_id).count(),
#         })

#     elif user.role == Role.BR_ADMIN:
#         data.update({
#             "sites":     Site.objects.filter(branch_id=user.branch_id).count(),
#             "engineers": User.objects.filter(role=Role.ENGINEER, branch_id=user.branch_id).count(),
#         })

#     elif user.role == Role.ENGINEER:
#         data.update({
#             "my_sites": Site.objects.filter(pk=user.site_id).count(),
#         })

#     return Response(data)

@api_view(["GET"])
def dashboard_summary_view(request):
    user = request.user
    data = {"role": user.role, "scope_name": user.scope_name}

    if user.role == Role.ORG_SUPER_ADMIN:
        data.update({
            "customers": Customer.objects.filter(
                organization_id=user.organization_id
            ).count(),
            "zones": Zone.objects.filter(
                customer__organization_id=user.organization_id
            ).count(),
            "circles": Circle.objects.filter(
                zone__customer__organization_id=user.organization_id
            ).count(),
            "branches": Branch.objects.filter(
                circle__zone__customer__organization_id=user.organization_id
            ).count(),
            "sites": Site.objects.filter(
                branch__circle__zone__customer__organization_id=user.organization_id
            ).count(),
            "engineers": User.objects.filter(
                role=Role.ENGINEER, organization_id=user.organization_id
            ).count(),
        })

    elif user.role == Role.CUSTOMER:
        data.update({
            "zones": Zone.objects.filter(customer_id=user.customer_id).count(),
            "circles": Circle.objects.filter(
                zone__customer_id=user.customer_id
            ).count(),
            "branches": Branch.objects.filter(
                circle__zone__customer_id=user.customer_id
            ).count(),
            "sites": Site.objects.filter(
                branch__circle__zone__customer_id=user.customer_id
            ).count(),
            "engineers": User.objects.filter(
                role=Role.ENGINEER, customer_id=user.customer_id
            ).count(),
        })

    elif user.role == Role.BR_ADMIN:
        data.update({
            "sites": Site.objects.filter(branch_id=user.branch_id).count(),
            "engineers": User.objects.filter(
                role=Role.ENGINEER, branch_id=user.branch_id
            ).count(),
        })

    elif user.role == Role.ENGINEER:
        data.update({
            "my_sites": Site.objects.filter(pk=user.site_id).count(),
        })

    return Response(data)


# ============================================================
# LEGACY LOCATION VIEWS (LocationZone/State/Circle)
# ============================================================

@api_view(["GET"])
def LocationListView(request):
    return Response("Location Page")


def serialize_circle(circle):
    return {
        "id": circle.id,
        "circle_id": circle.circle_code,
        "circle_code": circle.circle_code,
        "circle_name": circle.circle_name,
        "state_id": circle.state_id,
    }


def serialize_state(state):
    return {
        "id": state.id,
        "state_id": state.state_code,
        "state_code": state.state_code,
        "state_name": state.state_name,
        "zone_id": state.zone_id,
        "circles": [serialize_circle(circle) for circle in state.circles.all()],
    }


def serialize_zone(zone):
    return {
        "id": zone.id,
        "zone_id": zone.zone_code,
        "zone_code": zone.zone_code,
        "zone_name": zone.zone_name,
        "states": [serialize_state(state) for state in zone.states.all()],
    }


@csrf_exempt
def location_detail(request, location_type, location_id):

    if request.method == "DELETE":
        try:
            if location_type == "zone":
                obj = LocationZone.objects.get(id=location_id)
            elif location_type == "state":
                obj = LocationState.objects.get(id=location_id)
            elif location_type == "circle":
                obj = LocationCircle.objects.get(id=location_id)
            else:
                return JsonResponse(
                    {"success": False, "message": "Invalid location type"},
                    status=400,
                )

            obj.delete()

            return JsonResponse(
                {
                    "success": True,
                    "message": f"{location_type.title()} deleted successfully",
                },
                status=200,
            )

        except (
            LocationZone.DoesNotExist,
            LocationState.DoesNotExist,
            LocationCircle.DoesNotExist,
        ):
            return JsonResponse(
                {"success": False, "message": "Location not found"},
                status=404,
            )

    if request.method == "PUT":
        try:
            body = json.loads(request.body.decode("utf-8"))

            if location_type == "zone":
                obj = LocationZone.objects.get(id=location_id)
                obj.zone_name = body.get("zone_name", obj.zone_name)
                obj.zone_code = body.get("zone_code", obj.zone_code)

            elif location_type == "state":
                obj = LocationState.objects.get(id=location_id)
                obj.state_name = body.get("state_name", obj.state_name)
                obj.state_code = body.get("state_code", obj.state_code)

            elif location_type == "circle":
                obj = LocationCircle.objects.get(id=location_id)
                obj.circle_name = body.get("circle_name", obj.circle_name)
                obj.circle_code = body.get("circle_code", obj.circle_code)

            else:
                return JsonResponse(
                    {"success": False, "message": "Invalid location type"},
                    status=400,
                )

            obj.save()

            return JsonResponse(
                {
                    "success": True,
                    "message": f"{location_type.title()} updated successfully",
                },
                status=200,
            )

        except (
            LocationZone.DoesNotExist,
            LocationState.DoesNotExist,
            LocationCircle.DoesNotExist,
        ):
            return JsonResponse(
                {"success": False, "message": "Location not found"},
                status=404,
            )

        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON"},
                status=400,
            )

    return JsonResponse(
        {"success": False, "message": "Method not allowed"},
        status=405,
    )