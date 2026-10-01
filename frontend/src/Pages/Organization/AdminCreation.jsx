
// // import React, { useCallback, useEffect, useMemo, useState } from "react";
// // import {
// //   FiTrash2,
// //   FiArrowLeft,
// //   FiMapPin,
// //   FiCheckCircle,
// //   FiUserPlus,
// //   FiEdit2,
// //   FiEdit3,
// //   FiUsers,
// // } from "react-icons/fi";
// // import "./CustomerCreation.css";
// // import { useAuth } from "../Layout/AuthContext";

// // const API_BASE      = "http://localhost:8000/api";
// // const USERS_URL     = `${API_BASE}/admins/`;
// // const ZONES_URL     = `${API_BASE}/zones/`;
// // const CIRCLES_URL   = `${API_BASE}/circles/`;
// // const STATES_URL    = `${API_BASE}/states/`;
// // const DISTRICTS_URL = `${API_BASE}/districts/`;
// // const TALUKAS_URL   = `${API_BASE}/talukas/`;
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

// // const ORG_ADMIN_ROLES      = ["BR_ADMIN"];   // shown to the super admin
// // const CUSTOMER_ADMIN_ROLES = ["BR_ADMIN"];   // shown to a logged-in customer

// // const ROLE_LABEL = {
// //   ORG_SUPER_ADMIN: "Org Super Admin",
// //   CUSTOMER:        "Customer",
// //   BR_ADMIN:        "Branch Admin",
// //   ENGINEER:        "Engineer",
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
// //   if (Array.isArray(result)) return result;
// //   if (result && Array.isArray(result.data)) return result.data;
// //   if (result && Array.isArray(result.results)) return result.results;
// //   return [];
// // }

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
// //   if (
// //     admin.customer &&
// //     typeof admin.customer === "object" &&
// //     admin.customer.name
// //   ) {
// //     return admin.customer.name;
// //   }

// //   const id = getCustomerId(admin);
// //   if (id) {
// //     const found = customers.find((c) => String(c.id) === id);
// //     if (found) return found.company || found.name || found.customer_name || id;
// //     return id;
// //   }

// //   return admin.org_name || admin.organization_name || "-";
// // };

// // const getZoneId = (admin) => {
// //   if (!admin) return "";
// //   const raw =
// //     admin.zone_id ??
// //     (admin.zone && typeof admin.zone === "object"
// //       ? admin.zone.id
// //       : admin.zone);
// //   return raw === null || raw === undefined ? "" : String(raw);
// // };

// // const getCircleId = (admin) => {
// //   if (!admin) return "";
// //   const raw = admin.circle_id ?? (admin.circle && typeof admin.circle === "object" ? admin.circle.id : admin.circle);
// //   return raw === null || raw === undefined ? "" : String(raw);
// // };

// // const getStateId = (admin) => {
// //   if (!admin) return "";
// //   const raw = admin.state_id ?? (admin.state && typeof admin.state === "object" ? admin.state.id : admin.state);
// //   return raw === null || raw === undefined ? "" : String(raw);
// // };

// // const getDistrictId = (admin) => {
// //   if (!admin) return "";
// //   const raw = admin.district_id ?? (admin.district && typeof admin.district === "object" ? admin.district.id : admin.district);
// //   return raw === null || raw === undefined ? "" : String(raw);
// // };

// // function Admin_Creation() {
// //   const { user: currentUser } = useAuth();

// //   const isCustomerUser = currentUser?.role === "CUSTOMER";

// //   const currentCustomerId = isCustomerUser
// //     ? String(currentUser.scopeId ?? "")
// //     : "";

// //   const currentCustomerName = isCustomerUser
// //     ? currentUser.scopeName || `Customer #${currentCustomerId}`
// //     : "";

// //   const canAutoAssignCustomer = isCustomerUser && Boolean(currentCustomerId);

// //   const [view, setView]   = useState("list");
// //   const [users, setUsers] = useState([]);
// //   const [zones, setZones] = useState([]);
// //   const [circles, setCircles] = useState([]);
// //   const [states, setStates] = useState([]);
// //   const [districts, setDistricts] = useState([]);
// //   const [talukas, setTalukas]     = useState([]);
  
// //   const [customers, setCustomers] = useState([]);

// //   const [loading, setLoading] = useState(true);
// //   const [error, setError]     = useState("");
// //   const [search, setSearch]   = useState("");

// //   const [form, setForm]           = useState(emptyForm);
// //   const [formError, setFormError] = useState("");
// //   const [saving, setSaving]       = useState(false);
// //   const isEditing = Boolean(form.id);

// //   const [pendingAdmin, setPendingAdmin]         = useState(null);
// //   const [selectedCustomer, setSelectedCustomer] = useState("");
// //   const [selectedZone, setSelectedZone]         = useState("");
// //   const [selectedCircle, setSelectedCircle]     = useState("");
// //   const [selectedState, setSelectedState]       = useState("");
// //   const [selectedDistrict, setSelectedDistrict] = useState("");
// //   const [assignError, setAssignError]           = useState("");
// //   const [assigning, setAssigning]               = useState(false);
// //   const [zonesLoading, setZonesLoading]         = useState(false);
// //   const [circlesLoading, setCirclesLoading]     = useState(false);
// //   const [statesLoading, setStatesLoading]       = useState(false);
// //   const [districtsLoading, setDistrictsLoading] = useState(false);

// //   const [customersLoading, setCustomersLoading]   = useState(false);
// //   const [assigningCustomer, setAssigningCustomer] = useState(false);

// //   const [confirmDelete, setConfirmDelete] = useState(null);
// //   const [deleting, setDeleting]           = useState(false);

// //   const [cities, setCities]       = useState([]);
// //   const [regions, setRegions]     = useState([]);
// //   const [divisions, setDivisions] = useState([]);

// //   const [selectedTaluka, setSelectedTaluka]     = useState("");
// //   const [selectedCity, setSelectedCity]         = useState("");
// //   const [selectedRegion, setSelectedRegion]     = useState("");
// //   const [selectedDivision, setSelectedDivision] = useState("");

// //   const [talukasLoading, setTalukasLoading]     = useState(false);
// //   const [citiesLoading, setCitiesLoading]       = useState(false);
// //   const [regionsLoading, setRegionsLoading]     = useState(false);
// //   const [divisionsLoading, setDivisionsLoading] = useState(false);

// //   const fetchUsers = useCallback(async () => {
// //     try {
// //       setError("");
// //       const res = await fetch(USERS_URL, {
// //         method: "GET",
// //         cache: "no-store",
// //         headers: authHeaders(),
// //       });
// //       if (res.status === 401)
// //         throw new Error("401 Unauthorized. Please login again.");
// //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //       const result = await res.json();
// //       setUsers(normalizeList(result));
// //     } catch (err) {
// //       setError(err.message || "Unable to load admins.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchUsers();
// //   }, [fetchUsers]);

// //   const fetchCustomers = useCallback(async () => {
// //     // Customer users already know their customer — no need to hit the API.
// //     if (canAutoAssignCustomer) {
// //       setCustomers([{ id: currentCustomerId, company: currentCustomerName }]);
// //       return;
// //     }

// //     setCustomersLoading(true);
// //     setAssignError("");

// //     try {
// //       const res = await fetch(CUSTOMERS_URL, {
// //         method: "GET",
// //         cache: "no-store",
// //         headers: authHeaders(),
// //       });

// //       if (res.status === 401) {
// //         throw new Error("401 Unauthorized. Please login again.");
// //       }
// //       if (!res.ok) {
// //         throw new Error(`HTTP ${res.status}`);
// //       }

// //       const result = await res.json();

// //       let list = normalizeList(result);
// //       if ((!list || list.length === 0) && Array.isArray(result?.customers)) {
// //         list = result.customers;
// //       }

// //       setCustomers(list);

// //       if (!list.length) {
// //         setAssignError("No customers available for this organization.");
// //       }
// //     } catch (err) {
// //       setCustomers([]);
// //       setAssignError(err.message || "Unable to load customers.");
// //     } finally {
// //       setCustomersLoading(false);
// //     }
// //   }, [canAutoAssignCustomer, currentCustomerId, currentCustomerName]);

// //   const fetchZones = useCallback(
// //     async (customerId) => {
// //       setZonesLoading(true);
// //       setAssignError("");

// //       try {
// //         const scopeId = canAutoAssignCustomer ? currentCustomerId : customerId;

// //         const url = scopeId
// //           ? `${ZONES_URL}?customer=${encodeURIComponent(scopeId)}`
// //           : ZONES_URL;

// //         const res = await fetch(url, {
// //           method: "GET",
// //           cache: "no-store",
// //           headers: authHeaders(),
// //         });

// //         if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //         const result = await res.json();

// //         let list = normalizeList(result);

// //         if (
// //           scopeId &&
// //           list.some(
// //             (z) => z.customer !== undefined || z.customer_id !== undefined
// //           )
// //         ) {
// //           list = list.filter(
// //             (z) =>
// //               String(
// //                 z.customer_id ??
// //                   (z.customer && typeof z.customer === "object"
// //                     ? z.customer.id
// //                     : z.customer)
// //               ) === String(scopeId)
// //           );
// //         }

// //         setZones(list);
// //       } catch (err) {
// //         setZones([]);
// //         setAssignError(err.message || "Unable to load zones.");
// //       } finally {
// //         setZonesLoading(false);
// //       }
// //     },
// //     [canAutoAssignCustomer, currentCustomerId]
// //   );

// //   const fetchCircles = useCallback(async (zoneId) => {
// //     if (!zoneId) { setCircles([]); return; }
// //     setCirclesLoading(true);
// //     try {
// //       const res = await fetch(`${CIRCLES_URL}?zone=${encodeURIComponent(zoneId)}`, { method: "GET", cache: "no-store", headers: authHeaders() });
// //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //       setCircles(normalizeList(await res.json()));
// //     } catch (err) {
// //       setCircles([]);
// //       setAssignError(err.message || "Unable to load circles.");
// //     } finally { setCirclesLoading(false); }
// //   }, []);

