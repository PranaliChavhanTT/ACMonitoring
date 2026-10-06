# # My current view

# # from django.shortcuts import render
# # import json
# # import os

# # from django.conf import settings
# # from django.http import JsonResponse
# # from rest_framework.response import Response
# # from rest_framework.decorators import api_view, permission_classes
# # from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS

# # from rest_framework.authtoken.models import Token
# # from django.contrib.auth import login as django_login, logout as django_logout
# # from django.utils import timezone

# # from .models import (
# #     LocationCircle,
# #     LocationState,
# #     LocationZone,
# #     User,
# #     Organization,
# #     Customer,
# #     Zone,
# #     Circle,
# #     Region,
# #     Division,
# #     State,
# #     District,
# #     Taluka,
# #     City,
# #     Branch,
# #     Floor,
# #     Site,
# #     LoginAudit,
# #     Role,
# # )

# # from .serializers import (
# #     AdminSerializer, FloorSerializer, LoginSerializer, UserSerializer,
# #     OrganizationSerializer, CustomerSerializer, DashboardPreferenceSerializer, ZoneSerializer,
# #     CircleSerializer, StateSerializer, DistrictSerializer, BranchSerializer, SiteSerializer,
# # )

# # from .permissions import CustomerScopeMixin, IsOrgSuperAdmin
# # from rest_framework import status, generics, permissions, filters

# # from django.views.decorators.csrf import csrf_exempt
# # from django.db import IntegrityError
# # from django.core.exceptions import ValidationError as DjangoValidationError
# # from rest_framework.exceptions import ValidationError as DRFValidationError

# # class ReadOnlyOrAuthenticated(BasePermission):
# #     def has_permission(self, request, view):
# #         if request.method in SAFE_METHODS:
# #             return True
# #         return bool(request.user and request.user.is_authenticated)


# # BASE_DATA_DIR = os.path.join(settings.BASE_DIR, "data")

# # DATA_FILE = os.path.join(BASE_DATA_DIR, "ac_data.json")

# # GEOGRAPHICAL_LOCATION_FILE = os.path.join( BASE_DATA_DIR, "locationData_geographical.json")

# # ZONAL_LOCATION_FILE = os.path.join( BASE_DATA_DIR, "locationData_zonal.json")

# # DEVICE_LOCATION_MAP_FILE = os.path.join(BASE_DATA_DIR, "DeviceLocationMap.json")


# # def load_location_tree(location_file):
# #     if not os.path.exists(location_file):
# #         return []

# #     with open(location_file, "r", encoding="utf-8-sig") as file:
# #         return json.load(file)

# # def save_location_tree(tree, location_file):
# #     with open(location_file, "w", encoding="utf-8") as file:
# #         json.dump(tree, file, indent=4)

# # def iter_branches(tree, hierarchy_type):
# #     hierarchy_type = hierarchy_type.upper()

# #     if hierarchy_type == "GEOGRAPHICAL":

# #         for state in tree:
# #             for district in state.get("districts", []):
# #                 for taluka in district.get("talukas", []):
# #                     for city in taluka.get("cities", []):
# #                         for branch in city.get("branches", []):

# #                             context = {
# #                                 "hierarchy_type": "GEOGRAPHICAL",

# #                                 "state_id": state.get("state_id", ""),
# #                                 "state_name": state.get("state_name", ""),

# #                                 "district_id": district.get("district_id", ""),
# #                                 "district_name": district.get("district_name", ""),

# #                                 "taluka_id": taluka.get("taluka_id", ""),
# #                                 "taluka_name": taluka.get("taluka_name", ""),

# #                                 "city_id": city.get("city_id", ""),
# #                                 "city_name": city.get("city_name", ""),

# #                                 "branch_id": branch.get("branch_id", ""),
# #                                 "branch_name": branch.get("branch_name", ""),
# #                             }

# #                             yield branch, context

# #     elif hierarchy_type == "ZONAL":

# #         for zone in tree:
# #             for circle in zone.get("circles", []):
# #                 for region in circle.get("regions", []):
# #                     for division in region.get("divisions", []):
# #                         for branch in division.get("branches", []):

# #                             context = {
# #                                 "hierarchy_type": "ZONAL",

# #                                 "zone_id": zone.get("zone_id", ""),
# #                                 "zone_name": zone.get("zone_name", ""),

# #                                 "circle_id": circle.get("circle_id", ""),
# #                                 "circle_name": circle.get("circle_name", ""),

# #                                 "region_id": region.get("region_id", ""),
# #                                 "region_name": region.get("region_name", ""),

# #                                 "division_id": division.get("division_id", ""),
# #                                 "division_name": division.get("division_name", ""),

# #                                 "branch_id": branch.get("branch_id", ""),
# #                                 "branch_name": branch.get("branch_name", ""),
# #                             }

# #                             yield branch, context


# # def find_location_target(tree, hierarchy_type, branch_id="", floor_id=""):
# #     for branch, context in iter_branches(tree, hierarchy_type):
# #         if floor_id:
# #             for floor in branch.get("floors", []):
# #                 if str(floor.get("floor_id", "")) == str(floor_id):
# #                     return {
# #                         "branch": branch,
# #                         "floor": floor,
# #                         "context": context,
# #                     }

# #         if branch_id:
# #             if str(branch.get("branch_id", "")) == str(branch_id):
# #                 return {
# #                     "branch": branch,
# #                     "floor": None,
# #                     "context": context,
# #                 }
# #     return None

# # def remove_site_from_tree(tree, site_id):
# #     removed = False
# #     for hierarchy_type in ["GEOGRAPHICAL", "ZONAL"]:
# #         for branch, _ in iter_branches(tree, hierarchy_type):

# #             branch_sites = branch.get("sites", [])

# #             new_branch_sites = [
# #                 site for site in branch_sites
# #                 if str(site.get("site_id", "")) != str(site_id)
# #             ]

# #             if len(new_branch_sites) != len(branch_sites):
# #                 removed = True

# #             branch["sites"] = new_branch_sites

# #             # Floor sites
# #             for floor in branch.get("floors", []):

# #                 floor_sites = floor.get("sites", [])

# #                 new_floor_sites = [
# #                     site for site in floor_sites
# #                     if str(site.get("site_id", "")) != str(site_id)
# #                 ]

# #                 if len(new_floor_sites) != len(floor_sites):
# #                     removed = True

# #                 floor["sites"] = new_floor_sites
# #     return removed

# # def build_location_index():

# #     index = {}
# #     geographical_tree = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)

# #     for branch, context in iter_branches(geographical_tree, "GEOGRAPHICAL"):

# #         branch_id = branch.get("branch_id")

# #         if branch_id:
# #             index[branch_id] = {
# #                 **context,
# #                 "location_type": "BRANCH",
# #             }

# #         for floor in branch.get("floors", []):

# #             floor_id = floor.get("floor_id")

# #             if not floor_id:
# #                 continue

# #             index[floor_id] = {
# #                 **context,
# #                 "floor_id": floor_id,
# #                 "floor_name": floor.get("floor_name", ""),
# #                 "location_type": "FLOOR",
# #             }

# #             for site in floor.get("sites", []):

# #                 site_id = site.get("site_id")

# #                 if site_id:
# #                     index[site_id] = {
# #                         **context,
# #                         "floor_id": floor_id,
# #                         "floor_name": floor.get("floor_name", ""),
# #                         "site_id": site_id,
# #                         "device_name": site.get("device_name", ""),
# #                         "location_type": "FLOOR",
# #                     }

# #         for site in branch.get("sites", []):

# #             site_id = site.get("site_id")

# #             if site_id:
# #                 index[site_id] = {
# #                     **context,
# #                     "site_id": site_id,
# #                     "device_name": site.get("device_name", ""),
# #                     "location_type": "DIRECT_BRANCH",
# #                 }

# #     zonal_tree = load_location_tree(ZONAL_LOCATION_FILE)

# #     for branch, context in iter_branches(zonal_tree, "ZONAL"):

# #         branch_id = branch.get("branch_id")

# #         if branch_id:
# #             index[branch_id] = {
# #                 **context,
# #                 "location_type": "BRANCH",
# #             }

# #         for floor in branch.get("floors", []):

# #             floor_id = floor.get("floor_id")

# #             if not floor_id:
# #                 continue

# #             index[floor_id] = {
# #                 **context,
# #                 "floor_id": floor_id,
# #                 "floor_name": floor.get("floor_name", ""),
# #                 "location_type": "FLOOR",
# #             }

# #             for site in floor.get("sites", []):

# #                 site_id = site.get("site_id")

# #                 if site_id:
# #                     index[site_id] = {
# #                         **context,
# #                         "floor_id": floor_id,
# #                         "floor_name": floor.get("floor_name", ""),
# #                         "site_id": site_id,
# #                         "device_name": site.get("device_name", ""),
# #                         "location_type": "FLOOR",
# #                     }

# #         for site in branch.get("sites", []):

# #             site_id = site.get("site_id")

# #             if site_id:
# #                 index[site_id] = {
# #                     **context,
# #                     "site_id": site_id,
# #                     "device_name": site.get("device_name", ""),
# #                     "location_type": "DIRECT_BRANCH",
# #                 }

# #     return index


# # def build_device_location_map():

# #     if not os.path.exists(DEVICE_LOCATION_MAP_FILE):
# #         return {}

# #     try:
# #         with open(DEVICE_LOCATION_MAP_FILE, "r", encoding="utf-8-sig") as file:
# #             mappings = json.load(file)

# #         if isinstance(mappings, list):
# #             return {
# #                 item.get("ac_id"): item
# #                 for item in mappings
# #                 if isinstance(item, dict) and item.get("ac_id")
# #             }

# #         # Backward compatibility with old dict format
# #         if isinstance(mappings, dict):
# #             result = {}
# #             for ac_id, value in mappings.items():
# #                 if isinstance(value, dict):
# #                     item = dict(value)
# #                     item.setdefault("ac_id", ac_id)
# #                     result[ac_id] = item
# #                 else:
# #                     result[ac_id] = {
# #                         "ac_id": ac_id,
# #                         "floor_id": value,
# #                     }
# #             return result

# #         return {}

# #     except (json.JSONDecodeError, TypeError):
# #         return {}


# # def save_device_location_map(device_map):

# #     # Save as LIST because DEVICE_LOCATION.json uses a list of records.
# #     mappings = list(device_map.values())

# #     with open(DEVICE_LOCATION_MAP_FILE, "w", encoding="utf-8") as file:
# #         json.dump(mappings, file, indent=4)


# # # ============================================================
# # # GET AC NAME
# # # ============================================================

# # def get_ac_device_name(ac_id):

# #     if not os.path.exists(DATA_FILE):
# #         return ac_id

# #     try:
# #         with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
# #             data = json.load(file)

# #         # Find latest occurrence of AC
# #         for record in reversed(data):
# #             if str(record.get("ac_id", "")) == str(ac_id):
# #                 return record.get("device_name") or ac_id

# #     except Exception:
# #         pass

# #     return ac_id



# # # @api_view(["GET", "POST"])
# # # def devices(request):
# #     device_map = build_device_location_map()
# #     if request.method == "GET":
# #         location_index = build_location_index()
# #         result = []
# #         for ac_id, mapping in device_map.items():
# #             location_key = (
# #                 mapping.get("floor_id")
# #                 or mapping.get("branch_id")
# #                 or mapping.get("site_id")
# #             )

# #             location = location_index.get(location_key, {})

# #             result.append({
# #                 "ac_id": ac_id,
# #                 **mapping,
# #                 **location,
# #             })
# #         return JsonResponse({
# #             "status": "success",
# #             "count": len(result),
# #             "data": result,
# #         })

# #     try:
# #         body = json.loads(request.body or "{}")
# #     except json.JSONDecodeError:
# #         return JsonResponse(
# #             {"status": "error", "message": "Invalid JSON body"},
# #             status=400,
# #         )

# #     ac_id = str(body.get("ac_id", "")).strip()
# #     hierarchy_type = str(body.get("hierarchy_type", "")).strip().upper()
# #     floor_id = str(body.get("floor_id", "")).strip()
# #     branch_id = str(body.get("branch_id", "")).strip()
# #     site_id = str(body.get("site_id", "")).strip()
# #     device_name = str(body.get("device_name", "")).strip()
# #     status_value = str(body.get("status", "OFF")).strip().upper()

# #     if not ac_id:
# #         return JsonResponse(
# #             {"status": "error", "message": "ac_id is required"},
# #             status=400,
# #         )

# #     if hierarchy_type not in {"GEOGRAPHICAL", "ZONAL"}:
# #         return JsonResponse(
# #             {
# #                 "status": "error",
# #                 "message": "hierarchy_type must be 'GEOGRAPHICAL' or 'ZONAL'",
# #             },
# #             status=400,
# #         )

# #     if not floor_id and not branch_id:
# #         return JsonResponse(
# #             {
# #                 "status": "error",
# #                 "message": "Either floor_id or branch_id is required",
# #             },
# #             status=400,
# #         )

# #     if not site_id:
# #         site_id = ac_id

# #     if not device_name:
# #         device_name = get_ac_device_name(ac_id)

# #     if status_value not in {"ON", "OFF"}:
# #         status_value = "OFF"

# #     if hierarchy_type == "GEOGRAPHICAL":
# #         location_file = GEOGRAPHICAL_LOCATION_FILE
# #     else:
# #         location_file = ZONAL_LOCATION_FILE

# #     tree = load_location_tree(location_file)

# #     target = find_location_target(
# #         tree,
# #         hierarchy_type,
# #         branch_id=branch_id,
# #         floor_id=floor_id,
# #     )

# #     if not target:
# #         return JsonResponse(
# #             {
# #                 "status": "error",
# #                 "message": (
# #                     "Selected floor/branch was not found "
# #                     "in the selected hierarchy"
# #                 ),
# #             },
# #             status=404,
# #         )

# #     branch = target["branch"]
# #     floor = target["floor"]
# #     context = target["context"]

# #     old_mapping = device_map.get(ac_id, {})
# #     old_site_id = old_mapping.get("site_id") or ac_id

# #     remove_site_from_tree(tree, old_site_id)

# #     # Also remove AC ID if used as site_id previously
# #     if old_site_id != ac_id:
# #         remove_site_from_tree(tree, ac_id)

# #     # --------------------------------------------------------
# #     # Create new site
# #     # --------------------------------------------------------

# #     site = {
# #         "site_id": site_id,
# #         "device_name": device_name,
# #         "status": status_value,
# #     }

# #     if floor is not None:

# #         # AC under FLOOR
# #         floor.setdefault("sites", [])
# #         floor["sites"].append(site)

# #         location_type = "FLOOR"
# #         assigned_floor_id = floor.get("floor_id", "")
# #         assigned_floor_name = floor.get("floor_name", "")

# #     else:

# #         # AC directly under BRANCH
# #         branch.setdefault("sites", [])
# #         branch["sites"].append(site)

# #         location_type = "DIRECT_BRANCH"
# #         assigned_floor_id = ""
# #         assigned_floor_name = ""

# #     # --------------------------------------------------------
# #     # Save location tree
# #     # --------------------------------------------------------

# #     save_location_tree(tree, location_file)

# #     # --------------------------------------------------------
# #     # Save device mapping
# #     # --------------------------------------------------------

# #     mapping = dict(old_mapping)

# #     mapping.update({
# #         "ac_id": ac_id,
# #         "site_id": site_id,
# #         "device_name": device_name,
# #         "location_type": location_type,
# #         "hierarchy_type": hierarchy_type,

# #         "branch_id": branch.get("branch_id", ""),
# #         "branch_name": branch.get("branch_name", ""),

# #         "floor_id": assigned_floor_id,
# #         "floor_name": assigned_floor_name,
# #     })

# #     # Add hierarchy-specific context
# #     mapping.update(context)

# #     device_map[ac_id] = mapping

# #     save_device_location_map(device_map)

# #     # --------------------------------------------------------
# #     # Success response
# #     # --------------------------------------------------------

# #     return JsonResponse(
# #         {
# #             "status": "success",
# #             "message": f"{ac_id} assigned successfully",
# #             "data": {
# #                 "ac_id": ac_id,
# #                 "site_id": site_id,
# #                 "device_name": device_name,
# #                 "hierarchy_type": hierarchy_type,
# #                 "location_type": location_type,
# #                 "branch_id": branch.get("branch_id", ""),
# #                 "branch_name": branch.get("branch_name", ""),
# #                 "floor_id": assigned_floor_id,
# #                 "floor_name": assigned_floor_name,
# #             },
# #         },
# #         status=201,
# #     )


# # # @api_view(["GET", "POST"])
# # # def devices(request):
# # #     device_map = build_device_location_map()

# # #     # ========================================================
# # #     # GET — return every device, enriched with customer name
# # #     # ========================================================
# # #     if request.method == "GET":
# # #         customer_ids = {
# # #             m.get("customer_id")
# # #             for m in device_map.values()
# # #             if m.get("customer_id")
# # #         }
# # #         customer_names = dict(
# # #             Customer.objects
# # #             .filter(id__in=customer_ids)
# # #             .values_list("id", "company")
# # #         )

# # #         result = []
# # #         for ac_id, m in device_map.items():
# # #             result.append({
# # #                 **m,
# # #                 "customer_name": customer_names.get(m.get("customer_id"), ""),
# # #             })

# # #         return JsonResponse({
# # #             "status": "success",
# # #             "count": len(result),
# # #             "data": result,
# # #         })

# # #     # ========================================================
# # #     # POST — create / update a device, assign to DB branch/floor
# # #     # ========================================================
# # #     try:
# # #         body = json.loads(request.body or "{}")
# # #     except json.JSONDecodeError:
# # #         return JsonResponse(
# # #             {"status": "error", "message": "Invalid JSON body"},
# # #             status=400,
# # #         )

# # #     ac_id       = str(body.get("ac_id", "")).strip()
# # #     branch_id   = str(body.get("branch_id", "")).strip()
# # #     floor_id    = str(body.get("floor_id", "")).strip()
# # #     device_name = str(body.get("device_name", "")).strip()
# # #     status_val  = str(body.get("status", "OFF")).strip().upper()

# # #     # ---------- validation ----------
# # #     if not ac_id:
# # #         return JsonResponse(
# # #             {"status": "error", "message": "ac_id is required"}, status=400
# # #         )
# # #     if not branch_id:
# # #         return JsonResponse(
# # #             {"status": "error", "message": "branch_id is required"}, status=400
# # #         )

# # #     # ---------- look up the branch in the DB ----------
# # #     branch = (
# # #         Branch.objects
# # #         .select_related(
# # #             "customer",
# # #             "city__taluka__district__state",
# # #             "division__region__circle__zone",
# # #         )
# # #         .filter(id=branch_id)
# # #         .first()
# # #     )

# # #     if not branch:
# # #         return JsonResponse(
# # #             {"status": "error", "message": "Branch not found"}, status=404
# # #         )

# # #     # ---------- look up the floor (optional) ----------
# # #     floor = None
# # #     if floor_id:
# # #         floor = Floor.objects.filter(id=floor_id, branch=branch).first()
# # #         if not floor:
# # #             return JsonResponse(
# # #                 {"status": "error", "message": "Floor not found under this branch"},
# # #                 status=404,
# # #             )

# # #     # ---------- build ancestor context from the DB ----------
# # #     if branch.division_id:                       # ZONAL
# # #         zone     = branch.division.region.circle.zone
# # #         circle   = branch.division.region.circle
# # #         region   = branch.division.region
# # #         division = branch.division
# # #         hierarchy_type = "ZONAL"
# # #         context = {
# # #             "zone_id":     str(zone.id),     "zone_name":     zone.name,
# # #             "circle_id":   str(circle.id),   "circle_name":   circle.name,
# # #             "region_id":   str(region.id),   "region_name":   region.name,
# # #             "division_id": str(division.id), "division_name": division.name,
# # #         }

# # #     elif branch.city_id:                         # GEOGRAPHICAL
# # #         city     = branch.city
# # #         taluka   = city.taluka
# # #         district = taluka.district
# # #         state    = district.state
# # #         hierarchy_type = "GEOGRAPHICAL"
# # #         context = {
# # #             "state_id":    str(state.id),    "state_name":    state.name,
# # #             "district_id": str(district.id), "district_name": district.name,
# # #             "taluka_id":   str(taluka.id),   "taluka_name":   taluka.name,
# # #             "city_id":     str(city.id),     "city_name":     city.name,
# # #         }

# # #     else:
# # #         return JsonResponse(
# # #             {"status": "error", "message": "Branch has no parent hierarchy set"},
# # #             status=400,
# # #         )

# # #     # ---------- build the mapping ----------
# # #     mapping = {
# # #         "ac_id":          ac_id,
# # #         "site_id":        ac_id,
# # #         "device_name":    device_name or ac_id,
# # #         "status":         status_val if status_val in ("ON", "OFF") else "OFF",
# # #         "location_type":  "FLOOR" if floor else "DIRECT_BRANCH",
# # #         "hierarchy_type": hierarchy_type,
# # #         "customer_id":    str(branch.customer_id),
# # #         "branch_id":      str(branch.id),
# # #         "branch_name":    branch.name,
# # #         "floor_id":       str(floor.id) if floor else "",
# # #         "floor_name":     floor.name if floor else "",
# # #         **context,
# # #     }

# # #     device_map[ac_id] = mapping
# # #     save_device_location_map(device_map)

# # #     return JsonResponse(
# # #         {
# # #             "status":  "success",
# # #             "message": f"{ac_id} assigned successfully",
# # #             "data":    mapping,
# # #         },
# # #         status=201,
# # #     )


# # import json
# # import os
# # import traceback

# # from django.conf import settings
# # from django.http import JsonResponse
# # from rest_framework.decorators import api_view

# # # ... your existing BASE_DATA_DIR / *_FILE constants ...
# # # ... your existing load_location_tree / save_location_tree ...
# # # ... your existing iter_branches / find_location_target / remove_site_from_tree ...
# # # ... your existing build_device_location_map / save_device_location_map ...
# # # ... your existing get_ac_device_name ...


# # def _flatten_device(mapping):
# #     """
# #     Collapse the nested `geographical` / `zonal` blocks (as stored in the
# #     seed file) into a single flat dict with the fields the UI reads.
# #     If the mapping is already flat (written by this POST handler),
# #     pass it through unchanged.
# #     """
# #     flat = {
# #         "ac_id":          mapping.get("ac_id", ""),
# #         "site_id":        mapping.get("site_id", ""),
# #         "device_name":    mapping.get("device_name", ""),
# #         "status":         mapping.get("status", "OFF"),
# #         "location_type":  mapping.get("location_type", ""),
# #         "hierarchy_type": (mapping.get("hierarchy_type") or "").upper(),
# #     }

# #     geo = mapping.get("geographical") or {}
# #     zon = mapping.get("zonal")        or {}

# #     if zon and not geo:
# #         block = zon
# #         flat["hierarchy_type"] = flat["hierarchy_type"] or "ZONAL"
# #     elif geo:
# #         block = geo
# #         flat["hierarchy_type"] = flat["hierarchy_type"] or "GEOGRAPHICAL"
# #     else:
# #         block = mapping   # already flat

# #     for field in (
# #         "state_id", "state_name", "district_id", "district_name",
# #         "taluka_id", "taluka_name", "city_id", "city_name",
# #         "zone_id", "zone_name", "circle_id", "circle_name",
# #         "region_id", "region_name", "division_id", "division_name",
# #         "branch_id", "branch_name", "floor_id", "floor_name",
# #     ):
# #         if block.get(field):
# #             flat[field] = block[field]

# #     return flat


# # @api_view(["GET", "POST"])
# # def devices(request):
# #     try:
# #         return _devices_impl(request)
# #     except Exception as exc:
# #         return JsonResponse(
# #             {
# #                 "status":    "error",
# #                 "message":   f"{type(exc).__name__}: {exc}",
# #                 "traceback": traceback.format_exc().splitlines(),
# #             },
# #             status=500,
# #         )


# # def _devices_impl(request):
# #     device_map = build_device_location_map()
# #     if request.method == "GET":
# #         result = []
# #         for ac_id, mapping in device_map.items():
# #             if not isinstance(mapping, dict):
# #                 continue
# #             flat = _flatten_device(mapping)
# #             flat["ac_id"] = ac_id
# #             result.append(flat)

# #         return JsonResponse({
# #             "status": "success",
# #             "count":  len(result),
# #             "data":   result,
# #         })

# #     try:
# #         body = json.loads(request.body or "{}")
# #     except json.JSONDecodeError:
# #         return JsonResponse(
# #             {"status": "error", "message": "Invalid JSON body"}, status=400,
# #         )

# #     ac_id       = str(body.get("ac_id", "")).strip()
# #     hierarchy   = str(body.get("hierarchy_type", "")).strip().upper()
# #     branch_id   = str(body.get("branch_id", "")).strip()
# #     floor_id    = str(body.get("floor_id", "")).strip()
# #     device_name = str(body.get("device_name", "")).strip()
# #     status_val  = str(body.get("status", "OFF")).strip().upper()
# #     customer_id = str(body.get("customer_id", "")).strip()

# #     acting = getattr(request, "user", None)
# #     created_by_id    = str(getattr(acting, "id", "") or "")
# #     created_by_name  = getattr(acting, "name", "") or getattr(acting, "email", "")
# #     created_by_email = getattr(acting, "email", "")
# #     created_by_role  = getattr(acting, "role", "")

# #     if not ac_id:
# #         return JsonResponse({"status": "error", "message": "ac_id is required"}, status=400)
# #     if hierarchy not in {"GEOGRAPHICAL", "ZONAL"}:
# #         return JsonResponse(
# #             {"status": "error", "message": "hierarchy_type must be 'GEOGRAPHICAL' or 'ZONAL'"},
# #             status=400,
# #         )
# #     if not branch_id:
# #         return JsonResponse({"status": "error", "message": "branch_id is required"}, status=400)

# #     if not device_name:
# #         device_name = get_ac_device_name(ac_id)

# #     if status_val not in {"ON", "OFF"}:
# #         status_val = "OFF"

# #     if not customer_id:
# #         return JsonResponse(
# #             {"status": "error", "message": "customer_id is required"},
# #             status=400,
# #         )

# #     location_file = (
# #         GEOGRAPHICAL_LOCATION_FILE if hierarchy == "GEOGRAPHICAL"
# #         else ZONAL_LOCATION_FILE
# #     )

# #     try:
# #         tree = load_location_tree(location_file)
# #     except json.JSONDecodeError:
# #         return JsonResponse(
# #             {"status": "error", "message": "Location tree file is malformed"},
# #             status=500,
# #         )

# #     target = find_location_target(
# #         tree, hierarchy, branch_id=branch_id, floor_id=floor_id,
# #     )
# #     if not target:
# #         return JsonResponse(
# #             {
# #                 "status": "error",
# #                 "message": "Selected floor/branch was not found in the selected hierarchy",
# #             },
# #             status=404,
# #         )

# #     branch  = target["branch"]
# #     floor   = target["floor"]
# #     context = target["context"]

# #     old_mapping = device_map.get(ac_id, {})
# #     old_site_id = old_mapping.get("site_id") or ac_id
# #     remove_site_from_tree(tree, old_site_id)
# #     if old_site_id != ac_id:
# #         remove_site_from_tree(tree, ac_id)

# #     site = {
# #         "site_id":     ac_id,
# #         "device_name": device_name,
# #         "status":      status_val,
# #     }

# #     if floor is not None:
# #         if not isinstance(floor.get("sites"), list):
# #             floor["sites"] = []
# #         floor["sites"].append(site)

# #         location_type    = "FLOOR"
# #         assigned_floor_id   = floor.get("floor_id", "")
# #         assigned_floor_name = floor.get("floor_name", "")
# #     else:
# #         if not isinstance(branch.get("sites"), list):
# #             branch["sites"] = []
# #         branch["sites"].append(site)

# #         location_type    = "DIRECT_BRANCH"
# #         assigned_floor_id   = ""
# #         assigned_floor_name = ""
        

# #     save_location_tree(tree, location_file)

# #     mapping = {
# #         "ac_id":          ac_id,
# #         "site_id":        ac_id,
# #         "device_name":    device_name,
# #         "status":         status_val,
# #         "location_type":  location_type,
# #         "hierarchy_type": hierarchy,

# #         "customer_id":    customer_id,            # ← from step earlier

# #         "created_by_id":    created_by_id,        # ← new
# #         "created_by_name":  created_by_name,
# #         "created_by_email": created_by_email,
# #         "created_by_role":  created_by_role,

# #         "branch_id":      branch.get("branch_id", ""),
# #         "branch_name":    branch.get("branch_name", ""),
# #         "floor_id":       assigned_floor_id,
# #         "floor_name":     assigned_floor_name,
# #     }
# #     mapping.update(context)

# #     device_map[ac_id] = mapping
# #     save_device_location_map(device_map)

# #     return JsonResponse(
# #         {
# #             "status":  "success",
# #             "message": f"{ac_id} assigned successfully",
# #             "data":    mapping,
# #         },
# #         status=201,
# #     )

# # def make_code_id(existing_ids, name, prefix=""):
# #     words = [w for w in name.strip().split() if w]

# #     if len(words) >= 2:
# #         base = (words[0][0] + words[1][0]).upper()
# #     else:
# #         base = name.strip()[:2].upper()

# #     base = f"{prefix}{base}" if prefix else base

# #     candidate = base
# #     suffix = 1

# #     while candidate in existing_ids:
# #         suffix += 1
# #         candidate = f"{base}{suffix}"

# #     return candidate

# # @api_view(["GET", "POST"])
# # @permission_classes([ReadOnlyOrAuthenticated])
# # def locations(request):
# #     if request.method == "GET":

# #         hierarchy = request.GET.get("hierarchy", "").strip().upper()

# #         try:
# #             if hierarchy == "GEOGRAPHICAL":
# #                 data = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)
# #                 return JsonResponse(
# #                     {
# #                         "success": True,
# #                         "hierarchy_type": "GEOGRAPHICAL",
# #                         "data": data,
# #                     },
# #                     safe=True,
# #                 )

# #             if hierarchy == "ZONAL":
# #                 data = load_location_tree(ZONAL_LOCATION_FILE)
# #                 return JsonResponse(
# #                     {
# #                         "success": True,
# #                         "hierarchy_type": "ZONAL",
# #                         "data": data,
# #                     },
# #                     safe=True,
# #                 )

# #             geographical_data = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)
# #             zonal_data = load_location_tree(ZONAL_LOCATION_FILE)

# #             return JsonResponse(
# #                 {
# #                     "success": True,
# #                     "geographical": {
# #                         "hierarchy_type": "GEOGRAPHICAL",
# #                         "data": geographical_data,
# #                     },
# #                     "zonal": {
# #                         "hierarchy_type": "ZONAL",
# #                         "data": zonal_data,
# #                     },
# #                 },
# #                 safe=True,
# #             )

# #         except json.JSONDecodeError:
# #             return JsonResponse(
# #                 {"success": False, "message": "Invalid JSON format"},
# #                 status=500,
# #             )

# #         except Exception as e:
# #             return JsonResponse(
# #                 {"success": False, "message": str(e)},
# #                 status=500,
# #             )

# #     # ================================================================
# #     # POST
# #     # ================================================================

# #     try:
# #         body = json.loads(request.body or "{}")
# #     except json.JSONDecodeError:
# #         return JsonResponse(
# #             {"success": False, "message": "Invalid JSON body"},
# #             status=400,
# #         )

# #     hierarchy = str(body.get("hierarchy_type", "")).strip().upper()

# #     if hierarchy not in {"ZONAL", "GEOGRAPHICAL"}:
# #         return JsonResponse(
# #             {
# #                 "success": False,
# #                 "message": "hierarchy_type must be 'ZONAL' or 'GEOGRAPHICAL'",
# #             },
# #             status=400,
# #         )

# #     location_file = (
# #         ZONAL_LOCATION_FILE if hierarchy == "ZONAL" else GEOGRAPHICAL_LOCATION_FILE
# #     )

# #     try:
# #         tree = load_location_tree(location_file)
# #     except json.JSONDecodeError:
# #         return JsonResponse(
# #             {"success": False, "message": "Invalid JSON format"},
# #             status=500,
# #         )

# #     # ================================================================
# #     # ZONAL HIERARCHY
# #     #
# #     # India -> Zone -> Circle -> Region -> Division -> Branch -> Floor -> Site
# #     # ================================================================

# #     if hierarchy == "ZONAL":

# #         zone_name = str(body.get("zone_name", "")).strip()
# #         circle_name = str(body.get("circle_name", "")).strip()
# #         region_name = str(body.get("region_name", "")).strip()
# #         division_name = str(body.get("division_name", "")).strip()
# #         branch_name = str(body.get("branch_name", "")).strip()
# #         floor_name = str(body.get("floor_name", "")).strip()

# #         missing = [
# #             field
# #             for field, value in [
# #                 ("zone_name", zone_name),
# #                 ("circle_name", circle_name),
# #                 ("region_name", region_name),
# #                 ("division_name", division_name),
# #                 ("branch_name", branch_name),
# #                 ("floor_name", floor_name),
# #             ]
# #             if not value
# #         ]

# #         if missing:
# #             return JsonResponse(
# #                 {
# #                     "success": False,
# #                     "message": "Missing required field(s): " + ", ".join(missing),
# #                 },
# #                 status=400,
# #             )

# #         # ------------------------------------------------------------
# #         # ZONE
# #         # ------------------------------------------------------------

# #         zone = next(
# #             (
# #                 z for z in tree
# #                 if z.get("zone_name", "").strip().lower() == zone_name.lower()
# #             ),
# #             None,
# #         )

# #         if zone is None:
# #             zone_ids = {z.get("zone_id", "") for z in tree}

# #             zone = {
# #                 "zone_id": make_code_id(zone_ids, zone_name, prefix="ZN-"),
# #                 "zone_name": zone_name,
# #                 "circles": [],
# #             }
# #             tree.append(zone)

# #         # ------------------------------------------------------------
# #         # CIRCLE
# #         # ------------------------------------------------------------

# #         circle = next(
# #             (
# #                 c for c in zone.get("circles", [])
# #                 if c.get("circle_name", "").strip().lower() == circle_name.lower()
# #             ),
# #             None,
# #         )

# #         if circle is None:
# #             circle_ids = {
# #                 c.get("circle_id", "")
# #                 for z in tree
# #                 for c in z.get("circles", [])
# #             }

# #             circle = {
# #                 "circle_id": make_code_id(
# #                     circle_ids, circle_name, prefix=f"{zone['zone_id']}-C"
# #                 ),
# #                 "circle_name": circle_name,
# #                 "regions": [],
# #             }
# #             zone.setdefault("circles", []).append(circle)

# #         # ------------------------------------------------------------
# #         # REGION
# #         # ------------------------------------------------------------

# #         region = next(
# #             (
# #                 r for r in circle.get("regions", [])
# #                 if r.get("region_name", "").strip().lower() == region_name.lower()
# #             ),
# #             None,
# #         )

# #         if region is None:
# #             region_ids = {
# #                 r.get("region_id", "")
# #                 for z in tree
# #                 for c in z.get("circles", [])
# #                 for r in c.get("regions", [])
# #             }

# #             region = {
# #                 "region_id": make_code_id(
# #                     region_ids, region_name, prefix=f"{circle['circle_id']}-R"
# #                 ),
# #                 "region_name": region_name,
# #                 "divisions": [],
# #             }
# #             circle.setdefault("regions", []).append(region)

# #         # ------------------------------------------------------------
# #         # DIVISION
# #         # ------------------------------------------------------------

# #         division = next(
# #             (
# #                 d for d in region.get("divisions", [])
# #                 if d.get("division_name", "").strip().lower() == division_name.lower()
# #             ),
# #             None,
# #         )

