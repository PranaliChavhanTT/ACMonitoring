"""Conservative, dry-run-first recovery of five ICICI branch rows.

Run ONLY against a staging copy of db.sqlite3, never the live database.
From the backend directory:
    python manage.py shell < /path/to/recover_five_icici_branches.py
Dry run is default. To apply to STAGING ONLY:
    RECOVER_BRANCHES_APPLY=1 python manage.py shell < /path/to/recover_five_icici_branches.py
"""
import os
from datetime import datetime
from decimal import Decimal
from django.db import transaction
from django.conf import settings
from account.models import Customer, Branch, City, Taluka, HierarchyType

APPLY = os.environ.get("RECOVER_BRANCHES_APPLY") == "1"
CUSTOMER_ID = 12
CITY_ID = "1d5c42bf89664a15b64ec6f5d1c40cb1"
CITY_CODE = "MH-D01-T01-C01"
PUNE_TALUKA_ID = "fc92be3f3e0a45b8bbc46348cc133b40"
PUNE_CITY_TALUKA_ID = "ed576b03d5ba4f42880563b428b8423b"
TALODE_TALUKA_ID = "83e21f15329a49cabfa8a2b13eb0a92f"

# All values below were recovered from residual SQLite page data. The old
# geographic parent IDs were remapped to matching current Taluka records.
BRANCHES = [
    dict(id="ad28e86787c64cdfa3fd23430ec2ac8d", name="Kothrud", code="KD-01",
         address="Plot No 58, 59, Mayur Colony, Kothrud, Pune", created_at="2026-11-02 10:10:01.707746",
         latitude="18.508700", longitude="73.812500", pincode="411029",
         tpt_asset_id="1d371e30-d6a7-11f1-b0fa-0d1a0230425c", parent="taluka", parent_id=PUNE_CITY_TALUKA_ID),
    dict(id="079eafa8659b4676acd0e434db52b461", name="Taloda", code="TL-01",
         address="Ground Floor, BCM Fitness Club Building, Babanrao Pehlwan Nagar, Taloda", created_at="2026-11-02 09:46:46.150423",
         latitude="21.561300", longitude="74.212400", pincode="425413",
         tpt_asset_id="1fb871e0-d6a7-11f1-b0fa-0d1a0230425c", parent="taluka", parent_id=TALODE_TALUKA_ID),
    dict(id="70b82626f5554119a3025e1aecce4c7e", name="Navle", code="NV-01",
         address="Walhekar Complex, 56/12, Narhe, Taluka Haveli, Pune", created_at="2026-10-27 07:20:49.580870",
         latitude="18.451927", longitude="73.824221", pincode="411041",
         tpt_asset_id="ee89c990-d1d6-11f1-b0fa-0d1a0230425c", parent="city", parent_id=CITY_ID),
    dict(id="40461b9e06874973b1d648556772cfc9", name="Narhe", code="NR-01",
         address="Walhekar Complex, 56/12, Narhe, Taluka Haveli, Pune", created_at="2026-10-27 06:54:59.861894",
         latitude="18.451927", longitude="73.824221", pincode="411051",
         tpt_asset_id="52f6b2c0-d1d3-11f1-b0fa-0d1a0230425c", parent="city", parent_id=CITY_ID),
    dict(id="ee5f47cf61a243a39b489999c047c154", name="Minakshipuram", code="MI-01",
         address="Ganga Bhagyoday, Next to Manik Baug Petrol Pump, Sinhagad Road, Vadgaon Budruk, Pune", created_at="2026-10-21 04:15:39.361673",
         latitude="18.463500", longitude="73.834100", pincode="411041",
         tpt_asset_id="11d64930-cd06-11f1-9fbd-e7ab598bb869", parent="city", parent_id=CITY_ID),
]