// //   // const fetchStates = useCallback(async (customerId) => {
// //   //   if (!customerId) { setStates([]); return; }
// //   //   setStatesLoading(true);
// //   //   try {
// //   //     const res = await fetch(`${STATES_URL}?customer=${encodeURIComponent(customerId)}`, { method: "GET", cache: "no-store", headers: authHeaders() });
// //   //     if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //   //     setStates(normalizeList(await res.json()));
// //   //   } catch (err) {
// //   //     setStates([]);
// //   //     setAssignError(err.message || "Unable to load states.");
// //   //   } finally { setStatesLoading(false); }
// //   // }, []);

// //   const fetchStates = useCallback(async (customerId) => {
// //     if (!customerId) {
// //       setStates([]);
// //       return;
// //     }

// //     setStatesLoading(true);
// //     setAssignError("");

// //     try {
// //       const url = `${STATES_URL}?customer=${encodeURIComponent(customerId)}`;
// //       const res = await fetch(url, {
// //         method: "GET",
// //         cache: "no-store",
// //         headers: authHeaders(),
// //       });

// //       if (res.status === 401) {
// //         throw new Error("401 Unauthorized. Please login again.");
// //       }
// //       if (!res.ok) {
// //         throw new Error(`HTTP ${res.status}`);
// //       }

// //       const result = await res.json();
// //       const list = normalizeList(result);

// //       console.log("states for customer", customerId, "→", result, "| parsed:", list);

// //       setStates(list);

// //       if (list.length === 0) {
// //         setAssignError(
// //           `Customer #${customerId} has no states set up yet.`
// //         );
// //       }
// //     } catch (err) {
// //       console.error("fetchStates:", err);
// //       setStates([]);
// //       setAssignError(err.message || "Unable to load states.");
// //     } finally {
// //       setStatesLoading(false);
// //     }
// //   }, []);

// //   const fetchDistricts = useCallback(async (stateId) => {
// //     if (!stateId) { setDistricts([]); return; }
// //     setDistrictsLoading(true);
// //     try {
// //       const res = await fetch(`${DISTRICTS_URL}?state=${encodeURIComponent(stateId)}`, { method: "GET", cache: "no-store", headers: authHeaders() });
// //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //       setDistricts(normalizeList(await res.json()));
// //     } catch (err) {
// //       setDistricts([]);
// //       setAssignError(err.message || "Unable to load districts.");
// //     } finally { setDistrictsLoading(false); }
// //   }, []);

// //   const fetchTalukas = useCallback(async (districtId) => {
// //     if (!districtId) { setTalukas([]); return; }
// //     setTalukasLoading(true);
// //     try {
// //       const res = await fetch(`${TALUKAS_URL}?district=${districtId}`,
// //         { headers: authHeaders(), cache: "no-store" });
// //       setTalukas(normalizeList(await res.json()));
// //     } finally { setTalukasLoading(false); }
// //   }, []);

// //   const fetchCities = useCallback(async (talukaId) => {
// //     if (!talukaId) { setCities([]); return; }
// //     setCitiesLoading(true);
// //     try {
// //       const res = await fetch(`${CITIES_URL}?taluka=${talukaId}`,
// //         { headers: authHeaders(), cache: "no-store" });
// //       setCities(normalizeList(await res.json()));
// //     } finally { setCitiesLoading(false); }
// //   }, []);

// //   const fetchRegions = useCallback(async (circleId) => {
// //     if (!circleId) { setRegions([]); return; }
// //     setRegionsLoading(true);
// //     try {
// //       const res = await fetch(`${REGIONS_URL}?circle=${circleId}`,
// //         { headers: authHeaders(), cache: "no-store" });
// //       setRegions(normalizeList(await res.json()));
// //     } finally { setRegionsLoading(false); }
// //   }, []);

// //   const fetchDivisions = useCallback(async (regionId) => {
// //     if (!regionId) { setDivisions([]); return; }
// //     setDivisionsLoading(true);
// //     try {
// //       const res = await fetch(`${DIVISIONS_URL}?region=${regionId}`,
// //         { headers: authHeaders(), cache: "no-store" });
// //       setDivisions(normalizeList(await res.json()));
// //     } finally { setDivisionsLoading(false); }
// //   }, []);

// //   const getCustomerHierarchy = useCallback((customerId, admin = pendingAdmin) => {
// //     if (admin?.customer_hierarchy_type) return admin.customer_hierarchy_type;
// //     if (isCustomerUser && currentCustomerId === String(customerId)) return currentUser?.customer_hierarchy_type || "";
// //     const customer = customers.find((c) => String(c.id) === String(customerId));
// //     return customer?.hierarchy_type || "";
// //   }, [customers, currentUser, currentCustomerId, isCustomerUser, pendingAdmin]);

// //   // const prepareLocationAssignment = useCallback((customerId, admin) => {
// //   //   const hierarchy = getCustomerHierarchy(customerId, admin);
// //   //   const zoneId = getZoneId(admin);
// //   //   const stateId = getStateId(admin);
// //   //   setSelectedZone(zoneId);
// //   //   setSelectedCircle(getCircleId(admin));
// //   //   setSelectedState(stateId);
// //   //   setSelectedDistrict(getDistrictId(admin));
// //   //   setAssignError("");
// //   //   setZones([]); setCircles([]); setStates([]); setDistricts([]);
// //   //   if (hierarchy === "GEOGRAPHICAL") {
// //   //     // Fetch ALL states from /api/states/
// //   //     fetchStates();

// //   //     // Existing state → district flow
// //   //     if (stateId) {
// //   //       fetchDistricts(stateId);
// //   //     }

// //   //   } else if (hierarchy === "ZONAL") {
// //   //     fetchZones(customerId);
// //   //     if (zoneId) fetchCircles(zoneId);
// //   //   }
// //   // }, [fetchCircles, fetchDistricts, fetchStates, fetchZones, getCustomerHierarchy]);

// //   const prepareLocationAssignment = useCallback(
// //     (customerId, admin) => {
// //       const hierarchy = getCustomerHierarchy(customerId, admin);

// //       const zoneId = getZoneId(admin);
// //       const stateId = getStateId(admin);

// //       setSelectedTaluka(getTalukaId(admin));
// //       setSelectedCity(getCityId(admin));
// //       setSelectedRegion(getRegionId(admin));
// //       setSelectedDivision(getDivisionId(admin));

// //       setTalukas([]); setCities([]); setRegions([]); setDivisions([]);

// //       if (hierarchy === "GEOGRAPHICAL") {
// //         fetchStates(customerId);
// //         if (stateId)    fetchDistricts(stateId);
// //         if (getDistrictId(admin)) fetchTalukas(getDistrictId(admin));
// //         if (getTalukaId(admin))   fetchCities(getTalukaId(admin));
// //       } else if (hierarchy === "ZONAL") {
// //         fetchZones(customerId);
// //         if (zoneId)     fetchCircles(zoneId);
// //         if (getCircleId(admin))   fetchRegions(getCircleId(admin));
// //         if (getRegionId(admin))   fetchDivisions(getRegionId(admin));
// //       }
// //     },
// //     [
// //       fetchCircles,
// //       fetchDistricts,
// //       fetchStates,
// //       fetchZones,
// //       getCustomerHierarchy,
// //     ]
// //   );

// //   const adminUsers = useMemo(() => {
// //     const roles = canAutoAssignCustomer
// //       ? CUSTOMER_ADMIN_ROLES
// //       : ORG_ADMIN_ROLES;

// //     const base = users.filter((u) => roles.includes(u.role));

// //     if (canAutoAssignCustomer) {
// //       return base.filter((u) => getCustomerId(u) === currentCustomerId);
// //     }

// //     return base;
// //   }, [users, canAutoAssignCustomer, currentCustomerId]);

// //   const filteredAdmins = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     if (!q) return adminUsers;
// //     return adminUsers.filter((u) =>
// //       [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role]]
// //         .filter(Boolean)
// //         .some((f) => String(f).toLowerCase().includes(q))
// //     );
// //   }, [adminUsers, search]);

// //   // Role options for the create/edit form
// //   const roleOptions = canAutoAssignCustomer
// //     ? CUSTOMER_ADMIN_ROLES
// //     : ORG_ADMIN_ROLES;

// //   useEffect(() => {
// //     if (!canAutoAssignCustomer) fetchCustomers();
// //   }, [canAutoAssignCustomer, fetchCustomers]);

// //   const goToCreate = () => {
// //     setForm({
// //       ...emptyForm,
// //       role: roleOptions[0] || "BR_ADMIN",
// //     });
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
// //     setSelectedCircle("");
// //     setSelectedState("");
// //     setSelectedDistrict("");
// //     setAssignError("");
// //     setZones([]);
// //     setCircles([]);
// //     setStates([]);
// //     setDistricts([]);
// //   };

// //   /**
// //    * Step 3 — org users only.
// //    * Customer users never see this step; they jump straight to hierarchy-specific location assignment.
// //    */
// //   const goToAssignCustomer = () => {
// //     if (canAutoAssignCustomer) {
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

// //     fetchCustomers();
// //   };

// //   /** Row-level "Assign" icon in the list. */
// //   const openAssignFor = (admin) => {
// //     setPendingAdmin(admin);
// //     setAssignError("");
// //     if (canAutoAssignCustomer) {
// //       setSelectedCustomer(currentCustomerId);
// //       setView("assign");
// //       prepareLocationAssignment(currentCustomerId, admin);
// //       return;
// //     }
// //     setSelectedCustomer(getCustomerId(admin));
// //     setView("assign-customer");
// //     fetchCustomers();
// //   };

// //   /** Step 4 (org) / Step 3 (customer) — pick the location scope. */
// //   const goToAssignZone = () => {
// //     const target = pendingAdmin || adminUsers[0] || null;
// //     if (!target) {
// //       setError("No admin available to assign a location. Create one first.");
// //       return;
// //     }
// //     const custId = canAutoAssignCustomer ? currentCustomerId : selectedCustomer || getCustomerId(target);
// //     if (!custId) {
// //       setError("Assign a customer before assigning a location.");
// //       setPendingAdmin(target);
// //       setAssignError("");
// //       setView("assign-customer");
// //       fetchCustomers();
// //       return;
// //     }
// //     setPendingAdmin(target);
// //     setSelectedCustomer(custId);
// //     setView("assign");
// //     prepareLocationAssignment(custId, target);
// //   };