# #         if division is None:
# #             division_ids = {
# #                 d.get("division_id", "")
# #                 for z in tree
# #                 for c in z.get("circles", [])
# #                 for r in c.get("regions", [])
# #                 for d in r.get("divisions", [])
# #             }

# #             division = {
# #                 "division_id": make_code_id(
# #                     division_ids, division_name, prefix=f"{region['region_id']}-D"
# #                 ),
# #                 "division_name": division_name,
# #                 "branches": [],
# #             }
# #             region.setdefault("divisions", []).append(division)

# #         # ------------------------------------------------------------
# #         # BRANCH
# #         # ------------------------------------------------------------

# #         branch = next(
# #             (
# #                 b for b in division.get("branches", [])
# #                 if b.get("branch_name", "").strip().lower() == branch_name.lower()
# #             ),
# #             None,
# #         )

# #         if branch is None:
# #             branch_index = len(division.get("branches", [])) + 1

# #             branch = {
# #                 "branch_id": f"{division['division_id']}-B{branch_index:02d}",
# #                 "branch_name": branch_name,
# #                 "floors": [],
# #                 "sites": [],
# #             }
# #             division.setdefault("branches", []).append(branch)

# #         # ------------------------------------------------------------
# #         # FLOOR
# #         # ------------------------------------------------------------

# #         if any(
# #             f.get("floor_name", "").strip().lower() == floor_name.lower()
# #             for f in branch.get("floors", [])
# #         ):
# #             return JsonResponse(
# #                 {
# #                     "success": False,
# #                     "message": f"Floor '{floor_name}' already exists in this branch",
# #                 },
# #                 status=409,
# #             )

# #         floor_index = len(branch.get("floors", [])) + 1

# #         floor = {
# #             "floor_id": f"{branch['branch_id']}-F{floor_index:02d}",
# #             "floor_name": floor_name,
# #             "sites": [],
# #         }
# #         branch.setdefault("floors", []).append(floor)

# #         save_location_tree(tree, location_file)

# #         return JsonResponse(
# #             {
# #                 "success": True,
# #                 "hierarchy_type": "ZONAL",
# #                 "data": {
# #                     "zone_id": zone["zone_id"],
# #                     "zone_name": zone["zone_name"],

# #                     "circle_id": circle["circle_id"],
# #                     "circle_name": circle["circle_name"],

# #                     "region_id": region["region_id"],
# #                     "region_name": region["region_name"],

# #                     "division_id": division["division_id"],
# #                     "division_name": division["division_name"],

# #                     "branch_id": branch["branch_id"],
# #                     "branch_name": branch["branch_name"],

# #                     "floor_id": floor["floor_id"],
# #                     "floor_name": floor["floor_name"],
# #                 },
# #             },
# #             status=201,
# #         )

# #     # ================================================================
# #     # GEOGRAPHICAL HIERARCHY
# #     #
# #     # India -> State -> District -> Taluka -> City -> Branch -> Floor -> Site
# #     # ================================================================

# #     state_name = str(body.get("state_name", "")).strip()
# #     district_name = str(body.get("district_name", "")).strip()
# #     taluka_name = str(body.get("taluka_name", "")).strip()
# #     city_name = str(body.get("city_name", "")).strip()
# #     branch_name = str(body.get("branch_name", "")).strip()
# #     floor_name = str(body.get("floor_name", "")).strip()

# #     missing = [
# #         field
# #         for field, value in [
# #             ("state_name", state_name),
# #             ("district_name", district_name),
# #             ("taluka_name", taluka_name),
# #             ("city_name", city_name),
# #             ("branch_name", branch_name),
# #             ("floor_name", floor_name),
# #         ]
# #         if not value
# #     ]

# #     if missing:
# #         return JsonResponse(
# #             {
# #                 "success": False,
# #                 "message": "Missing required field(s): " + ", ".join(missing),
# #             },
# #             status=400,
# #         )

# #     # ------------------------------------------------------------
# #     # STATE
# #     # ------------------------------------------------------------

# #     state = next(
# #         (
# #             s for s in tree
# #             if s.get("state_name", "").strip().lower() == state_name.lower()
# #         ),
# #         None,
# #     )

# #     if state is None:
# #         state_ids = {s.get("state_id", "") for s in tree}

# #         state = {
# #             "state_id": make_code_id(state_ids, state_name),
# #             "state_name": state_name,
# #             "districts": [],
# #         }
# #         tree.append(state)

# #     # ------------------------------------------------------------
# #     # DISTRICT
# #     # ------------------------------------------------------------

# #     district = next(
# #         (
# #             d for d in state.get("districts", [])
# #             if d.get("district_name", "").strip().lower() == district_name.lower()
# #         ),
# #         None,
# #     )

# #     if district is None:
# #         district_index = len(state.get("districts", [])) + 1

# #         district = {
# #             "district_id": f"{state['state_id']}-D{district_index:02d}",
# #             "district_name": district_name,
# #             "talukas": [],
# #         }
# #         state.setdefault("districts", []).append(district)

# #     # ------------------------------------------------------------
# #     # TALUKA
# #     # ------------------------------------------------------------

# #     taluka = next(
# #         (
# #             t for t in district.get("talukas", [])
# #             if t.get("taluka_name", "").strip().lower() == taluka_name.lower()
# #         ),
# #         None,
# #     )

# #     if taluka is None:
# #         taluka_index = len(district.get("talukas", [])) + 1

# #         taluka = {
# #             "taluka_id": f"{district['district_id']}-T{taluka_index:02d}",
# #             "taluka_name": taluka_name,
# #             "cities": [],
# #         }
# #         district.setdefault("talukas", []).append(taluka)

# #     # ------------------------------------------------------------
# #     # CITY
# #     # ------------------------------------------------------------

# #     city = next(
# #         (
# #             c for c in taluka.get("cities", [])
# #             if c.get("city_name", "").strip().lower() == city_name.lower()
# #         ),
# #         None,
# #     )

# #     if city is None:
# #         city_index = len(taluka.get("cities", [])) + 1

# #         city = {
# #             "city_id": f"{taluka['taluka_id']}-C{city_index:02d}",
# #             "city_name": city_name,
# #             "branches": [],
# #         }
# #         taluka.setdefault("cities", []).append(city)

# #     # ------------------------------------------------------------
# #     # BRANCH
# #     # ------------------------------------------------------------

# #     branch = next(
# #         (
# #             b for b in city.get("branches", [])
# #             if b.get("branch_name", "").strip().lower() == branch_name.lower()
# #         ),
# #         None,
# #     )

# #     if branch is None:
# #         branch_index = len(city.get("branches", [])) + 1

# #         branch = {
# #             "branch_id": f"{city['city_id']}-B{branch_index:02d}",
# #             "branch_name": branch_name,
# #             "floors": [],
# #             "sites": [],
# #         }
# #         city.setdefault("branches", []).append(branch)

# #     # ------------------------------------------------------------
# #     # FLOOR
# #     # ------------------------------------------------------------

# #     if any(
# #         f.get("floor_name", "").strip().lower() == floor_name.lower()
# #         for f in branch.get("floors", [])
# #     ):
# #         return JsonResponse(
# #             {
# #                 "success": False,
# #                 "message": f"Floor '{floor_name}' already exists in this branch",
# #             },
# #             status=409,
# #         )

# #     floor_index = len(branch.get("floors", [])) + 1

# #     floor = {
# #         "floor_id": f"{branch['branch_id']}-F{floor_index:02d}",
# #         "floor_name": floor_name,
# #         "sites": [],
# #     }
# #     branch.setdefault("floors", []).append(floor)

# #     save_location_tree(tree, location_file)

# #     return JsonResponse(
# #         {
# #             "success": True,
# #             "hierarchy_type": "GEOGRAPHICAL",
# #             "data": {
# #                 "state_id": state["state_id"],
# #                 "state_name": state["state_name"],

# #                 "district_id": district["district_id"],
# #                 "district_name": district["district_name"],

# #                 "taluka_id": taluka["taluka_id"],
# #                 "taluka_name": taluka["taluka_name"],

# #                 "city_id": city["city_id"],
# #                 "city_name": city["city_name"],

# #                 "branch_id": branch["branch_id"],
# #                 "branch_name": branch["branch_name"],

# #                 "floor_id": floor["floor_id"],
# #                 "floor_name": floor["floor_name"],
# #             },
# #         },
# #         status=201,
# #     )


# # # ============================================================
# # # FILTERING & ENRICHMENT HELPERS
# # # ============================================================

# # def matches(value, selected):
# #     if not selected:
# #         return True
# #     return str(value).strip().lower() == str(selected).strip().lower()

# # GEOGRAPHICAL_FIELDS = [
# #     "state_id", "state_name",
# #     "district_id", "district_name",
# #     "taluka_id", "taluka_name",
# #     "city_id", "city_name",
# #     "branch_id", "branch_name",
# #     "floor_id", "floor_name",
# #     "site_id",
# # ]

# # ZONAL_FIELDS = [
# #     "zone_id", "zone_name",
# #     "circle_id", "circle_name",
# #     "region_id", "region_name",
# #     "division_id", "division_name",
# #     "branch_id", "branch_name",
# #     "floor_id", "floor_name",
# #     "site_id",
# # ]


# # def resolve_ac_location(ac_id, device_map):
# #     mapping = device_map.get(ac_id, {})

# #     if not mapping:
# #         return {
# #             "geographical": {},
# #             "zonal": {},
# #             "site_id": "",
# #             "device_name": "",
# #             "location_type": "",
# #             "hierarchy_type": "",
# #         }

# #     # --- Nested shape (seeded data) --------------------------------
# #     if "geographical" in mapping or "zonal" in mapping:
# #         geo = mapping.get("geographical") or {}
# #         zon = mapping.get("zonal") or {}

# #         hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()
# #         if not hierarchy_type:
# #             # Both blocks are usually present in the seeded data, so
# #             # don't assume one over the other for filtering purposes.
# #             hierarchy_type = ""

# #         return {
# #             "geographical": geo,
# #             "zonal": zon,
# #             "site_id": mapping.get("site_id", ""),
# #             "device_name": mapping.get("device_name", ""),
# #             "location_type": mapping.get("location_type", ""),
# #             "hierarchy_type": hierarchy_type,
# #         }

# #     # --- Flat shape (written by /devices/ POST) ---------------------
# #     hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()

# #     geo = {}
# #     zon = {}

# #     if hierarchy_type == "GEOGRAPHICAL":
# #         geo = {field: mapping.get(field, "") for field in GEOGRAPHICAL_FIELDS}
# #     elif hierarchy_type == "ZONAL":
# #         zon = {field: mapping.get(field, "") for field in ZONAL_FIELDS}

# #     return {
# #         "geographical": geo,
# #         "zonal": zon,
# #         "site_id": mapping.get("site_id", ""),
# #         "device_name": mapping.get("device_name", ""),
# #         "location_type": mapping.get("location_type", ""),
# #         "hierarchy_type": hierarchy_type,
# #     }


# # def filter_by_location(data, request):
# #     hierarchy = request.GET.get("hierarchy", "").strip().upper()

# #     zone     = request.GET.get("zone", "").strip()
# #     state    = request.GET.get("state", "").strip()
# #     district = request.GET.get("district", "").strip()
# #     taluka   = request.GET.get("taluka", "").strip()
# #     circle   = request.GET.get("circle", "").strip()
# #     region   = request.GET.get("region", "").strip()
# #     division = request.GET.get("division", "").strip()
# #     city     = request.GET.get("city", "").strip()
# #     branch   = request.GET.get("branch", "").strip()
# #     floor    = request.GET.get("floor", "").strip()

# #     # Nothing to filter on → return everything
# #     if not any([hierarchy, zone, state, district, taluka, circle,
# #                 region, division, city, branch, floor]):
# #         return data

# #     device_map = build_device_location_map()

# #     def keep(record):
# #         ac_id = record.get("ac_id", "")
# #         loc   = resolve_ac_location(ac_id, device_map)
# #         geo   = loc["geographical"]
# #         zon   = loc["zonal"]

# #         if hierarchy == "GEOGRAPHICAL":
# #             if not geo:
# #                 return False
# #             return (
# #                 matches(geo.get("state_name", ""),    state)
# #                 and matches(geo.get("district_name", ""), district)
# #                 and matches(geo.get("taluka_name", ""),   taluka)
# #                 and matches(geo.get("city_name", ""),     city)
# #                 and matches(geo.get("branch_name", ""),   branch)
# #                 and matches(geo.get("floor_name", ""),    floor)
# #             )

# #         if hierarchy == "ZONAL":
# #             if not zon:
# #                 return False
# #             return (
# #                 matches(zon.get("zone_name", ""),     zone)
# #                 and matches(zon.get("circle_name", ""),   circle)
# #                 and matches(zon.get("region_name", ""),   region)
# #                 and matches(zon.get("division_name", ""), division)
# #                 and matches(zon.get("branch_name", ""),   branch)
# #                 and matches(zon.get("floor_name", ""),    floor)
# #             )

# #         # No hierarchy specified — fall back to matching whatever
# #         # individual filters were sent against whichever block has
# #         # that field.
# #         branch_name = geo.get("branch_name") or zon.get("branch_name") or ""
# #         floor_name  = geo.get("floor_name") or zon.get("floor_name") or ""

# #         return (
# #             matches(geo.get("state_name", ""),    state)
# #             and matches(geo.get("district_name", ""), district)
# #             and matches(geo.get("taluka_name", ""),   taluka)
# #             and matches(geo.get("city_name", ""),     city)
# #             and matches(zon.get("zone_name", ""),     zone)
# #             and matches(zon.get("circle_name", ""),   circle)
# #             and matches(zon.get("region_name", ""),   region)
# #             and matches(zon.get("division_name", ""), division)
# #             and matches(branch_name, branch)
# #             and matches(floor_name, floor)
# #         )

# #     return [record for record in data if keep(record)]


# # def attach_location(record, device_map):
# #     enriched = dict(record)
# #     ac_id    = record.get("ac_id", "")
# #     loc      = resolve_ac_location(ac_id, device_map)

# #     enriched.update(loc["geographical"])
# #     enriched.update(loc["zonal"])

# #     if loc["site_id"]:
# #         enriched["site_id"] = loc["site_id"]
# #     if loc["device_name"]:
# #         enriched["device_name"] = loc["device_name"]

# #     enriched["location_type"] = loc["location_type"]
# #     enriched["hierarchy_type"] = loc["hierarchy_type"]

# #     return enriched


# # @api_view(["GET"])
# # @permission_classes([AllowAny])
# # def ac_data_with_location(request):
# #     try:
# #         if not os.path.exists(DATA_FILE):
# #             return JsonResponse(
# #                 {"status": "error", "message": "ac_data.json file not found"},
# #                 status=404,
# #             )

# #         with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
# #             data = json.load(file)

# #         data = filter_by_location(data, request)

# #         device_map = build_device_location_map()
# #         data = [attach_location(rec, device_map) for rec in data]

# #         return JsonResponse(
# #             {"status": "success", "count": len(data), "data": data},
# #             safe=True,
# #         )

# #     except json.JSONDecodeError:
# #         return JsonResponse(
# #             {"status": "error", "message": "Invalid JSON format"},
# #             status=500,
# #         )

# #     except Exception as e:
# #         return JsonResponse(
# #             {"status": "error", "message": str(e)},
# #             status=500,
# #         )


# # @api_view(["GET"])
# # @permission_classes([AllowAny])
# # def ac_data(request):
# #     try:
# #         if not os.path.exists(DATA_FILE):
# #             return JsonResponse(
# #                 {"status": "error", "message": "ac_data.json file not found"},
# #                 status=404,
# #             )

# #         with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
# #             data = json.load(file)

# #         data = filter_by_location(data, request)

# #         device_map = build_device_location_map()
# #         data = [attach_location(rec, device_map) for rec in data]

# #         return JsonResponse(
# #             {"status": "success", "count": len(data), "data": data},
# #             safe=True,
# #         )

# #     except json.JSONDecodeError:
# #         return JsonResponse(
# #             {"status": "error", "message": "Invalid JSON format"},
# #             status=500,
# #         )

# #     except Exception as e:
# #         return JsonResponse(
# #             {"status": "error", "message": str(e)},
# #             status=500,
# #         )


# # @api_view(["GET"])
# # def latest_ac_data(request):
# #     try:
# #         if not os.path.exists(DATA_FILE):
# #             return JsonResponse(
# #                 {"status": "error", "message": "ac_data.json file not found"},
# #                 status=404,
# #             )

# #         with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
# #             data = json.load(file)

# #         if not data:
# #             return JsonResponse({"status": "success", "data": None})

# #         return JsonResponse({"status": "success", "data": data[-1]})

# #     except Exception as e:
# #         return JsonResponse(
# #             {"status": "error", "message": str(e)},
# #             status=500,
# #         )


# # # ============================================================
# # # AUTH VIEWS
# # # ============================================================

# # def get_client_ip(request):
# #     xff = request.META.get("HTTP_X_FORWARDED_FOR")
# #     if xff:
# #         return xff.split(",")[0].strip()
# #     return request.META.get("REMOTE_ADDR")


# # def log_attempt(request, success, user=None, email="", role="", reason=""):
# #     LoginAudit.objects.create(
# #         user=user,
# #         email_attempted=email,
# #         role_attempted=role,
# #         ip_address=get_client_ip(request),
# #         user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
# #         success=success,
# #         reason=reason,
# #     )


# # @api_view(["POST"])
# # @permission_classes([permissions.AllowAny])
# # def login_view(request):
# #     """
# #     POST /api/auth/login/
# #     Body: { "email": "...", "password": "...", "role": "ORG_SUPER_ADMIN" }
# #     """
# #     serializer = LoginSerializer(data=request.data, context={"request": request})

# #     if not serializer.is_valid():
# #         log_attempt(
# #             request,
# #             success=False,
# #             email=request.data.get("email", ""),
# #             role=request.data.get("role", ""),
# #             reason=str(serializer.errors),
# #         )
# #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# #     user = serializer.validated_data["user"]

# #     user.last_login = timezone.now()
# #     user.last_login_ip = get_client_ip(request)
# #     user.save(update_fields=["last_login", "last_login_ip"])

# #     django_login(request, user)
# #     token, _ = Token.objects.get_or_create(user=user)

# #     log_attempt(request, success=True, user=user, email=user.email, role=user.role)

# #     return Response(
# #         {
# #             "token": token.key,
# #             "user": UserSerializer(user).data,
# #             "redirect": _dashboard_path(user.role),
# #         },
# #         status=status.HTTP_200_OK,
# #     )


# # def _dashboard_path(role):
# #     return {
# #         Role.ORG_SUPER_ADMIN: "/org/dashboard",
# #         Role.CUSTOMER: "/customer/dashboard",
# #         Role.BR_ADMIN: "/admin/dashboard",
# #         Role.ENGINEER: "/engineer/dashboard",
# #     }.get(role, "/login")


# # @api_view(["POST"])
# # def logout_view(request):
# #     """POST /api/auth/logout/"""
# #     if request.user.is_authenticated:
# #         Token.objects.filter(user=request.user).delete()
# #         django_logout(request)
# #     return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


# # @api_view(["GET"])
# # def me_view(request):
# #     """GET /api/auth/me/ — returns current user's profile & scope."""
# #     return Response(UserSerializer(request.user).data)


# # # ============================================================
# # # SCOPED QUERYSET HELPER
# # # ============================================================

# # def scoped_queryset(model, user, level_map):
# #     level, scope_id = user.get_scope()
# #     if level == "ORGANIZATION":
# #         return model.objects.filter(
# #             **{f"{level_map['ORGANIZATION']}": user.organization_id}
# #         )
# #     if level in level_map and scope_id:
# #         return model.objects.filter(**{level_map[level]: scope_id})
# #     return model.objects.none()

# # class OrganizationListView(generics.ListAPIView):
# #     serializer_class = OrganizationSerializer

# #     def get_queryset(self):
# #         user = self.request.user
# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             return Organization.objects.filter(pk=user.organization_id)
# #         return Organization.objects.none()


# # class CustomerListView(CustomerScopeMixin, generics.ListCreateAPIView):
# #     serializer_class = CustomerSerializer
# #     permission_classes = [IsOrgSuperAdmin]
# #     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
# #     search_fields = [
# #         "company", "code", "company_email",
# #         "contact_person", "contact_person_email", "phone",
# #     ]
# #     ordering_fields = ["company", "code", "created_at"]
# #     ordering = ["company"]

# #     def get_queryset(self):
# #         qs = super().get_queryset()

# #         is_active = self.request.query_params.get("is_active")
# #         if is_active is not None:
# #             qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

# #         return qs

# #     def perform_create(self, serializer):
# #         serializer.save(organization=self.request.user.organization)


# # class CustomerDetailView(CustomerScopeMixin, generics.RetrieveUpdateDestroyAPIView):
# #     serializer_class = CustomerSerializer
# #     permission_classes = [IsOrgSuperAdmin]
# #     lookup_field = "pk"

# #     def perform_destroy(self, instance):
# #         instance.delete()

# # ADMIN_ROLES = [
# #     Role.ORG_SUPER_ADMIN,
# #     Role.CUSTOMER,
# #     Role.BR_ADMIN,
# #     Role.ENGINEER,
# # ]


# # from .permissions import (
# #     CustomerScopeMixin,
# #     IsOrgSuperAdmin,
# #     IsOrgAdminOrCustomerAdmin,
# # )


# # class AdminListView(generics.ListCreateAPIView):
# #     serializer_class = AdminSerializer
# #     permission_classes = [IsOrgAdminOrCustomerAdmin]
# #     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
# #     search_fields = ["name", "email", "phone", "role"]
# #     ordering_fields = ["name", "email", "date_joined"]
# #     ordering = ["name"]

# #     def get_queryset(self):
# #         user = self.request.user
# #         base = User.objects.select_related(
# #             "organization", "customer", "zone", "circle", "state", "district", "branch", "site"
# #         )

# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             qs = base.filter(organization_id=user.organization_id)
# #         elif user.role == Role.CUSTOMER:
# #             qs = base.filter(customer_id=user.customer_id)
# #         elif user.role == Role.BR_ADMIN:
# #             qs = base.filter(branch_id=user.branch_id)
# #         else:
# #             return base.none()

# #         qs = qs.filter(role__in=ADMIN_ROLES)

# #         is_active = self.request.query_params.get("is_active")
# #         if is_active is not None:
# #             qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

# #         return qs

# #     # def perform_create(self, serializer):
# #     #     user = self.request.user

# #     #     if user.role == Role.CUSTOMER:
# #     #         serializer.save(
# #     #             organization=user.organization,
# #     #             customer=user.customer,
# #     #         )
# #     #     else:
# #     #         serializer.save(organization=user.organization)

# #     def perform_create(self, serializer):
# #         """
# #         - Customer login  -> the new user is attached to THAT customer
# #                              automatically (client input is ignored).
# #         - Super admin     -> uses the customer sent by the client (validated
# #                              by the serializer to be inside their org).
# #         - Engineers       -> may carry `parent` (a Branch Admin id). The admin
# #                              must belong to the same customer, and the engineer
# #                              inherits that admin's customer / zone / branch.
# #         """
# #         user = self.request.user
# #         role = serializer.validated_data.get("role")
# #         extra = {"organization": user.organization}

# #         if user.role == Role.CUSTOMER:
# #             extra["customer"] = user.customer

# #         if role == Role.ENGINEER:
# #             customer = extra.get("customer") or serializer.validated_data.get("customer")
# #             parent_id = self.request.data.get("parent")

# #             if parent_id:
# #                 try:
# #                     parent = self.get_queryset().filter(
# #                         pk=parent_id, role=Role.BR_ADMIN
# #                     ).first()
# #                 except (ValueError, DjangoValidationError):
# #                     parent = None
# #                 if parent is None:
# #                     raise DRFValidationError(
# #                         {"parent": "Selected admin was not found under this customer."}
# #                     )
# #                 if customer and parent.customer_id != customer.pk:
# #                     raise DRFValidationError(
# #                         {"parent": "Selected admin does not belong to the selected customer."}
# #                     )
# #                 extra.update(
# #                     customer=parent.customer,
# #                     zone=parent.zone,
# #                     circle=parent.circle,
# #                     state=parent.state,
# #                     district=parent.district,
# #                     branch=parent.branch,
# #                 )
# #             elif not customer:
# #                 raise DRFValidationError({"customer": "Customer is required for an engineer."})

# #         serializer.save(**extra)

# # class AdminDetailView(generics.RetrieveUpdateDestroyAPIView):
# #     serializer_class = AdminSerializer
# #     permission_classes = [IsOrgAdminOrCustomerAdmin]   # ← was IsOrgSuperAdmin
# #     lookup_field = "pk"

# #     def get_queryset(self):
# #         user = self.request.user
# #         base = User.objects.all()

# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             return base.filter(organization_id=user.organization_id)
# #         if user.role == Role.CUSTOMER:
# #             # A customer manages only their Branch Admins and Engineers —
# #             # never their own account or another customer-level user.
# #             return base.filter(
# #                 customer_id=user.customer_id,
# #                 role__in=[Role.BR_ADMIN, Role.ENGINEER],
# #             )
# #         if user.role == Role.BR_ADMIN:
# #             return base.filter(branch_id=user.branch_id)
# #         return base.none()

# #     def perform_update(self, serializer):
# #         if self.request.user.role == Role.CUSTOMER:
# #             serializer.save(customer=self.request.user.customer)
# #         else:
# #             serializer.save()

# # class EngListView(generics.ListCreateAPIView):
# #     serializer_class = AdminSerializer  # same shape as admins
# #     permission_classes = [IsOrgSuperAdmin]
# #     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
# #     search_fields = ["name", "email", "phone"]
# #     ordering_fields = ["name", "email", "date_joined"]
# #     ordering = ["name"]

# #     def get_queryset(self):
# #         user = self.request.user
# #         base = User.objects.select_related(
# #             "organization", "customer", "zone", "circle", "state", "district", "branch", "site"
# #         ).filter(role=Role.ENGINEER)  # engineers only

# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             qs = base.filter(organization_id=user.organization_id)
# #         elif user.role == Role.CUSTOMER:
# #             qs = base.filter(customer_id=user.customer_id)
# #         elif user.role == Role.BR_ADMIN:
# #             qs = base.filter(branch_id=user.branch_id)
# #         else:
# #             return base.none()

# #         is_active = self.request.query_params.get("is_active")
# #         if is_active is not None:
# #             qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

# #         return qs

# #     # def perform_create(self, serializer):
# #     #     # Force role to ENGINEER regardless of what the client sends
# #     #     serializer.save(
# #     #         role=Role.ENGINEER,
# #     #         organization=self.request.user.organization,
# #     #     )

# #     # def perform_create(self, serializer):
# #     #     user = self.request.user
# #     #     if user.role == Role.CUSTOMER:
# #     #         serializer.save(
# #     #             role=Role.ENGINEER,
# #     #             organization=user.organization,
# #     #             customer=user.customer,
# #     #         )
# #     #     else:
# #     #         serializer.save(
# #     #             role=Role.ENGINEER,
# #     #             organization=user.organization,
# #     #         )

# #     def perform_create(self, serializer):
# #         user = self.request.user
# #         if user.customer_id:
# #             serializer.save(
# #                 organization=user.organization,
# #                 customer=user.customer,
# #             )
# #         else:
# #             serializer.save(organization=user.organization)

# #     def perform_update(self, serializer):
# #         user = self.request.user
# #         if user.customer_id:
# #             serializer.save(customer=user.customer)
# #         else:
# #             serializer.save()

# # class EngDetailView(generics.RetrieveUpdateDestroyAPIView):
# #     serializer_class = AdminSerializer
# #     permission_classes = [IsOrgSuperAdmin]
# #     lookup_field = "pk"

# #     def get_queryset(self):
# #         user = self.request.user
# #         base = User.objects.filter(role=Role.ENGINEER)

# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             return base.filter(organization_id=user.organization_id)
# #         if user.role == Role.CUSTOMER:
# #             return base.filter(customer_id=user.customer_id)
# #         if user.role == Role.BR_ADMIN:
# #             return base.filter(branch_id=user.branch_id)
# #         return base.none()


# # class ZoneListView(generics.ListAPIView):
# #     serializer_class = ZoneSerializer

# #     def get_queryset(self):
# #         user = self.request.user
# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             return Zone.objects.filter(customer__organization_id=user.organization_id)
# #         if user.role == Role.CUSTOMER:
# #             return Zone.objects.filter(customer_id=user.customer_id)
# #         if user.role in [Role.BR_ADMIN, Role.ENGINEER]:
# #             return Zone.objects.filter(pk=user.zone_id)
# #         return Zone.objects.none()


# # class CircleListView(generics.ListAPIView):
# #     serializer_class = CircleSerializer

# #     def get_queryset(self):
# #         user = self.request.user
# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             qs = Circle.objects.filter(zone__customer__organization_id=user.organization_id)
# #         elif user.role == Role.CUSTOMER:
# #             qs = Circle.objects.filter(zone__customer_id=user.customer_id)
# #         elif user.role in [Role.BR_ADMIN, Role.ENGINEER]:
# #             qs = Circle.objects.filter(pk=user.circle_id)
# #         else:
# #             return Circle.objects.none()

# #         zone_id = self.request.query_params.get("zone")
# #         if zone_id:
# #             qs = qs.filter(zone_id=zone_id)
# #         return qs


# # class StateListView(generics.ListAPIView):
# #     serializer_class = StateSerializer

# #     def get_queryset(self):
# #         user = self.request.user
# #         qs = State.objects.select_related("customer")

# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             qs = qs.filter(customer__organization_id=user.organization_id)
# #         elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
# #             qs = qs.filter(customer_id=user.customer_id)
# #         else:
# #             return qs.none()

# #         customer_id = self.request.query_params.get("customer")
# #         if customer_id:
# #             qs = qs.filter(customer_id=customer_id)
# #         return qs


# # class DistrictListView(generics.ListAPIView):
# #     serializer_class = DistrictSerializer

# #     def get_queryset(self):
# #         user = self.request.user
# #         qs = District.objects.select_related("state", "state__customer")

# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             qs = qs.filter(state__customer__organization_id=user.organization_id)
# #         elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
# #             qs = qs.filter(state__customer_id=user.customer_id)
# #         else:
# #             return qs.none()

# #         state_id = self.request.query_params.get("state")
# #         if state_id:
# #             qs = qs.filter(state_id=state_id)
# #         return qs


# # # class BranchListView(generics.ListAPIView):
# # #     serializer_class = BranchSerializer

# # #     def get_queryset(self):
# # #         user = self.request.user
# # #         if user.role == Role.ORG_SUPER_ADMIN:
# # #             return Branch.objects.filter(customer__organization_id=user.organization_id)
# # #         if user.role == Role.CUSTOMER:
# # #             return Branch.objects.filter(customer_id=user.customer_id)
# # #         if user.role == Role.BR_ADMIN:
# # #             return Branch.objects.filter(pk=user.branch_id)
# # #         if user.role == Role.ENGINEER:
# # #             return Branch.objects.filter(pk=user.branch_id)
# # #         return Branch.objects.none()

# # class BranchListView(generics.ListAPIView):
# #     serializer_class = BranchSerializer

# #     def get_queryset(self):
# #         user = self.request.user

# #         qs = Branch.objects.select_related(
# #             "customer",
# #             # Geographical chain
# #             "city", "city__taluka", "city__taluka__district",
# #             "city__taluka__district__state",
# #             # Zonal chain
# #             "division", "division__region",
# #             "division__region__circle", "division__region__circle__zone",
# #         )

# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             qs = qs.filter(customer__organization_id=user.organization_id)
# #         elif user.role == Role.CUSTOMER:
# #             qs = qs.filter(customer_id=user.customer_id)
# #         elif user.role in (Role.BR_ADMIN, Role.ENGINEER):
# #             qs = qs.filter(pk=user.branch_id)
# #         else:
# #             return Branch.objects.none()

# #         customer_id = self.request.query_params.get("customer")
# #         if customer_id:
# #             qs = qs.filter(customer_id=customer_id)

# #         return qs.order_by("name")

# # class SiteListView(generics.ListAPIView):
# #     serializer_class = SiteSerializer

# #     def get_queryset(self):
# #         user = self.request.user
# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             qs = Site.objects.filter(branch__customer__organization_id=user.organization_id)
# #         elif user.role == Role.CUSTOMER:
# #             qs = Site.objects.filter(branch__customer_id=user.customer_id)
# #         elif user.role == Role.BR_ADMIN:
# #             qs = Site.objects.filter(branch_id=user.branch_id)
# #         elif user.role == Role.ENGINEER:
# #             qs = Site.objects.filter(pk=user.site_id)
# #         else:
# #             return Site.objects.none()

# #         # Optional narrowing, used by the Engineers page:
# #         #   /sites/?customer=<id>&branch=<uuid>
# #         params = self.request.query_params
# #         try:
# #             if params.get("customer"):
# #                 qs = qs.filter(branch__customer_id=int(params["customer"]))
# #             if params.get("branch"):
# #                 qs = qs.filter(branch_id=params["branch"])
# #         except (ValueError, DjangoValidationError):
# #             return Site.objects.none()

# #         return qs.select_related("branch", "floor")


# # class UserListView(generics.ListCreateAPIView):
# #     serializer_class = UserSerializer

# #     def get_queryset(self):
# #         user = self.request.user
# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             return User.objects.filter(organization_id=user.organization_id)
# #         if user.role == Role.CUSTOMER:
# #             return User.objects.filter(customer_id=user.customer_id)
# #         if user.role == Role.BR_ADMIN:
# #             return User.objects.filter(branch_id=user.branch_id)
# #         return User.objects.none()

# # @api_view(["GET"])
# # def dashboard_summary_view(request):
# #     user = request.user
# #     data = {"role": user.role, "scope_name": user.scope_name}

# #     if user.role == Role.ORG_SUPER_ADMIN:
# #         data.update({
# #             "customers": Customer.objects.filter(
# #                 organization_id=user.organization_id
# #             ).count(),
# #             "zones": Zone.objects.filter(
# #                 customer__organization_id=user.organization_id
# #             ).count(),
# #             "circles": Circle.objects.filter(
# #                 zone__customer__organization_id=user.organization_id
# #             ).count(),
# #             "branches": Branch.objects.filter(
# #                 customer__organization_id=user.organization_id
# #             ).count(),
# #             "sites": Site.objects.filter(
# #                 branch__customer__organization_id=user.organization_id
# #             ).count(),
# #             "engineers": User.objects.filter(
# #                 role=Role.ENGINEER, organization_id=user.organization_id
# #             ).count(),
# #         })

# #     elif user.role == Role.CUSTOMER:
# #         data.update({
# #             "zones": Zone.objects.filter(customer_id=user.customer_id).count(),
# #             "circles": Circle.objects.filter(
# #                 zone__customer_id=user.customer_id
# #             ).count(),
# #             "branches": Branch.objects.filter(
# #                 customer_id=user.customer_id
# #             ).count(),
# #             "sites": Site.objects.filter(
# #                 branch__customer_id=user.customer_id
# #             ).count(),
# #             "engineers": User.objects.filter(
# #                 role=Role.ENGINEER, customer_id=user.customer_id
# #             ).count(),
# #         })

# #     elif user.role == Role.BR_ADMIN:
# #         data.update({
# #             "sites": Site.objects.filter(branch_id=user.branch_id).count(),
# #             "engineers": User.objects.filter(
# #                 role=Role.ENGINEER, branch_id=user.branch_id
# #             ).count(),
# #         })

# #     elif user.role == Role.ENGINEER:
# #         data.update({
# #             "my_sites": Site.objects.filter(pk=user.site_id).count(),
# #         })

