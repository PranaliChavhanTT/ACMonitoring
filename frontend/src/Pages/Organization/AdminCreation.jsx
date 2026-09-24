
// // // // // import React, { useCallback, useEffect, useMemo, useState } from "react";
// // // // // import {
// // // // //   FiTrash2, FiPlus, FiArrowLeft, FiMapPin, FiCheckCircle,
// // // // //   FiUserPlus, FiEdit2, FiEdit3,
// // // // // } from "react-icons/fi";
// // // // // import "./AdminCreation.css";

// // // // // const API_BASE   = "http://localhost:8000/api";
// // // // // const USERS_URL  = `${API_BASE}/admins/`;
// // // // // const CUST_URL  = "/admins/";
// // // // // const ZONES_URL  = `${API_BASE}/zones/`;

// // // // // const getToken = () =>
// // // // //   localStorage.getItem("token") ||
// // // // //   localStorage.getItem("authToken") ||
// // // // //   localStorage.getItem("access_token") ||
// // // // //   localStorage.getItem("accessToken") ||
// // // // //   "";

// // // // // const authHeaders = () => {
// // // // //   const token = getToken();
// // // // //   return {
// // // // //     "Content-Type": "application/json",
// // // // //     ...(token ? { Authorization: `Token ${token}` } : {}),
// // // // //   };
// // // // // };

// // // // // const ADMIN_ROLES = [
// // // // //   "ORG_SUPER_ADMIN", "CUSTOMER", "ZONAL_ADMIN", "CIRCLE_ADMIN",
// // // // //   "BR_ADMIN", "ENGINEER",
// // // // // ];

// // // // // const ROLE_LABEL = {
// // // // //   ORG_SUPER_ADMIN: "Org Super Admin",
// // // // //   CUSTOMER:      "Customer Admin",
// // // // //   ZONAL_ADMIN:     "Zonal Admin",
// // // // //   CIRCLE_ADMIN:    "Circle Admin",
// // // // //   BR_ADMIN:        "Branch Admin",
// // // // //   ENGINEER:        "Engineer",
// // // // // };

// // // // // const emptyForm = {
// // // // //   id:       null,
// // // // //   name:     "",
// // // // //   email:    "",
// // // // //   phone:    "",
// // // // //   role:     "CUSTOMER",
// // // // //   password: "",
// // // // //   is_active: true,
// // // // // };

// // // // // function normalizeList(result) {
// // // // //   if (Array.isArray(result))                   return result;
// // // // //   if (result && Array.isArray(result.data))    return result.data;
// // // // //   if (result && Array.isArray(result.results)) return result.results;
// // // // //   return [];
// // // // // }

// // // // // function Admin_Creation() {
// // // // //   const [view, setView] = useState("list");

// // // // //   const [users, setUsers]     = useState([]);
// // // // //   const [zones, setZones]     = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError]     = useState("");
// // // // //   const [search, setSearch]   = useState("");

// // // // //   // create / edit form
// // // // //   const [form, setForm]           = useState(emptyForm);
// // // // //   const [formError, setFormError] = useState("");
// // // // //   const [saving, setSaving]       = useState(false);
// // // // //   const isEditing = Boolean(form.id);

// // // // //   // assign step
// // // // //   const [pendingAdmin, setPendingAdmin] = useState(null);
// // // // //   const [selectedZone, setSelectedZone] = useState("");
// // // // //   const [assignError, setAssignError]   = useState("");
// // // // //   const [assigning, setAssigning]       = useState(false);
// // // // //   const [zonesLoading, setZonesLoading] = useState(false);

// // // // //   // delete
// // // // //   const [confirmDelete, setConfirmDelete] = useState(null);
// // // // //   const [deleting, setDeleting]           = useState(false);

// // // // //   const fetchUsers = useCallback(async () => {
// // // // //     try {
// // // // //       setError("");
// // // // //       const res = await fetch(USERS_URL, {
// // // // //         method: "GET",
// // // // //         cache: "no-store",
// // // // //         headers: authHeaders(),
// // // // //       });
// // // // //       if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
// // // // //       if (!res.ok)            throw new Error(`HTTP ${res.status}`);
// // // // //       const result = await res.json();
// // // // //       setUsers(normalizeList(result));
// // // // //     } catch (err) {
// // // // //       setError(err.message || "Unable to load admins.");
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   }, []);

// // // // //   useEffect(() => { fetchUsers(); }, [fetchUsers]);

// // // // //   const fetchZones = useCallback(async () => {
// // // // //     setZonesLoading(true);
// // // // //     try {
// // // // //       const res = await fetch(ZONES_URL, {
// // // // //         method: "GET",
// // // // //         cache: "no-store",
// // // // //         headers: authHeaders(),
// // // // //       });
// // // // //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// // // // //       const result = await res.json();
// // // // //       setZones(normalizeList(result));
// // // // //     } catch (err) {
// // // // //       setAssignError(err.message || "Unable to load zones.");
// // // // //     } finally {
// // // // //       setZonesLoading(false);
// // // // //     }
// // // // //   }, []);

// // // // //   const adminUsers = useMemo(
// // // // //     () => users.filter((u) => ADMIN_ROLES.includes(u.role)),
// // // // //     [users]
// // // // //   );

// // // // //   const filteredAdmins = useMemo(() => {
// // // // //     const q = search.trim().toLowerCase();
// // // // //     if (!q) return adminUsers;
// // // // //     return adminUsers.filter((u) =>
// // // // //       [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role]]
// // // // //         .filter(Boolean)
// // // // //         .some((f) => String(f).toLowerCase().includes(q))
// // // // //     );
// // // // //   }, [adminUsers, search]);

// // // // //   const goToCreate = () => {
// // // // //     setForm(emptyForm);
// // // // //     setFormError("");
// // // // //     setView("form");
// // // // //   };

// // // // //   const openEditPanel = (admin) => {
// // // // //     setForm({
// // // // //       id : admin.id,
// // // // //       name : admin.name || "",
// // // // //       email : admin.email || "",
// // // // //       phone : admin.phone || "",
// // // // //       role : admin.role || "CUSTOMER",
// // // // //       password : "",
// // // // //       is_active : admin.is_active ?? true,
// // // // //     });
// // // // //     setFormError("");
// // // // //     setView("form");
// // // // //   };

// // // // //   const backToList = () => {
// // // // //     setView("list");
// // // // //     setForm(emptyForm);
// // // // //     setFormError("");
// // // // //     setPendingAdmin(null);
// // // // //     setSelectedZone("");
// // // // //     setAssignError("");
// // // // //   };

// // // // //   const handleFieldChange = (field, value) =>
// // // // //     setForm((prev) => ({ ...prev, [field]: value }));

// // // // //   const handleSubmit = async (e) => {
// // // // //     e.preventDefault();
// // // // //     setFormError("");

// // // // //     if (!form.name.trim())  return setFormError("Name is required.");
// // // // //     if (!form.email.trim()) return setFormError("Email is required.");

// // // // //     // Password required only when creating
// // // // //     if (!isEditing && !form.password.trim()) {
// // // // //       return setFormError("Password is required.");
// // // // //     }

// // // // //     const payload = {
// // // // //       name : form.name.trim(),
// // // // //       email : form.email.trim().toLowerCase(),
// // // // //       phone : form.phone.trim(),
// // // // //       role : form.role,
// // // // //       is_active : form.is_active,
// // // // //     };

// // // // //     if (form.password.trim()) {
// // // // //       payload.password = form.password;
// // // // //     }

// // // // //     setSaving(true);
// // // // //     try {
// // // // //       const url    = isEditing ? `${USERS_URL}${form.id}/` : USERS_URL;
// // // // //       const method = isEditing ? "PATCH" : "POST";

// // // // //       const res = await fetch(url, {
// // // // //         method,
// // // // //         headers: authHeaders(),
// // // // //         body: JSON.stringify(payload),
// // // // //       });

// // // // //       if (!res.ok) {
// // // // //         const errBody = await res.json().catch(() => ({}));
// // // // //         const message =
// // // // //           typeof errBody === "object" && errBody !== null
// // // // //             ? Object.entries(errBody)
// // // // //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// // // // //                 .join(" | ")
// // // // //             : `HTTP ${res.status}`;
// // // // //         throw new Error(message || `HTTP ${res.status}`);
// // // // //       }

// // // // //       const saved = await res.json();

// // // // //       if (isEditing) {
// // // // //         await fetchUsers();
// // // // //         backToList();
// // // // //       } else {
// // // // //           fetchUsers();
// // // // //           setPendingAdmin(saved);
// // // // //           setSelectedZone(saved.zone ?? "");
// // // // //           setAssignError("");
// // // // //           setView("assign");
// // // // //           fetchZones();
// // // // //         }
// // // // //     } catch (err) {
// // // // //       setFormError(err.message || "Could not save admin.");
// // // // //     } finally {
// // // // //       setSaving(false);
// // // // //     }
// // // // //   };

// // // // //   const openAssignFor = (admin) => {
// // // // //     setPendingAdmin(admin);
// // // // //     setSelectedZone(admin.zone ?? "");
// // // // //     setAssignError("");
// // // // //     setView("assign");
// // // // //     fetchZones();
// // // // //   };

// // // // //   const handleAssignSave = async () => {
// // // // //     if (!pendingAdmin) return;
// // // // //     if (!selectedZone) return setAssignError("Please pick a zone.");

// // // // //     setAssigning(true);
// // // // //     setAssignError("");
// // // // //     try {
// // // // //       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
// // // // //         method: "PATCH",
// // // // //         headers: authHeaders(),
// // // // //         body: JSON.stringify({ zone: selectedZone }),
// // // // //       });

// // // // //       if (!res.ok) {
// // // // //         const errBody = await res.json().catch(() => ({}));
// // // // //         const message =
// // // // //           typeof errBody === "object" && errBody !== null
// // // // //             ? Object.entries(errBody)
// // // // //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// // // // //                 .join(" | ")
// // // // //             : `HTTP ${res.status}`;
// // // // //         throw new Error(message || `HTTP ${res.status}`);
// // // // //       }

// // // // //       await fetchUsers();
// // // // //       backToList();
// // // // //     } catch (err) {
// // // // //       setAssignError(err.message || "Could not assign zone.");
// // // // //     } finally {
// // // // //       setAssigning(false);
// // // // //     }
// // // // //   };

// // // // //   const handleDelete = async () => {
// // // // //     if (!confirmDelete || deleting) return;
// // // // //     setDeleting(true);
// // // // //     try {
// // // // //       const res = await fetch(`${USERS_URL}${confirmDelete.id}/`, {
// // // // //         method: "DELETE",
// // // // //         headers: authHeaders(),
// // // // //       });
// // // // //       if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
// // // // //       setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
// // // // //       setConfirmDelete(null);
// // // // //     } catch (err) {
// // // // //       setError(err.message || "Could not delete admin.");
// // // // //       setConfirmDelete(null);
// // // // //     } finally {
// // // // //       setDeleting(false);
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div className="admins-page">

// // // // //       {/* STEPPER */}
// // // // //       <ol className="admins-stepper">
// // // // //         <li className={view === "list" ? "active" : "done"}>
// // // // //           <span className="step-num">1</span> Admins
// // // // //         </li>
// // // // //         <li className={view === "form" ? "active" : view === "assign" ? "done" : ""}>
// // // // //           <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
// // // // //         </li>
// // // // //         <li className={view === "assign" ? "active" : ""}>
// // // // //           <span className="step-num">3</span> Assign Zone
// // // // //         </li>
// // // // //       </ol>

// // // // //       {view === "list" && (
// // // // //         <>
// // // // //           <div className="admins-header">
// // // // //             <div>
// // // // //               <h1>Admins</h1>
// // // // //               <p>Manage the admins under your organization</p>
// // // // //             </div>
// // // // //             <button className="btn-primary" onClick={goToCreate}>
// // // // //               <FiPlus /> Add Admin
// // // // //             </button>
// // // // //           </div>

// // // // //           <div className="admins-toolbar">
// // // // //             <input
// // // // //               type="text"
// // // // //               className="admins-search"
// // // // //               placeholder="Search by name, email, phone or role..."
// // // // //               value={search}
// // // // //               onChange={(e) => setSearch(e.target.value)}
// // // // //             />
// // // // //             <span className="admins-count">
// // // // //               {filteredAdmins.length} of {adminUsers.length} admins
// // // // //             </span>
// // // // //           </div>

// // // // //           {error && <div className="admins-error">{error}</div>}

// // // // //           <div className="admins-table-card">
// // // // //             {loading ? (
// // // // //               <div className="admins-loading">Loading admins...</div>
// // // // //             ) : filteredAdmins.length === 0 ? (
// // // // //               <div className="admins-empty">
// // // // //                 {adminUsers.length === 0
// // // // //                   ? "No admins yet. Click “Add Admin” to create one."
// // // // //                   : "No admins match your search."}
// // // // //               </div>
// // // // //             ) : (
// // // // //               <table className="admins-table">
// // // // //                 <thead>
// // // // //                   <tr>
// // // // //                     <th>Name</th>
// // // // //                     <th>Email</th>
// // // // //                     <th>Phone</th>
// // // // //                     <th>Role</th>
// // // // //                     <th>Zone</th>
// // // // //                     <th>Status</th>
// // // // //                     <th className="actions-col">Actions</th>
// // // // //                   </tr>
// // // // //                 </thead>
// // // // //                 <tbody>
// // // // //                   {filteredAdmins.map((u) => (
// // // // //                     <tr key={u.id}>
// // // // //                       <td><strong>{u.name || "-"}</strong></td>
// // // // //                       <td>{u.email}</td>
// // // // //                       <td>{u.phone || "-"}</td>
// // // // //                       <td>{ROLE_LABEL[u.role] || u.role}</td>
// // // // //                       <td>{u.zone_name || u.scope_name || "-"}</td>
// // // // //                       <td>
// // // // //                         <span className={u.is_active ? "status-active" : "status-inactive"}>
// // // // //                           ● {u.is_active ? "Active" : "Inactive"}
// // // // //                         </span>
// // // // //                       </td>
// // // // //                       <td className="actions-col">
// // // // //                         <button
// // // // //                           className="btn-icon"
// // // // //                           onClick={() => openEditPanel(u)}
// // // // //                           title="Edit"
// // // // //                           aria-label="Edit"
// // // // //                         >
// // // // //                           <FiEdit2 size={16} />
// // // // //                         </button>
// // // // //                         <button
// // // // //                           className="btn-icon"
// // // // //                           onClick={() => openAssignFor(u)}
// // // // //                           title="Assign zone"
// // // // //                           aria-label="Assign zone"
// // // // //                         >
// // // // //                           <FiMapPin size={16} />
// // // // //                         </button>
// // // // //                         <button
// // // // //                           className="btn-icon btn-icon-danger"
// // // // //                           onClick={() => setConfirmDelete(u)}
// // // // //                           title="Delete"
// // // // //                           aria-label="Delete"
// // // // //                         >
// // // // //                           <FiTrash2 size={16} />
// // // // //                         </button>
// // // // //                       </td>
// // // // //                     </tr>
// // // // //                   ))}
// // // // //                 </tbody>
// // // // //               </table>
// // // // //             )}
// // // // //           </div>
// // // // //         </>
// // // // //       )}

// // // // //       {/* ================= STEP 2 — CREATE / EDIT ================= */}
// // // // //       {view === "form" && (
// // // // //         <div className="admins-panel">
// // // // //           <button className="btn-back" onClick={backToList}>
// // // // //             <FiArrowLeft /> Back to list
// // // // //           </button>

// // // // //           <div className="admins-panel-header">
// // // // //             {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
// // // // //             <div>
// // // // //               <h2>{isEditing ? "Edit Admin" : "Create Admin"}</h2>
// // // // //               <p>
// // // // //                 {isEditing
// // // // //                   ? `Update details for ${form.name || form.email}.`
// // // // //                   : "Add a new admin. You'll assign a zone in the next step."}
// // // // //               </p>
// // // // //             </div>
// // // // //           </div>

// // // // //           <form onSubmit={handleSubmit} className="admins-form">
// // // // //             <div className="form-grid">
// // // // //               <label>
// // // // //                 Name *
// // // // //                 <input
// // // // //                   type="text"
// // // // //                   value={form.name}
// // // // //                   onChange={(e) => handleFieldChange("name", e.target.value)}
// // // // //                   placeholder="Jane Doe"
// // // // //                   required
// // // // //                 />
// // // // //               </label>

// // // // //               <label>
// // // // //                 Email *
// // // // //                 <input
// // // // //                   type="email"
// // // // //                   value={form.email}
// // // // //                   onChange={(e) => handleFieldChange("email", e.target.value)}
// // // // //                   placeholder="jane@acme.com"
// // // // //                   required
// // // // //                 />
// // // // //               </label>

// // // // //               <label>
// // // // //                 Phone
// // // // //                 <input
// // // // //                   type="text"
// // // // //                   value={form.phone}
// // // // //                   onChange={(e) => handleFieldChange("phone", e.target.value)}
// // // // //                   placeholder="+91 98765 43210"
// // // // //                 />
// // // // //               </label>

// // // // //               <label>
// // // // //                 Role *
// // // // //                 <select
// // // // //                   value={form.role}
// // // // //                   onChange={(e) => handleFieldChange("role", e.target.value)}
// // // // //                   required
// // // // //                 >
// // // // //                   {ADMIN_ROLES.map((r) => (
// // // // //                     <option key={r} value={r}>{ROLE_LABEL[r]}</option>
// // // // //                   ))}
// // // // //                 </select>
// // // // //               </label>

// // // // //               <label>
// // // // //                 {isEditing ? "Password (leave blank to keep current)" : "Password *"}
// // // // //                 <input
// // // // //                   type="password"
// // // // //                   value={form.password}
// // // // //                   onChange={(e) => handleFieldChange("password", e.target.value)}
// // // // //                   placeholder={isEditing ? "••••••••" : "Set a password"}
// // // // //                   required={!isEditing}
// // // // //                 />
// // // // //               </label>

// // // // //               <label className="checkbox-row">
// // // // //                 <input
// // // // //                   type="checkbox"
// // // // //                   checked={form.is_active}
// // // // //                   onChange={(e) => handleFieldChange("is_active", e.target.checked)}
// // // // //                 />
// // // // //                 Active
// // // // //               </label>
// // // // //             </div>

// // // // //             {formError && <div className="form-error">{formError}</div>}

// // // // //             <div className="panel-actions">
// // // // //               <button
// // // // //                 type="button"
// // // // //                 className="btn-secondary"
// // // // //                 onClick={backToList}
// // // // //                 disabled={saving}
// // // // //               >
// // // // //                 Cancel
// // // // //               </button>
// // // // //               <button type="submit" className="btn-primary" disabled={saving}>
// // // // //                 {saving
// // // // //                   ? "Saving..."
// // // // //                   : isEditing
// // // // //                     ? "Save Changes"
// // // // //                     : "Create & Continue"}
// // // // //               </button>
// // // // //             </div>
// // // // //           </form>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* ================= STEP 3 — ASSIGN ZONE ================= */}
// // // // //       {view === "assign" && pendingAdmin && (
// // // // //         <div className="admins-panel">
// // // // //           <button className="btn-back" onClick={backToList}>
// // // // //             <FiArrowLeft /> Back to list
// // // // //           </button>

// // // // //           <div className="admins-panel-header">
// // // // //             <FiMapPin size={22} />
// // // // //             <div>
// // // // //               <h2>Assign Zone</h2>
// // // // //               <p>
// // // // //                 Assign a zone to{" "}
// // // // //                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
// // // // //               </p>
// // // // //             </div>
// // // // //           </div>

// // // // //           <div className="assign-card">
// // // // //             <div className="assign-row">
// // // // //               <span className="assign-label">Admin</span>
// // // // //               <span className="assign-value">{pendingAdmin.name}</span>
// // // // //             </div>
// // // // //             <div className="assign-row">
// // // // //               <span className="assign-label">Email</span>
// // // // //               <span className="assign-value">{pendingAdmin.email}</span>
// // // // //             </div>
// // // // //             <div className="assign-row">
// // // // //               <span className="assign-label">Role</span>
// // // // //               <span className="assign-value">
// // // // //                 {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
// // // // //               </span>
// // // // //             </div>