// //   /* =========================================================
// //      FORM SUBMIT
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

// //     // IMPORTANT: never send `customer` from the client.
// //     //  - Customer mode → backend auto-fills it from request.user.
// //     //  - Org mode      → customer is chosen in the following PATCH step.
// //     const payload = {
// //       name:      form.name.trim(),
// //       email:     form.email.trim().toLowerCase(),
// //       phone:     form.phone.trim(),
// //       role:      form.role,
// //       is_active: form.is_active,
// //     };

// //     if (form.password.trim()) payload.password = form.password;

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
// //                 .map(
// //                   ([k, v]) =>
// //                     `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
// //                 )
// //                 .join(" | ")
// //             : `HTTP ${res.status}`;
// //         throw new Error(message || `HTTP ${res.status}`);
// //       }

// //       const saved = await res.json();

// //       await fetchUsers();

// //       if (isEditing) {
// //         backToList();
// //         return;
// //       }

// //       setPendingAdmin(saved);
// //       setSelectedZone("");
// //       setSelectedCircle("");
// //       setSelectedState("");
// //       setSelectedDistrict("");
// //       setAssignError("");

// //       if (canAutoAssignCustomer) {
// //         // Customer user → straight to hierarchy-specific location assignment.
// //         setSelectedCustomer(currentCustomerId);
// //         setView("assign");
// //         prepareLocationAssignment(currentCustomerId, saved);
// //       } else {
// //         // Org user → ask them which customer this admin belongs to.
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
// //      SAVE CUSTOMER (ORG ONLY)
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
// //         body: JSON.stringify({ customer: selectedCustomer, zone: null, circle: null, state: null, district: null }),
// //       });

// //       if (!res.ok) {
// //         const errBody = await res.json().catch(() => ({}));
// //         const message =
// //           typeof errBody === "object" && errBody !== null
// //             ? Object.entries(errBody)
// //                 .map(
// //                   ([k, v]) =>
// //                     `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
// //                 )
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
// //       setSelectedCircle("");
// //       setSelectedState("");
// //       setSelectedDistrict("");
// //       setAssignError("");
// //       setView("assign");
// //       prepareLocationAssignment(selectedCustomer, updated || { ...pendingAdmin, customer: selectedCustomer });
// //     } catch (err) {
// //       setAssignError(err.message || "Could not assign customer.");
// //     } finally {
// //       setAssigningCustomer(false);
// //     }
// //   };

// //   /* =========================================================
// //      SAVE LOCATION SCOPE
// //   ========================================================= */

// //   const handleAssignSave = async () => {
// //     if (!pendingAdmin) return;
// //     const hierarchy = getCustomerHierarchy(selectedCustomer, pendingAdmin);
// //     if (hierarchy === "GEOGRAPHICAL" && (!selectedState || !selectedDistrict)) return setAssignError("Please select both State and District.");
// //     if (hierarchy === "ZONAL" && (!selectedZone || !selectedCircle)) return setAssignError("Please select both Zone and Circle.");
// //     if (!hierarchy) return setAssignError("Customer hierarchy could not be determined.");

// //     const payload = hierarchy === "GEOGRAPHICAL"
// //       ? { state: selectedState, district: selectedDistrict, zone: null, circle: null }
// //       : { zone: selectedZone, circle: selectedCircle, state: null, district: null };

// //     setAssigning(true);
// //     setAssignError("");
// //     try {
// //       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload) });
// //       if (!res.ok) {
// //         const errBody = await res.json().catch(() => ({}));
// //         const message = typeof errBody === "object" && errBody !== null
// //           ? Object.entries(errBody).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
// //           : `HTTP ${res.status}`;
// //         throw new Error(message || `HTTP ${res.status}`);
// //       }
// //       await fetchUsers();
// //       backToList();
// //     } catch (err) {
// //       setAssignError(err.message || "Could not assign location.");
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
// //       if (!res.ok && res.status !== 204)
// //         throw new Error(`HTTP ${res.status}`);

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

// //   const heading = canAutoAssignCustomer
// //     ? `Admins — ${currentCustomerName}`
// //     : "Admins";

// //   const assignmentHierarchy = getCustomerHierarchy(selectedCustomer, pendingAdmin);
// //   const isGeographical = assignmentHierarchy === "GEOGRAPHICAL";
// //   const assignmentParentLabel = isGeographical ? "State" : "Zone";
// //   const assignmentChildLabel = isGeographical ? "District" : "Circle";

// //   return (
// //     <div className="admins-page">
// //       {/* ================= STEPPER ================= */}
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
// //               ? "done"
// //               : ""
// //           }
// //         >
// //           <button type="button" className="step-btn" onClick={goToCreate}>
// //             <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
// //           </button>
// //         </li>

// //         {/* Step 3 is org-only. Hidden entirely for customer-scoped users. */}
// //         {!canAutoAssignCustomer && (
// //           <li
// //             className={
// //               view === "assign-customer"
// //                 ? "active"
// //                 : view === "assign"
// //                 ? "done"
// //                 : ""
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
// //             <span className="step-num">{canAutoAssignCustomer ? 3 : 4}</span>{" "}
// //             Assign Location
// //           </button>
// //         </li>
// //       </ol>

// //       {/* ================= STEP 1 — LIST ================= */}
// //       {view === "list" && (
// //         <>
// //           <div className="admins-header">
// //             <div>
// //               <h1>{heading}</h1>
// //               <p>Manage the admins under your organization</p>
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
// //                     {!canAutoAssignCustomer && <th>Customer</th>}
// //                     <th>Location</th>
// //                     <th>Status</th>
// //                     <th className="actions-col">Actions</th>
// //                   </tr>
// //                 </thead>

// //                 <tbody>
// //                   {filteredAdmins.map((u) => (
// //                     <tr key={u.id}>
// //                       <td>
// //                         <strong>{u.name || "-"}</strong>
// //                       </td>
// //                       <td>{u.email}</td>
// //                       <td>{u.phone || "-"}</td>
// //                       <td>{ROLE_LABEL[u.role] || u.role}</td>

// //                       {!canAutoAssignCustomer && (
// //                         <td>{getCustomerName(u, customers)}</td>
// //                       )}

// //                       <td>
// //                         {u.customer_hierarchy_type === "GEOGRAPHICAL"
// //                           ? [u.state_name, u.district_name].filter(Boolean).join(" / ")
// //                           : [u.zone_name, u.circle_name].filter(Boolean).join(" / ")}
// //                         {!u.state_name && !u.district_name && !u.zone_name && !u.circle_name && (
// //                           <span className="status-inactive" style={{ fontSize: 11 }}>
// //                             — Unassigned
// //                           </span>
// //                         )}
// //                       </td>

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
// //                           onClick={() => openAssignFor(u)}
// //                           title={canAutoAssignCustomer ? "Assign location" : "Assign customer / location"}
// //                           aria-label="Assign"
// //                         >
// //                           <FiMapPin size={16} />
// //                         </button>

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
// //                   : canAutoAssignCustomer
// //                   ? `New admin will be created under ${currentCustomerName}.`
// //                   : "Add a new admin. You'll assign a customer and zone in the next steps."}
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
// //                   {roleOptions.map((r) => (
// //                     <option key={r} value={r}>
// //                       {ROLE_LABEL[r]}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </label>

// //               <label>
// //                 {isEditing
// //                   ? "Password (leave blank to keep current)"
// //                   : "Password *"}
// //                 <input
// //                   type="password"
// //                   value={form.password}
// //                   onChange={(e) =>
// //                     handleFieldChange("password", e.target.value)
// //                   }
// //                   placeholder={isEditing ? "••••••••" : "Set a password"}
// //                   required={!isEditing}
// //                 />
// //               </label>

// //               <label className="checkbox-row">
// //                 <input
// //                   type="checkbox"
// //                   checked={form.is_active}
// //                   onChange={(e) =>
// //                     handleFieldChange("is_active", e.target.checked)
// //                   }
// //                 />
// //                 Active
// //               </label>
// //             </div>

// //             {/* Auto-assign info card for customer users */}
// //             {canAutoAssignCustomer && !isEditing && (
// //               <div className="assign-card" style={{ marginTop: 20 }}>
// //                 <div className="assign-row">
// //                   <span className="assign-label">Customer</span>
// //                   <span className="assign-value">{currentCustomerName}</span>
// //                 </div>

// //                 <div className="assign-row">
// //                   <span className="assign-label">Assigned automatically</span>
// //                   <span className="assign-value">Yes</span>
// //                 </div>

// //                 <p
// //                   style={{
// //                     margin: "12px 0 0",
// //                     fontSize: 13,
// //                     color: "#6b7280",
// //                   }}
// //                 >
// //                   This admin will be created under{" "}
// //                   <strong>{currentCustomerName}</strong> automatically. You'll
// //                   assign its hierarchy location in the next step.
// //                 </p>
// //               </div>
// //             )}

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
// //                   ? "Save Changes"
// //                   : canAutoAssignCustomer
// //                   ? "Create & Assign Location"
// //                   : "Create & Continue"}
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       )}

// //       {/* ================= STEP 3 (ORG ONLY) — ASSIGN CUSTOMER ================= */}
// //       {!canAutoAssignCustomer && view === "assign-customer" && pendingAdmin && (
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
// //                 <span className="assign-loading">
// //                   No customers available for this organization.
// //                 </span>
// //               ) : (
// //                 <select
// //                   value={selectedCustomer}
// //                   onChange={(e) => setSelectedCustomer(e.target.value)}
// //                 >
// //                   <option value="">— Select a customer —</option>
// //                   {customers.map((c) => (
// //                     <option key={c.id} value={c.id}>
// //                       {c.company || c.name || c.customer_name}
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