# #     return Response(data)



# # @api_view(["GET"])
# # def LocationListView(request):
# #     return Response("Location Page")


# # def serialize_circle(circle):
# #     return {
# #         "id": circle.id,
# #         "circle_id": circle.circle_code,
# #         "circle_code": circle.circle_code,
# #         "circle_name": circle.circle_name,
# #         "state_id": circle.state_id,
# #     }


# # def serialize_state(state):
# #     return {
# #         "id": state.id,
# #         "state_id": state.state_code,
# #         "state_code": state.state_code,
# #         "state_name": state.state_name,
# #         "zone_id": state.zone_id,
# #         "circles": [serialize_circle(circle) for circle in state.circles.all()],
# #     }


# # def serialize_zone(zone):
# #     return {
# #         "id": zone.id,
# #         "zone_id": zone.zone_code,
# #         "zone_code": zone.zone_code,
# #         "zone_name": zone.zone_name,
# #         "states": [serialize_state(state) for state in zone.states.all()],
# #     }


# # @csrf_exempt
# # def location_detail(request, location_type, location_id):

# #     if request.method == "DELETE":
# #         try:
# #             if location_type == "zone":
# #                 obj = LocationZone.objects.get(id=location_id)
# #             elif location_type == "state":
# #                 obj = LocationState.objects.get(id=location_id)
# #             elif location_type == "circle":
# #                 obj = LocationCircle.objects.get(id=location_id)
# #             else:
# #                 return JsonResponse(
# #                     {"success": False, "message": "Invalid location type"},
# #                     status=400,
# #                 )

# #             obj.delete()

# #             return JsonResponse(
# #                 {
# #                     "success": True,
# #                     "message": f"{location_type.title()} deleted successfully",
# #                 },
# #                 status=200,
# #             )

# #         except (
# #             LocationZone.DoesNotExist,
# #             LocationState.DoesNotExist,
# #             LocationCircle.DoesNotExist,
# #         ):
# #             return JsonResponse(
# #                 {"success": False, "message": "Location not found"},
# #                 status=404,
# #             )

# #     if request.method == "PUT":
# #         try:
# #             body = json.loads(request.body.decode("utf-8"))

# #             if location_type == "zone":
# #                 obj = LocationZone.objects.get(id=location_id)
# #                 obj.zone_name = body.get("zone_name", obj.zone_name)
# #                 obj.zone_code = body.get("zone_code", obj.zone_code)

# #             elif location_type == "state":
# #                 obj = LocationState.objects.get(id=location_id)
# #                 obj.state_name = body.get("state_name", obj.state_name)
# #                 obj.state_code = body.get("state_code", obj.state_code)

# #             elif location_type == "circle":
# #                 obj = LocationCircle.objects.get(id=location_id)
# #                 obj.circle_name = body.get("circle_name", obj.circle_name)
# #                 obj.circle_code = body.get("circle_code", obj.circle_code)

# #             else:
# #                 return JsonResponse(
# #                     {"success": False, "message": "Invalid location type"},
# #                     status=400,
# #                 )

# #             obj.save()

# #             return JsonResponse(
# #                 {
# #                     "success": True,
# #                     "message": f"{location_type.title()} updated successfully",
# #                 },
# #                 status=200,
# #             )

# #         except (
# #             LocationZone.DoesNotExist,
# #             LocationState.DoesNotExist,
# #             LocationCircle.DoesNotExist,
# #         ):
# #             return JsonResponse(
# #                 {"success": False, "message": "Location not found"},
# #                 status=404,
# #             )

# #         except json.JSONDecodeError:
# #             return JsonResponse(
# #                 {"success": False, "message": "Invalid JSON"},
# #                 status=400,
# #             )

# #     return JsonResponse(
# #         {"success": False, "message": "Method not allowed"},
# #         status=405,
# #     )

# # def device(request):
# #     return Response("ACCreation page")

# # class FloorListView(generics.ListAPIView):
# #     serializer_class = FloorSerializer

# #     def get_queryset(self):
# #         user = self.request.user

# #         qs = Floor.objects.select_related(
# #             "branch",
# #             "branch__customer",
# #         )

# #         # ---------------------------------------------
# #         # USER SCOPE
# #         # ---------------------------------------------

# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             qs = qs.filter(
# #                 branch__customer__organization_id=user.organization_id
# #             )

# #         elif user.role == Role.CUSTOMER:
# #             qs = qs.filter(
# #                 branch__customer_id=user.customer_id
# #             )

# #         elif user.role == Role.BR_ADMIN:
# #             qs = qs.filter(
# #                 branch_id=user.branch_id
# #             )

# #         elif user.role == Role.ENGINEER:
# #             qs = qs.filter(
# #                 branch_id=user.branch_id
# #             )

# #         else:
# #             return qs.none()

# #         # ---------------------------------------------
# #         # OPTIONAL CUSTOMER FILTER
# #         # ---------------------------------------------

# #         customer_id = self.request.query_params.get(
# #             "customer"
# #         )

# #         if customer_id:
# #             qs = qs.filter(
# #                 branch__customer_id=customer_id
# #             )

# #         # ---------------------------------------------
# #         # OPTIONAL BRANCH FILTER
# #         # ---------------------------------------------

# #         branch_id = self.request.query_params.get(
# #             "branch"
# #         )

# #         if branch_id:
# #             qs = qs.filter(
# #                 branch_id=branch_id
# #             )

# #         # ---------------------------------------------
# #         # OPTIONAL ACTIVE FILTER
# #         # ---------------------------------------------

# #         is_active = self.request.query_params.get(
# #             "is_active"
# #         )

# #         if is_active is not None:
# #             qs = qs.filter(
# #                 is_active=is_active.lower()
# #                 in ("1", "true", "yes")
# #             )

# #         return qs.order_by("name")



# # =====================================================================
# # 3TP INTEGRATION — self-contained, no services folder needed
# #
# # Uses settings already defined in settings.py:
# #   TPT_BASE_URL, TPT_USERNAME, TPT_PASSWORD, TPT_TIMEOUT,
# #   TPT_SYNC_ENABLED, TPT_ADMIN_AUTHORITY, TPT_OPERATOR_AUTHORITY,
# #   TPT_SITE_ASSET_TYPE, TPT_DEVICE_TYPE
# # =====================================================================

# import time
# import threading
# import requests
# from django.conf import settings

# CLOUD_URL = "https://3tp.tapasyatech.in"


# class ThreeTPError(Exception):
#     """Raised whenever a 3TP call fails or returns a non-2xx response."""
#     def __init__(self, message, status=None, payload=None):
#         super().__init__(message)
#         self.status  = status
#         self.payload = payload


# _tpt_lock  = threading.Lock()
# _tpt_token = {"value": None, "expires_at": 0}


# def _tpt_base_url():
#     return (getattr(settings, "TPT_BASE_URL", "") or "").rstrip("/")


# def _tpt_timeout():
#     return float(getattr(settings, "TPT_TIMEOUT", 10))


# def _tpt_enabled():
#     return bool(getattr(settings, "TPT_SYNC_ENABLED", True))


# def _tpt_service_login():
#     """Log in to 3TP with the service account and cache the token."""
#     with _tpt_lock:
#         now = time.time()
#         if _tpt_token["value"] and _tpt_token["expires_at"] > now:
#             return _tpt_token["value"]

#         base_url = _tpt_base_url()
#         if not base_url:
#             raise ThreeTPError("TPT_BASE_URL is not configured.")

#         url     = f"{base_url}{TPT_ENDPOINTS['login']}"
#         payload = {
#             "username":  getattr(settings, "TPT_USERNAME", ""),
#             "password":  getattr(settings, "TPT_PASSWORD", ""),
#             "authority": getattr(settings, "TPT_ADMIN_AUTHORITY", "TENANT_ADMIN"),
#         }

#         try:
#             response = requests.post(
#                 url, json=payload, timeout=_tpt_timeout(),
#                 headers={
#                     "Content-Type": "application/json",
#                     "Accept":       "application/json",
#                 },
#             )
#         except requests.RequestException as exc:
#             raise ThreeTPError(f"3TP network error during login: {exc}")

#         try:
#             data = response.json()
#         except ValueError:
#             data = None

#         if response.status_code not in (200, 201):
#             detail = ""
#             if isinstance(data, dict):
#                 detail = data.get("message") or data.get("detail") or ""
#             raise ThreeTPError(
#                 f"3TP login failed ({response.status_code}) {detail}".strip(),
#                 status=response.status_code, payload=data,
#             )

#         token = None
#         if isinstance(data, dict):
#             token = (
#                 data.get("token")
#                 or data.get("access_token")
#                 or data.get("access")
#                 or (data.get("data") or {}).get("token")
#                 or (data.get("data") or {}).get("access_token")
#             )
#         if not token:
#             raise ThreeTPError("3TP login response did not include a token.", payload=data)

#         _tpt_token["value"]      = token
#         _tpt_token["expires_at"] = now + 300
#         return token


# def _tpt_request(method, endpoint_key, payload=None,
#                  extra_headers=None, raise_on_error=True):
#     if not _tpt_enabled():
#         return None, None

#     base_url = _tpt_base_url()
#     if not base_url:
#         if raise_on_error:
#             raise ThreeTPError("TPT_BASE_URL is not configured.")
#         return None, None

#     token = _tpt_service_login()
#     url   = f"{base_url}{TPT_ENDPOINTS.get(endpoint_key, endpoint_key)}"

#     headers = {
#         "Content-Type":  "application/json",
#         "Accept":        "application/json",
#         "Authorization": f"Bearer {token}",
#     }
#     if extra_headers:
#         headers.update(extra_headers)

#     try:
#         response = requests.request(
#             method.upper(), url, json=payload,
#             headers=headers, timeout=_tpt_timeout(),
#         )
#     except requests.RequestException as exc:
#         if raise_on_error:
#             raise ThreeTPError(f"3TP network error ({endpoint_key}): {exc}")
#         return None, None

#     try:
#         data = response.json()
#     except ValueError:
#         data = None

#     if raise_on_error and response.status_code not in (200, 201, 202, 204):
#         detail = ""
#         if isinstance(data, dict):
#             detail = data.get("message") or data.get("detail") or ""
#         raise ThreeTPError(
#             f"3TP {endpoint_key} failed ({response.status_code}) {detail}".strip(),
#             status=response.status_code, payload=data,
#         )

#     return response.status_code, data


# def _tpt_extract_id(data):
#     if not isinstance(data, dict):
#         return ""
#     for key in ("id", "uuid", "pk"):
#         if data.get(key):
#             return str(data[key])
#     inner = data.get("data")
#     if isinstance(inner, dict):
#         for key in ("id", "uuid", "pk"):
#             if inner.get(key):
#                 return str(inner[key])
#     return ""


# def _three_tp_authenticate(email, password):
#     """Direct user login against 3TP. Returns True/False, never raises."""
#     if not _tpt_enabled():
#         return False

#     base_url = _tpt_base_url()
#     if not base_url:
#         return False

#     url     = f"{base_url}{TPT_ENDPOINTS['login']}"
#     payload = {
#         "email":     email,
#         "password":  password,
#         "authority": getattr(settings, "TPT_ADMIN_AUTHORITY", "TENANT_ADMIN"),
#     }

#     try:
#         response = requests.post(
#             url, json=payload, timeout=_tpt_timeout(),
#             headers={
#                 "Content-Type": "application/json",
#                 "Accept":       "application/json",
#             },
#         )
#     except requests.RequestException:
#         return False

#     if response.status_code not in (200, 201):
#         return False

#     try:
#         data = response.json()
#     except ValueError:
#         return True

#     if isinstance(data, dict) and data.get("success") is False:
#         return False

#     return True


# def sync_customer(customer):
#     if not _tpt_enabled():
#         return ""

#     # TUNE ME if your 3TP customer endpoint uses different keys
#     payload = {
#         "name":           getattr(customer, "company", "") or getattr(customer, "name", ""),
#         "code":           getattr(customer, "code", "") or "",
#         "email": (
#             getattr(customer, "company_email", "")
#             or getattr(customer, "contact_person_email", "")
#             or ""
#         ),
#         "phone":          getattr(customer, "phone", "") or "",
#         "contact_person": getattr(customer, "contact_person", "") or "",
#         "address":        getattr(customer, "address", "") or "",
#         "hierarchy_type": getattr(customer, "hierarchy_type", "") or "",
#     }

#     _, data = _tpt_request("POST", "customer", payload=payload)
#     tpt_id  = _tpt_extract_id(data)

#     customer.tpt_customer_id = tpt_id
#     customer.tpt_sync_status = "SYNCED"
#     customer.tpt_sync_error  = ""
#     customer.save(update_fields=[
#         "tpt_customer_id", "tpt_sync_status", "tpt_sync_error",
#     ])
#     return tpt_id


# def sync_site(site):
#     if not _tpt_enabled():
#         return ""

#     customer = site.branch.customer
#     if not getattr(customer, "tpt_customer_id", ""):
#         # sync_customer(customer)

#         customer_url = f"{CLOUD_URL}/api/customer"

#         payload = {
#             "title": customer.company,
#             "name": customer.company,
#             "email": customer.company_email,
#             "phone": customer.phone
#         }

#         response = requests.post(
#             customer_url,
#             json=payload,
#             headers={
#                 "Content-Type": "application/json",
#                 "Accept": "application/json",
#                 "X-Authorization": f"Bearer {token}"
#             },
#             timeout=15
#         )

#         if response.status_code not in [200, 201]:
#             return Response(
#                 {
#                     "error": "Failed to create customer in 3TP",
#                     "details": response.text
#                 },
#                 status=response.status_code
#             )

#         cloud_data = response.json()

#     # TUNE ME if your 3TP site endpoint uses different keys
#     payload = {
#         "name":        getattr(site, "name", "") or "",
#         "code":        getattr(site, "code", "") or "",
#         "customer_id": customer.tpt_customer_id,
#         "asset_type":  getattr(settings, "TPT_SITE_ASSET_TYPE", "SITE"),
#         "branch_name": site.branch.name if site.branch_id else "",
#         "floor_name":  site.floor.name if site.floor_id else "",
#         "address":     getattr(site, "address", "") or "",
#     }

#     _, data = _tpt_request("POST", "site", payload=payload)
#     tpt_id  = _tpt_extract_id(data)

#     site.tpt_site_id     = tpt_id
#     site.tpt_sync_status = "SYNCED"
#     site.tpt_sync_error  = ""
#     site.save(update_fields=[
#         "tpt_site_id", "tpt_sync_status", "tpt_sync_error",
#     ])
#     return tpt_id


# def sync_device(device):
#     if not _tpt_enabled():
#         return ""

#     site = device.site
#     if site is None:
#         raise ThreeTPError("Cannot sync device: no site assigned.")
#     if not getattr(site, "tpt_site_id", ""):
#         sync_site(site)

#     # TUNE ME if your 3TP device endpoint uses different keys
#     payload = {
#         "ac_id":        device.ac_id,
#         "device_name":  device.device_name or device.ac_id,
#         "site_id":      site.tpt_site_id,
#         "device_type":  getattr(settings, "TPT_DEVICE_TYPE", "AC"),
#         "status":       device.status,
#         "capacity_ton": str(device.capacity_ton or ""),
#         "installation_date": (
#             device.installation_date.isoformat()
#             if getattr(device, "installation_date", None) else ""
#         ),
#         "last_maintenance_date": (
#             device.last_maintenance_date.isoformat()
#             if getattr(device, "last_maintenance_date", None) else ""
#         ),
#     }

#     _, data = _tpt_request("POST", "device", payload=payload)
#     tpt_id  = _tpt_extract_id(data)

#     device.tpt_device_id   = tpt_id
#     device.tpt_sync_status = "SYNCED"
#     device.tpt_sync_error  = ""
#     device.save(update_fields=[
#         "tpt_device_id", "tpt_sync_status", "tpt_sync_error",
#     ])
#     return tpt_id

# from django.shortcuts import render

# import json
# import os

# from django.conf import settings
# from django.http import JsonResponse
# from rest_framework.response import Response
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS, IsAuthenticated

# # from .services.three_tp.three_tp import ThreeTPError, sync_customer, sync_site, sync_device

# from django.contrib.auth import authenticate, login, logout
# from django.contrib.auth import authenticate

# from rest_framework.authtoken.models import Token
# from django.contrib.auth import login as django_login, logout as django_logout
# from django.utils import timezone
# from django.core.cache import cache  # used to map a 3TP token -> local user (see login_view)

# from .models import (
#     HierarchyType,
#     LocationCircle,
#     LocationState,
#     LocationZone,
#     User,
#     Organization,
#     Customer,
#     Zone,
#     Circle,
#     Region,
#     Division,
#     State,
#     District,
#     Taluka,
#     City,
#     Branch,
#     Floor,
#     Site,
#     ACDevice,
#     LoginAudit,
#     Role,
#     DashboardPreference,
# )

# from .serializers import (
#     AdminSerializer, CitySerializer, DivisionSerializer, FloorSerializer, LoginSerializer, RegionSerializer, TalukaSerializer, UserSerializer,
#     OrganizationSerializer, CustomerSerializer, DashboardPreferenceSerializer, ZoneSerializer,
#     CircleSerializer, StateSerializer, DistrictSerializer, BranchSerializer, SiteSerializer,
# )

# from .permissions import CustomerScopeMixin, IsOrgSuperAdmin
# from rest_framework import status, generics, permissions, filters

# from django.views.decorators.csrf import csrf_exempt
# from django.db import IntegrityError
# from django.core.exceptions import ValidationError as DjangoValidationError
# from rest_framework.exceptions import ValidationError as DRFValidationError

# class ReadOnlyOrAuthenticated(BasePermission):
#     def has_permission(self, request, view):
#         if request.method in SAFE_METHODS:
#             return True
#         return bool(request.user and request.user.is_authenticated)


# BASE_DATA_DIR = os.path.join(settings.BASE_DIR, "data")

# DATA_FILE = os.path.join(BASE_DATA_DIR, "ac_data.json")

# GEOGRAPHICAL_LOCATION_FILE = os.path.join( BASE_DATA_DIR, "locationData_geographical.json")

# ZONAL_LOCATION_FILE = os.path.join( BASE_DATA_DIR, "locationData_zonal.json")

# DEVICE_LOCATION_MAP_FILE = os.path.join(BASE_DATA_DIR, "DeviceLocationMap.json")


# THREE_TP_BASE_URL       = "https://your-3tp-host.example.com"
# THREE_TP_LOGIN_ENDPOINT = "/api/auth/login/"      # <- adjust to your real path
# THREE_TP_TIMEOUT        = 15

# def _three_tp_authenticate(email, password):
#     """
#     Call the 3TP authentication API directly.

#     Returns True  -> credentials accepted by 3TP
#     Returns False -> anything else (network error, 4xx/5xx, success:false)
#     """
#     import requests
#     from django.conf import settings

#     base_url = (getattr(settings, "THREE_TP_BASE_URL", "") or "").rstrip("/")
#     endpoint = getattr(settings, "THREE_TP_LOGIN_ENDPOINT", "/api/auth/login/")
#     timeout  = getattr(settings, "THREE_TP_TIMEOUT", 15)

#     if not base_url:
#         return False

#     url = f"{base_url}{endpoint}"

#     try:
#         response = requests.post(
#             url,
#             json={"email": email, "password": password},
#             timeout=timeout,
#             headers={"Content-Type": "application/json", "Accept": "application/json"},
#         )
#     except requests.RequestException:
#         return False

#     if response.status_code not in (200, 201):
#         return False

#     # Some 3TP deployments return HTTP 200 with {"success": false, ...}
#     try:
#         payload = response.json()
#     except ValueError:
#         return True   # 2xx with an empty/non-JSON body is treated as success

#     if isinstance(payload, dict) and payload.get("success") is False:
#         return False

#     return True

# def load_location_tree(location_file):
#     if not os.path.exists(location_file):
#         return []

#     with open(location_file, "r", encoding="utf-8-sig") as file:
#         return json.load(file)

# def save_location_tree(tree, location_file):
#     with open(location_file, "w", encoding="utf-8") as file:
#         json.dump(tree, file, indent=4)

# def iter_branches(tree, hierarchy_type):
#     hierarchy_type = hierarchy_type.upper()

#     if hierarchy_type == "GEOGRAPHICAL":

#         for state in tree:
#             for district in state.get("districts", []):
#                 for taluka in district.get("talukas", []):
#                     for city in taluka.get("cities", []):
#                         for branch in city.get("branches", []):

#                             context = {
#                                 "hierarchy_type": "GEOGRAPHICAL",

#                                 "state_id": state.get("state_id", ""),
#                                 "state_name": state.get("state_name", ""),

#                                 "district_id": district.get("district_id", ""),
#                                 "district_name": district.get("district_name", ""),

#                                 "taluka_id": taluka.get("taluka_id", ""),
#                                 "taluka_name": taluka.get("taluka_name", ""),

#                                 "city_id": city.get("city_id", ""),
#                                 "city_name": city.get("city_name", ""),

#                                 "branch_id": branch.get("branch_id", ""),
#                                 "branch_name": branch.get("branch_name", ""),
#                             }

#                             yield branch, context

#     elif hierarchy_type == "ZONAL":

#         for zone in tree:
#             for circle in zone.get("circles", []):
#                 for region in circle.get("regions", []):
#                     for division in region.get("divisions", []):
#                         for branch in division.get("branches", []):

#                             context = {
#                                 "hierarchy_type": "ZONAL",

#                                 "zone_id": zone.get("zone_id", ""),
#                                 "zone_name": zone.get("zone_name", ""),

#                                 "circle_id": circle.get("circle_id", ""),
#                                 "circle_name": circle.get("circle_name", ""),

#                                 "region_id": region.get("region_id", ""),
#                                 "region_name": region.get("region_name", ""),

#                                 "division_id": division.get("division_id", ""),
#                                 "division_name": division.get("division_name", ""),

#                                 "branch_id": branch.get("branch_id", ""),
#                                 "branch_name": branch.get("branch_name", ""),
#                             }

#                             yield branch, context


# def find_location_target(tree, hierarchy_type, branch_id="", floor_id=""):
#     for branch, context in iter_branches(tree, hierarchy_type):
#         if floor_id:
#             for floor in branch.get("floors", []):
#                 if str(floor.get("floor_id", "")) == str(floor_id):
#                     return {
#                         "branch": branch,
#                         "floor": floor,
#                         "context": context,
#                     }

#         if branch_id:
#             if str(branch.get("branch_id", "")) == str(branch_id):
#                 return {
#                     "branch": branch,
#                     "floor": None,
#                     "context": context,
#                 }
#     return None

# def remove_site_from_tree(tree, site_id):
#     removed = False
#     for hierarchy_type in ["GEOGRAPHICAL", "ZONAL"]:
#         for branch, _ in iter_branches(tree, hierarchy_type):

#             branch_sites = branch.get("sites", [])

#             new_branch_sites = [
#                 site for site in branch_sites
#                 if str(site.get("site_id", "")) != str(site_id)
#             ]

#             if len(new_branch_sites) != len(branch_sites):
#                 removed = True

#             branch["sites"] = new_branch_sites

#             # Floor sites
#             for floor in branch.get("floors", []):

#                 floor_sites = floor.get("sites", [])

#                 new_floor_sites = [
#                     site for site in floor_sites
#                     if str(site.get("site_id", "")) != str(site_id)
#                 ]

#                 if len(new_floor_sites) != len(floor_sites):
#                     removed = True

#                 floor["sites"] = new_floor_sites
#     return removed

# def build_location_index():

#     index = {}
#     geographical_tree = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)

#     for branch, context in iter_branches(geographical_tree, "GEOGRAPHICAL"):

#         branch_id = branch.get("branch_id")

#         if branch_id:
#             index[branch_id] = {
#                 **context,
#                 "location_type": "BRANCH",
#             }

#         for floor in branch.get("floors", []):

#             floor_id = floor.get("floor_id")

#             if not floor_id:
#                 continue

#             index[floor_id] = {
#                 **context,
#                 "floor_id": floor_id,
#                 "floor_name": floor.get("floor_name", ""),
#                 "location_type": "FLOOR",
#             }

#             for site in floor.get("sites", []):

#                 site_id = site.get("site_id")

#                 if site_id:
#                     index[site_id] = {
#                         **context,
#                         "floor_id": floor_id,
#                         "floor_name": floor.get("floor_name", ""),
#                         "site_id": site_id,
#                         "device_name": site.get("device_name", ""),
#                         "capacity_ton": site.get("capacity_ton", ""),
#                         "installation_date": site.get("installation_date", ""),
#                         "last_maintenance_date": site.get("last_maintenance_date", ""),
#                         "location_type": "FLOOR",
#                     }

#         for site in branch.get("sites", []):

#             site_id = site.get("site_id")

#             if site_id:
#                 index[site_id] = {
#                     **context,
#                     "site_id": site_id,
#                     "device_name": site.get("device_name", ""),
#                     "capacity_ton": site.get("capacity_ton", ""),
#                     "installation_date": site.get("installation_date", ""),
#                     "last_maintenance_date": site.get("last_maintenance_date", ""),
#                     "location_type": "DIRECT_BRANCH",
#                 }

#     zonal_tree = load_location_tree(ZONAL_LOCATION_FILE)

#     for branch, context in iter_branches(zonal_tree, "ZONAL"):

#         branch_id = branch.get("branch_id")

#         if branch_id:
#             index[branch_id] = {
#                 **context,
#                 "location_type": "BRANCH",
#             }

#         for floor in branch.get("floors", []):

#             floor_id = floor.get("floor_id")

#             if not floor_id:
#                 continue

#             index[floor_id] = {
#                 **context,
#                 "floor_id": floor_id,
#                 "floor_name": floor.get("floor_name", ""),
#                 "location_type": "FLOOR",
#             }

#             for site in floor.get("sites", []):

#                 site_id = site.get("site_id")

#                 if site_id:
#                     index[site_id] = {
#                         **context,
#                         "floor_id": floor_id,
#                         "floor_name": floor.get("floor_name", ""),
#                         "site_id": site_id,
#                         "device_name": site.get("device_name", ""),
#                         "capacity_ton": site.get("capacity_ton", ""),
#                         "installation_date": site.get("installation_date", ""),
#                         "last_maintenance_date": site.get("last_maintenance_date", ""),
#                         "location_type": "FLOOR",
#                     }

#         for site in branch.get("sites", []):

#             site_id = site.get("site_id")

#             if site_id:
#                 index[site_id] = {
#                     **context,
#                     "site_id": site_id,
#                     "device_name": site.get("device_name", ""),
#                     "capacity_ton": site.get("capacity_ton", ""),
#                     "installation_date": site.get("installation_date", ""),
#                     "last_maintenance_date": site.get("last_maintenance_date", ""),
#                     "location_type": "DIRECT_BRANCH",
#                 }

#     return index


# def build_device_location_map():

#     if not os.path.exists(DEVICE_LOCATION_MAP_FILE):
#         return {}

#     try:
#         with open(DEVICE_LOCATION_MAP_FILE, "r", encoding="utf-8-sig") as file:
#             mappings = json.load(file)

#         if isinstance(mappings, list):
#             return {
#                 item.get("ac_id"): item
#                 for item in mappings
#                 if isinstance(item, dict) and item.get("ac_id")
#             }

#         # Backward compatibility with old dict format
#         if isinstance(mappings, dict):
#             result = {}
#             for ac_id, value in mappings.items():
#                 if isinstance(value, dict):
#                     item = dict(value)
#                     item.setdefault("ac_id", ac_id)
#                     result[ac_id] = item
#                 else:
#                     result[ac_id] = {
#                         "ac_id": ac_id,
#                         "floor_id": value,
#                     }
#             return result

#         return {}

#     except (json.JSONDecodeError, TypeError):
#         return {}


# def save_device_location_map(device_map):

#     # Save as LIST because DEVICE_LOCATION.json uses a list of records.
#     mappings = list(device_map.values())

#     with open(DEVICE_LOCATION_MAP_FILE, "w", encoding="utf-8") as file:
#         json.dump(mappings, file, indent=4)


# # ============================================================
# # GET AC NAME
# # ============================================================

# def get_ac_device_name(ac_id):

#     if not os.path.exists(DATA_FILE):
#         return ac_id

#     try:
#         with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
#             data = json.load(file)

#         # Find latest occurrence of AC
#         for record in reversed(data):
#             if str(record.get("ac_id", "")) == str(ac_id):
#                 return record.get("device_name") or ac_id

#     except Exception:
#         pass

#     return ac_id



# # @api_view(["GET", "POST"])
# # def devices(request):
#     device_map = build_device_location_map()
#     if request.method == "GET":
#         location_index = build_location_index()
#         result = []
#         for ac_id, mapping in device_map.items():
#             location_key = (
#                 mapping.get("floor_id")
#                 or mapping.get("branch_id")
#                 or mapping.get("site_id")
#             )

#             location = location_index.get(location_key, {})

#             result.append({
#                 "ac_id": ac_id,
#                 **mapping,
#                 **location,
#             })
#         return JsonResponse({
#             "status": "success",
#             "count": len(result),
#             "data": result,
#         })

#     try:
#         body = json.loads(request.body or "{}")
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Invalid JSON body"},
#             status=400,
#         )

#     ac_id = str(body.get("ac_id", "")).strip()
#     hierarchy_type = str(body.get("hierarchy_type", "")).strip().upper()
#     floor_id = str(body.get("floor_id", "")).strip()
#     branch_id = str(body.get("branch_id", "")).strip()
#     site_id = str(body.get("site_id", "")).strip()
#     device_name = str(body.get("device_name", "")).strip()
#     status_value = str(body.get("status", "OFF")).strip().upper()

#     if not ac_id:
#         return JsonResponse(
#             {"status": "error", "message": "ac_id is required"},
#             status=400,
#         )

#     if hierarchy_type not in {"GEOGRAPHICAL", "ZONAL"}:
#         return JsonResponse(
#             {
#                 "status": "error",
#                 "message": "hierarchy_type must be 'GEOGRAPHICAL' or 'ZONAL'",
#             },
#             status=400,
#         )

#     if not floor_id and not branch_id:
#         return JsonResponse(
#             {
#                 "status": "error",
#                 "message": "Either floor_id or branch_id is required",
#             },
#             status=400,
#         )

#     if not site_id:
#         site_id = ac_id

#     if not device_name:
#         device_name = get_ac_device_name(ac_id)

#     if status_value not in {"ON", "OFF"}:
#         status_value = "OFF"

#     if hierarchy_type == "GEOGRAPHICAL":
#         location_file = GEOGRAPHICAL_LOCATION_FILE
#     else:
#         location_file = ZONAL_LOCATION_FILE

#     tree = load_location_tree(location_file)

#     target = find_location_target(
#         tree,
#         hierarchy_type,
#         branch_id=branch_id,
#         floor_id=floor_id,
#     )

#     if not target:
#         return JsonResponse(
#             {
#                 "status": "error",
#                 "message": (
#                     "Selected floor/branch was not found "
#                     "in the selected hierarchy"
#                 ),
#             },
#             status=404,
#         )

#     branch = target["branch"]
#     floor = target["floor"]
#     context = target["context"]

#     old_mapping = device_map.get(ac_id, {})
#     old_site_id = old_mapping.get("site_id") or ac_id

#     remove_site_from_tree(tree, old_site_id)

#     # Also remove AC ID if used as site_id previously
#     if old_site_id != ac_id:
#         remove_site_from_tree(tree, ac_id)

#     # --------------------------------------------------------
#     # Create new site
#     # --------------------------------------------------------

#     site = {
#         "site_id": site_id,
#         "device_name": device_name,
#         "status": status_value,
#     }

#     if floor is not None:

#         # AC under FLOOR
#         floor.setdefault("sites", [])
#         floor["sites"].append(site)

#         location_type = "FLOOR"
#         assigned_floor_id = floor.get("floor_id", "")
#         assigned_floor_name = floor.get("floor_name", "")

#     else:

#         # AC directly under BRANCH
#         branch.setdefault("sites", [])
#         branch["sites"].append(site)

#         location_type = "DIRECT_BRANCH"
#         assigned_floor_id = ""
#         assigned_floor_name = ""

#     # --------------------------------------------------------
#     # Save location tree
#     # --------------------------------------------------------

#     save_location_tree(tree, location_file)

#     # --------------------------------------------------------
#     # Save device mapping
#     # --------------------------------------------------------

#     mapping = dict(old_mapping)

#     mapping.update({
#         "ac_id": ac_id,
#         "site_id": site_id,
#         "device_name": device_name,
#         "location_type": location_type,
#         "hierarchy_type": hierarchy_type,

#         "branch_id": branch.get("branch_id", ""),
#         "branch_name": branch.get("branch_name", ""),

#         "floor_id": assigned_floor_id,
#         "floor_name": assigned_floor_name,
#     })

#     # Add hierarchy-specific context
#     mapping.update(context)

#     device_map[ac_id] = mapping

#     save_device_location_map(device_map)

#     # --------------------------------------------------------
#     # Success response
#     # --------------------------------------------------------

#     return JsonResponse(
#         {
#             "status": "success",
#             "message": f"{ac_id} assigned successfully",
#             "data": {
#                 "ac_id": ac_id,
#                 "site_id": site_id,
#                 "device_name": device_name,
#                 "hierarchy_type": hierarchy_type,
#                 "location_type": location_type,
#                 "branch_id": branch.get("branch_id", ""),
#                 "branch_name": branch.get("branch_name", ""),
#                 "floor_id": assigned_floor_id,
#                 "floor_name": assigned_floor_name,
#             },
#         },
#         status=201,
#     )


# # @api_view(["GET", "POST"])
# # def devices(request):
# #     device_map = build_device_location_map()

# #     # ========================================================
# #     # GET — return every device, enriched with customer name
# #     # ========================================================
# #     if request.method == "GET":
# #         customer_ids = {
# #             m.get("customer_id")
# #             for m in device_map.values()
# #             if m.get("customer_id")
# #         }
# #         customer_names = dict(
# #             Customer.objects
# #             .filter(id__in=customer_ids)
# #             .values_list("id", "company")
# #         )

# #         result = []
# #         for ac_id, m in device_map.items():
# #             result.append({
# #                 **m,
# #                 "customer_name": customer_names.get(m.get("customer_id"), ""),
# #             })

# #         return JsonResponse({
# #             "status": "success",
# #             "count": len(result),
# #             "data": result,
# #         })

# #     # ========================================================
# #     # POST — create / update a device, assign to DB branch/floor
# #     # ========================================================
# #     try:
# #         body = json.loads(request.body or "{}")
# #     except json.JSONDecodeError:
# #         return JsonResponse(
# #             {"status": "error", "message": "Invalid JSON body"},
# #             status=400,
# #         )

# #     ac_id       = str(body.get("ac_id", "")).strip()
# #     branch_id   = str(body.get("branch_id", "")).strip()
# #     floor_id    = str(body.get("floor_id", "")).strip()
# #     device_name = str(body.get("device_name", "")).strip()
# #     status_val  = str(body.get("status", "OFF")).strip().upper()

# #     # ---------- validation ----------
# #     if not ac_id:
# #         return JsonResponse(
# #             {"status": "error", "message": "ac_id is required"}, status=400
# #         )
# #     if not branch_id:
# #         return JsonResponse(
# #             {"status": "error", "message": "branch_id is required"}, status=400
# #         )

# #     # ---------- look up the branch in the DB ----------
# #     branch = (
# #         Branch.objects
# #         .select_related(
# #             "customer",
# #             "city__taluka__district__state",
# #             "division__region__circle__zone",
# #         )
# #         .filter(id=branch_id)
# #         .first()
# #     )

