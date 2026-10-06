# 3TP Integration

The Django API remains the source of truth. Creation flows mirror entities to 3TP.

## Flows

- Customer creation -> 3TP Customer
- User creation -> 3TP Admin/Operator
- Site creation -> 3TP Asset + Customer relation
- AC creation -> 3TP Device + Customer assignment + Site relation

## Environment

Set `TPT_BASE_URL`, `TPT_USERNAME`, `TPT_PASSWORD`, and `TPT_SYNC_ENABLED=1`.
Do not commit credentials.

## Migration

Run:

    python manage.py migrate

## Current 3TP paths

The service uses configurable ThingsBoard-style paths:

- POST /api/auth/login
- POST /api/customer
- POST /api/user
- POST /api/asset
- POST /api/device
- POST /api/relation
- POST /api/customer/{customerId}/device/{deviceId}

If the 3TP deployment exposes different CRUD paths or payloads, update only
`account/services/three_tp.py`; the Django/React creation flow remains unchanged.