// //       {/* ================= ASSIGN HIERARCHY LOCATION ================= */}
// //       {view === "assign" && pendingAdmin && (
// //         <div className="admins-panel">
// //           <button className="btn-back" onClick={backToList}><FiArrowLeft /> Back to list</button>
// //           <div className="admins-panel-header">
// //             <FiMapPin size={22} />
// //             <div>
// //               <h2>Assign Location</h2>
// //               <p>Assign the {assignmentParentLabel} and {assignmentChildLabel.toLowerCase()} to <strong>{pendingAdmin.name || pendingAdmin.email}</strong></p>
// //             </div>
// //           </div>

// //           <div className="assign-card">
// //             <div className="assign-row"><span className="assign-label">Admin</span><span className="assign-value">{pendingAdmin.name || "-"}</span></div>
// //             <div className="assign-row"><span className="assign-label">Customer</span><span className="assign-value">{canAutoAssignCustomer ? currentCustomerName : getCustomerName(pendingAdmin, customers)}</span></div>
// //             <div className="assign-row"><span className="assign-label">Hierarchy</span><span className="assign-value">{isGeographical ? "Geographical — State → District" : assignmentHierarchy === "ZONAL" ? "Zonal — Zone → Circle" : "Not determined"}</span></div>
// //             <div className="assign-row"><span className="assign-label">Email</span><span className="assign-value">{pendingAdmin.email}</span></div>

// //             <label className="assign-select">
// //               {assignmentParentLabel} *
// //               {isGeographical ? (
// //                 statesLoading ? <span className="assign-loading">Loading states...</span> : states.length === 0 ? <span className="assign-loading">No states available for this customer.</span> : (
// //                   <select value={selectedState} onChange={(e) => { const value = e.target.value; setSelectedState(value); setSelectedDistrict(""); setDistricts([]); if (value) fetchDistricts(value); }}>
// //                     <option value="">— Select a state —</option>
// //                     {states.map((state) => <option key={state.id} value={state.id}>{state.name}{state.code ? ` (${state.code})` : ""}</option>)}
// //                   </select>
// //                 )
// //               ) : (
// //                 zonesLoading ? <span className="assign-loading">Loading zones...</span> : zones.length === 0 ? <span className="assign-loading">No zones available for this customer.</span> : (
// //                   <select value={selectedZone} onChange={(e) => { const value = e.target.value; setSelectedZone(value); setSelectedCircle(""); setCircles([]); if (value) fetchCircles(value); }}>
// //                     <option value="">— Select a zone —</option>
// //                     {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}{zone.code ? ` (${zone.code})` : ""}</option>)}
// //                   </select>
// //                 )
// //               )}
// //             </label>

// //             <label className="assign-select">
// //               {assignmentChildLabel} *
// //               {isGeographical ? (
// //                 districtsLoading ? <span className="assign-loading">Loading districts...</span> : !selectedState ? <span className="assign-loading">Select a state first.</span> : districts.length === 0 ? <span className="assign-loading">No districts available under this state.</span> : (
// //                   <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
// //                     <option value="">— Select a district —</option>
// //                     {districts.map((district) => <option key={district.id} value={district.id}>{district.name}{district.code ? ` (${district.code})` : ""}</option>)}
// //                   </select>
// //                 )
// //               ) : (
// //                 circlesLoading ? <span className="assign-loading">Loading circles...</span> : !selectedZone ? <span className="assign-loading">Select a zone first.</span> : circles.length === 0 ? <span className="assign-loading">No circles available under this zone.</span> : (
// //                   <select value={selectedCircle} onChange={(e) => setSelectedCircle(e.target.value)}>
// //                     <option value="">— Select a circle —</option>
// //                     {circles.map((circle) => <option key={circle.id} value={circle.id}>{circle.name}{circle.code ? ` (${circle.code})` : ""}</option>)}
// //                   </select>
// //                 )
// //               )}
// //             </label>
// //           </div>

// //           {assignError && <div className="form-error">{assignError}</div>}
// //           <div className="panel-actions">
// //             {canAutoAssignCustomer ? (
// //               <button type="button" className="btn-secondary" onClick={backToList} disabled={assigning}>Skip & Return to List</button>
// //             ) : (
// //               <button type="button" className="btn-secondary" onClick={() => { setAssignError(""); setView("assign-customer"); fetchCustomers(); }} disabled={assigning}><FiArrowLeft /> Back to Customer</button>
// //             )}
// //             <button type="button" className="btn-primary" onClick={handleAssignSave} disabled={assigning || (isGeographical ? !selectedState || !selectedDistrict : !selectedZone || !selectedCircle)}>
// //               <FiCheckCircle /> {assigning ? "Saving..." : "Save & Return to List"}
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* ================= DELETE ================= */}
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
// //               <strong>{confirmDelete.name || confirmDelete.email}</strong>? This
// //               cannot be undone.
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
//   FiTrash2,
//   FiArrowLeft,
//   FiMapPin,
//   FiCheckCircle,
//   FiUserPlus,
//   FiEdit2,
//   FiEdit3,
//   FiUsers,
// } from "react-icons/fi";
// import "./CustomerCreation.css";
// import { useAuth } from "../Layout/AuthContext";

// const API_BASE      = "http://localhost:8000/api";
// const USERS_URL     = `${API_BASE}/admins/`;
// const ZONES_URL     = `${API_BASE}/zones/`;
// const CIRCLES_URL   = `${API_BASE}/circles/`;
// const REGIONS_URL   = `${API_BASE}/regions/`;
// const DIVISIONS_URL = `${API_BASE}/divisions/`;
// const STATES_URL    = `${API_BASE}/states/`;
// const DISTRICTS_URL = `${API_BASE}/districts/`;
// const TALUKAS_URL   = `${API_BASE}/talukas/`;
// const CITIES_URL    = `${API_BASE}/cities/`;
// const CUSTOMERS_URL = `${API_BASE}/customers/`;

// /* ---------------------------------------------------------
//    HIERARCHY LEVELS (top → bottom)
//    An admin can be assigned at ANY of these levels. The first
//    level is required; every deeper level is optional, but a
//    level can only be picked after the one above it.
//    `parent` = the query-string name the list endpoint filters on.
// --------------------------------------------------------- */
// const LEVELS = {
//   ZONAL: [
//     { key: "zone",     label: "Zone",     url: ZONES_URL },
//     { key: "circle",   label: "Circle",   url: CIRCLES_URL,   parent: "zone" },
//     { key: "region",   label: "Region",   url: REGIONS_URL,   parent: "circle" },
//     { key: "division", label: "Division", url: DIVISIONS_URL, parent: "region" },
//   ],
//   GEOGRAPHICAL: [
//     { key: "state",    label: "State",    url: STATES_URL },
//     { key: "district", label: "District", url: DISTRICTS_URL, parent: "state" },
//     { key: "taluka",   label: "Taluka",   url: TALUKAS_URL,   parent: "district" },
//     { key: "city",     label: "City",     url: CITIES_URL,    parent: "taluka" },
//   ],
// };

// const ALL_LEVEL_KEYS = [
//   ...LEVELS.ZONAL.map((l) => l.key),
//   ...LEVELS.GEOGRAPHICAL.map((l) => l.key),
// ];

// const EMPTY_SELECTION = Object.fromEntries(ALL_LEVEL_KEYS.map((k) => [k, ""]));
// const NULL_LEVELS     = Object.fromEntries(ALL_LEVEL_KEYS.map((k) => [k, null]));

// const ordinal = (n) => ["1st", "2nd", "3rd", "4th", "5th"][n - 1] || `${n}th`;

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

// const ORG_ADMIN_ROLES      = ["BR_ADMIN"];   // shown to the super admin
// const CUSTOMER_ADMIN_ROLES = ["BR_ADMIN"];   // shown to a logged-in customer

// const ROLE_LABEL = {
//   ORG_SUPER_ADMIN: "Org Super Admin",
//   CUSTOMER:        "Customer",
//   BR_ADMIN:        "Branch Admin",
//   ENGINEER:        "Engineer",
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
//   if (Array.isArray(result)) return result;
//   if (result && Array.isArray(result.data)) return result.data;
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
//   if (
//     admin.customer &&
//     typeof admin.customer === "object" &&
//     admin.customer.name
//   ) {
//     return admin.customer.name;
//   }

//   const id = getCustomerId(admin);
//   if (id) {
//     const found = customers.find((c) => String(c.id) === id);
//     if (found) return found.company || found.name || found.customer_name || id;
//     return id;
//   }

//   return admin.org_name || admin.organization_name || "-";
// };

// /** id of a hierarchy level on an admin record (zone, circle, region, ...) */
// const getLevelId = (admin, key) => {
//   if (!admin) return "";
//   const raw =
//     admin[`${key}_id`] ??
//     (admin[key] && typeof admin[key] === "object" ? admin[key].id : admin[key]);
//   return raw === null || raw === undefined ? "" : String(raw);
// };

// /** "Zone / Circle / Region" style text for the list table */
// const getLocationText = (admin) => {
//   const keys =
//     admin.customer_hierarchy_type === "GEOGRAPHICAL"
//       ? LEVELS.GEOGRAPHICAL
//       : LEVELS.ZONAL;
//   return keys.map((l) => admin[`${l.key}_name`]).filter(Boolean).join(" / ");
// };

// function Admin_Creation() {
//   const { user: currentUser } = useAuth();

//   const isCustomerUser = currentUser?.role === "CUSTOMER";

//   const currentCustomerId = isCustomerUser
//     ? String(currentUser.scopeId ?? "")
//     : "";

//   const currentCustomerName = isCustomerUser
//     ? currentUser.scopeName || `Customer #${currentCustomerId}`
//     : "";

//   const canAutoAssignCustomer = isCustomerUser && Boolean(currentCustomerId);

//   const [view, setView]   = useState("list");
//   const [users, setUsers] = useState([]);
//   const [customers, setCustomers] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError]     = useState("");
//   const [search, setSearch]   = useState("");

//   const [form, setForm]           = useState(emptyForm);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving]       = useState(false);
//   const isEditing = Boolean(form.id);

//   const [pendingAdmin, setPendingAdmin]         = useState(null);
//   const [selectedCustomer, setSelectedCustomer] = useState("");
//   const [assignError, setAssignError]           = useState("");
//   const [assigning, setAssigning]               = useState(false);