// // // // //             <label className="assign-select">
// // // // //               Zone *
// // // // //               {zonesLoading ? (
// // // // //                 <span className="assign-loading">Loading zones...</span>
// // // // //               ) : zones.length === 0 ? (
// // // // //                 <span className="assign-loading">No zones available.</span>
// // // // //               ) : (
// // // // //                 <select
// // // // //                   value={selectedZone}
// // // // //                   onChange={(e) => setSelectedZone(e.target.value)}
// // // // //                 >
// // // // //                   <option value="">— Select a zone —</option>
// // // // //                   {zones.map((z) => (
// // // // //                     <option key={z.id} value={z.id}>
// // // // //                       {z.name}{z.code ? ` (${z.code})` : ""}
// // // // //                     </option>
// // // // //                   ))}
// // // // //                 </select>
// // // // //               )}
// // // // //             </label>
// // // // //           </div>

// // // // //           {assignError && <div className="form-error">{assignError}</div>}

// // // // //           <div className="panel-actions">
// // // // //             <button
// // // // //               type="button"
// // // // //               className="btn-secondary"
// // // // //               onClick={backToList}
// // // // //               disabled={assigning}
// // // // //             >
// // // // //               Skip & Return to List
// // // // //             </button>
// // // // //             <button
// // // // //               type="button"
// // // // //               className="btn-primary"
// // // // //               onClick={handleAssignSave}
// // // // //               disabled={assigning || !selectedZone}
// // // // //             >
// // // // //               <FiCheckCircle /> {assigning ? "Saving..." : "Save & Return to List"}
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* ================= DELETE CONFIRMATION ================= */}
// // // // //       {confirmDelete && (
// // // // //         <div
// // // // //           className="admins-modal-overlay"
// // // // //           onClick={() => !deleting && setConfirmDelete(null)}
// // // // //         >
// // // // //           <div
// // // // //             className="admins-modal admins-modal-small"
// // // // //             onClick={(e) => e.stopPropagation()}
// // // // //           >
// // // // //             <h2>Delete Admin</h2>
// // // // //             <p>
// // // // //               Are you sure you want to delete{" "}
// // // // //               <strong>{confirmDelete.name || confirmDelete.email}</strong>?
// // // // //               This cannot be undone.
// // // // //             </p>
// // // // //             <div className="panel-actions">
// // // // //               <button
// // // // //                 className="btn-secondary"
// // // // //                 onClick={() => setConfirmDelete(null)}
// // // // //                 disabled={deleting}
// // // // //               >
// // // // //                 Cancel
// // // // //               </button>
// // // // //               <button
// // // // //                 className="btn-danger-solid"
// // // // //                 onClick={handleDelete}
// // // // //                 disabled={deleting}
// // // // //               >
// // // // //                 {deleting ? "Deleting..." : "Delete"}
// // // // //               </button>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // export default Admin_Creation;



// // // // import React, { useCallback, useEffect, useMemo, useState } from "react";
// // // // import {
// // // //   FiTrash2, FiPlus, FiArrowLeft, FiMapPin, FiCheckCircle,
// // // //   FiUserPlus, FiEdit2, FiEdit3,
// // // // } from "react-icons/fi";
// // // // import "./AdminCreation.css";

// // // // const API_BASE  = "http://localhost:8000/api";
// // // // const USERS_URL = `${API_BASE}/admins/`;
// // // // const ZONES_URL = `${API_BASE}/zones/`;

// // // // const getToken = () =>
// // // //   localStorage.getItem("token") ||
// // // //   localStorage.getItem("authToken") ||
// // // //   localStorage.getItem("access_token") ||
// // // //   localStorage.getItem("accessToken") ||
// // // //   "";

// // // // const authHeaders = () => {
// // // //   const token = getToken();
// // // //   return {
// // // //     "Content-Type": "application/json",
// // // //     ...(token ? { Authorization: `Token ${token}` } : {}),
// // // //   };
// // // // };

// // // // const ADMIN_ROLES = [
// // // //   // "ORG_SUPER_ADMIN", 
// // // //   "ZONAL_ADMIN", 
// // // //   "CIRCLE_ADMIN",
// // // //   "BR_ADMIN", 
// // // //   // "CUSTOMER", 
// // // //   // "ENGINEER",
// // // // ];

// // // // const ROLE_LABEL = {
// // // //   // ORG_SUPER_ADMIN: "Org Super Admin",
// // // //   BR_ADMIN:        "Branch Admin",
// // // //   // CUSTOMER:      "Customer Admin",
// // // //   ZONAL_ADMIN:     "Zonal Admin",
// // // //   CIRCLE_ADMIN:    "Circle Admin",
// // // //   // ENGINEER:        "Engineer",
// // // // };

// // // // const emptyForm = {
// // // //   id:        null,
// // // //   name:      "",
// // // //   email:     "",
// // // //   phone:     "",
// // // //   role:      "BR_ADMIN",
// // // //   password:  "",
// // // //   is_active: true,
// // // // };

// // // // function normalizeList(result) {
// // // //   if (Array.isArray(result))                   return result;
// // // //   if (result && Array.isArray(result.data))    return result.data;
// // // //   if (result && Array.isArray(result.results)) return result.results;
// // // //   return [];
// // // // }

// // // // // Pick the customer name from whatever field the backend exposes.
// // // // const getCustomerName = (admin) => {
// // // //   if (!admin) return "-";
// // // //   return (
// // // //     admin.customer_name ||
// // // //     admin.customer?.name ||
// // // //     admin.customer ||
// // // //     admin.scope_name ||
// // // //     admin.org_name ||
// // // //     admin.organization_name ||
// // // //     "-"
// // // //   );
// // // // };

// // // // function Admin_Creation() {
// // // //   const [view, setView] = useState("list");

// // // //   const [users, setUsers]     = useState([]);
// // // //   const [zones, setZones]     = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError]     = useState("");
// // // //   const [search, setSearch]   = useState("");

// // // //   // create / edit form
// // // //   const [form, setForm]           = useState(emptyForm);
// // // //   const [formError, setFormError] = useState("");
// // // //   const [saving, setSaving]       = useState(false);
// // // //   const isEditing = Boolean(form.id);

// // // //   // assign step
// // // //   const [pendingAdmin, setPendingAdmin] = useState(null);
// // // //   const [selectedZone, setSelectedZone] = useState("");
// // // //   const [assignError, setAssignError]   = useState("");
// // // //   const [assigning, setAssigning]       = useState(false);
// // // //   const [zonesLoading, setZonesLoading] = useState(false);

// // // //   // delete
// // // //   const [confirmDelete, setConfirmDelete] = useState(null);
// // // //   const [deleting, setDeleting]           = useState(false);

// // // //   const fetchUsers = useCallback(async () => {
// // // //     try {
// // // //       setError("");
// // // //       const res = await fetch(USERS_URL, {
// // // //         method: "GET",
// // // //         cache: "no-store",
// // // //         headers: authHeaders(),
// // // //       });
// // // //       if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
// // // //       if (!res.ok)            throw new Error(`HTTP ${res.status}`);
// // // //       const result = await res.json();
// // // //       setUsers(normalizeList(result));
// // // //     } catch (err) {
// // // //       setError(err.message || "Unable to load admins.");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   }, []);

// // // //   useEffect(() => { fetchUsers(); }, [fetchUsers]);

// // // //   const fetchZones = useCallback(async () => {
// // // //     setZonesLoading(true);
// // // //     try {
// // // //       const res = await fetch(ZONES_URL, {
// // // //         method: "GET",
// // // //         cache: "no-store",
// // // //         headers: authHeaders(),
// // // //       });
// // // //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// // // //       const result = await res.json();
// // // //       setZones(normalizeList(result));
// // // //     } catch (err) {
// // // //       setAssignError(err.message || "Unable to load zones.");
// // // //     } finally {
// // // //       setZonesLoading(false);
// // // //     }
// // // //   }, []);

// // // //   const adminUsers = useMemo(
// // // //     () => users.filter((u) => ADMIN_ROLES.includes(u.role)),
// // // //     [users]
// // // //   );

// // // //   const filteredAdmins = useMemo(() => {
// // // //     const q = search.trim().toLowerCase();
// // // //     if (!q) return adminUsers;
// // // //     return adminUsers.filter((u) =>
// // // //       [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role]]
// // // //         .filter(Boolean)
// // // //         .some((f) => String(f).toLowerCase().includes(q))
// // // //     );
// // // //   }, [adminUsers, search]);

// // // //   const goToCreate = () => {
// // // //     setForm(emptyForm);
// // // //     setFormError("");
// // // //     setView("form");
// // // //   };

// // // //   const openEditPanel = (admin) => {
// // // //     setForm({
// // // //       id:        admin.id,
// // // //       name:      admin.name || "",
// // // //       email:     admin.email || "",
// // // //       phone:     admin.phone || "",
// // // //       role:      admin.role || "BR_ADMIN",
// // // //       password:  "",
// // // //       is_active: admin.is_active ?? true,
// // // //     });
// // // //     setFormError("");
// // // //     setView("form");
// // // //   };

// // // //   const backToList = () => {
// // // //     setView("list");
// // // //     setForm(emptyForm);
// // // //     setFormError("");
// // // //     setPendingAdmin(null);
// // // //     setSelectedZone("");
// // // //     setAssignError("");
// // // //   };

// // // //   const goToAssign = () => {
// // // //     const target = pendingAdmin || adminUsers[0] || null;

// // // //     if (!target) {
// // // //       setError("No admin available to assign a zone. Create one first.");
// // // //       return;
// // // //     }

// // // //     setPendingAdmin(target);
// // // //     setSelectedZone(target.zone ?? "");
// // // //     setAssignError("");
// // // //     setView("assign");

// // // //     if (zones.length === 0) fetchZones();
// // // //   };

// // // //   const handleFieldChange = (field, value) =>
// // // //     setForm((prev) => ({ ...prev, [field]: value }));

// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();
// // // //     setFormError("");

// // // //     if (!form.name.trim())  return setFormError("Name is required.");
// // // //     if (!form.email.trim()) return setFormError("Email is required.");

// // // //     if (!isEditing && !form.password.trim()) {
// // // //       return setFormError("Password is required.");
// // // //     }

// // // //     const payload = {
// // // //       name:      form.name.trim(),
// // // //       email:     form.email.trim().toLowerCase(),
// // // //       phone:     form.phone.trim(),
// // // //       role:      form.role,
// // // //       is_active: form.is_active,
// // // //     };

// // // //     if (form.password.trim()) payload.password = form.password;

// // // //     setSaving(true);
// // // //     try {
// // // //       const url    = isEditing ? `${USERS_URL}${form.id}/` : USERS_URL;
// // // //       const method = isEditing ? "PATCH" : "POST";

// // // //       const res = await fetch(url, {
// // // //         method,
// // // //         headers: authHeaders(),
// // // //         body: JSON.stringify(payload),
// // // //       });

// // // //       if (!res.ok) {
// // // //         const errBody = await res.json().catch(() => ({}));
// // // //         const message =
// // // //           typeof errBody === "object" && errBody !== null
// // // //             ? Object.entries(errBody)
// // // //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// // // //                 .join(" | ")
// // // //             : `HTTP ${res.status}`;
// // // //         throw new Error(message || `HTTP ${res.status}`);
// // // //       }

// // // //       const saved = await res.json();

// // // //       if (isEditing) {
// // // //         await fetchUsers();
// // // //         backToList();
// // // //       } else {
// // // //         fetchUsers();
// // // //         setPendingAdmin(saved);
// // // //         setSelectedZone(saved.zone ?? "");
// // // //         setAssignError("");
// // // //         setView("assign");
// // // //         fetchZones();
// // // //       }
// // // //     } catch (err) {
// // // //       setFormError(err.message || "Could not save admin.");
// // // //     } finally {
// // // //       setSaving(false);
// // // //     }
// // // //   };

// // // //   const openAssignFor = (admin) => {
// // // //     setPendingAdmin(admin);
// // // //     setSelectedZone(admin.zone ?? "");
// // // //     setAssignError("");
// // // //     setView("assign");
// // // //     fetchZones();
// // // //   };

// // // //   const handleAssignSave = async () => {
// // // //     if (!pendingAdmin) return;
// // // //     if (!selectedZone) return setAssignError("Please pick a zone.");

// // // //     setAssigning(true);
// // // //     setAssignError("");
// // // //     try {
// // // //       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
// // // //         method: "PATCH",
// // // //         headers: authHeaders(),
// // // //         body: JSON.stringify({ zone: selectedZone }),
// // // //       });

// // // //       if (!res.ok) {
// // // //         const errBody = await res.json().catch(() => ({}));
// // // //         const message =
// // // //           typeof errBody === "object" && errBody !== null
// // // //             ? Object.entries(errBody)
// // // //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// // // //                 .join(" | ")
// // // //             : `HTTP ${res.status}`;
// // // //         throw new Error(message || `HTTP ${res.status}`);
// // // //       }

// // // //       await fetchUsers();
// // // //       backToList();
// // // //     } catch (err) {
// // // //       setAssignError(err.message || "Could not assign zone.");
// // // //     } finally {
// // // //       setAssigning(false);
// // // //     }
// // // //   };

// // // //   const handleDelete = async () => {
// // // //     if (!confirmDelete || deleting) return;
// // // //     setDeleting(true);
// // // //     try {
// // // //       const res = await fetch(`${USERS_URL}${confirmDelete.id}/`, {
// // // //         method: "DELETE",
// // // //         headers: authHeaders(),
// // // //       });
// // // //       if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
// // // //       setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
// // // //       setConfirmDelete(null);
// // // //     } catch (err) {
// // // //       setError(err.message || "Could not delete admin.");
// // // //       setConfirmDelete(null);
// // // //     } finally {
// // // //       setDeleting(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="admins-page">
// // // //       <ol className="admins-stepper">
// // // //         <li className={view === "list" ? "active" : "done"}>
// // // //           <button
// // // //             type="button"
// // // //             className="step-btn"
// // // //             onClick={backToList}
// // // //           >
// // // //             <span className="step-num">1</span> Admins
// // // //           </button>
// // // //         </li>

// // // //         <li className={view === "form" ? "active" : view === "assign" ? "done" : ""}>
// // // //           <button
// // // //             type="button"
// // // //             className="step-btn"
// // // //             onClick={goToCreate}
// // // //           >
// // // //             <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
// // // //           </button>
// // // //         </li>

// // // //         <li className={view === "assign" ? "active" : ""}>
// // // //           <button
// // // //             type="button"
// // // //             className="step-btn"
// // // //             onClick={goToAssign}
// // // //             disabled={adminUsers.length === 0 && !pendingAdmin}
// // // //           >
// // // //             <span className="step-num">3</span> Assign Zone
// // // //           </button>
// // // //         </li>
// // // //       </ol>

// // // //       {view === "list" && (
// // // //         <>
// // // //           <div className="admins-header">
// // // //             <div>
// // // //               <h1>Admins</h1>
// // // //               <p>Manage the admins under your organization</p>
// // // //             </div>
// // // //             {/* <button className="btn-primary" onClick={goToCreate}>
// // // //               <FiPlus /> Add Admin
// // // //             </button> */}
// // // //           </div>

// // // //           <div className="admins-toolbar">
// // // //             <input
// // // //               type="text"
// // // //               className="admins-search"
// // // //               placeholder="Search by name, email, phone or role..."
// // // //               value={search}
// // // //               onChange={(e) => setSearch(e.target.value)}
// // // //             />
// // // //             <span className="admins-count">
// // // //               {filteredAdmins.length} of {adminUsers.length} admins
// // // //             </span>
// // // //           </div>

// // // //           {error && <div className="admins-error">{error}</div>}

// // // //           <div className="admins-table-card">
// // // //             {loading ? (
// // // //               <div className="admins-loading">Loading admins...</div>
// // // //             ) : filteredAdmins.length === 0 ? (
// // // //               <div className="admins-empty">
// // // //                 {adminUsers.length === 0
// // // //                   ? "No admins yet. Click “Add Admin” to create one."
// // // //                   : "No admins match your search."}
// // // //               </div>
// // // //             ) : (
// // // //               <table className="admins-table">
// // // //                 <thead>
// // // //                   <tr>
// // // //                     <th>Name</th>
// // // //                     <th>Email</th>
// // // //                     <th>Phone</th>
// // // //                     <th>Role</th>
// // // //                     <th>Zone</th>
// // // //                     <th>Status</th>
// // // //                     <th className="actions-col">Actions</th>
// // // //                   </tr>
// // // //                 </thead>
// // // //                 <tbody>
// // // //                   {filteredAdmins.map((u) => (
// // // //                     <tr key={u.id}>
// // // //                       <td><strong>{u.name || "-"}</strong></td>
// // // //                       <td>{u.email}</td>
// // // //                       <td>{u.phone || "-"}</td>
// // // //                       <td>{ROLE_LABEL[u.role] || u.role}</td>
// // // //                       <td>{u.zone_name || u.scope_name || "-"}</td>
// // // //                       <td>
// // // //                         <span className={u.is_active ? "status-active" : "status-inactive"}>
// // // //                           ● {u.is_active ? "Active" : "Inactive"}
// // // //                         </span>
// // // //                       </td>
// // // //                       <td className="actions-col">
// // // //                         <button
// // // //                           className="btn-icon"
// // // //                           onClick={() => openEditPanel(u)}
// // // //                           title="Edit"
// // // //                           aria-label="Edit"
// // // //                         >
// // // //                           <FiEdit2 size={16} />
// // // //                         </button>
// // // //                         <button
// // // //                           className="btn-icon btn-icon-danger"
// // // //                           onClick={() => setConfirmDelete(u)}
// // // //                           title="Delete"
// // // //                           aria-label="Delete"
// // // //                         >
// // // //                           <FiTrash2 size={16} />
// // // //                         </button>
// // // //                       </td>
// // // //                     </tr>
// // // //                   ))}
// // // //                 </tbody>
// // // //               </table>
// // // //             )}
// // // //           </div>
// // // //         </>
// // // //       )}

// // // //       {view === "form" && (
// // // //         <div className="admins-panel">
// // // //           <div className="admins-panel-header">
// // // //             {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
// // // //             <div>
// // // //               <h2>{isEditing ? "Edit Admin" : "Create Admin"}</h2>
// // // //               <p>
// // // //                 {isEditing
// // // //                   ? `Update details for ${form.name || form.email}.`
// // // //                   : "Add a new admin. You'll assign a zone in the next step."}
// // // //               </p>
// // // //             </div>
// // // //           </div>

// // // //           <form onSubmit={handleSubmit} className="admins-form">
// // // //             <div className="form-grid">
// // // //               <label>
// // // //                 Name *
// // // //                 <input
// // // //                   type="text"
// // // //                   value={form.name}
// // // //                   onChange={(e) => handleFieldChange("name", e.target.value)}
// // // //                   placeholder="Jane Doe"
// // // //                   required
// // // //                 />
// // // //               </label>

// // // //               <label>
// // // //                 Email *
// // // //                 <input
// // // //                   type="email"
// // // //                   value={form.email}
// // // //                   onChange={(e) => handleFieldChange("email", e.target.value)}
// // // //                   placeholder="jane@acme.com"
// // // //                   required
// // // //                 />
// // // //               </label>

// // // //               <label>
// // // //                 Phone
// // // //                 <input
// // // //                   type="text"
// // // //                   value={form.phone}
// // // //                   onChange={(e) => handleFieldChange("phone", e.target.value)}
// // // //                   placeholder="+91 98765 43210"
// // // //                 />
// // // //               </label>

// // // //               <label>
// // // //                 Role *
// // // //                 <select
// // // //                   value={form.role}
// // // //                   onChange={(e) => handleFieldChange("role", e.target.value)}
// // // //                   required
// // // //                 >
// // // //                   {ADMIN_ROLES.map((r) => (
// // // //                     <option key={r} value={r}>{ROLE_LABEL[r]}</option>
// // // //                   ))}
// // // //                 </select>
// // // //               </label>