# #     if not branch:
# #         return JsonResponse(
# #             {"status": "error", "message": "Branch not found"}, status=404
# #         )

# #     # ---------- look up the floor (optional) ----------
# #     floor = None
# #     if floor_id:
# #         floor = Floor.objects.filter(id=floor_id, branch=branch).first()
# #         if not floor:
# #             return JsonResponse(
# #                 {"status": "error", "message": "Floor not found under this branch"},
# #                 status=404,
# #             )

# #     # ---------- build ancestor context from the DB ----------
# #     if branch.division_id:                       # ZONAL
# #         zone     = branch.division.region.circle.zone
# #         circle   = branch.division.region.circle
# #         region   = branch.division.region
# #         division = branch.division
# #         hierarchy_type = "ZONAL"
# #         context = {
# #             "zone_id":     str(zone.id),     "zone_name":     zone.name,
# #             "circle_id":   str(circle.id),   "circle_name":   circle.name,
# #             "region_id":   str(region.id),   "region_name":   region.name,
# #             "division_id": str(division.id), "division_name": division.name,
# #         }

# #     elif branch.city_id:                         # GEOGRAPHICAL
# #         city     = branch.city
# #         taluka   = city.taluka
# #         district = taluka.district
# #         state    = district.state
# #         hierarchy_type = "GEOGRAPHICAL"
# #         context = {
# #             "state_id":    str(state.id),    "state_name":    state.name,
# #             "district_id": str(district.id), "district_name": district.name,
# #             "taluka_id":   str(taluka.id),   "taluka_name":   taluka.name,
# #             "city_id":     str(city.id),     "city_name":     city.name,
# #         }

# #     else:
# #         return JsonResponse(
# #             {"status": "error", "message": "Branch has no parent hierarchy set"},
# #             status=400,
# #         )

# #     # ---------- build the mapping ----------
# #     mapping = {
# #         "ac_id":          ac_id,
# #         "site_id":        ac_id,
# #         "device_name":    device_name or ac_id,
# #         "status":         status_val if status_val in ("ON", "OFF") else "OFF",
# #         "location_type":  "FLOOR" if floor else "DIRECT_BRANCH",
# #         "hierarchy_type": hierarchy_type,
# #         "customer_id":    str(branch.customer_id),
# #         "branch_id":      str(branch.id),
# #         "branch_name":    branch.name,
# #         "floor_id":       str(floor.id) if floor else "",
# #         "floor_name":     floor.name if floor else "",
# #         **context,
# #     }

# #     device_map[ac_id] = mapping
# #     save_device_location_map(device_map)

# #     return JsonResponse(
# #         {
# #             "status":  "success",
# #             "message": f"{ac_id} assigned successfully",
# #             "data":    mapping,
# #         },
# #         status=201,
# #     )


# import json
# import os
# import traceback

# from django.conf import settings
# from django.http import JsonResponse
# from rest_framework.decorators import api_view

# def _flatten_device(mapping):
#     flat = {
#         "ac_id":          mapping.get("ac_id", ""),
#         "site_id":        mapping.get("site_id", ""),
#         "device_name":    mapping.get("device_name", ""),
#         "status":         mapping.get("status", "OFF"),
#         "location_type":  mapping.get("location_type", ""),
#         "hierarchy_type": (mapping.get("hierarchy_type") or "").upper(),
#         "capacity_ton": mapping.get("capacity_ton", ""),
#         "installation_date": mapping.get("installation_date", ""),
#         "last_maintenance_date": mapping.get("last_maintenance_date", ""),
#         "customer_id":      mapping.get("customer_id", ""),
#         "created_by_id":    mapping.get("created_by_id", ""),
#         "created_by_name":  mapping.get("created_by_name", ""),
#         "created_by_email": mapping.get("created_by_email", ""),
#         "created_by_role":  mapping.get("created_by_role", ""),
#     }

#     geo = mapping.get("geographical") or {}
#     zon = mapping.get("zonal")        or {}

#     if zon and not geo:
#         block = zon
#         flat["hierarchy_type"] = flat["hierarchy_type"] or "ZONAL"
#     elif geo:
#         block = geo
#         flat["hierarchy_type"] = flat["hierarchy_type"] or "GEOGRAPHICAL"
#     else:
#         block = mapping   # already flat

#     for field in (
#         "state_id", "state_name", "district_id", "district_name",
#         "taluka_id", "taluka_name", "city_id", "city_name",
#         "zone_id", "zone_name", "circle_id", "circle_name",
#         "region_id", "region_name", "division_id", "division_name",
#         "branch_id", "branch_name", "floor_id", "floor_name",
#     ):
#         if block.get(field):
#             flat[field] = block[field]

#     return flat


# @api_view(["GET", "POST"])
# def devices(request):
#     try:
#         return _devices_impl(request)
#     except Exception as exc:
#         return JsonResponse(
#             {
#                 "status":    "error",
#                 "message":   f"{type(exc).__name__}: {exc}",
#                 "traceback": traceback.format_exc().splitlines(),
#             },
#             status=500,
#         )


# from . import ownership


# def nodes_for_mapping(mapping, branch_index):
#     """Tree branch node(s) an AC mapping points at (legacy maps may hit both trees)."""
#     hier = (mapping.get("hierarchy_type") or "").upper()
#     blocks = []
#     if mapping.get("geographical"):
#         blocks.append(("GEOGRAPHICAL", mapping["geographical"]))
#     if mapping.get("zonal"):
#         blocks.append(("ZONAL", mapping["zonal"]))
#     if not blocks and hier:
#         blocks.append((hier, mapping))
#     nodes = []
#     for h, block in blocks:
#         if hier and h != hier:
#             continue
#         node = branch_index.get((h, block.get("branch_id")))
#         if node is not None:
#             nodes.append(node)
#     return nodes


# def user_can_see_ac(user, ac_id, device_map, branch_index):
#     if user.role == Role.ORG_SUPER_ADMIN:
#         return True

#     # New canonical relationship:
#     # ACDevice -> Site -> Branch -> Customer
#     db_device = (
#         ACDevice.objects
#         .select_related("site", "site__branch", "site__branch__customer")
#         .filter(ac_id=ac_id)
#         .first()
#     )

#     if db_device and db_device.site_id:
#         site = db_device.site

#         if user.role == Role.CUSTOMER:
#             return site.branch.customer_id == user.customer_id

#         if user.role == Role.BR_ADMIN:
#             hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
#             if hierarchy == "GEOGRAPHICAL" and user.state_id:
#                 return (
#                     site.branch.customer_id == user.customer_id
#                     and site.branch.city
#                     and site.branch.city.taluka
#                     and site.branch.city.taluka.district
#                     and site.branch.city.taluka.district.state_id == user.state_id
#                 )
#             if hierarchy == "ZONAL" and user.zone_id:
#                 return (
#                     site.branch.customer_id == user.customer_id
#                     and site.branch.division
#                     and site.branch.division.region
#                     and site.branch.division.region.circle
#                     and site.branch.division.region.circle.zone_id == user.zone_id
#                 )
#             return site.branch_id == user.branch_id

#         if user.role == Role.ENGINEER:
#             return site.id == user.site_id

#         return False

#     # Backward compatibility for existing devices that still exist only
#     # in DeviceLocationMap.json.
#     mapping = device_map.get(ac_id)
#     if not mapping:
#         return False

#     return any(
#         ownership.can_see_branch(user, n)
#         for n in nodes_for_mapping(mapping, branch_index)
#     )


# def scope_ac_records(records, user):
#     if user.role == Role.ORG_SUPER_ADMIN:
#         return records
#     device_map = build_device_location_map()
#     idx = ownership.build_branch_index()
#     return [r for r in records if user_can_see_ac(user, r.get("ac_id", ""), device_map, idx)]


# def _devices_impl(request):
#     device_map = build_device_location_map()
#     if request.method == "GET":
#         user = request.user
#         idx = ownership.build_branch_index()

#         visible = []
#         for ac_id, mapping in device_map.items():
#             if not isinstance(mapping, dict):
#                 continue
#             if user_can_see_ac(user, ac_id, device_map, idx):
#                 visible.append((ac_id, mapping, nodes_for_mapping(mapping, idx)))

#         all_nodes = [n for _, _, ns in visible for n in ns]
#         lookup = ownership.OwnerLookup.for_nodes(all_nodes)

#         result = []
#         for ac_id, mapping, nodes in visible:
#             flat = _flatten_device(mapping)
#             flat["ac_id"] = ac_id

#             # Prefer the canonical DB assignment when one exists.
#             db_device = (
#                 ACDevice.objects
#                 .select_related(
#                     "site",
#                     "site__branch",
#                     "site__branch__customer",
#                     "site__floor",
#                 )
#                 .filter(ac_id=ac_id)
#                 .first()
#             )

#             if db_device and db_device.site_id:
#                 site_obj = db_device.site
#                 branch_obj = site_obj.branch
#                 flat["site_id"] = str(site_obj.id)
#                 flat["site_name"] = site_obj.name
#                 flat["site_code"] = site_obj.code
#                 flat["branch_id"] = str(branch_obj.id)
#                 flat["branch_name"] = branch_obj.name
#                 flat["customer_id"] = str(branch_obj.customer_id or "")
#                 flat["customer_name"] = (
#                     branch_obj.customer.company if branch_obj.customer_id else ""
#                 )
#                 flat["floor_id"] = str(site_obj.floor_id or "")
#                 flat["floor_name"] = site_obj.floor.name if site_obj.floor_id else ""

#                 customer_obj = branch_obj.customer
#                 if customer_obj and customer_obj.hierarchy_type == "GEOGRAPHICAL":
#                     state_id = (
#                         branch_obj.city.taluka.district.state_id
#                         if branch_obj.city_id and branch_obj.city.taluka_id
#                         and branch_obj.city.taluka.district_id
#                         else None
#                     )
#                     site_admins = list(
#                         User.objects.filter(
#                             role=Role.BR_ADMIN,
#                             is_active=True,
#                             customer_id=customer_obj.id,
#                             state_id=state_id,
#                         ).values(
#                             "id", "name", "email", "phone", "role",
#                             "state_id", "zone_id", "branch_id", "site_id"
#                         )
#                     ) if state_id else []
#                 elif customer_obj and customer_obj.hierarchy_type == "ZONAL":
#                     zone_id = (
#                         branch_obj.division.region.circle.zone_id
#                         if branch_obj.division_id and branch_obj.division.region_id
#                         and branch_obj.division.region.circle_id
#                         else None
#                     )
#                     site_admins = list(
#                         User.objects.filter(
#                             role=Role.BR_ADMIN,
#                             is_active=True,
#                             customer_id=customer_obj.id,
#                             zone_id=zone_id,
#                         ).values(
#                             "id", "name", "email", "phone", "role",
#                             "state_id", "zone_id", "branch_id", "site_id"
#                         )
#                     ) if zone_id else []
#                 else:
#                     site_admins = []

#                 site_engineers = list(
#                     site_obj.users.filter(
#                         role=Role.ENGINEER, is_active=True
#                     ).values("id", "name", "email", "phone", "role", "branch_id", "site_id")
#                 )
#                 flat["admins"] = site_admins
#                 flat["engineers"] = site_engineers

#             # ownership is resolved live from the legacy location tree only
#             # when this is an old device without a DB Site assignment.
#             owner_node = next((n for n in nodes if n.get("customer_id")), nodes[0] if nodes else None)
#             if owner_node is not None:
#                 info = lookup.describe(owner_node)
#                 flat["customer_id"] = owner_node.get("customer_id") or flat.get("customer_id") or ""
#                 flat["customer_name"] = info["customer"]["company"] if info["customer"] else ""
#                 flat["admins"] = info["admins"]
#                 flat["engineers"] = info["engineers"]
#             result.append(flat)

#         return JsonResponse({
#             "status": "success",
#             "count":  len(result),
#             "data":   result,
#         })

#     try:
#         body = json.loads(request.body or "{}")
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Invalid JSON body"}, status=400,
#         )

#     # ============================================================
#     # NEW CANONICAL FLOW
#     #
#     # Device added -> select Site -> customer/admin are inherited.
#     #
#     # The frontend sends only site_id. Customer/admin are NEVER trusted
#     # from the client. They are derived from:
#     #
#     #     ACDevice.site -> Site.branch -> Branch.customer
#     #     Site.users -> site admins/engineers
#     # ============================================================
#     site_id = str(body.get("site_id", "")).strip()

#     if site_id:
#         try:
#             site_obj = (
#                 Site.objects
#                 .select_related(
#                     "branch",
#                     "branch__customer",
#                     "branch__customer__organization",
#                     "floor",
#                 )
#                 .prefetch_related("users")
#                 .get(pk=site_id)
#             )
#         except (Site.DoesNotExist, ValueError):
#             return JsonResponse(
#                 {"status": "error", "message": "Selected site was not found."},
#                 status=404,
#             )

#         acting = request.user

#         if acting.role == Role.ORG_SUPER_ADMIN:
#             allowed = (
#                 site_obj.branch.customer.organization_id
#                 == acting.organization_id
#             )
#         elif acting.role == Role.CUSTOMER:
#             allowed = (
#                 site_obj.branch.customer_id
#                 == acting.customer_id
#             )
#         elif acting.role == Role.BR_ADMIN:
#             hierarchy = getattr(acting.customer, "hierarchy_type", None) if acting.customer_id else None
#             if hierarchy == "GEOGRAPHICAL" and acting.state_id:
#                 allowed = (
#                     site_obj.branch.customer_id == acting.customer_id
#                     and site_obj.branch.city
#                     and site_obj.branch.city.taluka
#                     and site_obj.branch.city.taluka.district
#                     and site_obj.branch.city.taluka.district.state_id == acting.state_id
#                 )
#             elif hierarchy == "ZONAL" and acting.zone_id:
#                 allowed = (
#                     site_obj.branch.customer_id == acting.customer_id
#                     and site_obj.branch.division
#                     and site_obj.branch.division.region
#                     and site_obj.branch.division.region.circle
#                     and site_obj.branch.division.region.circle.zone_id == acting.zone_id
#                 )
#             else:
#                 allowed = site_obj.branch_id == acting.branch_id
#         elif acting.role == Role.ENGINEER:
#             allowed = site_obj.id == acting.site_id
#         else:
#             allowed = False

#         if not allowed:
#             return JsonResponse(
#                 {"status": "error", "message": "You do not have access to the selected site."},
#                 status=403,
#             )

#         if not site_obj.branch.customer_id:
#             return JsonResponse(
#                 {"status": "error", "message": "The selected site is not assigned to a customer."},
#                 status=400,
#             )

#         ac_id = str(body.get("ac_id", "")).strip()
#         device_name = str(body.get("device_name", "")).strip()
#         status_val = str(body.get("status", "OFF")).strip().upper()
#         capacity_raw = body.get("capacity_ton", "")
#         installation_date = str(body.get("installation_date", "")).strip()
#         last_maintenance_date = str(body.get("last_maintenance_date", "")).strip()

#         if not ac_id:
#             return JsonResponse(
#                 {"status": "error", "message": "ac_id is required"},
#                 status=400,
#             )

#         if not device_name:
#             device_name = get_ac_device_name(ac_id)

#         if status_val not in {"ON", "OFF"}:
#             status_val = "OFF"

#         try:
#             capacity_ton = float(capacity_raw)
#         except (TypeError, ValueError):
#             capacity_ton = 0

#         if capacity_ton <= 0:
#             return JsonResponse(
#                 {"status": "error", "message": "capacity_ton must be greater than 0"},
#                 status=400,
#             )

#         if not installation_date:
#             return JsonResponse(
#                 {"status": "error", "message": "installation_date is required"},
#                 status=400,
#             )

#         if last_maintenance_date and last_maintenance_date < installation_date:
#             return JsonResponse(
#                 {
#                     "status": "error",
#                     "message": "last_maintenance_date cannot be before installation_date",
#                 },
#                 status=400,
#             )

#         from django.db import transaction

#         with transaction.atomic():
#             db_device, created = ACDevice.objects.update_or_create(
#                 ac_id=ac_id,
#                 defaults={
#                     "device_name": device_name,
#                     "site": site_obj,
#                     "status": status_val,
#                     "capacity_ton": capacity_ton,
#                     "installation_date": installation_date,
#                     "last_maintenance_date": last_maintenance_date or None,
#                     "assigned_by": acting,
#                 },
#             )

#         # Mirror the local AC into 3TP after the local relationship has been
#         # established. Local Site -> Branch -> Customer remains the source of truth.
#         try:
#             customer = site_obj.branch.customer
#             if not customer.tpt_customer_id:
#                 sync_customer(customer)
#             if not site_obj.tpt_site_id:
#                 sync_site(site_obj)
#             sync_device(db_device)
#         except ThreeTPError as exc:
#             ACDevice.objects.filter(pk=db_device.pk).update(
#                 tpt_sync_status="FAILED",
#                 tpt_sync_error=str(exc),
#             )

#         customer = site_obj.branch.customer

#         admins = list(
#             site_obj.users.filter(
#                 role=Role.BR_ADMIN, is_active=True
#             ).values("id", "name", "email", "phone", "role", "branch_id", "site_id")
#         )
#         engineers = list(
#             site_obj.users.filter(
#                 role=Role.ENGINEER, is_active=True
#             ).values("id", "name", "email", "phone", "role", "branch_id", "site_id")
#         )

#         hierarchy_type = getattr(customer, "hierarchy_type", "") or ""

#         # Keep DeviceLocationMap synchronized for the existing telemetry
#         # and dashboard code. It is a compatibility/cache layer; ownership
#         # itself comes from the Django relationships above.
#         device_map = build_device_location_map()
#         old_mapping = device_map.get(ac_id, {})

#         mapping = {
#             "ac_id": ac_id,
#             "site_id": str(site_obj.id),
#             "site_name": site_obj.name,
#             "site_code": site_obj.code,
#             "device_name": device_name,
#             "status": status_val,
#             "location_type": "SITE",
#             "hierarchy_type": hierarchy_type,
#             "customer_id": str(customer.id),
#             "customer_name": customer.company,
#             "branch_id": str(site_obj.branch_id),
#             "branch_name": site_obj.branch.name,
#             "floor_id": str(site_obj.floor_id or ""),
#             "floor_name": site_obj.floor.name if site_obj.floor_id else "",
#             "capacity_ton": capacity_ton,
#             "installation_date": installation_date,
#             "last_maintenance_date": last_maintenance_date,
#             "created_by_id": str(getattr(acting, "id", "") or ""),
#             "created_by_name": getattr(acting, "name", "") or getattr(acting, "email", ""),
#             "created_by_email": getattr(acting, "email", ""),
#             "created_by_role": getattr(acting, "role", ""),
#         }

#         # Remove old legacy tree placement if this AC was previously stored there.
#         if old_mapping:
#             old_hierarchy = (old_mapping.get("hierarchy_type") or "").upper()
#             old_file = (
#                 GEOGRAPHICAL_LOCATION_FILE
#                 if old_hierarchy == "GEOGRAPHICAL"
#                 else ZONAL_LOCATION_FILE
#                 if old_hierarchy == "ZONAL"
#                 else None
#             )
#             if old_file:
#                 try:
#                     old_tree = load_location_tree(old_file)
#                     old_site_id = old_mapping.get("site_id") or ac_id
#                     if remove_site_from_tree(old_tree, old_site_id):
#                         save_location_tree(old_tree, old_file)
#                 except Exception:
#                     pass

#         device_map[ac_id] = mapping
#         save_device_location_map(device_map)

#         response_data = dict(mapping)
#         response_data["customer"] = {
#             "id": customer.id,
#             "company": customer.company,
#             "code": customer.code,
#         }
#         response_data["admins"] = admins
#         response_data["engineers"] = engineers
#         response_data["site"] = {
#             "id": str(site_obj.id),
#             "name": site_obj.name,
#             "code": site_obj.code,
#         }

#         return JsonResponse(
#             {
#                 "status": "success",
#                 "message": (
#                     f"{ac_id} created and assigned to {site_obj.name}."
#                     if created
#                     else f"{ac_id} reassigned to {site_obj.name}."
#                 ),
#                 "data": response_data,
#             },
#             status=201 if created else 200,
#         )

#     # Legacy branch/floor flow is kept below for backward compatibility.
#     ac_id       = str(body.get("ac_id", "")).strip()
#     hierarchy   = str(body.get("hierarchy_type", "")).strip().upper()
#     branch_id   = str(body.get("branch_id", "")).strip()
#     floor_id    = str(body.get("floor_id", "")).strip()
#     device_name = str(body.get("device_name", "")).strip()
#     status_val  = str(body.get("status", "OFF")).strip().upper()
#     capacity_raw = body.get("capacity_ton", "")
#     installation_date = str(body.get("installation_date", "")).strip()
#     last_maintenance_date = str(body.get("last_maintenance_date", "")).strip()

#     try:
#         capacity_ton = float(capacity_raw)
#     except (TypeError, ValueError):
#         capacity_ton = 0

#     acting = getattr(request, "user", None)
#     created_by_id    = str(getattr(acting, "id", "") or "")
#     created_by_name  = getattr(acting, "name", "") or getattr(acting, "email", "")
#     created_by_email = getattr(acting, "email", "")
#     created_by_role  = getattr(acting, "role", "")

#     if not ac_id:
#         return JsonResponse({"status": "error", "message": "ac_id is required"}, status=400)
#     if hierarchy not in {"GEOGRAPHICAL", "ZONAL"}:
#         return JsonResponse(
#             {"status": "error", "message": "hierarchy_type must be 'GEOGRAPHICAL' or 'ZONAL'"},
#             status=400,
#         )
#     if not branch_id:
#         return JsonResponse({"status": "error", "message": "branch_id is required"}, status=400)

#     if not device_name:
#         device_name = get_ac_device_name(ac_id)

#     if status_val not in {"ON", "OFF"}:
#         status_val = "OFF"

#     # if not customer_id:
#     #     return JsonResponse(
#     #         {"status": "error", "message": "customer_id is required"},
#     #         status=400,
#     #     )
#     if capacity_ton <= 0:
#         return JsonResponse(
#             {"status": "error", "message": "capacity_ton must be greater than 0"},
#             status=400,
#         )
#     if not installation_date:
#         return JsonResponse(
#             {"status": "error", "message": "installation_date is required"},
#             status=400,
#         )
#     if last_maintenance_date and last_maintenance_date < installation_date:
#         return JsonResponse(
#             {"status": "error", "message": "last_maintenance_date cannot be before installation_date"},
#             status=400,
#         )

#     location_file = (
#         GEOGRAPHICAL_LOCATION_FILE if hierarchy == "GEOGRAPHICAL"
#         else ZONAL_LOCATION_FILE
#     )

#     try:
#         tree = load_location_tree(location_file)
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Location tree file is malformed"},
#             status=500,
#         )

#     target = find_location_target(
#         tree, hierarchy, branch_id=branch_id, floor_id=floor_id,
#     )
#     if not target:
#         return JsonResponse(
#             {
#                 "status": "error",
#                 "message": "Selected floor/branch was not found in the selected hierarchy",
#             },
#             status=404,
#         )

#     branch  = target["branch"]
#     floor   = target["floor"]
#     context = target["context"]

#     # ---- ownership: the AC inherits the customer/admins of the site ----
#     if not ownership.can_manage_branch(request.user, branch):
#         return JsonResponse(
#             {"status": "error", "message": "You do not have access to this site."},
#             status=403,
#         )
#     customer_id = branch.get("customer_id")
#     if not customer_id:
#         return JsonResponse(
#             {"status": "error",
#              "message": "This site is not assigned to a customer yet. "
#                         "Assign a customer and admin to the site first (Sites page)."},
#             status=400,
#         )

#     old_mapping = device_map.get(ac_id, {})
#     if old_mapping and request.user.role != Role.ORG_SUPER_ADMIN:
#         old_nodes = nodes_for_mapping(old_mapping, ownership.build_branch_index())
#         if old_nodes and not any(ownership.can_manage_branch(request.user, n) for n in old_nodes):
#             return JsonResponse(
#                 {"status": "error", "message": "This AC is assigned to a site you cannot manage."},
#                 status=403,
#             )
#     old_site_id = old_mapping.get("site_id") or ac_id
#     remove_site_from_tree(tree, old_site_id)
#     if old_site_id != ac_id:
#         remove_site_from_tree(tree, ac_id)

#     site = {
#         "site_id":     ac_id,
#         "device_name": device_name,
#         "status":      status_val,
#         "capacity_ton": capacity_ton,
#         "installation_date": installation_date,
#         "last_maintenance_date": last_maintenance_date,
#     }

#     if floor is not None:
#         if not isinstance(floor.get("sites"), list):
#             floor["sites"] = []
#         floor["sites"].append(site)

#         location_type    = "FLOOR"
#         assigned_floor_id   = floor.get("floor_id", "")
#         assigned_floor_name = floor.get("floor_name", "")
#     else:
#         if not isinstance(branch.get("sites"), list):
#             branch["sites"] = []
#         branch["sites"].append(site)

#         location_type    = "DIRECT_BRANCH"
#         assigned_floor_id   = ""
#         assigned_floor_name = ""
        

#     save_location_tree(tree, location_file)

#     mapping = {
#         "ac_id":          ac_id,
#         "site_id":        ac_id,
#         "device_name":    device_name,
#         "status":         status_val,
#         "location_type":  location_type,
#         "hierarchy_type": hierarchy,

#         "customer_id":    customer_id,            # ← resolved from the site

#         "created_by_id":    created_by_id,        # ← new
#         "created_by_name":  created_by_name,
#         "created_by_email": created_by_email,
#         "created_by_role":  created_by_role,

#         "branch_id":      branch.get("branch_id", ""),
#         "branch_name":    branch.get("branch_name", ""),
#         "floor_id":       assigned_floor_id,
#         "floor_name":     assigned_floor_name,

#         "capacity_ton":            capacity_ton,
#         "installation_date":       installation_date,
#         "last_maintenance_date":   last_maintenance_date,
#     }
#     mapping.update(context)

#     device_map[ac_id] = mapping
#     save_device_location_map(device_map)

#     info = ownership.OwnerLookup.for_nodes([branch]).describe(branch)
#     response_data = dict(mapping)
#     response_data["customer_name"] = info["customer"]["company"] if info["customer"] else ""
#     response_data["admins"] = info["admins"]
#     response_data["engineers"] = info["engineers"]

#     return JsonResponse(
#         {
#             "status":  "success",
#             "message": f"{ac_id} assigned successfully",
#             "data":    response_data,
#         },
#         status=201,
#     )

# def make_code_id(existing_ids, name, prefix=""):
#     words = [w for w in name.strip().split() if w]

#     if len(words) >= 2:
#         base = (words[0][0] + words[1][0]).upper()
#     else:
#         base = name.strip()[:2].upper()

#     base = f"{prefix}{base}" if prefix else base

#     candidate = base
#     suffix = 1

#     while candidate in existing_ids:
#         suffix += 1
#         candidate = f"{base}{suffix}"

#     return candidate

# def _scoped_tree(location_file, user):
#     """Location tree limited to what `user` may see, with owner details attached."""
#     tree = load_location_tree(location_file)
#     tree = ownership.filter_tree_for_user(tree, user)
#     return ownership.attach_owner_details(tree)


# def _locations_impl(request):
#     if request.method == "GET":

#         hierarchy = request.GET.get("hierarchy", "").strip().upper()

#         try:
#             if hierarchy == "GEOGRAPHICAL":
#                 data = _scoped_tree(GEOGRAPHICAL_LOCATION_FILE, request.user)
#                 return JsonResponse(
#                     {
#                         "success": True,
#                         "hierarchy_type": "GEOGRAPHICAL",
#                         "data": data,
#                     },
#                     safe=True,
#                 )

#             if hierarchy == "ZONAL":
#                 data = _scoped_tree(ZONAL_LOCATION_FILE, request.user)
#                 return JsonResponse(
#                     {
#                         "success": True,
#                         "hierarchy_type": "ZONAL",
#                         "data": data,
#                     },
#                     safe=True,
#                 )

#             geographical_data = _scoped_tree(GEOGRAPHICAL_LOCATION_FILE, request.user)
#             zonal_data = _scoped_tree(ZONAL_LOCATION_FILE, request.user)

#             return JsonResponse(
#                 {
#                     "success": True,
#                     "geographical": {
#                         "hierarchy_type": "GEOGRAPHICAL",
#                         "data": geographical_data,
#                     },
#                     "zonal": {
#                         "hierarchy_type": "ZONAL",
#                         "data": zonal_data,
#                     },
#                 },
#                 safe=True,
#             )

#         except json.JSONDecodeError:
#             return JsonResponse(
#                 {"success": False, "message": "Invalid JSON format"},
#                 status=500,
#             )

#         except Exception as e:
#             return JsonResponse(
#                 {"success": False, "message": str(e)},
#                 status=500,
#             )

#     # ================================================================
#     # POST
#     # ================================================================

#     try:
#         body = json.loads(request.body or "{}")
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"success": False, "message": "Invalid JSON body"},
#             status=400,
#         )

#     hierarchy = str(body.get("hierarchy_type", "")).strip().upper()

#     if hierarchy not in {"ZONAL", "GEOGRAPHICAL"}:
#         return JsonResponse(
#             {
#                 "success": False,
#                 "message": "hierarchy_type must be 'ZONAL' or 'GEOGRAPHICAL'",
#             },
#             status=400,
#         )

#     location_file = (
#         ZONAL_LOCATION_FILE if hierarchy == "ZONAL" else GEOGRAPHICAL_LOCATION_FILE
#     )

#     try:
#         tree = load_location_tree(location_file)
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"success": False, "message": "Invalid JSON format"},
#             status=500,
#         )

#     # ================================================================
#     # ZONAL HIERARCHY
#     #
#     # India -> Zone -> Circle -> Region -> Division -> Branch -> Floor -> Site
#     # ================================================================

#     if hierarchy == "ZONAL":

#         zone_name = str(body.get("zone_name", "")).strip()
#         circle_name = str(body.get("circle_name", "")).strip()
#         region_name = str(body.get("region_name", "")).strip()
#         division_name = str(body.get("division_name", "")).strip()
#         branch_name = str(body.get("branch_name", "")).strip()
#         floor_name = str(body.get("floor_name", "")).strip()

#         missing = [
#             field
#             for field, value in [
#                 ("zone_name", zone_name),
#                 ("circle_name", circle_name),
#                 ("region_name", region_name),
#                 ("division_name", division_name),
#                 ("branch_name", branch_name),
#                 ("floor_name", floor_name),
#             ]
#             if not value
#         ]

#         if missing:
#             return JsonResponse(
#                 {
#                     "success": False,
#                     "message": "Missing required field(s): " + ", ".join(missing),
#                 },
#                 status=400,
#             )

#         # ------------------------------------------------------------
#         # ZONE
#         # ------------------------------------------------------------

#         zone = next(
#             (
#                 z for z in tree
#                 if z.get("zone_name", "").strip().lower() == zone_name.lower()
#             ),
#             None,
#         )

#         if zone is None:
#             zone_ids = {z.get("zone_id", "") for z in tree}

#             zone = {
#                 "zone_id": make_code_id(zone_ids, zone_name, prefix="ZN-"),
#                 "zone_name": zone_name,
#                 "circles": [],
#             }
#             tree.append(zone)

#         # ------------------------------------------------------------
#         # CIRCLE
#         # ------------------------------------------------------------

#         circle = next(
#             (
#                 c for c in zone.get("circles", [])
#                 if c.get("circle_name", "").strip().lower() == circle_name.lower()
#             ),
#             None,
#         )

#         if circle is None:
#             circle_ids = {
#                 c.get("circle_id", "")
#                 for z in tree
#                 for c in z.get("circles", [])
#             }

#             circle = {
#                 "circle_id": make_code_id(
#                     circle_ids, circle_name, prefix=f"{zone['zone_id']}-C"
#                 ),
#                 "circle_name": circle_name,
#                 "regions": [],
#             }
#             zone.setdefault("circles", []).append(circle)

#         # ------------------------------------------------------------
#         # REGION
#         # ------------------------------------------------------------

#         region = next(
#             (
#                 r for r in circle.get("regions", [])
#                 if r.get("region_name", "").strip().lower() == region_name.lower()
#             ),
#             None,
#         )

#         if region is None:
#             region_ids = {
#                 r.get("region_id", "")
#                 for z in tree
#                 for c in z.get("circles", [])
#                 for r in c.get("regions", [])
#             }

#             region = {
#                 "region_id": make_code_id(
#                     region_ids, region_name, prefix=f"{circle['circle_id']}-R"
#                 ),
#                 "region_name": region_name,
#                 "divisions": [],
#             }
#             circle.setdefault("regions", []).append(region)

#         # ------------------------------------------------------------
#         # DIVISION
#         # ------------------------------------------------------------

#         division = next(
#             (
#                 d for d in region.get("divisions", [])
#                 if d.get("division_name", "").strip().lower() == division_name.lower()
#             ),
#             None,
#         )

#         if division is None:
#             division_ids = {
#                 d.get("division_id", "")
#                 for z in tree
#                 for c in z.get("circles", [])
#                 for r in c.get("regions", [])
#                 for d in r.get("divisions", [])
#             }

#             division = {
#                 "division_id": make_code_id(
#                     division_ids, division_name, prefix=f"{region['region_id']}-D"
#                 ),
#                 "division_name": division_name,
#                 "branches": [],
#             }
#             region.setdefault("divisions", []).append(division)

#         # ------------------------------------------------------------
#         # BRANCH
#         # ------------------------------------------------------------

#         branch = next(
#             (
#                 b for b in division.get("branches", [])
#                 if b.get("branch_name", "").strip().lower() == branch_name.lower()
#             ),
#             None,
#         )

#         if branch is None:
#             branch_index = len(division.get("branches", [])) + 1

#             branch = {
#                 "branch_id": f"{division['division_id']}-B{branch_index:02d}",
#                 "branch_name": branch_name,
#                 "floors": [],
#                 "sites": [],
#             }
#             division.setdefault("branches", []).append(branch)

#         # ------------------------------------------------------------
#         # FLOOR
#         # ------------------------------------------------------------

#         if any(
#             f.get("floor_name", "").strip().lower() == floor_name.lower()
#             for f in branch.get("floors", [])
#         ):
#             return JsonResponse(
#                 {
#                     "success": False,
#                     "message": f"Floor '{floor_name}' already exists in this branch",
#                 },
#                 status=409,
#             )

#         floor_index = len(branch.get("floors", [])) + 1

#         floor = {
#             "floor_id": f"{branch['branch_id']}-F{floor_index:02d}",
#             "floor_name": floor_name,
#             "sites": [],
#         }
#         branch.setdefault("floors", []).append(floor)

#         save_location_tree(tree, location_file)

#         return JsonResponse(
#             {
#                 "success": True,
#                 "hierarchy_type": "ZONAL",
#                 "data": {
#                     "zone_id": zone["zone_id"],
#                     "zone_name": zone["zone_name"],

#                     "circle_id": circle["circle_id"],
#                     "circle_name": circle["circle_name"],

#                     "region_id": region["region_id"],
#                     "region_name": region["region_name"],

#                     "division_id": division["division_id"],
#                     "division_name": division["division_name"],

#                     "branch_id": branch["branch_id"],
#                     "branch_name": branch["branch_name"],

#                     "floor_id": floor["floor_id"],
#                     "floor_name": floor["floor_name"],
#                 },
#             },
#             status=201,
#         )

#     # ================================================================
#     # GEOGRAPHICAL HIERARCHY
#     #
#     # India -> State -> District -> Taluka -> City -> Branch -> Floor -> Site
#     # ================================================================

