# import uuid
# from decimal import Decimal, InvalidOperation

# from django.db import transaction, IntegrityError
# from django.db.models import Q
# from django.core.exceptions import ValidationError as DjangoValidationError

# from rest_framework import status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response

# from .models import (
#     Role,
#     Customer,
#     State,
#     District,
#     Taluka,
#     City,
#     Zone,
#     Circle,
#     Region,
#     Division,
#     Branch,
#     Building,
#     Floor,
#     Room,
#     Site,
#     CustomerSiteMapping,
#     zonal_branch_parent_level,
# )
# from .hierarchy_tree_sync import sync_branch_to_tree


# def _error(message, http_status=status.HTTP_400_BAD_REQUEST):
#     return Response(
#         {"status": "error", "message": message},
#         status=http_status,
#     )


# def _customer_for_request(request, customer_id):
#     user = request.user

#     if user.role == Role.CUSTOMER:
#         if not user.customer_id:
#             raise ValueError("Your user account is not linked to a customer.")

#         customer = Customer.objects.filter(
#             pk=user.customer_id,
#             is_active=True,
#         ).first()

#         if not customer:
#             raise ValueError("Your customer account was not found.")

#         # Ignore any customer ID supplied by the browser.
#         return customer

#     if user.role == Role.ORG_SUPER_ADMIN:
#         if not user.organization_id:
#             raise ValueError("Your account has no organization assigned.")

#         if not customer_id:
#             raise ValueError("Please select a customer.")

#         customer = Customer.objects.filter(
#             pk=customer_id,
#             organization_id=user.organization_id,
#             is_active=True,
#         ).first()

#         if not customer:
#             raise ValueError(
#                 "The selected customer does not belong to your organization."
#             )

#         return customer

#     raise PermissionError(
#         "You do not have permission to use this creation workflow."
#     )


# def _is_uuid(value):
#     try:
#         uuid.UUID(str(value))
#         return True
#     except (ValueError, TypeError, AttributeError):
#         return False


# def _resolve_location(model, value, **extra_filters):
#     """
#     Resolve a location node by its UUID primary key OR by its `code` field.

#     The frontend may send either form depending on which API populated the
#     dropdown (e.g. the filter API returns seed codes like 'MH-D01-T01-C01'
#     instead of real UUIDs).
#     """
#     if value in (None, "", "null", "undefined", "None"):
#         return None

#     value_str = str(value).strip()

#     # Fast path: real UUID primary key
#     if _is_uuid(value_str):
#         obj = model.objects.filter(pk=value_str, **extra_filters).first()
#         if obj:
#             return obj

#     # Fallback: lookup by code (case-insensitive)
#     return model.objects.filter(code__iexact=value_str, **extra_filters).first()

# def _validate_location(customer, data):
#     """Validate the complete location chain for the selected customer.

#     Accepts either UUIDs or human-readable codes for every level, because
#     the frontend's filter API currently returns codes (e.g. 'MH-D01-T01-C01').
#     """
#     hierarchy = customer.hierarchy_type

#     # ------------------------------------------------------------------
#     # GEOGRAPHICAL: State -> District -> Taluka -> City
#     # ------------------------------------------------------------------
#     if hierarchy == "GEOGRAPHICAL":
#         if not data.get("city_id"):
#             raise ValueError("Please select a city.")

#         city = _resolve_location(
#             City,
#             data.get("city_id"),
#             is_active=True,
#             taluka__is_active=True,
#             taluka__district__is_active=True,
#             taluka__district__state__is_active=True,
#         )

#         if not city:
#             raise ValueError(
#                 "The selected city was not found or is inactive."
#             )

#         # Resolve the ancestors and make sure they line up with the city.
#         state = _resolve_location(
#             State,
#             data.get("state_id"),
#             is_active=True,
#         )

#         if not state or state.pk != city.taluka.district.state_id:
#             raise ValueError("The selected state does not match the city.")
#         district = _resolve_location(
#             District,
#             data.get("district_id"),
#             state=state,
#             is_active=True,
#         )
#         if not district or district.pk != city.taluka.district_id:
#             raise ValueError("The selected district does not match the city.")

#         taluka = _resolve_location(
#             Taluka,
#             data.get("taluka_id"),
#             district=district,
#             is_active=True,
#         )
#         if not taluka or taluka.pk != city.taluka_id:
#             raise ValueError("The selected taluka does not match the city.")

#         return {"city": city, "division": None}

#     # ------------------------------------------------------------------
#     # ZONAL: selected administrative levels from the canonical hierarchy.
#     # Circle, Region and Division may be combined in canonical order.
#     # ------------------------------------------------------------------
#     if hierarchy == "ZONAL":
#         levels = (customer.zonal_hierarchy_config or {}).get(
#             "levels", ["zone", "circle", "branch", "floor"]
#         )
#         zone = _resolve_location(Zone, data.get("zone_id"), customer=customer, is_active=True)
#         if not zone:
#             raise ValueError("Please select a valid zone for this customer.")

#         circle = None
#         region = None
#         division = None

#         if "circle" in levels:
#             circle = _resolve_location(Circle, data.get("circle_id"), zone=zone, is_active=True)
#             if not circle:
#                 raise ValueError("Please select a Circle belonging to the selected Zone.")

#         if "region" in levels:
#             region_query = Region.objects.filter(is_active=True)
#             if circle:
#                 region_query = region_query.filter(circle=circle)
#             else:
#                 region_query = region_query.filter(Q(zone=zone) | Q(circle__zone=zone))
#             region_value = data.get("region_id")
#             if _is_uuid(region_value):
#                 region = region_query.filter(pk=region_value).first()
#             if region is None and region_value not in (None, "", "null", "undefined", "None"):
#                 region = region_query.filter(code__iexact=str(region_value).strip()).first()
#             if not region:
#                 raise ValueError("Please select a Region in the selected Zone/Circle.")