// // // //               <label>
// // // //                 {isEditing ? "Password (leave blank to keep current)" : "Password *"}
// // // //                 <input
// // // //                   type="password"
// // // //                   value={form.password}
// // // //                   onChange={(e) => handleFieldChange("password", e.target.value)}
// // // //                   placeholder={isEditing ? "••••••••" : "Set a password"}
// // // //                   required={!isEditing}
// // // //                 />
// // // //               </label>

// // // //               <label className="checkbox-row">
// // // //                 <input
// // // //                   type="checkbox"
// // // //                   checked={form.is_active}
// // // //                   onChange={(e) => handleFieldChange("is_active", e.target.checked)}
// // // //                 />
// // // //                 Active
// // // //               </label>
// // // //             </div>

// // // //             {formError && <div className="form-error">{formError}</div>}

// // // //             <div className="panel-actions">
// // // //               <button
// // // //                 type="button"
// // // //                 className="btn-secondary"
// // // //                 onClick={backToList}
// // // //                 disabled={saving}
// // // //               >
// // // //                 Cancel
// // // //               </button>
// // // //               <button type="submit" className="btn-primary" disabled={saving}>
// // // //                 {saving
// // // //                   ? "Saving..."
// // // //                   : isEditing
// // // //                     ? "Save Changes"
// // // //                     : "Create & Continue"}
// // // //               </button>
// // // //             </div>
// // // //           </form>
// // // //         </div>
// // // //       )}

// // // //       {view === "assign" && pendingAdmin && (
// // // //         <div className="admins-panel">
// // // //           <button className="btn-back" onClick={backToList}>
// // // //             <FiArrowLeft /> Back to list
// // // //           </button>

// // // //           <div className="admins-panel-header">
// // // //             <FiMapPin size={22} />
// // // //             <div>
// // // //               <h2>Assign Zone</h2>
// // // //               <p>
// // // //                 Assign a zone to{" "}
// // // //                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
// // // //               </p>
// // // //             </div>
// // // //           </div>

// // // //           <div className="assign-card">
// // // //             <div className="assign-row">
// // // //               <span className="assign-label">Admin</span>
// // // //               <span className="assign-value">{pendingAdmin.name || "-"}</span>
// // // //             </div>

// // // //             {/* Present customer for whom we are assigning */}
// // // //             <div className="assign-row">
// // // //               <span className="assign-label">Customer</span>
// // // //               <span className="assign-value">
// // // //                 {getCustomerName(pendingAdmin)}
// // // //               </span>
// // // //             </div>

// // // //             <div className="assign-row">
// // // //               <span className="assign-label">Email</span>
// // // //               <span className="assign-value">{pendingAdmin.email}</span>
// // // //             </div>
// // // //             <div className="assign-row">
// // // //               <span className="assign-label">Role</span>
// // // //               <span className="assign-value">
// // // //                 {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
// // // //               </span>
// // // //             </div>

// // // //             <label className="assign-select">
// // // //               Zone *
// // // //               {zonesLoading ? (
// // // //                 <span className="assign-loading">Loading zones...</span>
// // // //               ) : zones.length === 0 ? (
// // // //                 <span className="assign-loading">No zones available.</span>
// // // //               ) : (
// // // //                 <select
// // // //                   value={selectedZone}
// // // //                   onChange={(e) => setSelectedZone(e.target.value)}
// // // //                 >
// // // //                   <option value="">— Select a zone —</option>
// // // //                   {zones.map((z) => (
// // // //                     <option key={z.id} value={z.id}>
// // // //                       {z.name}{z.code ? ` (${z.code})` : ""}
// // // //                     </option>
// // // //                   ))}
// // // //                 </select>
// // // //               )}
// // // //             </label>
// // // //           </div>

// // // //           {assignError && <div className="form-error">{assignError}</div>}

// // // //           <div className="panel-actions">
// // // //             <button
// // // //               type="button"
// // // //               className="btn-secondary"
// // // //               onClick={backToList}
// // // //               disabled={assigning}
// // // //             >
// // // //               Skip & Return to List
// // // //             </button>
// // // //             <button
// // // //               type="button"
// // // //               className="btn-primary"
// // // //               onClick={handleAssignSave}
// // // //               disabled={assigning || !selectedZone}
// // // //             >
// // // //               <FiCheckCircle /> {assigning ? "Saving..." : "Save & Return to List"}
// // // //             </button>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {confirmDelete && (
// // // //         <div
// // // //           className="admins-modal-overlay"
// // // //           onClick={() => !deleting && setConfirmDelete(null)}
// // // //         >
// // // //           <div
// // // //             className="admins-modal admins-modal-small"
// // // //             onClick={(e) => e.stopPropagation()}
// // // //           >
// // // //             <h2>Delete Admin</h2>
// // // //             <p>
// // // //               Are you sure you want to delete{" "}
// // // //               <strong>{confirmDelete.name || confirmDelete.email}</strong>?
// // // //               This cannot be undone.
// // // //             </p>
// // // //             <div className="panel-actions">
// // // //               <button
// // // //                 className="btn-secondary"
// // // //                 onClick={() => setConfirmDelete(null)}
// // // //                 disabled={deleting}
// // // //               >
// // // //                 Cancel
// // // //               </button>
// // // //               <button
// // // //                 className="btn-danger-solid"
// // // //                 onClick={handleDelete}
// // // //                 disabled={deleting}
// // // //               >
// // // //                 {deleting ? "Deleting..." : "Delete"}
// // // //               </button>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // export default Admin_Creation;


// // // import React, { useCallback, useEffect, useMemo, useState } from "react";
// // // import {
// // //   FiTrash2, FiPlus, FiArrowLeft, FiMapPin, FiCheckCircle,
// // //   FiUserPlus, FiEdit2, FiEdit3, FiUsers,
// // // } from "react-icons/fi";
// // // import "./CustomerCreation.css";

// // // const API_BASE     = "http://localhost:8000/api";
// // // const USERS_URL    = `${API_BASE}/admins/`;
// // // const ZONES_URL    = `${API_BASE}/zones/`;
// // // const CUSTOMERS_URL = `${API_BASE}/customers/`;

// // // const getToken = () =>
// // //   localStorage.getItem("token") ||
// // //   localStorage.getItem("authToken") ||
// // //   localStorage.getItem("access_token") ||
// // //   localStorage.getItem("accessToken") ||
// // //   "";

// // // const authHeaders = () => {
// // //   const token = getToken();
// // //   return {
// // //     "Content-Type": "application/json",
// // //     ...(token ? { Authorization: `Token ${token}` } : {}),
// // //   };
// // // };

// // // const ADMIN_ROLES = [
// // //   // "ORG_SUPER_ADMIN",
// // //   "ZONAL_ADMIN",
// // //   "CIRCLE_ADMIN",
// // //   "BR_ADMIN",
// // //   // "CUSTOMER",
// // //   // "ENGINEER",
// // // ];

// // // const ROLE_LABEL = {
// // //   // ORG_SUPER_ADMIN: "Org Super Admin",
// // //   BR_ADMIN:      "Branch Admin",
// // //   // CUSTOMER:    "Customer Admin",
// // //   ZONAL_ADMIN:   "Zonal Admin",
// // //   CIRCLE_ADMIN:  "Circle Admin",
// // //   // ENGINEER:      "Engineer",
// // // };

// // // const emptyForm = {
// // //   id:        null,
// // //   name:      "",
// // //   email:     "",
// // //   phone:     "",
// // //   role:      "BR_ADMIN",
// // //   password:  "",
// // //   is_active: true,
// // // };

// // // function normalizeList(result) {
// // //   if (Array.isArray(result))                   return result;
// // //   if (result && Array.isArray(result.data))    return result.data;
// // //   if (result && Array.isArray(result.results)) return result.results;
// // //   return [];
// // // }

// // // /* ---------- customer helpers ---------- */

// // // const getCustomerId = (admin) => {
// // //   if (!admin) return "";
// // //   const raw =
// // //     admin.customer_id ??
// // //     (admin.customer && typeof admin.customer === "object"
// // //       ? admin.customer.id
// // //       : admin.customer);
// // //   return raw === null || raw === undefined ? "" : String(raw);
// // // };

// // // const getCustomerName = (admin, customers = []) => {
// // //   if (!admin) return "-";

// // //   if (admin.customer_name) return admin.customer_name;
// // //   if (admin.customer && typeof admin.customer === "object" && admin.customer.name) {
// // //     return admin.customer.name;
// // //   }

// // //   const id = getCustomerId(admin);
// // //   if (id) {
// // //     const found = customers.find((c) => String(c.id) === id);
// // //     if (found) return found.name || found.customer_name || id;
// // //     return id;
// // //   }

// // //   return admin.org_name || admin.organization_name || "-";
// // // };

// // // const getZoneId = (admin) => {
// // //   if (!admin) return "";
// // //   const raw =
// // //     admin.zone_id ??
// // //     (admin.zone && typeof admin.zone === "object" ? admin.zone.id : admin.zone);
// // //   return raw === null || raw === undefined ? "" : String(raw);
// // // };

// // // function Admin_Creation() {
// // //   const [view, setView] = useState("list");

// // //   const [users, setUsers]         = useState([]);
// // //   const [zones, setZones]         = useState([]);
// // //   const [customers, setCustomers] = useState([]);
// // //   const [loading, setLoading]     = useState(true);
// // //   const [error, setError]         = useState("");
// // //   const [search, setSearch]       = useState("");

// // //   // create / edit form
// // //   const [form, setForm]           = useState(emptyForm);
// // //   const [formError, setFormError] = useState("");
// // //   const [saving, setSaving]       = useState(false);
// // //   const isEditing = Boolean(form.id);

// // //   // assign steps
// // //   const [pendingAdmin, setPendingAdmin]         = useState(null);
// // //   const [selectedCustomer, setSelectedCustomer] = useState("");
// // //   const [selectedZone, setSelectedZone]         = useState("");
// // //   const [assignError, setAssignError]           = useState("");
// // //   const [assigning, setAssigning]               = useState(false);
// // //   const [zonesLoading, setZonesLoading]         = useState(false);

// // //   // customers loading
// // //   const [customersLoading, setCustomersLoading] = useState(false);
// // //   const [assigningCustomer, setAssigningCustomer] = useState(false);

// // //   // delete
// // //   const [confirmDelete, setConfirmDelete] = useState(null);
// // //   const [deleting, setDeleting]           = useState(false);

// // //   /* ---------------- fetchers ---------------- */

// // //   const fetchUsers = useCallback(async () => {
// // //     try {
// // //       setError("");
// // //       const res = await fetch(USERS_URL, {
// // //         method: "GET",
// // //         cache: "no-store",
// // //         headers: authHeaders(),
// // //       });
// // //       if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
// // //       if (!res.ok)            throw new Error(`HTTP ${res.status}`);
// // //       const result = await res.json();
// // //       setUsers(normalizeList(result));
// // //     } catch (err) {
// // //       setError(err.message || "Unable to load admins.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, []);

// // //   useEffect(() => { fetchUsers(); }, [fetchUsers]);

// // //   const fetchCustomers = useCallback(async () => {
// // //     setCustomersLoading(true);
// // //     try {
// // //       const res = await fetch(CUSTOMERS_URL, {
// // //         method: "GET",
// // //         cache: "no-store",
// // //         headers: authHeaders(),
// // //       });
// // //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// // //       const result = await res.json();
// // //       setCustomers(normalizeList(result));
// // //     } catch (err) {
// // //       setAssignError(err.message || "Unable to load customers.");
// // //     } finally {
// // //       setCustomersLoading(false);
// // //     }
// // //   }, []);

// // //   /**
// // //    * Zones are ALWAYS scoped to a customer.
// // //    * We ask the API for `?customer=<id>` and, if the payload also carries a
// // //    * customer field, we filter locally as a safety net.
// // //    */
// // //   const fetchZones = useCallback(async (customerId) => {
// // //     setZonesLoading(true);
// // //     setAssignError("");
// // //     try {
// // //       const url = customerId
// // //         ? `${ZONES_URL}?customer=${encodeURIComponent(customerId)}`
// // //         : ZONES_URL;

// // //       const res = await fetch(url, {
// // //         method: "GET",
// // //         cache: "no-store",
// // //         headers: authHeaders(),
// // //       });
// // //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// // //       const result = await res.json();

// // //       let list = normalizeList(result);

// // //       // Safety net: if the API ignores the query param but returns the
// // //       // customer field, filter it ourselves.
// // //       if (customerId && list.some((z) => z.customer !== undefined || z.customer_id !== undefined)) {
// // //         list = list.filter(
// // //           (z) => String(z.customer_id ?? (z.customer && typeof z.customer === "object" ? z.customer.id : z.customer)) === String(customerId)
// // //         );
// // //       }

// // //       setZones(list);
// // //     } catch (err) {
// // //       setZones([]);
// // //       setAssignError(err.message || "Unable to load zones.");
// // //     } finally {
// // //       setZonesLoading(false);
// // //     }
// // //   }, []);

// // //   /* ---------------- derived ---------------- */

// // //   const adminUsers = useMemo(
// // //     () => users.filter((u) => ADMIN_ROLES.includes(u.role)),
// // //     [users]
// // //   );

// // //   const filteredAdmins = useMemo(() => {
// // //     const q = search.trim().toLowerCase();
// // //     if (!q) return adminUsers;
// // //     return adminUsers.filter((u) =>
// // //       [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role]]
// // //         .filter(Boolean)
// // //         .some((f) => String(f).toLowerCase().includes(q))
// // //     );
// // //   }, [adminUsers, search]);

// // //   /* ---------------- navigation ---------------- */

// // //   const goToCreate = () => {
// // //     setForm(emptyForm);
// // //     setFormError("");
// // //     setView("form");
// // //   };

// // //   const openEditPanel = (admin) => {
// // //     setForm({
// // //       id:        admin.id,
// // //       name:      admin.name || "",
// // //       email:     admin.email || "",
// // //       phone:     admin.phone || "",
// // //       role:      admin.role || "BR_ADMIN",
// // //       password:  "",
// // //       is_active: admin.is_active ?? true,
// // //     });
// // //     setFormError("");
// // //     setView("form");
// // //   };

// // //   const backToList = () => {
// // //     setView("list");
// // //     setForm(emptyForm);
// // //     setFormError("");
// // //     setPendingAdmin(null);
// // //     setSelectedCustomer("");
// // //     setSelectedZone("");
// // //     setAssignError("");
// // //     setZones([]);
// // //   };

// // //   /** Step 3 — pick the admin we are assigning a customer to */
// // //   const goToAssignCustomer = () => {
// // //     const target = pendingAdmin || adminUsers[0] || null;

// // //     if (!target) {
// // //       setError("No admin available to assign a customer. Create one first.");
// // //       return;
// // //     }

// // //     setPendingAdmin(target);
// // //     setSelectedCustomer(getCustomerId(target));
// // //     setAssignError("");
// // //     setView("assign-customer");

// // //     if (customers.length === 0) fetchCustomers();
// // //   };

// // //   /** Step 4 — pick the zone (scoped to the assigned customer) */
// // //   const goToAssignZone = () => {
// // //     const target = pendingAdmin || adminUsers[0] || null;

// // //     if (!target) {
// // //       setError("No admin available to assign a zone. Create one first.");
// // //       return;
// // //     }

// // //     const custId = selectedCustomer || getCustomerId(target);

// // //     if (!custId) {
// // //       setError("Assign a customer before assigning a zone.");
// // //       setPendingAdmin(target);
// // //       setAssignError("");
// // //       setView("assign-customer");
// // //       if (customers.length === 0) fetchCustomers();
// // //       return;
// // //     }

// // //     setPendingAdmin(target);
// // //     setSelectedCustomer(custId);
// // //     setSelectedZone(getZoneId(target));
// // //     setAssignError("");
// // //     setView("assign");
// // //     fetchZones(custId);   // <-- zones always come from the API for this customer
// // //   };

// // //   /* ---------------- form handling ---------------- */

// // //   const handleFieldChange = (field, value) =>
// // //     setForm((prev) => ({ ...prev, [field]: value }));

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setFormError("");

// // //     if (!form.name.trim())  return setFormError("Name is required.");
// // //     if (!form.email.trim()) return setFormError("Email is required.");

// // //     if (!isEditing && !form.password.trim()) {
// // //       return setFormError("Password is required.");
// // //     }

// // //     const payload = {
// // //       name:      form.name.trim(),
// // //       email:     form.email.trim().toLowerCase(),
// // //       phone:     form.phone.trim(),
// // //       role:      form.role,
// // //       is_active: form.is_active,
// // //     };

// // //     if (form.password.trim()) payload.password = form.password;

// // //     setSaving(true);
// // //     try {
// // //       const url    = isEditing ? `${USERS_URL}${form.id}/` : USERS_URL;
// // //       const method = isEditing ? "PATCH" : "POST";

// // //       const res = await fetch(url, {
// // //         method,
// // //         headers: authHeaders(),
// // //         body: JSON.stringify(payload),
// // //       });

// // //       if (!res.ok) {
// // //         const errBody = await res.json().catch(() => ({}));
// // //         const message =
// // //           typeof errBody === "object" && errBody !== null
// // //             ? Object.entries(errBody)
// // //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// // //                 .join(" | ")
// // //             : `HTTP ${res.status}`;
// // //         throw new Error(message || `HTTP ${res.status}`);
// // //       }

// // //       const saved = await res.json();

// // //       if (isEditing) {
// // //         await fetchUsers();
// // //         backToList();
// // //       } else {
// // //         fetchUsers();
// // //         setPendingAdmin(saved);
// // //         setSelectedCustomer(getCustomerId(saved));
// // //         setSelectedZone("");
// // //         setAssignError("");
// // //         setView("assign-customer");   // -> go to step 3 first
// // //         fetchCustomers();
// // //       }
// // //     } catch (err) {
// // //       setFormError(err.message || "Could not save admin.");
// // //     } finally {
// // //       setSaving(false);
// // //     }
// // //   };

// // //   /* ---------------- step 3: save customer ---------------- */

// // //   const handleCustomerSave = async () => {
// // //     if (!pendingAdmin) return;
// // //     if (!selectedCustomer) return setAssignError("Please pick a customer.");

// // //     setAssigningCustomer(true);
// // //     setAssignError("");
// // //     try {
// // //       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
// // //         method: "PATCH",
// // //         headers: authHeaders(),
// // //         body: JSON.stringify({ customer: selectedCustomer }),
// // //       });

// // //       if (!res.ok) {
// // //         const errBody = await res.json().catch(() => ({}));
// // //         const message =
// // //           typeof errBody === "object" && errBody !== null
// // //             ? Object.entries(errBody)
// // //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// // //                 .join(" | ")
// // //             : `HTTP ${res.status}`;
// // //         throw new Error(message || `HTTP ${res.status}`);
// // //       }

// // //       const updated = await res.json().catch(() => null);
// // //       setPendingAdmin((prev) => ({ ...(prev || {}), ...(updated || {}), customer: selectedCustomer }));

// // //       await fetchUsers();

// // //       // Move on to zones for THIS customer
// // //       setSelectedZone("");
// // //       setAssignError("");
// // //       setView("assign");
// // //       fetchZones(selectedCustomer);
// // //     } catch (err) {
// // //       setAssignError(err.message || "Could not assign customer.");
// // //     } finally {
// // //       setAssigningCustomer(false);
// // //     }
// // //   };

// // //   /* ---------------- step 4: save zone ---------------- */

// // //   const handleAssignSave = async () => {
// // //     if (!pendingAdmin) return;
// // //     if (!selectedZone) return setAssignError("Please pick a zone.");

// // //     setAssigning(true);
// // //     setAssignError("");
// // //     try {
// // //       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
// // //         method: "PATCH",
// // //         headers: authHeaders(),
// // //         body: JSON.stringify({ zone: selectedZone }),
// // //       });

// // //       if (!res.ok) {
// // //         const errBody = await res.json().catch(() => ({}));
// // //         const message =
// // //           typeof errBody === "object" && errBody !== null
// // //             ? Object.entries(errBody)
// // //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// // //                 .join(" | ")
// // //             : `HTTP ${res.status}`;
// // //         throw new Error(message || `HTTP ${res.status}`);
// // //       }