#     state_name = str(body.get("state_name", "")).strip()
#     district_name = str(body.get("district_name", "")).strip()
#     taluka_name = str(body.get("taluka_name", "")).strip()
#     city_name = str(body.get("city_name", "")).strip()
#     branch_name = str(body.get("branch_name", "")).strip()
#     floor_name = str(body.get("floor_name", "")).strip()

#     missing = [
#         field
#         for field, value in [
#             ("state_name", state_name),
#             ("district_name", district_name),
#             ("taluka_name", taluka_name),
#             ("city_name", city_name),
#             ("branch_name", branch_name),
#             ("floor_name", floor_name),
#         ]
#         if not value
#     ]

#     if missing:
#         return JsonResponse(
#             {
#                 "success": False,
#                 "message": "Missing required field(s): " + ", ".join(missing),
#             },
#             status=400,
#         )

#     # ------------------------------------------------------------
#     # STATE
#     # ------------------------------------------------------------

#     state = next(
#         (
#             s for s in tree
#             if s.get("state_name", "").strip().lower() == state_name.lower()
#         ),
#         None,
#     )

#     if state is None:
#         state_ids = {s.get("state_id", "") for s in tree}

#         state = {
#             "state_id": make_code_id(state_ids, state_name),
#             "state_name": state_name,
#             "districts": [],
#         }
#         tree.append(state)

#     # ------------------------------------------------------------
#     # DISTRICT
#     # ------------------------------------------------------------

#     district = next(
#         (
#             d for d in state.get("districts", [])
#             if d.get("district_name", "").strip().lower() == district_name.lower()
#         ),
#         None,
#     )

#     if district is None:
#         district_index = len(state.get("districts", [])) + 1

#         district = {
#             "district_id": f"{state['state_id']}-D{district_index:02d}",
#             "district_name": district_name,
#             "talukas": [],
#         }
#         state.setdefault("districts", []).append(district)

#     # ------------------------------------------------------------
#     # TALUKA
#     # ------------------------------------------------------------

#     taluka = next(
#         (
#             t for t in district.get("talukas", [])
#             if t.get("taluka_name", "").strip().lower() == taluka_name.lower()
#         ),
#         None,
#     )

#     if taluka is None:
#         taluka_index = len(district.get("talukas", [])) + 1

#         taluka = {
#             "taluka_id": f"{district['district_id']}-T{taluka_index:02d}",
#             "taluka_name": taluka_name,
#             "cities": [],
#         }
#         district.setdefault("talukas", []).append(taluka)

#     # ------------------------------------------------------------
#     # CITY
#     # ------------------------------------------------------------

#     city = next(
#         (
#             c for c in taluka.get("cities", [])
#             if c.get("city_name", "").strip().lower() == city_name.lower()
#         ),
#         None,
#     )

#     if city is None:
#         city_index = len(taluka.get("cities", [])) + 1

#         city = {
#             "city_id": f"{taluka['taluka_id']}-C{city_index:02d}",
#             "city_name": city_name,
#             "branches": [],
#         }
#         taluka.setdefault("cities", []).append(city)

#     # ------------------------------------------------------------
#     # BRANCH
#     # ------------------------------------------------------------

#     branch = next(
#         (
#             b for b in city.get("branches", [])
#             if b.get("branch_name", "").strip().lower() == branch_name.lower()
#         ),
#         None,
#     )

#     if branch is None:
#         branch_index = len(city.get("branches", [])) + 1

#         branch = {
#             "branch_id": f"{city['city_id']}-B{branch_index:02d}",
#             "branch_name": branch_name,
#             "floors": [],
#             "sites": [],
#         }
#         city.setdefault("branches", []).append(branch)

#     # ------------------------------------------------------------
#     # FLOOR
#     # ------------------------------------------------------------

#     if any(
#         f.get("floor_name", "").strip().lower() == floor_name.lower()
#         for f in branch.get("floors", [])
#     ):
#         return JsonResponse(
#             {
#                 "success": False,
#                 "message": f"Floor '{floor_name}' already exists in this branch",
#             },
#             status=409,
#         )

#     floor_index = len(branch.get("floors", [])) + 1

#     floor = {
#         "floor_id": f"{branch['branch_id']}-F{floor_index:02d}",
#         "floor_name": floor_name,
#         "sites": [],
#     }
#     branch.setdefault("floors", []).append(floor)

#     save_location_tree(tree, location_file)

#     return JsonResponse(
#         {
#             "success": True,
#             "hierarchy_type": "GEOGRAPHICAL",
#             "data": {
#                 "state_id": state["state_id"],
#                 "state_name": state["state_name"],

#                 "district_id": district["district_id"],
#                 "district_name": district["district_name"],

#                 "taluka_id": taluka["taluka_id"],
#                 "taluka_name": taluka["taluka_name"],

#                 "city_id": city["city_id"],
#                 "city_name": city["city_name"],

#                 "branch_id": branch["branch_id"],
#                 "branch_name": branch["branch_name"],

#                 "floor_id": floor["floor_id"],
#                 "floor_name": floor["floor_name"],
#             },
#         },
#         status=201,
#     )

# def matches(value, selected):
#     if not selected:
#         return True
#     return str(value).strip().lower() == str(selected).strip().lower()

# GEOGRAPHICAL_FIELDS = [
#     "state_id", "state_name",
#     "district_id", "district_name",
#     "taluka_id", "taluka_name",
#     "city_id", "city_name",
#     "branch_id", "branch_name",
#     "floor_id", "floor_name",
#     "site_id",
# ]

# ZONAL_FIELDS = [
#     "zone_id", "zone_name",
#     "circle_id", "circle_name",
#     "region_id", "region_name",
#     "division_id", "division_name",
#     "branch_id", "branch_name",
#     "floor_id", "floor_name",
#     "site_id",
# ]


# def resolve_ac_location(ac_id, device_map):
#     mapping = device_map.get(ac_id, {})

#     if not mapping:
#         return {
#             "geographical": {},
#             "zonal": {},
#             "site_id": "",
#             "device_name": "",
#             "location_type": "",
#             "hierarchy_type": "",
#         }

#     if "geographical" in mapping or "zonal" in mapping:
#         geo = mapping.get("geographical") or {}
#         zon = mapping.get("zonal") or {}

#         hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()
#         if not hierarchy_type:
#             hierarchy_type = ""

#         return {
#             "geographical": geo,
#             "zonal": zon,
#             "site_id": mapping.get("site_id", ""),
#             "device_name": mapping.get("device_name", ""),
#             "location_type": mapping.get("location_type", ""),
#             "hierarchy_type": hierarchy_type,
#         }

#     # --- Flat shape (written by /devices/ POST) ---------------------
#     hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()

#     geo = {}
#     zon = {}

#     if hierarchy_type == "GEOGRAPHICAL":
#         geo = {field: mapping.get(field, "") for field in GEOGRAPHICAL_FIELDS}
#     elif hierarchy_type == "ZONAL":
#         zon = {field: mapping.get(field, "") for field in ZONAL_FIELDS}

#     return {
#         "geographical": geo,
#         "zonal": zon,
#         "site_id": mapping.get("site_id", ""),
#         "device_name": mapping.get("device_name", ""),
#         "location_type": mapping.get("location_type", ""),
#         "hierarchy_type": hierarchy_type,
#     }


# def filter_by_location(data, request):
#     hierarchy = request.GET.get("hierarchy", "").strip().upper()

#     zone     = request.GET.get("zone", "").strip()
#     state    = request.GET.get("state", "").strip()
#     district = request.GET.get("district", "").strip()
#     taluka   = request.GET.get("taluka", "").strip()
#     circle   = request.GET.get("circle", "").strip()
#     region   = request.GET.get("region", "").strip()
#     division = request.GET.get("division", "").strip()
#     city     = request.GET.get("city", "").strip()
#     branch   = request.GET.get("branch", "").strip()
#     floor    = request.GET.get("floor", "").strip()

#     # Nothing to filter on → return everything
#     if not any([hierarchy, zone, state, district, taluka, circle,
#                 region, division, city, branch, floor]):
#         return data

#     device_map = build_device_location_map()

#     def keep(record):
#         ac_id = record.get("ac_id", "")
#         loc   = resolve_ac_location(ac_id, device_map)
#         geo   = loc["geographical"]
#         zon   = loc["zonal"]

#         if hierarchy == "GEOGRAPHICAL":
#             if not geo:
#                 return False
#             return (
#                 matches(geo.get("state_name", ""),    state)
#                 and matches(geo.get("district_name", ""), district)
#                 and matches(geo.get("taluka_name", ""),   taluka)
#                 and matches(geo.get("city_name", ""),     city)
#                 and matches(geo.get("branch_name", ""),   branch)
#                 and matches(geo.get("floor_name", ""),    floor)
#             )

#         if hierarchy == "ZONAL":
#             if not zon:
#                 return False
#             return (
#                 matches(zon.get("zone_name", ""),     zone)
#                 and matches(zon.get("circle_name", ""),   circle)
#                 and matches(zon.get("region_name", ""),   region)
#                 and matches(zon.get("division_name", ""), division)
#                 and matches(zon.get("branch_name", ""),   branch)
#                 and matches(zon.get("floor_name", ""),    floor)
#             )

#         # No hierarchy specified — fall back to matching whatever
#         # individual filters were sent against whichever block has
#         # that field.
#         branch_name = geo.get("branch_name") or zon.get("branch_name") or ""
#         floor_name  = geo.get("floor_name") or zon.get("floor_name") or ""

#         return (
#             matches(geo.get("state_name", ""),    state)
#             and matches(geo.get("district_name", ""), district)
#             and matches(geo.get("taluka_name", ""),   taluka)
#             and matches(geo.get("city_name", ""),     city)
#             and matches(zon.get("zone_name", ""),     zone)
#             and matches(zon.get("circle_name", ""),   circle)
#             and matches(zon.get("region_name", ""),   region)
#             and matches(zon.get("division_name", ""), division)
#             and matches(branch_name, branch)
#             and matches(floor_name, floor)
#         )

#     return [record for record in data if keep(record)]


# def attach_location(record, device_map):
#     enriched = dict(record)
#     ac_id    = record.get("ac_id", "")
#     loc      = resolve_ac_location(ac_id, device_map)

#     enriched.update(loc["geographical"])
#     enriched.update(loc["zonal"])

#     if loc["site_id"]:
#         enriched["site_id"] = loc["site_id"]
#     if loc["device_name"]:
#         enriched["device_name"] = loc["device_name"]

#     enriched["location_type"] = loc["location_type"]
#     enriched["hierarchy_type"] = loc["hierarchy_type"]

#     return enriched


# @api_view(["GET"])
# def ac_data_with_location(request):
#     try:
#         from . import telemetry
#         data = telemetry.get_records()

#         data = scope_ac_records(data, request.user)
#         data = filter_by_location(data, request)

#         device_map = build_device_location_map()
#         data = [attach_location(rec, device_map) for rec in data]

#         return JsonResponse(
#             {"status": "success", "count": len(data), "data": data},
#             safe=True,
#         )

#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Invalid JSON format"},
#             status=500,
#         )

#     except Exception as e:
#         return JsonResponse(
#             {"status": "error", "message": str(e)},
#             status=500,
#         )

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def ac_data(request):
#     try:
#         from . import telemetry

#         data = telemetry.get_records()

#         data = scope_ac_records(data, request.user)
#         data = filter_by_location(data, request)

#         device_map = build_device_location_map()

#         data = [
#             attach_location(rec, device_map)
#             for rec in data
#         ]

#         return JsonResponse(
#             {
#                 "status": "success",
#                 "count": len(data),
#                 "data": data,
#             },
#             safe=True,
#         )

#     except json.JSONDecodeError:
#         return JsonResponse(
#             {
#                 "status": "error",
#                 "message": "Invalid JSON format",
#             },
#             status=500,
#         )

#     except Exception as e:
#         return JsonResponse(
#             {
#                 "status": "error",
#                 "message": str(e),
#             },
#             status=500,
#         )
    
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def telemetry_status(request):
#     from . import telemetry
#     return JsonResponse(telemetry.get_status())


# @api_view(["GET"])
# def latest_ac_data(request):
#     try:
#         from . import telemetry
#         data = scope_ac_records(telemetry.get_records(), request.user)

#         if not data:
#             return JsonResponse({"status": "success", "data": None})

#         return JsonResponse({"status": "success", "data": data[-1]})

#     except Exception as e:
#         return JsonResponse(
#             {"status": "error", "message": str(e)},
#             status=500,
#         )

# def get_client_ip(request):
#     xff = request.META.get("HTTP_X_FORWARDED_FOR")
#     if xff:
#         return xff.split(",")[0].strip()
#     return request.META.get("REMOTE_ADDR")


# # def log_attempt(request, success, user=None, email="", role="", reason=""):
# #     LoginAudit.objects.create(
# #         user=user,
# #         email_attempted=email,
# #         role_attempted=role,
# #         ip_address=get_client_ip(request),
# #         user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
# #         success=success,
# #         reason=reason,
# #     )

# @api_view(["POST"])
# @permission_classes([AllowAny])
# def login_view(request):

#     email = (request.data.get("email") or "").strip().lower()
#     password = request.data.get("password") or ""
#     requested_role = (request.data.get("role") or "").strip()

#     if not email or not password:
#         return Response(
#             {
#                 "status": "error",
#                 "message": "Email and password are required."
#             },
#             status=400
#         )

#     try:

#         # ============================================================
#         # 1. DIRECT 3TP LOGIN
#         # ============================================================

#         tb_response = requests.post(
#             f"{CLOUD_URL}/api/auth/login",
#             json={
#                 "username": email,
#                 "password": password
#             },
#             headers={
#                 "Content-Type": "application/json",
#                 "Accept": "application/json"
#             },
#             timeout=15
#         )

#         try:
#             data = tb_response.json()
#         except ValueError:
#             data = {}

#         if tb_response.status_code != 200:

#             return Response(
#                 {
#                     "status": "error",
#                     "message": data.get(
#                         "message",
#                         "3TP authentication failed."
#                     )
#                 },
#                 status=tb_response.status_code
#             )

#         # ============================================================
#         # 2. GET 3TP TOKENS
#         # ============================================================

#         three_tp_token = data.get("token")
#         refresh_token = data.get("refreshToken")

#         if not three_tp_token:

#             return Response(
#                 {
#                     "status": "error",
#                     "message": "3TP login succeeded but no token was returned."
#                 },
#                 status=502
#             )

#         # ============================================================
#         # 3. FIND LOCAL USER
#         # ============================================================

#         user = User.objects.filter(
#             email__iexact=email
#         ).first()

#         if user is None:

#             return Response(
#                 {
#                     "status": "error",
#                     "message": (
#                         "3TP login succeeded, but this user "
#                         "does not exist in the AC Monitoring system."
#                     )
#                 },
#                 status=403
#             )

#         # ============================================================
#         # 4. CHECK LOCAL USER STATUS
#         # ============================================================

#         if not user.is_active:

#             return Response(
#                 {
#                     "status": "error",
#                     "message": "User account is inactive."
#                 },
#                 status=403
#             )

#         # ============================================================
#         # 5. CHECK ROLE
#         # ============================================================

#         if requested_role and user.role != requested_role:

#             return Response(
#                 {
#                     "status": "error",
#                     "message": (
#                         f"This account belongs to "
#                         f"'{user.get_role_display()}'."
#                     )
#                 },
#                 status=403
#             )

#         # ============================================================
#         # 6. UPDATE LOCAL LOGIN INFORMATION
#         # ============================================================

#         user.last_login = timezone.now()
#         user.last_login_ip = get_client_ip(request)

#         user.save(
#             update_fields=[
#                 "last_login",
#                 "last_login_ip"
#             ]
#         )

#         django_login(request, user)

#         # ============================================================
#         # 7. STORE 3TP TOKEN -> LOCAL USER MAPPING
#         # ============================================================

#         import hashlib

#         token_hash = hashlib.sha256(
#             three_tp_token.encode("utf-8")
#         ).hexdigest()

#         cache.set(
#             f"3tp_auth:{token_hash}",
#             user.id,
#             timeout=60 * 60 * 8
#         )

#         # ============================================================
#         # 8. RETURN 3TP TOKEN DIRECTLY
#         # ============================================================

#         return Response(
#             {
#                 "status": "success",
#                 "message": "Login successful",

#                 # 3TP JWT
#                 "token": three_tp_token,

#                 # 3TP refresh token
#                 "refreshToken": refresh_token,

#                 "user": UserSerializer(user).data,

#                 "redirect": _dashboard_path(user.role)
#             },
#             status=200
#         )

#     except requests.exceptions.RequestException as exc:

#         return Response(
#             {
#                 "status": "error",
#                 "message": f"3TP connection error: {str(exc)}"
#             },
#             status=502
#         )

#     except Exception as exc:

#         import traceback
#         traceback.print_exc()

#         return Response(
#             {
#                 "status": "error",
#                 "message": str(exc)
#             },
#             status=500
#         )

# def _complete_local_login(request, user):

#     user.last_login = timezone.now()
#     user.last_login_ip = get_client_ip(request)

#     user.save(
#         update_fields=[
#             "last_login",
#             "last_login_ip",
#         ]
#     )

#     django_login(request, user)

#     token, _ = Token.objects.get_or_create(
#         user=user
#     )

#     return Response(
#         {
#             "status": "success",
#             "message": "Login successful",
#             "token": token.key,
#             "user": UserSerializer(user).data,
#             "redirect": _dashboard_path(user.role),
#         },
#         status=200,
#     )

# def get_scope(self):
#     if self.role == Role.ORG_SUPER_ADMIN:
#         return "ORGANIZATION", self.organization_id

#     if self.role == Role.CUSTOMER:
#         return "CUSTOMER", self.customer_id

#     if self.role == Role.BR_ADMIN:
#         hierarchy = (
#             getattr(self.customer, "hierarchy_type", None)
#             if self.customer_id
#             else None
#         )

#         if hierarchy == HierarchyType.GEOGRAPHICAL and self.state_id:
#             return "STATE", self.state_id

#         if hierarchy == HierarchyType.ZONAL and self.zone_id:
#             return "ZONE", self.zone_id

#         if self.branch_id:
#             return "BRANCH", self.branch_id

#         return None, None

#     if self.role == Role.ENGINEER:
#         return "SITE", self.site_id

#     return None, None

# def _dashboard_path(role):
#     return {
#         Role.ORG_SUPER_ADMIN: "/org/dashboard",
#         Role.CUSTOMER: "/customer/dashboard",
#         Role.BR_ADMIN: "/admin/dashboard",
#         Role.ENGINEER: "/engineer/dashboard",
#     }.get(role, "/login")


# @api_view(["POST"])
# def logout_view(request):
#     if request.user.is_authenticated:
#         # Invalidate the 3TP token -> user mapping created in login_view,
#         # otherwise the token keeps working until the cache entry expires.
#         raw_token = getattr(request, "auth", None)
#         if isinstance(raw_token, str) and raw_token:
#             import hashlib
#             cache.delete(
#                 "3tp_auth:" + hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
#             )
#         Token.objects.filter(user=request.user).delete()
#         django_logout(request)
#     return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


# @api_view(["GET"])
# def me_view(request):
#     return Response(UserSerializer(request.user).data)

# def scoped_queryset(model, user, level_map):
#     level, scope_id = user.get_scope()
#     if level == "ORGANIZATION":
#         return model.objects.filter(
#             **{f"{level_map['ORGANIZATION']}": user.organization_id}
#         )
#     if level in level_map and scope_id:
#         return model.objects.filter(**{level_map[level]: scope_id})
#     return model.objects.none()

# class OrganizationListView(generics.ListAPIView):
#     serializer_class = OrganizationSerializer

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == Role.ORG_SUPER_ADMIN:
#             return Organization.objects.filter(pk=user.organization_id)
#         return Organization.objects.none()


# class CustomerListView(CustomerScopeMixin, generics.ListCreateAPIView):
#     serializer_class = CustomerSerializer
#     permission_classes = [IsOrgSuperAdmin]
#     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
#     search_fields = [
#         "company", "code", "company_email",
#         "contact_person", "contact_person_email", "phone",
#     ]
#     ordering_fields = ["company", "code", "created_at"]
#     ordering = ["company"]

#     def get_queryset(self):
#         qs = super().get_queryset()

#         is_active = self.request.query_params.get("is_active")
#         if is_active is not None:
#             qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

#         return qs

#     def perform_create(self, serializer):
#         password = serializer.validated_data.get("password", "")
#         serializer.save(organization=self.request.user.organization)
#         customer = serializer.instance
#         try:
#             sync_customer(customer)
#             # CustomerSerializer creates the customer login when a password is supplied.
#             # User synchronization is handled centrally by signals.
#         except ThreeTPError as exc:
#             Customer.objects.filter(pk=customer.pk).update(
#                 tpt_sync_status="FAILED",
#                 tpt_sync_error=str(exc),
#             )


# class CustomerDetailView(CustomerScopeMixin, generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = CustomerSerializer
#     permission_classes = [IsOrgSuperAdmin]
#     lookup_field = "pk"

#     def perform_destroy(self, instance):
#         instance.delete()

# ADMIN_ROLES = [
#     Role.ORG_SUPER_ADMIN,
#     Role.CUSTOMER,
#     Role.BR_ADMIN,
#     Role.ENGINEER,
# ]

# from .permissions import (
#     CustomerScopeMixin,
#     IsOrgSuperAdmin,
#     IsOrgAdminOrCustomerAdmin,
# )

# class AdminListView(generics.ListCreateAPIView):
#     serializer_class = AdminSerializer
#     permission_classes = [IsOrgAdminOrCustomerAdmin]
#     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
#     search_fields = ["name", "email", "phone", "role"]
#     ordering_fields = ["name", "email", "date_joined"]
#     ordering = ["name"]

#     def get_queryset(self):
#         user = self.request.user
#         base = User.objects.select_related(
#             "organization", "customer", "zone", "circle", "state", "district", "branch", "site"
#         )

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = base.filter(organization_id=user.organization_id)
#         elif user.role == Role.CUSTOMER:
#             qs = base.filter(customer_id=user.customer_id)
#         elif user.role == Role.BR_ADMIN:
#             # Admins are scoped to the customer's top-level State/Zone.
#             hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
#             if hierarchy == "GEOGRAPHICAL" and user.state_id:
#                 qs = base.filter(customer_id=user.customer_id, state_id=user.state_id)
#             elif hierarchy == "ZONAL" and user.zone_id:
#                 qs = base.filter(customer_id=user.customer_id, zone_id=user.zone_id)
#             elif user.branch_id:
#                 qs = base.filter(branch_id=user.branch_id)
#             else:
#                 return base.none()
#         else:
#             return base.none()

#         qs = qs.filter(role__in=ADMIN_ROLES)

#         is_active = self.request.query_params.get("is_active")
#         if is_active is not None:
#             qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

#         return qs

#     # def perform_create(self, serializer):
#     #     user = self.request.user

#     #     if user.role == Role.CUSTOMER:
#     #         serializer.save(
#     #             organization=user.organization,
#     #             customer=user.customer,
#     #         )
#     #     else:
#     #         serializer.save(organization=user.organization)

#     def perform_create(self, serializer):
#         """
#         Customer is the parent account. A Branch Admin is assigned to the
#         customer's top-level hierarchy node:

#           Geographical customer -> State
#           Zonal customer       -> Zone

#         The client cannot choose a different customer for a logged-in
#         customer account.
#         """
#         user = self.request.user
#         role = serializer.validated_data.get("role")
#         extra = {"organization": user.organization}

#         if user.role == Role.CUSTOMER:
#             extra["customer"] = user.customer

#         customer = extra.get("customer") or serializer.validated_data.get("customer")

#         if role == Role.BR_ADMIN:
#             if not customer:
#                 raise DRFValidationError({"customer": "Customer is required for a Branch Admin."})

#             hierarchy = customer.hierarchy_type
#             if hierarchy == "GEOGRAPHICAL":
#                 state = serializer.validated_data.get("state")
#                 if not state or state.customer_id != customer.pk:
#                     raise DRFValidationError({"state": "Select a state belonging to this customer."})
#                 extra.update(
#                     customer=customer,
#                     state=state,
#                     zone=None,
#                     circle=None,
#                     region=None,
#                     division=None,
#                     district=None,
#                     taluka=None,
#                     city=None,
#                     branch=None,
#                     site=None,
#                 )
#             elif hierarchy == "ZONAL":
#                 zone = serializer.validated_data.get("zone")
#                 if not zone or zone.customer_id != customer.pk:
#                     raise DRFValidationError({"zone": "Select a zone belonging to this customer."})
#                 extra.update(
#                     customer=customer,
#                     zone=zone,
#                     state=None,
#                     circle=None,
#                     region=None,
#                     division=None,
#                     district=None,
#                     taluka=None,
#                     city=None,
#                     branch=None,
#                     site=None,
#                 )
#             else:
#                 raise DRFValidationError({"customer": "Customer hierarchy is not configured."})

#         elif role == Role.ENGINEER:
#             # Keep the existing engineer workflow: an engineer may be linked
#             # to a specific site/branch by the client/serializer.
#             if customer:
#                 extra["customer"] = customer
#             elif not customer:
#                 raise DRFValidationError({"customer": "Customer is required for an engineer."})

#         serializer.save(**extra)
#         created_user = serializer.instance
#         # User -> 3TP synchronization is handled by the post_save signal.

# class AdminDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = AdminSerializer
#     permission_classes = [IsOrgAdminOrCustomerAdmin]   # ← was IsOrgSuperAdmin
#     lookup_field = "pk"

#     def get_queryset(self):
#         user = self.request.user
#         base = User.objects.all()

#         if user.role == Role.ORG_SUPER_ADMIN:
#             return base.filter(organization_id=user.organization_id)
#         if user.role == Role.CUSTOMER:
#             # A customer manages only their Branch Admins and Engineers —
#             # never their own account or another customer-level user.
#             return base.filter(
#                 customer_id=user.customer_id,
#                 role__in=[Role.BR_ADMIN, Role.ENGINEER],
#             )
#         if user.role == Role.BR_ADMIN:
#             return base.filter(branch_id=user.branch_id)
#         return base.none()

#     def perform_update(self, serializer):
#         if self.request.user.role == Role.CUSTOMER:
#             serializer.save(customer=self.request.user.customer)
#         else:
#             serializer.save()

# class EngListView(generics.ListCreateAPIView):
#     serializer_class = AdminSerializer  # same shape as admins
#     permission_classes = [IsOrgSuperAdmin]
#     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
#     search_fields = ["name", "email", "phone"]
#     ordering_fields = ["name", "email", "date_joined"]
#     ordering = ["name"]

#     def get_queryset(self):
#         user = self.request.user
#         base = User.objects.select_related(
#             "organization", "customer", "zone", "circle", "state", "district", "branch", "site"
#         ).filter(role=Role.ENGINEER)  # engineers only

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = base.filter(organization_id=user.organization_id)
#         elif user.role == Role.CUSTOMER:
#             qs = base.filter(customer_id=user.customer_id)
#         elif user.role == Role.BR_ADMIN:
#             qs = base.filter(branch_id=user.branch_id)
#         else:
#             return base.none()

#         is_active = self.request.query_params.get("is_active")
#         if is_active is not None:
#             qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

#         return qs

#     # def perform_create(self, serializer):
#     #     # Force role to ENGINEER regardless of what the client sends
#     #     serializer.save(
#     #         role=Role.ENGINEER,
#     #         organization=self.request.user.organization,
#     #     )

#     # def perform_create(self, serializer):
#     #     user = self.request.user
#     #     if user.role == Role.CUSTOMER:
#     #         serializer.save(
#     #             role=Role.ENGINEER,
#     #             organization=user.organization,
#     #             customer=user.customer,
#     #         )
#     #     else:
#     #         serializer.save(
#     #             role=Role.ENGINEER,
#     #             organization=user.organization,
#     #         )

#     def perform_create(self, serializer):
#         user = self.request.user
#         if user.customer_id:
#             serializer.save(
#                 organization=user.organization,
#                 customer=user.customer,
#             )
#         else:
#             serializer.save(organization=user.organization)
#         # User -> 3TP synchronization is handled by the post_save signal.

#     def perform_update(self, serializer):
#         user = self.request.user
#         if user.customer_id:
#             serializer.save(customer=user.customer)
#         else:
#             serializer.save()

# class EngDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = AdminSerializer
#     permission_classes = [IsOrgSuperAdmin]
#     lookup_field = "pk"

#     def get_queryset(self):
#         user = self.request.user
#         base = User.objects.filter(role=Role.ENGINEER)

#         if user.role == Role.ORG_SUPER_ADMIN:
#             return base.filter(organization_id=user.organization_id)
#         if user.role == Role.CUSTOMER:
#             return base.filter(customer_id=user.customer_id)
#         if user.role == Role.BR_ADMIN:
#             return base.filter(branch_id=user.branch_id)
#         return base.none()


# class ZoneListView(generics.ListAPIView):
#     serializer_class = ZoneSerializer

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == Role.ORG_SUPER_ADMIN:
#             return Zone.objects.filter(customer__organization_id=user.organization_id)
#         if user.role == Role.CUSTOMER:
#             return Zone.objects.filter(customer_id=user.customer_id)
#         if user.role in [Role.BR_ADMIN, Role.ENGINEER]:
#             return Zone.objects.filter(pk=user.zone_id)
#         return Zone.objects.none()


# class CircleListView(generics.ListAPIView):
#     serializer_class = CircleSerializer

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = Circle.objects.filter(zone__customer__organization_id=user.organization_id)
#         elif user.role == Role.CUSTOMER:
#             qs = Circle.objects.filter(zone__customer_id=user.customer_id)
#         elif user.role in [Role.BR_ADMIN, Role.ENGINEER]:
#             qs = Circle.objects.filter(pk=user.circle_id)
#         else:
#             return Circle.objects.none()

#         zone_id = self.request.query_params.get("zone")
#         if zone_id:
#             qs = qs.filter(zone_id=zone_id)
#         return qs


# class StateListView(generics.ListAPIView):
#     serializer_class = StateSerializer

#     def get_queryset(self):
#         user = self.request.user
#         qs = State.objects.select_related("customer")

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(customer__organization_id=user.organization_id)
#         elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
#             qs = qs.filter(customer_id=user.customer_id)
#         else:
#             return qs.none()

#         customer_id = self.request.query_params.get("customer")
#         if customer_id:
#             qs = qs.filter(customer_id=customer_id)
#         return qs

# class TalukaListView(generics.ListAPIView):
#     serializer_class = TalukaSerializer

#     def get_queryset(self):
#         user = self.request.user
#         qs = Taluka.objects.select_related("district", "district__state")

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(district__state__customer__organization_id=user.organization_id)
#         elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
#             qs = qs.filter(district__state__customer_id=user.customer_id)
#         else:
#             return qs.none()

#         district_id = self.request.query_params.get("district")
#         if district_id:
#             qs = qs.filter(district_id=district_id)
#         return qs.order_by("name")


# class CityListView(generics.ListAPIView):
#     serializer_class = CitySerializer

#     def get_queryset(self):
#         user = self.request.user
#         qs = City.objects.select_related("taluka", "taluka__district", "taluka__district__state")

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(taluka__district__state__customer__organization_id=user.organization_id)
#         elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
#             qs = qs.filter(taluka__district__state__customer_id=user.customer_id)
#         else:
#             return qs.none()

#         taluka_id = self.request.query_params.get("taluka")
#         if taluka_id:
#             qs = qs.filter(taluka_id=taluka_id)
#         return qs.order_by("name")


# class RegionListView(generics.ListAPIView):
#     serializer_class = RegionSerializer

#     def get_queryset(self):
#         user = self.request.user
#         qs = Region.objects.select_related("circle", "circle__zone")

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(circle__zone__customer__organization_id=user.organization_id)
#         elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
#             qs = qs.filter(circle__zone__customer_id=user.customer_id)
#         else:
#             return qs.none()

#         circle_id = self.request.query_params.get("circle")
#         if circle_id:
#             qs = qs.filter(circle_id=circle_id)
#         return qs.order_by("name")


# class DivisionListView(generics.ListAPIView):
#     serializer_class = DivisionSerializer

#     def get_queryset(self):
#         user = self.request.user
#         qs = Division.objects.select_related("region", "region__circle", "region__circle__zone")

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(region__circle__zone__customer__organization_id=user.organization_id)
#         elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
#             qs = qs.filter(region__circle__zone__customer_id=user.customer_id)
#         else:
#             return qs.none()

#         region_id = self.request.query_params.get("region")
#         if region_id:
#             qs = qs.filter(region_id=region_id)
#         return qs.order_by("name")

# class DistrictListView(generics.ListAPIView):
#     serializer_class = DistrictSerializer

#     def get_queryset(self):
#         user = self.request.user
#         qs = District.objects.select_related("state", "state__customer")

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(state__customer__organization_id=user.organization_id)
#         elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
#             qs = qs.filter(state__customer_id=user.customer_id)
#         else:
#             return qs.none()

#         state_id = self.request.query_params.get("state")
#         if state_id:
#             qs = qs.filter(state_id=state_id)
#         return qs


# class BranchListView(generics.ListAPIView):
#     serializer_class = BranchSerializer

#     def get_queryset(self):
#         user = self.request.user

#         qs = Branch.objects.select_related(
#             "customer",
#             # Geographical chain
#             "city", "city__taluka", "city__taluka__district",
#             "city__taluka__district__state",
#             # Zonal chain
#             "division", "division__region",
#             "division__region__circle", "division__region__circle__zone",
#         )

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(customer__organization_id=user.organization_id)
#         elif user.role == Role.CUSTOMER:
#             qs = qs.filter(customer_id=user.customer_id)
#         elif user.role == Role.BR_ADMIN:
#             hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
#             if hierarchy == "GEOGRAPHICAL" and user.state_id:
#                 qs = qs.filter(
#                     customer_id=user.customer_id,
#                     city__taluka__district__state_id=user.state_id,
#                 )
#             elif hierarchy == "ZONAL" and user.zone_id:
#                 qs = qs.filter(
#                     customer_id=user.customer_id,
#                     division__region__circle__zone_id=user.zone_id,
#                 )
#             elif user.branch_id:
#                 qs = qs.filter(pk=user.branch_id)
#             else:
#                 return Branch.objects.none()
#         elif user.role == Role.ENGINEER:
#             qs = qs.filter(pk=user.branch_id)
#         else:
#             return Branch.objects.none()

#         customer_id = self.request.query_params.get("customer")
#         if customer_id:
#             qs = qs.filter(customer_id=customer_id)

#         return qs.order_by("name")

# class SiteListView(generics.ListCreateAPIView):
#     """
#     Canonical Site API.

#     Ownership is derived from:
#         Site -> Branch -> Customer