#         if "division" in levels:
#             division = _resolve_location(
#                 Division, data.get("division_id"), region=region, is_active=True
#             ) if region else None
#             if not division:
#                 raise ValueError("Please select a Division belonging to the selected Region.")

#         parent_level = zonal_branch_parent_level(customer.zonal_hierarchy_config)
#         return {
#             "city": None,
#             "division": division if parent_level == "division" else None,
#             "circle": circle if parent_level == "circle" else None,
#             "region": region if parent_level == "region" else None,
#             "zone": zone if parent_level == "zone" else None,
#         }

#     raise ValueError(
#         "The selected customer has no valid hierarchy configured."
#     )

# def _hierarchy_path(site):
#     from .views import resolve_site_hierarchy
#     try:
#         return resolve_site_hierarchy(site)
#     except Exception:
#         return {}


# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def create_hierarchy_site(request):
#     data = request.data

#     try:
#         customer = _customer_for_request(
#             request,
#             data.get("customer_id"),
#         )
#         location = _validate_location(customer, data)

#     except PermissionError as exc:
#         return _error(str(exc), status.HTTP_403_FORBIDDEN)
#     except (ValueError, DjangoValidationError) as exc:   # ← add DjangoValidationError
#         return _error(str(exc))

#     branch_id = data.get("branch_id")
#     create_branch = bool(data.get("create_branch", False))

#     branch_name = str(data.get("branch_name") or "").strip()
#     branch_code = str(data.get("branch_code") or "").strip().upper()

    
#     site_name = str( data.get("site_name") or data.get("name") or "" ).strip()
#     site_code = str( data.get("site_code") or data.get("code") or "" ).strip().upper()

#     address = str(data.get("address") or "").strip()
#     pincode = str(data.get("pincode") or "").strip()

#     if not site_name or not site_code:
#         return _error("Site name and site code are required.")

#     if len(pincode) not in (0, 6) or (
#         pincode and not pincode.isdigit()
#     ):
#         return _error("Pincode must be empty or contain exactly 6 digits.")

#     floor_names = data.get("floor_names") or []
#     if not isinstance(floor_names, list):
#         return _error("floor_names must be a list.")

#     floor_names = [str(name).strip() for name in floor_names]

#     if len(floor_names) > 10:
#         return _error("You can create a maximum of 10 floors at once.")

#     if any(not name for name in floor_names):
#         return _error("Every floor must have a name.")

#     if len({name.casefold() for name in floor_names}) != len(floor_names):
#         return _error("Floor names must be unique within this submission.")

#     selected_floor_id = data.get("floor_id")
#     zonal_levels = (customer.zonal_hierarchy_config or {}).get("levels", []) if customer.hierarchy_type == "ZONAL" else []
#     building_id = data.get("building_id")
#     building_name = str(data.get("building_name") or "").strip()
#     room_id = data.get("room_id")
#     room_name = str(data.get("room_name") or "").strip()

#     if customer.hierarchy_type == "ZONAL":
#         if floor_names or selected_floor_id or room_id or room_name:
#             if "floor" not in zonal_levels:
#                 return _error("Floor is not enabled in this customer's hierarchy configuration.")
#         if building_id or building_name:
#             if "building" not in zonal_levels:
#                 return _error("Building is not enabled in this customer's hierarchy configuration.")
#         if "building" in zonal_levels and (floor_names or selected_floor_id) and not (building_id or building_name):
#             return _error("Select or enter a Building before creating or selecting a Floor.")
#         if room_id or room_name:
#             if "room" not in zonal_levels:
#                 return _error("Room is not enabled in this customer's hierarchy configuration.")

#     if not create_branch and not branch_id:
#         return _error("Select an existing branch or create a new branch.")

#     if create_branch and (not branch_name or not branch_code):
#         return _error("Branch name and branch code are required.")

#     try:
#         with transaction.atomic():

#             # STEP 1: Create a new branch OR select an existing branch
#             if create_branch:
#                 if Branch.objects.filter(code=branch_code).exists():
#                     return _error("This branch code already exists.")

#                 duplicate = Branch.objects.filter(
#                     customer=customer,
#                     name__iexact=branch_name,
#                 )

#                 if location["city"]:
#                     duplicate = duplicate.filter(city=location["city"])
#                 elif location.get("division"):
#                     duplicate = duplicate.filter(division=location["division"])
#                 elif location.get("circle"):
#                     duplicate = duplicate.filter(circle=location["circle"])
#                 elif location.get("region"):
#                     duplicate = duplicate.filter(region=location["region"])

#                 if duplicate.exists():
#                     return _error(
#                         "A branch with this name already exists at this location."
#                     )

#                 branch = Branch.objects.create(
#                     customer=customer,
#                     city=location.get("city"),
#                     division=location.get("division"),
#                     circle=location.get("circle"),
#                     region=location.get("region"),
#                     name=branch_name,
#                     code=branch_code,
#                 )

#             else:
#                 branch = (
#                     Branch.objects
#                     .select_related("customer", "city", "division", "circle", "region")
#                     .filter(customer=customer)
#                 )

#                 if _is_uuid(branch_id):
#                     branch = branch.filter(pk=branch_id).first()
#                 else:
#                     branch = branch.filter(code__iexact=branch_id).first()

#                 if branch is None:
#                     return _error(
#                         "The selected branch does not belong to this customer."
#                     )
    
#             # STEP 2: Resolve or create the optional Building for this branch.
#             building = None
#             if building_id:
#                 building = _resolve_location(Building, building_id, branch=branch, is_active=True)
#                 if not building:
#                     raise ValueError("The selected building does not belong to this branch.")
#             elif building_name:
#                 building, _ = Building.objects.get_or_create(
#                     branch=branch, name=building_name,
#                     defaults={"code": f"BL-{uuid.uuid4().hex[:12].upper()}"},
#                 )

#             # STEP 3: Create requested floors (inside selected Building when present).
#             floors = []