// // //       await fetchUsers();
// // //       backToList();
// // //     } catch (err) {
// // //       setAssignError(err.message || "Could not assign zone.");
// // //     } finally {
// // //       setAssigning(false);
// // //     }
// // //   };

// // //   /* ---------------- delete ---------------- */

// // //   const handleDelete = async () => {
// // //     if (!confirmDelete || deleting) return;
// // //     setDeleting(true);
// // //     try {
// // //       const res = await fetch(`${USERS_URL}${confirmDelete.id}/`, {
// // //         method: "DELETE",
// // //         headers: authHeaders(),
// // //       });
// // //       if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
// // //       setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
// // //       setConfirmDelete(null);
// // //     } catch (err) {
// // //       setError(err.message || "Could not delete admin.");
// // //       setConfirmDelete(null);
// // //     } finally {
// // //       setDeleting(false);
// // //     }
// // //   };

// // //   /* ---------------- render ---------------- */

// // //   return (
// // //     <div className="admins-page">
// // //       {/* STEPPER */}
// // //       <ol className="admins-stepper">
// // //         <li className={view === "list" ? "active" : "done"}>
// // //           <button type="button" className="step-btn" onClick={backToList}>
// // //             <span className="step-num">1</span> Admins
// // //           </button>
// // //         </li>

// // //         <li
// // //           className={
// // //             view === "form"
// // //               ? "active"
// // //               : view === "assign-customer" || view === "assign"
// // //                 ? "done"
// // //                 : ""
// // //           }
// // //         >
// // //           <button type="button" className="step-btn" onClick={goToCreate}>
// // //             <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
// // //           </button>
// // //         </li>

// // //         <li
// // //           className={
// // //             view === "assign-customer" ? "active" : view === "assign" ? "done" : ""
// // //           }
// // //         >
// // //           <button
// // //             type="button"
// // //             className="step-btn"
// // //             onClick={goToAssignCustomer}
// // //             disabled={!pendingAdmin && adminUsers.length === 0}
// // //           >
// // //             <span className="step-num">3</span> Assign Customer
// // //           </button>
// // //         </li>

// // //         <li className={view === "assign" ? "active" : ""}>
// // //           <button
// // //             type="button"
// // //             className="step-btn"
// // //             onClick={goToAssignZone}
// // //             disabled={!pendingAdmin && adminUsers.length === 0}
// // //           >
// // //             <span className="step-num">4</span> Assign Zone
// // //           </button>
// // //         </li>
// // //       </ol>

// // //       {/* ================= STEP 1 — LIST ================= */}
// // //       {view === "list" && (
// // //         <>
// // //           <div className="admins-header">
// // //             <div>
// // //               <h1>Admins</h1>
// // //               <p>Manage the admins under your organization</p>
// // //             </div>
// // //             {/* <button className="btn-primary" onClick={goToCreate}>
// // //               <FiPlus /> Add Admin
// // //             </button> */}
// // //           </div>

// // //           <div className="admins-toolbar">
// // //             <input
// // //               type="text"
// // //               className="admins-search"
// // //               placeholder="Search by name, email, phone or role..."
// // //               value={search}
// // //               onChange={(e) => setSearch(e.target.value)}
// // //             />
// // //             <span className="admins-count">
// // //               {filteredAdmins.length} of {adminUsers.length} admins
// // //             </span>
// // //           </div>

// // //           {error && <div className="admins-error">{error}</div>}

// // //           <div className="admins-table-card">
// // //             {loading ? (
// // //               <div className="admins-loading">Loading admins...</div>
// // //             ) : filteredAdmins.length === 0 ? (
// // //               <div className="admins-empty">
// // //                 {adminUsers.length === 0
// // //                   ? "No admins yet. Click “Add Admin” to create one."
// // //                   : "No admins match your search."}
// // //               </div>
// // //             ) : (
// // //               <table className="admins-table">
// // //                 <thead>
// // //                   <tr>
// // //                     <th>Name</th>
// // //                     <th>Email</th>
// // //                     <th>Phone</th>
// // //                     <th>Role</th>
// // //                     <th>Customer</th>
// // //                     <th>Zone</th>
// // //                     <th>Status</th>
// // //                     <th className="actions-col">Actions</th>
// // //                   </tr>
// // //                 </thead>
// // //                 <tbody>
// // //                   {filteredAdmins.map((u) => (
// // //                     <tr key={u.id}>
// // //                       <td><strong>{u.name || "-"}</strong></td>
// // //                       <td>{u.email}</td>
// // //                       <td>{u.phone || "-"}</td>
// // //                       <td>{ROLE_LABEL[u.role] || u.role}</td>
// // //                       <td>{getCustomerName(u, customers)}</td>
// // //                       <td>{u.zone_name || u.scope_name || "-"}</td>
// // //                       <td>
// // //                         <span className={u.is_active ? "status-active" : "status-inactive"}>
// // //                           ● {u.is_active ? "Active" : "Inactive"}
// // //                         </span>
// // //                       </td>
// // //                       <td className="actions-col">
// // //                         <button
// // //                           className="btn-icon"
// // //                           onClick={() => openEditPanel(u)}
// // //                           title="Edit"
// // //                           aria-label="Edit"
// // //                         >
// // //                           <FiEdit2 size={16} />
// // //                         </button>
// // //                         <button
// // //                           className="btn-icon btn-icon-danger"
// // //                           onClick={() => setConfirmDelete(u)}
// // //                           title="Delete"
// // //                           aria-label="Delete"
// // //                         >
// // //                           <FiTrash2 size={16} />
// // //                         </button>
// // //                       </td>
// // //                     </tr>
// // //                   ))}
// // //                 </tbody>
// // //               </table>
// // //             )}
// // //           </div>
// // //         </>
// // //       )}

// // //       {/* ================= STEP 2 — CREATE / EDIT ================= */}
// // //       {view === "form" && (
// // //         <div className="admins-panel">
// // //           <div className="admins-panel-header">
// // //             {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
// // //             <div>
// // //               <h2>{isEditing ? "Edit Admin" : "Create Admin"}</h2>
// // //               <p>
// // //                 {isEditing
// // //                   ? `Update details for ${form.name || form.email}.`
// // //                   : "Add a new admin. You'll assign a customer and zone in the next steps."}
// // //               </p>
// // //             </div>
// // //           </div>

// // //           <form onSubmit={handleSubmit} className="admins-form">
// // //             <div className="form-grid">
// // //               <label>
// // //                 Name *
// // //                 <input
// // //                   type="text"
// // //                   value={form.name}
// // //                   onChange={(e) => handleFieldChange("name", e.target.value)}
// // //                   placeholder="Jane Doe"
// // //                   required
// // //                 />
// // //               </label>

// // //               <label>
// // //                 Email *
// // //                 <input
// // //                   type="email"
// // //                   value={form.email}
// // //                   onChange={(e) => handleFieldChange("email", e.target.value)}
// // //                   placeholder="jane@acme.com"
// // //                   required
// // //                 />
// // //               </label>

// // //               <label>
// // //                 Phone
// // //                 <input
// // //                   type="text"
// // //                   value={form.phone}
// // //                   onChange={(e) => handleFieldChange("phone", e.target.value)}
// // //                   placeholder="+91 98765 43210"
// // //                 />
// // //               </label>

// // //               <label>
// // //                 Role *
// // //                 <select
// // //                   value={form.role}
// // //                   onChange={(e) => handleFieldChange("role", e.target.value)}
// // //                   required
// // //                 >
// // //                   {ADMIN_ROLES.map((r) => (
// // //                     <option key={r} value={r}>{ROLE_LABEL[r]}</option>
// // //                   ))}
// // //                 </select>
// // //               </label>

// // //               <label>
// // //                 {isEditing ? "Password (leave blank to keep current)" : "Password *"}
// // //                 <input
// // //                   type="password"
// // //                   value={form.password}
// // //                   onChange={(e) => handleFieldChange("password", e.target.value)}
// // //                   placeholder={isEditing ? "••••••••" : "Set a password"}
// // //                   required={!isEditing}
// // //                 />
// // //               </label>

// // //               <label className="checkbox-row">
// // //                 <input
// // //                   type="checkbox"
// // //                   checked={form.is_active}
// // //                   onChange={(e) => handleFieldChange("is_active", e.target.checked)}
// // //                 />
// // //                 Active
// // //               </label>
// // //             </div>

// // //             {formError && <div className="form-error">{formError}</div>}

// // //             <div className="panel-actions">
// // //               <button
// // //                 type="button"
// // //                 className="btn-secondary"
// // //                 onClick={backToList}
// // //                 disabled={saving}
// // //               >
// // //                 Cancel
// // //               </button>
// // //               <button type="submit" className="btn-primary" disabled={saving}>
// // //                 {saving
// // //                   ? "Saving..."
// // //                   : isEditing
// // //                     ? "Save Changes"
// // //                     : "Create & Continue"}
// // //               </button>
// // //             </div>
// // //           </form>
// // //         </div>
// // //       )}

// // //       {/* ================= STEP 3 — ASSIGN CUSTOMER ================= */}
// // //       {view === "assign-customer" && pendingAdmin && (
// // //         <div className="admins-panel">
// // //           <button className="btn-back" onClick={backToList}>
// // //             <FiArrowLeft /> Back to list
// // //           </button>

// // //           <div className="admins-panel-header">
// // //             <FiUsers size={22} />
// // //             <div>
// // //               <h2>Assign Customer</h2>
// // //               <p>
// // //                 Choose the customer for{" "}
// // //                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
// // //               </p>
// // //             </div>
// // //           </div>

// // //           <div className="assign-card">
// // //             <div className="assign-row">
// // //               <span className="assign-label">Admin</span>
// // //               <span className="assign-value">{pendingAdmin.name || "-"}</span>
// // //             </div>

// // //             <div className="assign-row">
// // //               <span className="assign-label">Email</span>
// // //               <span className="assign-value">{pendingAdmin.email}</span>
// // //             </div>

// // //             <div className="assign-row">
// // //               <span className="assign-label">Role</span>
// // //               <span className="assign-value">
// // //                 {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
// // //               </span>
// // //             </div>

// // //             <label className="assign-select">
// // //               Customer *
// // //               {customersLoading ? (
// // //                 <span className="assign-loading">Loading customers...</span>
// // //               ) : customers.length === 0 ? (
// // //                 <span className="assign-loading">No customers available.</span>
// // //               ) : (
// // //                 <select
// // //                   value={selectedCustomer}
// // //                   onChange={(e) => setSelectedCustomer(e.target.value)}
// // //                 >
// // //                   <option value="">— Select a customer —</option>
// // //                   {customers.map((c) => (
// // //                     <option key={c.id} value={c.id}>
// // //                       {c.name || c.customer_name}
// // //                       {c.code ? ` (${c.code})` : ""}
// // //                     </option>
// // //                   ))}
// // //                 </select>
// // //               )}
// // //             </label>
// // //           </div>

// // //           {assignError && <div className="form-error">{assignError}</div>}

// // //           <div className="panel-actions">
// // //             <button
// // //               type="button"
// // //               className="btn-secondary"
// // //               onClick={backToList}
// // //               disabled={assigningCustomer}
// // //             >
// // //               Skip & Return to List
// // //             </button>
// // //             <button
// // //               type="button"
// // //               className="btn-primary"
// // //               onClick={handleCustomerSave}
// // //               disabled={assigningCustomer || !selectedCustomer}
// // //             >
// // //               <FiCheckCircle />{" "}
// // //               {assigningCustomer ? "Saving..." : "Save & Continue"}
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* ================= STEP 4 — ASSIGN ZONE ================= */}
// // //       {view === "assign" && pendingAdmin && (
// // //         <div className="admins-panel">
// // //           <button className="btn-back" onClick={backToList}>
// // //             <FiArrowLeft /> Back to list
// // //           </button>

// // //           <div className="admins-panel-header">
// // //             <FiMapPin size={22} />
// // //             <div>
// // //               <h2>Assign Zone</h2>
// // //               <p>
// // //                 Assign a zone to{" "}
// // //                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
// // //               </p>
// // //             </div>
// // //           </div>

// // //           <div className="assign-card">
// // //             <div className="assign-row">
// // //               <span className="assign-label">Admin</span>
// // //               <span className="assign-value">{pendingAdmin.name || "-"}</span>
// // //             </div>

// // //             {/* Customer context (zones are scoped to this customer) */}
// // //             <div className="assign-row">
// // //               <span className="assign-label">Customer</span>
// // //               <span className="assign-value">
// // //                 {getCustomerName(pendingAdmin, customers)}
// // //               </span>
// // //             </div>

// // //             <div className="assign-row">
// // //               <span className="assign-label">Email</span>
// // //               <span className="assign-value">{pendingAdmin.email}</span>
// // //             </div>

// // //             <div className="assign-row">
// // //               <span className="assign-label">Role</span>
// // //               <span className="assign-value">
// // //                 {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
// // //               </span>
// // //             </div>

// // //             <label className="assign-select">
// // //               Zone *
// // //               {zonesLoading ? (
// // //                 <span className="assign-loading">Loading zones...</span>
// // //               ) : zones.length === 0 ? (
// // //                 <span className="assign-loading">
// // //                   No zones available for this customer.
// // //                 </span>
// // //               ) : (
// // //                 <select
// // //                   value={selectedZone}
// // //                   onChange={(e) => setSelectedZone(e.target.value)}
// // //                 >
// // //                   <option value="">— Select a zone —</option>
// // //                   {zones.map((z) => (
// // //                     <option key={z.id} value={z.id}>
// // //                       {z.name}{z.code ? ` (${z.code})` : ""}
// // //                     </option>
// // //                   ))}
// // //                 </select>
// // //               )}
// // //             </label>
// // //           </div>

// // //           {assignError && <div className="form-error">{assignError}</div>}

// // //           <div className="panel-actions">
// // //             <button
// // //               type="button"
// // //               className="btn-secondary"
// // //               onClick={() => {
// // //                 setAssignError("");
// // //                 setView("assign-customer");
// // //                 if (customers.length === 0) fetchCustomers();
// // //               }}
// // //               disabled={assigning}
// // //             >
// // //               <FiArrowLeft /> Back to Customer
// // //             </button>
// // //             <button
// // //               type="button"
// // //               className="btn-primary"
// // //               onClick={handleAssignSave}
// // //               disabled={assigning || !selectedZone}
// // //             >
// // //               <FiCheckCircle /> {assigning ? "Saving..." : "Save & Return to List"}
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* ================= DELETE CONFIRMATION ================= */}
// // //       {confirmDelete && (
// // //         <div
// // //           className="admins-modal-overlay"
// // //           onClick={() => !deleting && setConfirmDelete(null)}
// // //         >
// // //           <div
// // //             className="admins-modal admins-modal-small"
// // //             onClick={(e) => e.stopPropagation()}
// // //           >
// // //             <h2>Delete Admin</h2>
// // //             <p>
// // //               Are you sure you want to delete{" "}
// // //               <strong>{confirmDelete.name || confirmDelete.email}</strong>?
// // //               This cannot be undone.
// // //             </p>
// // //             <div className="panel-actions">
// // //               <button
// // //                 className="btn-secondary"
// // //                 onClick={() => setConfirmDelete(null)}
// // //                 disabled={deleting}
// // //               >
// // //                 Cancel
// // //               </button>
// // //               <button
// // //                 className="btn-danger-solid"
// // //                 onClick={handleDelete}
// // //                 disabled={deleting}
// // //               >
// // //                 {deleting ? "Deleting..." : "Delete"}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // export default Admin_Creation;


// // import React, { useCallback, useEffect, useMemo, useState } from "react";
// // import {
// //   FiTrash2, FiArrowLeft, FiMapPin, FiCheckCircle,
// //   FiUserPlus, FiEdit2, FiEdit3, FiUsers,
// // } from "react-icons/fi";
// // import "./CustomerCreation.css";

// // const API_BASE      = "http://localhost:8000/api";
// // const USERS_URL     = `${API_BASE}/admins/`;
// // const ZONES_URL     = `${API_BASE}/zones/`;
// // const CUSTOMERS_URL = `${API_BASE}/customers/`;

// // const getToken = () =>
// //   localStorage.getItem("token") ||
// //   localStorage.getItem("authToken") ||
// //   localStorage.getItem("access_token") ||
// //   localStorage.getItem("accessToken") ||
// //   "";

// // const authHeaders = () => {
// //   const token = getToken();
// //   return {
// //     "Content-Type": "application/json",
// //     ...(token ? { Authorization: `Token ${token}` } : {}),
// //   };
// // };

// // const ADMIN_ROLES = ["ZONAL_ADMIN", "CIRCLE_ADMIN", "BR_ADMIN"];

// // const ROLE_LABEL = {
// //   BR_ADMIN:     "Branch Admin",
// //   ZONAL_ADMIN:  "Zonal Admin",
// //   CIRCLE_ADMIN: "Circle Admin",
// //   CUSTOMER:   "Customer Admin",
// // };

// // const emptyForm = {
// //   id:        null,
// //   name:      "",
// //   email:     "",
// //   phone:     "",
// //   role:      "BR_ADMIN",
// //   password:  "",
// //   is_active: true,
// // };

// // function normalizeList(result) {
// //   if (Array.isArray(result))                   return result;
// //   if (result && Array.isArray(result.data))    return result.data;
// //   if (result && Array.isArray(result.results)) return result.results;
// //   return [];
// // }

// // /* ---------------- helpers ---------------- */

// // const getCustomerId = (admin) => {
// //   if (!admin) return "";
// //   const raw =
// //     admin.customer_id ??
// //     (admin.customer && typeof admin.customer === "object"
// //       ? admin.customer.id
// //       : admin.customer);
// //   return raw === null || raw === undefined ? "" : String(raw);
// // };

// // const getCustomerName = (admin, customers = []) => {
// //   if (!admin) return "-";

// //   if (admin.customer_name) return admin.customer_name;
// //   if (admin.customer && typeof admin.customer === "object" && admin.customer.name) {
// //     return admin.customer.name;
// //   }

// //   const id = getCustomerId(admin);
// //   if (id) {
// //     const found = customers.find((c) => String(c.id) === id);
// //     if (found) return found.name || found.customer_name || id;
// //     return id;
// //   }

// //   return admin.org_name || admin.organization_name || "-";
// // };

// // const getZoneId = (admin) => {
// //   if (!admin) return "";
// //   const raw =
// //     admin.zone_id ??
// //     (admin.zone && typeof admin.zone === "object" ? admin.zone.id : admin.zone);
// //   return raw === null || raw === undefined ? "" : String(raw);
// // };

// // /* =========================================================
// //    COMPONENT
// // ========================================================= */

// // function Admin_Creation({ currentUser = null }) {

// //   /* ---------- detect customer-scoped user ---------- */

// //   const isCustomerUser = Boolean(
// //     currentUser &&
// //       (currentUser.role === "CUSTOMER" ||
// //         currentUser.customer_id ||
// //         currentUser.customer)
// //   );

// //   const currentCustomerId = isCustomerUser
// //     ? String(
// //         currentUser.customer_id ??
// //           (currentUser.customer && typeof currentUser.customer === "object"
// //             ? currentUser.customer.id
// //             : currentUser.customer) ??
// //           ""
// //       )
// //     : "";

// //   const currentCustomerName = isCustomerUser
// //     ? currentUser.customer_name ||
// //       (currentUser.customer && typeof currentUser.customer === "object"
// //         ? currentUser.customer.name
// //         : "") ||
// //       `Customer #${currentCustomerId}`
// //     : "";

// //   /* ---------- state ---------- */

// //   const [view, setView] = useState("list");

// //   const [users, setUsers]         = useState([]);
// //   const [zones, setZones]         = useState([]);
// //   const [customers, setCustomers] = useState([]);
// //   const [loading, setLoading]     = useState(true);
// //   const [error, setError]         = useState("");
// //   const [search, setSearch]       = useState("");

// //   const [form, setForm]           = useState(emptyForm);
// //   const [formError, setFormError] = useState("");
// //   const [saving, setSaving]       = useState(false);
// //   const isEditing = Boolean(form.id);

