# from django.shortcuts import render

# import json
# import os

# from django.conf import settings
# from django.http import JsonResponse
# from rest_framework.response import Response
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS

# from rest_framework.authtoken.models import Token
# from django.contrib.auth import login as django_login, logout as django_logout
# from django.utils import timezone

# from .models import (
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
#     LoginAudit,
#     Role,
# )

# from .serializers import (
#     AdminSerializer, FloorSerializer, LoginSerializer, UserSerializer,
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
#                         "location_type": "FLOOR",
#                     }

#         for site in branch.get("sites", []):

#             site_id = site.get("site_id")

#             if site_id:
#                 index[site_id] = {
#                     **context,
#                     "site_id": site_id,
#                     "device_name": site.get("device_name", ""),
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
#                         "location_type": "FLOOR",
#                     }

#         for site in branch.get("sites", []):

#             site_id = site.get("site_id")

#             if site_id:
#                 index[site_id] = {
#                     **context,
#                     "site_id": site_id,
#                     "device_name": site.get("device_name", ""),
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

# # ... your existing BASE_DATA_DIR / *_FILE constants ...
# # ... your existing load_location_tree / save_location_tree ...
# # ... your existing iter_branches / find_location_target / remove_site_from_tree ...
# # ... your existing build_device_location_map / save_device_location_map ...
# # ... your existing get_ac_device_name ...


# def _flatten_device(mapping):
#     """
#     Collapse the nested `geographical` / `zonal` blocks (as stored in the
#     seed file) into a single flat dict with the fields the UI reads.
#     If the mapping is already flat (written by this POST handler),
#     pass it through unchanged.
#     """
#     flat = {
#         "ac_id":          mapping.get("ac_id", ""),
#         "site_id":        mapping.get("site_id", ""),
#         "device_name":    mapping.get("device_name", ""),
#         "status":         mapping.get("status", "OFF"),
#         "location_type":  mapping.get("location_type", ""),
#         "hierarchy_type": (mapping.get("hierarchy_type") or "").upper(),
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


# def _devices_impl(request):
#     device_map = build_device_location_map()
#     if request.method == "GET":
#         result = []
#         for ac_id, mapping in device_map.items():
#             if not isinstance(mapping, dict):
#                 continue
#             flat = _flatten_device(mapping)
#             flat["ac_id"] = ac_id
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

#     ac_id       = str(body.get("ac_id", "")).strip()
#     hierarchy   = str(body.get("hierarchy_type", "")).strip().upper()
#     branch_id   = str(body.get("branch_id", "")).strip()
#     floor_id    = str(body.get("floor_id", "")).strip()
#     device_name = str(body.get("device_name", "")).strip()
#     status_val  = str(body.get("status", "OFF")).strip().upper()
#     customer_id = str(body.get("customer_id", "")).strip()

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

#     if not customer_id:
#         return JsonResponse(
#             {"status": "error", "message": "customer_id is required"},
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

#     old_mapping = device_map.get(ac_id, {})
#     old_site_id = old_mapping.get("site_id") or ac_id
#     remove_site_from_tree(tree, old_site_id)
#     if old_site_id != ac_id:
#         remove_site_from_tree(tree, ac_id)

#     site = {
#         "site_id":     ac_id,
#         "device_name": device_name,
#         "status":      status_val,
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

#         "customer_id":    customer_id,            # ← from step earlier

#         "created_by_id":    created_by_id,        # ← new
#         "created_by_name":  created_by_name,
#         "created_by_email": created_by_email,
#         "created_by_role":  created_by_role,

#         "branch_id":      branch.get("branch_id", ""),
#         "branch_name":    branch.get("branch_name", ""),
#         "floor_id":       assigned_floor_id,
#         "floor_name":     assigned_floor_name,
#     }
#     mapping.update(context)

#     device_map[ac_id] = mapping
#     save_device_location_map(device_map)

#     return JsonResponse(
#         {
#             "status":  "success",
#             "message": f"{ac_id} assigned successfully",
#             "data":    mapping,
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

# @api_view(["GET", "POST"])
# @permission_classes([ReadOnlyOrAuthenticated])
# def locations(request):
#     if request.method == "GET":

#         hierarchy = request.GET.get("hierarchy", "").strip().upper()

#         try:
#             if hierarchy == "GEOGRAPHICAL":
#                 data = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)
#                 return JsonResponse(
#                     {
#                         "success": True,
#                         "hierarchy_type": "GEOGRAPHICAL",
#                         "data": data,
#                     },
#                     safe=True,
#                 )

#             if hierarchy == "ZONAL":
#                 data = load_location_tree(ZONAL_LOCATION_FILE)
#                 return JsonResponse(
#                     {
#                         "success": True,
#                         "hierarchy_type": "ZONAL",
#                         "data": data,
#                     },
#                     safe=True,
#                 )

#             geographical_data = load_location_tree(GEOGRAPHICAL_LOCATION_FILE)
#             zonal_data = load_location_tree(ZONAL_LOCATION_FILE)

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


# # ============================================================
# # FILTERING & ENRICHMENT HELPERS
# # ============================================================

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

