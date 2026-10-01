from django.urls import path

from .views import (
    AdminDetailView,
    AdminListView,
    BranchListView,
    CircleListView,
    CustomerDetailView,
    CustomerListView,
    EngDetailView,
    EngListView,
    FloorListView,
    OrganizationListView,
    SiteListView,
    TalukaListView,
    UserListView,
    ZoneListView, StateListView, DistrictListView,
    ac_data,
    branch_assignments,
    dashboard_summary_view,
    device,
    devices,
    latest_ac_data,
    location_detail,
    locations,
    login_view,
    logout_view,
    ac_data_with_location,
    telemetry_status,
    LocationListView,
    treands,
)

urlpatterns = [
    path( "ac-data/", ac_data),
    path( "ac-data/latest/", latest_ac_data),
    path( "ac-data/status/", telemetry_status),
    path( "ac-data/with-location/", ac_data_with_location ),

    path( "v1/filters/locations/", locations),
    path("v1/filters/locations/<str:location_type>/<int:location_id>/", location_detail),
    
    path( "devices/", devices ),

    path( "auth/login/", login_view, name="login" ),
    path( "auth/logout/", logout_view),

    path( "organizations/", OrganizationListView.as_view() ),
    path( "customers/", CustomerListView.as_view()),
    path( "customers/<int:pk>/", CustomerDetailView.as_view()),
    path( "admins/", AdminListView.as_view()),
    path( "admins/<uuid:pk>/", AdminDetailView.as_view()),
    path( "engineers/", EngListView.as_view()),
    path( "engineer/<uuid:pk>/", EngDetailView.as_view()),

    path( "org/device/", device),
    path( "org/dashboard/trends/", treands),

    path( "zones/", ZoneListView.as_view()),
    path( "circles/", CircleListView.as_view()),
    path( "sites/", SiteListView.as_view()),

    path( "states/", StateListView.as_view()),
    path( "districts/", DistrictListView.as_view()),
    path( "talukas/", TalukaListView.as_view()),

    path( "branches/", BranchListView.as_view()),
    path( "floors/", FloorListView.as_view()),
    path( "users/", UserListView.as_view()),

    path( "branches/assignments/", branch_assignments),

    path( "dashboard/summary/", dashboard_summary_view ),

    # path( "dashboard/"),
    # path( "locations/"),
    # path( "admins/"),
    # path( "engineers/"),
    # path( "reports/"),
    # path( "settings/"),
# /org/dashboard/trends
]