customer = Customer.objects.get(pk=CUSTOMER_ID)
if customer.code != "ICICI-01" or customer.hierarchy_type != HierarchyType.GEOGRAPHICAL:
    raise RuntimeError(f"Unexpected customer: id={customer.pk}, code={customer.code}, hierarchy={customer.hierarchy_type}")
if Branch.objects.filter(customer_id=CUSTOMER_ID).exists():
    raise RuntimeError("ICICI already has Branch rows. Stop and reconcile manually; this script will not merge or overwrite.")

# Parent validation before any writes.
for tid in (PUNE_TALUKA_ID, PUNE_CITY_TALUKA_ID, TALODE_TALUKA_ID):
    Taluka.objects.get(pk=tid)

city = City.objects.filter(pk=CITY_ID).first()
if city:
    if (city.name, city.code, str(city.taluka_id)) != ("Pune", CITY_CODE, PUNE_TALUKA_ID):
        raise RuntimeError("Recovered City UUID already exists with different data; stopping.")
else:
    code_match = City.objects.filter(code=CITY_CODE).first()
    if code_match:
        raise RuntimeError(f"City code {CITY_CODE} is already used by another City; stopping.")

for b in BRANCHES:
    if Branch.objects.filter(pk=b["id"]).exists():
        raise RuntimeError(f"Branch UUID already exists: {b['id']}")
    if Branch.objects.filter(code=b["code"]).exists():
        raise RuntimeError(f"Branch code already exists: {b['code']}")
    if Branch.objects.filter(tpt_asset_id=b["tpt_asset_id"]).exists():
        raise RuntimeError(f"3TP asset ID already exists: {b['tpt_asset_id']}")

db_name = str(settings.DATABASES["default"]["NAME"])
print("Target DB:", db_name)
if APPLY and "staging" not in db_name.lower():
    raise RuntimeError("Safety stop: APPLY is allowed only when DATABASES[default][NAME] contains the word staging.")
print("Customer:", customer.company, customer.code, customer.hierarchy_type)
print("Existing ICICI branches:", Branch.objects.filter(customer_id=CUSTOMER_ID).count())
print("City Pune:", "already present and matching" if city else f"would create {CITY_ID} under current Pune Taluka")
for b in BRANCHES:
    print(f"Would restore {b['name']} ({b['code']}) -> {b['parent']} {b['parent_id']}")

if not APPLY:
    print("DRY RUN ONLY: no database rows were changed. Set RECOVER_BRANCHES_APPLY=1 only while connected to your STAGING database.")
else:
    with transaction.atomic():
        if city is None:
            city = City(id=CITY_ID, taluka_id=PUNE_TALUKA_ID, name="Pune", code=CITY_CODE, is_active=True)
            city.save(force_insert=True)
            City.objects.filter(pk=CITY_ID).update(created_at=datetime.fromisoformat("2026-10-12 11:10:44.439030"))
        for b in BRANCHES:
            fields = dict(
                id=b["id"], customer_id=CUSTOMER_ID, name=b["name"], address=b["address"],
                code=b["code"], is_active=True, latitude=Decimal(b["latitude"]),
                longitude=Decimal(b["longitude"]), pincode=b["pincode"], ifsc_code="",
                tpt_asset_id=b["tpt_asset_id"], tpt_sync_status="SYNCED", tpt_sync_error="",
                org_unit_id=None, city_id=(CITY_ID if b["parent"] == "city" else None),
                taluka_id=(b["parent_id"] if b["parent"] == "taluka" else None),
                division_id=None, circle_id=None, region_id=None, zone_id=None,
                geographic_state_id=None, geographic_city_id=None,
            )
            obj = Branch(**fields)
            obj.save(force_insert=True)
            Branch.objects.filter(pk=b["id"]).update(created_at=datetime.fromisoformat(b["created_at"]))
        print("Applied inside transaction. Restored ICICI branch count:", Branch.objects.filter(customer_id=CUSTOMER_ID).count())
        print("Verify the five records and app behavior before promoting this staging DB.")