#     # --- Nested shape (seeded data) --------------------------------
#     if "geographical" in mapping or "zonal" in mapping:
#         geo = mapping.get("geographical") or {}
#         zon = mapping.get("zonal") or {}

#         hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()
#         if not hierarchy_type:
#             # Both blocks are usually present in the seeded data, so
#             # don't assume one over the other for filtering purposes.
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
# @permission_classes([AllowAny])
# def ac_data_with_location(request):
#     try:
#         if not os.path.exists(DATA_FILE):
#             return JsonResponse(
#                 {"status": "error", "message": "ac_data.json file not found"},
#                 status=404,
#             )

#         with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
#             data = json.load(file)

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
# @permission_classes([AllowAny])
# def ac_data(request):
#     try:
#         if not os.path.exists(DATA_FILE):
#             return JsonResponse(
#                 {"status": "error", "message": "ac_data.json file not found"},
#                 status=404,
#             )

#         with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
#             data = json.load(file)

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
# def latest_ac_data(request):
#     try:
#         if not os.path.exists(DATA_FILE):
#             return JsonResponse(
#                 {"status": "error", "message": "ac_data.json file not found"},
#                 status=404,
#             )

#         with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
#             data = json.load(file)

#         if not data:
#             return JsonResponse({"status": "success", "data": None})

#         return JsonResponse({"status": "success", "data": data[-1]})

#     except Exception as e:
#         return JsonResponse(
#             {"status": "error", "message": str(e)},
#             status=500,
#         )


# # ============================================================
# # AUTH VIEWS
# # ============================================================

# def get_client_ip(request):
#     xff = request.META.get("HTTP_X_FORWARDED_FOR")
#     if xff:
#         return xff.split(",")[0].strip()
#     return request.META.get("REMOTE_ADDR")


# def log_attempt(request, success, user=None, email="", role="", reason=""):
#     LoginAudit.objects.create(
#         user=user,
#         email_attempted=email,
#         role_attempted=role,
#         ip_address=get_client_ip(request),
#         user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
#         success=success,
#         reason=reason,
#     )


# @api_view(["POST"])
# @permission_classes([permissions.AllowAny])
# def login_view(request):
#     """
#     POST /api/auth/login/
#     Body: { "email": "...", "password": "...", "role": "ORG_SUPER_ADMIN" }
#     """
#     serializer = LoginSerializer(data=request.data, context={"request": request})

#     if not serializer.is_valid():
#         log_attempt(
#             request,
#             success=False,
#             email=request.data.get("email", ""),
#             role=request.data.get("role", ""),
#             reason=str(serializer.errors),
#         )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     user = serializer.validated_data["user"]

#     user.last_login = timezone.now()
#     user.last_login_ip = get_client_ip(request)
#     user.save(update_fields=["last_login", "last_login_ip"])

#     django_login(request, user)
#     token, _ = Token.objects.get_or_create(user=user)

#     log_attempt(request, success=True, user=user, email=user.email, role=user.role)

#     return Response(
#         {
#             "token": token.key,
#             "user": UserSerializer(user).data,
#             "redirect": _dashboard_path(user.role),
#         },
#         status=status.HTTP_200_OK,
#     )


# def _dashboard_path(role):
#     return {
#         Role.ORG_SUPER_ADMIN: "/org/dashboard",
#         Role.CUSTOMER: "/customer/dashboard",
#         Role.BR_ADMIN: "/admin/dashboard",
#         Role.ENGINEER: "/engineer/dashboard",
#     }.get(role, "/login")


# @api_view(["POST"])
# def logout_view(request):
#     """POST /api/auth/logout/"""
#     if request.user.is_authenticated:
#         Token.objects.filter(user=request.user).delete()
#         django_logout(request)
#     return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


# @api_view(["GET"])
# def me_view(request):
#     """GET /api/auth/me/ — returns current user's profile & scope."""
#     return Response(UserSerializer(request.user).data)


# # ============================================================
# # SCOPED QUERYSET HELPER
# # ============================================================

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
#         serializer.save(organization=self.request.user.organization)


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
#             qs = base.filter(branch_id=user.branch_id)
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
#         - Customer login  -> the new user is attached to THAT customer
#                              automatically (client input is ignored).
#         - Super admin     -> uses the customer sent by the client (validated
#                              by the serializer to be inside their org).
#         - Engineers       -> may carry `parent` (a Branch Admin id). The admin
#                              must belong to the same customer, and the engineer
#                              inherits that admin's customer / zone / branch.
#         """
#         user = self.request.user
#         role = serializer.validated_data.get("role")
#         extra = {"organization": user.organization}

#         if user.role == Role.CUSTOMER:
#             extra["customer"] = user.customer

#         if role == Role.ENGINEER:
#             customer = extra.get("customer") or serializer.validated_data.get("customer")
#             parent_id = self.request.data.get("parent")

