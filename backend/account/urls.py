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
    OrganizationListView,
    SiteListView,
    UserListView,
    ZoneListView,
    ac_data,
    dashboard_summary_view,
    devices,
    latest_ac_data,
    location_detail,
    locations,
    login_view,
    logout_view,
    ac_data_with_location,
    LocationListView,
)

urlpatterns = [
    path( "ac-data/", ac_data),
    path( "ac-data/latest/", latest_ac_data),
    path( "ac-data/with-location/", ac_data_with_location ),

    path("v1/filters/locations/", locations),
    path("v1/filters/locations/<str:location_type>/<int:location_id>/", location_detail),
    
    # path( "v1/filters/locations/", locations ),
    # path( "v1/filters/locations/<str:location_type>/<int:location_id>/", location_detail),

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

    path( "zones/", ZoneListView.as_view()),
    path( "circles/", CircleListView.as_view()),
    path( "branches/", BranchListView.as_view()),
    path( "sites/", SiteListView.as_view()),
    path( "users/", UserListView.as_view()),
    path( "dashboard/summary/", dashboard_summary_view ),

    # path( "dashboard/"),
    # path( "locations/"),
    # path( "admins/"),
    # path( "engineers/"),
    # path( "reports/"),
    # path( "settings/"),

]