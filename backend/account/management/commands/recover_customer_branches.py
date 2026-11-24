"""Restore one customer's branches (and everything under them) from a backup database.

HOW TO RUN (from the folder that contains manage.py):
    1. Save this file NEXT TO manage.py. Do NOT put it in account/management/commands.
    2. Add the backup to settings.py, e.g. for SQLite:
           DATABASES["backup"] = {"ENGINE": "django.db.backends.sqlite3",
                                  "NAME": BASE_DIR / "recovery_backups" / "<backup file>.sqlite3"}
    3. python manage.py shell -c "exec(open('restore_icici_branches.py').read())"
       -> first run is a DRY RUN: it only reports what it would restore.
    4. Set DRY_RUN = False below and run it again to apply.
Never overwrites an existing row; safe to run more than once.
"""
from django.db import connections, transaction
from account.models import (Customer, Branch, Building, Floor, Room, Site, ACDevice,
                            CustomerSiteMapping, SiteDeviceMapping)

SRC, CODE = "backup", "ICICI"      # backup DB alias, customer code
DRY_RUN = True                     # change to False to really restore

if SRC not in connections.databases:
    raise SystemExit(f"No '{SRC}' database in settings.DATABASES. See step 2 at the top of this file.")


def copy(obj, seen):
    """Save a row from the backup into the live DB, parents first. Never overwrites."""
    key = (type(obj), obj.pk)
    if key in seen or type(obj).objects.using("default").filter(pk=obj.pk).exists():
        return
    seen.add(key)
    for f in obj._meta.concrete_fields:
        pk = getattr(obj, f.attname)
        # only fetch a parent from the backup when the live DB does not already have it
        if f.many_to_one and pk is not None and not f.related_model.objects.using("default").filter(pk=pk).exists():
            copy(getattr(obj, f.name), seen)
    obj.save(using="default", force_insert=True)


cust = Customer.objects.using(SRC).filter(code__iexact=CODE).first()
if cust is None:
    raise SystemExit(f"Customer '{CODE}' was not found in the '{SRC}' database.")
B = lambda m, **kw: m.objects.using(SRC).filter(**kw)
print(f"Customer in backup: {cust.company} ({cust.code}, {cust.hierarchy_type}); "
      f"branches in backup: {B(Branch, customer=cust).count()}; "
      f"in live DB now: {Branch.objects.filter(customer__code__iexact=CODE).count()}")

seen = set()
with transaction.atomic(using="default"):
    for qs in (B(Branch, customer=cust), B(Building, branch__customer=cust), B(Floor, branch__customer=cust),
               B(Room, floor__branch__customer=cust), B(Site, branch__customer=cust),
               B(CustomerSiteMapping, customer=cust), B(SiteDeviceMapping, site__branch__customer=cust)):
        for row in qs:
            copy(row, seen)
    # devices survive a delete but lose their branch/site (SET_NULL): re-attach from the backup
    fixed = 0
    for old in B(ACDevice, branch__customer=cust):
        fixed += ACDevice.objects.filter(pk=old.pk, branch__isnull=True).update(branch_id=old.branch_id, site_id=old.site_id)
    summary = {}
    for model, _ in seen:
        summary[model.__name__] = summary.get(model.__name__, 0) + 1
    print("rows to restore:", summary or "none", "| devices to re-attach:", fixed)
    if DRY_RUN:
        transaction.set_rollback(True)
        print("DRY RUN: nothing was changed. Set DRY_RUN = False to apply.")
    else:
        print("RESTORED.")