#             if parent_id:
#                 try:
#                     parent = self.get_queryset().filter(
#                         pk=parent_id, role=Role.BR_ADMIN
#                     ).first()
#                 except (ValueError, DjangoValidationError):
#                     parent = None
#                 if parent is None:
#                     raise DRFValidationError(
#                         {"parent": "Selected admin was not found under this customer."}
#                     )
#                 if customer and parent.customer_id != customer.pk:
#                     raise DRFValidationError(
#                         {"parent": "Selected admin does not belong to the selected customer."}
#                     )
#                 extra.update(
#                     customer=parent.customer,
#                     zone=parent.zone,
#                     circle=parent.circle,
#                     state=parent.state,
#                     district=parent.district,
#                     branch=parent.branch,
#                 )
#             elif not customer:
#                 raise DRFValidationError({"customer": "Customer is required for an engineer."})

#         serializer.save(**extra)

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


# # class BranchListView(generics.ListAPIView):
# #     serializer_class = BranchSerializer

# #     def get_queryset(self):
# #         user = self.request.user
# #         if user.role == Role.ORG_SUPER_ADMIN:
# #             return Branch.objects.filter(customer__organization_id=user.organization_id)
# #         if user.role == Role.CUSTOMER:
# #             return Branch.objects.filter(customer_id=user.customer_id)
# #         if user.role == Role.BR_ADMIN:
# #             return Branch.objects.filter(pk=user.branch_id)
# #         if user.role == Role.ENGINEER:
# #             return Branch.objects.filter(pk=user.branch_id)
# #         return Branch.objects.none()

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
#         elif user.role in (Role.BR_ADMIN, Role.ENGINEER):
#             qs = qs.filter(pk=user.branch_id)
#         else:
#             return Branch.objects.none()

#         customer_id = self.request.query_params.get("customer")
#         if customer_id:
#             qs = qs.filter(customer_id=customer_id)

#         return qs.order_by("name")

# class SiteListView(generics.ListAPIView):
#     serializer_class = SiteSerializer

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == Role.ORG_SUPER_ADMIN:
#             qs = Site.objects.filter(branch__customer__organization_id=user.organization_id)
#         elif user.role == Role.CUSTOMER:
#             qs = Site.objects.filter(branch__customer_id=user.customer_id)
#         elif user.role == Role.BR_ADMIN:
#             qs = Site.objects.filter(branch_id=user.branch_id)
#         elif user.role == Role.ENGINEER:
#             qs = Site.objects.filter(pk=user.site_id)
#         else:
#             return Site.objects.none()

#         # Optional narrowing, used by the Engineers page:
#         #   /sites/?customer=<id>&branch=<uuid>
#         params = self.request.query_params
#         try:
#             if params.get("customer"):
#                 qs = qs.filter(branch__customer_id=int(params["customer"]))
#             if params.get("branch"):
#                 qs = qs.filter(branch_id=params["branch"])
#         except (ValueError, DjangoValidationError):
#             return Site.objects.none()

#         return qs.select_related("branch", "floor")


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


# @csrf_exempt
# def location_detail(request, location_type, location_id):

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

#         # ---------------------------------------------
#         # USER SCOPE
#         # ---------------------------------------------

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

#         # ---------------------------------------------
#         # OPTIONAL CUSTOMER FILTER
#         # ---------------------------------------------

#         customer_id = self.request.query_params.get(
#             "customer"
#         )

#         if customer_id:
#             qs = qs.filter(
#                 branch__customer_id=customer_id
#             )

#         # ---------------------------------------------
#         # OPTIONAL BRANCH FILTER
#         # ---------------------------------------------

#         branch_id = self.request.query_params.get(
#             "branch"
#         )

#         if branch_id:
#             qs = qs.filter(
#                 branch_id=branch_id
#             )

#         # ---------------------------------------------
#         # OPTIONAL ACTIVE FILTER
#         # ---------------------------------------------

#         is_active = self.request.query_params.get(
#             "is_active"
#         )

#         if is_active is not None:
#             qs = qs.filter(
#                 is_active=is_active.lower()
#                 in ("1", "true", "yes")
#             )

#         return qs.order_by("name")



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
    LoginAudit,
    Role,
    DashboardPreference,
)

from .serializers import (
    AdminSerializer, CitySerializer, DivisionSerializer, FloorSerializer, LoginSerializer, RegionSerializer, TalukaSerializer, UserSerializer,
    OrganizationSerializer, CustomerSerializer, DashboardPreferenceSerializer, ZoneSerializer,
    CircleSerializer, StateSerializer, DistrictSerializer, BranchSerializer, SiteSerializer,
)

from .permissions import CustomerScopeMixin, IsOrgSuperAdmin
from rest_framework import status, generics, permissions, filters