// //   const [pendingAdmin, setPendingAdmin]           = useState(null);
// //   const [selectedCustomer, setSelectedCustomer]   = useState("");
// //   const [selectedZone, setSelectedZone]           = useState("");
// //   const [assignError, setAssignError]             = useState("");
// //   const [assigning, setAssigning]                 = useState(false);
// //   const [zonesLoading, setZonesLoading]           = useState(false);

// //   const [customersLoading, setCustomersLoading]   = useState(false);
// //   const [assigningCustomer, setAssigningCustomer] = useState(false);

// //   const [confirmDelete, setConfirmDelete] = useState(null);
// //   const [deleting, setDeleting]           = useState(false);

// //   /* =========================================================
// //      FETCHERS
// //   ========================================================= */

// //   const fetchUsers = useCallback(async () => {
// //     try {
// //       setError("");
// //       const res = await fetch(USERS_URL, {
// //         method: "GET",
// //         cache: "no-store",
// //         headers: authHeaders(),
// //       });
// //       if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
// //       if (!res.ok)            throw new Error(`HTTP ${res.status}`);
// //       const result = await res.json();
// //       setUsers(normalizeList(result));
// //     } catch (err) {
// //       setError(err.message || "Unable to load admins.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => { fetchUsers(); }, [fetchUsers]);

// //   /* Customers are only needed in Org mode */
// //   const fetchCustomers = useCallback(async () => {
// //     if (isCustomerUser) {
// //       // seed with the logged-in customer so we don't hit the API
// //       setCustomers([
// //         { id: currentCustomerId, name: currentCustomerName },
// //       ]);
// //       return;
// //     }

// //     setCustomersLoading(true);
// //     try {
// //       const res = await fetch(CUSTOMERS_URL, {
// //         method: "GET",
// //         cache: "no-store",
// //         headers: authHeaders(),
// //       });
// //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //       const result = await res.json();
// //       setCustomers(normalizeList(result));
// //     } catch (err) {
// //       setAssignError(err.message || "Unable to load customers.");
// //     } finally {
// //       setCustomersLoading(false);
// //     }
// //   }, [isCustomerUser, currentCustomerId, currentCustomerName]);

// //   const fetchZones = useCallback(async (customerId) => {
// //     setZonesLoading(true);
// //     setAssignError("");
// //     try {
// //       // Customer users → always scope by their own customer_id
// //       const scopeId = isCustomerUser ? currentCustomerId : customerId;

// //       const url = scopeId
// //         ? `${ZONES_URL}?customer=${encodeURIComponent(scopeId)}`
// //         : ZONES_URL;

// //       const res = await fetch(url, {
// //         method: "GET",
// //         cache: "no-store",
// //         headers: authHeaders(),
// //       });
// //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //       const result = await res.json();

// //       let list = normalizeList(result);

// //       if (scopeId && list.some((z) => z.customer !== undefined || z.customer_id !== undefined)) {
// //         list = list.filter(
// //           (z) =>
// //             String(
// //               z.customer_id ??
// //                 (z.customer && typeof z.customer === "object"
// //                   ? z.customer.id
// //                   : z.customer)
// //             ) === String(scopeId)
// //         );
// //       }

// //       setZones(list);
// //     } catch (err) {
// //       setZones([]);
// //       setAssignError(err.message || "Unable to load zones.");
// //     } finally {
// //       setZonesLoading(false);
// //     }
// //   }, [isCustomerUser, currentCustomerId]);

// //   /* =========================================================
// //      DERIVED
// //   ========================================================= */

// //   const adminUsers = useMemo(() => {
// //     const base = users.filter((u) => ADMIN_ROLES.includes(u.role));

// //     // Customer users only see admins that belong to their own customer
// //     if (isCustomerUser && currentCustomerId) {
// //       return base.filter((u) => getCustomerId(u) === currentCustomerId);
// //     }
// //     return base;
// //   }, [users, isCustomerUser, currentCustomerId]);

// //   const filteredAdmins = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     if (!q) return adminUsers;
// //     return adminUsers.filter((u) =>
// //       [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role]]
// //         .filter(Boolean)
// //         .some((f) => String(f).toLowerCase().includes(q))
// //     );
// //   }, [adminUsers, search]);

// //   /* =========================================================
// //      NAVIGATION
// //   ========================================================= */

// //   const goToCreate = () => {
// //     setForm(emptyForm);
// //     setFormError("");
// //     setView("form");
// //   };

// //   const openEditPanel = (admin) => {
// //     setForm({
// //       id:        admin.id,
// //       name:      admin.name || "",
// //       email:     admin.email || "",
// //       phone:     admin.phone || "",
// //       role:      admin.role || "BR_ADMIN",
// //       password:  "",
// //       is_active: admin.is_active ?? true,
// //     });
// //     setFormError("");
// //     setView("form");
// //   };

// //   const backToList = () => {
// //     setView("list");
// //     setForm(emptyForm);
// //     setFormError("");
// //     setPendingAdmin(null);
// //     setSelectedCustomer("");
// //     setSelectedZone("");
// //     setAssignError("");
// //     setZones([]);
// //   };

// //   /**
// //    * Step 3 (Org only) — pick the admin we are assigning a customer to.
// //    * For customer users, skip straight to Assign Zone.
// //    */
// //   const goToAssignCustomer = () => {
// //     if (isCustomerUser) {
// //       goToAssignZone();
// //       return;
// //     }

// //     const target = pendingAdmin || adminUsers[0] || null;

// //     if (!target) {
// //       setError("No admin available to assign a customer. Create one first.");
// //       return;
// //     }

// //     setPendingAdmin(target);
// //     setSelectedCustomer(getCustomerId(target));
// //     setAssignError("");
// //     setView("assign-customer");

// //     if (customers.length === 0) fetchCustomers();
// //   };

// //   /** Step 4 (Org) / Step 3 (Customer) — pick zone */
// //   const goToAssignZone = () => {
// //     const target = pendingAdmin || adminUsers[0] || null;

// //     if (!target) {
// //       setError("No admin available to assign a zone. Create one first.");
// //       return;
// //     }

// //     if (isCustomerUser) {
// //       setPendingAdmin(target);
// //       setSelectedCustomer(currentCustomerId);
// //       setSelectedZone(getZoneId(target));
// //       setAssignError("");
// //       setView("assign");
// //       fetchZones(currentCustomerId);
// //       return;
// //     }

// //     const custId = selectedCustomer || getCustomerId(target);

// //     if (!custId) {
// //       setError("Assign a customer before assigning a zone.");
// //       setPendingAdmin(target);
// //       setAssignError("");
// //       setView("assign-customer");
// //       if (customers.length === 0) fetchCustomers();
// //       return;
// //     }

// //     setPendingAdmin(target);
// //     setSelectedCustomer(custId);
// //     setSelectedZone(getZoneId(target));
// //     setAssignError("");
// //     setView("assign");
// //     fetchZones(custId);
// //   };

// //   /* =========================================================
// //      FORM HANDLING
// //   ========================================================= */

// //   const handleFieldChange = (field, value) =>
// //     setForm((prev) => ({ ...prev, [field]: value }));

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setFormError("");

// //     if (!form.name.trim())  return setFormError("Name is required.");
// //     if (!form.email.trim()) return setFormError("Email is required.");

// //     if (!isEditing && !form.password.trim()) {
// //       return setFormError("Password is required.");
// //     }

// //     const payload = {
// //     name:      form.name.trim(),
// //     email:     form.email.trim().toLowerCase(),
// //     phone:     form.phone.trim(),
// //     role:      form.role,
// //     is_active: form.is_active,
// //   };

// //   if (form.password.trim()) payload.password = form.password;
// //     setSaving(true);
// //     try {
// //       const url    = isEditing ? `${USERS_URL}${form.id}/` : USERS_URL;
// //       const method = isEditing ? "PATCH" : "POST";

// //       const res = await fetch(url, {
// //         method,
// //         headers: authHeaders(),
// //         body: JSON.stringify(payload),
// //       });

// //       if (!res.ok) {
// //         const errBody = await res.json().catch(() => ({}));
// //         const message =
// //           typeof errBody === "object" && errBody !== null
// //             ? Object.entries(errBody)
// //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// //                 .join(" | ")
// //             : `HTTP ${res.status}`;
// //         throw new Error(message || `HTTP ${res.status}`);
// //       }

// //       const saved = await res.json();

// //       if (isEditing) {
// //         await fetchUsers();
// //         backToList();
// //         return;
// //       }

// //       fetchUsers();
// //       setPendingAdmin(saved);
// //       setSelectedZone("");
// //       setAssignError("");

// //       if (isCustomerUser) {
// //         // Customer users go straight to zone assignment
// //         setSelectedCustomer(currentCustomerId);
// //         setView("assign");
// //         fetchZones(currentCustomerId);
// //       } else {
// //         setSelectedCustomer(getCustomerId(saved));
// //         setView("assign-customer");
// //         fetchCustomers();
// //       }
// //     } catch (err) {
// //       setFormError(err.message || "Could not save admin.");
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   /* =========================================================
// //      STEP 3 (ORG ONLY) — SAVE CUSTOMER
// //   ========================================================= */

// //   const handleCustomerSave = async () => {
// //     if (!pendingAdmin) return;
// //     if (!selectedCustomer) return setAssignError("Please pick a customer.");

// //     setAssigningCustomer(true);
// //     setAssignError("");
// //     try {
// //       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
// //         method: "PATCH",
// //         headers: authHeaders(),
// //         body: JSON.stringify({ customer: selectedCustomer }),
// //       });

// //       if (!res.ok) {
// //         const errBody = await res.json().catch(() => ({}));
// //         const message =
// //           typeof errBody === "object" && errBody !== null
// //             ? Object.entries(errBody)
// //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// //                 .join(" | ")
// //             : `HTTP ${res.status}`;
// //         throw new Error(message || `HTTP ${res.status}`);
// //       }

// //       const updated = await res.json().catch(() => null);
// //       setPendingAdmin((prev) => ({
// //         ...(prev || {}),
// //         ...(updated || {}),
// //         customer: selectedCustomer,
// //       }));

// //       await fetchUsers();

// //       setSelectedZone("");
// //       setAssignError("");
// //       setView("assign");
// //       fetchZones(selectedCustomer);
// //     } catch (err) {
// //       setAssignError(err.message || "Could not assign customer.");
// //     } finally {
// //       setAssigningCustomer(false);
// //     }
// //   };

// //   /* =========================================================
// //      ZONE SAVE
// //   ========================================================= */

// //   const handleAssignSave = async () => {
// //     if (!pendingAdmin) return;
// //     if (!selectedZone) return setAssignError("Please pick a zone.");

// //     setAssigning(true);
// //     setAssignError("");
// //     try {
// //       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
// //         method: "PATCH",
// //         headers: authHeaders(),
// //         body: JSON.stringify({ zone: selectedZone }),
// //       });

// //       if (!res.ok) {
// //         const errBody = await res.json().catch(() => ({}));
// //         const message =
// //           typeof errBody === "object" && errBody !== null
// //             ? Object.entries(errBody)
// //                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// //                 .join(" | ")
// //             : `HTTP ${res.status}`;
// //         throw new Error(message || `HTTP ${res.status}`);
// //       }

// //       await fetchUsers();
// //       backToList();
// //     } catch (err) {
// //       setAssignError(err.message || "Could not assign zone.");
// //     } finally {
// //       setAssigning(false);
// //     }
// //   };

// //   /* =========================================================
// //      DELETE
// //   ========================================================= */

// //   const handleDelete = async () => {
// //     if (!confirmDelete || deleting) return;
// //     setDeleting(true);
// //     try {
// //       const res = await fetch(`${USERS_URL}${confirmDelete.id}/`, {
// //         method: "DELETE",
// //         headers: authHeaders(),
// //       });
// //       if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
// //       setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
// //       setConfirmDelete(null);
// //     } catch (err) {
// //       setError(err.message || "Could not delete admin.");
// //       setConfirmDelete(null);
// //     } finally {
// //       setDeleting(false);
// //     }
// //   };

// //   /* =========================================================
// //      RENDER
// //   ========================================================= */

// //   const heading = isCustomerUser
// //     ? `Admins — ${currentCustomerName}`
// //     : "Admins";

// //   return (
// //     <div className="admins-page">

// //       {/* STEPPER */}
// //       <ol className="admins-stepper">
// //         <li className={view === "list" ? "active" : "done"}>
// //           <button type="button" className="step-btn" onClick={backToList}>
// //             <span className="step-num">1</span> Admins
// //           </button>
// //         </li>

// //         <li
// //           className={
// //             view === "form"
// //               ? "active"
// //               : view === "assign-customer" || view === "assign"
// //                 ? "done"
// //                 : ""
// //           }
// //         >
// //           <button type="button" className="step-btn" onClick={goToCreate}>
// //             <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
// //           </button>
// //         </li>

// //         {/* Step 3 only for Org users */}
// //         {!isCustomerUser && (
// //           <li
// //             className={
// //               view === "assign-customer"
// //                 ? "active"
// //                 : view === "assign"
// //                   ? "done"
// //                   : ""
// //             }
// //           >
// //             <button
// //               type="button"
// //               className="step-btn"
// //               onClick={goToAssignCustomer}
// //               disabled={!pendingAdmin && adminUsers.length === 0}
// //             >
// //               <span className="step-num">3</span> Assign Customer
// //             </button>
// //           </li>
// //         )}

// //         <li className={view === "assign" ? "active" : ""}>
// //           <button
// //             type="button"
// //             className="step-btn"
// //             onClick={goToAssignZone}
// //             disabled={!pendingAdmin && adminUsers.length === 0}
// //           >
// //             <span className="step-num">{isCustomerUser ? 3 : 4}</span> Assign Zone
// //           </button>
// //         </li>
// //       </ol>

// //       {/* ================= STEP 1 — LIST ================= */}
// //       {view === "list" && (
// //         <>
// //           <div className="admins-header">
// //             <div>
// //               <h1>{heading}</h1>
// //               <p>
// //                 {isCustomerUser
// //                   ? "Manage the admins under your organization"
// //                   : "Manage the admins under your organization"}
// //               </p>
// //             </div>
// //           </div>

// //           <div className="admins-toolbar">
// //             <input
// //               type="text"
// //               className="admins-search"
// //               placeholder="Search by name, email, phone or role..."
// //               value={search}
// //               onChange={(e) => setSearch(e.target.value)}
// //             />
// //             <span className="admins-count">
// //               {filteredAdmins.length} of {adminUsers.length} admins
// //             </span>
// //           </div>

// //           {error && <div className="admins-error">{error}</div>}

// //           <div className="admins-table-card">
// //             {loading ? (
// //               <div className="admins-loading">Loading admins...</div>
// //             ) : filteredAdmins.length === 0 ? (
// //               <div className="admins-empty">
// //                 {adminUsers.length === 0
// //                   ? "No admins yet. Click “Create” to add one."
// //                   : "No admins match your search."}
// //               </div>
// //             ) : (
// //               <table className="admins-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Name</th>
// //                     <th>Email</th>
// //                     <th>Phone</th>
// //                     <th>Role</th>
// //                     {!isCustomerUser && <th>Customer</th>}
// //                     <th>Zone</th>
// //                     <th>Status</th>
// //                     <th className="actions-col">Actions</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {filteredAdmins.map((u) => (
// //                     <tr key={u.id}>
// //                       <td><strong>{u.name || "-"}</strong></td>
// //                       <td>{u.email}</td>
// //                       <td>{u.phone || "-"}</td>
// //                       <td>{ROLE_LABEL[u.role] || u.role}</td>
// //                       {!isCustomerUser && (
// //                         <td>{getCustomerName(u, customers)}</td>
// //                       )}
// //                       <td>{u.zone_name || u.scope_name || "-"}</td>
// //                       <td>
// //                         <span
// //                           className={
// //                             u.is_active ? "status-active" : "status-inactive"
// //                           }
// //                         >
// //                           ● {u.is_active ? "Active" : "Inactive"}
// //                         </span>
// //                       </td>
// //                       <td className="actions-col">
// //                         <button
// //                           className="btn-icon"
// //                           onClick={() => openEditPanel(u)}
// //                           title="Edit"
// //                           aria-label="Edit"
// //                         >
// //                           <FiEdit2 size={16} />
// //                         </button>
// //                         <button
// //                           className="btn-icon btn-icon-danger"
// //                           onClick={() => setConfirmDelete(u)}
// //                           title="Delete"
// //                           aria-label="Delete"
// //                         >
// //                           <FiTrash2 size={16} />
// //                         </button>
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             )}
// //           </div>
// //         </>
// //       )}

// //       {/* ================= STEP 2 — CREATE / EDIT ================= */}
// //       {view === "form" && (
// //         <div className="admins-panel">
// //           <div className="admins-panel-header">
// //             {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
// //             <div>
// //               <h2>{isEditing ? "Edit Admin" : "Create Admin"}</h2>
// //               <p>
// //                 {isEditing
// //                   ? `Update details for ${form.name || form.email}.`
// //                   : isCustomerUser
// //                     ? `New admin will be created under ${currentCustomerName}.`
// //                     : "Add a new admin. You'll assign a customer and zone in the next steps."}
// //               </p>
// //             </div>
// //           </div>

// //           <form onSubmit={handleSubmit} className="admins-form">
// //             <div className="form-grid">
// //               <label>
// //                 Name *
// //                 <input
// //                   type="text"
// //                   value={form.name}
// //                   onChange={(e) => handleFieldChange("name", e.target.value)}
// //                   placeholder="Jane Doe"
// //                   required
// //                 />
// //               </label>

// //               <label>
// //                 Email *
// //                 <input
// //                   type="email"
// //                   value={form.email}
// //                   onChange={(e) => handleFieldChange("email", e.target.value)}
// //                   placeholder="jane@acme.com"
// //                   required
// //                 />
// //               </label>

// //               <label>
// //                 Phone
// //                 <input
// //                   type="text"
// //                   value={form.phone}
// //                   onChange={(e) => handleFieldChange("phone", e.target.value)}
// //                   placeholder="+91 98765 43210"
// //                 />
// //               </label>

// //               <label>
// //                 Role *
// //                 <select
// //                   value={form.role}
// //                   onChange={(e) => handleFieldChange("role", e.target.value)}
// //                   required
// //                 >
// //                   {ADMIN_ROLES.map((r) => (
// //                     <option key={r} value={r}>{ROLE_LABEL[r]}</option>
// //                   ))}
// //                 </select>
// //               </label>

// //               <label>
// //                 {isEditing ? "Password (leave blank to keep current)" : "Password *"}
// //                 <input
// //                   type="password"
// //                   value={form.password}
// //                   onChange={(e) => handleFieldChange("password", e.target.value)}
// //                   placeholder={isEditing ? "••••••••" : "Set a password"}
// //                   required={!isEditing}
// //                 />
// //               </label>

// //               <label className="checkbox-row">
// //                 <input
// //                   type="checkbox"
// //                   checked={form.is_active}
// //                   onChange={(e) => handleFieldChange("is_active", e.target.checked)}
// //                 />
// //                 Active
// //               </label>
// //             </div>

// //             {formError && <div className="form-error">{formError}</div>}

// //             <div className="panel-actions">
// //               <button
// //                 type="button"
// //                 className="btn-secondary"
// //                 onClick={backToList}
// //                 disabled={saving}
// //               >
// //                 Cancel
// //               </button>
// //               <button type="submit" className="btn-primary" disabled={saving}>
// //                 {saving
// //                   ? "Saving..."
// //                   : isEditing
// //                     ? "Save Changes"
// //                     : isCustomerUser
// //                       ? "Create & Assign Zone"
// //                       : "Create & Continue"}
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       )}

// //       {/* ================= STEP 3 (ORG) — ASSIGN CUSTOMER ================= */}
// //       {!isCustomerUser && view === "assign-customer" && pendingAdmin && (
// //         <div className="admins-panel">
// //           <button className="btn-back" onClick={backToList}>
// //             <FiArrowLeft /> Back to list
// //           </button>

// //           <div className="admins-panel-header">
// //             <FiUsers size={22} />
// //             <div>
// //               <h2>Assign Customer</h2>
// //               <p>
// //                 Choose the customer for{" "}
// //                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
// //               </p>
// //             </div>
// //           </div>