#     A user/admin may be attached to a Site through User.site.
#     Therefore an AC only needs site_id; customer/admin information is
#     resolved automatically from this endpoint.
#     """
#     serializer_class = SiteSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         qs = Site.objects.select_related(
#             "branch",
#             "branch__customer",
#             "floor",
#         ).prefetch_related("users")

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(
#                 branch__customer__organization_id=user.organization_id
#             )
#         elif user.role == Role.CUSTOMER:
#             qs = qs.filter(
#                 branch__customer_id=user.customer_id
#             )
#         elif user.role == Role.BR_ADMIN:
#             hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
#             if hierarchy == "GEOGRAPHICAL" and user.state_id:
#                 qs = qs.filter(
#                     branch__customer_id=user.customer_id,
#                     branch__city__taluka__district__state_id=user.state_id,
#                 )
#             elif hierarchy == "ZONAL" and user.zone_id:
#                 qs = qs.filter(
#                     branch__customer_id=user.customer_id,
#                     branch__division__region__circle__zone_id=user.zone_id,
#                 )
#             elif user.branch_id:
#                 qs = qs.filter(branch_id=user.branch_id)
#             else:
#                 return Site.objects.none()
#         elif user.role == Role.ENGINEER:
#             qs = qs.filter(
#                 pk=user.site_id
#             )
#         else:
#             return Site.objects.none()

#         params = self.request.query_params

#         customer_id = params.get("customer")
#         branch_id = params.get("branch")
#         is_active = params.get("is_active")

#         if customer_id:
#             try:
#                 qs = qs.filter(branch__customer_id=int(customer_id))
#             except (ValueError, TypeError):
#                 return Site.objects.none()

#         if branch_id:
#             qs = qs.filter(branch_id=branch_id)

#         if is_active is not None:
#             qs = qs.filter(
#                 is_active=str(is_active).lower() in ("1", "true", "yes")
#             )

#         return qs.order_by("name")

#     def perform_create(self, serializer):
#         user = self.request.user
#         branch = serializer.validated_data["branch"]

#         if user.role == Role.CUSTOMER and branch.customer_id != user.customer_id:
#             raise DRFValidationError({
#                 "branch": "You can only create a site under your customer."
#             })

#         if user.role == Role.BR_ADMIN and branch.id != user.branch_id:
#             raise DRFValidationError({
#                 "branch": "You can only create a site under your branch."
#             })

#         if user.role == Role.ENGINEER:
#             raise DRFValidationError(
#                 "Engineers cannot create sites."
#             )

#         if user.role == Role.ORG_SUPER_ADMIN:
#             if branch.customer.organization_id != user.organization_id:
#                 raise DRFValidationError({
#                     "branch": "This branch is outside your organization."
#                 })

#         serializer.save()
#         site = serializer.instance
#         try:
#             # Ensure the customer exists in 3TP before creating the Site asset.
#             customer = branch.customer
#             if not customer.tpt_customer_id:
#                 sync_customer(customer)
#             sync_site(site)
#         except ThreeTPError as exc:
#             Site.objects.filter(pk=site.pk).update(
#                 tpt_sync_status="FAILED",
#                 tpt_sync_error=str(exc),
#             )


# @api_view(["GET"])
# @permission_classes([permissions.IsAuthenticated])
# def site_assignment(request, pk):
#     """
#     Return the ownership inherited by a Site.

#     This is the endpoint used by Add AC:
#         selected site -> customer + site admins + engineers
#     """
#     try:
#         site = (
#             Site.objects
#             .select_related(
#                 "branch",
#                 "branch__customer",
#                 "branch__customer__organization",
#                 "floor",
#             )
#             .prefetch_related("users")
#             .get(pk=pk)
#         )
#     except Site.DoesNotExist:
#         return Response(
#             {"status": "error", "message": "Site not found."},
#             status=status.HTTP_404_NOT_FOUND,
#         )

#     user = request.user

#     allowed = False
#     if user.role == Role.ORG_SUPER_ADMIN:
#         allowed = site.branch.customer.organization_id == user.organization_id
#     elif user.role == Role.CUSTOMER:
#         allowed = site.branch.customer_id == user.customer_id
#     elif user.role == Role.BR_ADMIN:
#         hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
#         if hierarchy == "GEOGRAPHICAL" and user.state_id:
#             allowed = (
#                 site.branch.customer_id == user.customer_id
#                 and site.branch.city
#                 and site.branch.city.taluka
#                 and site.branch.city.taluka.district
#                 and site.branch.city.taluka.district.state_id == user.state_id
#             )
#         elif hierarchy == "ZONAL" and user.zone_id:
#             allowed = (
#                 site.branch.customer_id == user.customer_id
#                 and site.branch.division
#                 and site.branch.division.region
#                 and site.branch.division.region.circle
#                 and site.branch.division.region.circle.zone_id == user.zone_id
#             )
#         else:
#             allowed = site.branch_id == user.branch_id
#     elif user.role == Role.ENGINEER:
#         allowed = site.id == user.site_id

#     if not allowed:
#         return Response(
#             {"status": "error", "message": "You do not have access to this site."},
#             status=status.HTTP_403_FORBIDDEN,
#         )

#     data = SiteSerializer(site, context={"request": request}).data

#     return Response(
#         {
#             "status": "success",
#             "data": data,
#         },
#         status=status.HTTP_200_OK,
#     )


# class UserListView(generics.ListCreateAPIView):
#     serializer_class = UserSerializer

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == Role.ORG_SUPER_ADMIN:
#             return User.objects.filter(organization_id=user.organization_id)
#         if user.role == Role.CUSTOMER:
#             return User.objects.filter(customer_id=user.customer_id)
#         if user.role == Role.BR_ADMIN:
#             return User.objects.filter(branch_id=user.branch_id)
#         return User.objects.none()

# @api_view(["GET"])
# def dashboard_summary_view(request):
#     user = request.user
#     data = {"role": user.role, "scope_name": user.scope_name}

#     if user.role == Role.ORG_SUPER_ADMIN:
#         data.update({
#             "customers": Customer.objects.filter(
#                 organization_id=user.organization_id
#             ).count(),
#             "zones": Zone.objects.filter(
#                 customer__organization_id=user.organization_id
#             ).count(),
#             "circles": Circle.objects.filter(
#                 zone__customer__organization_id=user.organization_id
#             ).count(),
#             "branches": Branch.objects.filter(
#                 customer__organization_id=user.organization_id
#             ).count(),
#             "sites": Site.objects.filter(
#                 branch__customer__organization_id=user.organization_id
#             ).count(),
#             "engineers": User.objects.filter(
#                 role=Role.ENGINEER, organization_id=user.organization_id
#             ).count(),
#         })

#     elif user.role == Role.CUSTOMER:
#         data.update({
#             "zones": Zone.objects.filter(customer_id=user.customer_id).count(),
#             "circles": Circle.objects.filter(
#                 zone__customer_id=user.customer_id
#             ).count(),
#             "branches": Branch.objects.filter(
#                 customer_id=user.customer_id
#             ).count(),
#             "sites": Site.objects.filter(
#                 branch__customer_id=user.customer_id
#             ).count(),
#             "engineers": User.objects.filter(
#                 role=Role.ENGINEER, customer_id=user.customer_id
#             ).count(),
#         })

#     elif user.role == Role.BR_ADMIN:
#         data.update({
#             "sites": Site.objects.filter(branch_id=user.branch_id).count(),
#             "engineers": User.objects.filter(
#                 role=Role.ENGINEER, branch_id=user.branch_id
#             ).count(),
#         })

#     elif user.role == Role.ENGINEER:
#         data.update({
#             "my_sites": Site.objects.filter(pk=user.site_id).count(),
#         })

#     return Response(data)



# @api_view(["GET"])
# def LocationListView(request):
#     return Response("Location Page")


# def serialize_circle(circle):
#     return {
#         "id": circle.id,
#         "circle_id": circle.circle_code,
#         "circle_code": circle.circle_code,
#         "circle_name": circle.circle_name,
#         "state_id": circle.state_id,
#     }


# def serialize_state(state):
#     return {
#         "id": state.id,
#         "state_id": state.state_code,
#         "state_code": state.state_code,
#         "state_name": state.state_name,
#         "zone_id": state.zone_id,
#         "circles": [serialize_circle(circle) for circle in state.circles.all()],
#     }


# def serialize_zone(zone):
#     return {
#         "id": zone.id,
#         "zone_id": zone.zone_code,
#         "zone_code": zone.zone_code,
#         "zone_name": zone.zone_name,
#         "states": [serialize_state(state) for state in zone.states.all()],
#     }


# @api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
# def location_detail(request, location_type, location_id):
#     # Authenticated through the global ThreeTPAuthentication + IsAuthenticated
#     # defaults. Previously this was a plain @csrf_exempt Django view, so anyone
#     # could PUT/DELETE zones, states and circles without logging in.
#     if request.method in ("PUT", "PATCH", "DELETE") and request.user.role not in (
#         Role.ORG_SUPER_ADMIN,
#         Role.CUSTOMER,
#     ):
#         # Same roles that are allowed to create locations in locations().
#         return JsonResponse(
#             {"success": False, "message": "You are not allowed to modify locations."},
#             status=403,
#         )

#     if request.method == "DELETE":
#         try:
#             if location_type == "zone":
#                 obj = LocationZone.objects.get(id=location_id)
#             elif location_type == "state":
#                 obj = LocationState.objects.get(id=location_id)
#             elif location_type == "circle":
#                 obj = LocationCircle.objects.get(id=location_id)
#             else:
#                 return JsonResponse(
#                     {"success": False, "message": "Invalid location type"},
#                     status=400,
#                 )

#             obj.delete()

#             return JsonResponse(
#                 {
#                     "success": True,
#                     "message": f"{location_type.title()} deleted successfully",
#                 },
#                 status=200,
#             )

#         except (
#             LocationZone.DoesNotExist,
#             LocationState.DoesNotExist,
#             LocationCircle.DoesNotExist,
#         ):
#             return JsonResponse(
#                 {"success": False, "message": "Location not found"},
#                 status=404,
#             )

#     if request.method == "PUT":
#         try:
#             body = json.loads(request.body.decode("utf-8"))

#             if location_type == "zone":
#                 obj = LocationZone.objects.get(id=location_id)
#                 obj.zone_name = body.get("zone_name", obj.zone_name)
#                 obj.zone_code = body.get("zone_code", obj.zone_code)

#             elif location_type == "state":
#                 obj = LocationState.objects.get(id=location_id)
#                 obj.state_name = body.get("state_name", obj.state_name)
#                 obj.state_code = body.get("state_code", obj.state_code)

#             elif location_type == "circle":
#                 obj = LocationCircle.objects.get(id=location_id)
#                 obj.circle_name = body.get("circle_name", obj.circle_name)
#                 obj.circle_code = body.get("circle_code", obj.circle_code)

#             else:
#                 return JsonResponse(
#                     {"success": False, "message": "Invalid location type"},
#                     status=400,
#                 )

#             obj.save()

#             return JsonResponse(
#                 {
#                     "success": True,
#                     "message": f"{location_type.title()} updated successfully",
#                 },
#                 status=200,
#             )

#         except (
#             LocationZone.DoesNotExist,
#             LocationState.DoesNotExist,
#             LocationCircle.DoesNotExist,
#         ):
#             return JsonResponse(
#                 {"success": False, "message": "Location not found"},
#                 status=404,
#             )

#         except json.JSONDecodeError:
#             return JsonResponse(
#                 {"success": False, "message": "Invalid JSON"},
#                 status=400,
#             )

#     return JsonResponse(
#         {"success": False, "message": "Method not allowed"},
#         status=405,
#     )

# @api_view(["GET"])
# def device(request):
#     return Response("ACCreation page")

# class FloorListView(generics.ListAPIView):
#     serializer_class = FloorSerializer

#     def get_queryset(self):
#         user = self.request.user

#         qs = Floor.objects.select_related(
#             "branch",
#             "branch__customer",
#         )

#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = qs.filter(
#                 branch__customer__organization_id=user.organization_id
#             )

#         elif user.role == Role.CUSTOMER:
#             qs = qs.filter(
#                 branch__customer_id=user.customer_id
#             )

#         elif user.role == Role.BR_ADMIN:
#             qs = qs.filter(
#                 branch_id=user.branch_id
#             )

#         elif user.role == Role.ENGINEER:
#             qs = qs.filter(
#                 branch_id=user.branch_id
#             )

#         else:
#             return qs.none()

#         customer_id = self.request.query_params.get(
#             "customer"
#         )

#         if customer_id:
#             qs = qs.filter(
#                 branch__customer_id=customer_id
#             )

#         branch_id = self.request.query_params.get(
#             "branch"
#         )

#         if branch_id:
#             qs = qs.filter(
#                 branch_id=branch_id
#             )

#         is_active = self.request.query_params.get(
#             "is_active"
#         )

#         if is_active is not None:
#             qs = qs.filter(
#                 is_active=is_active.lower()
#                 in ("1", "true", "yes")
#             )

#         return qs.order_by("name")

# def _serialize_user_short(u):
#     return {
#         "id":    str(u.id),
#         "name":  getattr(u, "name", "") or getattr(u, "email", ""),
#         "email": getattr(u, "email", ""),
#         "phone": getattr(u, "phone", "") or "",
#         "role":  getattr(u, "role", ""),
#     }


# @api_view(["GET"])
# def branch_assignments(request):
#     """
#     Customer / admins / engineers that a site (branch) is assigned to.

#     GET /branches/assignments/?branch_id=<tree branch id>[&hierarchy_type=GEOGRAPHICAL|ZONAL]
#     The ownership stored on the location-tree branch is the source of truth.
#     """
#     branch_id = (request.GET.get("branch_id") or "").strip()
#     hierarchy = (request.GET.get("hierarchy_type") or "").strip().upper()

#     if not branch_id:
#         return JsonResponse({"status": "error", "message": "branch_id is required"}, status=400)

#     idx = ownership.build_branch_index()
#     candidates = [
#         (h, n) for (h, bid), n in idx.items()
#         if bid == branch_id and (not hierarchy or h == hierarchy)
#     ]
#     if not candidates:
#         return JsonResponse({
#             "status": "success",
#             "message": "Site not found in the location tree.",
#             "data": {"customer": None, "admins": [], "engineers": [], "assigned": False},
#         })

#     h, node = candidates[0]
#     if not ownership.can_see_branch(request.user, node):
#         return JsonResponse({"status": "error", "message": "You do not have access to this site."}, status=403)

#     info = ownership.OwnerLookup.for_nodes([node]).describe(node)
#     return JsonResponse({
#         "status": "success",
#         "data": {
#             "branch": {"id": node.get("branch_id"), "name": node.get("branch_name", ""), "hierarchy_type": h},
#             "customer": info["customer"],
#             "admins": info["admins"],
#             "engineers": info["engineers"],
#             "assigned": bool(info["customer"]),
#         },
#     })


# @api_view(["POST"])
# def branch_ownership(request):
#     """
#     Assign a site (tree branch) to a customer + its admins / engineers.

#     POST /branches/ownership/
#       { "hierarchy_type": "GEOGRAPHICAL"|"ZONAL", "branch_id": "AP-B01",
#         "customer_id": 1, "admin_ids": ["<uuid>"], "engineer_ids": ["<uuid>"] }

#     Super Admin: any customer in the org.  Customer: only their own customer.
#     Every AC placed in this site (now or later) follows these owners.
#     """
#     body = request.data
#     hierarchy = str(body.get("hierarchy_type", "")).strip().upper()
#     branch_id = str(body.get("branch_id", "")).strip()
#     if hierarchy not in ("GEOGRAPHICAL", "ZONAL") or not branch_id:
#         return JsonResponse(
#             {"status": "error", "message": "hierarchy_type and branch_id are required"}, status=400)

#     location_file = ownership.tree_file(hierarchy)
#     tree = load_location_tree(location_file)
#     node = next((n for n, _ in iter_branches(tree, hierarchy) if n.get("branch_id") == branch_id), None)
#     if node is None:
#         return JsonResponse({"status": "error", "message": "Site not found."}, status=404)

#     try:
#         customer, admin_ids, engineer_ids = ownership.validate_ownership(
#             request.user, hierarchy, node,
#             body.get("customer_id"), body.get("admin_ids"), body.get("engineer_ids"),
#         )
#     except ownership.OwnershipError as exc:
#         return JsonResponse({"status": "error", "message": str(exc)}, status=exc.status)

#     ownership.set_node_owner(node, customer.pk, admin_ids, engineer_ids)
#     save_location_tree(tree, location_file)

#     info = ownership.OwnerLookup.for_nodes([node]).describe(node)
#     return JsonResponse({"status": "success", "data": {"branch_id": branch_id, **info}})


# @api_view(["GET"])
# def unassigned_devices(request):
#     """AC devices created by 3TP that have not been placed in a site yet."""
#     if request.user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER, Role.BR_ADMIN):
#         return JsonResponse({"status": "success", "count": 0, "data": []})
#     from . import telemetry
#     try:
#         known = telemetry._devices()
#     except Exception:
#         known = []
#     assigned = set(build_device_location_map().keys())
#     data = [
#         {"ac_id": d.get("ac_id"), "device_name": d.get("device_name") or d.get("ac_id")}
#         for d in known if d.get("ac_id") and d.get("ac_id") not in assigned
#     ]
#     return JsonResponse({"status": "success", "count": len(data), "data": data})


# @api_view(["GET"])
# def treands(request):
#     return Response("Treands page")


# @api_view(["GET", "POST"])
# def locations(request):
#     """
#     GET  -> the location tree, limited to the sites the logged-in user may see.
#     POST -> create locations; a new/updated branch is stamped with its owners:
#               CUSTOMER   -> their own customer
#               SUPER ADMIN-> body.customer_id / admin_ids / engineer_ids (optional)
#     """
#     user = request.user

#     if request.method == "POST":
#         if user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER):
#             return JsonResponse(
#                 {"success": False, "message": "You are not allowed to create locations."}, status=403)

#         try:
#             body = json.loads(request.body or "{}")
#         except json.JSONDecodeError:
#             return JsonResponse({"success": False, "message": "Invalid JSON body"}, status=400)
#         hierarchy = str(body.get("hierarchy_type", "")).strip().upper()

#         if user.role == Role.CUSTOMER:
#             if not user.customer_id:
#                 return JsonResponse({"success": False, "message": "Your account has no customer."}, status=403)
#             ctype = getattr(user.customer, "hierarchy_type", None)
#             if ctype and hierarchy and ctype != hierarchy:
#                 return JsonResponse(
#                     {"success": False,
#                      "message": f"Your account uses the {ctype.title()} hierarchy."}, status=403)
#             if hierarchy in ("GEOGRAPHICAL", "ZONAL"):
#                 existing = ownership.find_branch_by_path(
#                     load_location_tree(ownership.tree_file(hierarchy)), hierarchy, body)
#                 if existing is not None and not ownership.can_see_branch(user, existing) \
#                         and existing.get("customer_id") not in (None, user.customer_id):
#                     return JsonResponse(
#                         {"success": False, "message": "This site belongs to another customer."}, status=403)

#     response = _locations_impl(request)

#     if request.method == "POST" and response.status_code == 201:
#         try:
#             _stamp_new_branch(user, body, response)
#         except Exception:
#             pass        # never fail a created location because of owner stamping
#     return response


# def _stamp_new_branch(user, body, response):
#     hierarchy = str(body.get("hierarchy_type", "")).strip().upper()
#     branch_id = (json.loads(response.content).get("data") or {}).get("branch_id")
#     if not branch_id:
#         return

#     location_file = ownership.tree_file(hierarchy)
#     tree = load_location_tree(location_file)
#     node = next((n for n, _ in iter_branches(tree, hierarchy) if n.get("branch_id") == branch_id), None)
#     if node is None:
#         return

#     if user.role == Role.CUSTOMER:
#         if node.get("customer_id") in (None, user.customer_id):
#             ownership.set_node_owner(
#                 node, user.customer_id,
#                 ownership.node_owner(node)["admin_ids"], ownership.node_owner(node)["engineer_ids"])
#     elif body.get("customer_id"):
#         try:
#             customer, admin_ids, engineer_ids = ownership.validate_ownership(
#                 user, hierarchy, node, body.get("customer_id"),
#                 body.get("admin_ids"), body.get("engineer_ids"))
#         except ownership.OwnershipError:
#             return
#         ownership.set_node_owner(node, customer.pk, admin_ids, engineer_ids)
#     else:
#         return
#     save_location_tree(tree, location_file)


# # ============================================================
# # SAVED DASHBOARD PREFERENCES
# # ============================================================

# @api_view(["GET", "POST"])
# @permission_classes([permissions.IsAuthenticated])
# def dashboard_preferences(request):
#     """
#     GET  -> return dashboards belonging to the logged-in user.
#     POST -> create a saved dashboard for the logged-in user.

#     Only dashboard state is stored. Live AC/3TP telemetry continues to use
#     the existing APIs and polling flow.
#     """
#     user = request.user

#     if request.method == "GET":
#         queryset = DashboardPreference.objects.filter(user=user)
#         return Response(
#             DashboardPreferenceSerializer(queryset, many=True).data,
#             status=status.HTTP_200_OK,
#         )

#     serializer = DashboardPreferenceSerializer(data=request.data)
#     serializer.is_valid(raise_exception=True)

#     name = serializer.validated_data.get("name") or "My Dashboard"

#     # Customer users are automatically tied to their customer.
#     # Organisation admins may save an organisation-level dashboard.
#     customer = user.customer if user.customer_id else None

#     if serializer.validated_data.get("is_default"):
#         DashboardPreference.objects.filter(
#             user=user, is_default=True
#         ).update(is_default=False)

#     dashboard = DashboardPreference.objects.create(
#         user=user,
#         customer=customer,
#         name=name,
#         main_filters=serializer.validated_data.get("main_filters", {}),
#         card_filters=serializer.validated_data.get("card_filters", {}),
#         visible_widgets=serializer.validated_data.get("visible_widgets", {}),
#         is_default=serializer.validated_data.get("is_default", False),
#     )

#     return Response(
#         DashboardPreferenceSerializer(dashboard).data,
#         status=status.HTTP_201_CREATED,
#     )


# @api_view(["GET", "PUT", "PATCH", "DELETE"])
# @permission_classes([permissions.IsAuthenticated])
# def dashboard_preference_detail(request, pk):
#     """Read/update/delete one saved dashboard owned by the current user."""
#     try:
#         dashboard = DashboardPreference.objects.get(
#             pk=pk, user=request.user
#         )
#     except DashboardPreference.DoesNotExist:
#         return Response(
#             {"detail": "Dashboard not found."},
#             status=status.HTTP_404_NOT_FOUND,
#         )

#     if request.method == "GET":
#         return Response(
#             DashboardPreferenceSerializer(dashboard).data,
#             status=status.HTTP_200_OK,
#         )

#     if request.method == "DELETE":
#         dashboard.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

#     serializer = DashboardPreferenceSerializer(
#         dashboard, data=request.data, partial=True
#     )
#     serializer.is_valid(raise_exception=True)

#     if serializer.validated_data.get("is_default") is True:
#         DashboardPreference.objects.filter(
#             user=request.user
#         ).exclude(pk=dashboard.pk).update(is_default=False)

#     # Do not allow customer ownership to be changed by the frontend.
#     serializer.save(customer=request.user.customer if request.user.customer_id else None)

#     return Response(
#         DashboardPreferenceSerializer(dashboard).data,
#         status=status.HTTP_200_OK,
#     )




# =====================================================================
# account/views.py
# =====================================================================

# ---------------------------------------------------------------------
# STANDARD LIBRARY IMPORTS
# ---------------------------------------------------------------------
import json
import os
import time
import threading
import traceback
import hashlib
import re
import ast
from collections import defaultdict
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs

try:
    import zoneinfo
except ImportError:                       # pragma: no cover
    from backports import zoneinfo

import jwt
import requests

# ---------------------------------------------------------------------
# DJANGO IMPORTS
# ---------------------------------------------------------------------
from django.conf import settings
from django.contrib.auth import (
    authenticate,
    login as django_login,
    logout as django_logout,
)
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

# ---------------------------------------------------------------------
# DRF IMPORTS
# ---------------------------------------------------------------------
from rest_framework import status, generics, permissions, filters
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.permissions import (
    AllowAny,
    BasePermission,
    SAFE_METHODS,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework import serializers

# ---------------------------------------------------------------------
# LOCAL APP IMPORTS
# ---------------------------------------------------------------------
from .models import (
    HierarchyType,
    LocationCircle,
    LocationState,
    LocationZone,
    User,
    Organization,
    Customer,
    Zone,
    Circle,
    Region,
    Division,
    State,
    District,
    Taluka,
    City,
    Branch,
    Floor,
    Site,
    ACDevice,
    LoginAudit,
    Role,
    DashboardPreference,
)

from .serializers import (
    AdminSerializer,
    CitySerializer,
    DivisionSerializer,
    FloorSerializer,
    LoginSerializer,
    RegionSerializer,
    TalukaSerializer,
    UserSerializer,
    OrganizationSerializer,
    CustomerSerializer,
    DashboardPreferenceSerializer,
    ZoneSerializer,
    CircleSerializer,
    StateSerializer,
    DistrictSerializer,
    BranchSerializer,
    SiteSerializer,
)

from .permissions import (
    CustomerScopeMixin,
    IsOrgSuperAdmin,
    IsOrgAdminOrCustomerAdmin,
)

# These two modules are separate from the 3TP services folder and are
# still required by the scoping / telemetry code below.
from . import ownership
from . import telemetry


# =====================================================================
# PERMISSION CLASS
# =====================================================================
class ReadOnlyOrAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


# =====================================================================
# CONFIGURATION CONSTANTS
# =====================================================================
BASE_DATA_DIR = os.path.join(settings.BASE_DIR, "data")

DATA_FILE                  = os.path.join(BASE_DATA_DIR, "ac_data.json")
GEOGRAPHICAL_LOCATION_FILE = os.path.join(BASE_DATA_DIR, "locationData_geographical.json")
ZONAL_LOCATION_FILE        = os.path.join(BASE_DATA_DIR, "locationData_zonal.json")
DEVICE_LOCATION_MAP_FILE   = os.path.join(BASE_DATA_DIR, "DeviceLocationMap.json")

CLOUD_URL = (getattr(settings, "TPT_BASE_URL", "") or "https://3tp.tapasyatech.in").rstrip("/")


# =====================================================================
# 3TP INTEGRATION
# ---------------------------------------------------------------------
# Self-contained. Uses settings already defined in settings.py:
#   TPT_BASE_URL, TPT_USERNAME, TPT_PASSWORD, TPT_TIMEOUT,
#   TPT_SYNC_ENABLED, TPT_ADMIN_AUTHORITY, TPT_OPERATOR_AUTHORITY,
#   TPT_SITE_ASSET_TYPE, TPT_DEVICE_TYPE
# =====================================================================
TPT_ENDPOINTS = {
    "login":    "/api/auth/login",
    "customer": "/api/customer",
    "site":     "/api/asset",
    "device":   "/api/device",
}


class ThreeTPError(Exception):
    """Raised whenever a 3TP call fails or returns a non-2xx response."""
    def __init__(self, message, status=None, payload=None):
        super().__init__(message)
        self.status  = status
        self.payload = payload


_tpt_lock  = threading.Lock()
_tpt_token = {"value": None, "expires_at": 0}


def _tpt_base_url():
    return (getattr(settings, "TPT_BASE_URL", "") or "").rstrip("/")


def _tpt_timeout():
    return float(getattr(settings, "TPT_TIMEOUT", 10))


def _tpt_enabled():
    return bool(getattr(settings, "TPT_SYNC_ENABLED", True))


def _tpt_service_login():
    """Log in to 3TP with the service account and cache the token."""
    with _tpt_lock:
        now = time.time()
        if _tpt_token["value"] and _tpt_token["expires_at"] > now:
            return _tpt_token["value"]

        base_url = _tpt_base_url()
        if not base_url:
            raise ThreeTPError("TPT_BASE_URL is not configured.")

        url = f"{base_url}{TPT_ENDPOINTS['login']}"
        payload = {
            "username":  getattr(settings, "TPT_USERNAME", ""),
            "password":  getattr(settings, "TPT_PASSWORD", ""),
            "authority": getattr(settings, "TPT_ADMIN_AUTHORITY", "TENANT_ADMIN"),
        }

        try:
            response = requests.post(
                url,
                json=payload,
                timeout=_tpt_timeout(),
                headers={
                    "Content-Type": "application/json",
                    "Accept":       "application/json",
                },
            )
        except requests.RequestException as exc:
            raise ThreeTPError(f"3TP network error during login: {exc}")

        try:
            data = response.json()
        except ValueError:
            data = None

        if response.status_code not in (200, 201):
            detail = ""
            if isinstance(data, dict):
                detail = data.get("message") or data.get("detail") or ""
            raise ThreeTPError(
                f"3TP login failed ({response.status_code}) {detail}".strip(),
                status=response.status_code,
                payload=data,
            )

        token = None
        if isinstance(data, dict):
            token = (
                data.get("token")
                or data.get("access_token")
                or data.get("access")
                or (data.get("data") or {}).get("token")
                or (data.get("data") or {}).get("access_token")
            )

        if not token:
            raise ThreeTPError("3TP login response did not include a token.", payload=data)

        _tpt_token["value"]      = token
        _tpt_token["expires_at"] = now + 300
        return token


def _tpt_request(method, endpoint_key, payload=None,
                 extra_headers=None, raise_on_error=True):
    if not _tpt_enabled():
        return None, None

    base_url = _tpt_base_url()
    if not base_url:
        if raise_on_error:
            raise ThreeTPError("TPT_BASE_URL is not configured.")
        return None, None

    token = _tpt_service_login()
    url   = f"{base_url}{TPT_ENDPOINTS.get(endpoint_key, endpoint_key)}"

    headers = {
        "Content-Type":  "application/json",
        "Accept":        "application/json",
        "Authorization": f"Bearer {token}",
    }
    if extra_headers:
        headers.update(extra_headers)

    try:
        response = requests.request(
            method.upper(), url,
            json=payload, headers=headers, timeout=_tpt_timeout(),
        )
    except requests.RequestException as exc:
        if raise_on_error:
            raise ThreeTPError(f"3TP network error ({endpoint_key}): {exc}")
        return None, None

    try:
        data = response.json()
    except ValueError:
        data = None

    if raise_on_error and response.status_code not in (200, 201, 202, 204):
        detail = ""
        if isinstance(data, dict):
            detail = data.get("message") or data.get("detail") or ""
        raise ThreeTPError(
            f"3TP {endpoint_key} failed ({response.status_code}) {detail}".strip(),
            status=response.status_code,
            payload=data,
        )

    return response.status_code, data


# def _tpt_extract_id(data):
#     if not isinstance(data, dict):
#         return ""
#     for key in ("id", "uuid", "pk"):
#         if data.get(key):
#             return str(data[key])
#     inner = data.get("data")
#     if isinstance(inner, dict):
#         for key in ("id", "uuid", "pk"):
#             if inner.get(key):
#                 return str(inner[key])
#     return ""

def _tpt_extract_id(data):
    """Extract a 3TP record id, handling both flat and nested shapes."""
    if not isinstance(data, dict):
        return ""

    # Nested: {"id": {"id": "uuid", "entityType": "CUSTOMER"}}
    for key in ("id", "uuid", "pk"):
        value = data.get(key)
        if isinstance(value, dict):
            inner = value.get("id") or value.get("uuid") or value.get("pk")
            if inner:
                return str(inner)
        elif value:
            return str(value)

    inner = data.get("data")
    if isinstance(inner, dict):
        for key in ("id", "uuid", "pk"):
            value = inner.get(key)
            if isinstance(value, dict):
                inner_id = value.get("id") or value.get("uuid") or value.get("pk")
                if inner_id:
                    return str(inner_id)
            elif value:
                return str(value)

    return ""


def _three_tp_authenticate(email, password):
    """Direct user login against 3TP. Returns True/False, never raises."""
    if not _tpt_enabled():
        return False

    base_url = _tpt_base_url()
    if not base_url:
        return False

    url     = f"{base_url}{TPT_ENDPOINTS['login']}"
    payload = {
        "email":     email,
        "password":  password,
        "authority": getattr(settings, "TPT_ADMIN_AUTHORITY", "TENANT_ADMIN"),
    }

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=_tpt_timeout(),
            headers={
                "Content-Type": "application/json",
                "Accept":       "application/json",
            },
        )
    except requests.RequestException:
        return False

    if response.status_code not in (200, 201):
        return False

    try:
        data = response.json()
    except ValueError:
        return True

    if isinstance(data, dict) and data.get("success") is False:
        return False

    return True


def sync_customer(customer):
    """Push a local Customer to 3TP."""
    if not _tpt_enabled():
        return ""

    payload = {
        "title":          getattr(customer, "company", "") or getattr(customer, "name", ""),
        "name":           getattr(customer, "company", "") or getattr(customer, "name", ""),
        "code":           getattr(customer, "code", "") or "",
        "email": (
            getattr(customer, "company_email", "")
            or getattr(customer, "contact_person_email", "")
            or ""
        ),
        "phone":          getattr(customer, "phone", "") or "",
        "contact_person": getattr(customer, "contact_person", "") or "",
        "address":        getattr(customer, "address", "") or "",
        "hierarchy_type": getattr(customer, "hierarchy_type", "") or "",
    }

    _, data = _tpt_request("POST", "customer", payload=payload)
    tpt_id  = _tpt_extract_id(data)

    customer.tpt_customer_id = tpt_id
    customer.tpt_sync_status = "SYNCED"
    customer.tpt_sync_error  = ""
    customer.save(update_fields=[
        "tpt_customer_id", "tpt_sync_status", "tpt_sync_error",
    ])
    return tpt_id


def sync_site(site):
    """Push a local Site to 3TP, linked to its customer's 3TP id."""
    if not _tpt_enabled():
        return ""

    customer = site.branch.customer
    if not getattr(customer, "tpt_customer_id", ""):
        sync_customer(customer)

    payload = {
        "name":        getattr(site, "name", "") or "",
        "code":        getattr(site, "code", "") or "",
        "customer_id": customer.tpt_customer_id,
        "asset_type":  getattr(settings, "TPT_SITE_ASSET_TYPE", "SITE"),
        "branch_name": site.branch.name if site.branch_id else "",
        "floor_name":  site.floor.name if site.floor_id else "",
        "address":     getattr(site, "address", "") or "",
    }

    _, data = _tpt_request("POST", "site", payload=payload)
    tpt_id  = _tpt_extract_id(data)

    site.tpt_site_id     = tpt_id
    site.tpt_sync_status = "SYNCED"
    site.tpt_sync_error  = ""
    site.save(update_fields=[
        "tpt_site_id", "tpt_sync_status", "tpt_sync_error",
    ])
    return tpt_id


def sync_device(device):
    """Push a local ACDevice to 3TP, linked to its site's 3TP id."""
    if not _tpt_enabled():
        return ""

    site = device.site
    if site is None:
        raise ThreeTPError("Cannot sync device: no site assigned.")
    if not getattr(site, "tpt_site_id", ""):
        sync_site(site)

    payload = {
        "ac_id":        device.ac_id,
        "device_name":  device.device_name or device.ac_id,
        "site_id":      site.tpt_site_id,
        "device_type":  getattr(settings, "TPT_DEVICE_TYPE", "AC"),
        "status":       device.status,
        "capacity_ton": str(device.capacity_ton or ""),
        "installation_date": (
            device.installation_date.isoformat()
            if getattr(device, "installation_date", None) else ""
        ),
        "last_maintenance_date": (
            device.last_maintenance_date.isoformat()
            if getattr(device, "last_maintenance_date", None) else ""
        ),
    }

    _, data = _tpt_request("POST", "device", payload=payload)
    tpt_id  = _tpt_extract_id(data)

    device.tpt_device_id   = tpt_id
    device.tpt_sync_status = "SYNCED"
    device.tpt_sync_error  = ""
    device.save(update_fields=[
        "tpt_device_id", "tpt_sync_status", "tpt_sync_error",
    ])
    return tpt_id


# =====================================================================
# LOCATION TREE HELPERS
# =====================================================================
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
                                "state_id":    state.get("state_id", ""),
                                "state_name":  state.get("state_name", ""),
                                "district_id": district.get("district_id", ""),
                                "district_name": district.get("district_name", ""),
                                "taluka_id":   taluka.get("taluka_id", ""),
                                "taluka_name": taluka.get("taluka_name", ""),
                                "city_id":     city.get("city_id", ""),
                                "city_name":   city.get("city_name", ""),
                                "branch_id":   branch.get("branch_id", ""),
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
                                "zone_id":     zone.get("zone_id", ""),
                                "zone_name":   zone.get("zone_name", ""),
                                "circle_id":   circle.get("circle_id", ""),
                                "circle_name": circle.get("circle_name", ""),
                                "region_id":   region.get("region_id", ""),
                                "region_name": region.get("region_name", ""),
                                "division_id":   division.get("division_id", ""),
                                "division_name": division.get("division_name", ""),
                                "branch_id":   branch.get("branch_id", ""),
                                "branch_name": branch.get("branch_name", ""),
                            }
                            yield branch, context


