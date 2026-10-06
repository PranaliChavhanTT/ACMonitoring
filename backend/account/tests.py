"""
Tests for 3TP token authentication.

3TP itself is never contacted: requests.post inside account.views is mocked.
Run with:  python manage.py test account
"""
import re
import uuid
from unittest import mock

from django.core.cache import cache
from django.test import TestCase
from django.urls import URLPattern, get_resolver
from rest_framework.test import APIClient

from .models import User

# Seeded by signals.seed_demo_data (post_migrate)
SUPER_ADMIN = "superadmin@org.com"
ENGINEER = "engineer@customer.com"


class FakeResponse:
    def __init__(self, status_code=200, body=None):
        self.status_code = status_code
        self._body = body if body is not None else {}

    def json(self):
        return self._body


def three_tp_ok(token):
    return FakeResponse(200, {"token": token, "refreshToken": "r-" + token})


class ThreeTPAuthTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    # ----------------------------------------------------------- helpers
    def login(self, email, token):
        with mock.patch("account.views.requests.post", return_value=three_tp_ok(token)) as post:
            res = self.client.post(
                "/api/auth/login/", {"email": email, "password": "pw"}, format="json"
            )
        return res, post

    def as_user(self, email, token):
        res, _ = self.login(email, token)
        self.assertEqual(res.status_code, 200, res.content)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return client

    # ------------------------------------------------------------- login
    def test_login_returns_3tp_token_and_user(self):
        res, post = self.login(SUPER_ADMIN, "jwt-super")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.json()["token"], "jwt-super")
        self.assertEqual(res.json()["user"]["email"], SUPER_ADMIN)

    def test_login_calls_3tp_without_trailing_slash_and_with_username(self):
        _, post = self.login(SUPER_ADMIN, "jwt-super")
        url = post.call_args.args[0]
        body = post.call_args.kwargs["json"]
        self.assertTrue(url.endswith("/api/auth/login"), url)
        self.assertEqual(body["username"], SUPER_ADMIN)
        self.assertEqual(body["password"], "pw")

    def test_login_rejected_by_3tp(self):
        with mock.patch(
            "account.views.requests.post",
            return_value=FakeResponse(401, {"message": "Invalid username or password"}),
        ):
            res = self.client.post(
                "/api/auth/login/", {"email": SUPER_ADMIN, "password": "bad"}, format="json"
            )
        self.assertEqual(res.status_code, 401)

    def test_login_user_missing_locally(self):
        res, _ = self.login("nobody@example.com", "jwt-x")
        self.assertEqual(res.status_code, 403)

    # --------------------------------------------------- token acceptance
    def test_bearer_and_legacy_token_scheme_both_work(self):
        self.login(SUPER_ADMIN, "jwt-a")
        for scheme in ("Bearer", "Token"):
            c = APIClient()
            c.credentials(HTTP_AUTHORIZATION=f"{scheme} jwt-a")
            self.assertEqual(c.get("/api/ac-data/status/").status_code, 200, scheme)

    def test_fake_token_rejected(self):
        c = APIClient()
        c.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
        self.assertEqual(c.get("/api/ac-data/status/").status_code, 401)

    # ------------------------------------- previously unprotected endpoints
    def test_previously_open_endpoints_now_require_auth(self):
        anon = APIClient()
        self.assertEqual(anon.get("/api/ac-data/status/").status_code, 401)
        self.assertEqual(anon.get("/api/org/device/").status_code, 401)
        self.assertEqual(anon.get("/api/org/dashboard/trends/").status_code, 401)
        self.assertEqual(anon.put("/api/v1/filters/locations/zone/1/", {}, format="json").status_code, 401)
        self.assertEqual(anon.delete("/api/v1/filters/locations/zone/1/").status_code, 401)

    def test_org_device_and_trends_work_when_authenticated(self):
        c = self.as_user(SUPER_ADMIN, "jwt-s")
        self.assertEqual(c.get("/api/org/device/").status_code, 200)
        self.assertEqual(c.get("/api/org/dashboard/trends/").status_code, 200)

    def test_location_detail_roles(self):
        eng = self.as_user(ENGINEER, "jwt-e")
        self.assertEqual(eng.delete("/api/v1/filters/locations/zone/999999/").status_code, 403)
        self.assertEqual(eng.put("/api/v1/filters/locations/zone/999999/", {}, format="json").status_code, 403)

        admin = self.as_user(SUPER_ADMIN, "jwt-s")
        # Authorised callers get the original behaviour (404 for an unknown id)
        self.assertEqual(admin.delete("/api/v1/filters/locations/zone/999999/").status_code, 404)
        self.assertEqual(admin.put("/api/v1/filters/locations/zone/999999/", {}, format="json").status_code, 404)
        self.assertEqual(admin.delete("/api/v1/filters/locations/bogus/1/").status_code, 400)

    # ------------------------------------------------------------ logout
    def test_logout_invalidates_3tp_token(self):
        c = self.as_user(SUPER_ADMIN, "jwt-out")
        self.assertEqual(c.get("/api/ac-data/status/").status_code, 200)
        self.assertEqual(c.post("/api/auth/logout/").status_code, 200)
        self.assertEqual(c.get("/api/ac-data/status/").status_code, 401)

    def test_me_endpoint(self):
        c = self.as_user(SUPER_ADMIN, "jwt-me")
        res = c.get("/api/auth/me/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["email"], SUPER_ADMIN)
        self.assertEqual(APIClient().get("/api/auth/me/").status_code, 401)

    # ------------------------------------------------- full URL sweep
    def test_every_api_url_requires_auth_except_login(self):
        """No route under /api/ may answer an anonymous request with anything but 401."""
        samples = {"int": "1", "uuid": str(uuid.uuid4()), "str": "zone", "slug": "x"}

        def walk(patterns, prefix=""):
            for p in patterns:
                route = prefix + str(p.pattern)
                if isinstance(p, URLPattern):
                    yield route, p
                else:
                    yield from walk(p.url_patterns, route)

        anon = APIClient()
        checked = []
        for route, pattern in walk(get_resolver().url_patterns):
            if not route.startswith("api/") or route.startswith("api/auth/login"):
                continue
            path = "/" + route
            path = re.sub(r"<int:\w+>", samples["int"], path)
            path = re.sub(r"<uuid:\w+>", samples["uuid"], path)
            path = re.sub(r"<str:\w+>", samples["str"], path)
            for method in ("get", "post", "put", "delete"):
                res = getattr(anon, method)(path)
                checked.append((method.upper(), path, res.status_code))
                self.assertEqual(
                    res.status_code, 401, f"{method.upper()} {path} -> {res.status_code}"
                )
        self.assertGreater(len(checked), 40)