// //           <div className="assign-card">
// //             <div className="assign-row">
// //               <span className="assign-label">Admin</span>
// //               <span className="assign-value">{pendingAdmin.name || "-"}</span>
// //             </div>

// //             <div className="assign-row">
// //               <span className="assign-label">Email</span>
// //               <span className="assign-value">{pendingAdmin.email}</span>
// //             </div>

// //             <div className="assign-row">
// //               <span className="assign-label">Role</span>
// //               <span className="assign-value">
// //                 {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
// //               </span>
// //             </div>

// //             <label className="assign-select">
// //               Customer *
// //               {customersLoading ? (
// //                 <span className="assign-loading">Loading customers...</span>
// //               ) : customers.length === 0 ? (
// //                 <span className="assign-loading">No customers available.</span>
// //               ) : (
// //                 <select
// //                   value={selectedCustomer}
// //                   onChange={(e) => setSelectedCustomer(e.target.value)}
// //                 >
// //                   <option value="">— Select a customer —</option>
// //                   {customers.map((c) => (
// //                     <option key={c.id} value={c.id}>
// //                       {c.name || c.customer_name}
// //                       {c.code ? ` (${c.code})` : ""}
// //                     </option>
// //                   ))}
// //                 </select>
// //               )}
// //             </label>
// //           </div>

// //           {assignError && <div className="form-error">{assignError}</div>}

// //           <div className="panel-actions">
// //             <button
// //               type="button"
// //               className="btn-secondary"
// //               onClick={backToList}
// //               disabled={assigningCustomer}
// //             >
// //               Skip & Return to List
// //             </button>
// //             <button
// //               type="button"
// //               className="btn-primary"
// //               onClick={handleCustomerSave}
// //               disabled={assigningCustomer || !selectedCustomer}
// //             >
// //               <FiCheckCircle />{" "}
// //               {assigningCustomer ? "Saving..." : "Save & Continue"}
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* ================= ZONE ASSIGNMENT (BOTH MODES) ================= */}
// //       {view === "assign" && pendingAdmin && (
// //         <div className="admins-panel">
// //           <button className="btn-back" onClick={backToList}>
// //             <FiArrowLeft /> Back to list
// //           </button>

// //           <div className="admins-panel-header">
// //             <FiMapPin size={22} />
// //             <div>
// //               <h2>Assign Zone</h2>
// //               <p>
// //                 Assign a zone to{" "}
// //                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
// //               </p>
// //             </div>
// //           </div>

// //           <div className="assign-card">
// //             <div className="assign-row">
// //               <span className="assign-label">Admin</span>
// //               <span className="assign-value">{pendingAdmin.name || "-"}</span>
// //             </div>

// //             <div className="assign-row">
// //               <span className="assign-label">Customer</span>
// //               <span className="assign-value">
// //                 {isCustomerUser
// //                   ? currentCustomerName
// //                   : getCustomerName(pendingAdmin, customers)}
// //               </span>
// //             </div>

// //             <div className="assign-row">
// //               <span className="assign-label">Email</span>
// //               <span className="assign-value">{pendingAdmin.email}</span>
// //             </div>

// //             <div className="assign-row">
// //               <span className="assign-label">Role</span>
// //               <span className="assign-value">
// //                 {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
// //               </span>
// //             </div>

// //             <label className="assign-select">
// //               Zone *
// //               {zonesLoading ? (
// //                 <span className="assign-loading">Loading zones...</span>
// //               ) : zones.length === 0 ? (
// //                 <span className="assign-loading">
// //                   No zones available for this customer.
// //                 </span>
// //               ) : (
// //                 <select
// //                   value={selectedZone}
// //                   onChange={(e) => setSelectedZone(e.target.value)}
// //                 >
// //                   <option value="">— Select a zone —</option>
// //                   {zones.map((z) => (
// //                     <option key={z.id} value={z.id}>
// //                       {z.name}{z.code ? ` (${z.code})` : ""}
// //                     </option>
// //                   ))}
// //                 </select>
// //               )}
// //             </label>
// //           </div>

// //           {assignError && <div className="form-error">{assignError}</div>}

// //           <div className="panel-actions">
// //             {/* Customer users cannot go back to customer step */}
// //             {isCustomerUser ? (
// //               <button
// //                 type="button"
// //                 className="btn-secondary"
// //                 onClick={backToList}
// //                 disabled={assigning}
// //               >
// //                 Skip & Return to List
// //               </button>
// //             ) : (
// //               <button
// //                 type="button"
// //                 className="btn-secondary"
// //                 onClick={() => {
// //                   setAssignError("");
// //                   setView("assign-customer");
// //                   if (customers.length === 0) fetchCustomers();
// //                 }}
// //                 disabled={assigning}
// //               >
// //                 <FiArrowLeft /> Back to Customer
// //               </button>
// //             )}

// //             <button
// //               type="button"
// //               className="btn-primary"
// //               onClick={handleAssignSave}
// //               disabled={assigning || !selectedZone}
// //             >
// //               <FiCheckCircle />{" "}
// //               {assigning ? "Saving..." : "Save & Return to List"}
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* ================= DELETE CONFIRMATION ================= */}
// //       {confirmDelete && (
// //         <div
// //           className="admins-modal-overlay"
// //           onClick={() => !deleting && setConfirmDelete(null)}
// //         >
// //           <div
// //             className="admins-modal admins-modal-small"
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             <h2>Delete Admin</h2>
// //             <p>
// //               Are you sure you want to delete{" "}
// //               <strong>{confirmDelete.name || confirmDelete.email}</strong>?
// //               This cannot be undone.
// //             </p>
// //             <div className="panel-actions">
// //               <button
// //                 className="btn-secondary"
// //                 onClick={() => setConfirmDelete(null)}
// //                 disabled={deleting}
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 className="btn-danger-solid"
// //                 onClick={handleDelete}
// //                 disabled={deleting}
// //               >
// //                 {deleting ? "Deleting..." : "Delete"}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default Admin_Creation;



// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   FiTrash2, FiArrowLeft, FiMapPin, FiCheckCircle,
//   FiUserPlus, FiEdit2, FiEdit3, FiUsers,
// } from "react-icons/fi";
// import "./CustomerCreation.css";

// const API_BASE      = "http://localhost:8000/api";
// const USERS_URL     = `${API_BASE}/admins/`;
// const ZONES_URL     = `${API_BASE}/zones/`;
// const CUSTOMERS_URL = `${API_BASE}/customers/`;

// const getToken = () =>
//   localStorage.getItem("token") ||
//   localStorage.getItem("authToken") ||
//   localStorage.getItem("access_token") ||
//   localStorage.getItem("accessToken") ||
//   "";

// const authHeaders = () => {
//   const token = getToken();
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Token ${token}` } : {}),
//   };
// };

// const ADMIN_ROLES = ["ZONAL_ADMIN", "CIRCLE_ADMIN", "BR_ADMIN"];

// const ROLE_LABEL = {
//   BR_ADMIN:     "Branch Admin",
//   ZONAL_ADMIN:  "Zonal Admin",
//   CIRCLE_ADMIN: "Circle Admin",
//   CUSTOMER:   "Customer Admin",
// };

// const emptyForm = {
//   id:        null,
//   name:      "",
//   email:     "",
//   phone:     "",
//   role:      "BR_ADMIN",
//   password:  "",
//   is_active: true,
// };

// function normalizeList(result) {
//   if (Array.isArray(result))                   return result;
//   if (result && Array.isArray(result.data))    return result.data;
//   if (result && Array.isArray(result.results)) return result.results;
//   return [];
// }

// const getCustomerId = (admin) => {
//   if (!admin) return "";
//   const raw =
//     admin.customer_id ??
//     (admin.customer && typeof admin.customer === "object"
//       ? admin.customer.id
//       : admin.customer);
//   return raw === null || raw === undefined ? "" : String(raw);
// };

// const getCustomerName = (admin, customers = []) => {
//   if (!admin) return "-";

//   if (admin.customer_name) return admin.customer_name;
//   if (admin.customer && typeof admin.customer === "object" && admin.customer.name) {
//     return admin.customer.name;
//   }

//   const id = getCustomerId(admin);
//   if (id) {
//     const found = customers.find((c) => String(c.id) === id);
//     if (found) return found.name || found.customer_name || id;
//     return id;
//   }

//   return admin.org_name || admin.organization_name || "-";
// };

// const getZoneId = (admin) => {
//   if (!admin) return "";
//   const raw =
//     admin.zone_id ??
//     (admin.zone && typeof admin.zone === "object" ? admin.zone.id : admin.zone);
//   return raw === null || raw === undefined ? "" : String(raw);
// };

// function Admin_Creation({ currentUser = null }) {

//   const isCustomerUser = Boolean(
//     currentUser &&
//       (currentUser.role === "CUSTOMER" ||
//         currentUser.customer_id ||
//         currentUser.customer)
//   );

//   const currentCustomerId = isCustomerUser
//     ? String(
//         currentUser.customer_id ??
//           (currentUser.customer && typeof currentUser.customer === "object"
//             ? currentUser.customer.id
//             : currentUser.customer) ??
//           ""
//       )
//     : "";

//   const currentCustomerName = isCustomerUser
//     ? currentUser.customer_name ||
//       (currentUser.customer && typeof currentUser.customer === "object"
//         ? currentUser.customer.name
//         : "") ||
//       `Customer #${currentCustomerId}`
//     : "";

//   const [view, setView] = useState("list");

//   const [users, setUsers]         = useState([]);
//   const [zones, setZones]         = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState("");
//   const [search, setSearch]       = useState("");

//   const [form, setForm]           = useState(emptyForm);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving]       = useState(false);
//   const isEditing = Boolean(form.id);

//   const [pendingAdmin, setPendingAdmin]           = useState(null);
//   const [selectedCustomer, setSelectedCustomer]   = useState("");
//   const [selectedZone, setSelectedZone]           = useState("");
//   const [assignError, setAssignError]             = useState("");
//   const [assigning, setAssigning]                 = useState(false);
//   const [zonesLoading, setZonesLoading]           = useState(false);

//   const [customersLoading, setCustomersLoading]   = useState(false);
//   const [assigningCustomer, setAssigningCustomer] = useState(false);

//   const [confirmDelete, setConfirmDelete] = useState(null);
//   const [deleting, setDeleting]           = useState(false);

//   /* ---------------- FETCHERS ---------------- */

//   const fetchUsers = useCallback(async () => {
//     try {
//       setError("");
//       const res = await fetch(USERS_URL, {
//         method: "GET",
//         cache: "no-store",
//         headers: authHeaders(),
//       });
//       if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
//       if (!res.ok)            throw new Error(`HTTP ${res.status}`);
//       const result = await res.json();
//       setUsers(normalizeList(result));
//     } catch (err) {
//       setError(err.message || "Unable to load admins.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchUsers(); }, [fetchUsers]);

//   const fetchCustomers = useCallback(async () => {
//     if (isCustomerUser) {
//       setCustomers([{ id: currentCustomerId, name: currentCustomerName }]);
//       return;
//     }

//     setCustomersLoading(true);
//     setAssignError("");

//     try {
//       const res = await fetch(CUSTOMERS_URL, {
//         method: "GET",
//         cache: "no-store",
//         headers: authHeaders(),
//       });

//       if (res.status === 401) {
//         throw new Error("401 Unauthorized. Please login again.");
//       }
//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status}`);
//       }

//       const result = await res.json();

//       console.log("CUSTOMERS API RESPONSE:", result);   // debug

//       // Handle: [ ... ] | { data: [...] } | { results: [...] } | { customers: [...] }
//       let list = normalizeList(result);

//       if ((!list || list.length === 0) && result && Array.isArray(result.customers)) {
//         list = result.customers;
//       }

//       setCustomers(list);

//       if (!list.length) {
//         setAssignError("No customers available for this organization.");
//       }
//     } catch (err) {
//       console.error("CUSTOMERS fetch error:", err);
//       setCustomers([]);
//       setAssignError(err.message || "Unable to load customers.");
//     } finally {
//       setCustomersLoading(false);
//     }
//   }, [isCustomerUser, currentCustomerId, currentCustomerName]);

//   const fetchZones = useCallback(async (customerId) => {
//     setZonesLoading(true);
//     setAssignError("");
//     try {
//       const scopeId = isCustomerUser ? currentCustomerId : customerId;

//       const url = scopeId
//         ? `${ZONES_URL}?customer=${encodeURIComponent(scopeId)}`
//         : ZONES_URL;

//       const res = await fetch(url, {
//         method: "GET",
//         cache: "no-store",
//         headers: authHeaders(),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const result = await res.json();

//       let list = normalizeList(result);

//       if (scopeId && list.some((z) => z.customer !== undefined || z.customer_id !== undefined)) {
//         list = list.filter(
//           (z) =>
//             String(
//               z.customer_id ??
//                 (z.customer && typeof z.customer === "object"
//                   ? z.customer.id
//                   : z.customer)
//             ) === String(scopeId)
//         );
//       }

//       setZones(list);
//     } catch (err) {
//       setZones([]);
//       setAssignError(err.message || "Unable to load zones.");
//     } finally {
//       setZonesLoading(false);
//     }
//   }, [isCustomerUser, currentCustomerId]);

//   /* ---------------- DERIVED ---------------- */

//   const adminUsers = useMemo(() => {
//     const base = users.filter((u) => ADMIN_ROLES.includes(u.role));
//     if (isCustomerUser && currentCustomerId) {
//       return base.filter((u) => getCustomerId(u) === currentCustomerId);
//     }
//     return base;
//   }, [users, isCustomerUser, currentCustomerId]);

//   const filteredAdmins = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return adminUsers;
//     return adminUsers.filter((u) =>
//       [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role]]
//         .filter(Boolean)
//         .some((f) => String(f).toLowerCase().includes(q))
//     );
//   }, [adminUsers, search]);

//   /* ---------------- NAVIGATION ---------------- */

//   const goToCreate = () => {
//     setForm(emptyForm);
//     setFormError("");
//     setView("form");
//   };

//   const openEditPanel = (admin) => {
//     setForm({
//       id:        admin.id,
//       name:      admin.name || "",
//       email:     admin.email || "",
//       phone:     admin.phone || "",
//       role:      admin.role || "BR_ADMIN",
//       password:  "",
//       is_active: admin.is_active ?? true,
//     });
//     setFormError("");
//     setView("form");
//   };

//   const backToList = () => {
//     setView("list");
//     setForm(emptyForm);
//     setFormError("");
//     setPendingAdmin(null);
//     setSelectedCustomer("");
//     setSelectedZone("");
//     setAssignError("");
//     setZones([]);
//   };

//   const goToAssignCustomer = () => {
//     if (isCustomerUser) {
//       goToAssignZone();
//       return;
//     }

//     const target = pendingAdmin || adminUsers[0] || null;

//     if (!target) {
//       setError("No admin available to assign a customer. Create one first.");
//       return;
//     }

//     setPendingAdmin(target);
//     setSelectedCustomer(getCustomerId(target));
//     setAssignError("");
//     setView("assign-customer");

//     fetchCustomers();          // ← always fetch, not only when empty
//   };

//   const openAssignFor = (admin) => {
//     setPendingAdmin(admin);
//     setAssignError("");
//     setZones([]);

//     if (isCustomerUser) {
//       setSelectedCustomer(currentCustomerId);
//       setSelectedZone(getZoneId(admin));
//       setView("assign");
//       fetchZones(currentCustomerId);
//       return;
//     }

//     setSelectedCustomer(getCustomerId(admin));
//     setSelectedZone(getZoneId(admin));
//     setView("assign-customer");
//     fetchCustomers();          // ← always fetch
//   };

//   const goToAssignZone = () => {
//     const target = pendingAdmin || adminUsers[0] || null;

//     if (!target) {
//       setError("No admin available to assign a zone. Create one first.");
//       return;
//     }

//     if (isCustomerUser) {
//       setPendingAdmin(target);
//       setSelectedCustomer(currentCustomerId);
//       setSelectedZone(getZoneId(target));
//       setAssignError("");
//       setView("assign");
//       fetchZones(currentCustomerId);
//       return;
//     }

//     const custId = selectedCustomer || getCustomerId(target);

//     if (!custId) {
//       setError("Assign a customer before assigning a zone.");
//       setPendingAdmin(target);
//       setAssignError("");
//       setView("assign-customer");
//       if (customers.length === 0) fetchCustomers();
//       return;
//     }

//     setPendingAdmin(target);
//     setSelectedCustomer(custId);
//     setSelectedZone(getZoneId(target));
//     setAssignError("");
//     setView("assign");
//     fetchZones(custId);
//   };

//   /* ---------------- FORM ---------------- */

//   const handleFieldChange = (field, value) =>
//     setForm((prev) => ({ ...prev, [field]: value }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setFormError("");

//     if (!form.name.trim())  return setFormError("Name is required.");
//     if (!form.email.trim()) return setFormError("Email is required.");

//     if (!isEditing && !form.password.trim()) {
//       return setFormError("Password is required.");
//     }

//     // NOTE: never send `customer` from the client.
//     // - Org mode: the customer is chosen in the next step (PATCH).
//     // - Customer mode: the backend auto-assigns the logged-in customer
//     //   inside perform_create().
//     const payload = {
//       name:      form.name.trim(),
//       email:     form.email.trim().toLowerCase(),
//       phone:     form.phone.trim(),
//       role:      form.role,
//       is_active: form.is_active,
//     };

//     if (form.password.trim()) payload.password = form.password;

//     setSaving(true);
//     try {
//       const url    = isEditing ? `${USERS_URL}${form.id}/` : USERS_URL;
//       const method = isEditing ? "PATCH" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: authHeaders(),
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errBody = await res.json().catch(() => ({}));
//         const message =
//           typeof errBody === "object" && errBody !== null
//             ? Object.entries(errBody)
//                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
//                 .join(" | ")
//             : `HTTP ${res.status}`;
//         throw new Error(message || `HTTP ${res.status}`);
//       }

//       const saved = await res.json();

//       await fetchUsers();

//       if (isEditing) {
//         backToList();
//         return;
//       }

//       setPendingAdmin(saved);
//       setSelectedZone("");
//       setAssignError("");

//       if (isCustomerUser) {
//         // Customer user → straight to zone assignment
//         setSelectedCustomer(currentCustomerId);
//         setView("assign");
//         fetchZones(currentCustomerId);
//       } else {
//         setSelectedCustomer(getCustomerId(saved));
//         setView("assign-customer");
//         fetchCustomers();
//       }
//     } catch (err) {
//       setFormError(err.message || "Could not save admin.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ---------------- STEP 3 (ORG ONLY) ---------------- */

//   const handleCustomerSave = async () => {
//     if (!pendingAdmin) return;
//     if (!selectedCustomer) return setAssignError("Please pick a customer.");

//     setAssigningCustomer(true);
//     setAssignError("");
//     try {
//       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
//         method: "PATCH",
//         headers: authHeaders(),
//         body: JSON.stringify({ customer: selectedCustomer }),
//       });

//       if (!res.ok) {
//         const errBody = await res.json().catch(() => ({}));
//         const message =
//           typeof errBody === "object" && errBody !== null
//             ? Object.entries(errBody)
//                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
//                 .join(" | ")
//             : `HTTP ${res.status}`;
//         throw new Error(message || `HTTP ${res.status}`);
//       }

//       const updated = await res.json().catch(() => null);
//       setPendingAdmin((prev) => ({
//         ...(prev || {}),
//         ...(updated || {}),
//         customer: selectedCustomer,
//       }));

//       await fetchUsers();

//       setSelectedZone("");
//       setAssignError("");
//       setView("assign");
//       fetchZones(selectedCustomer);
//     } catch (err) {
//       setAssignError(err.message || "Could not assign customer.");
//     } finally {
//       setAssigningCustomer(false);
//     }
//   };

//   /* ---------------- ZONE SAVE ---------------- */

//   const handleAssignSave = async () => {
//     if (!pendingAdmin) return;
//     if (!selectedZone) return setAssignError("Please pick a zone.");

//     setAssigning(true);
//     setAssignError("");
//     try {
//       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
//         method: "PATCH",
//         headers: authHeaders(),
//         body: JSON.stringify({ zone: selectedZone }),
//       });

