# AC Monitoring – Customer / Admin / Engineer creation fix

## What changed

All Customer, Branch Admin and Engineer 3TP creation calls are handled directly from `account/views.py`.
There is no User post-save synchronization to 3TP anymore.

### Customer
1. Validate local request.
2. `POST /api/customer` to 3TP.
3. `POST /api/user?sendActivationMail=false` to create the CUSTOMER_USER.
4. Read `/api/user/<id>/activationLinkInfo`.
5. Activate with `/api/noauth/activate?sendActivationMail=false`.
6. Save the local Customer and local User with the returned 3TP IDs.

### Branch Admin
1. Validate customer + State/Zone scope.
2. Ensure the customer has a 3TP customer ID.
3. Create and activate the 3TP CUSTOMER_USER.
4. Save the local BR_ADMIN with the 3TP user ID.

### Engineer
1. Validate customer and optional Branch Admin parent.
2. Resolve parent branch/state/zone.
3. Ensure the customer has a 3TP customer ID.
4. Create and activate the 3TP CUSTOMER_USER.
5. Save the local ENGINEER with the 3TP user ID.
6. The existing frontend can assign the Site afterwards.

## Important

The frontend sends `Authorization: Token <3TP JWT>`. The backend accepts both `Token` and `Bearer` and uses the authenticated 3TP JWT for the outbound 3TP calls.

Put your real 3TP credentials in `backend/.env` using `backend/.env.example` as the template.

## Verification

- `python manage.py check` passes.
- `python manage.py makemigrations --check --dry-run` reports no changes.
- `python manage.py test account --noinput` passes.
