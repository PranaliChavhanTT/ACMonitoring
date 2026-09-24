// // // import { useNavigate, useLocation } from "react-router-dom";
// // // import { LayoutDashboard, LogOut, X } from "lucide-react";
// // // import { menuConfig } from "./MenuConfig";
// // // import "./Sidebar.css";

// // // const ICONS = {
// // //   Dashboard: LayoutDashboard,
// // // };

// // // function Sidebar({ collapsed, mobileOpen, onClose }) {
// // //   const role = sessionStorage.getItem("role");
// // //   const menu = menuConfig[role] || menuConfig.MASTER;

// // //   const navigate = useNavigate();
// // //   const { pathname } = useLocation();

// // //   const handleLogout = () => {
// // //     sessionStorage.clear();
// // //     window.location.href = "/";
// // //   };

// // //   return (
// // //     <aside
// // //       className={[
// // //         "sidebar",
// // //         collapsed ? "collapsed" : "",
// // //         mobileOpen ? "mobile-open" : "",
// // //       ]
// // //         .filter(Boolean)
// // //         .join(" ")}
// // //     >
// // //       <div className="sidebar-brand">
// // //         {/* <div className="brand-mark">ACM</div> */}
// // //         <h2>AC Monitoring</h2>
// // //         {/* <h2>AC<span>Monitoring</span></h2> */}

// // //         <button
// // //           type="button"
// // //           className="sidebar-close"
// // //           onClick={onClose}
// // //           aria-label="Close menu"
// // //         >
// // //           <X size={18} />
// // //         </button>
// // //       </div>

// // //       <nav className="sidebar-nav">
// // //         {menu.map((item) => {
// // //           const Icon = ICONS[item.label] || LayoutDashboard;
// // //           const isActive = pathname === item.path;

// // //           return (
// // //             <button
// // //               key={item.label}
// // //               type="button"
// // //               className={`nav-item ${isActive ? "active" : ""}`}
// // //               onClick={() => {
// // //                 navigate(item.path);
// // //                 onClose?.();
// // //               }}
// // //               title={collapsed ? item.label : undefined}
// // //             >
// // //               <span className="nav-icon">
// // //                 {/* <Icon size={18} /> */}
// // //               </span>
// // //               <span className="nav-label">{item.label}</span>
// // //             </button>
// // //           );
// // //         })}
// // //       </nav>

// // //       <div className="sidebar-foot">
// // //         <button type="button" className="logout-btn" onClick={handleLogout}>
// // //           <LogOut size={18} />
// // //           <span>Logout</span>
// // //         </button>
// // //       </div>
// // //     </aside>
// // //   );
// // // }

// // // export default Sidebar;


// // // src/components/Sidebar.jsx
// // import React from "react";
// // import { NavLink } from "react-router-dom";
// // import { useAuth } from "../context/AuthContext";
// // import { getMenusForRole, ROLE_LABELS } from "../config/MenuConfig";

// // export default function Sidebar() {
// //   const { user, logout } = useAuth();
// //   if (!user) return null;

// //   const menus = getMenusForRole(user.role);

// //   return (
// //     <aside className="sidebar">
// //       <div className="sidebar-brand">TeleTrack</div>

// //       <div className="sidebar-user">
// //         <div className="avatar">{user.name.charAt(0)}</div>
// //         <div>
// //           <p className="u-name">{user.name}</p>
// //           <p className="u-role">{ROLE_LABELS[user.role]}</p>
// //           {user.scopeName && <p className="u-scope">{user.scopeName}</p>}
// //         </div>
// //       </div>

// //       <nav className="sidebar-nav">
// //         {menus.map(({ label, path, icon: Icon }) => (
// //           <NavLink
// //             key={path}
// //             to={path}
// //             className={({ isActive }) =>
// //               `nav-item ${isActive ? "active" : ""}`
// //             }
// //           >
// //             {Icon && <Icon size={17} />}
// //             <span>{label}</span>
// //           </NavLink>
// //         ))}
// //       </nav>

// //       <button className="logout-btn" onClick={logout}>
// //         Logout
// //       </button>
// //     </aside>
// //   );
// // }


// // src/components/Sidebar.jsx
// import { useNavigate, useLocation } from "react-router-dom";
// import { LogOut, X } from "lucide-react";
// import { useAuth } from "./AuthContext";
// import { getMenusForRole } from "./MenuConfig";
// import "./Sidebar.css";