//       if (!res.ok) {
//         const errBody = await res.json().catch(() => ({}));
//         const message =
//           typeof errBody === "object" && errBody !== null
//             ? Object.entries(errBody)
//                 .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
//                 .join(" | ")
//             : `HTTP ${res.status}`;
//         throw new Error(message || `HTTP ${res.status}`);
//       }

//       await fetchUsers();
//       backToList();
//     } catch (err) {
//       setAssignError(err.message || "Could not assign zone.");
//     } finally {
//       setAssigning(false);
//     }
//   };

//   /* ---------------- DELETE ---------------- */

//   const handleDelete = async () => {
//     if (!confirmDelete || deleting) return;
//     setDeleting(true);
//     try {
//       const res = await fetch(`${USERS_URL}${confirmDelete.id}/`, {
//         method: "DELETE",
//         headers: authHeaders(),
//       });
//       if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
//       setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
//       setConfirmDelete(null);
//     } catch (err) {
//       setError(err.message || "Could not delete admin.");
//       setConfirmDelete(null);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   /* ---------------- RENDER ---------------- */

//   const heading = isCustomerUser ? `Admins — ${currentCustomerName}` : "Admins";

//   return (
//     <div className="admins-page">

//       {/* STEPPER */}
//       <ol className="admins-stepper">
//         <li className={view === "list" ? "active" : "done"}>
//           <button type="button" className="step-btn" onClick={backToList}>
//             <span className="step-num">1</span> Admins
//           </button>
//         </li>

//         <li
//           className={
//             view === "form"
//               ? "active"
//               : view === "assign-customer" || view === "assign"
//                 ? "done"
//                 : ""
//           }
//         >
//           <button type="button" className="step-btn" onClick={goToCreate}>
//             <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
//           </button>
//         </li>

//         {/* Step 3 – only for Org users */}
//         {!isCustomerUser && (
//           <li
//             className={
//               view === "assign-customer"
//                 ? "active"
//                 : view === "assign"
//                   ? "done"
//                   : ""
//             }
//           >
//             <button
//               type="button"
//               className="step-btn"
//               onClick={goToAssignCustomer}
//               disabled={!pendingAdmin && adminUsers.length === 0}
//             >
//               <span className="step-num">3</span> Assign Customer
//             </button>
//           </li>
//         )}

//         <li className={view === "assign" ? "active" : ""}>
//           <button
//             type="button"
//             className="step-btn"
//             onClick={goToAssignZone}
//             disabled={!pendingAdmin && adminUsers.length === 0}
//           >
//             <span className="step-num">{isCustomerUser ? 3 : 4}</span> Assign Zone
//           </button>
//         </li>
//       </ol>

//       {/* ================= STEP 1 — LIST ================= */}
//       {/* {view === "list" && (
//         <>
//           <div className="admins-header">
//             <div>
//               <h1>{heading}</h1>
//               <p>Manage the admins under your organization</p>
//             </div>
//           </div>

//           <div className="admins-toolbar">
//             <input
//               type="text"
//               className="admins-search"
//               placeholder="Search by name, email, phone or role..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//             <span className="admins-count">
//               {filteredAdmins.length} of {adminUsers.length} admins
//             </span>
//           </div>

//           {error && <div className="admins-error">{error}</div>}

//           <div className="admins-table-card">
//             {loading ? (
//               <div className="admins-loading">Loading admins...</div>
//             ) : filteredAdmins.length === 0 ? (
//               <div className="admins-empty">
//                 {adminUsers.length === 0
//                   ? "No admins yet. Click “Create” to add one."
//                   : "No admins match your search."}
//               </div>
//             ) : (
//               <table className="admins-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Phone</th>
//                     <th>Role</th>
//                     {!isCustomerUser && <th>Customer</th>}
//                     <th>Zone</th>
//                     <th>Status</th>
//                     <th className="actions-col">Actions</th>
//                     <td>{u.zone_name || u.scope_name || "-"}</td>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredAdmins.map((u) => (
//                     <tr key={u.id}>
//                       <td><strong>{u.name || "-"}</strong></td>
//                       <td>{u.email}</td>
//                       <td>{u.phone || "-"}</td>
//                       <td>{ROLE_LABEL[u.role] || u.role}</td>
//                       {!isCustomerUser && (
//                         <td>{getCustomerName(u, customers)}</td>
//                       )}
//                       <td>{u.zone_name || u.scope_name || "-"}</td>
//                       <td>
//                         <span
//                           className={
//                             u.is_active ? "status-active" : "status-inactive"
//                           }
//                         >
//                           ● {u.is_active ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td className="actions-col">
//                         <button
//                           className="btn-icon"
//                           onClick={() => openAssignFor(u)}
//                           title="Assign customer / zone"
//                           aria-label="Assign"
//                         >
//                           <FiMapPin size={16} />
//                         </button>

//                         <button
//                           className="btn-icon"
//                           onClick={() => openEditPanel(u)}
//                           title="Edit"
//                           aria-label="Edit"
//                         >
//                           <FiEdit2 size={16} />
//                         </button>

//                         <button
//                           className="btn-icon btn-icon-danger"
//                           onClick={() => setConfirmDelete(u)}
//                           title="Delete"
//                           aria-label="Delete"
//                         >
//                           <FiTrash2 size={16} />
//                         </button>
//                       </td>
//                       <td>
//                         {u.zone_name || u.scope_name ? (
//                           u.zone_name || u.scope_name
//                         ) : (
//                           <span className="status-inactive" style={{ fontSize: 11 }}>
//                             ● Unassigned
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </>
//       )} */}

//             {/* ================= STEP 1 — LIST ================= */}
//       {view === "list" && (
//         <>
//           <div className="admins-header">
//             <div>
//               <h1>{heading}</h1>
//               <p>Manage the admins under your organization</p>
//             </div>
//           </div>

//           <div className="admins-toolbar">
//             <input
//               type="text"
//               className="admins-search"
//               placeholder="Search by name, email, phone or role..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//             <span className="admins-count">
//               {filteredAdmins.length} of {adminUsers.length} admins
//             </span>
//           </div>

//           {error && <div className="admins-error">{error}</div>}

//           <div className="admins-table-card">
//             {loading ? (
//               <div className="admins-loading">Loading admins...</div>
//             ) : filteredAdmins.length === 0 ? (
//               <div className="admins-empty">
//                 {adminUsers.length === 0
//                   ? "No admins yet. Click “Create” to add one."
//                   : "No admins match your search."}
//               </div>
//             ) : (
//               <table className="admins-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Phone</th>
//                     <th>Role</th>
//                     {!isCustomerUser && <th>Customer</th>}
//                     <th>Zone</th>
//                     <th>Status</th>
//                     <th className="actions-col">Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filteredAdmins.map((u) => (
//                     <tr key={u.id}>
//                       <td><strong>{u.name || "-"}</strong></td>
//                       <td>{u.email}</td>
//                       <td>{u.phone || "-"}</td>
//                       <td>{ROLE_LABEL[u.role] || u.role}</td>

//                       {!isCustomerUser && (
//                         <td>{getCustomerName(u, customers)}</td>
//                       )}

//                       <td>
//                         {u.zone_name || u.scope_name ? (
//                           u.zone_name || u.scope_name
//                         ) : (
//                           <span
//                             className="status-inactive"
//                             style={{ fontSize: 11 }}
//                           >
//                             ● Unassigned
//                           </span>
//                         )}
//                       </td>

//                       <td>
//                         <span
//                           className={
//                             u.is_active ? "status-active" : "status-inactive"
//                           }
//                         >
//                           ● {u.is_active ? "Active" : "Inactive"}
//                         </span>
//                       </td>

//                       <td className="actions-col">
//                         <button
//                           className="btn-icon"
//                           onClick={() => openAssignFor(u)}
//                           title="Assign customer / zone"
//                           aria-label="Assign"
//                         >
//                           <FiMapPin size={16} />
//                         </button>

//                         <button
//                           className="btn-icon"
//                           onClick={() => openEditPanel(u)}
//                           title="Edit"
//                           aria-label="Edit"
//                         >
//                           <FiEdit2 size={16} />
//                         </button>

//                         <button
//                           className="btn-icon btn-icon-danger"
//                           onClick={() => setConfirmDelete(u)}
//                           title="Delete"
//                           aria-label="Delete"
//                         >
//                           <FiTrash2 size={16} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </>
//       )}

//       {view === "form" && (
//         <div className="admins-panel">
//           <div className="admins-panel-header">
//             {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
//             <div>
//               <h2>{isEditing ? "Edit Admin" : "Create Admin"}</h2>
//               <p>
//                 {isEditing
//                   ? `Update details for ${form.name || form.email}.`
//                   : isCustomerUser
//                     ? `New admin will be created under ${currentCustomerName}.`
//                     : "Add a new admin. You'll assign a customer and zone in the next steps."}
//               </p>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="admins-form">
//             <div className="form-grid">
//               <label>
//                 Name *
//                 <input
//                   type="text"
//                   value={form.name}
//                   onChange={(e) => handleFieldChange("name", e.target.value)}
//                   placeholder="Jane Doe"
//                   required
//                 />
//               </label>

//               <label>
//                 Email *
//                 <input
//                   type="email"
//                   value={form.email}
//                   onChange={(e) => handleFieldChange("email", e.target.value)}
//                   placeholder="jane@acme.com"
//                   required
//                 />
//               </label>

//               <label>
//                 Phone
//                 <input
//                   type="text"
//                   value={form.phone}
//                   onChange={(e) => handleFieldChange("phone", e.target.value)}
//                   placeholder="+91 98765 43210"
//                 />
//               </label>

//               <label>
//                 Role *
//                 <select
//                   value={form.role}
//                   onChange={(e) => handleFieldChange("role", e.target.value)}
//                   required
//                 >
//                   {ADMIN_ROLES.map((r) => (
//                     <option key={r} value={r}>{ROLE_LABEL[r]}</option>
//                   ))}
//                 </select>
//               </label>

//               <label>
//                 {isEditing ? "Password (leave blank to keep current)" : "Password *"}
//                 <input
//                   type="password"
//                   value={form.password}
//                   onChange={(e) => handleFieldChange("password", e.target.value)}
//                   placeholder={isEditing ? "••••••••" : "Set a password"}
//                   required={!isEditing}
//                 />
//               </label>

//               <label className="checkbox-row">
//                 <input
//                   type="checkbox"
//                   checked={form.is_active}
//                   onChange={(e) => handleFieldChange("is_active", e.target.checked)}
//                 />
//                 Active
//               </label>
//             </div>

//             {/* =================================================
//                 CUSTOMER AUTO-ASSIGN INFO (customer users only)
//             ================================================= */}
//             {isCustomerUser && !isEditing && (
//               <div
//                 className="assign-card"
//                 style={{ marginTop: 20 }}
//               >
//                 <div className="assign-row">
//                   <span className="assign-label">Customer</span>
//                   <span className="assign-value">
//                     {currentCustomerName}
//                   </span>
//                 </div>

//                 <div className="assign-row">
//                   <span className="assign-label">Assigned automatically</span>
//                   <span className="assign-value">Yes</span>
//                 </div>

//                 <p
//                   style={{
//                     margin: "12px 0 0",
//                     fontSize: 13,
//                     color: "#6b7280",
//                   }}
//                 >
//                   This admin will be created under{" "}
//                   <strong>{currentCustomerName}</strong>{" "}
//                   automatically. You'll only need to pick a zone in the next step.
//                 </p>
//               </div>
//             )}

//             {formError && <div className="form-error">{formError}</div>}

//             <div className="panel-actions">
//               <button
//                 type="button"
//                 className="btn-secondary"
//                 onClick={backToList}
//                 disabled={saving}
//               >
//                 Cancel
//               </button>
//               <button type="submit" className="btn-primary" disabled={saving}>
//                 {saving
//                   ? "Saving..."
//                   : isEditing
//                     ? "Save Changes"
//                     : isCustomerUser
//                       ? "Create & Assign Zone"
//                       : "Create & Continue"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* ================= STEP 3 (ORG) — ASSIGN CUSTOMER ================= */}
//       {!isCustomerUser && view === "assign-customer" && pendingAdmin && (
//         <div className="admins-panel">
//           <button className="btn-back" onClick={backToList}>
//             <FiArrowLeft /> Back to list
//           </button>

//           <div className="admins-panel-header">
//             <FiUsers size={22} />
//             <div>
//               <h2>Assign Customer</h2>
//               <p>
//                 Choose the customer for{" "}
//                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
//               </p>
//             </div>
//           </div>

//           <div className="assign-card">
//             <div className="assign-row">
//               <span className="assign-label">Admin</span>
//               <span className="assign-value">{pendingAdmin.name || "-"}</span>
//             </div>

//             <div className="assign-row">
//               <span className="assign-label">Email</span>
//               <span className="assign-value">{pendingAdmin.email}</span>
//             </div>

//             <div className="assign-row">
//               <span className="assign-label">Role</span>
//               <span className="assign-value">
//                 {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
//               </span>
//             </div>

//             <label className="assign-select">
//               Customer *
//               {customersLoading ? (
//                 <span className="assign-loading">Loading customers...</span>
//               ) : customers.length === 0 ? (
//                 <span className="assign-loading">No customers available.</span>
//               ) : (
//                 <select
//                   value={selectedCustomer}
//                   onChange={(e) => setSelectedCustomer(e.target.value)}
//                 >
//                   <option value="">— Select a customer —</option>
//                   {customers.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name || c.customer_name}
//                       {c.code ? ` (${c.code})` : ""}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </label>
//           </div>

//           {assignError && <div className="form-error">{assignError}</div>}

//           <div className="panel-actions">
//             <button
//               type="button"
//               className="btn-secondary"
//               onClick={backToList}
//               disabled={assigningCustomer}
//             >
//               Skip & Return to List
//             </button>
//             <button
//               type="button"
//               className="btn-primary"
//               onClick={handleCustomerSave}
//               disabled={assigningCustomer || !selectedCustomer}
//             >
//               <FiCheckCircle />{" "}
//               {assigningCustomer ? "Saving..." : "Save & Continue"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ================= ASSIGN ZONE (BOTH MODES) ================= */}
//       {view === "assign" && pendingAdmin && (
//         <div className="admins-panel">
//           <button className="btn-back" onClick={backToList}>
//             <FiArrowLeft /> Back to list
//           </button>

//           <div className="admins-panel-header">
//             <FiMapPin size={22} />
//             <div>
//               <h2>Assign Zone</h2>
//               <p>
//                 Assign a zone to{" "}
//                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
//               </p>
//             </div>
//           </div>

//           <div className="assign-card">
//             <div className="assign-row">
//               <span className="assign-label">Admin</span>
//               <span className="assign-value">{pendingAdmin.name || "-"}</span>
//             </div>

//             <div className="assign-row">
//               <span className="assign-label">Customer</span>
//               <span className="assign-value">
//                 {isCustomerUser
//                   ? currentCustomerName
//                   : getCustomerName(pendingAdmin, customers)}
//               </span>
//             </div>

//             <div className="assign-row">
//               <span className="assign-label">Email</span>
//               <span className="assign-value">{pendingAdmin.email}</span>
//             </div>

//             <div className="assign-row">
//               <span className="assign-label">Role</span>
//               <span className="assign-value">
//                 {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
//               </span>
//             </div>

//             <label className="assign-select">
//               Zone *
//               {zonesLoading ? (
//                 <span className="assign-loading">Loading zones...</span>
//               ) : zones.length === 0 ? (
//                 <span className="assign-loading">
//                   No zones available for this customer.
//                 </span>
//               ) : (
//                 <select
//                   value={selectedZone}
//                   onChange={(e) => setSelectedZone(e.target.value)}
//                 >
//                   <option value="">— Select a zone —</option>
//                   {zones.map((z) => (
//                     <option key={z.id} value={z.id}>
//                       {z.name}{z.code ? ` (${z.code})` : ""}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </label>
//           </div>

//           {assignError && <div className="form-error">{assignError}</div>}

//           <div className="panel-actions">
//             {isCustomerUser ? (
//               <button
//                 type="button"
//                 className="btn-secondary"
//                 onClick={backToList}
//                 disabled={assigning}
//               >
//                 Skip & Return to List
//               </button>
//             ) : (
//                             <button
//                 type="button"
//                 className="btn-secondary"
//                 onClick={() => {
//                   setAssignError("");
//                   setView("assign-customer");
//                   fetchCustomers();    // ← remove the `if (customers.length === 0)` guard
//                 }}
//                 disabled={assigning}
//               >
//                 <FiArrowLeft /> Back to Customer
//               </button>
//             )}

//             <button
//               type="button"
//               className="btn-primary"
//               onClick={handleAssignSave}
//               disabled={assigning || !selectedZone}
//             >
//               <FiCheckCircle />{" "}
//               {assigning ? "Saving..." : "Save & Return to List"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ================= DELETE ================= */}
//       {confirmDelete && (
//         <div
//           className="admins-modal-overlay"
//           onClick={() => !deleting && setConfirmDelete(null)}
//         >
//           <div
//             className="admins-modal admins-modal-small"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <h2>Delete Admin</h2>
//             <p>
//               Are you sure you want to delete{" "}
//               <strong>{confirmDelete.name || confirmDelete.email}</strong>?
//               This cannot be undone.
//             </p>
//             <div className="panel-actions">
//               <button
//                 className="btn-secondary"
//                 onClick={() => setConfirmDelete(null)}
//                 disabled={deleting}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="btn-danger-solid"
//                 onClick={handleDelete}
//                 disabled={deleting}
//               >
//                 {deleting ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Admin_Creation;



import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiTrash2,
  FiArrowLeft,
  FiMapPin,
  FiCheckCircle,
  FiUserPlus,
  FiEdit2,
  FiEdit3,
  FiUsers,
} from "react-icons/fi";
import "./CustomerCreation.css";

/* =========================================================
   API
========================================================= */

const API_BASE      = "http://localhost:8000/api";
const USERS_URL     = `${API_BASE}/admins/`;
const ZONES_URL     = `${API_BASE}/zones/`;
const CUSTOMERS_URL = `${API_BASE}/customers/`;

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("accessToken") ||
  "";

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
};

/* =========================================================
   ROLES
   Backend Role values: ORG_SUPER_ADMIN, CUSTOMER, BR_ADMIN, ENGINEER
========================================================= */

const ORG_ADMIN_ROLES      = ["CUSTOMER", "BR_ADMIN"];
const CUSTOMER_ADMIN_ROLES = ["BR_ADMIN"];

const ROLE_LABEL = {
  ORG_SUPER_ADMIN: "Org Super Admin",
  CUSTOMER:        "Customer Admin",
  BR_ADMIN:        "Branch Admin",
  ENGINEER:        "Engineer",
};

/* =========================================================
   FORM
========================================================= */

const emptyForm = {
  id:        null,
  name:      "",
  email:     "",
  phone:     "",
  role:      "BR_ADMIN",
  password:  "",
  is_active: true,
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeList(result) {
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.data)) return result.data;
  if (result && Array.isArray(result.results)) return result.results;
  return [];
}

const getCustomerId = (admin) => {
  if (!admin) return "";
  const raw =
    admin.customer_id ??
    (admin.customer && typeof admin.customer === "object"
      ? admin.customer.id
      : admin.customer);
  return raw === null || raw === undefined ? "" : String(raw);
};

const getCustomerName = (admin, customers = []) => {
  if (!admin) return "-";

  if (admin.customer_name) return admin.customer_name;
  if (
    admin.customer &&
    typeof admin.customer === "object" &&
    admin.customer.name
  ) {
    return admin.customer.name;
  }

  const id = getCustomerId(admin);
  if (id) {
    const found = customers.find((c) => String(c.id) === id);
    if (found) return found.company || found.name || found.customer_name || id;
    return id;
  }

  return admin.org_name || admin.organization_name || "-";
};

const getZoneId = (admin) => {
  if (!admin) return "";
  const raw =
    admin.zone_id ??
    (admin.zone && typeof admin.zone === "object"
      ? admin.zone.id
      : admin.zone);
  return raw === null || raw === undefined ? "" : String(raw);
};

/* =========================================================
   COMPONENT
========================================================= */