//   // Hierarchy selection: { zone: "id", circle: "id", ... }  ("" = not chosen)
//   const [selection, setSelection]       = useState(EMPTY_SELECTION);
//   // Options loaded for each level: { zone: [...], circle: [...], ... }
//   const [levelOptions, setLevelOptions] = useState({});
//   // Which levels are currently loading: { zone: true, ... }
//   const [levelLoading, setLevelLoading] = useState({});

//   const [customersLoading, setCustomersLoading]   = useState(false);
//   const [assigningCustomer, setAssigningCustomer] = useState(false);

//   const [confirmDelete, setConfirmDelete] = useState(null);
//   const [deleting, setDeleting]           = useState(false);

//   const resetLocationSelection = () => {
//     setSelection(EMPTY_SELECTION);
//     setLevelOptions({});
//     setLevelLoading({});
//   };

//   const fetchUsers = useCallback(async () => {
//     try {
//       setError("");
//       const res = await fetch(USERS_URL, {
//         method: "GET",
//         cache: "no-store",
//         headers: authHeaders(),
//       });
//       if (res.status === 401)
//         throw new Error("401 Unauthorized. Please login again.");
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const result = await res.json();
//       setUsers(normalizeList(result));
//     } catch (err) {
//       setError(err.message || "Unable to load admins.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   const fetchCustomers = useCallback(async () => {
//     // Customer users already know their customer — no need to hit the API.
//     if (canAutoAssignCustomer) {
//       setCustomers([{ id: currentCustomerId, company: currentCustomerName }]);
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

//       let list = normalizeList(result);
//       if ((!list || list.length === 0) && Array.isArray(result?.customers)) {
//         list = result.customers;
//       }

//       setCustomers(list);

//       if (!list.length) {
//         setAssignError("No customers available for this organization.");
//       }
//     } catch (err) {
//       setCustomers([]);
//       setAssignError(err.message || "Unable to load customers.");
//     } finally {
//       setCustomersLoading(false);
//     }
//   }, [canAutoAssignCustomer, currentCustomerId, currentCustomerName]);

//   /**
//    * Load the options of ONE hierarchy level.
//    *  - first level  → scoped to the customer
//    *  - deeper level → children of `parentId`
//    */
//   const loadLevel = useCallback(async (level, parentId, customerId) => {
//     setLevelLoading((prev) => ({ ...prev, [level.key]: true }));
//     try {
//       let url = level.url;

//       if (level.parent) {
//         url = `${level.url}?${level.parent}=${encodeURIComponent(parentId)}`;
//       } else if (level.key === "state" && customerId) {
//         url = `${level.url}?customer=${encodeURIComponent(customerId)}`;
//       }

//       const res = await fetch(url, {
//         method: "GET",
//         cache: "no-store",
//         headers: authHeaders(),
//       });
//       if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);

//       let list = normalizeList(await res.json());

//       // The zone endpoint returns every zone in the organization — keep
//       // only the ones that belong to this customer.
//       if (level.key === "zone" && customerId) {
//         list = list.filter(
//           (z) =>
//             String(
//               z.customer_id ??
//                 (z.customer && typeof z.customer === "object"
//                   ? z.customer.id
//                   : z.customer)
//             ) === String(customerId)
//         );
//       }

//       setLevelOptions((prev) => ({ ...prev, [level.key]: list }));
//       return list;
//     } catch (err) {
//       setLevelOptions((prev) => ({ ...prev, [level.key]: [] }));
//       setAssignError(err.message || `Unable to load ${level.label.toLowerCase()}s.`);
//       return [];
//     } finally {
//       setLevelLoading((prev) => ({ ...prev, [level.key]: false }));
//     }
//   }, []);

//   const getCustomerHierarchy = useCallback((customerId, admin = pendingAdmin) => {
//     if (admin?.customer_hierarchy_type) return admin.customer_hierarchy_type;
//     if (isCustomerUser && currentCustomerId === String(customerId)) return currentUser?.customer_hierarchy_type || "";
//     const customer = customers.find((c) => String(c.id) === String(customerId));
//     return customer?.hierarchy_type || "";
//   }, [customers, currentUser, currentCustomerId, isCustomerUser, pendingAdmin]);

//   /**
//    * Prepare the "Assign Location" step: pre-fill what the admin already has
//    * and load the options for every level down to the deepest saved one
//    * (plus the next level so it can be extended).
//    */
//   const prepareLocationAssignment = useCallback(
//     async (customerId, admin) => {
//       const hierarchy = getCustomerHierarchy(customerId, admin);
//       const levels = LEVELS[hierarchy] || [];

//       setAssignError("");
//       setLevelOptions({});
//       setLevelLoading({});

//       const initial = { ...EMPTY_SELECTION };
//       levels.forEach((l) => { initial[l.key] = getLevelId(admin, l.key); });
//       setSelection(initial);

//       if (!levels.length) return;

//       const scope = canAutoAssignCustomer ? currentCustomerId : customerId;

//       await loadLevel(levels[0], null, scope);
//       for (let i = 1; i < levels.length; i += 1) {
//         const parentId = initial[levels[i - 1].key];
//         if (!parentId) break;
//         await loadLevel(levels[i], parentId, scope);
//       }
//     },
//     [canAutoAssignCustomer, currentCustomerId, getCustomerHierarchy, loadLevel]
//   );

//   const adminUsers = useMemo(() => {
//     const roles = canAutoAssignCustomer
//       ? CUSTOMER_ADMIN_ROLES
//       : ORG_ADMIN_ROLES;

//     const base = users.filter((u) => roles.includes(u.role));

//     if (canAutoAssignCustomer) {
//       return base.filter((u) => getCustomerId(u) === currentCustomerId);
//     }

//     return base;
//   }, [users, canAutoAssignCustomer, currentCustomerId]);

//   const filteredAdmins = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return adminUsers;
//     return adminUsers.filter((u) =>
//       [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role], getLocationText(u)]
//         .filter(Boolean)
//         .some((f) => String(f).toLowerCase().includes(q))
//     );
//   }, [adminUsers, search]);

//   // Role options for the create/edit form
//   const roleOptions = canAutoAssignCustomer
//     ? CUSTOMER_ADMIN_ROLES
//     : ORG_ADMIN_ROLES;

//   // Super admin: load customers once so the list can show customer names.
//   useEffect(() => {
//     if (!canAutoAssignCustomer) fetchCustomers();
//   }, [canAutoAssignCustomer, fetchCustomers]);

//   /* =========================================================
//      NAVIGATION
//   ========================================================= */

//   const goToCreate = () => {
//     setForm({
//       ...emptyForm,
//       role: roleOptions[0] || "BR_ADMIN",
//     });
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
//     setAssignError("");
//     resetLocationSelection();
//   };

//   const goToAssignCustomer = () => {
//     if (canAutoAssignCustomer) {
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

//     fetchCustomers();
//   };

//   /** Row-level "Assign" icon in the list. */
//   const openAssignFor = (admin) => {
//     setPendingAdmin(admin);
//     setAssignError("");
//     if (canAutoAssignCustomer) {
//       setSelectedCustomer(currentCustomerId);
//       setView("assign");
//       prepareLocationAssignment(currentCustomerId, admin);
//       return;
//     }
//     setSelectedCustomer(getCustomerId(admin));
//     setView("assign-customer");
//     fetchCustomers();
//   };

//   /** Pick the location scope. */
//   const goToAssignZone = () => {
//     const target = pendingAdmin || adminUsers[0] || null;
//     if (!target) {
//       setError("No admin available to assign a location. Create one first.");
//       return;
//     }
//     const custId = canAutoAssignCustomer ? currentCustomerId : selectedCustomer || getCustomerId(target);
//     if (!custId) {
//       setError("Assign a customer before assigning a location.");
//       setPendingAdmin(target);
//       setAssignError("");
//       setView("assign-customer");
//       fetchCustomers();
//       return;
//     }
//     setPendingAdmin(target);
//     setSelectedCustomer(custId);
//     setView("assign");
//     prepareLocationAssignment(custId, target);
//   };

//   /* =========================================================
//      FORM SUBMIT
//   ========================================================= */

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

//     // IMPORTANT: never send `customer` from the client.
//     //  - Customer mode → backend auto-fills it from request.user.
//     //  - Org mode      → customer is chosen in the following PATCH step.
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
//                 .map(
//                   ([k, v]) =>
//                     `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
//                 )
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
//       resetLocationSelection();
//       setAssignError("");

//       if (canAutoAssignCustomer) {
//         setSelectedCustomer(currentCustomerId);
//         setView("assign");
//         prepareLocationAssignment(currentCustomerId, saved);
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

//   /* =========================================================
//      SAVE CUSTOMER (ORG ONLY)
//   ========================================================= */

//   const handleCustomerSave = async () => {
//     if (!pendingAdmin) return;
//     if (!selectedCustomer) return setAssignError("Please pick a customer.");

//     setAssigningCustomer(true);
//     setAssignError("");

//     try {
//       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
//         method: "PATCH",
//         headers: authHeaders(),
//         // changing the customer clears any previous location
//         body: JSON.stringify({ customer: selectedCustomer, ...NULL_LEVELS }),
//       });

//       if (!res.ok) {
//         const errBody = await res.json().catch(() => ({}));
//         const message =
//           typeof errBody === "object" && errBody !== null
//             ? Object.entries(errBody)
//                 .map(
//                   ([k, v]) =>
//                     `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
//                 )
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

//       resetLocationSelection();
//       setAssignError("");
//       setView("assign");
//       prepareLocationAssignment(selectedCustomer, updated || { ...pendingAdmin, customer: selectedCustomer });
//     } catch (err) {
//       setAssignError(err.message || "Could not assign customer.");
//     } finally {
//       setAssigningCustomer(false);
//     }
//   };

//   /* =========================================================
//      LOCATION: change a level / save
//   ========================================================= */

//   const hierarchy = getCustomerHierarchy(selectedCustomer, pendingAdmin);
//   const levels = LEVELS[hierarchy] || [];
//   const isGeographical = hierarchy === "GEOGRAPHICAL";

//   // index of the deepest level currently chosen (-1 = nothing chosen)
//   const deepestIndex = levels.reduce(
//     (deepest, l, i) => (selection[l.key] ? i : deepest),
//     -1
//   );

