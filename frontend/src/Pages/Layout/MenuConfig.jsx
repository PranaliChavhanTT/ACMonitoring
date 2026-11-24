
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Settings,
  UserCog,
  Ticket,
  ClipboardList,
  HardHat,
  Wrench,
  MapPin,
  Bell,
  Radio,
  MapPinned,
  AirVent,
  ChartNoAxesCombined,
  Network,
} from "lucide-react";

export const UNDER_DEV_LABEL_STYLE = {
  color: "#dc2626",
  fontSize: "0.75rem",
};

export const UNDER_DEV_ICON_SIZE = 18;

export const ROLES = {
  ORG_SUPER_ADMIN: "ORG_SUPER_ADMIN",
  CUSTOMER: "CUSTOMER",
  BR_ADMIN: "BR_ADMIN",
  ENGINEER: "ENGINEER",

  // ZONAL_ADMIN: "ZONAL_ADMIN",
  // CIRCLE_ADMIN: "CIRCLE_ADMIN",
};

export const ROLE_LABELS = {
  [ROLES.ORG_SUPER_ADMIN]: "Super Admin",
  [ROLES.CUSTOMER]: "Customer",
  [ROLES.BR_ADMIN]: "Branch Admin",
  [ROLES.ENGINEER]: "Engineer",

  // [ROLES.ZONAL_ADMIN]: "Zonal Admin",
  // [ROLES.CIRCLE_ADMIN]: "Circle Admin",
};

export const ROLE_SCOPE = {
  [ROLES.ORG_SUPER_ADMIN]: null,
  [ROLES.CUSTOMER]: "CUSTOMER",
  [ROLES.BR_ADMIN]: "BRANCH",
  [ROLES.ENGINEER]: "SITE",

  // [ROLES.ZONAL_ADMIN]: "ZONE",
  // [ROLES.CIRCLE_ADMIN]: "CIRCLE",
};

export const ROLE_DASHBOARD = {
  [ROLES.ORG_SUPER_ADMIN]: "/org/dashboard",
  [ROLES.CUSTOMER]: "/dashboard",
  [ROLES.BR_ADMIN]: "/admin/dashboard",
  [ROLES.ENGINEER]: "/engineer/dashboard",

  // [ROLES.ZONAL_ADMIN]: "/admin/dashboard",
  // [ROLES.CIRCLE_ADMIN]: "/admin/dashboard",
};

export const MENU_CONFIG = {
  [ROLES.ORG_SUPER_ADMIN]: [
    { label: "Dashboard", path: "/org/dashboard", icon: LayoutDashboard },
    {
      label: "Master",
      icon: UserCog,
      children: [
        { label: "Customers", path: "/org/customers", icon: Users },
        { label: "Admins", path: "/org/admins", icon: HardHat },
        { label: "Engineers", path: "/org/engineers", icon: Wrench },
        { label: "Branch's", path: "/org/locations", icon: MapPinned },
        // { label: "Organizational Hierarchy", path: "/org/hierarchy", icon: Network },
        { label: "AC's", path: "/org/device", icon: AirVent },
      ],
    },
    {
      label: "Analytics",
      path: "/org/analytics",
      icon: ChartNoAxesCombined,
    },
    {
      label: "Reports (Under Development)",
      path: "/org/reports",
      icon: FileBarChart,
      underDevelopment: true,
    },
    {
      label: "Settings (Under Development)",
      path: "/org/settings",
      icon: Settings,
      underDevelopment: true,
    },
  ],

  [ROLES.CUSTOMER]: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Admins", path: "/admins", icon: HardHat },
    { label: "Engineers", path: "/engineers", icon: Wrench },
    { label: "Branch's", path: "/locations", icon: MapPinned },
    { label: "AC's", path: "/device", icon: AirVent },
    { label: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
    { label: "Reports", path: "/reports", icon: FileBarChart },
    { label: "Settings", path: "/settings", icon: Settings },
  ],

  [ROLES.BR_ADMIN]: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Branch's", path: "/admin/sites", icon: Radio },
    { label: "AC's", path: "/admin/device", icon: AirVent },
    { label: "Engineers", path: "/admin/engineers", icon: HardHat },
    { label: "Analytics", path: "/admin/analytics", icon: ChartNoAxesCombined },
    { label: "Reports", path: "/admin/reports", icon: FileBarChart },
  ],

  [ROLES.ENGINEER]: [
    { label: "Dashboard", path: "/engineer/dashboard", icon: LayoutDashboard },
    { label: "My Branch's", path: "/engineer/sites", icon: MapPin },
    { label: "My Tasks", path: "/engineer/tasks", icon: ClipboardList },
    // { label: "Analytics", path: "/engineer/analytics", icon: ChartNoAxesCombined },
    // { label: "Tickets", path: "/engineer/tickets", icon: Ticket },
    // { label: "Maintenance", path: "/engineer/maintenance", icon: Wrench },
    { label: "Alerts", path: "/engineer/alerts", icon: Bell },
  ],
};

// ── Helpers for the menu renderer ──────────────────────────────────────────

// Props to spread on the <span> holding the label.
export const getLabelProps = (item) =>
  item?.underDevelopment
    ? { style: UNDER_DEV_LABEL_STYLE, "aria-label": "Under development" }
    : {};

// Icon size to use (smaller when under development).
export const getIconSize = (item, defaultSize = 18) =>
  item?.underDevelopment ? UNDER_DEV_ICON_SIZE : defaultSize;

const flattenMenu = (items = []) =>
  items.flatMap((item) => [
    ...(item.path ? [item] : []),
    ...flattenMenu(item.children || []),
  ]);

export const getMenusForRole = (role) => MENU_CONFIG[role] || [];

export const getDashboardPath = (role) => ROLE_DASHBOARD[role] || "/login";

export const canAccessPath = (role, path) =>
  flattenMenu(getMenusForRole(role)).some((m) => m.path === path);

export const getAllowedPaths = (role) =>
  flattenMenu(getMenusForRole(role)).map((m) => m.path);