#             for floor_name in floor_names:
#                 if Floor.objects.filter(
#                     branch=branch,
#                     name__iexact=floor_name,
#                 ).exists():
#                     raise ValueError(
#                         f"The floor '{floor_name}' already exists in this branch."
#                     )

#                 floor = Floor.objects.create(
#                     branch=branch,
#                     building=building,
#                     name=floor_name,
#                     code=f"FL-{uuid.uuid4().hex[:12].upper()}",
#                 )
#                 floors.append(floor)

#             # STEP 3: Select an existing floor, if provided
#             floor = None

#             if selected_floor_id:
#                 floor = Floor.objects.filter(
#                     pk=selected_floor_id,
#                     branch=branch,
#                     **({"building": building} if building else {}),
#                 ).first()

#                 if floor is None:
#                     raise ValueError(
#                         "The selected floor does not belong to this branch."
#                     )

#             if not floor and room_name and floors:
#                 floor = floors[0]

#             # STEP 4: Resolve or create an optional Room under the selected Floor.
#             room = None
#             if room_id:
#                 room = _resolve_location(Room, room_id, is_active=True)
#                 if not room or not floor or room.floor_id != floor.pk:
#                     raise ValueError("The selected room does not belong to the selected floor.")
#             elif room_name:
#                 if not floor:
#                     raise ValueError("Select or create a floor before creating a room.")
#                 room, _ = Room.objects.get_or_create(
#                     floor=floor, name=room_name,
#                     defaults={"code": f"RM-{uuid.uuid4().hex[:12].upper()}"},
#                 )

#             # STEP 5: Validate site uniqueness
#             if Site.objects.filter(code=site_code).exists():
#                 raise ValueError("This site code already exists.")

#             if Site.objects.filter(
#                 branch=branch,
#                 name__iexact=site_name,
#             ).exists():
#                 raise ValueError(
#                     "A site with this name already exists in this branch."
#                 )

#             # STEP 5: Create the site locally
#             site = Site.objects.create(
#                 branch=branch,
#                 building=building,
#                 floor=floor,
#                 room=room,
#                 name=site_name,
#                 code=site_code,
#                 address=address,
#                 pincode=pincode,
#                 latitude=data.get("latitude") or None,
#                 longitude=data.get("longitude") or None,
#                 tpt_sync_status="PENDING",
#                 tpt_sync_error="",
#             )

#     except (ValueError, DjangoValidationError) as exc:   # ← add DjangoValidationError
#         return _error(str(exc))

#     except IntegrityError:
#         return _error(
#             "A duplicate branch, floor, or site was detected. "
#             "Refresh the page and try again.",
#             status.HTTP_409_CONFLICT,
#         )

#     # Customer -> Site assignment is saved locally as well.
#     CustomerSiteMapping.objects.update_or_create(
#         customer=customer,
#         site=site,
#         defaults={"is_active": True},
#     )

#     # Put the branch (+ floors) into the location tree so the hierarchy
#     # filter and the branch picker show it right away.
#     sync_branch_to_tree(branch)

#     sync_message = ""
#     try:
#         from .views import sync_site

#         sync_site(site)
#         site.refresh_from_db()

#         if not site.tpt_site_id:
#             site.tpt_sync_status = "PENDING"
#             site.tpt_sync_error = (
#                 "Local site created; 3TP synchronization is not confirmed."
#             )
#             site.save(
#                 update_fields=["tpt_sync_status", "tpt_sync_error"]
#             )
#             sync_message = site.tpt_sync_error

#     except Exception as exc:
#         site.tpt_sync_status = "FAILED"
#         site.tpt_sync_error = str(exc)[:2000]
#         site.save(
#             update_fields=["tpt_sync_status", "tpt_sync_error"]
#         )
#         sync_message = (
#             "Local site created, but 3TP synchronization failed. "
#             "Check the saved sync error before retrying."
#         )

#     return Response(
#         {
#             "status": "success",
#             "message": "Branch/site workflow saved locally.",
#             "data": {
#                 "customer_id": customer.pk,
#                 "hierarchy_type": customer.hierarchy_type,
#                 "branch_id": str(branch.pk),
#                 "branch_name": branch.name,
#                 "site_id": str(site.pk),
#                 "site_name": site.name,
#                 "building_id": str(building.pk) if building else None,
#                 "floor_id": str(floor.pk) if floor else None,
#                 "room_id": str(room.pk) if room else None,
#                 "created_floor_ids": [str(item.pk) for item in floors],
#                 "tpt_site_id": site.tpt_site_id,
#                 "tpt_sync_status": site.tpt_sync_status,
#                 "sync_message": sync_message,
#                 "hierarchy_path": _hierarchy_path(site),
#             },
#         },
#         status=status.HTTP_201_CREATED,
#     )


# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def create_hierarchy_branch(request):
#     """Create a branch directly under a selected Taluka (geographical) or
#     Division (zonal), without creating a Site or requiring a City node."""
#     data = request.data
#     # console.log(data);

#     try:
#         customer = _customer_for_request(request, data.get("customer_id"))
#         hierarchy = str(customer.hierarchy_type or "").upper()
#         name = str(data.get("name") or data.get("branch_name") or "").strip()
#         code = str(data.get("code") or data.get("branch_code") or "").strip().upper()
#         address = str(data.get("address") or "").strip()
#         pincode = str(data.get("pincode") or "").strip()

#         try:
#             latitude = Decimal(str(data.get("latitude"))) if data.get("latitude") not in (None, "") else None
#             longitude = Decimal(str(data.get("longitude"))) if data.get("longitude") not in (None, "") else None
#         except (InvalidOperation, TypeError, ValueError):
#             return _error("Latitude and longitude must be valid numbers.")
#         if latitude is not None and not Decimal("-90") <= latitude <= Decimal("90"):
#             return _error("Latitude must be between -90 and 90.")
#         if longitude is not None and not Decimal("-180") <= longitude <= Decimal("180"):
#             return _error("Longitude must be between -180 and 180.")