from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

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
                        "capacity_ton": site.get("capacity_ton", ""),
                        "installation_date": site.get("installation_date", ""),
                        "last_maintenance_date": site.get("last_maintenance_date", ""),
                        "location_type": "FLOOR",
                    }

        for site in branch.get("sites", []):

            site_id = site.get("site_id")

            if site_id:
                index[site_id] = {
                    **context,
                    "site_id": site_id,
                    "device_name": site.get("device_name", ""),
                    "capacity_ton": site.get("capacity_ton", ""),
                    "installation_date": site.get("installation_date", ""),
                    "last_maintenance_date": site.get("last_maintenance_date", ""),
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
                        "capacity_ton": site.get("capacity_ton", ""),
                        "installation_date": site.get("installation_date", ""),
                        "last_maintenance_date": site.get("last_maintenance_date", ""),
                        "location_type": "FLOOR",
                    }

        for site in branch.get("sites", []):

            site_id = site.get("site_id")

            if site_id:
                index[site_id] = {
                    **context,
                    "site_id": site_id,
                    "device_name": site.get("device_name", ""),
                    "capacity_ton": site.get("capacity_ton", ""),
                    "installation_date": site.get("installation_date", ""),
                    "last_maintenance_date": site.get("last_maintenance_date", ""),
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



# @api_view(["GET", "POST"])
# def devices(request):
    device_map = build_device_location_map()
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

    if not site_id:
        site_id = ac_id

    if not device_name:
        device_name = get_ac_device_name(ac_id)

    if status_value not in {"ON", "OFF"}:
        status_value = "OFF"

    if hierarchy_type == "GEOGRAPHICAL":
        location_file = GEOGRAPHICAL_LOCATION_FILE
    else:
        location_file = ZONAL_LOCATION_FILE

    tree = load_location_tree(location_file)

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


# @api_view(["GET", "POST"])
# def devices(request):
#     device_map = build_device_location_map()

#     # ========================================================
#     # GET — return every device, enriched with customer name
#     # ========================================================
#     if request.method == "GET":
#         customer_ids = {
#             m.get("customer_id")
#             for m in device_map.values()
#             if m.get("customer_id")
#         }
#         customer_names = dict(
#             Customer.objects
#             .filter(id__in=customer_ids)
#             .values_list("id", "company")
#         )

#         result = []
#         for ac_id, m in device_map.items():
#             result.append({
#                 **m,
#                 "customer_name": customer_names.get(m.get("customer_id"), ""),
#             })

#         return JsonResponse({
#             "status": "success",
#             "count": len(result),
#             "data": result,
#         })

#     # ========================================================
#     # POST — create / update a device, assign to DB branch/floor
#     # ========================================================
#     try:
#         body = json.loads(request.body or "{}")
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Invalid JSON body"},
#             status=400,
#         )

#     ac_id       = str(body.get("ac_id", "")).strip()
#     branch_id   = str(body.get("branch_id", "")).strip()
#     floor_id    = str(body.get("floor_id", "")).strip()
#     device_name = str(body.get("device_name", "")).strip()
#     status_val  = str(body.get("status", "OFF")).strip().upper()

#     # ---------- validation ----------
#     if not ac_id:
#         return JsonResponse(
#             {"status": "error", "message": "ac_id is required"}, status=400
#         )
#     if not branch_id:
#         return JsonResponse(
#             {"status": "error", "message": "branch_id is required"}, status=400
#         )

#     # ---------- look up the branch in the DB ----------
#     branch = (
#         Branch.objects
#         .select_related(
#             "customer",
#             "city__taluka__district__state",
#             "division__region__circle__zone",
#         )
#         .filter(id=branch_id)
#         .first()
#     )

#     if not branch:
#         return JsonResponse(
#             {"status": "error", "message": "Branch not found"}, status=404
#         )

#     # ---------- look up the floor (optional) ----------
#     floor = None
#     if floor_id:
#         floor = Floor.objects.filter(id=floor_id, branch=branch).first()
#         if not floor:
#             return JsonResponse(
#                 {"status": "error", "message": "Floor not found under this branch"},
#                 status=404,
#             )

#     # ---------- build ancestor context from the DB ----------
#     if branch.division_id:                       # ZONAL
#         zone     = branch.division.region.circle.zone
#         circle   = branch.division.region.circle
#         region   = branch.division.region
#         division = branch.division
#         hierarchy_type = "ZONAL"
#         context = {
#             "zone_id":     str(zone.id),     "zone_name":     zone.name,
#             "circle_id":   str(circle.id),   "circle_name":   circle.name,
#             "region_id":   str(region.id),   "region_name":   region.name,
#             "division_id": str(division.id), "division_name": division.name,
#         }

#     elif branch.city_id:                         # GEOGRAPHICAL
#         city     = branch.city
#         taluka   = city.taluka
#         district = taluka.district
#         state    = district.state
#         hierarchy_type = "GEOGRAPHICAL"
#         context = {
#             "state_id":    str(state.id),    "state_name":    state.name,
#             "district_id": str(district.id), "district_name": district.name,
#             "taluka_id":   str(taluka.id),   "taluka_name":   taluka.name,
#             "city_id":     str(city.id),     "city_name":     city.name,
#         }

#     else:
#         return JsonResponse(
#             {"status": "error", "message": "Branch has no parent hierarchy set"},
#             status=400,
#         )

#     # ---------- build the mapping ----------
#     mapping = {
#         "ac_id":          ac_id,
#         "site_id":        ac_id,
#         "device_name":    device_name or ac_id,
#         "status":         status_val if status_val in ("ON", "OFF") else "OFF",
#         "location_type":  "FLOOR" if floor else "DIRECT_BRANCH",
#         "hierarchy_type": hierarchy_type,
#         "customer_id":    str(branch.customer_id),
#         "branch_id":      str(branch.id),
#         "branch_name":    branch.name,
#         "floor_id":       str(floor.id) if floor else "",
#         "floor_name":     floor.name if floor else "",
#         **context,
#     }

#     device_map[ac_id] = mapping
#     save_device_location_map(device_map)

#     return JsonResponse(
#         {
#             "status":  "success",
#             "message": f"{ac_id} assigned successfully",
#             "data":    mapping,
#         },
#         status=201,
#     )


import json
import os
import traceback

from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view

def _flatten_device(mapping):
    flat = {
        "ac_id":          mapping.get("ac_id", ""),
        "site_id":        mapping.get("site_id", ""),
        "device_name":    mapping.get("device_name", ""),
        "status":         mapping.get("status", "OFF"),
        "location_type":  mapping.get("location_type", ""),
        "hierarchy_type": (mapping.get("hierarchy_type") or "").upper(),
        "capacity_ton": mapping.get("capacity_ton", ""),
        "installation_date": mapping.get("installation_date", ""),
        "last_maintenance_date": mapping.get("last_maintenance_date", ""),
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
        block = mapping   # already flat

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


from . import ownership


def nodes_for_mapping(mapping, branch_index):
    """Tree branch node(s) an AC mapping points at (legacy maps may hit both trees)."""
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
    mapping = device_map.get(ac_id)
    if not mapping:
        return False          # not assigned to any site yet -> only the Super Admin sees it
    return any(ownership.can_see_branch(user, n) for n in nodes_for_mapping(mapping, branch_index))


def scope_ac_records(records, user):
    if user.role == Role.ORG_SUPER_ADMIN:
        return records
    device_map = build_device_location_map()
    idx = ownership.build_branch_index()
    return [r for r in records if user_can_see_ac(user, r.get("ac_id", ""), device_map, idx)]


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
            # ownership is resolved live from the site the AC sits in
            owner_node = next((n for n in nodes if n.get("customer_id")), nodes[0] if nodes else None)
            if owner_node is not None:
                info = lookup.describe(owner_node)
                flat["customer_id"] = owner_node.get("customer_id") or flat.get("customer_id") or ""
                flat["customer_name"] = info["customer"]["company"] if info["customer"] else ""
                flat["admins"] = info["admins"]
                flat["engineers"] = info["engineers"]
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

    ac_id       = str(body.get("ac_id", "")).strip()
    hierarchy   = str(body.get("hierarchy_type", "")).strip().upper()
    branch_id   = str(body.get("branch_id", "")).strip()
    floor_id    = str(body.get("floor_id", "")).strip()
    device_name = str(body.get("device_name", "")).strip()
    status_val  = str(body.get("status", "OFF")).strip().upper()
    capacity_raw = body.get("capacity_ton", "")
    installation_date = str(body.get("installation_date", "")).strip()
    last_maintenance_date = str(body.get("last_maintenance_date", "")).strip()

    try:
        capacity_ton = float(capacity_raw)
    except (TypeError, ValueError):
        capacity_ton = 0

    acting = getattr(request, "user", None)
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

    # if not customer_id:
    #     return JsonResponse(
    #         {"status": "error", "message": "customer_id is required"},
    #         status=400,
    #     )
    if capacity_ton <= 0:
        return JsonResponse(
            {"status": "error", "message": "capacity_ton must be greater than 0"},
            status=400,
        )
    if not installation_date:
        return JsonResponse(
            {"status": "error", "message": "installation_date is required"},
            status=400,
        )
    if last_maintenance_date and last_maintenance_date < installation_date:
        return JsonResponse(
            {"status": "error", "message": "last_maintenance_date cannot be before installation_date"},
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
            {"status": "error", "message": "Location tree file is malformed"},
            status=500,
        )

    target = find_location_target(
        tree, hierarchy, branch_id=branch_id, floor_id=floor_id,
    )
    if not target:
        return JsonResponse(
            {
                "status": "error",
                "message": "Selected floor/branch was not found in the selected hierarchy",
            },
            status=404,
        )

    branch  = target["branch"]
    floor   = target["floor"]
    context = target["context"]

    # ---- ownership: the AC inherits the customer/admins of the site ----
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
        "site_id":     ac_id,
        "device_name": device_name,
        "status":      status_val,
        "capacity_ton": capacity_ton,
        "installation_date": installation_date,
        "last_maintenance_date": last_maintenance_date,
    }

    if floor is not None:
        if not isinstance(floor.get("sites"), list):
            floor["sites"] = []
        floor["sites"].append(site)

        location_type    = "FLOOR"
        assigned_floor_id   = floor.get("floor_id", "")
        assigned_floor_name = floor.get("floor_name", "")
    else:
        if not isinstance(branch.get("sites"), list):
            branch["sites"] = []
        branch["sites"].append(site)

        location_type    = "DIRECT_BRANCH"
        assigned_floor_id   = ""
        assigned_floor_name = ""
        

    save_location_tree(tree, location_file)

    mapping = {
        "ac_id":          ac_id,
        "site_id":        ac_id,
        "device_name":    device_name,
        "status":         status_val,
        "location_type":  location_type,
        "hierarchy_type": hierarchy,

        "customer_id":    customer_id,            # ← resolved from the site

        "created_by_id":    created_by_id,        # ← new
        "created_by_name":  created_by_name,
        "created_by_email": created_by_email,
        "created_by_role":  created_by_role,

        "branch_id":      branch.get("branch_id", ""),
        "branch_name":    branch.get("branch_name", ""),
        "floor_id":       assigned_floor_id,
        "floor_name":     assigned_floor_name,

        "capacity_ton":            capacity_ton,
        "installation_date":       installation_date,
        "last_maintenance_date":   last_maintenance_date,
    }
    mapping.update(context)

    device_map[ac_id] = mapping
    save_device_location_map(device_map)

    info = ownership.OwnerLookup.for_nodes([branch]).describe(branch)
    response_data = dict(mapping)
    response_data["customer_name"] = info["customer"]["company"] if info["customer"] else ""
    response_data["admins"] = info["admins"]
    response_data["engineers"] = info["engineers"]

    return JsonResponse(
        {
            "status":  "success",
            "message": f"{ac_id} assigned successfully",
            "data":    response_data,
        },
        status=201,
    )

def make_code_id(existing_ids, name, prefix=""):
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

def _scoped_tree(location_file, user):
    """Location tree limited to what `user` may see, with owner details attached."""
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
                    {
                        "success": True,
                        "hierarchy_type": "GEOGRAPHICAL",
                        "data": data,
                    },
                    safe=True,
                )

            if hierarchy == "ZONAL":
                data = _scoped_tree(ZONAL_LOCATION_FILE, request.user)
                return JsonResponse(
                    {
                        "success": True,
                        "hierarchy_type": "ZONAL",
                        "data": data,
                    },
                    safe=True,
                )

            geographical_data = _scoped_tree(GEOGRAPHICAL_LOCATION_FILE, request.user)
            zonal_data = _scoped_tree(ZONAL_LOCATION_FILE, request.user)

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

    if "geographical" in mapping or "zonal" in mapping:
        geo = mapping.get("geographical") or {}
        zon = mapping.get("zonal") or {}

        hierarchy_type = str(mapping.get("hierarchy_type", "")).upper()
        if not hierarchy_type:
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
def ac_data_with_location(request):
    try:
        from . import telemetry
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
def ac_data(request):
    try:
        from . import telemetry
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
def telemetry_status(request):
    from . import telemetry
    return JsonResponse(telemetry.get_status())


