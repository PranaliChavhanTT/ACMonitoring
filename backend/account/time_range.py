
from django.db.models import FloatField, Sum
from django.db.models.functions import Coalesce

from .history_views import BASE_INTERVAL, RangeError, parse_window
from .models import TelemetryAggregate

RANGE_PARAMS = ("from", "to", "startTs", "endTs")


def requested_window(request):
    """(start, end) when the caller asked for a time window, else None.

    Raises RangeError for an invalid / inverted / over-long window.
    """
    params = request.query_params if hasattr(request, "query_params") else request.GET
    if not any(str(params.get(name) or "").strip() for name in RANGE_PARAMS):
        return None
    return parse_window(params)


def _aggregate_by_device(device_ids, start, end):
    rows = (
        TelemetryAggregate.objects
        .filter(interval_seconds=BASE_INTERVAL, device_id__in=device_ids,
                bucket_start__gte=start, bucket_start__lte=end)
        .order_by()
        .values("device_id")
        .annotate(
            energy_wh=Coalesce(Sum("energy_delta"), 0.0, output_field=FloatField()),
            packets=Coalesce(Sum("sample_count"), 0),
            sv=Coalesce(Sum("sum_voltage"), 0.0, output_field=FloatField()),
            nv=Coalesce(Sum("voltage_sample_count"), 0),
            sc=Coalesce(Sum("sum_current"), 0.0, output_field=FloatField()),
            nc=Coalesce(Sum("current_sample_count"), 0),
            sp=Coalesce(Sum("sum_power"), 0.0, output_field=FloatField()),
            np=Coalesce(Sum("power_sample_count"), 0),
            st=Coalesce(Sum("sum_temperature"), 0.0, output_field=FloatField()),
            nt=Coalesce(Sum("temperature_sample_count"), 0),
            sh=Coalesce(Sum("sum_humidity"), 0.0, output_field=FloatField()),
            nh=Coalesce(Sum("humidity_sample_count"), 0),
        )
    )
    return {row["device_id"]: row for row in rows}


def _mean(total, count):
    return round(total / count, 4) if count else None


def apply_time_range(records, window):
    """Return ``records`` with time-dependent fields recomputed for ``window``."""
    start, end = window
    ids = {str(r.get("ac_id") or "").strip() for r in records}
    ids.discard("")
    stats = _aggregate_by_device(ids, start, end) if ids else {}

    out = []
    for record in records:
        rec = dict(record)
        row = stats.get(str(rec.get("ac_id") or "").strip())

        rec["range_applied"] = True
        rec["range_from"] = start.isoformat()
        rec["range_to"] = end.isoformat()
        rec["range_sample_count"] = int(row["packets"]) if row else 0

        # Energy is additive: an AC with no readings in the window consumed 0.
        rec["energy_consumption"] = round(row["energy_wh"], 3) if row else 0

        averages = {
            "voltage": _mean(row["sv"], row["nv"]) if row else None,
            "current": _mean(row["sc"], row["nc"]) if row else None,
            "active_power": _mean(row["sp"], row["np"]) if row else None,
            "temperature": _mean(row["st"], row["nt"]) if row else None,
            "humidity": _mean(row["sh"], row["nh"]) if row else None,
        }
        for key, value in averages.items():
            rec[key] = value
        # The dashboard reads the indoor_* names first.
        rec["indoor_temperature"] = averages["temperature"]
        rec["indoor_humidity"] = averages["humidity"]
        out.append(rec)
    return out