#         if not name or not code:
#             return _error("Branch name and branch code are required.")
#         if len(pincode) not in (0, 6) or (pincode and not pincode.isdigit()):
#             return _error("Pincode must be empty or contain exactly 6 digits.")
#         if Branch.objects.filter(code__iexact=code).exists():
#             return _error("This branch code already exists.")

#         if hierarchy == "GEOGRAPHICAL":
#             state = _resolve_location(State, data.get("state_id"), is_active=True)
#             if not state:
#                 return _error("Select a valid state.")
#             district = _resolve_location(District, data.get("district_id"), state=state, is_active=True)
#             if not district:
#                 return _error("The selected district does not belong to the selected state.")
#             taluka = _resolve_location(Taluka, data.get("taluka_id"), district=district, is_active=True)
#             if not taluka:
#                 return _error("The selected taluka does not belong to the selected district.")
#             if Branch.objects.filter(customer=customer, taluka=taluka, name__iexact=name).exists():
#                 return _error("A branch with this name already exists under this taluka.")
#             branch = Branch.objects.create(
#                 customer=customer, taluka=taluka, city=None, division=None,
#                 name=name, code=code, pincode=pincode, address=address,
#                 latitude=latitude, longitude=longitude,
#             )
#         elif hierarchy == "ZONAL":
#             location = _validate_location(customer, data)
#             parent_level = zonal_branch_parent_level(customer.zonal_hierarchy_config)
#             parent = location.get(parent_level)
#             if not parent:
#                 return _error(f"Select a valid {parent_level} belonging to this customer.")

#             geographic_state = None
#             geographic_city = None
#             if parent_level == "zone":
#                 requested_mode = str(data.get("zone_geography_mode") or parent.geography_mode or "").upper()
#                 if requested_mode not in ("STATE", "CITY"):
#                     return _error("Choose State-wise or City-wise geographical classification for this Zone.")
#                 if parent.geography_mode and parent.geography_mode != requested_mode:
#                     return _error(
#                         f"This Zone is already configured as {parent.geography_mode.title()}-wise. "
#                         "Its geographical classification cannot be changed after setup."
#                     )

#                 if requested_mode == "STATE":
#                     geographic_state = _resolve_location(
#                         State, data.get("geographic_state_id"), customer=customer, is_active=True
#                     )
#                     if not geographic_state:
#                         return _error("Select a valid State belonging to this customer.")
#                 else:
#                     geographic_city = _resolve_location(
#                         City,
#                         data.get("geographic_city_id"),
#                         taluka__district__state__customer=customer,
#                         is_active=True,
#                     )
#                     if not geographic_city:
#                         return _error("Select a valid City belonging to this customer's geographical master.")
#                     geographic_state = geographic_city.taluka.district.state
#                     supplied_state = data.get("geographic_state_id")
#                     if supplied_state:
#                         selected_state = _resolve_location(
#                             State, supplied_state, customer=customer, is_active=True
#                         )
#                         if not selected_state or selected_state.pk != geographic_state.pk:
#                             return _error("The selected City does not belong to the selected State.")

#             duplicate = Branch.objects.filter(customer=customer, name__iexact=name, **{parent_level: parent})
#             if duplicate.exists():
#                 return _error(f"A branch with this name already exists under this {parent_level}.")
#             branch = Branch.objects.create(
#                 customer=customer, city=None, taluka=None,
#                 division=location.get("division"),
#                 circle=location.get("circle"),
#                 region=location.get("region"),
#                 zone=location.get("zone"),
#                 geographic_state=geographic_state,
#                 geographic_city=geographic_city,
#                 name=name, code=code, pincode=pincode, address=address,
#                 latitude=latitude, longitude=longitude,
#             )
#             # Persist the Zone's mode only after the branch is successfully
#             # created, so failed branch submissions do not lock the Zone.
#             if parent_level == "zone" and not parent.geography_mode:
#                 parent.geography_mode = requested_mode
#                 parent.save(update_fields=["geography_mode"])
#         else:
#             return _error("The selected customer has no valid hierarchy configured.")

#         # The local Branch is also represented as an ASSET in 3TP.
#         # Import at runtime to avoid a module import cycle (views imports shared models).
#         cloud_error = ""
#         try:
#             from .views import _tpt_enabled, ensure_branch_asset

#             if _tpt_enabled():
#                 ensure_branch_asset(branch)
#         except Exception as exc:
#             cloud_error = str(exc)[:1000]
#             branch.refresh_from_db()

#         sync_branch_to_tree(branch)
#         is_cloud_synced = bool(branch.tpt_asset_id and branch.tpt_sync_status == "SYNCED")
#         return Response({
#             "status": "success" if is_cloud_synced else "partial_success",
#             "message": (
#                 "Branch created locally and synchronized to 3TP as an ASSET."
#                 if is_cloud_synced else
#                 ("Branch created locally, but 3TP ASSET synchronization failed. Retry synchronization before assigning devices."
#                  if cloud_error else "Branch created locally. 3TP integration is disabled or synchronization is pending.")
#             ),
#             "data": {
#                 "id": str(branch.pk), "name": branch.name, "code": branch.code,
#                 "address": branch.address, "pincode": branch.pincode,
#                 "latitude": float(branch.latitude) if branch.latitude is not None else None,
#                 "longitude": float(branch.longitude) if branch.longitude is not None else None,
#                 "customer_id": str(branch.customer_id),
#                 "hierarchy_type": hierarchy,
#                 "taluka_id": str(branch.taluka_id) if branch.taluka_id else None,
#                 "division_id": str(branch.division_id) if branch.division_id else None,
#                 "zone_id": str(branch.zone_id) if branch.zone_id else None,
#                 "geography_mode": branch.zone.geography_mode if branch.zone_id else None,
#                 "geographic_state_id": str(branch.geographic_state_id) if branch.geographic_state_id else None,
#                 "geographic_state_name": branch.geographic_state.name if branch.geographic_state_id else None,
#                 "geographic_city_id": str(branch.geographic_city_id) if branch.geographic_city_id else None,
#                 "geographic_city_name": branch.geographic_city.name if branch.geographic_city_id else None,
#                 "circle_id": str(branch.circle_id) if branch.circle_id else None,
#                 "region_id": str(branch.region_id) if branch.region_id else None,
#                 "tpt_asset_id": branch.tpt_asset_id or "",
#                 "tpt_sync_status": branch.tpt_sync_status,
#                 "tpt_sync_error": branch.tpt_sync_error or "",
#             },
#         }, status=status.HTTP_201_CREATED)
#     except PermissionError as exc:
#         return _error(str(exc), status.HTTP_403_FORBIDDEN)
#     except (ValueError, DjangoValidationError, IntegrityError) as exc:
#         return _error(str(exc))