@api_view(["GET"])
def latest_ac_data(request):
    try:
        from . import telemetry
        data = scope_ac_records(telemetry.get_records(), request.user)

        if not data:
            return JsonResponse({"status": "success", "data": None})

        return JsonResponse({"status": "success", "data": data[-1]})

    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": str(e)},
            status=500,
        )

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
    if request.user.is_authenticated:
        Token.objects.filter(user=request.user).delete()
        django_logout(request)
    return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


@api_view(["GET"])
def me_view(request):
    return Response(UserSerializer(request.user).data)

def scoped_queryset(model, user, level_map):
    level, scope_id = user.get_scope()
    if level == "ORGANIZATION":
        return model.objects.filter(
            **{f"{level_map['ORGANIZATION']}": user.organization_id}
        )
    if level in level_map and scope_id:
        return model.objects.filter(**{level_map[level]: scope_id})
    return model.objects.none()

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

ADMIN_ROLES = [
    Role.ORG_SUPER_ADMIN,
    Role.CUSTOMER,
    Role.BR_ADMIN,
    Role.ENGINEER,
]

from .permissions import (
    CustomerScopeMixin,
    IsOrgSuperAdmin,
    IsOrgAdminOrCustomerAdmin,
)

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
            qs = base.filter(branch_id=user.branch_id)
        else:
            return base.none()

        qs = qs.filter(role__in=ADMIN_ROLES)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

        return qs

    # def perform_create(self, serializer):
    #     user = self.request.user

    #     if user.role == Role.CUSTOMER:
    #         serializer.save(
    #             organization=user.organization,
    #             customer=user.customer,
    #         )
    #     else:
    #         serializer.save(organization=user.organization)

    def perform_create(self, serializer):
        """
        - Customer login  -> the new user is attached to THAT customer
                             automatically (client input is ignored).
        - Super admin     -> uses the customer sent by the client (validated
                             by the serializer to be inside their org).
        - Engineers       -> may carry `parent` (a Branch Admin id). The admin
                             must belong to the same customer, and the engineer
                             inherits that admin's customer / zone / branch.
        """
        user = self.request.user
        role = serializer.validated_data.get("role")
        extra = {"organization": user.organization}

        if user.role == Role.CUSTOMER:
            extra["customer"] = user.customer

        if role == Role.ENGINEER:
            customer = extra.get("customer") or serializer.validated_data.get("customer")
            parent_id = self.request.data.get("parent")

            if parent_id:
                try:
                    parent = self.get_queryset().filter(
                        pk=parent_id, role=Role.BR_ADMIN
                    ).first()
                except (ValueError, DjangoValidationError):
                    parent = None
                if parent is None:
                    raise DRFValidationError(
                        {"parent": "Selected admin was not found under this customer."}
                    )
                if customer and parent.customer_id != customer.pk:
                    raise DRFValidationError(
                        {"parent": "Selected admin does not belong to the selected customer."}
                    )
                extra.update(
                    customer=parent.customer,
                    zone=parent.zone,
                    circle=parent.circle,
                    state=parent.state,
                    district=parent.district,
                    branch=parent.branch,
                )
            elif not customer:
                raise DRFValidationError({"customer": "Customer is required for an engineer."})

        serializer.save(**extra)

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
            # A customer manages only their Branch Admins and Engineers —
            # never their own account or another customer-level user.
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
    serializer_class = AdminSerializer  # same shape as admins
    permission_classes = [IsOrgSuperAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "phone"]
    ordering_fields = ["name", "email", "date_joined"]
    ordering = ["name"]

    def get_queryset(self):
        user = self.request.user
        base = User.objects.select_related(
            "organization", "customer", "zone", "circle", "state", "district", "branch", "site"
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

    # def perform_create(self, serializer):
    #     user = self.request.user
    #     if user.role == Role.CUSTOMER:
    #         serializer.save(
    #             role=Role.ENGINEER,
    #             organization=user.organization,
    #             customer=user.customer,
    #         )
    #     else:
    #         serializer.save(
    #             role=Role.ENGINEER,
    #             organization=user.organization,
    #         )

    def perform_create(self, serializer):
        user = self.request.user
        if user.customer_id:
            serializer.save(
                organization=user.organization,
                customer=user.customer,
            )
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
            # Geographical chain
            "city", "city__taluka", "city__taluka__district",
            "city__taluka__district__state",
            # Zonal chain
            "division", "division__region",
            "division__region__circle", "division__region__circle__zone",
        )

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(customer__organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = qs.filter(customer_id=user.customer_id)
        elif user.role in (Role.BR_ADMIN, Role.ENGINEER):
            qs = qs.filter(pk=user.branch_id)
        else:
            return Branch.objects.none()

        customer_id = self.request.query_params.get("customer")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        return qs.order_by("name")

class SiteListView(generics.ListAPIView):
    serializer_class = SiteSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ORG_SUPER_ADMIN:
            qs = Site.objects.filter(branch__customer__organization_id=user.organization_id)
        elif user.role == Role.CUSTOMER:
            qs = Site.objects.filter(branch__customer_id=user.customer_id)
        elif user.role == Role.BR_ADMIN:
            qs = Site.objects.filter(branch_id=user.branch_id)
        elif user.role == Role.ENGINEER:
            qs = Site.objects.filter(pk=user.site_id)
        else:
            return Site.objects.none()

        # Optional narrowing, used by the Engineers page:
        #   /sites/?customer=<id>&branch=<uuid>
        params = self.request.query_params
        try:
            if params.get("customer"):
                qs = qs.filter(branch__customer_id=int(params["customer"]))
            if params.get("branch"):
                qs = qs.filter(branch_id=params["branch"])
        except (ValueError, DjangoValidationError):
            return Site.objects.none()

        return qs.select_related("branch", "floor")


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
                customer__organization_id=user.organization_id
            ).count(),
            "sites": Site.objects.filter(
                branch__customer__organization_id=user.organization_id
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
                customer_id=user.customer_id
            ).count(),
            "sites": Site.objects.filter(
                branch__customer_id=user.customer_id
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

def device(request):
    return Response("ACCreation page")

class FloorListView(generics.ListAPIView):
    serializer_class = FloorSerializer

    def get_queryset(self):
        user = self.request.user

        qs = Floor.objects.select_related(
            "branch",
            "branch__customer",
        )

        if user.role == Role.ORG_SUPER_ADMIN:
            qs = qs.filter(
                branch__customer__organization_id=user.organization_id
            )

        elif user.role == Role.CUSTOMER:
            qs = qs.filter(
                branch__customer_id=user.customer_id
            )

        elif user.role == Role.BR_ADMIN:
            qs = qs.filter(
                branch_id=user.branch_id
            )

        elif user.role == Role.ENGINEER:
            qs = qs.filter(
                branch_id=user.branch_id
            )

        else:
            return qs.none()

        customer_id = self.request.query_params.get(
            "customer"
        )

        if customer_id:
            qs = qs.filter(
                branch__customer_id=customer_id
            )

        branch_id = self.request.query_params.get(
            "branch"
        )

        if branch_id:
            qs = qs.filter(
                branch_id=branch_id
            )

        is_active = self.request.query_params.get(
            "is_active"
        )

        if is_active is not None:
            qs = qs.filter(
                is_active=is_active.lower()
                in ("1", "true", "yes")
            )

        return qs.order_by("name")

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
    """
    Customer / admins / engineers that a site (branch) is assigned to.

    GET /branches/assignments/?branch_id=<tree branch id>[&hierarchy_type=GEOGRAPHICAL|ZONAL]
    The ownership stored on the location-tree branch is the source of truth.
    """
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
        return JsonResponse({"status": "error", "message": "You do not have access to this site."}, status=403)

    info = ownership.OwnerLookup.for_nodes([node]).describe(node)
    return JsonResponse({
        "status": "success",
        "data": {
            "branch": {"id": node.get("branch_id"), "name": node.get("branch_name", ""), "hierarchy_type": h},
            "customer": info["customer"],
            "admins": info["admins"],
            "engineers": info["engineers"],
            "assigned": bool(info["customer"]),
        },
    })


@api_view(["POST"])
def branch_ownership(request):
    """
    Assign a site (tree branch) to a customer + its admins / engineers.

    POST /branches/ownership/
      { "hierarchy_type": "GEOGRAPHICAL"|"ZONAL", "branch_id": "AP-B01",
        "customer_id": 1, "admin_ids": ["<uuid>"], "engineer_ids": ["<uuid>"] }

    Super Admin: any customer in the org.  Customer: only their own customer.
    Every AC placed in this site (now or later) follows these owners.
    """
    body = request.data
    hierarchy = str(body.get("hierarchy_type", "")).strip().upper()
    branch_id = str(body.get("branch_id", "")).strip()
    if hierarchy not in ("GEOGRAPHICAL", "ZONAL") or not branch_id:
        return JsonResponse(
            {"status": "error", "message": "hierarchy_type and branch_id are required"}, status=400)

    location_file = ownership.tree_file(hierarchy)
    tree = load_location_tree(location_file)
    node = next((n for n, _ in iter_branches(tree, hierarchy) if n.get("branch_id") == branch_id), None)
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
    """AC devices created by 3TP that have not been placed in a site yet."""
    if request.user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER, Role.BR_ADMIN):
        return JsonResponse({"status": "success", "count": 0, "data": []})
    from . import telemetry
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