function Admin_Creation({ currentUser = null }) {
  /* ---------------- who is logged in ---------------- */

  const isCustomerUser = Boolean(
    currentUser &&
      (currentUser.role === "CUSTOMER" ||
        currentUser.customer_id ||
        currentUser.customer)
  );

  const currentCustomerId = isCustomerUser
    ? String(
        currentUser.customer_id ??
          (currentUser.customer && typeof currentUser.customer === "object"
            ? currentUser.customer.id
            : currentUser.customer) ??
          ""
      )
    : "";

  const currentCustomerName = isCustomerUser
    ? currentUser.customer_name ||
      (currentUser.customer && typeof currentUser.customer === "object"
        ? currentUser.customer.name
        : "") ||
      `Customer #${currentCustomerId}`
    : "";

  /* Roles visible/creatable in this context */
  const ADMIN_ROLES = isCustomerUser
    ? CUSTOMER_ADMIN_ROLES
    : ORG_ADMIN_ROLES;

  /* ---------------- state ---------------- */

  const [view, setView]   = useState("list");
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");

  const [form, setForm]           = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving]       = useState(false);
  const isEditing = Boolean(form.id);

  const [pendingAdmin, setPendingAdmin]         = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedZone, setSelectedZone]         = useState("");
  const [assignError, setAssignError]           = useState("");
  const [assigning, setAssigning]               = useState(false);
  const [zonesLoading, setZonesLoading]         = useState(false);

  const [customersLoading, setCustomersLoading]   = useState(false);
  const [assigningCustomer, setAssigningCustomer] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  /* =========================================================
     FETCHERS
  ========================================================= */

  const fetchUsers = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(USERS_URL, {
        method: "GET",
        cache: "no-store",
        headers: authHeaders(),
      });
      if (res.status === 401)
        throw new Error("401 Unauthorized. Please login again.");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setUsers(normalizeList(result));
    } catch (err) {
      setError(err.message || "Unable to load admins.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchCustomers = useCallback(async () => {
    // Customer users already know their customer — no need to hit the API.
    if (isCustomerUser) {
      setCustomers([{ id: currentCustomerId, company: currentCustomerName }]);
      return;
    }

    setCustomersLoading(true);
    setAssignError("");

    try {
      const res = await fetch(CUSTOMERS_URL, {
        method: "GET",
        cache: "no-store",
        headers: authHeaders(),
      });

      if (res.status === 401) {
        throw new Error("401 Unauthorized. Please login again.");
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();
      console.log("CUSTOMERS API RESPONSE:", result);

      let list = normalizeList(result);
      if ((!list || list.length === 0) && Array.isArray(result?.customers)) {
        list = result.customers;
      }

      setCustomers(list);

      if (!list.length) {
        setAssignError("No customers available for this organization.");
      }
    } catch (err) {
      console.error("CUSTOMERS fetch error:", err);
      setCustomers([]);
      setAssignError(err.message || "Unable to load customers.");
    } finally {
      setCustomersLoading(false);
    }
  }, [isCustomerUser, currentCustomerId, currentCustomerName]);

  const fetchZones = useCallback(
    async (customerId) => {
      setZonesLoading(true);
      setAssignError("");

      try {
        const scopeId = isCustomerUser ? currentCustomerId : customerId;

        const url = scopeId
          ? `${ZONES_URL}?customer=${encodeURIComponent(scopeId)}`
          : ZONES_URL;

        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: authHeaders(),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        let list = normalizeList(result);

        if (
          scopeId &&
          list.some(
            (z) => z.customer !== undefined || z.customer_id !== undefined
          )
        ) {
          list = list.filter(
            (z) =>
              String(
                z.customer_id ??
                  (z.customer && typeof z.customer === "object"
                    ? z.customer.id
                    : z.customer)
              ) === String(scopeId)
          );
        }

        setZones(list);
      } catch (err) {
        setZones([]);
        setAssignError(err.message || "Unable to load zones.");
      } finally {
        setZonesLoading(false);
      }
    },
    [isCustomerUser, currentCustomerId]
  );

  /* =========================================================
     DERIVED
  ========================================================= */

  const adminUsers = useMemo(() => {
    const base = users.filter((u) => ADMIN_ROLES.includes(u.role));

    if (isCustomerUser && currentCustomerId) {
      return base.filter((u) => getCustomerId(u) === currentCustomerId);
    }

    return base;
  }, [users, ADMIN_ROLES, isCustomerUser, currentCustomerId]);

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return adminUsers;
    return adminUsers.filter((u) =>
      [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role]]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [adminUsers, search]);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToCreate = () => {
    setForm(emptyForm);
    setFormError("");
    setView("form");
  };

  const openEditPanel = (admin) => {
    setForm({
      id:        admin.id,
      name:      admin.name || "",
      email:     admin.email || "",
      phone:     admin.phone || "",
      role:      admin.role || "BR_ADMIN",
      password:  "",
      is_active: admin.is_active ?? true,
    });
    setFormError("");
    setView("form");
  };

  const backToList = () => {
    setView("list");
    setForm(emptyForm);
    setFormError("");
    setPendingAdmin(null);
    setSelectedCustomer("");
    setSelectedZone("");
    setAssignError("");
    setZones([]);
  };

  /** Step 3 — org only. Customer users skip straight to assign-zone. */
  const goToAssignCustomer = () => {
    if (isCustomerUser) {
      goToAssignZone();
      return;
    }

    const target = pendingAdmin || adminUsers[0] || null;

    if (!target) {
      setError("No admin available to assign a customer. Create one first.");
      return;
    }

    setPendingAdmin(target);
    setSelectedCustomer(getCustomerId(target));
    setAssignError("");
    setView("assign-customer");

    fetchCustomers();
  };

  /** Open the assign flow for an existing admin from the list. */
  const openAssignFor = (admin) => {
    setPendingAdmin(admin);
    setAssignError("");
    setZones([]);

    if (isCustomerUser) {
      setSelectedCustomer(currentCustomerId);
      setSelectedZone(getZoneId(admin));
      setView("assign");
      fetchZones(currentCustomerId);
      return;
    }

    setSelectedCustomer(getCustomerId(admin));
    setSelectedZone(getZoneId(admin));
    setView("assign-customer");
    fetchCustomers();
  };

  /** Step 4 — pick the zone (org) / Step 3 (customer). */
  const goToAssignZone = () => {
    const target = pendingAdmin || adminUsers[0] || null;

    if (!target) {
      setError("No admin available to assign a zone. Create one first.");
      return;
    }

    if (isCustomerUser) {
      setPendingAdmin(target);
      setSelectedCustomer(currentCustomerId);
      setSelectedZone(getZoneId(target));
      setAssignError("");
      setView("assign");
      fetchZones(currentCustomerId);
      return;
    }

    const custId = selectedCustomer || getCustomerId(target);

    if (!custId) {
      setError("Assign a customer before assigning a zone.");
      setPendingAdmin(target);
      setAssignError("");
      setView("assign-customer");
      fetchCustomers();
      return;
    }

    setPendingAdmin(target);
    setSelectedCustomer(custId);
    setSelectedZone(getZoneId(target));
    setAssignError("");
    setView("assign");
    fetchZones(custId);
  };

  /* =========================================================
     FORM
  ========================================================= */

  const handleFieldChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim())  return setFormError("Name is required.");
    if (!form.email.trim()) return setFormError("Email is required.");

    if (!isEditing && !form.password.trim()) {
      return setFormError("Password is required.");
    }

    // `customer` is intentionally NOT sent from the client.
    // - Org mode   → customer is chosen in the next PATCH step.
    // - Customer mode → backend auto-fills customer in perform_create().
    const payload = {
      name:      form.name.trim(),
      email:     form.email.trim().toLowerCase(),
      phone:     form.phone.trim(),
      role:      form.role,
      is_active: form.is_active,
    };

    if (form.password.trim()) payload.password = form.password;

    setSaving(true);
    try {
      const url    = isEditing ? `${USERS_URL}${form.id}/` : USERS_URL;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const message =
          typeof errBody === "object" && errBody !== null
            ? Object.entries(errBody)
                .map(
                  ([k, v]) =>
                    `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
                )
                .join(" | ")
            : `HTTP ${res.status}`;
        throw new Error(message || `HTTP ${res.status}`);
      }

      const saved = await res.json();

      await fetchUsers();

      if (isEditing) {
        backToList();
        return;
      }

      setPendingAdmin(saved);
      setSelectedZone("");
      setAssignError("");

      if (isCustomerUser) {
        setSelectedCustomer(currentCustomerId);
        setView("assign");
        fetchZones(currentCustomerId);
      } else {
        setSelectedCustomer(getCustomerId(saved));
        setView("assign-customer");
        fetchCustomers();
      }
    } catch (err) {
      setFormError(err.message || "Could not save admin.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     SAVE CUSTOMER (ORG ONLY)
  ========================================================= */

  const handleCustomerSave = async () => {
    if (!pendingAdmin) return;
    if (!selectedCustomer) return setAssignError("Please pick a customer.");

    setAssigningCustomer(true);
    setAssignError("");

    try {
      const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ customer: selectedCustomer }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const message =
          typeof errBody === "object" && errBody !== null
            ? Object.entries(errBody)
                .map(
                  ([k, v]) =>
                    `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
                )
                .join(" | ")
            : `HTTP ${res.status}`;
        throw new Error(message || `HTTP ${res.status}`);
      }

      const updated = await res.json().catch(() => null);

      setPendingAdmin((prev) => ({
        ...(prev || {}),
        ...(updated || {}),
        customer: selectedCustomer,
      }));

      await fetchUsers();

      setSelectedZone("");
      setAssignError("");
      setView("assign");
      fetchZones(selectedCustomer);
    } catch (err) {
      setAssignError(err.message || "Could not assign customer.");
    } finally {
      setAssigningCustomer(false);
    }
  };

  /* =========================================================
     SAVE ZONE
  ========================================================= */

  const handleAssignSave = async () => {
    if (!pendingAdmin) return;
    if (!selectedZone) return setAssignError("Please pick a zone.");

    setAssigning(true);
    setAssignError("");

    try {
      const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ zone: selectedZone }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const message =
          typeof errBody === "object" && errBody !== null
            ? Object.entries(errBody)
                .map(
                  ([k, v]) =>
                    `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
                )
                .join(" | ")
            : `HTTP ${res.status}`;
        throw new Error(message || `HTTP ${res.status}`);
      }

      await fetchUsers();
      backToList();
    } catch (err) {
      setAssignError(err.message || "Could not assign zone.");
    } finally {
      setAssigning(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {
    if (!confirmDelete || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`${USERS_URL}${confirmDelete.id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204)
        throw new Error(`HTTP ${res.status}`);

      setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err) {
      setError(err.message || "Could not delete admin.");
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  const heading = isCustomerUser ? `Admins — ${currentCustomerName}` : "Admins";

  return (
    <div className="admins-page">
      {/* ================= STEPPER ================= */}
      <ol className="admins-stepper">
        <li className={view === "list" ? "active" : "done"}>
          <button type="button" className="step-btn" onClick={backToList}>
            <span className="step-num">1</span> Admins
          </button>
        </li>

        <li
          className={
            view === "form"
              ? "active"
              : view === "assign-customer" || view === "assign"
              ? "done"
              : ""
          }
        >
          <button type="button" className="step-btn" onClick={goToCreate}>
            <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
          </button>
        </li>

        {!isCustomerUser && (
          <li
            className={
              view === "assign-customer"
                ? "active"
                : view === "assign"
                ? "done"
                : ""
            }
          >
            <button
              type="button"
              className="step-btn"
              onClick={goToAssignCustomer}
              disabled={!pendingAdmin && adminUsers.length === 0}
            >
              <span className="step-num">3</span> Assign Customer
            </button>
          </li>
        )}

        <li className={view === "assign" ? "active" : ""}>
          <button
            type="button"
            className="step-btn"
            onClick={goToAssignZone}
            disabled={!pendingAdmin && adminUsers.length === 0}
          >
            <span className="step-num">{isCustomerUser ? 3 : 4}</span> Assign Zone
          </button>
        </li>
      </ol>

      {/* ================= STEP 1 — LIST ================= */}
      {view === "list" && (
        <>
          <div className="admins-header">
            <div>
              <h1>{heading}</h1>
              <p>Manage the admins under your organization</p>
            </div>
          </div>

          <div className="admins-toolbar">
            <input
              type="text"
              className="admins-search"
              placeholder="Search by name, email, phone or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="admins-count">
              {filteredAdmins.length} of {adminUsers.length} admins
            </span>
          </div>

          {error && <div className="admins-error">{error}</div>}

          <div className="admins-table-card">
            {loading ? (
              <div className="admins-loading">Loading admins...</div>
            ) : filteredAdmins.length === 0 ? (
              <div className="admins-empty">
                {adminUsers.length === 0
                  ? "No admins yet. Click “Create” to add one."
                  : "No admins match your search."}
              </div>
            ) : (
              <table className="admins-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    {!isCustomerUser && <th>Customer</th>}
                    <th>Zone</th>
                    <th>Status</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAdmins.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name || "-"}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || "-"}</td>
                      <td>{ROLE_LABEL[u.role] || u.role}</td>

                      {!isCustomerUser && (
                        <td>{getCustomerName(u, customers)}</td>
                      )}

                      <td>
                        {u.zone_name || u.scope_name ? (
                          u.zone_name || u.scope_name
                        ) : (
                          <span
                            className="status-inactive"
                            style={{ fontSize: 11 }}
                          >
                            ● Unassigned
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            u.is_active ? "status-active" : "status-inactive"
                          }
                        >
                          ● {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="actions-col">
                        <button
                          className="btn-icon"
                          onClick={() => openAssignFor(u)}
                          title="Assign customer / zone"
                          aria-label="Assign"
                        >
                          <FiMapPin size={16} />
                        </button>

                        <button
                          className="btn-icon"
                          onClick={() => openEditPanel(u)}
                          title="Edit"
                          aria-label="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => setConfirmDelete(u)}
                          title="Delete"
                          aria-label="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ================= STEP 2 — CREATE / EDIT ================= */}
      {view === "form" && (
        <div className="admins-panel">
          <div className="admins-panel-header">
            {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
            <div>
              <h2>{isEditing ? "Edit Admin" : "Create Admin"}</h2>
              <p>
                {isEditing
                  ? `Update details for ${form.name || form.email}.`
                  : isCustomerUser
                  ? `New admin will be created under ${currentCustomerName}.`
                  : "Add a new admin. You'll assign a customer and zone in the next steps."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admins-form">
            <div className="form-grid">
              <label>
                Name *
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </label>

              <label>
                Email *
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="jane@acme.com"
                  required
                />
              </label>

              <label>
                Phone
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>

              <label>
                Role *
                <select
                  value={form.role}
                  onChange={(e) => handleFieldChange("role", e.target.value)}
                  required
                >
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {isEditing
                  ? "Password (leave blank to keep current)"
                  : "Password *"}
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  placeholder={isEditing ? "••••••••" : "Set a password"}
                  required={!isEditing}
                />
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    handleFieldChange("is_active", e.target.checked)
                  }
                />
                Active
              </label>
            </div>

            {/* Customer auto-assign info (customer users only) */}
            {isCustomerUser && !isEditing && (
              <div className="assign-card" style={{ marginTop: 20 }}>
                <div className="assign-row">
                  <span className="assign-label">Customer</span>
                  <span className="assign-value">{currentCustomerName}</span>
                </div>

                <div className="assign-row">
                  <span className="assign-label">Assigned automatically</span>
                  <span className="assign-value">Yes</span>
                </div>

                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  This admin will be created under{" "}
                  <strong>{currentCustomerName}</strong> automatically. You'll
                  only need to pick a zone in the next step.
                </p>
              </div>
            )}

            {formError && <div className="form-error">{formError}</div>}

            <div className="panel-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={backToList}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : isCustomerUser
                  ? "Create & Assign Zone"
                  : "Create & Continue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STEP 3 (ORG) — ASSIGN CUSTOMER ================= */}
      {!isCustomerUser && view === "assign-customer" && pendingAdmin && (
        <div className="admins-panel">
          <button className="btn-back" onClick={backToList}>
            <FiArrowLeft /> Back to list
          </button>

          <div className="admins-panel-header">
            <FiUsers size={22} />
            <div>
              <h2>Assign Customer</h2>
              <p>
                Choose the customer for{" "}
                <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
              </p>
            </div>
          </div>

          <div className="assign-card">
            <div className="assign-row">
              <span className="assign-label">Admin</span>
              <span className="assign-value">{pendingAdmin.name || "-"}</span>
            </div>

            <div className="assign-row">
              <span className="assign-label">Email</span>
              <span className="assign-value">{pendingAdmin.email}</span>
            </div>

            <div className="assign-row">
              <span className="assign-label">Role</span>
              <span className="assign-value">
                {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
              </span>
            </div>

            <label className="assign-select">
              Customer *
              {customersLoading ? (
                <span className="assign-loading">Loading customers...</span>
              ) : customers.length === 0 ? (
                <span className="assign-loading">
                  No customers available for this organization.
                </span>
              ) : (
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">— Select a customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.name || c.customer_name}
                      {c.code ? ` (${c.code})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          {assignError && <div className="form-error">{assignError}</div>}

          <div className="panel-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={backToList}
              disabled={assigningCustomer}
            >
              Skip & Return to List
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleCustomerSave}
              disabled={assigningCustomer || !selectedCustomer}
            >
              <FiCheckCircle />{" "}
              {assigningCustomer ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </div>
      )}

      {/* ================= ASSIGN ZONE (BOTH MODES) ================= */}
      {view === "assign" && pendingAdmin && (
        <div className="admins-panel">
          <button className="btn-back" onClick={backToList}>
            <FiArrowLeft /> Back to list
          </button>

          <div className="admins-panel-header">
            <FiMapPin size={22} />
            <div>
              <h2>Assign Zone</h2>
              <p>
                Assign a zone to{" "}
                <strong>{pendingAdmin.name || pendingAdmin.email}</strong>
              </p>
            </div>
          </div>

          <div className="assign-card">
            <div className="assign-row">
              <span className="assign-label">Admin</span>
              <span className="assign-value">{pendingAdmin.name || "-"}</span>
            </div>

            <div className="assign-row">
              <span className="assign-label">Customer</span>
              <span className="assign-value">
                {isCustomerUser
                  ? currentCustomerName
                  : getCustomerName(pendingAdmin, customers)}
              </span>
            </div>

            <div className="assign-row">
              <span className="assign-label">Email</span>
              <span className="assign-value">{pendingAdmin.email}</span>
            </div>

            <div className="assign-row">
              <span className="assign-label">Role</span>
              <span className="assign-value">
                {ROLE_LABEL[pendingAdmin.role] || pendingAdmin.role}
              </span>
            </div>

            <label className="assign-select">
              Zone *
              {zonesLoading ? (
                <span className="assign-loading">Loading zones...</span>
              ) : zones.length === 0 ? (
                <span className="assign-loading">
                  No zones available for this customer.
                </span>
              ) : (
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  <option value="">— Select a zone —</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                      {z.code ? ` (${z.code})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          {assignError && <div className="form-error">{assignError}</div>}

          <div className="panel-actions">
            {isCustomerUser ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={backToList}
                disabled={assigning}
              >
                Skip & Return to List
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setAssignError("");
                  setView("assign-customer");
                  fetchCustomers();
                }}
                disabled={assigning}
              >
                <FiArrowLeft /> Back to Customer
              </button>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={handleAssignSave}
              disabled={assigning || !selectedZone}
            >
              <FiCheckCircle />{" "}
              {assigning ? "Saving..." : "Save & Return to List"}
            </button>
          </div>
        </div>
      )}

      {/* ================= DELETE ================= */}
      {confirmDelete && (
        <div
          className="admins-modal-overlay"
          onClick={() => !deleting && setConfirmDelete(null)}
        >
          <div
            className="admins-modal admins-modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Delete Admin</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{confirmDelete.name || confirmDelete.email}</strong>? This
              cannot be undone.
            </p>
            <div className="panel-actions">
              <button
                className="btn-secondary"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger-solid"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin_Creation;