import uuid
from decimal import Decimal, InvalidOperation

from django.db import transaction, IntegrityError
from django.db.models import Q
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Role,
    Customer,
    State,
    District,
    Taluka,
    City,
    Zone,
    Circle,
    Region,
    Division,
    Branch,
    Building,
    Floor,
    Room,
    Site,
    CustomerSiteMapping,
    zonal_branch_parent_level,
)
from .hierarchy_tree_sync import sync_branch_to_tree


def _error(message, http_status=status.HTTP_400_BAD_REQUEST):
    return Response(
        {"status": "error", "message": message},
        status=http_status,
    )


def _customer_for_request(request, customer_id):
    user = request.user

    if user.role == Role.CUSTOMER:
        if not user.customer_id:
            raise ValueError("Your user account is not linked to a customer.")

        customer = Customer.objects.filter(
            pk=user.customer_id,
            is_active=True,
        ).first()

        if not customer:
            raise ValueError("Your customer account was not found.")

        # Ignore any customer ID supplied by the browser.
        return customer

    if user.role == Role.ORG_SUPER_ADMIN:
        if not user.organization_id:
            raise ValueError("Your account has no organization assigned.")

        if not customer_id:
            raise ValueError("Please select a customer.")

        customer = Customer.objects.filter(
            pk=customer_id,
            organization_id=user.organization_id,
            is_active=True,
        ).first()

        if not customer:
            raise ValueError(
                "The selected customer does not belong to your organization."
            )

        return customer

    raise PermissionError(
        "You do not have permission to use this creation workflow."
    )


def _is_uuid(value):
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def _resolve_location(model, value, **extra_filters):
    """
    Resolve a location node by its UUID primary key OR by its `code` field.

    The frontend may send either form depending on which API populated the
    dropdown (e.g. the filter API returns seed codes like 'MH-D01-T01-C01'
    instead of real UUIDs).
    """
    if value in (None, "", "null", "undefined", "None"):
        return None

    value_str = str(value).strip()

    # Fast path: real UUID primary key
    if _is_uuid(value_str):
        obj = model.objects.filter(pk=value_str, **extra_filters).first()
        if obj:
            return obj

    # Fallback: lookup by code (case-insensitive)
    return model.objects.filter(code__iexact=value_str, **extra_filters).first()

def _validate_location(customer, data):
    """Validate the complete location chain for the selected customer.

    Accepts either UUIDs or human-readable codes for every level, because
    the frontend's filter API currently returns codes (e.g. 'MH-D01-T01-C01').
    """
    hierarchy = customer.hierarchy_type

    # ------------------------------------------------------------------
    # GEOGRAPHICAL: State -> District -> Taluka -> City
    # ------------------------------------------------------------------
    if hierarchy == "GEOGRAPHICAL":
        if not data.get("city_id"):
            raise ValueError("Please select a city.")

        city = _resolve_location(
            City,
            data.get("city_id"),
            is_active=True,
            taluka__is_active=True,
            taluka__district__is_active=True,
            taluka__district__state__is_active=True,
        )

        if not city:
            raise ValueError(
                "The selected city was not found or is inactive."
            )

        # Resolve the ancestors and make sure they line up with the city.
        state = _resolve_location(
            State,
            data.get("state_id"),
            is_active=True,
        )

        if not state or state.pk != city.taluka.district.state_id:
            raise ValueError("The selected state does not match the city.")
        district = _resolve_location(
            District,
            data.get("district_id"),
            state=state,
            is_active=True,
        )
        if not district or district.pk != city.taluka.district_id:
            raise ValueError("The selected district does not match the city.")

        taluka = _resolve_location(
            Taluka,
            data.get("taluka_id"),
            district=district,
            is_active=True,
        )
        if not taluka or taluka.pk != city.taluka_id:
            raise ValueError("The selected taluka does not match the city.")

        return {"city": city, "division": None}

    # ------------------------------------------------------------------
    # ZONAL: selected administrative levels from the canonical hierarchy.
    # Circle, Region and Division may be combined in canonical order.
    # ------------------------------------------------------------------
    if hierarchy == "ZONAL":
        levels = (customer.zonal_hierarchy_config or {}).get(
            "levels", ["zone", "circle", "branch", "floor"]
        )
        zone = _resolve_location(Zone, data.get("zone_id"), customer=customer, is_active=True)
        if not zone:
            raise ValueError("Please select a valid zone for this customer.")

        circle = None
        region = None
        division = None

        if "circle" in levels:
            circle = _resolve_location(Circle, data.get("circle_id"), zone=zone, is_active=True)
            if not circle:
                raise ValueError("Please select a Circle belonging to the selected Zone.")

        if "region" in levels:
            region_query = Region.objects.filter(is_active=True)
            if circle:
                region_query = region_query.filter(circle=circle)
            else:
                region_query = region_query.filter(Q(zone=zone) | Q(circle__zone=zone))
            region_value = data.get("region_id")
            if _is_uuid(region_value):
                region = region_query.filter(pk=region_value).first()
            if region is None and region_value not in (None, "", "null", "undefined", "None"):
                region = region_query.filter(code__iexact=str(region_value).strip()).first()
            if not region:
                raise ValueError("Please select a Region in the selected Zone/Circle.")

        if "division" in levels:
            division = _resolve_location(
                Division, data.get("division_id"), region=region, is_active=True
            ) if region else None
            if not division:
                raise ValueError("Please select a Division belonging to the selected Region.")

        parent_level = zonal_branch_parent_level(customer.zonal_hierarchy_config)
        return {
            "city": None,
            "division": division if parent_level == "division" else None,
            "circle": circle if parent_level == "circle" else None,
            "region": region if parent_level == "region" else None,
            "zone": zone if parent_level == "zone" else None,
        }

    raise ValueError(
        "The selected customer has no valid hierarchy configured."
    )