def find_location_target(tree, hierarchy_type, branch_id="", floor_id=""):
    for branch, context in iter_branches(tree, hierarchy_type):
        if floor_id:
            for floor in branch.get("floors", []):
                if str(floor.get("floor_id", "")) == str(floor_id):
                    return {"branch": branch, "floor": floor, "context": context}

        if branch_id:
            if str(branch.get("branch_id", "")) == str(branch_id):
                return {"branch": branch, "floor": None, "context": context}
    return None


def remove_site_from_tree(tree, site_id):
    removed = False
    for hierarchy_type in ["GEOGRAPHICAL", "ZONAL"]:
        for branch, _ in iter_branches(tree, hierarchy_type):
            branch_sites = branch.get("sites", [])
            new_branch_sites = [
                s for s in branch_sites
                if str(s.get("site_id", "")) != str(site_id)
            ]
            if len(new_branch_sites) != len(branch_sites):
                removed = True
            branch["sites"] = new_branch_sites

            for floor in branch.get("floors", []):
                floor_sites = floor.get("sites", [])
                new_floor_sites = [
                    s for s in floor_sites
                    if str(s.get("site_id", "")) != str(site_id)
                ]
                if len(new_floor_sites) != len(floor_sites):
                    removed = True
                floor["sites"] = new_floor_sites
    return removed


def build_location_index():
    index = {}

    geo_tree = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)
    for branch, context in iter_branches(geo_tree, "GEOGRAPHICAL"):
        branch_id = branch.get("branch_id")
        if branch_id:
            index[branch_id] = {**context, "location_type": "BRANCH"}

        for floor in branch.get("floors", []):
            floor_id = floor.get("floor_id")
            if not floor_id:
                continue
            index[floor_id] = {
                **context,
                "floor_id":   floor_id,
                "floor_name": floor.get("floor_name", ""),
                "location_type": "FLOOR",
            }
            for s in floor.get("sites", []):
                sid = s.get("site_id")
                if sid:
                    index[sid] = {
                        **context,
                        "floor_id":   floor_id,
                        "floor_name": floor.get("floor_name", ""),
                        "site_id":    sid,
                        "device_name": s.get("device_name", ""),
                        "capacity_ton": s.get("capacity_ton", ""),
                        "installation_date": s.get("installation_date", ""),
                        "last_maintenance_date": s.get("last_maintenance_date", ""),
                        "location_type": "FLOOR",
                    }

        for s in branch.get("sites", []):
            sid = s.get("site_id")
            if sid:
                index[sid] = {
                    **context,
                    "site_id":     sid,
                    "device_name": s.get("device_name", ""),
                    "capacity_ton": s.get("capacity_ton", ""),
                    "installation_date": s.get("installation_date", ""),
                    "last_maintenance_date": s.get("last_maintenance_date", ""),
                    "location_type": "DIRECT_BRANCH",
                }

    zonal_tree = load_location_tree(ZONAL_LOCATION_FILE)
    for branch, context in iter_branches(zonal_tree, "ZONAL"):
        branch_id = branch.get("branch_id")
        if branch_id:
            index[branch_id] = {**context, "location_type": "BRANCH"}

        for floor in branch.get("floors", []):
            floor_id = floor.get("floor_id")
            if not floor_id:
                continue
            index[floor_id] = {
                **context,
                "floor_id":   floor_id,
                "floor_name": floor.get("floor_name", ""),
                "location_type": "FLOOR",
            }
            for s in floor.get("sites", []):
                sid = s.get("site_id")
                if sid:
                    index[sid] = {
                        **context,
                        "floor_id":   floor_id,
                        "floor_name": floor.get("floor_name", ""),
                        "site_id":    sid,
                        "device_name": s.get("device_name", ""),
                        "capacity_ton": s.get("capacity_ton", ""),
                        "installation_date": s.get("installation_date", ""),
                        "last_maintenance_date": s.get("last_maintenance_date", ""),
                        "location_type": "FLOOR",
                    }

        for s in branch.get("sites", []):
            sid = s.get("site_id")
            if sid:
                index[sid] = {
                    **context,
                    "site_id":     sid,
                    "device_name": s.get("device_name", ""),
                    "capacity_ton": s.get("capacity_ton", ""),
                    "installation_date": s.get("installation_date", ""),
                    "last_maintenance_date": s.get("last_maintenance_date", ""),
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

        if isinstance(mappings, dict):
            result = {}
            for ac_id, value in mappings.items():
                if isinstance(value, dict):
                    item = dict(value)
                    item.setdefault("ac_id", ac_id)
                    result[ac_id] = item
                else:
                    result[ac_id] = {"ac_id": ac_id, "floor_id": value}
            return result

        return {}

    except (json.JSONDecodeError, TypeError):
        return {}


def save_device_location_map(device_map):
    mappings = list(device_map.values())
    with open(DEVICE_LOCATION_MAP_FILE, "w", encoding="utf-8") as file:
        json.dump(mappings, file, indent=4)


def get_ac_device_name(ac_id):
    if not os.path.exists(DATA_FILE):
        return ac_id
    try:
        with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
            data = json.load(file)
        for record in reversed(data):
            if str(record.get("ac_id", "")) == str(ac_id):
                return record.get("device_name") or ac_id
    except Exception:
        pass
    return ac_id


def make_code_id(existing_ids, name, prefix=""):
    words = [w for w in name.strip().split() if w]
    base = (words[0][0] + words[1][0]).upper() if len(words) >= 2 else name.strip()[:2].upper()
    base = f"{prefix}{base}" if prefix else base

    candidate = base
    suffix = 1
    while candidate in existing_ids:
        suffix += 1
        candidate = f"{base}{suffix}"
    return candidate


# =====================================================================
# DEVICE FLATTEN HELPER
# =====================================================================
def _flatten_device(mapping):
    flat = {
        "ac_id":          mapping.get("ac_id", ""),
        "site_id":        mapping.get("site_id", ""),
        "device_name":    mapping.get("device_name", ""),
        "status":         mapping.get("status", "OFF"),
        "location_type":  mapping.get("location_type", ""),
        "hierarchy_type": (mapping.get("hierarchy_type") or "").upper(),
        "capacity_ton":            mapping.get("capacity_ton", ""),
        "installation_date":       mapping.get("installation_date", ""),
        "last_maintenance_date":   mapping.get("last_maintenance_date", ""),
        "customer_id":      mapping.get("customer_id", ""),
        "created_by_id":    mapping.get("created_by_id", ""),
        "created_by_name":  mapping.get("created_by_name", ""),
        "created_by_email": mapping.get("created_by_email", ""),
        "created_by_role":  mapping.get("created_by_role", ""),
    }

    geo = mapping.get("geographical") or {}
    zon = mapping.get("zonal")        or {}

    if zon and not geo:
        block = zon
        flat["hierarchy_type"] = flat["hierarchy_type"] or "ZONAL"
    elif geo:
        block = geo
        flat["hierarchy_type"] = flat["hierarchy_type"] or "GEOGRAPHICAL"
    else:
        block = mapping

    for field in (
        "state_id", "state_name", "district_id", "district_name",
        "taluka_id", "taluka_name", "city_id", "city_name",
        "zone_id", "zone_name", "circle_id", "circle_name",
        "region_id", "region_name", "division_id", "division_name",
        "branch_id", "branch_name", "floor_id", "floor_name",
    ):
        if block.get(field):
            flat[field] = block[field]

    return flat


# =====================================================================
# DEVICES  (canonical Site-based flow + legacy branch/floor flow)
# =====================================================================
def nodes_for_mapping(mapping, branch_index):
    """Tree branch node(s) an AC mapping points at."""
    hier = (mapping.get("hierarchy_type") or "").upper()
    blocks = []
    if mapping.get("geographical"):
        blocks.append(("GEOGRAPHICAL", mapping["geographical"]))
    if mapping.get("zonal"):
        blocks.append(("ZONAL", mapping["zonal"]))
    if not blocks and hier:
        blocks.append((hier, mapping))
    nodes = []
    for h, block in blocks:
        if hier and h != hier:
            continue
        node = branch_index.get((h, block.get("branch_id")))
        if node is not None:
            nodes.append(node)
    return nodes


def user_can_see_ac(user, ac_id, device_map, branch_index):
    if user.role == Role.ORG_SUPER_ADMIN:
        return True

    db_device = (
        ACDevice.objects
        .select_related("site", "site__branch", "site__branch__customer")
        .filter(ac_id=ac_id)
        .first()
    )

    if db_device and db_device.site_id:
        site = db_device.site

        if user.role == Role.CUSTOMER:
            return site.branch.customer_id == user.customer_id

        if user.role == Role.BR_ADMIN:
            hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
            if hierarchy == "GEOGRAPHICAL" and user.state_id:
                return (
                    site.branch.customer_id == user.customer_id
                    and site.branch.city
                    and site.branch.city.taluka
                    and site.branch.city.taluka.district
                    and site.branch.city.taluka.district.state_id == user.state_id
                )
            if hierarchy == "ZONAL" and user.zone_id:
                return (
                    site.branch.customer_id == user.customer_id
                    and site.branch.division
                    and site.branch.division.region
                    and site.branch.division.region.circle
                    and site.branch.division.region.circle.zone_id == user.zone_id
                )
            return site.branch_id == user.branch_id

        if user.role == Role.ENGINEER:
            return site.id == user.site_id

        return False

    mapping = device_map.get(ac_id)
    if not mapping:
        return False

    return any(
        ownership.can_see_branch(user, n)
        for n in nodes_for_mapping(mapping, branch_index)
    )


def scope_ac_records(records, user):
    if user.role == Role.ORG_SUPER_ADMIN:
        return records
    device_map = build_device_location_map()
    idx = ownership.build_branch_index()
    return [r for r in records if user_can_see_ac(user, r.get("ac_id", ""), device_map, idx)]


@api_view(["GET", "POST"])
def devices(request):
    try:
        return _devices_impl(request)
    except Exception as exc:
        return JsonResponse(
            {
                "status":    "error",
                "message":   f"{type(exc).__name__}: {exc}",
                "traceback": traceback.format_exc().splitlines(),
            },
            status=500,
        )


def _devices_impl(request):
    device_map = build_device_location_map()
    if request.method == "GET":
        user = request.user
        idx = ownership.build_branch_index()

        visible = []
        for ac_id, mapping in device_map.items():
            if not isinstance(mapping, dict):
                continue
            if user_can_see_ac(user, ac_id, device_map, idx):
                visible.append((ac_id, mapping, nodes_for_mapping(mapping, idx)))

        all_nodes = [n for _, _, ns in visible for n in ns]
        lookup = ownership.OwnerLookup.for_nodes(all_nodes)

        result = []
        for ac_id, mapping, nodes in visible:
            flat = _flatten_device(mapping)
            flat["ac_id"] = ac_id

            db_device = (
                ACDevice.objects
                .select_related(
                    "site",
                    "site__branch",
                    "site__branch__customer",
                    "site__floor",
                )
                .filter(ac_id=ac_id)
                .first()
            )

            if db_device and db_device.site_id:
                site_obj = db_device.site
                branch_obj = site_obj.branch
                flat["site_id"]      = str(site_obj.id)
                flat["site_name"]    = site_obj.name
                flat["site_code"]    = site_obj.code
                flat["branch_id"]    = str(branch_obj.id)
                flat["branch_name"]  = branch_obj.name
                flat["customer_id"]  = str(branch_obj.customer_id or "")
                flat["customer_name"] = (
                    branch_obj.customer.company if branch_obj.customer_id else ""
                )
                flat["floor_id"]   = str(site_obj.floor_id or "")
                flat["floor_name"] = site_obj.floor.name if site_obj.floor_id else ""

                customer_obj = branch_obj.customer
                if customer_obj and customer_obj.hierarchy_type == "GEOGRAPHICAL":
                    state_id = (
                        branch_obj.city.taluka.district.state_id
                        if branch_obj.city_id and branch_obj.city.taluka_id
                        and branch_obj.city.taluka.district_id
                        else None
                    )
                    site_admins = list(
                        User.objects.filter(
                            role=Role.BR_ADMIN,
                            is_active=True,
                            customer_id=customer_obj.id,
                            state_id=state_id,
                        ).values(
                            "id", "name", "email", "phone", "role",
                            "state_id", "zone_id", "branch_id", "site_id"
                        )
                    ) if state_id else []
                elif customer_obj and customer_obj.hierarchy_type == "ZONAL":
                    zone_id = (
                        branch_obj.division.region.circle.zone_id
                        if branch_obj.division_id and branch_obj.division.region_id
                        and branch_obj.division.region.circle_id
                        else None
                    )
                    site_admins = list(
                        User.objects.filter(
                            role=Role.BR_ADMIN,
                            is_active=True,
                            customer_id=customer_obj.id,
                            zone_id=zone_id,
                        ).values(
                            "id", "name", "email", "phone", "role",
                            "state_id", "zone_id", "branch_id", "site_id"
                        )
                    ) if zone_id else []
                else:
                    site_admins = []

                site_engineers = list(
                    site_obj.users.filter(
                        role=Role.ENGINEER, is_active=True
                    ).values("id", "name", "email", "phone", "role", "branch_id", "site_id")
                )
                flat["admins"]    = site_admins
                flat["engineers"] = site_engineers

            owner_node = next((n for n in nodes if n.get("customer_id")), nodes[0] if nodes else None)
            if owner_node is not None:
                info = lookup.describe(owner_node)
                flat["customer_id"]   = owner_node.get("customer_id") or flat.get("customer_id") or ""
                flat["customer_name"] = info["customer"]["company"] if info["customer"] else ""
                flat["admins"]        = info["admins"]
                flat["engineers"]     = info["engineers"]
            result.append(flat)

        return JsonResponse({
            "status": "success",
            "count":  len(result),
            "data":   result,
        })

    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Invalid JSON body"}, status=400,
        )

    # --- canonical site-based flow ---
    site_id = str(body.get("site_id", "")).strip()

    if site_id:
        try:
            site_obj = (
                Site.objects
                .select_related(
                    "branch",
                    "branch__customer",
                    "branch__customer__organization",
                    "floor",
                )
                .prefetch_related("users")
                .get(pk=site_id)
            )
        except (Site.DoesNotExist, ValueError):
            return JsonResponse(
                {"status": "error", "message": "Selected site was not found."},
                status=404,
            )

        acting = request.user

        if acting.role == Role.ORG_SUPER_ADMIN:
            allowed = (site_obj.branch.customer.organization_id == acting.organization_id)
        elif acting.role == Role.CUSTOMER:
            allowed = (site_obj.branch.customer_id == acting.customer_id)
        elif acting.role == Role.BR_ADMIN:
            hierarchy = getattr(acting.customer, "hierarchy_type", None) if acting.customer_id else None
            if hierarchy == "GEOGRAPHICAL" and acting.state_id:
                allowed = (
                    site_obj.branch.customer_id == acting.customer_id
                    and site_obj.branch.city
                    and site_obj.branch.city.taluka
                    and site_obj.branch.city.taluka.district
                    and site_obj.branch.city.taluka.district.state_id == acting.state_id
                )
            elif hierarchy == "ZONAL" and acting.zone_id:
                allowed = (
                    site_obj.branch.customer_id == acting.customer_id
                    and site_obj.branch.division
                    and site_obj.branch.division.region
                    and site_obj.branch.division.region.circle
                    and site_obj.branch.division.region.circle.zone_id == acting.zone_id
                )
            else:
                allowed = site_obj.branch_id == acting.branch_id
        elif acting.role == Role.ENGINEER:
            allowed = site_obj.id == acting.site_id
        else:
            allowed = False

        if not allowed:
            return JsonResponse(
                {"status": "error", "message": "You do not have access to the selected site."},
                status=403,
            )

        if not site_obj.branch.customer_id:
            return JsonResponse(
                {"status": "error", "message": "The selected site is not assigned to a customer."},
                status=400,
            )

        ac_id       = str(body.get("ac_id", "")).strip()
        device_name = str(body.get("device_name", "")).strip()
        status_val  = str(body.get("status", "OFF")).strip().upper()
        capacity_raw          = body.get("capacity_ton", "")
        installation_date     = str(body.get("installation_date", "")).strip()
        last_maintenance_date = str(body.get("last_maintenance_date", "")).strip()

        if not ac_id:
            return JsonResponse({"status": "error", "message": "ac_id is required"}, status=400)

        if not device_name:
            device_name = get_ac_device_name(ac_id)

        if status_val not in {"ON", "OFF"}:
            status_val = "OFF"

        try:
            capacity_ton = float(capacity_raw)
        except (TypeError, ValueError):
            capacity_ton = 0

        if capacity_ton <= 0:
            return JsonResponse(
                {"status": "error", "message": "capacity_ton must be greater than 0"}, status=400,
            )

        if not installation_date:
            return JsonResponse(
                {"status": "error", "message": "installation_date is required"}, status=400,
            )

        if last_maintenance_date and last_maintenance_date < installation_date:
            return JsonResponse(
                {"status": "error",
                 "message": "last_maintenance_date cannot be before installation_date"},
                status=400,
            )

        with transaction.atomic():
            db_device, created = ACDevice.objects.update_or_create(
                ac_id=ac_id,
                defaults={
                    "device_name": device_name,
                    "site": site_obj,
                    "status": status_val,
                    "capacity_ton": capacity_ton,
                    "installation_date": installation_date,
                    "last_maintenance_date": last_maintenance_date or None,
                    "assigned_by": acting,
                },
            )

        try:
            customer = site_obj.branch.customer
            if not customer.tpt_customer_id:
                sync_customer(customer)
            if not site_obj.tpt_site_id:
                sync_site(site_obj)
            sync_device(db_device)
        except ThreeTPError as exc:
            ACDevice.objects.filter(pk=db_device.pk).update(
                tpt_sync_status="FAILED",
                tpt_sync_error=str(exc),
            )

        customer = site_obj.branch.customer

        admins = list(
            site_obj.users.filter(role=Role.BR_ADMIN, is_active=True)
            .values("id", "name", "email", "phone", "role", "branch_id", "site_id")
        )
        engineers = list(
            site_obj.users.filter(role=Role.ENGINEER, is_active=True)
            .values("id", "name", "email", "phone", "role", "branch_id", "site_id")
        )

        hierarchy_type = getattr(customer, "hierarchy_type", "") or ""

        device_map   = build_device_location_map()
        old_mapping  = device_map.get(ac_id, {})

        mapping = {
            "ac_id": ac_id,
            "site_id": str(site_obj.id),
            "site_name": site_obj.name,
            "site_code": site_obj.code,
            "device_name": device_name,
            "status": status_val,
            "location_type": "SITE",
            "hierarchy_type": hierarchy_type,
            "customer_id": str(customer.id),
            "customer_name": customer.company,
            "branch_id": str(site_obj.branch_id),
            "branch_name": site_obj.branch.name,
            "floor_id": str(site_obj.floor_id or ""),
            "floor_name": site_obj.floor.name if site_obj.floor_id else "",
            "capacity_ton": capacity_ton,
            "installation_date": installation_date,
            "last_maintenance_date": last_maintenance_date,
            "created_by_id": str(getattr(acting, "id", "") or ""),
            "created_by_name": getattr(acting, "name", "") or getattr(acting, "email", ""),
            "created_by_email": getattr(acting, "email", ""),
            "created_by_role": getattr(acting, "role", ""),
        }

        if old_mapping:
            old_hierarchy = (old_mapping.get("hierarchy_type") or "").upper()
            old_file = (
                GEOGRAPHICAL_LOCATION_FILE if old_hierarchy == "GEOGRAPHICAL"
                else ZONAL_LOCATION_FILE if old_hierarchy == "ZONAL"
                else None
            )
            if old_file:
                try:
                    old_tree = load_location_tree(old_file)
                    old_site_id = old_mapping.get("site_id") or ac_id
                    if remove_site_from_tree(old_tree, old_site_id):
                        save_location_tree(old_tree, old_file)
                except Exception:
                    pass

        device_map[ac_id] = mapping
        save_device_location_map(device_map)

        response_data = dict(mapping)
        response_data["customer"] = {
            "id": customer.id, "company": customer.company, "code": customer.code,
        }
        response_data["admins"]    = admins
        response_data["engineers"] = engineers
        response_data["site"]      = {
            "id": str(site_obj.id), "name": site_obj.name, "code": site_obj.code,
        }

        return JsonResponse(
            {
                "status": "success",
                "message": (
                    f"{ac_id} created and assigned to {site_obj.name}."
                    if created
                    else f"{ac_id} reassigned to {site_obj.name}."
                ),
                "data": response_data,
            },
            status=201 if created else 200,
        )

    # --- legacy branch / floor flow ---
    ac_id       = str(body.get("ac_id", "")).strip()
    hierarchy   = str(body.get("hierarchy_type", "")).strip().upper()
    branch_id   = str(body.get("branch_id", "")).strip()
    floor_id    = str(body.get("floor_id", "")).strip()
    device_name = str(body.get("device_name", "")).strip()
    status_val  = str(body.get("status", "OFF")).strip().upper()
    capacity_raw          = body.get("capacity_ton", "")
    installation_date     = str(body.get("installation_date", "")).strip()
    last_maintenance_date = str(body.get("last_maintenance_date", "")).strip()

    try:
        capacity_ton = float(capacity_raw)
    except (TypeError, ValueError):
        capacity_ton = 0

    acting           = getattr(request, "user", None)
    created_by_id    = str(getattr(acting, "id", "") or "")
    created_by_name  = getattr(acting, "name", "") or getattr(acting, "email", "")
    created_by_email = getattr(acting, "email", "")
    created_by_role  = getattr(acting, "role", "")

    if not ac_id:
        return JsonResponse({"status": "error", "message": "ac_id is required"}, status=400)
    if hierarchy not in {"GEOGRAPHICAL", "ZONAL"}:
        return JsonResponse(
            {"status": "error", "message": "hierarchy_type must be 'GEOGRAPHICAL' or 'ZONAL'"},
            status=400,
        )
    if not branch_id:
        return JsonResponse({"status": "error", "message": "branch_id is required"}, status=400)

    if not device_name:
        device_name = get_ac_device_name(ac_id)

    if status_val not in {"ON", "OFF"}:
        status_val = "OFF"

    if capacity_ton <= 0:
        return JsonResponse(
            {"status": "error", "message": "capacity_ton must be greater than 0"}, status=400,
        )
    if not installation_date:
        return JsonResponse(
            {"status": "error", "message": "installation_date is required"}, status=400,
        )
    if last_maintenance_date and last_maintenance_date < installation_date:
        return JsonResponse(
            {"status": "error",
             "message": "last_maintenance_date cannot be before installation_date"},
            status=400,
        )

    location_file = (
        GEOGRAPHICAL_LOCATION_FILE if hierarchy == "GEOGRAPHICAL"
        else ZONAL_LOCATION_FILE
    )

    try:
        tree = load_location_tree(location_file)
    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Location tree file is malformed"}, status=500,
        )

    target = find_location_target(tree, hierarchy, branch_id=branch_id, floor_id=floor_id)
    if not target:
        return JsonResponse(
            {"status": "error",
             "message": "Selected floor/branch was not found in the selected hierarchy"},
            status=404,
        )

    branch  = target["branch"]
    floor   = target["floor"]
    context = target["context"]

    if not ownership.can_manage_branch(request.user, branch):
        return JsonResponse(
            {"status": "error", "message": "You do not have access to this site."},
            status=403,
        )
    customer_id = branch.get("customer_id")
    if not customer_id:
        return JsonResponse(
            {"status": "error",
             "message": "This site is not assigned to a customer yet. "
                        "Assign a customer and admin to the site first (Sites page)."},
            status=400,
        )

    old_mapping = device_map.get(ac_id, {})
    if old_mapping and request.user.role != Role.ORG_SUPER_ADMIN:
        old_nodes = nodes_for_mapping(old_mapping, ownership.build_branch_index())
        if old_nodes and not any(ownership.can_manage_branch(request.user, n) for n in old_nodes):
            return JsonResponse(
                {"status": "error", "message": "This AC is assigned to a site you cannot manage."},
                status=403,
            )
    old_site_id = old_mapping.get("site_id") or ac_id
    remove_site_from_tree(tree, old_site_id)
    if old_site_id != ac_id:
        remove_site_from_tree(tree, ac_id)

    site = {
        "site_id": ac_id,
        "device_name": device_name,
        "status": status_val,
        "capacity_ton": capacity_ton,
        "installation_date": installation_date,
        "last_maintenance_date": last_maintenance_date,
    }

    if floor is not None:
        if not isinstance(floor.get("sites"), list):
            floor["sites"] = []
        floor["sites"].append(site)

        location_type       = "FLOOR"
        assigned_floor_id   = floor.get("floor_id", "")
        assigned_floor_name = floor.get("floor_name", "")
    else:
        if not isinstance(branch.get("sites"), list):
            branch["sites"] = []
        branch["sites"].append(site)

        location_type       = "DIRECT_BRANCH"
        assigned_floor_id   = ""
        assigned_floor_name = ""

    save_location_tree(tree, location_file)

    mapping = {
        "ac_id": ac_id,
        "site_id": ac_id,
        "device_name": device_name,
        "status": status_val,
        "location_type": location_type,
        "hierarchy_type": hierarchy,
        "customer_id": customer_id,
        "created_by_id": created_by_id,
        "created_by_name": created_by_name,
        "created_by_email": created_by_email,
        "created_by_role": created_by_role,
        "branch_id": branch.get("branch_id", ""),
        "branch_name": branch.get("branch_name", ""),
        "floor_id": assigned_floor_id,
        "floor_name": assigned_floor_name,
        "capacity_ton": capacity_ton,
        "installation_date": installation_date,
        "last_maintenance_date": last_maintenance_date,
    }
    mapping.update(context)

    device_map[ac_id] = mapping
    save_device_location_map(device_map)

    info = ownership.OwnerLookup.for_nodes([branch]).describe(branch)
    response_data = dict(mapping)
    response_data["customer_name"] = info["customer"]["company"] if info["customer"] else ""
    response_data["admins"]    = info["admins"]
    response_data["engineers"] = info["engineers"]

    return JsonResponse(
        {"status": "success", "message": f"{ac_id} assigned successfully", "data": response_data},
        status=201,
    )


# =====================================================================
# LOCATIONS  (tree)
# =====================================================================
def _scoped_tree(location_file, user):
    tree = load_location_tree(location_file)
    tree = ownership.filter_tree_for_user(tree, user)
    return ownership.attach_owner_details(tree)


def _locations_impl(request):
    if request.method == "GET":
        hierarchy = request.GET.get("hierarchy", "").strip().upper()

        try:
            if hierarchy == "GEOGRAPHICAL":
                data = _scoped_tree(GEOGRAPHICAL_LOCATION_FILE, request.user)
                return JsonResponse(
                    {"success": True, "hierarchy_type": "GEOGRAPHICAL", "data": data},
                    safe=True,
                )

            if hierarchy == "ZONAL":
                data = _scoped_tree(ZONAL_LOCATION_FILE, request.user)
                return JsonResponse(
                    {"success": True, "hierarchy_type": "ZONAL", "data": data},
                    safe=True,
                )

            geographical_data = _scoped_tree(GEOGRAPHICAL_LOCATION_FILE, request.user)
            zonal_data        = _scoped_tree(ZONAL_LOCATION_FILE, request.user)

            return JsonResponse(
                {
                    "success": True,
                    "geographical": {"hierarchy_type": "GEOGRAPHICAL", "data": geographical_data},
                    "zonal":        {"hierarchy_type": "ZONAL",        "data": zonal_data},
                },
                safe=True,
            )

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=500)
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)

    # ---- POST ----
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON body"}, status=400)

    hierarchy = str(body.get("hierarchy_type", "")).strip().upper()

    if hierarchy not in {"ZONAL", "GEOGRAPHICAL"}:
        return JsonResponse(
            {"success": False, "message": "hierarchy_type must be 'ZONAL' or 'GEOGRAPHICAL'"},
            status=400,
        )

    location_file = ZONAL_LOCATION_FILE if hierarchy == "ZONAL" else GEOGRAPHICAL_LOCATION_FILE

    try:
        tree = load_location_tree(location_file)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=500)

    # -------- ZONAL --------
    if hierarchy == "ZONAL":
        zone_name     = str(body.get("zone_name", "")).strip()
        circle_name   = str(body.get("circle_name", "")).strip()
        region_name   = str(body.get("region_name", "")).strip()
        division_name = str(body.get("division_name", "")).strip()
        branch_name   = str(body.get("branch_name", "")).strip()
        floor_name    = str(body.get("floor_name", "")).strip()

        missing = [
            field for field, value in [
                ("zone_name",     zone_name),
                ("circle_name",   circle_name),
                ("region_name",   region_name),
                ("division_name", division_name),
                ("branch_name",   branch_name),
                ("floor_name",    floor_name),
            ] if not value
        ]
        if missing:
            return JsonResponse(
                {"success": False,
                 "message": "Missing required field(s): " + ", ".join(missing)},
                status=400,
            )

        zone = next((z for z in tree if z.get("zone_name", "").strip().lower() == zone_name.lower()), None)
        if zone is None:
            zone_ids = {z.get("zone_id", "") for z in tree}
            zone = {
                "zone_id": make_code_id(zone_ids, zone_name, prefix="ZN-"),
                "zone_name": zone_name,
                "circles": [],
            }
            tree.append(zone)

        circle = next((c for c in zone.get("circles", [])
                       if c.get("circle_name", "").strip().lower() == circle_name.lower()), None)
        if circle is None:
            circle_ids = {c.get("circle_id", "") for z in tree for c in z.get("circles", [])}
            circle = {
                "circle_id": make_code_id(circle_ids, circle_name, prefix=f"{zone['zone_id']}-C"),
                "circle_name": circle_name,
                "regions": [],
            }
            zone.setdefault("circles", []).append(circle)

        region = next((r for r in circle.get("regions", [])
                       if r.get("region_name", "").strip().lower() == region_name.lower()), None)
        if region is None:
            region_ids = {r.get("region_id", "")
                          for z in tree for c in z.get("circles", [])
                          for r in c.get("regions", [])}
            region = {
                "region_id": make_code_id(region_ids, region_name, prefix=f"{circle['circle_id']}-R"),
                "region_name": region_name,
                "divisions": [],
            }
            circle.setdefault("regions", []).append(region)

        division = next((d for d in region.get("divisions", [])
                         if d.get("division_name", "").strip().lower() == division_name.lower()), None)
        if division is None:
            division_ids = {d.get("division_id", "")
                            for z in tree for c in z.get("circles", [])
                            for r in c.get("regions", [])
                            for d in r.get("divisions", [])}
            division = {
                "division_id": make_code_id(division_ids, division_name, prefix=f"{region['region_id']}-D"),
                "division_name": division_name,
                "branches": [],
            }
            region.setdefault("divisions", []).append(division)

        branch = next((b for b in division.get("branches", [])
                       if b.get("branch_name", "").strip().lower() == branch_name.lower()), None)
        if branch is None:
            branch_index = len(division.get("branches", [])) + 1
            branch = {
                "branch_id": f"{division['division_id']}-B{branch_index:02d}",
                "branch_name": branch_name,
                "floors": [],
                "sites": [],
            }
            division.setdefault("branches", []).append(branch)

        if any(f.get("floor_name", "").strip().lower() == floor_name.lower()
               for f in branch.get("floors", [])):
            return JsonResponse(
                {"success": False,
                 "message": f"Floor '{floor_name}' already exists in this branch"},
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
                    "zone_id": zone["zone_id"],         "zone_name": zone["zone_name"],
                    "circle_id": circle["circle_id"],   "circle_name": circle["circle_name"],
                    "region_id": region["region_id"],   "region_name": region["region_name"],
                    "division_id": division["division_id"], "division_name": division["division_name"],
                    "branch_id": branch["branch_id"],   "branch_name": branch["branch_name"],
                    "floor_id": floor["floor_id"],      "floor_name": floor["floor_name"],
                },
            },
            status=201,
        )

    # -------- GEOGRAPHICAL --------
    state_name    = str(body.get("state_name", "")).strip()
    district_name = str(body.get("district_name", "")).strip()
    taluka_name   = str(body.get("taluka_name", "")).strip()
    city_name     = str(body.get("city_name", "")).strip()
    branch_name   = str(body.get("branch_name", "")).strip()
    floor_name    = str(body.get("floor_name", "")).strip()

    missing = [
        field for field, value in [
            ("state_name", state_name), ("district_name", district_name),
            ("taluka_name", taluka_name), ("city_name", city_name),
            ("branch_name", branch_name), ("floor_name", floor_name),
        ] if not value
    ]
    if missing:
        return JsonResponse(
            {"success": False, "message": "Missing required field(s): " + ", ".join(missing)},
            status=400,
        )

    state = next((s for s in tree if s.get("state_name", "").strip().lower() == state_name.lower()), None)
    if state is None:
        state_ids = {s.get("state_id", "") for s in tree}
        state = {
            "state_id": make_code_id(state_ids, state_name),
            "state_name": state_name,
            "districts": [],
        }
        tree.append(state)

    district = next((d for d in state.get("districts", [])
                     if d.get("district_name", "").strip().lower() == district_name.lower()), None)
    if district is None:
        district_index = len(state.get("districts", [])) + 1
        district = {
            "district_id": f"{state['state_id']}-D{district_index:02d}",
            "district_name": district_name,
            "talukas": [],
        }
        state.setdefault("districts", []).append(district)

    taluka = next((t for t in district.get("talukas", [])
                   if t.get("taluka_name", "").strip().lower() == taluka_name.lower()), None)
    if taluka is None:
        taluka_index = len(district.get("talukas", [])) + 1
        taluka = {
            "taluka_id": f"{district['district_id']}-T{taluka_index:02d}",
            "taluka_name": taluka_name,
            "cities": [],
        }
        district.setdefault("talukas", []).append(taluka)

    city = next((c for c in taluka.get("cities", [])
                 if c.get("city_name", "").strip().lower() == city_name.lower()), None)
    if city is None:
        city_index = len(taluka.get("cities", [])) + 1
        city = {
            "city_id": f"{taluka['taluka_id']}-C{city_index:02d}",
            "city_name": city_name,
            "branches": [],
        }
        taluka.setdefault("cities", []).append(city)

    branch = next((b for b in city.get("branches", [])
                   if b.get("branch_name", "").strip().lower() == branch_name.lower()), None)
    if branch is None:
        branch_index = len(city.get("branches", [])) + 1
        branch = {
            "branch_id": f"{city['city_id']}-B{branch_index:02d}",
            "branch_name": branch_name,
            "floors": [],
            "sites": [],
        }
        city.setdefault("branches", []).append(branch)

    if any(f.get("floor_name", "").strip().lower() == floor_name.lower()
           for f in branch.get("floors", [])):
        return JsonResponse(
            {"success": False,
             "message": f"Floor '{floor_name}' already exists in this branch"},
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
                "state_id": state["state_id"],         "state_name": state["state_name"],
                "district_id": district["district_id"], "district_name": district["district_name"],
                "taluka_id": taluka["taluka_id"],       "taluka_name": taluka["taluka_name"],
                "city_id": city["city_id"],             "city_name": city["city_name"],
                "branch_id": branch["branch_id"],       "branch_name": branch["branch_name"],
                "floor_id": floor["floor_id"],          "floor_name": floor["floor_name"],
            },
        },
        status=201,
    )