//   const handleLevelChange = (index, value) => {
//     const scope = canAutoAssignCustomer ? currentCustomerId : selectedCustomer;

//     // set this level, clear everything below it
//     setSelection((prev) => {
//       const next = { ...prev, [levels[index].key]: value };
//       for (let j = index + 1; j < levels.length; j += 1) next[levels[j].key] = "";
//       return next;
//     });
//     setLevelOptions((prev) => {
//       const next = { ...prev };
//       for (let j = index + 1; j < levels.length; j += 1) delete next[levels[j].key];
//       return next;
//     });

//     // load the next level's options
//     if (value && levels[index + 1]) {
//       loadLevel(levels[index + 1], value, scope);
//     }
//   };

//   const handleAssignSave = async () => {
//     if (!pendingAdmin) return;
//     if (!levels.length) return setAssignError("Customer hierarchy could not be determined.");
//     if (!selection[levels[0].key]) {
//       return setAssignError(`Please select at least a ${levels[0].label}.`);
//     }

//     // every level of the active hierarchy: chosen id or null.
//     // levels of the other hierarchy are always cleared.
//     const payload = { ...NULL_LEVELS };
//     levels.forEach((l) => { payload[l.key] = selection[l.key] || null; });

//     setAssigning(true);
//     setAssignError("");
//     try {
//       const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
//         method: "PATCH",
//         headers: authHeaders(),
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) {
//         const errBody = await res.json().catch(() => ({}));
//         const message = typeof errBody === "object" && errBody !== null
//           ? Object.entries(errBody).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
//           : `HTTP ${res.status}`;
//         throw new Error(message || `HTTP ${res.status}`);
//       }
//       await fetchUsers();
//       backToList();
//     } catch (err) {
//       setAssignError(err.message || "Could not assign location.");
//     } finally {
//       setAssigning(false);
//     }
//   };

//   /* =========================================================
//      DELETE
//   ========================================================= */

//   const handleDelete = async () => {
//     if (!confirmDelete || deleting) return;
//     setDeleting(true);
//     try {
//       const res = await fetch(`${USERS_URL}${confirmDelete.id}/`, {
//         method: "DELETE",
//         headers: authHeaders(),
//       });
//       if (!res.ok && res.status !== 204)
//         throw new Error(`HTTP ${res.status}`);

//       setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
//       setConfirmDelete(null);
//     } catch (err) {
//       setError(err.message || "Could not delete admin.");
//       setConfirmDelete(null);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   /* =========================================================
//      RENDER
//   ========================================================= */

//   const heading = canAutoAssignCustomer
//     ? `Admins — ${currentCustomerName}`
//     : "Admins";

//   const hierarchyPath = levels.map((l) => l.label).join(" → ");

//   const assignedSummary =
//     deepestIndex >= 0
//       ? `Assigned at the ${ordinal(deepestIndex + 1)} level (${levels[deepestIndex].label}) — this admin will see everything under it.`
//       : "Nothing selected yet.";

//   return (
//     <div className="admins-page">
//       {/* ================= STEPPER ================= */}
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
//               ? "done"
//               : ""
//           }
//         >
//           <button type="button" className="step-btn" onClick={goToCreate}>
//             <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
//           </button>
//         </li>

//         {/* Step 3 is org-only. Hidden entirely for customer-scoped users. */}
//         {!canAutoAssignCustomer && (
//           <li
//             className={
//               view === "assign-customer"
//                 ? "active"
//                 : view === "assign"
//                 ? "done"
//                 : ""
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
//             <span className="step-num">{canAutoAssignCustomer ? 3 : 4}</span>{" "}
//             Assign Location
//           </button>
//         </li>
//       </ol>

//       {/* ================= STEP 1 — LIST ================= */}
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
//               placeholder="Search by name, email, phone, role or location..."
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
//                     {!canAutoAssignCustomer && <th>Customer</th>}
//                     <th>Location</th>
//                     <th>Status</th>
//                     <th className="actions-col">Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filteredAdmins.map((u) => {
//                     const locationText = getLocationText(u);
//                     return (
//                       <tr key={u.id}>
//                         <td>
//                           <strong>{u.name || "-"}</strong>
//                         </td>
//                         <td>{u.email}</td>
//                         <td>{u.phone || "-"}</td>
//                         <td>{ROLE_LABEL[u.role] || u.role}</td>

//                         {!canAutoAssignCustomer && (
//                           <td>{getCustomerName(u, customers)}</td>
//                         )}

//                         <td>
//                           {locationText || (
//                             <span className="status-inactive" style={{ fontSize: 11 }}>
//                               — Unassigned
//                             </span>
//                           )}
//                         </td>

//                         <td>
//                           <span
//                             className={
//                               u.is_active ? "status-active" : "status-inactive"
//                             }
//                           >
//                             ● {u.is_active ? "Active" : "Inactive"}
//                           </span>
//                         </td>

//                         <td className="actions-col">
//                           <button
//                             className="btn-icon"
//                             onClick={() => openAssignFor(u)}
//                             title={canAutoAssignCustomer ? "Assign location" : "Assign customer / location"}
//                             aria-label="Assign"
//                           >
//                             <FiMapPin size={16} />
//                           </button>

//                           <button
//                             className="btn-icon"
//                             onClick={() => openEditPanel(u)}
//                             title="Edit"
//                             aria-label="Edit"
//                           >
//                             <FiEdit2 size={16} />
//                           </button>

//                           <button
//                             className="btn-icon btn-icon-danger"
//                             onClick={() => setConfirmDelete(u)}
//                             title="Delete"
//                             aria-label="Delete"
//                           >
//                             <FiTrash2 size={16} />
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </>
//       )}

//       {/* ================= STEP 2 — CREATE / EDIT ================= */}
//       {view === "form" && (
//         <div className="admins-panel">
//           <div className="admins-panel-header">
//             {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
//             <div>
//               <h2>{isEditing ? "Edit Admin" : "Create Admin"}</h2>
//               <p>
//                 {isEditing
//                   ? `Update details for ${form.name || form.email}.`
//                   : canAutoAssignCustomer
//                   ? `New admin will be created under ${currentCustomerName}.`
//                   : "Add a new admin. You'll assign a customer and location in the next steps."}
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
//                   {roleOptions.map((r) => (
//                     <option key={r} value={r}>
//                       {ROLE_LABEL[r]}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <label>
//                 {isEditing
//                   ? "Password (leave blank to keep current)"
//                   : "Password *"}
//                 <input
//                   type="password"
//                   value={form.password}
//                   onChange={(e) =>
//                     handleFieldChange("password", e.target.value)
//                   }
//                   placeholder={isEditing ? "••••••••" : "Set a password"}
//                   required={!isEditing}
//                 />
//               </label>

//               <label className="checkbox-row">
//                 <input
//                   type="checkbox"
//                   checked={form.is_active}
//                   onChange={(e) =>
//                     handleFieldChange("is_active", e.target.checked)
//                   }
//                 />
//                 Active
//               </label>
//             </div>

//             {/* Auto-assign info card for customer users */}
//             {canAutoAssignCustomer && !isEditing && (
//               <div className="assign-card" style={{ marginTop: 20 }}>
//                 <div className="assign-row">
//                   <span className="assign-label">Customer</span>
//                   <span className="assign-value">{currentCustomerName}</span>
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
//                   <strong>{currentCustomerName}</strong> automatically. You'll
//                   assign its hierarchy location in the next step.
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
//                   ? "Save Changes"
//                   : canAutoAssignCustomer
//                   ? "Create & Assign Location"
//                   : "Create & Continue"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* ================= STEP 3 (ORG ONLY) — ASSIGN CUSTOMER ================= */}
//       {!canAutoAssignCustomer && view === "assign-customer" && pendingAdmin && (
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
//                 <span className="assign-loading">
//                   No customers available for this organization.
//                 </span>
//               ) : (
//                 <select
//                   value={selectedCustomer}
//                   onChange={(e) => setSelectedCustomer(e.target.value)}
//                 >
//                   <option value="">— Select a customer —</option>
//                   {customers.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.company || c.name || c.customer_name}
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

//       {/* ================= ASSIGN HIERARCHY LOCATION (ANY LEVEL) ================= */}
//       {view === "assign" && pendingAdmin && (
//         <div className="admins-panel">
//           <button className="btn-back" onClick={backToList}><FiArrowLeft /> Back to list</button>
//           <div className="admins-panel-header">
//             <FiMapPin size={22} />
//             <div>
//               <h2>Assign Location</h2>
//               <p>
//                 Choose how far down the hierarchy{" "}
//                 <strong>{pendingAdmin.name || pendingAdmin.email}</strong> should be assigned.
//               </p>
//             </div>
//           </div>

//           <div className="assign-card">
//             <div className="assign-row"><span className="assign-label">Admin</span><span className="assign-value">{pendingAdmin.name || "-"}</span></div>
//             <div className="assign-row"><span className="assign-label">Customer</span><span className="assign-value">{canAutoAssignCustomer ? currentCustomerName : getCustomerName(pendingAdmin, customers)}</span></div>
//             <div className="assign-row"><span className="assign-label">Hierarchy</span><span className="assign-value">{levels.length ? `${isGeographical ? "Geographical" : "Zonal"} — ${hierarchyPath}` : "Not determined"}</span></div>
//             <div className="assign-row"><span className="assign-label">Email</span><span className="assign-value">{pendingAdmin.email}</span></div>

//             {levels.map((level, index) => {
//               const parentLevel = index > 0 ? levels[index - 1] : null;
//               const options = levelOptions[level.key] || [];
//               const isLoading = Boolean(levelLoading[level.key]);
//               const parentChosen = !parentLevel || Boolean(selection[parentLevel.key]);

//               return (
//                 <label className="assign-select" key={level.key}>
//                   {level.label}
//                   {index === 0 ? " *" : " (optional)"}

//                   {isLoading ? (
//                     <span className="assign-loading">Loading {level.label.toLowerCase()}s...</span>
//                   ) : !parentChosen ? (
//                     <span className="assign-loading">Select a {parentLevel.label.toLowerCase()} first.</span>
//                   ) : options.length === 0 ? (
//                     <span className="assign-loading">
//                       {index === 0
//                         ? `No ${level.label.toLowerCase()}s available for this customer.`
//                         : `No ${level.label.toLowerCase()}s under this ${parentLevel.label.toLowerCase()}.`}
//                     </span>
//                   ) : (
//                     <select
//                       value={selection[level.key] || ""}
//                       onChange={(e) => handleLevelChange(index, e.target.value)}
//                     >
//                       <option value="">
//                         {index === 0
//                           ? `— Select a ${level.label.toLowerCase()} —`
//                           : `— None (stop at ${parentLevel.label.toLowerCase()}) —`}
//                       </option>
//                       {options.map((o) => (
//                         <option key={o.id} value={o.id}>
//                           {o.name}{o.code ? ` (${o.code})` : ""}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </label>
//               );
//             })}

//             {levels.length > 0 && (
//               <p style={{ margin: "12px 0 0", fontSize: 13, color: "#6b7280" }}>
//                 {assignedSummary}
//               </p>
//             )}
//           </div>

//           {assignError && <div className="form-error">{assignError}</div>}
//           <div className="panel-actions">
//             {canAutoAssignCustomer ? (
//               <button type="button" className="btn-secondary" onClick={backToList} disabled={assigning}>Skip & Return to List</button>
//             ) : (
//               <button type="button" className="btn-secondary" onClick={() => { setAssignError(""); setView("assign-customer"); fetchCustomers(); }} disabled={assigning}><FiArrowLeft /> Back to Customer</button>
//             )}
//             <button
//               type="button"
//               className="btn-primary"
//               onClick={handleAssignSave}
//               disabled={assigning || !levels.length || deepestIndex < 0}
//             >
//               <FiCheckCircle /> {assigning ? "Saving..." : "Save & Return to List"}
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
//               <strong>{confirmDelete.name || confirmDelete.email}</strong>? This
//               cannot be undone.
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
import { useAuth } from "../Layout/AuthContext";

/* ------------------------------------------------------------------
   API ENDPOINTS
   ------------------------------------------------------------------ */

const API_BASE      = "http://localhost:8000/api";
const USERS_URL     = `${API_BASE}/admins/`;
const ZONES_URL     = `${API_BASE}/zones/`;
const CIRCLES_URL   = `${API_BASE}/circles/`;
const STATES_URL    = `${API_BASE}/states/`;
const DISTRICTS_URL = `${API_BASE}/districts/`;
const CUSTOMERS_URL = `${API_BASE}/customers/`;

/* ------------------------------------------------------------------
   AUTH
   ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------
   CONSTANTS
   ------------------------------------------------------------------ */

const ORG_ADMIN_ROLES      = ["BR_ADMIN"];   // visible to the super admin
const CUSTOMER_ADMIN_ROLES = ["BR_ADMIN"];   // visible to a logged-in customer

const ROLE_LABEL = {
  ORG_SUPER_ADMIN: "Org Super Admin",
  CUSTOMER:        "Customer",
  BR_ADMIN:        "Branch Admin",
  ENGINEER:        "Engineer",
};

const emptyForm = {
  id:        null,
  name:      "",
  email:     "",
  phone:     "",
  role:      "BR_ADMIN",
  password:  "",
  is_active: true,
};

/* ------------------------------------------------------------------
   SMALL HELPERS
   ------------------------------------------------------------------ */

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

const getCircleId = (admin) => {
  if (!admin) return "";
  const raw =
    admin.circle_id ??
    (admin.circle && typeof admin.circle === "object"
      ? admin.circle.id
      : admin.circle);
  return raw === null || raw === undefined ? "" : String(raw);
};

const getStateId = (admin) => {
  if (!admin) return "";
  const raw =
    admin.state_id ??
    (admin.state && typeof admin.state === "object"
      ? admin.state.id
      : admin.state);
  return raw === null || raw === undefined ? "" : String(raw);
};

const getDistrictId = (admin) => {
  if (!admin) return "";
  const raw =
    admin.district_id ??
    (admin.district && typeof admin.district === "object"
      ? admin.district.id
      : admin.district);
  return raw === null || raw === undefined ? "" : String(raw);
};

/* ------------------------------------------------------------------
   COMPONENT
   ------------------------------------------------------------------ */

function Admin_Creation() {
  const { user: currentUser } = useAuth();

  const isCustomerUser = currentUser?.role === "CUSTOMER";

  const currentCustomerId = isCustomerUser
    ? String(currentUser.scopeId ?? "")
    : "";

  const currentCustomerName = isCustomerUser
    ? currentUser.scopeName || `Customer #${currentCustomerId}`
    : "";

  const canAutoAssignCustomer = isCustomerUser && Boolean(currentCustomerId);

  /* ---------------- state ---------------- */

  const [view, setView]   = useState("list");
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [circles, setCircles] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
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
  const [selectedCircle, setSelectedCircle]     = useState("");
  const [selectedState, setSelectedState]       = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [assignError, setAssignError]           = useState("");
  const [assigning, setAssigning]               = useState(false);
  const [zonesLoading, setZonesLoading]         = useState(false);
  const [circlesLoading, setCirclesLoading]     = useState(false);
  const [statesLoading, setStatesLoading]       = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);

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
    if (canAutoAssignCustomer) {
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

      let list = normalizeList(result);
      if ((!list || list.length === 0) && Array.isArray(result?.customers)) {
        list = result.customers;
      }

      setCustomers(list);

      if (!list.length) {
        setAssignError("No customers available for this organization.");
      }
    } catch (err) {
      setCustomers([]);
      setAssignError(err.message || "Unable to load customers.");
    } finally {
      setCustomersLoading(false);
    }
  }, [canAutoAssignCustomer, currentCustomerId, currentCustomerName]);

  const fetchZones = useCallback(
    async (customerId) => {
      setZonesLoading(true);
      setAssignError("");

      try {
        const scopeId = canAutoAssignCustomer ? currentCustomerId : customerId;

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
    [canAutoAssignCustomer, currentCustomerId]
  );

  const fetchCircles = useCallback(async (zoneId) => {
    if (!zoneId) {
      setCircles([]);
      return;
    }
    setCirclesLoading(true);
    try {
      const res = await fetch(
        `${CIRCLES_URL}?zone=${encodeURIComponent(zoneId)}`,
        { method: "GET", cache: "no-store", headers: authHeaders() }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCircles(normalizeList(await res.json()));
    } catch (err) {
      setCircles([]);
      setAssignError(err.message || "Unable to load circles.");
    } finally {
      setCirclesLoading(false);
    }
  }, []);

  const fetchStates = useCallback(async (customerId) => {
    if (!customerId) {
      setStates([]);
      return;
    }

    setStatesLoading(true);
    setAssignError("");

    try {
      const url = `${STATES_URL}?customer=${encodeURIComponent(customerId)}`;
      const res = await fetch(url, {
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
      const list = normalizeList(result);

      // Kept on purpose — this one line saves hours when the API
      // shape ever drifts. `parsed` is what the dropdown actually sees.
      console.log(
        "states for customer",
        customerId,
        "→",
        result,
        "| parsed:",
        list
      );

      setStates(list);

      if (list.length === 0) {
        setAssignError(`Customer #${customerId} has no states set up yet.`);
      }
    } catch (err) {
      console.error("fetchStates:", err);
      setStates([]);
      setAssignError(err.message || "Unable to load states.");
    } finally {
      setStatesLoading(false);
    }
  }, []);

  const fetchDistricts = useCallback(async (stateId) => {
    if (!stateId) {
      setDistricts([]);
      return;
    }
    setDistrictsLoading(true);
    try {
      const res = await fetch(
        `${DISTRICTS_URL}?state=${encodeURIComponent(stateId)}`,
        { method: "GET", cache: "no-store", headers: authHeaders() }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDistricts(normalizeList(await res.json()));
    } catch (err) {
      setDistricts([]);
      setAssignError(err.message || "Unable to load districts.");
    } finally {
      setDistrictsLoading(false);
    }
  }, []);

  /* =========================================================
     DERIVED
  ========================================================= */

  const getCustomerHierarchy = useCallback(
    (customerId, admin = pendingAdmin) => {
      if (admin?.customer_hierarchy_type) return admin.customer_hierarchy_type;
      if (isCustomerUser && currentCustomerId === String(customerId))
        return currentUser?.customer_hierarchy_type || "";
      const customer = customers.find((c) => String(c.id) === String(customerId));
      return customer?.hierarchy_type || "";
    },
    [customers, currentUser, currentCustomerId, isCustomerUser, pendingAdmin]
  );

  /* ---------- THE ONE THAT WAS BROKEN ---------- */
  const prepareLocationAssignment = useCallback(
    (customerId, admin) => {
      const hierarchy = getCustomerHierarchy(customerId, admin);
      console.log("Preparing location for Customer:", customerId, "| Hierarchy:", hierarchy);
      
      const zoneId  = getZoneId(admin);
      const stateId = getStateId(admin);

      setSelectedZone(zoneId);
      setSelectedCircle(getCircleId(admin));
      setSelectedState(stateId);
      setSelectedDistrict(getDistrictId(admin));

      setAssignError("");

      setZones([]);
      setCircles([]);
      setStates([]);
      setDistricts([]);

      if (hierarchy === "GEOGRAPHICAL") {
        fetchStates(customerId);
        if (stateId) fetchDistricts(stateId);
      } else if (hierarchy === "ZONAL") {
        fetchZones(customerId);
        if (zoneId) fetchCircles(zoneId);
      }
    },
    [
      fetchCircles,
      fetchDistricts,
      fetchStates,
      fetchZones,
      getCustomerHierarchy,
    ]
  );

  const adminUsers = useMemo(() => {
    const roles = canAutoAssignCustomer
      ? CUSTOMER_ADMIN_ROLES
      : ORG_ADMIN_ROLES;

    const base = users.filter((u) => roles.includes(u.role));

    if (canAutoAssignCustomer) {
      return base.filter((u) => getCustomerId(u) === currentCustomerId);
    }

    return base;
  }, [users, canAutoAssignCustomer, currentCustomerId]);

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return adminUsers;
    return adminUsers.filter((u) =>
      [u.name, u.email, u.phone, u.scope_name, ROLE_LABEL[u.role]]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [adminUsers, search]);

  const roleOptions = canAutoAssignCustomer
    ? CUSTOMER_ADMIN_ROLES
    : ORG_ADMIN_ROLES;

  // Super admin: load customers once so the list can show customer names.
  // (A customer login never needs this — it only ever sees its own customer.)
  useEffect(() => {
    if (!canAutoAssignCustomer) fetchCustomers();
  }, [canAutoAssignCustomer, fetchCustomers]);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToCreate = () => {
    setForm({
      ...emptyForm,
      role: roleOptions[0] || "BR_ADMIN",
    });
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
    setSelectedCircle("");
    setSelectedState("");
    setSelectedDistrict("");
    setAssignError("");
    setZones([]);
    setCircles([]);
    setStates([]);
    setDistricts([]);
  };

  /**
   * Step 3 — org users only.
   * Customer users never see this step; they jump straight to hierarchy-specific location assignment.
   */
  const goToAssignCustomer = () => {
    if (canAutoAssignCustomer) {
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

  /** Row-level "Assign" icon in the list. */
  const openAssignFor = (admin) => {
    setPendingAdmin(admin);
    setAssignError("");
    if (canAutoAssignCustomer) {
      setSelectedCustomer(currentCustomerId);
      setView("assign");
      prepareLocationAssignment(currentCustomerId, admin);
      return;
    }
    setSelectedCustomer(getCustomerId(admin));
    setView("assign-customer");
    fetchCustomers();
  };

  /** Step 4 (org) / Step 3 (customer) — pick the location scope. */
  const goToAssignZone = () => {
    const target = pendingAdmin || adminUsers[0] || null;
    if (!target) {
      setError("No admin available to assign a location. Create one first.");
      return;
    }
    const custId = canAutoAssignCustomer
      ? currentCustomerId
      : selectedCustomer || getCustomerId(target);
    if (!custId) {
      setError("Assign a customer before assigning a location.");
      setPendingAdmin(target);
      setAssignError("");
      setView("assign-customer");
      fetchCustomers();
      return;
    }
    setPendingAdmin(target);
    setSelectedCustomer(custId);
    setView("assign");
    prepareLocationAssignment(custId, target);
  };

  /* =========================================================
     FORM SUBMIT
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

    // IMPORTANT: never send `customer` from the client.
    //  - Customer mode → backend auto-fills it from request.user.
    //  - Org mode      → customer is chosen in the following PATCH step.
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
      setSelectedCircle("");
      setSelectedState("");
      setSelectedDistrict("");
      setAssignError("");

      if (canAutoAssignCustomer) {
        // Customer user → straight to hierarchy-specific location assignment.
        setSelectedCustomer(currentCustomerId);
        setView("assign");
        prepareLocationAssignment(currentCustomerId, saved);
      } else {
        // Org user → ask them which customer this admin belongs to.
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
        body: JSON.stringify({
          customer: selectedCustomer,
          zone: null,
          circle: null,
          state: null,
          district: null,
        }),
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
      setSelectedCircle("");
      setSelectedState("");
      setSelectedDistrict("");
      setAssignError("");
      setView("assign");
      prepareLocationAssignment(
        selectedCustomer,
        updated || { ...pendingAdmin, customer: selectedCustomer }
      );
    } catch (err) {
      setAssignError(err.message || "Could not assign customer.");
    } finally {
      setAssigningCustomer(false);
    }
  };

  const handleAssignSave = async () => {
    if (!pendingAdmin) return;
    const hierarchy = getCustomerHierarchy(selectedCustomer, pendingAdmin);
    if (hierarchy === "GEOGRAPHICAL" && (!selectedState || !selectedDistrict))
      return setAssignError("Please select both State and District.");
    if (hierarchy === "ZONAL" && (!selectedZone || !selectedCircle))
      return setAssignError("Please select both Zone and Circle.");
    if (!hierarchy)
      return setAssignError("Customer hierarchy could not be determined.");

    const payload =
      hierarchy === "GEOGRAPHICAL"
        ? { state: selectedState, district: selectedDistrict, zone: null, circle: null }
        : { zone: selectedZone, circle: selectedCircle, state: null, district: null };

    setAssigning(true);
    setAssignError("");
    try {
      const res = await fetch(`${USERS_URL}${pendingAdmin.id}/`, {
        method: "PATCH",
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
      await fetchUsers();
      backToList();
    } catch (err) {
      setAssignError(err.message || "Could not assign location.");
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
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);

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

  const heading = canAutoAssignCustomer
    ? `Admins — ${currentCustomerName}`
    : "Admins";

  const assignmentHierarchy = getCustomerHierarchy(selectedCustomer, pendingAdmin);
  const isGeographical = assignmentHierarchy === "GEOGRAPHICAL";
  const assignmentParentLabel = isGeographical ? "State" : "Zone";
  const assignmentChildLabel = isGeographical ? "District" : "Circle";

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

        {/* Step 3 is org-only. Hidden entirely for customer-scoped users. */}
        {!canAutoAssignCustomer && (
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
            <span className="step-num">{canAutoAssignCustomer ? 3 : 4}</span>{" "}
            Assign Site
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
                    {!canAutoAssignCustomer && <th>Customer</th>}
                    <th>Location</th>
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

                      {!canAutoAssignCustomer && (
                        <td>{getCustomerName(u, customers)}</td>
                      )}

                      <td>
                        {u.customer_hierarchy_type === "GEOGRAPHICAL"
                          ? [u.state_name, u.district_name]
                              .filter(Boolean)
                              .join(" / ")
                          : [u.zone_name, u.circle_name]
                              .filter(Boolean)
                              .join(" / ")}
                        {!u.state_name &&
                          !u.district_name &&
                          !u.zone_name &&
                          !u.circle_name && (
                            <span
                              className="status-inactive"
                              style={{ fontSize: 11 }}
                            >
                              — Unassigned
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
                          title={
                            canAutoAssignCustomer
                              ? "Assign location"
                              : "Assign customer / location"
                          }
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
                  : canAutoAssignCustomer
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
                  {roleOptions.map((r) => (
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

            {/* Auto-assign info card for customer users */}
            {canAutoAssignCustomer && !isEditing && (
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
                  assign its hierarchy location in the next step.
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
                  : canAutoAssignCustomer
                  ? "Create & Assign Location"
                  : "Create & Continue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STEP 3 (ORG ONLY) — ASSIGN CUSTOMER ================= */}
      {!canAutoAssignCustomer &&
        view === "assign-customer" &&
        pendingAdmin && (
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

      {/* ================= ASSIGN HIERARCHY LOCATION ================= */}
      {view === "assign" && pendingAdmin && (
        <div className="admins-panel">
          <button className="btn-back" onClick={backToList}>
            <FiArrowLeft /> Back to list
          </button>
          <div className="admins-panel-header">
            <FiMapPin size={22} />
            <div>
              <h2>Assign Site</h2>
              <p>
                Assign the {assignmentParentLabel} and{" "}
                {assignmentChildLabel.toLowerCase()} to{" "}
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
                {canAutoAssignCustomer
                  ? currentCustomerName
                  : getCustomerName(pendingAdmin, customers)}
              </span>
            </div>
            <div className="assign-row">
              <span className="assign-label">Hierarchy</span>
              <span className="assign-value">
                {isGeographical
                  ? "Geographical — State → District"
                  : assignmentHierarchy === "ZONAL"
                  ? "Zonal — Zone → Circle"
                  : "Not determined"}
              </span>
            </div>
            <div className="assign-row">
              <span className="assign-label">Email</span>
              <span className="assign-value">{pendingAdmin.email}</span>
            </div>

            <label className="assign-select">
              {assignmentParentLabel} *
              {isGeographical ? (
                statesLoading ? (
                  <span className="assign-loading">Loading states...</span>
                ) : states.length === 0 ? (
                  <span className="assign-loading">
                    No states available for this customer.
                  </span>
                ) : (
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedState(value);
                      setSelectedDistrict("");
                      setDistricts([]);
                      if (value) fetchDistricts(value);
                    }}
                  >
                    <option value="">— Select a state —</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                        {state.code ? ` (${state.code})` : ""}
                      </option>
                    ))}
                  </select>
                )
              ) : zonesLoading ? (
                <span className="assign-loading">Loading zones...</span>
              ) : zones.length === 0 ? (
                <span className="assign-loading">
                  No zones available for this customer.
                </span>
              ) : (
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedZone(value);
                    setSelectedCircle("");
                    setCircles([]);
                    if (value) fetchCircles(value);
                  }}
                >
                  <option value="">— Select a zone —</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                      {zone.code ? ` (${zone.code})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="assign-select">
              {assignmentChildLabel} *
              {isGeographical ? (
                districtsLoading ? (
                  <span className="assign-loading">Loading districts...</span>
                ) : !selectedState ? (
                  <span className="assign-loading">Select a state first.</span>
                ) : districts.length === 0 ? (
                  <span className="assign-loading">
                    No districts available under this state.
                  </span>
                ) : (
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">— Select a district —</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                        {district.code ? ` (${district.code})` : ""}
                      </option>
                    ))}
                  </select>
                )
              ) : circlesLoading ? (
                <span className="assign-loading">Loading circles...</span>
              ) : !selectedZone ? (
                <span className="assign-loading">Select a zone first.</span>
              ) : circles.length === 0 ? (
                <span className="assign-loading">
                  No circles available under this zone.
                </span>
              ) : (
                <select
                  value={selectedCircle}
                  onChange={(e) => setSelectedCircle(e.target.value)}
                >
                  <option value="">— Select a circle —</option>
                  {circles.map((circle) => (
                    <option key={circle.id} value={circle.id}>
                      {circle.name}
                      {circle.code ? ` (${circle.code})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          {assignError && <div className="form-error">{assignError}</div>}
          <div className="panel-actions">
            {canAutoAssignCustomer ? (
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
              disabled={
                assigning ||
                (isGeographical
                  ? !selectedState || !selectedDistrict
                  : !selectedZone || !selectedCircle)
              }
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