def _hierarchy_path(site):
    from .views import resolve_site_hierarchy
    try:
        return resolve_site_hierarchy(site)
    except Exception:
        return {}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_hierarchy_site(request):
    data = request.data

    try:
        customer = _customer_for_request(
            request,
            data.get("customer_id"),
        )
        location = _validate_location(customer, data)

    except PermissionError as exc:
        return _error(str(exc), status.HTTP_403_FORBIDDEN)
    except (ValueError, DjangoValidationError) as exc:   # ← add DjangoValidationError
        return _error(str(exc))

    branch_id = data.get("branch_id")
    create_branch = bool(data.get("create_branch", False))

    branch_name = str(data.get("branch_name") or "").strip()
    branch_code = str(data.get("branch_code") or "").strip().upper()

    
    site_name = str( data.get("site_name") or data.get("name") or "" ).strip()
    site_code = str( data.get("site_code") or data.get("code") or "" ).strip().upper()

    address = str(data.get("address") or "").strip()
    pincode = str(data.get("pincode") or "").strip()

    if not site_name or not site_code:
        return _error("Site name and site code are required.")

    if len(pincode) not in (0, 6) or (
        pincode and not pincode.isdigit()
    ):
        return _error("Pincode must be empty or contain exactly 6 digits.")

    floor_names = data.get("floor_names") or []
    if not isinstance(floor_names, list):
        return _error("floor_names must be a list.")

    floor_names = [str(name).strip() for name in floor_names]

    if len(floor_names) > 10:
        return _error("You can create a maximum of 10 floors at once.")

    if any(not name for name in floor_names):
        return _error("Every floor must have a name.")

    if len({name.casefold() for name in floor_names}) != len(floor_names):
        return _error("Floor names must be unique within this submission.")

    selected_floor_id = data.get("floor_id")
    zonal_levels = (customer.zonal_hierarchy_config or {}).get("levels", []) if customer.hierarchy_type == "ZONAL" else []
    building_id = data.get("building_id")
    building_name = str(data.get("building_name") or "").strip()
    room_id = data.get("room_id")
    room_name = str(data.get("room_name") or "").strip()

    if customer.hierarchy_type == "ZONAL":
        if floor_names or selected_floor_id or room_id or room_name:
            if "floor" not in zonal_levels:
                return _error("Floor is not enabled in this customer's hierarchy configuration.")
        if building_id or building_name:
            if "building" not in zonal_levels:
                return _error("Building is not enabled in this customer's hierarchy configuration.")
        if "building" in zonal_levels and (floor_names or selected_floor_id) and not (building_id or building_name):
            return _error("Select or enter a Building before creating or selecting a Floor.")
        if room_id or room_name:
            if "room" not in zonal_levels:
                return _error("Room is not enabled in this customer's hierarchy configuration.")

    if not create_branch and not branch_id:
        return _error("Select an existing branch or create a new branch.")

    if create_branch and (not branch_name or not branch_code):
        return _error("Branch name and branch code are required.")

    try:
        with transaction.atomic():

            # STEP 1: Create a new branch OR select an existing branch
            if create_branch:
                if Branch.objects.filter(code=branch_code).exists():
                    return _error("This branch code already exists.")

                duplicate = Branch.objects.filter(
                    customer=customer,
                    name__iexact=branch_name,
                )

                if location["city"]:
                    duplicate = duplicate.filter(city=location["city"])
                elif location.get("division"):
                    duplicate = duplicate.filter(division=location["division"])
                elif location.get("circle"):
                    duplicate = duplicate.filter(circle=location["circle"])
                elif location.get("region"):
                    duplicate = duplicate.filter(region=location["region"])
                elif location.get("zone"):
                    duplicate = duplicate.filter(zone=location["zone"])

                if duplicate.exists():
                    return _error(
                        "A branch with this name already exists at this location."
                    )

                branch = Branch.objects.create(
                    customer=customer,
                    city=location.get("city"),
                    division=location.get("division"),
                    circle=location.get("circle"),
                    region=location.get("region"),
                    zone=location.get("zone"),
                    name=branch_name,
                    code=branch_code,
                )

            else:
                branch = (
                    Branch.objects
                    .select_related("customer", "city", "division", "circle", "region")
                    .filter(customer=customer)
                )

                if _is_uuid(branch_id):
                    branch = branch.filter(pk=branch_id).first()
                else:
                    branch = branch.filter(code__iexact=branch_id).first()

                if branch is None:
                    return _error(
                        "The selected branch does not belong to this customer."
                    )
    
            # STEP 2: Resolve or create the optional Building for this branch.
            building = None
            if building_id:
                building = _resolve_location(Building, building_id, branch=branch, is_active=True)
                if not building:
                    raise ValueError("The selected building does not belong to this branch.")
            elif building_name:
                building, _ = Building.objects.get_or_create(
                    branch=branch, name=building_name,
                    defaults={"code": f"BL-{uuid.uuid4().hex[:12].upper()}"},
                )

            # STEP 3: Create requested floors (inside selected Building when present).
            floors = []

            for floor_name in floor_names:
                if Floor.objects.filter(
                    branch=branch,
                    name__iexact=floor_name,
                ).exists():
                    raise ValueError(
                        f"The floor '{floor_name}' already exists in this branch."
                    )

                floor = Floor.objects.create(
                    branch=branch,
                    building=building,
                    name=floor_name,
                    code=f"FL-{uuid.uuid4().hex[:12].upper()}",
                )
                floors.append(floor)

            # STEP 3: Select an existing floor, if provided
            floor = None

            if selected_floor_id:
                floor = Floor.objects.filter(
                    pk=selected_floor_id,
                    branch=branch,
                    **({"building": building} if building else {}),
                ).first()

                if floor is None:
                    raise ValueError(
                        "The selected floor does not belong to this branch."
                    )

            if not floor and room_name and floors:
                requested_room_floor_name = str(data.get("room_floor_name") or "").strip()
                if requested_room_floor_name:
                    floor = next(
                        (item for item in floors if item.name.casefold() == requested_room_floor_name.casefold()),
                        None,
                    )
                    if floor is None:
                        raise ValueError("Select a valid newly created Floor for this Room.")
                else:
                    floor = floors[0]

            # STEP 4: Resolve or create an optional Room under the selected Floor.
            room = None
            if room_id:
                room = _resolve_location(Room, room_id, is_active=True)
                if not room or not floor or room.floor_id != floor.pk:
                    raise ValueError("The selected room does not belong to the selected floor.")
            elif room_name:
                if not floor:
                    raise ValueError("Select or create a floor before creating a room.")
                room, _ = Room.objects.get_or_create(
                    floor=floor, name=room_name,
                    defaults={"code": f"RM-{uuid.uuid4().hex[:12].upper()}"},
                )

            # STEP 5: Validate site uniqueness
            if Site.objects.filter(code=site_code).exists():
                raise ValueError("This site code already exists.")

            if Site.objects.filter(
                branch=branch,
                name__iexact=site_name,
            ).exists():
                raise ValueError(
                    "A site with this name already exists in this branch."
                )

            # STEP 5: Create the site locally
            site = Site.objects.create(
                branch=branch,
                building=building,
                floor=floor,
                room=room,
                name=site_name,
                code=site_code,
                address=address,
                pincode=pincode,
                latitude=data.get("latitude") or None,
                longitude=data.get("longitude") or None,
                tpt_sync_status="PENDING",
                tpt_sync_error="",
            )

    except (ValueError, DjangoValidationError) as exc:   # ← add DjangoValidationError
        return _error(str(exc))

    except IntegrityError:
        return _error(
            "A duplicate branch, floor, or site was detected. "
            "Refresh the page and try again.",
            status.HTTP_409_CONFLICT,
        )

    # Customer -> Site assignment is saved locally as well.
    CustomerSiteMapping.objects.update_or_create(
        customer=customer,
        site=site,
        defaults={"is_active": True},
    )

    # Put the branch (+ floors) into the location tree so the hierarchy
    # filter and the branch picker show it right away.
    sync_branch_to_tree(branch)

    sync_message = ""
    try:
        from .views import sync_site

        sync_site(site)
        site.refresh_from_db()

        if not site.tpt_site_id:
            site.tpt_sync_status = "PENDING"
            site.tpt_sync_error = (
                "Local site created; 3TP synchronization is not confirmed."
            )
            site.save(
                update_fields=["tpt_sync_status", "tpt_sync_error"]
            )
            sync_message = site.tpt_sync_error

    except Exception as exc:
        site.tpt_sync_status = "FAILED"
        site.tpt_sync_error = str(exc)[:2000]
        site.save(
            update_fields=["tpt_sync_status", "tpt_sync_error"]
        )
        sync_message = (
            "Local site created, but 3TP synchronization failed. "
            "Check the saved sync error before retrying."
        )

    return Response(
        {
            "status": "success",
            "message": "Branch/site workflow saved locally.",
            "data": {
                "customer_id": customer.pk,
                "hierarchy_type": customer.hierarchy_type,
                "branch_id": str(branch.pk),
                "branch_name": branch.name,
                "site_id": str(site.pk),
                "site_name": site.name,
                "building_id": str(building.pk) if building else None,
                "floor_id": str(floor.pk) if floor else None,
                "room_id": str(room.pk) if room else None,
                "created_floor_ids": [str(item.pk) for item in floors],
                "tpt_site_id": site.tpt_site_id,
                "tpt_sync_status": site.tpt_sync_status,
                "sync_message": sync_message,
                "hierarchy_path": _hierarchy_path(site),
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_hierarchy_branch(request):
    """Create a branch directly under a selected Taluka (geographical) or
    Division (zonal), without creating a Site or requiring a City node."""
    data = request.data
    # console.log(data);

    try:
        customer = _customer_for_request(request, data.get("customer_id"))
        hierarchy = str(customer.hierarchy_type or "").upper()
        name = str(data.get("name") or data.get("branch_name") or "").strip()
        code = str(data.get("code") or data.get("branch_code") or "").strip().upper()
        address = str(data.get("address") or "").strip()
        pincode = str(data.get("pincode") or "").strip()

        try:
            latitude = Decimal(str(data.get("latitude"))) if data.get("latitude") not in (None, "") else None
            longitude = Decimal(str(data.get("longitude"))) if data.get("longitude") not in (None, "") else None
        except (InvalidOperation, TypeError, ValueError):
            return _error("Latitude and longitude must be valid numbers.")
        if latitude is not None and not Decimal("-90") <= latitude <= Decimal("90"):
            return _error("Latitude must be between -90 and 90.")
        if longitude is not None and not Decimal("-180") <= longitude <= Decimal("180"):
            return _error("Longitude must be between -180 and 180.")

        if not name or not code:
            return _error("Branch name and branch code are required.")
        if len(pincode) not in (0, 6) or (pincode and not pincode.isdigit()):
            return _error("Pincode must be empty or contain exactly 6 digits.")
        if Branch.objects.filter(code__iexact=code).exists():
            return _error("This branch code already exists.")

        if hierarchy == "GEOGRAPHICAL":
            state = _resolve_location(State, data.get("state_id"), is_active=True)
            if not state:
                return _error("Select a valid state.")
            district = _resolve_location(District, data.get("district_id"), state=state, is_active=True)
            if not district:
                return _error("The selected district does not belong to the selected state.")
            taluka = _resolve_location(Taluka, data.get("taluka_id"), district=district, is_active=True)
            if not taluka:
                return _error("The selected taluka does not belong to the selected district.")
            if Branch.objects.filter(customer=customer, taluka=taluka, name__iexact=name).exists():
                return _error("A branch with this name already exists under this taluka.")
            branch = Branch.objects.create(
                customer=customer, taluka=taluka, city=None, division=None,
                name=name, code=code, pincode=pincode, address=address,
                latitude=latitude, longitude=longitude,
            )
        elif hierarchy == "ZONAL":
            location = _validate_location(customer, data)
            parent_level = zonal_branch_parent_level(customer.zonal_hierarchy_config)
            parent = location.get(parent_level)
            if not parent:
                return _error(f"Select a valid {parent_level} belonging to this customer.")

            geographic_state = None
            geographic_city = None
            if parent_level == "zone":
                requested_mode = str(data.get("zone_geography_mode") or parent.geography_mode or "").upper()
                if requested_mode not in ("STATE", "CITY"):
                    return _error("Choose State-wise or City-wise geographical classification for this Zone.")
                if parent.geography_mode and parent.geography_mode != requested_mode:
                    return _error(
                        f"This Zone is already configured as {parent.geography_mode.title()}-wise. "
                        "Its geographical classification cannot be changed after setup."
                    )

                if requested_mode == "STATE":
                    geographic_state = _resolve_location(
                        State, data.get("geographic_state_id"), customer=customer, is_active=True
                    )
                    if not geographic_state:
                        return _error("Select a valid State belonging to this customer.")
                else:
                    geographic_city = _resolve_location(
                        City,
                        data.get("geographic_city_id"),
                        taluka__district__state__customer=customer,
                        is_active=True,
                    )
                    if not geographic_city:
                        return _error("Select a valid City belonging to this customer's geographical master.")
                    geographic_state = geographic_city.taluka.district.state
                    supplied_state = data.get("geographic_state_id")
                    if supplied_state:
                        selected_state = _resolve_location(
                            State, supplied_state, customer=customer, is_active=True
                        )
                        if not selected_state or selected_state.pk != geographic_state.pk:
                            return _error("The selected City does not belong to the selected State.")

            duplicate = Branch.objects.filter(customer=customer, name__iexact=name, **{parent_level: parent})
            if duplicate.exists():
                return _error(f"A branch with this name already exists under this {parent_level}.")
            branch = Branch.objects.create(
                customer=customer, city=None, taluka=None,
                division=location.get("division"),
                circle=location.get("circle"),
                region=location.get("region"),
                zone=location.get("zone"),
                geographic_state=geographic_state,
                geographic_city=geographic_city,
                name=name, code=code, pincode=pincode, address=address,
                latitude=latitude, longitude=longitude,
            )
            # Persist the Zone's mode only after the branch is successfully
            # created, so failed branch submissions do not lock the Zone.
            if parent_level == "zone" and not parent.geography_mode:
                parent.geography_mode = requested_mode
                parent.save(update_fields=["geography_mode"])
        else:
            return _error("The selected customer has no valid hierarchy configured.")

        # The local Branch is also represented as an ASSET in 3TP.
        # Import at runtime to avoid a module import cycle (views imports shared models).
        cloud_error = ""
        try:
            from .views import _tpt_enabled, ensure_branch_asset

            if _tpt_enabled():
                ensure_branch_asset(branch)
        except Exception as exc:
            cloud_error = str(exc)[:1000]
            branch.refresh_from_db()

        sync_branch_to_tree(branch)
        is_cloud_synced = bool(branch.tpt_asset_id and branch.tpt_sync_status == "SYNCED")
        return Response({
            "status": "success" if is_cloud_synced else "partial_success",
            "message": (
                "Branch created locally and synchronized to 3TP as an ASSET."
                if is_cloud_synced else
                ("Branch created locally, but 3TP ASSET synchronization failed. Retry synchronization before assigning devices."
                 if cloud_error else "Branch created locally. 3TP integration is disabled or synchronization is pending.")
            ),
            "data": {
                "id": str(branch.pk), "name": branch.name, "code": branch.code,
                "address": branch.address, "pincode": branch.pincode,
                "latitude": float(branch.latitude) if branch.latitude is not None else None,
                "longitude": float(branch.longitude) if branch.longitude is not None else None,
                "customer_id": str(branch.customer_id),
                "hierarchy_type": hierarchy,
                "taluka_id": str(branch.taluka_id) if branch.taluka_id else None,
                "division_id": str(branch.division_id) if branch.division_id else None,
                "zone_id": str(branch.zone_id) if branch.zone_id else None,
                "geography_mode": branch.zone.geography_mode if branch.zone_id else None,
                "geographic_state_id": str(branch.geographic_state_id) if branch.geographic_state_id else None,
                "geographic_state_name": branch.geographic_state.name if branch.geographic_state_id else None,
                "geographic_city_id": str(branch.geographic_city_id) if branch.geographic_city_id else None,
                "geographic_city_name": branch.geographic_city.name if branch.geographic_city_id else None,
                "circle_id": str(branch.circle_id) if branch.circle_id else None,
                "region_id": str(branch.region_id) if branch.region_id else None,
                "tpt_asset_id": branch.tpt_asset_id or "",
                "tpt_sync_status": branch.tpt_sync_status,
                "tpt_sync_error": branch.tpt_sync_error or "",
            },
        }, status=status.HTTP_201_CREATED)
    except PermissionError as exc:
        return _error(str(exc), status.HTTP_403_FORBIDDEN)
    except (ValueError, DjangoValidationError, IntegrityError) as exc:
        return _error(str(exc))
    