# =====================================================================
# FILTERING AND ENRICHMENT HELPERS
# =====================================================================
def matches(value, selected):
    if not selected:
        return True
    return str(value).strip().lower() == str(selected).strip().lower()


GEOGRAPHICAL_FIELDS = [
    "state_id", "state_name", "district_id", "district_name",
    "taluka_id", "taluka_name", "city_id", "city_name",
    "branch_id", "branch_name", "floor_id", "floor_name", "site_id",
]

ZONAL_FIELDS = [
    "zone_id", "zone_name", "circle_id", "circle_name",
    "region_id", "region_name", "division_id", "division_name",
    "branch_id", "branch_name", "floor_id", "floor_name", "site_id",
]


def resolve_ac_location(ac_id, device_map):
    mapping = device_map.get(ac_id, {})

    if not mapping:
        return {
            "geographical": {}, "zonal": {}, "site_id": "",
            "device_name": "", "location_type": "", "hierarchy_type": "",
        }

    if "geographical" in mapping or "zonal" in mapping:
        geo = mapping.get("geographical") or {}
        zon = mapping.get("zonal") or {}
        hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()
        return {
            "geographical": geo, "zonal": zon,
            "site_id": mapping.get("site_id", ""),
            "device_name": mapping.get("device_name", ""),
            "location_type": mapping.get("location_type", ""),
            "hierarchy_type": hierarchy_type,
        }

    hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()
    geo, zon = {}, {}
    if hierarchy_type == "GEOGRAPHICAL":
        geo = {f: mapping.get(f, "") for f in GEOGRAPHICAL_FIELDS}
    elif hierarchy_type == "ZONAL":
        zon = {f: mapping.get(f, "") for f in ZONAL_FIELDS}

    return {
        "geographical": geo, "zonal": zon,
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

    enriched["location_type"]  = loc["location_type"]
    enriched["hierarchy_type"] = loc["hierarchy_type"]

    return enriched


# =====================================================================
# DATA VIEWS
# =====================================================================
@api_view(["GET"])
def ac_data_with_location(request):
    try:
        data = telemetry.get_records()
        data = scope_ac_records(data, request.user)
        data = filter_by_location(data, request)

        device_map = build_device_location_map()
        data = [attach_location(rec, device_map) for rec in data]

        return JsonResponse(
            {"status": "success", "count": len(data), "data": data},
            safe=True,
        )
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON format"}, status=500)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ac_data(request):
    try:
        data = telemetry.get_records()
        data = scope_ac_records(data, request.user)
        data = filter_by_location(data, request)

        device_map = build_device_location_map()
        data = [attach_location(rec, device_map) for rec in data]

        return JsonResponse(
            {"status": "success", "count": len(data), "data": data},
            safe=True,
        )
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON format"}, status=500)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def telemetry_status(request):
    return JsonResponse(telemetry.get_status())


@api_view(["GET"])
def latest_ac_data(request):
    try:
        data = scope_ac_records(telemetry.get_records(), request.user)
        if not data:
            return JsonResponse({"status": "success", "data": None})
        return JsonResponse({"status": "success", "data": data[-1]})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


# =====================================================================
# AUTH
# =====================================================================
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


def _dashboard_path(role):
    return {
        Role.ORG_SUPER_ADMIN: "/org/dashboard",
        Role.CUSTOMER:        "/customer/dashboard",
        Role.BR_ADMIN:        "/admin/dashboard",
        Role.ENGINEER:        "/engineer/dashboard",
    }.get(role, "/login")


def _complete_local_login(request, user):
    user.last_login    = timezone.now()
    user.last_login_ip = get_client_ip(request)
    user.save(update_fields=["last_login", "last_login_ip"])

    django_login(request, user)
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "status":   "success",
            "message":  "Login successful",
            "token":    token.key,
            "user":     UserSerializer(user).data,
            "redirect": _dashboard_path(user.role),
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email          = (request.data.get("email") or "").strip().lower()
    password       = request.data.get("password") or ""
    requested_role = (request.data.get("role") or "").strip()

    if not email or not password:
        return Response(
            {"status": "error", "message": "Email and password are required."},
            status=400,
        )

    try:
        # ---- 1. Direct 3TP login ----
        tb_response = requests.post(
            f"{CLOUD_URL}/api/auth/login",
            json={"username": email, "password": password},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=15,
        )

        try:
            data = tb_response.json()
        except ValueError:
            data = {}

        if tb_response.status_code != 200:
            return Response(
                {"status": "error", "message": data.get("message", "3TP authentication failed.")},
                status=tb_response.status_code,
            )

        three_tp_token = data.get("token")
        refresh_token  = data.get("refreshToken")
        
        if not three_tp_token:
            return Response(
                {"status": "error",
                 "message": "3TP login succeeded but no token was returned."},
                status=502,
            )

        # ---- 2. Find local user ----
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return Response(
                {"status": "error",
                 "message": ("3TP login succeeded, but this user "
                             "does not exist in the AC Monitoring system.")},
                status=403,
            )

        if not user.is_active:
            return Response(
                {"status": "error", "message": "User account is inactive."},
                status=403,
            )

        if requested_role and user.role != requested_role:
            return Response(
                {"status": "error",
                 "message": f"This account belongs to '{user.get_role_display()}'."},
                status=403,
            )

        # ---- 3. Save login info ----
        user.last_login    = timezone.now()
        user.last_login_ip = get_client_ip(request)
        user.save(update_fields=["last_login", "last_login_ip"])

        django_login(request, user)

        # ---- 4. Cache 3TP token -> local user ----
        token_hash = hashlib.sha256(three_tp_token.encode("utf-8")).hexdigest()
        cache.set(f"3tp_auth:{token_hash}", user.id)
        Token.objects.filter(user=user).delete()
        app_token = Token.objects.create(user=user)

        return Response(
            {
                "status":       "success",
                "message":      "Login successful",
                "token":        three_tp_token,
                "refreshToken": refresh_token,
                "user":         UserSerializer(user).data,
                "redirect":     _dashboard_path(user.role),
            },
            status=200,
        )

    except requests.exceptions.RequestException as exc:
        return Response(
            {"status": "error", "message": f"3TP connection error: {str(exc)}"},
            status=502,
        )
    except Exception as exc:
        traceback.print_exc()
        return Response({"status": "error", "message": str(exc)}, status=500)


@api_view(["POST"])
def logout_view(request):
    if request.user.is_authenticated:
        raw_token = getattr(request, "auth", None)
        if isinstance(raw_token, str) and raw_token:
            cache.delete(
                "3tp_auth:" + hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
            )
        Token.objects.filter(user=request.user).delete()
        django_logout(request)
    return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)

# @api_view(["POST"])
# @permission_classes([AllowAny])
# def login_view(request):
    email          = (request.data.get("email") or "").strip().lower()
    password       = request.data.get("password") or ""
    requested_role = (request.data.get("role") or "").strip()

    if not email or not password:
        return Response(
            {"status": "error", "message": "Email and password are required."},
            status=400,
        )

    try:
        # ---- 1. Direct 3TP login (for the 3TP JWT, used only for 3TP calls) ----
        tb_response = requests.post(
            f"{CLOUD_URL}/api/auth/login",
            json={"username": email, "password": password},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=15,
        )

        try:
            data = tb_response.json()
        except ValueError:
            data = {}

        if tb_response.status_code != 200:
            return Response(
                {"status": "error", "message": data.get("message", "3TP authentication failed.")},
                status=tb_response.status_code,
            )

        three_tp_token = data.get("token")
        refresh_token  = data.get("refreshToken")

        if not three_tp_token:
            return Response(
                {"status": "error", "message": "3TP login succeeded but no token was returned."},
                status=502,
            )

        # ---- 2. Find the local user ----
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return Response(
                {"status": "error",
                 "message": "3TP login succeeded, but this user does not exist in the AC Monitoring system."},
                status=403,
            )

        if not user.is_active:
            return Response({"status": "error", "message": "User account is inactive."}, status=403)

        if requested_role and user.role != requested_role:
            return Response(
                {"status": "error",
                 "message": f"This account belongs to '{user.get_role_display()}'."},
                status=403,
            )

        # ---- 3. Save login info ----
        user.last_login    = timezone.now()
        user.last_login_ip = get_client_ip(request)
        user.save(update_fields=["last_login", "last_login_ip"])

        django_login(request, user)

        # ---- 4. Issue a permanent Django DRF token.  This is the app session. ----
        #  Delete any old token first so a fresh login always yields a fresh one.
        Token.objects.filter(user=user).delete()
        app_token = Token.objects.create(user=user)

        # ---- 5. Cache 3TP token -> local user, so a 3TP proxy call can find the user ----
        token_hash = hashlib.sha256(three_tp_token.encode("utf-8")).hexdigest()
        cache.set(f"3tp_auth:{token_hash}", user.id, timeout=60 * 60 * 8)

        return Response(
            {
                "status":       "success",
                "message":      "Login successful",

                # >>> App session token.  Used for every request to *your* API.
                #     Never expires.  Only deleted on /api/auth/logout/.
                "token":        app_token.key,

                # >>> 3TP tokens.  Used only by views that proxy to 3TP.
                "tp_token":         three_tp_token,
                "tp_refresh_token": refresh_token,

                "user":     UserSerializer(user).data,
                "redirect": _dashboard_path(user.role),
            },
            status=200,
        )

    except requests.exceptions.RequestException as exc:
        return Response({"status": "error", "message": f"3TP connection error: {str(exc)}"}, status=502)
    except Exception as exc:
        traceback.print_exc()
        return Response({"status": "error", "message": str(exc)}, status=500)


@api_view(["GET"])
def me_view(request):
    return Response(UserSerializer(request.user).data)


# =====================================================================
# SCOPED QUERYSET HELPER
# =====================================================================
def scoped_queryset(model, user, level_map):
    level, scope_id = user.get_scope()
    if level == "ORGANIZATION":
        return model.objects.filter(
            **{f"{level_map['ORGANIZATION']}": user.organization_id}
        )
    if level in level_map and scope_id:
        return model.objects.filter(**{level_map[level]: scope_id})
    return model.objects.none()


# =====================================================================
# ORGANIZATION / CUSTOMER VIEWS
# =====================================================================
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
        customer = serializer.instance
        try:
            sync_customer(customer)
        except ThreeTPError as exc:
            Customer.objects.filter(pk=customer.pk).update(
                tpt_sync_status="FAILED",
                tpt_sync_error=str(exc),
            )


class CustomerDetailView(CustomerScopeMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsOrgSuperAdmin]
    lookup_field = "pk"

    def perform_destroy(self, instance):
        instance.delete()

# =====================================================================
# ADMIN VIEWS
# =====================================================================
ADMIN_ROLES = [
    Role.ORG_SUPER_ADMIN,
    # Role.CUSTOMER,
    Role.BR_ADMIN,
    Role.ENGINEER,
]


class AdminListView(generics.ListCreateAPIView):
    serializer_class = AdminSerializer
    permission_classes = [IsOrgAdminOrCustomerAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "phone", "role"]
    ordering_fields = ["name", "email", "date_joined"]
    ordering = ["name"]

    def get_queryset(self):
        user = self.request.user
        base = User.objects.select_related(
            "organization", "customer", "zone", "circle", "state", "district", "branch", "site"
        )

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = base.filter(organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = base.filter(customer_id=user.customer_id)
        elif user.role == Role.BR_ADMIN:
            hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
            if hierarchy == "GEOGRAPHICAL" and user.state_id:
                qs = base.filter(customer_id=user.customer_id, state_id=user.state_id)
            elif hierarchy == "ZONAL" and user.zone_id:
                qs = base.filter(customer_id=user.customer_id, zone_id=user.zone_id)
            elif user.branch_id:
                qs = base.filter(branch_id=user.branch_id)
            else:
                return base.none()
        else:
            return base.none()

        qs = qs.filter(role__in=ADMIN_ROLES)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        role = serializer.validated_data.get("role")
        extra = {"organization": user.organization}

        if user.role == Role.CUSTOMER:
            extra["customer"] = user.customer

        customer = extra.get("customer") or serializer.validated_data.get("customer")

        if role == Role.BR_ADMIN:
            if not customer:
                raise DRFValidationError({"customer": "Customer is required for a Branch Admin."})

            hierarchy = customer.hierarchy_type
            if hierarchy == "GEOGRAPHICAL":
                state = serializer.validated_data.get("state")
                if not state or state.customer_id != customer.pk:
                    raise DRFValidationError({"state": "Select a state belonging to this customer."})
                extra.update(
                    customer=customer, state=state, zone=None, circle=None,
                    region=None, division=None, district=None, taluka=None,
                    city=None, branch=None, site=None,
                )
            elif hierarchy == "ZONAL":
                zone = serializer.validated_data.get("zone")
                if not zone or zone.customer_id != customer.pk:
                    raise DRFValidationError({"zone": "Select a zone belonging to this customer."})
                extra.update(
                    customer=customer, zone=zone, state=None, circle=None,
                    region=None, division=None, district=None, taluka=None,
                    city=None, branch=None, site=None,
                )
            else:
                raise DRFValidationError({"customer": "Customer hierarchy is not configured."})

        elif role == Role.ENGINEER:
            if customer:
                extra["customer"] = customer
            else:
                raise DRFValidationError({"customer": "Customer is required for an engineer."})

        serializer.save(**extra)


class AdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminSerializer
    permission_classes = [IsOrgAdminOrCustomerAdmin]
    lookup_field = "pk"

    def get_queryset(self):
        user = self.request.user
        base = User.objects.all()

        if user.role == Role.ORG_SUPER_ADMIN:
            return base.filter(organization_id=user.organization_id)
        if user.role == Role.CUSTOMER:
            return base.filter(
                customer_id=user.customer_id,
                role__in=[Role.BR_ADMIN, Role.ENGINEER],
            )
        if user.role == Role.BR_ADMIN:
            return base.filter(branch_id=user.branch_id)
        return base.none()

    def perform_update(self, serializer):
        if self.request.user.role == Role.CUSTOMER:
            serializer.save(customer=self.request.user.customer)
        else:
            serializer.save()


class EngListView(generics.ListCreateAPIView):
    serializer_class = AdminSerializer
    permission_classes = [IsOrgSuperAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "phone"]
    ordering_fields = ["name", "email", "date_joined"]
    ordering = ["name"]

    def get_queryset(self):
        user = self.request.user
        base = User.objects.select_related(
            "organization", "customer", "zone", "circle", "state", "district", "branch", "site"
        ).filter(role=Role.ENGINEER)

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

    def perform_create(self, serializer):
        user = self.request.user
        if user.customer_id:
            serializer.save(organization=user.organization, customer=user.customer)
        else:
            serializer.save(organization=user.organization)

    def perform_update(self, serializer):
        user = self.request.user
        if user.customer_id:
            serializer.save(customer=user.customer)
        else:
            serializer.save()


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


# =====================================================================
# GEOGRAPHICAL / ZONAL LIST VIEWS
# =====================================================================
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
            qs = Circle.objects.filter(zone__customer__organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = Circle.objects.filter(zone__customer_id=user.customer_id)
        elif user.role in [Role.BR_ADMIN, Role.ENGINEER]:
            qs = Circle.objects.filter(pk=user.circle_id)
        else:
            return Circle.objects.none()

        zone_id = self.request.query_params.get("zone")
        if zone_id:
            qs = qs.filter(zone_id=zone_id)
        return qs


class StateListView(generics.ListAPIView):
    serializer_class = StateSerializer

    def get_queryset(self):
        user = self.request.user
        qs = State.objects.select_related("customer")

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(customer__organization_id=user.organization_id)
        elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
            qs = qs.filter(customer_id=user.customer_id)
        else:
            return qs.none()

        customer_id = self.request.query_params.get("customer")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs


class TalukaListView(generics.ListAPIView):
    serializer_class = TalukaSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Taluka.objects.select_related("district", "district__state")

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(district__state__customer__organization_id=user.organization_id)
        elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
            qs = qs.filter(district__state__customer_id=user.customer_id)
        else:
            return qs.none()

        district_id = self.request.query_params.get("district")
        if district_id:
            qs = qs.filter(district_id=district_id)
        return qs.order_by("name")


class CityListView(generics.ListAPIView):
    serializer_class = CitySerializer

    def get_queryset(self):
        user = self.request.user
        qs = City.objects.select_related("taluka", "taluka__district", "taluka__district__state")

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(taluka__district__state__customer__organization_id=user.organization_id)
        elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
            qs = qs.filter(taluka__district__state__customer_id=user.customer_id)
        else:
            return qs.none()

        taluka_id = self.request.query_params.get("taluka")
        if taluka_id:
            qs = qs.filter(taluka_id=taluka_id)
        return qs.order_by("name")


class RegionListView(generics.ListAPIView):
    serializer_class = RegionSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Region.objects.select_related("circle", "circle__zone")

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(circle__zone__customer__organization_id=user.organization_id)
        elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
            qs = qs.filter(circle__zone__customer_id=user.customer_id)
        else:
            return qs.none()

        circle_id = self.request.query_params.get("circle")
        if circle_id:
            qs = qs.filter(circle_id=circle_id)
        return qs.order_by("name")


class DivisionListView(generics.ListAPIView):
    serializer_class = DivisionSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Division.objects.select_related("region", "region__circle", "region__circle__zone")

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(region__circle__zone__customer__organization_id=user.organization_id)
        elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
            qs = qs.filter(region__circle__zone__customer_id=user.customer_id)
        else:
            return qs.none()

        region_id = self.request.query_params.get("region")
        if region_id:
            qs = qs.filter(region_id=region_id)
        return qs.order_by("name")


class DistrictListView(generics.ListAPIView):
    serializer_class = DistrictSerializer

    def get_queryset(self):
        user = self.request.user
        qs = District.objects.select_related("state", "state__customer")

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(state__customer__organization_id=user.organization_id)
        elif user.role in [Role.CUSTOMER, Role.BR_ADMIN, Role.ENGINEER]:
            qs = qs.filter(state__customer_id=user.customer_id)
        else:
            return qs.none()

        state_id = self.request.query_params.get("state")
        if state_id:
            qs = qs.filter(state_id=state_id)
        return qs


class BranchListView(generics.ListAPIView):
    serializer_class = BranchSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Branch.objects.select_related(
            "customer",
            "city", "city__taluka", "city__taluka__district",
            "city__taluka__district__state",
            "division", "division__region",
            "division__region__circle", "division__region__circle__zone",
        )

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(customer__organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = qs.filter(customer_id=user.customer_id)
        elif user.role == Role.BR_ADMIN:
            hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
            if hierarchy == "GEOGRAPHICAL" and user.state_id:
                qs = qs.filter(
                    customer_id=user.customer_id,
                    city__taluka__district__state_id=user.state_id,
                )
            elif hierarchy == "ZONAL" and user.zone_id:
                qs = qs.filter(
                    customer_id=user.customer_id,
                    division__region__circle__zone_id=user.zone_id,
                )
            elif user.branch_id:
                qs = qs.filter(pk=user.branch_id)
            else:
                return Branch.objects.none()
        elif user.role == Role.ENGINEER:
            qs = qs.filter(pk=user.branch_id)
        else:
            return Branch.objects.none()

        customer_id = self.request.query_params.get("customer")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs.order_by("name")


class SiteListView(generics.ListCreateAPIView):
    serializer_class = SiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        qs = Site.objects.select_related(
            "branch", "branch__customer", "floor",
        ).prefetch_related("users")

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(branch__customer__organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = qs.filter(branch__customer_id=user.customer_id)
        elif user.role == Role.BR_ADMIN:
            hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
            if hierarchy == "GEOGRAPHICAL" and user.state_id:
                qs = qs.filter(
                    branch__customer_id=user.customer_id,
                    branch__city__taluka__district__state_id=user.state_id,
                )
            elif hierarchy == "ZONAL" and user.zone_id:
                qs = qs.filter(
                    branch__customer_id=user.customer_id,
                    branch__division__region__circle__zone_id=user.zone_id,
                )
            elif user.branch_id:
                qs = qs.filter(branch_id=user.branch_id)
            else:
                return Site.objects.none()
        elif user.role == Role.ENGINEER:
            qs = qs.filter(pk=user.site_id)
        else:
            return Site.objects.none()

        params = self.request.query_params
        customer_id = params.get("customer")
        branch_id   = params.get("branch")
        is_active   = params.get("is_active")

        if customer_id:
            try:
                qs = qs.filter(branch__customer_id=int(customer_id))
            except (ValueError, TypeError):
                return Site.objects.none()

        if branch_id:
            qs = qs.filter(branch_id=branch_id)

        if is_active is not None:
            qs = qs.filter(is_active=str(is_active).lower() in ("1", "true", "yes"))

        return qs.order_by("name")

    def perform_create(self, serializer):
        user = self.request.user
        branch = serializer.validated_data["branch"]

        if user.role == Role.CUSTOMER and branch.customer_id != user.customer_id:
            raise DRFValidationError({"branch": "You can only create a site under your customer."})
        if user.role == Role.BR_ADMIN and branch.id != user.branch_id:
            raise DRFValidationError({"branch": "You can only create a site under your branch."})
        if user.role == Role.ENGINEER:
            raise DRFValidationError("Engineers cannot create sites.")
        if user.role == Role.ORG_SUPER_ADMIN:
            if branch.customer.organization_id != user.organization_id:
                raise DRFValidationError({"branch": "This branch is outside your organization."})

        serializer.save()
        site = serializer.instance
        try:
            customer = branch.customer
            if not customer.tpt_customer_id:
                sync_customer(customer)
            sync_site(site)
        except ThreeTPError as exc:
            Site.objects.filter(pk=site.pk).update(
                tpt_sync_status="FAILED",
                tpt_sync_error=str(exc),
            )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def site_assignment(request, pk):
    try:
        site = (
            Site.objects
            .select_related(
                "branch", "branch__customer",
                "branch__customer__organization", "floor",
            )
            .prefetch_related("users")
            .get(pk=pk)
        )
    except Site.DoesNotExist:
        return Response(
            {"status": "error", "message": "Site not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    user = request.user
    allowed = False
    if user.role == Role.ORG_SUPER_ADMIN:
        allowed = site.branch.customer.organization_id == user.organization_id
    elif user.role == Role.CUSTOMER:
        allowed = site.branch.customer_id == user.customer_id
    elif user.role == Role.BR_ADMIN:
        hierarchy = getattr(user.customer, "hierarchy_type", None) if user.customer_id else None
        if hierarchy == "GEOGRAPHICAL" and user.state_id:
            allowed = (
                site.branch.customer_id == user.customer_id
                and site.branch.city and site.branch.city.taluka
                and site.branch.city.taluka.district
                and site.branch.city.taluka.district.state_id == user.state_id
            )
        elif hierarchy == "ZONAL" and user.zone_id:
            allowed = (
                site.branch.customer_id == user.customer_id
                and site.branch.division
                and site.branch.division.region
                and site.branch.division.region.circle
                and site.branch.division.region.circle.zone_id == user.zone_id
            )
        else:
            allowed = site.branch_id == user.branch_id
    elif user.role == Role.ENGINEER:
        allowed = site.id == user.site_id

    if not allowed:
        return Response(
            {"status": "error", "message": "You do not have access to this site."},
            status=status.HTTP_403_FORBIDDEN,
        )

    data = SiteSerializer(site, context={"request": request}).data
    return Response({"status": "success", "data": data}, status=status.HTTP_200_OK)


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


class FloorListView(generics.ListAPIView):
    serializer_class = FloorSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Floor.objects.select_related("branch", "branch__customer")

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(branch__customer__organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = qs.filter(branch__customer_id=user.customer_id)
        elif user.role == Role.BR_ADMIN:
            qs = qs.filter(branch_id=user.branch_id)
        elif user.role == Role.ENGINEER:
            qs = qs.filter(branch_id=user.branch_id)
        else:
            return qs.none()

        customer_id = self.request.query_params.get("customer")
        if customer_id:
            qs = qs.filter(branch__customer_id=customer_id)

        branch_id = self.request.query_params.get("branch")
        if branch_id:
            qs = qs.filter(branch_id=branch_id)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

        return qs.order_by("name")


# =====================================================================
# DASHBOARD SUMMARY
# =====================================================================
@api_view(["GET"])
def dashboard_summary_view(request):
    user = request.user
    data = {"role": user.role, "scope_name": user.scope_name}

    if user.role == Role.ORG_SUPER_ADMIN:
        data.update({
            "customers": Customer.objects.filter(organization_id=user.organization_id).count(),
            "zones":     Zone.objects.filter(customer__organization_id=user.organization_id).count(),
            "circles":   Circle.objects.filter(zone__customer__organization_id=user.organization_id).count(),
            "branches":  Branch.objects.filter(customer__organization_id=user.organization_id).count(),
            "sites":     Site.objects.filter(branch__customer__organization_id=user.organization_id).count(),
            "engineers": User.objects.filter(role=Role.ENGINEER, organization_id=user.organization_id).count(),
        })

    elif user.role == Role.CUSTOMER:
        data.update({
            "zones":     Zone.objects.filter(customer_id=user.customer_id).count(),
            "circles":   Circle.objects.filter(zone__customer_id=user.customer_id).count(),
            "branches":  Branch.objects.filter(customer_id=user.customer_id).count(),
            "sites":     Site.objects.filter(branch__customer_id=user.customer_id).count(),
            "engineers": User.objects.filter(role=Role.ENGINEER, customer_id=user.customer_id).count(),
        })

    elif user.role == Role.BR_ADMIN:
        data.update({
            "sites":     Site.objects.filter(branch_id=user.branch_id).count(),
            "engineers": User.objects.filter(role=Role.ENGINEER, branch_id=user.branch_id).count(),
        })

    elif user.role == Role.ENGINEER:
        data.update({"my_sites": Site.objects.filter(pk=user.site_id).count()})

    return Response(data)


# =====================================================================
# LOCATION LIST / DETAIL
# =====================================================================
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
        "circles": [serialize_circle(c) for c in state.circles.all()],
    }


def serialize_zone(zone):
    return {
        "id": zone.id,
        "zone_id": zone.zone_code,
        "zone_code": zone.zone_code,
        "zone_name": zone.zone_name,
        "states": [serialize_state(s) for s in zone.states.all()],
    }


@api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
def location_detail(request, location_type, location_id):
    if request.method in ("PUT", "PATCH", "DELETE") and request.user.role not in (
        Role.ORG_SUPER_ADMIN, Role.CUSTOMER,
    ):
        return JsonResponse(
            {"success": False, "message": "You are not allowed to modify locations."},
            status=403,
        )

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
                    {"success": False, "message": "Invalid location type"}, status=400,
                )
            obj.delete()
            return JsonResponse(
                {"success": True,
                 "message": f"{location_type.title()} deleted successfully"},
                status=200,
            )
        except (LocationZone.DoesNotExist, LocationState.DoesNotExist, LocationCircle.DoesNotExist):
            return JsonResponse({"success": False, "message": "Location not found"}, status=404)

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
                    {"success": False, "message": "Invalid location type"}, status=400,
                )

            obj.save()
            return JsonResponse(
                {"success": True,
                 "message": f"{location_type.title()} updated successfully"},
                status=200,
            )
        except (LocationZone.DoesNotExist, LocationState.DoesNotExist, LocationCircle.DoesNotExist):
            return JsonResponse({"success": False, "message": "Location not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)

    return JsonResponse({"success": False, "message": "Method not allowed"}, status=405)


@api_view(["GET"])
def device(request):
    return Response("ACCreation page")


# =====================================================================
# BRANCH ASSIGNMENTS / OWNERSHIP
# =====================================================================
def _serialize_user_short(u):
    return {
        "id":    str(u.id),
        "name":  getattr(u, "name", "") or getattr(u, "email", ""),
        "email": getattr(u, "email", ""),
        "phone": getattr(u, "phone", "") or "",
        "role":  getattr(u, "role", ""),
    }


@api_view(["GET"])
def branch_assignments(request):
    branch_id = (request.GET.get("branch_id") or "").strip()
    hierarchy = (request.GET.get("hierarchy_type") or "").strip().upper()

    if not branch_id:
        return JsonResponse({"status": "error", "message": "branch_id is required"}, status=400)

    idx = ownership.build_branch_index()
    candidates = [
        (h, n) for (h, bid), n in idx.items()
        if bid == branch_id and (not hierarchy or h == hierarchy)
    ]
    if not candidates:
        return JsonResponse({
            "status": "success",
            "message": "Site not found in the location tree.",
            "data": {"customer": None, "admins": [], "engineers": [], "assigned": False},
        })

    h, node = candidates[0]
    if not ownership.can_see_branch(request.user, node):
        return JsonResponse(
            {"status": "error", "message": "You do not have access to this site."},
            status=403,
        )

    info = ownership.OwnerLookup.for_nodes([node]).describe(node)
    return JsonResponse({
        "status": "success",
        "data": {
            "branch": {"id": node.get("branch_id"),
                       "name": node.get("branch_name", ""),
                       "hierarchy_type": h},
            "customer": info["customer"],
            "admins": info["admins"],
            "engineers": info["engineers"],
            "assigned": bool(info["customer"]),
        },
    })


@api_view(["POST"])
def branch_ownership(request):
    body = request.data
    hierarchy = str(body.get("hierarchy_type", "")).strip().upper()
    branch_id = str(body.get("branch_id", "")).strip()
    if hierarchy not in ("GEOGRAPHICAL", "ZONAL") or not branch_id:
        return JsonResponse(
            {"status": "error", "message": "hierarchy_type and branch_id are required"}, status=400,
        )

    location_file = ownership.tree_file(hierarchy)
    tree = load_location_tree(location_file)
    node = next((n for n, _ in iter_branches(tree, hierarchy)
                 if n.get("branch_id") == branch_id), None)
    if node is None:
        return JsonResponse({"status": "error", "message": "Site not found."}, status=404)

    try:
        customer, admin_ids, engineer_ids = ownership.validate_ownership(
            request.user, hierarchy, node,
            body.get("customer_id"), body.get("admin_ids"), body.get("engineer_ids"),
        )
    except ownership.OwnershipError as exc:
        return JsonResponse({"status": "error", "message": str(exc)}, status=exc.status)

    ownership.set_node_owner(node, customer.pk, admin_ids, engineer_ids)
    save_location_tree(tree, location_file)

    info = ownership.OwnerLookup.for_nodes([node]).describe(node)
    return JsonResponse({"status": "success", "data": {"branch_id": branch_id, **info}})


@api_view(["GET"])
def unassigned_devices(request):
    if request.user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER, Role.BR_ADMIN):
        return JsonResponse({"status": "success", "count": 0, "data": []})
    try:
        known = telemetry._devices()
    except Exception:
        known = []
    assigned = set(build_device_location_map().keys())
    data = [
        {"ac_id": d.get("ac_id"), "device_name": d.get("device_name") or d.get("ac_id")}
        for d in known if d.get("ac_id") and d.get("ac_id") not in assigned
    ]
    return JsonResponse({"status": "success", "count": len(data), "data": data})


@api_view(["GET"])
def treands(request):
    return Response("Treands page")


# =====================================================================
# LOCATIONS API  (create + read, with ownership stamping)
# =====================================================================
@api_view(["GET", "POST"])
def locations(request):
    user = request.user

    if request.method == "POST":
        if user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER):
            return JsonResponse(
                {"success": False, "message": "You are not allowed to create locations."},
                status=403,
            )

        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON body"}, status=400)
        hierarchy = str(body.get("hierarchy_type", "")).strip().upper()

        if user.role == Role.CUSTOMER:
            if not user.customer_id:
                return JsonResponse({"success": False, "message": "Your account has no customer."},
                                    status=403)
            ctype = getattr(user.customer, "hierarchy_type", None)
            if ctype and hierarchy and ctype != hierarchy:
                return JsonResponse(
                    {"success": False,
                     "message": f"Your account uses the {ctype.title()} hierarchy."},
                    status=403,
                )
            if hierarchy in ("GEOGRAPHICAL", "ZONAL"):
                existing = ownership.find_branch_by_path(
                    load_location_tree(ownership.tree_file(hierarchy)), hierarchy, body)
                if existing is not None and not ownership.can_see_branch(user, existing) \
                        and existing.get("customer_id") not in (None, user.customer_id):
                    return JsonResponse(
                        {"success": False, "message": "This site belongs to another customer."},
                        status=403,
                    )

    response = _locations_impl(request)

    if request.method == "POST" and response.status_code == 201:
        try:
            _stamp_new_branch(user, body, response)
        except Exception:
            pass
    return response


def _stamp_new_branch(user, body, response):
    hierarchy = str(body.get("hierarchy_type", "")).strip().upper()
    branch_id = (json.loads(response.content).get("data") or {}).get("branch_id")
    if not branch_id:
        return

    location_file = ownership.tree_file(hierarchy)
    tree = load_location_tree(location_file)
    node = next((n for n, _ in iter_branches(tree, hierarchy)
                 if n.get("branch_id") == branch_id), None)
    if node is None:
        return

    if user.role == Role.CUSTOMER:
        if node.get("customer_id") in (None, user.customer_id):
            ownership.set_node_owner(
                node, user.customer_id,
                ownership.node_owner(node)["admin_ids"],
                ownership.node_owner(node)["engineer_ids"],
            )
    elif body.get("customer_id"):
        try:
            customer, admin_ids, engineer_ids = ownership.validate_ownership(
                user, hierarchy, node, body.get("customer_id"),
                body.get("admin_ids"), body.get("engineer_ids"))
        except ownership.OwnershipError:
            return
        ownership.set_node_owner(node, customer.pk, admin_ids, engineer_ids)
    else:
        return
    save_location_tree(tree, location_file)


# =====================================================================
# SAVED DASHBOARD PREFERENCES
# =====================================================================
@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_preferences(request):
    user = request.user

    if request.method == "GET":
        queryset = DashboardPreference.objects.filter(user=user)
        return Response(
            DashboardPreferenceSerializer(queryset, many=True).data,
            status=status.HTTP_200_OK,
        )

    serializer = DashboardPreferenceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    name = serializer.validated_data.get("name") or "My Dashboard"
    customer = user.customer if user.customer_id else None

    if serializer.validated_data.get("is_default"):
        DashboardPreference.objects.filter(user=user, is_default=True).update(is_default=False)

    dashboard = DashboardPreference.objects.create(
        user=user,
        customer=customer,
        name=name,
        main_filters=serializer.validated_data.get("main_filters", {}),
        card_filters=serializer.validated_data.get("card_filters", {}),
        visible_widgets=serializer.validated_data.get("visible_widgets", {}),
        is_default=serializer.validated_data.get("is_default", False),
    )

    return Response(
        DashboardPreferenceSerializer(dashboard).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_preference_detail(request, pk):
    try:
        dashboard = DashboardPreference.objects.get(pk=pk, user=request.user)
    except DashboardPreference.DoesNotExist:
        return Response(
            {"detail": "Dashboard not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        return Response(
            DashboardPreferenceSerializer(dashboard).data,
            status=status.HTTP_200_OK,
        )

    if request.method == "DELETE":
        dashboard.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = DashboardPreferenceSerializer(
        dashboard, data=request.data, partial=True
    )
    serializer.is_valid(raise_exception=True)

    if serializer.validated_data.get("is_default") is True:
        DashboardPreference.objects.filter(
            user=request.user
        ).exclude(pk=dashboard.pk).update(is_default=False)

    serializer.save(customer=request.user.customer if request.user.customer_id else None)

    return Response(
        DashboardPreferenceSerializer(dashboard).data,
        status=status.HTTP_200_OK,
    )