// function Sidebar({ collapsed, mobileOpen, onClose }) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const { pathname } = useLocation();

//   const menu = getMenusForRole(user?.role);

//   const handleLogout = () => {
//     logout();
//     navigate("/login", { replace: true });
//   };

//   return (
//     <aside
//       className={[
//         "sidebar",
//         collapsed ? "collapsed" : "",
//         mobileOpen ? "mobile-open" : "",
//       ]
//         .filter(Boolean)
//         .join(" ")}
//     >
//       <div className="sidebar-brand">
//         <h2>AC Monitoring</h2>

//         <button
//           type="button"
//           className="sidebar-close"
//           onClick={onClose}
//           aria-label="Close menu"
//         >
//           <X size={18} />
//         </button>
//       </div>

//       <nav className="sidebar-nav">
//         {menu.map((item) => {
//           const Icon = item.icon;
//           const isActive = pathname === item.path;

//           return (
//             <button
//               key={item.path}
//               type="button"
//               className={`nav-item ${isActive ? "active" : ""}`}
//               onClick={() => {
//                 navigate(item.path);
//                 onClose?.();
//               }}
//               title={collapsed ? item.label : undefined}
//             >
//               <span className="nav-icon">
//                 {Icon ? <Icon size={18} /> : null}
//               </span>
//               <span className="nav-label">{item.label}</span>
//             </button>
//           );
//         })}
//       </nav>

//       <div className="sidebar-foot">
//         <button type="button" className="logout-btn" onClick={handleLogout}>
//           <LogOut size={18} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// }

// export default Sidebar;


import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, X, ChevronDown } from "lucide-react";
import { useAuth } from "./AuthContext";
import { getMenusForRole } from "./MenuConfig";
import "./Sidebar.css";

const isPathActive = (pathname, path) => {
  if (!path) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
};

const hasActiveChild = (item, pathname) => {
  if (!item?.children?.length) return false;

  return item.children.some(
    (child) =>
      isPathActive(pathname, child.path) || hasActiveChild(child, pathname)
  );
};

function Sidebar({ collapsed, mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState({});

  const menu = useMemo(() => getMenusForRole(user?.role), [user?.role]);

  useEffect(() => {
    const activeGroups = {};

    const collectActiveGroups = (items) => {
      items.forEach((item) => {
        if (item.children?.length && hasActiveChild(item, pathname)) {
          activeGroups[item.label] = true;
          collectActiveGroups(item.children);
        }
      });
    };

    collectActiveGroups(menu);

    if (Object.keys(activeGroups).length) {
      setOpenGroups((prev) => ({ ...prev, ...activeGroups }));
    }
  }, [menu, pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleNavigate = (path) => {
    if (!path) return;

    navigate(path);
    onClose?.();
  };

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderItems = (items, level = 0) =>
    items.map((item) => {
      const Icon = item.icon;
      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;

      const isActive =
        isPathActive(pathname, item.path) || hasActiveChild(item, pathname);

      const isOpen = !!openGroups[item.label];

      if (hasChildren) {
        return (
          <div key={item.label} className="nav-group">
            <button
              type="button"
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => toggleGroup(item.label)}
              title={collapsed ? item.label : undefined}
              style={{ paddingLeft: `${12 + level * 14}px` }}
            >
              <span className="nav-icon">
                {Icon ? <Icon size={18} /> : null}
              </span>

              <span className="nav-label">{item.label}</span>

              <span className={`nav-chevron ${isOpen ? "open" : ""}`}>
                <ChevronDown size={16} />
              </span>
            </button>

            {isOpen && (
              <div className="nav-children">
                {renderItems(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={item.path || item.label}
          type="button"
          className={`nav-item ${isActive ? "active" : ""}`}
          onClick={() => handleNavigate(item.path)}
          title={collapsed ? item.label : undefined}
          style={{ paddingLeft: `${12 + level * 14}px` }}
        >
          <span className="nav-icon">
            {Icon ? <Icon size={18} /> : null}
          </span>

          <span className="nav-label">{item.label}</span>
        </button>
      );
    });

  if (!user) return null;

  return (
    <aside
      className={[
        "sidebar",
        collapsed ? "collapsed" : "",
        mobileOpen ? "mobile-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="sidebar-brand">
        <h2>AC Monitoring</h2>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">{renderItems(menu)}</nav>

      <div className="sidebar-foot">
        <button type="button" className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;