def treands(request):
    return Response("Treands page")


@api_view(["GET", "POST"])
def locations(request):
    """
    GET  -> the location tree, limited to the sites the logged-in user may see.
    POST -> create locations; a new/updated branch is stamped with its owners:
              CUSTOMER   -> their own customer
              SUPER ADMIN-> body.customer_id / admin_ids / engineer_ids (optional)
    """
    user = request.user

    if request.method == "POST":
        if user.role not in (Role.ORG_SUPER_ADMIN, Role.CUSTOMER):
            return JsonResponse(
                {"success": False, "message": "You are not allowed to create locations."}, status=403)

        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON body"}, status=400)
        hierarchy = str(body.get("hierarchy_type", "")).strip().upper()

        if user.role == Role.CUSTOMER:
            if not user.customer_id:
                return JsonResponse({"success": False, "message": "Your account has no customer."}, status=403)
            ctype = getattr(user.customer, "hierarchy_type", None)
            if ctype and hierarchy and ctype != hierarchy:
                return JsonResponse(
                    {"success": False,
                     "message": f"Your account uses the {ctype.title()} hierarchy."}, status=403)
            if hierarchy in ("GEOGRAPHICAL", "ZONAL"):
                existing = ownership.find_branch_by_path(
                    load_location_tree(ownership.tree_file(hierarchy)), hierarchy, body)
                if existing is not None and not ownership.can_see_branch(user, existing) \
                        and existing.get("customer_id") not in (None, user.customer_id):
                    return JsonResponse(
                        {"success": False, "message": "This site belongs to another customer."}, status=403)

    response = _locations_impl(request)

    if request.method == "POST" and response.status_code == 201:
        try:
            _stamp_new_branch(user, body, response)
        except Exception:
            pass        # never fail a created location because of owner stamping
    return response


def _stamp_new_branch(user, body, response):
    hierarchy = str(body.get("hierarchy_type", "")).strip().upper()
    branch_id = (json.loads(response.content).get("data") or {}).get("branch_id")
    if not branch_id:
        return

    location_file = ownership.tree_file(hierarchy)
    tree = load_location_tree(location_file)
    node = next((n for n, _ in iter_branches(tree, hierarchy) if n.get("branch_id") == branch_id), None)
    if node is None:
        return

    if user.role == Role.CUSTOMER:
        if node.get("customer_id") in (None, user.customer_id):
            ownership.set_node_owner(
                node, user.customer_id,
                ownership.node_owner(node)["admin_ids"], ownership.node_owner(node)["engineer_ids"])
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


# ============================================================
# SAVED DASHBOARD PREFERENCES
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_preferences(request):
    """
    GET  -> return dashboards belonging to the logged-in user.
    POST -> create a saved dashboard for the logged-in user.

    Only dashboard state is stored. Live AC/3TP telemetry continues to use
    the existing APIs and polling flow.
    """
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

    # Customer users are automatically tied to their customer.
    # Organisation admins may save an organisation-level dashboard.
    customer = user.customer if user.customer_id else None

    if serializer.validated_data.get("is_default"):
        DashboardPreference.objects.filter(
            user=user, is_default=True
        ).update(is_default=False)

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
    """Read/update/delete one saved dashboard owned by the current user."""
    try:
        dashboard = DashboardPreference.objects.get(
            pk=pk, user=request.user
        )
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

    # Do not allow customer ownership to be changed by the frontend.
    serializer.save(customer=request.user.customer if request.user.customer_id else None)

    return Response(
        DashboardPreferenceSerializer(dashboard).data,
        status=status.HTTP_200_OK,
    )
