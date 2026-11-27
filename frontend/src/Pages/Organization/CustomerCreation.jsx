
// // import React, { useCallback, useEffect, useMemo, useState } from "react";
// // import {
// //   FiTrash2,
// //   FiPlus,
// //   FiArrowLeft,
// //   FiCheckCircle,
// //   FiUserPlus,
// //   FiEdit3,
// //   FiEdit2,
// //   FiMapPin,
// // } from "react-icons/fi";

// // import "./CustomerCreation.css";
// // // import "./AdminCreation.css";

// // const API_BASE =
// //   import.meta.env.VITE_API_BASE_URL ||
// //   `http://${window.location.hostname}:8000/api`;
// // const LOCATIONS_URL = `${API_BASE}/v1/filters/locations/`;
// // const CUSTOMERS_URL = `${API_BASE}/customers/`;
// // const SITES_URL = `${API_BASE}/cloud/sites/?pageSize=1000&page=0`;

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

// // const HIERARCHY_OPTIONS = [
// //   {
// //     value: "GEOGRAPHICAL",
// //     label: "Geographical",
// //     description: "India → State → District → Taluka → Branch",
// //   },
// //   {
// //     value: "ZONAL",
// //     label: "Zonal",
// //     description: "India → Zone → Circle → Branch → Floor (editable)",
// //   },
// // ];

// // const HIERARCHY_LABEL = { GEOGRAPHICAL: "Geographical", ZONAL: "Zonal" };
// // const CUSTOMER_TYPES = ["Public Sector Bank", "Private Sector Bank"];

// // const emptyForm = {
// //   id: null,
// //   company: "",
// //   code: "",
// //   company_email: "",
// //   contact_person: "",
// //   contact_person_email: "",
// //   phone: "",
// //   password: "",
// //   confirm_password: "",
// //   hierarchy_type: "",
// //   zonal_hierarchy_config: { version: 1, levels: ["zone", "circle", "branch", "floor"] },
// //   is_active: true,
// //   bank_short_name: "",
// //   bank_type: "",
// //   website: "",
// //   address_line_1: "",
// //   state: "",
// //   district: "",
// //   taluka: "",
// //   city: "",
// //   pincode: "",
// //   designation: "",
// //   admin_mobile: "",
// // };

// // /* ---------------- helpers ---------------- */
// // function normalizeList(result) {
// //   if (Array.isArray(result)) return result;
// //   if (result && Array.isArray(result.data)) return result.data;
// //   if (result && Array.isArray(result.results)) return result.results;
// //   return [];
// // }
// // const customerNameOf = (c) => c?.company ?? c?.bank_name ?? c?.name ?? "";
// // const customerEmailOf = (c) => c?.company_email ?? c?.email ?? "";

// // const getCustomerHierarchyPath = (customer) => {
// //   const t = customer?.hierarchy_type;
// //   if (t === "GEOGRAPHICAL") return "Geographical";
// //   if (t === "ZONAL") {
// //     const config = customer?.zonal_hierarchy_config || {};
// //     const levels = Array.isArray(config.levels) && config.levels.length
// //       ? config.levels
// //       : ["zone", "circle", "branch", "floor"];
// //     const names = config.level_names || config.display_names || config.levelNames || {};
// //     const titleFor = (lvl) =>
// //       typeof names[lvl] === "string" && names[lvl].trim()
// //         ? names[lvl].trim()
// //         : lvl.charAt(0).toUpperCase() + lvl.slice(1);
// //     return ["India", ...levels.map(titleFor)].join(" → ");
// //   }
// //   return "-";
// // };

// // const getHeadOfficeHierarchy = (customer) => {
// //   const t = customer?.hierarchy_type;
// //   if (t === "GEOGRAPHICAL") {
// //     return ["India", customer?.state, customer?.district, customer?.taluka, customer?.city]
// //       .filter(Boolean).join(" → ");
// //   }
// //   if (t === "ZONAL") {
// //     return ["India", customer?.zone, customer?.circle, customer?.region, customer?.division]
// //       .filter(Boolean).join(" → ");
// //   }
// //   return "-";
// // };

// // const ZONAL_LEVEL_DEFAULT_LABELS = {
// //   zone: "Zone", circle: "Circle", region: "Region", division: "Division",
// //   branch: "Branch", building: "Building", floor: "Floor", room: "Room",
// // };

// // function CustomerCreation() {
// //   /* ----- state ----- */
// //   const [view, setView] = useState("list");
// //   const [customers, setCustomers] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [search, setSearch] = useState("");
// //   const [form, setForm] = useState(emptyForm);
// //   const [formError, setFormError] = useState("");
// //   const [saving, setSaving] = useState(false);
// //   const [selectedHierarchy, setSelectedHierarchy] = useState("");
// //   const [hierarchyError, setHierarchyError] = useState("");
// //   const [zonalConfig, setZonalConfig] = useState({
// //     version: 1,
// //     levels: ["zone", "circle", "branch", "floor"],
// //     labels: { ...ZONAL_LEVEL_DEFAULT_LABELS },
// //   });
// //   const [isEditingZonalHierarchy, setIsEditingZonalHierarchy] = useState(false);
// //   const [editingZonalLabelLevel, setEditingZonalLabelLevel] = useState(null);
// //   const [savingZonalConfig, setSavingZonalConfig] = useState(false);
// //   const [confirmDelete, setConfirmDelete] = useState(null);
// //   const [deleting, setDeleting] = useState(false);

// //   const [assignCustomers, setAssignCustomers] = useState([]);
// //   const [assignSites, setAssignSites] = useState([]);
// //   const [assignCustomerId, setAssignCustomerId] = useState("");
// //   const [assignSiteId, setAssignSiteId] = useState("");
// //   const [assignLoading, setAssignLoading] = useState(false);
// //   const [assignSaving, setAssignSaving] = useState(false);
// //   const [assignError, setAssignError] = useState("");
// //   const [assignSuccess, setAssignSuccess] = useState("");

// //   const [locationTree, setLocationTree] = useState([]);
// //   const [locationsLoading, setLocationsLoading] = useState(false);
// //   const [locationsError, setLocationsError] = useState("");

// //   const [physicalHierarchy, setPhysicalHierarchy] = useState([]);
// //   const [physicalHierarchyLoading, setPhysicalHierarchyLoading] = useState(false);
// //   const [physicalHierarchyError, setPhysicalHierarchyError] = useState("");
// //   const [physicalNodeModal, setPhysicalNodeModal] = useState(null);
// //   const [physicalNodeForm, setPhysicalNodeForm] = useState({ name: "", code: "" });
// //   const [savingPhysicalNode, setSavingPhysicalNode] = useState(false);

// //   const [toast, setToast] = useState(null);
// //   const isEditing = Boolean(form.id);

// //   /* ----- zonal config ----- */
// //   const openHierarchyEditor = () => {
// //     setIsEditingZonalHierarchy(true);
// //     setHierarchyError("");
// //     setView("hierarchy");
// //   };

// //   const updateZonalConfig = (level, enabled) => {
// //     setZonalConfig((current) => {
// //       const selected = new Set(current?.levels || ["zone", "circle", "branch", "floor"]);
// //       if (["circle", "region", "division"].includes(level)) {
// //         if (enabled) selected.add(level);
// //         else selected.delete(level);
// //         if (level === "region" && !enabled) selected.delete("division");
// //       } else if (["building", "room"].includes(level)) {
// //         if (enabled) selected.add(level);
// //         else selected.delete(level);
// //       }
// //       selected.add("zone");
// //       selected.add("branch");
// //       selected.add("floor");
// //       if (selected.has("division")) selected.add("region");
// //       if (selected.has("room")) selected.add("floor");
// //       const order = ["zone", "circle", "region", "division", "branch", "building", "floor", "room"];
// //       return {
// //         ...current,
// //         version: 1,
// //         levels: order.filter((i) => selected.has(i)),
// //         labels: { ...ZONAL_LEVEL_DEFAULT_LABELS, ...(current?.labels || {}) },
// //       };
// //     });
// //   };

// //   const updateZonalLabel = (level, value) =>
// //     setZonalConfig((c) => ({
// //       ...c,
// //       labels: { ...ZONAL_LEVEL_DEFAULT_LABELS, ...(c?.labels || {}), [level]: value },
// //     }));

// //   const zonalLabel = (level) =>
// //     (zonalConfig?.labels || {})[level] || ZONAL_LEVEL_DEFAULT_LABELS[level] || level;

// //   /* ----- physical hierarchy ----- */
// //   const readApiRows = async (url) => {
// //     const response = await fetch(url, { headers: authHeaders(), cache: "no-store" });
// //     const result = await response.json().catch(() => ({}));
// //     if (!response.ok)
// //       throw new Error(result.detail || result.message || "Unable to load physical hierarchy.");
// //     return Array.isArray(result) ? result : result.results || result.data || [];
// //   };

// //   const loadPhysicalHierarchy = useCallback(async () => {
// //     if (!form.id) { setPhysicalHierarchy([]); return; }
// //     setPhysicalHierarchyLoading(true);
// //     setPhysicalHierarchyError("");
// //     try {
// //       const branches = await readApiRows(`${API_BASE}/branches/?customer=${encodeURIComponent(form.id)}`);
// //       const tree = await Promise.all(
// //         branches.map(async (branch) => {
// //           const [buildings, branchFloors] = await Promise.all([
// //             readApiRows(`${API_BASE}/buildings/?branch=${encodeURIComponent(branch.id)}`),
// //             readApiRows(`${API_BASE}/floors/?branch=${encodeURIComponent(branch.id)}`),
// //           ]);
// //           const buildingNodes = await Promise.all(
// //             buildings.map(async (building) => {
// //               const floors = branchFloors.filter(
// //                 (f) => String(f.building || "") === String(building.id)
// //               );
// //               return {
// //                 ...building,
// //                 floors: await Promise.all(
// //                   floors.map(async (floor) => ({
// //                     ...floor,
// //                     rooms: await readApiRows(`${API_BASE}/rooms/?floor=${encodeURIComponent(floor.id)}`),
// //                   }))
// //                 ),
// //               };
// //             })
// //           );
// //           const directFloors = branchFloors.filter((f) => !f.building);
// //           return {
// //             ...branch,
// //             buildings: buildingNodes,
// //             directFloors: await Promise.all(
// //               directFloors.map(async (floor) => ({
// //                 ...floor,
// //                 rooms: await readApiRows(`${API_BASE}/rooms/?floor=${encodeURIComponent(floor.id)}`),
// //               }))
// //             ),
// //           };
// //         })
// //       );
// //       setPhysicalHierarchy(tree);
// //     } catch (e) {
// //       setPhysicalHierarchyError(e.message || "Unable to load physical hierarchy.");
// //     } finally {
// //       setPhysicalHierarchyLoading(false);
// //     }
// //   }, [form.id]);

// //   useEffect(() => {
// //     if (view === "hierarchy" && selectedHierarchy === "ZONAL" && form.id)
// //       loadPhysicalHierarchy();
// //   }, [view, selectedHierarchy, form.id, loadPhysicalHierarchy]);

// //   const openPhysicalNodeForm = (type, parent) => {
// //     setPhysicalNodeForm({ name: "", code: "" });
// //     setPhysicalNodeModal({ type, parent });
// //     setPhysicalHierarchyError("");
// //   };

// //   const savePhysicalNode = async (event) => {
// //     event.preventDefault();
// //     if (!physicalNodeModal || !form.id) return;
// //     const { type, parent } = physicalNodeModal;
// //     const payload = { name: physicalNodeForm.name.trim(), code: physicalNodeForm.code.trim() };
// //     if (!payload.name || !payload.code) return;
// //     if (type === "building") payload.branch = parent.id;
// //     if (type === "floor") {
// //       payload.branch = parent.branchId || parent.id;
// //       if (parent.type === "building") payload.building = parent.id;
// //     }
// //     if (type === "room") payload.floor = parent.id;
// //     const endpoint = type === "building" ? "buildings" : type === "floor" ? "floors" : "rooms";
// //     setSavingPhysicalNode(true);
// //     setPhysicalHierarchyError("");
// //     try {
// //       const response = await fetch(`${API_BASE}/${endpoint}/`, {
// //         method: "POST",
// //         headers: authHeaders(),
// //         body: JSON.stringify(payload),
// //       });
// //       const result = await response.json().catch(() => ({}));
// //       if (!response.ok)
// //         throw new Error(result.detail || result.message || JSON.stringify(result) || `Unable to create ${type}.`);
// //       setPhysicalNodeModal(null);
// //       setPhysicalNodeForm({ name: "", code: "" });
// //       await loadPhysicalHierarchy();
// //     } catch (e) {
// //       setPhysicalHierarchyError(e.message || `Unable to create ${type}.`);
// //     } finally {
// //       setSavingPhysicalNode(false);
// //     }
// //   };

// //   const saveZonalHierarchyConfig = async () => {
// //     const levels = zonalConfig?.levels || [];
// //     if (levels.includes("division") && !levels.includes("region")) {
// //       setHierarchyError("Division requires Region."); return;
// //     }
// //     if (levels.includes("room") && !levels.includes("floor")) {
// //       setHierarchyError("Room requires Floor."); return;
// //     }
// //     const invalidLabel = levels.find(
// //       (lvl) => !String(zonalConfig?.labels?.[lvl] ?? ZONAL_LEVEL_DEFAULT_LABELS[lvl] ?? "").trim()
// //     );
// //     if (invalidLabel) {
// //       setHierarchyError(`Enter a display heading for ${ZONAL_LEVEL_DEFAULT_LABELS[invalidLabel] || invalidLabel}.`);
// //       return;
// //     }
// //     setHierarchyError("");
// //     if (!form.id) {
// //       setForm((c) => ({ ...c, zonal_hierarchy_config: zonalConfig }));
// //       setIsEditingZonalHierarchy(false);
// //       setView("form");
// //       return;
// //     }
// //     try {
// //       setSavingZonalConfig(true);
// //       const response = await fetch(`${CUSTOMERS_URL}${form.id}/`, {
// //         method: "PATCH",
// //         headers: authHeaders(),
// //         body: JSON.stringify({ zonal_hierarchy_config: zonalConfig }),
// //       });
// //       const result = await response.json().catch(() => ({}));
// //       if (!response.ok)
// //         throw new Error(result.detail || result.message || "Unable to save the hierarchy configuration.");
// //       const savedConfig = result.zonal_hierarchy_config || zonalConfig;
// //       setZonalConfig(savedConfig);
// //       setForm((c) => ({ ...c, zonal_hierarchy_config: savedConfig }));
// //       setIsEditingZonalHierarchy(false);
// //       setView("form");
// //     } catch (e) {
// //       setHierarchyError(e.message || "Unable to save the hierarchy configuration.");
// //     } finally {
// //       setSavingZonalConfig(false);
// //     }
// //   };

// //   /* ----- branches / customers ----- */
// //   const [formSites, setFormSites] = useState([]);
// //   const [formSiteId, setFormSiteId] = useState("");
// //   const [sitesLoading, setSitesLoading] = useState(false);
// //   const [sitesError, setSitesError] = useState("");

// //   const loadSites = useCallback(async () => {
// //     setSitesLoading(true);
// //     setSitesError("");
// //     try {
// //       const res = await fetch(SITES_URL, { method: "GET", headers: authHeaders(), cache: "no-store" });
// //       const body = await res.json().catch(() => ({}));
// //       if (!res.ok || body.status === "error" || !Array.isArray(body.sites))
// //         throw new Error(body.message || `Could not load branches (${res.status}).`);
// //       setFormSites(body.sites);
// //     } catch (e) {
// //       setSitesError(e.message || "Could not load branches.");
// //     } finally {
// //       setSitesLoading(false);
// //     }
// //   }, []);

// //   const fetchCustomers = useCallback(async () => {
// //     try {
// //       setLoading(true);
// //       setError("");
// //       const res = await fetch(CUSTOMERS_URL, { method: "GET", cache: "no-store", headers: authHeaders() });
// //       if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
// //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //       const result = await res.json();
// //       setCustomers(normalizeList(result));
// //     } catch (err) {
// //       setError(err.message || "Unable to load customers.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const openAssignSite = async (customerId = "") => {
// //     setView("assignSite");
// //     setAssignError("");
// //     setAssignSuccess("");
// //     setAssignCustomerId(String(customerId || ""));
// //     setAssignSiteId("");
// //     setAssignLoading(true);
// //     try {
// //       const [customerResponse, siteResponse] = await Promise.all([
// //         fetch(CUSTOMERS_URL, { method: "GET", headers: authHeaders(), cache: "no-store" }),
// //         fetch(SITES_URL, { method: "GET", headers: authHeaders(), cache: "no-store" }),
// //       ]);
// //       if (!customerResponse.ok) throw new Error(`Could not load customers (${customerResponse.status}).`);
// //       if (!siteResponse.ok) {
// //         const errorBody = await siteResponse.json().catch(() => ({}));
// //         throw new Error(errorBody.message || `Could not load 3TP sites (${siteResponse.status}).`);
// //       }
// //       const customerData = await customerResponse.json();
// //       const siteData = await siteResponse.json();
// //       if (siteData.status === "error") throw new Error(siteData.message || "Could not load 3TP sites.");
// //       if (!Array.isArray(siteData.sites)) throw new Error("Invalid response: expected a sites array.");
// //       const loadedCustomers = normalizeList(customerData);
// //       setAssignCustomers(loadedCustomers);
// //       setAssignSites(siteData.sites);
// //       const exists = loadedCustomers.some((c) => String(c.id) === String(customerId));
// //       setAssignCustomerId(exists ? String(customerId) : "");
// //     } catch (err) {
// //       setAssignCustomers([]);
// //       setAssignSites([]);
// //       setAssignError(err.message || "Could not load assignment data.");
// //     } finally {
// //       setAssignLoading(false);
// //     }
// //   };

// //   const handleAssignSite = async (e) => {
// //     e.preventDefault();
// //     setAssignError("");
// //     setAssignSuccess("");
// //     const payload = {
// //       customer_id: String(assignCustomerId || "").trim(),
// //       tpt_site_id: String(assignSiteId || "").trim(),
// //     };
// //     if (!payload.customer_id || !payload.tpt_site_id) {
// //       setAssignError("Please select both a customer and a site."); return;
// //     }
// //     setAssignSaving(true);
// //     try {
// //       const response = await fetch(`${API_BASE}/customers/assign/site/`, {
// //         method: "POST",
// //         headers: authHeaders(),
// //         body: JSON.stringify(payload),
// //       });
// //       const result = await response.json().catch(() => ({}));
// //       if (!response.ok)
// //         throw new Error(result.message || result.details || `Assignment failed (${response.status}).`);
// //       setAssignSuccess(result.message || "Customer assigned to site successfully.");
// //       setAssignSiteId("");
// //     } catch (err) {
// //       setAssignError(err.message || "Could not assign customer to site.");
// //     } finally {
// //       setAssignSaving(false);
// //     }
// //   };

// //   useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

// //   useEffect(() => {
// //     let cancelled = false;
// //     const fetchLocationTree = async () => {
// //       setLocationsLoading(true);
// //       setLocationsError("");
// //       try {
// //         const response = await fetch(`${LOCATIONS_URL}?hierarchy=GEOGRAPHICAL`, {
// //           method: "GET",
// //           headers: { Accept: "application/json", ...authHeaders() },
// //           cache: "no-store",
// //         });
// //         if (!response.ok) throw new Error(`Unable to load locations (${response.status})`);
// //         const result = await response.json();
// //         if (!cancelled) setLocationTree(Array.isArray(result?.data) ? result.data : []);
// //       } catch (err) {
// //         if (!cancelled) setLocationsError(err.message);
// //       } finally {
// //         if (!cancelled) setLocationsLoading(false);
// //       }
// //     };
// //     fetchLocationTree();
// //     return () => { cancelled = true; };
// //   }, []);

// //   const headOfficeOptions = useMemo(() => {
// //     const india = locationTree.find(
// //       (item) => String(item?.country_name || "").toLowerCase() === "india"
// //     );
// //     const states = india?.states || [];
// //     const selectedState = states.find((i) => i.state_name === form.state);
// //     const districts = selectedState?.districts || [];
// //     const selectedDistrict = districts.find((i) => i.district_name === form.district);
// //     const talukas = selectedDistrict?.talukas || [];
// //     return {
// //       states: states.map((i) => i.state_name).filter(Boolean),
// //       districts: districts.map((i) => i.district_name).filter(Boolean),
// //       talukas: talukas.map((i) => i.taluka_name).filter(Boolean),
// //     };
// //   }, [locationTree, form.state, form.district]);

// //   const filteredCustomers = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     if (!q) return customers;
// //     return customers.filter((c) => {
// //       const fields = [
// //         customerNameOf(c), c.code, customerEmailOf(c), c.contact_person, c.phone,
// //         c.hierarchy_type, c.bank_short_name, c.bank_type,
// //       ];
// //       return fields.filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
// //     });
// //   }, [customers, search]);

// //   /* ----- create / edit / back ----- */
// //   const goToCreate = () => {
// //     setForm({ ...emptyForm });
// //     setFormSiteId("");
// //     loadSites();
// //     setSelectedHierarchy("");
// //     setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
// //     setIsEditingZonalHierarchy(false);
// //     setFormError("");
// //     setHierarchyError("");
// //     setView("form");
// //   };

// //   const openEditPanel = (customer) => {
// //     const hierarchy = customer.hierarchy_type || "";
// //     setForm({
// //       ...emptyForm,
// //       id: customer.id,
// //       company: customer.company ?? customer.bank_name ?? customer.name ?? "",
// //       code: customer.code || "",
// //       company_email: customer.company_email ?? customer.email ?? "",
// //       contact_person: customer.contact_person || "",
// //       contact_person_email: customer.contact_person_email || "",
// //       phone: customer.phone || "",
// //       hierarchy_type: hierarchy,
// //       zonal_hierarchy_config:
// //         customer.zonal_hierarchy_config || { version: 1, levels: ["zone", "circle", "branch", "floor"] },
// //       is_active: customer.is_active ?? true,
// //       bank_short_name: customer.bank_short_name || "",
// //       bank_type: customer.bank_type || "",
// //       website: customer.website || "",
// //       address_line_1: customer.address_line_1 || "",
// //       state: customer.state || "",
// //       district: customer.district || "",
// //       taluka: customer.taluka || "",
// //       city: customer.city || "",
// //       pincode: customer.pincode || "",
// //       designation: customer.designation || "",
// //       admin_mobile: customer.admin_mobile || customer.phone || "",
// //       password: "",
// //       confirm_password: "",
// //     });
// //     setSelectedHierarchy(hierarchy);
// //     setZonalConfig(
// //       customer.zonal_hierarchy_config || { version: 1, levels: ["zone", "circle", "branch", "floor"] }
// //     );
// //     setIsEditingZonalHierarchy(false);
// //     setFormError("");
// //     setHierarchyError("");
// //     setView("form");
// //   };

// //   const backToList = () => {
// //     setView("list");
// //     setForm({ ...emptyForm });
// //     setFormSiteId("");
// //     setSelectedHierarchy("");
// //     setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
// //     setIsEditingZonalHierarchy(false);
// //     setFormError("");
// //     setHierarchyError("");
// //   };

// //   const handleFieldChange = (field, value) =>
// //     setForm((prev) => ({ ...prev, [field]: value }));

// //   const handleHierarchyChange = (value) => {
// //     setSelectedHierarchy(value);
// //     setForm((prev) => ({ ...prev, hierarchy_type: value }));
// //     if (value === "ZONAL")
// //       setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
// //     setHierarchyError("");
// //   };

// //   const validateForm = () => {
// //     if (!form.company.trim()) return "Customer name is required.";
// //     if (!form.code.trim()) return "Customer code is required.";
// //     if (!form.bank_short_name.trim()) return "Short name is required.";
// //     if (!form.bank_type) return "Customer type is required.";
// //     if (!form.company_email.trim()) return "Customer email is required.";
// //     if (!form.phone.trim()) return "Customer phone number is required.";
// //     if (!form.contact_person.trim()) return "Contact person name is required.";
// //     if (!form.contact_person_email.trim()) return "Contact person email is required.";
// //     if (!form.admin_mobile.trim()) return "Contact person mobile is required.";
// //     if (!form.state) return "Please select a state.";
// //     if (!form.district) return "Please select a district.";
// //     if (!form.taluka) return "Please select a taluka.";
// //     if (!isEditing) {
// //       if (!form.password.trim()) return "Password is required.";
// //       if (!form.confirm_password.trim()) return "Confirm password is required.";
// //       if (form.password !== form.confirm_password)
// //         return "Password and confirm password do not match.";
// //     }
// //     if (form.password.trim() && form.password !== form.confirm_password)
// //       return "Password and confirm password do not match.";
// //     if (!selectedHierarchy) return "Please select a location hierarchy.";
// //     if (form.pincode && !/^\d{6}$/.test(form.pincode.trim()))
// //       return "PIN code must contain exactly 6 digits.";
// //     if (form.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.company_email.trim()))
// //       return "Please enter a valid customer email.";
// //     if (form.contact_person_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_person_email.trim()))
// //       return "Please enter a valid contact person email.";
// //     return "";
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setFormError("");
// //     const validationError = validateForm();
// //     if (validationError) { setFormError(validationError); return; }
// //     const payload = {
// //       company: form.company.trim(),
// //       code: form.code.trim(),
// //       company_email: form.company_email.trim(),
// //       contact_person: form.contact_person.trim(),
// //       contact_person_email: form.contact_person_email.trim(),
// //       phone: form.admin_mobile.trim() || form.phone.trim(),
// //       hierarchy_type: selectedHierarchy || form.hierarchy_type,
// //       zonal_hierarchy_config:
// //         (selectedHierarchy || form.hierarchy_type) === "ZONAL"
// //           ? zonalConfig
// //           : { version: 1, levels: ["zone", "circle", "branch", "floor"] },
// //       is_active: form.is_active,
// //       state: form.state.trim(),
// //       district: form.district.trim(),
// //       taluka: form.taluka,
// //       city: form.city.trim(),
// //       pincode: form.pincode.trim(),
// //     };
// //     if (form.password.trim()) payload.password = form.password.trim();
// //     setSaving(true);
// //     try {
// //       const url = isEditing ? `${CUSTOMERS_URL}${form.id}/` : CUSTOMERS_URL;
// //       const method = isEditing ? "PATCH" : "POST";
// //       const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
// //       if (!res.ok) {
// //         const errBody = await res.json().catch(() => ({}));
// //         const message = typeof errBody === "object" && errBody !== null
// //           ? Object.entries(errBody)
// //               .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
// //               .join(" | ")
// //           : `HTTP ${res.status}`;
// //         throw new Error(message || `HTTP ${res.status}`);
// //       }
// //       const saved = await res.json();
// //       await fetchCustomers();
// //       if (!isEditing) {
// //         const assignRes = await fetch(`${API_BASE}/customers/assign/site/`, {
// //           method: "POST",
// //           headers: authHeaders(),
// //           body: JSON.stringify({ customer_id: String(saved.id), tpt_site_id: String(formSiteId) }),
// //         });
// //         const assignBody = await assignRes.json().catch(() => ({}));
// //         if (!assignRes.ok) {
// //           setForm((prev) => ({ ...prev, id: saved.id }));
// //           setFormError("");
// //           setView("hierarchy");
// //           showToast(
// //             "error",
// //             `Customer created, but branch assignment failed: ${
// //               assignBody.message || assignBody.details || assignRes.status
// //             }. Use the pin icon in the customer list to retry.`
// //           );
// //           return;
// //         }
// //       }
// //       if (isEditing) {
// //         backToList();
// //         showToast("success", "Customer updated successfully.");
// //         return;
// //       }
// //       setForm((prev) => ({ ...prev, id: saved.id }));
// //       setFormError("");
// //       setView("hierarchy");
// //       showToast("success", "Customer created successfully.");
// //     } catch (err) {
// //       const msg = err.message || "Could not save customer.";
// //       setFormError(msg);
// //       showToast("error", msg);
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     if (!confirmDelete || deleting) return;
// //     const name = customerNameOf(confirmDelete) || confirmDelete.code || "Customer";
// //     setDeleting(true);
// //     try {
// //       const res = await fetch(`${CUSTOMERS_URL}${confirmDelete.id}/`, {
// //         method: "DELETE",
// //         headers: authHeaders(),
// //       });
// //       if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
// //       setCustomers((prev) => prev.filter((c) => c.id !== confirmDelete.id));
// //       setConfirmDelete(null);
// //       showToast("success", `${name} deleted successfully.`);
// //     } catch (err) {
// //       const msg = err.message || "Could not delete customer.";
// //       setError(msg);
// //       setConfirmDelete(null);
// //       showToast("error", msg);
// //     } finally {
// //       setDeleting(false);
// //     }
// //   };

// //   const hierarchyName = HIERARCHY_LABEL[selectedHierarchy] || "-";

// //   const showToast = useCallback((type, message) => {
// //     setToast({ type, message, id: Date.now() });
// //   }, []);

// //   useEffect(() => {
// //     if (!toast) return;
// //     const t = setTimeout(() => setToast(null), 3000);
// //     return () => clearTimeout(t);
// //   }, [toast]);

// //     /* =====================================================
// //      INLINE ACTION BUTTON STYLES (MATCHING ADMIN CREATION)
// //   ===================================================== */
// //   const iconBtnStyle = {
// //     display: "inline-flex",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     width: 30,
// //     height: 30,
// //     padding: 0,
// //     borderRadius: 6,
// //     border: "1px solid #e5e7eb",
// //     background: "#fff",
// //     cursor: "pointer",
// //     marginLeft: 6,
// //     transition: "background .15s, border-color .15s",
// //   };

// //   const editBtnStyle = { ...iconBtnStyle, color: "#2563eb" };
// //   const deleteBtnStyle = { ...iconBtnStyle, color: "#dc2626" };
// //   const assignBtnStyle = { ...iconBtnStyle, color: "#16a34a" }; // Matches the green branch pin in Admin

// //   return (
// //     <div className="admins-page">
// //       {/* STEPPER */}
// //       <ol className="admins-stepper">
// //         <li className={view === "list" ? "active" : "done"}>
// //           <button type="button" className="step-btn" onClick={backToList}>
// //             <span className="step-num">1</span> Customers
// //           </button>
// //         </li>
// //         <li className={view === "form" ? "active" : view === "hierarchy" ? "done" : ""}>
// //           <button type="button" className="step-btn" onClick={goToCreate}>
// //             <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
// //           </button>
// //         </li>
// //         {/* <li className={view === "hierarchy" ? "active" : ""}>
// //           <button
// //             type="button"
// //             className="step-btn"
// //             disabled={!selectedHierarchy}
// //             onClick={() => {
// //               if (!selectedHierarchy) return;
// //               setIsEditingZonalHierarchy(true);
// //               setView("hierarchy");
// //               if (selectedHierarchy === "ZONAL" && form.id) loadPhysicalHierarchy();
// //             }}
// //           >
// //             <span className="step-num">3</span> Hierarchy
// //           </button>
// //         </li> */}
// //       </ol>

// //       {/* LIST */}
// //       {view === "list" && (
// //         <>
// //           <div className="admins-header">
// //             <div>
// //               <h1>Customers</h1>
// //               <p>Register and manage customers under your organization.</p>
// //             </div>
// //           </div>
// //           <div className="admins-toolbar">
// //             <input
// //               type="text"
// //               className="admins-search"
// //               placeholder="Search by customer name, code, email, phone or hierarchy..."
// //               value={search}
// //               onChange={(e) => setSearch(e.target.value)}
// //             />
// //             <span className="admins-count">
// //               {filteredCustomers.length} of {customers.length} customers
// //             </span>
// //           </div>
// //           {error && <div className="admins-error">{error}</div>}
// //           <div className="admins-table-card" style={{ overflowX: "auto" }}>
// //             {loading ? (
// //               <div className="admins-loading">Loading Customers...</div>
// //             ) : filteredCustomers.length === 0 ? (
// //               <div className="admins-empty">
// //                 {customers.length === 0
// //                   ? "No customers registered yet. Click “Create Customer” to create one."
// //                   : "No customers match your search."}
// //               </div>
// //             ) : (
// //               <table className="admins-table" style={{ minWidth: "1100px" }}>
// //                 <thead>
// //                   <tr>
// //                     <th>Customer</th>
// //                     <th>Code</th>
// //                     <th>Email</th>
// //                     <th>Contact</th>
// //                     <th>Phone</th>
// //                     <th>Hierarchy</th>
// //                     {/* <th>Head Office</th> */}
// //                     <th>Status</th>
// //                     <th className="actions-col">Actions</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {filteredCustomers.map((customer) => (
// //                     <tr key={customer.id}>
// //                       <td>
// //                         <strong>{customerNameOf(customer)}</strong>
// //                         {customer.bank_short_name && (
// //                           <small className="customer-name-sub">{customer.bank_short_name}</small>
// //                         )}
// //                       </td>
// //                       <td>{customer.code || "-"}</td>
// //                       <td>{customerEmailOf(customer) || "-"}</td>
// //                       <td>{customer.contact_person || "-"}</td>
// //                       <td>{customer.phone || "-"}</td>
// //                       <td className="customer-hierarchy-path">{getCustomerHierarchyPath(customer)}</td>
// //                       {/* <td className="head-office-hierarchy">{getHeadOfficeHierarchy(customer)}</td> */}
// //                       <td>
// //                         <span className={customer.is_active ? "status-active" : "status-inactive"}>
// //                           {customer.is_active ? "Active" : "Inactive"}
// //                         </span>
// //                       </td>
// //                       <td className="actions-col">
// //                         <div
// //                           style={{
// //                             // display: "flex",
// //                             alignItems: "center",
// //                             flexWrap: "wrap",
// //                             gap: 6,
// //                           }}
// //                         >
// //                           {/* ASSIGN SITE */}
// //                           <button
// //                             type="button"
// //                             title="Assign Site"
// //                             aria-label={`Assign site to ${customerNameOf(customer)}`}
// //                             style={assignBtnStyle}
// //                             onClick={() => openAssignSite(customer.id)}
// //                           >
// //                             <FiMapPin size={16} />
// //                           </button>

// //                           {/* EDIT */}
// //                           <button
// //                             type="button"
// //                             title="Edit"
// //                             aria-label="Edit"
// //                             style={editBtnStyle}
// //                             onClick={() => openEditPanel(customer)}
// //                           >
// //                             <FiEdit2 size={16} />
// //                           </button>

// //                           {/* DELETE */}
// //                           <button
// //                             type="button"
// //                             title="Delete"
// //                             aria-label="Delete"
// //                             style={deleteBtnStyle}
// //                             onClick={() => setConfirmDelete(customer)}
// //                           >
// //                             <FiTrash2 size={16} />
// //                           </button>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             )}
// //           </div>

// //           <div className="admins-table-card" style={{ overflowX: "auto" }}>
// //   {loading ? (
// //     <div className="admins-loading">Loading Customers...</div>
// //   ) : filteredCustomers.length === 0 ? (
// //     <div className="admins-empty">
// //       {customers.length === 0
// //         ? "No customers registered yet. Click “Create Customer” to create one."
// //         : "No customers match your search."}
// //     </div>
// //   ) : (
// //     <table className="admins-table" style={{ minWidth: "1100px" }}>
// //       {/* ... table content ... */}
// //     </table>
// //   )}
// // </div>

// //         </>
// //       )}

// //       {/* FORM */}
// //       {view === "form" && (
// //         <div className="admins-panel">
// //           <div className="admins-panel-header">
// //             {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
// //             <div>
// //               <h2>{isEditing ? "Edit Customer" : "Register New Customer"}</h2>
// //               <p>
// //                 {isEditing
// //                   ? `Update details for ${form.company || form.code}.`
// //                   : "Register a new customer and configure their portal access and location hierarchy."}
// //               </p>
// //             </div>
// //           </div>

// //           <form onSubmit={handleSubmit} className="admins-form">
// //             {/* Customer info */}
// //             <div className="assign-card">
// //               <div className="assign-row">
// //                 <span className="assign-label">Customer Information</span>
// //               </div>
// //               <div className="form-grid form-grid--spaced">
// //                 <label>
// //                   Name *
// //                   <input type="text" value={form.company}
// //                     onChange={(e) => handleFieldChange("company", e.target.value)}
// //                     placeholder="HDFC Bank" />
// //                 </label>
// //                 <label>
// //                   Code *
// //                   <input type="text" value={form.code}
// //                     onChange={(e) => handleFieldChange("code", e.target.value.toUpperCase())}
// //                     placeholder="HDFC001" />
// //                 </label>
// //                 <label>
// //                   Short Name *
// //                   <input type="text" value={form.bank_short_name}
// //                     onChange={(e) => handleFieldChange("bank_short_name", e.target.value.toUpperCase())}
// //                     placeholder="HDFC" />
// //                 </label>
// //                 <label>
// //                   Type *
// //                   <select value={form.bank_type}
// //                     onChange={(e) => handleFieldChange("bank_type", e.target.value)}>
// //                     <option value="">Select Customer Type</option>
// //                     {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
// //                   </select>
// //                 </label>
// //                 <label>
// //                   Email *
// //                   <input type="email" value={form.company_email}
// //                     onChange={(e) => handleFieldChange("company_email", e.target.value)}
// //                     placeholder="admin@bank.com" />
// //                 </label>
// //                 <label>
// //                   Phone *
// //                   <input type="tel" value={form.phone}
// //                     onChange={(e) => handleFieldChange("phone", e.target.value)}
// //                     placeholder="+91 22 XXXXXXXX" />
// //                 </label>
// //                 <label>
// //                   Website
// //                   <input type="url" value={form.website}
// //                     onChange={(e) => handleFieldChange("website", e.target.value)}
// //                     placeholder="https://www.bank.com" />
// //                 </label>
// //               </div>
// //             </div>

// //             {/* Head office */}
// //             <div className="assign-card assign-card--spaced">
// //               <div className="assign-row">
// //                 <span className="assign-label">Head Office Details</span>
// //               </div>
// //               <div className="form-grid form-grid--spaced">
// //                 <label className="form-grid__full">
// //                   Address Line 1 *
// //                   <input type="text" value={form.address_line_1}
// //                     onChange={(e) => handleFieldChange("address_line_1", e.target.value)}
// //                     placeholder="Building / Street / Area" />
// //                 </label>
// //                 <label>
// //                   State *
// //                   <select value={form.state} required disabled={locationsLoading}
// //                     onChange={(e) => setForm((p) => ({ ...p, state: e.target.value, district: "", taluka: "", city: "" }))}>
// //                     <option value="">{locationsLoading ? "Loading states..." : "Select State"}</option>
// //                     {headOfficeOptions.states.map((s) => <option key={s} value={s}>{s}</option>)}
// //                   </select>
// //                 </label>
// //                 <label>
// //                   District *
// //                   <select value={form.district} required disabled={!form.state || locationsLoading}
// //                     onChange={(e) => setForm((p) => ({ ...p, district: e.target.value, taluka: "", city: "" }))}>
// //                     <option value="">Select District</option>
// //                     {headOfficeOptions.districts.map((d) => <option key={d} value={d}>{d}</option>)}
// //                   </select>
// //                 </label>
// //                 <label>
// //                   Taluka *
// //                   <select value={form.taluka} required disabled={!form.district || locationsLoading}
// //                     onChange={(e) => setForm((p) => ({ ...p, taluka: e.target.value, city: "" }))}>
// //                     <option value="">Select Taluka</option>
// //                     {headOfficeOptions.talukas.map((t) => <option key={t} value={t}>{t}</option>)}
// //                   </select>
// //                 </label>
// //                 {locationsError && <p className="form-error">{locationsError}</p>}
// //                 <label>
// //                   PIN Code
// //                   <input type="text" maxLength={6} value={form.pincode}
// //                     onChange={(e) => handleFieldChange("pincode", e.target.value.replace(/\D/g, ""))}
// //                     placeholder="411001" />
// //                 </label>
// //               </div>
// //             </div>

// //             {/* Contact person */}
// //             <div className="assign-card assign-card--spaced">
// //               <div className="assign-row">
// //                 <span className="assign-label">Contact Person Details</span>
// //               </div>
// //               <div className="form-grid form-grid--spaced">
// //                 <label>
// //                   Name *
// //                   <input type="text" value={form.contact_person}
// //                     onChange={(e) => handleFieldChange("contact_person", e.target.value)}
// //                     placeholder="Rahul Sharma" />
// //                 </label>
// //                 <label>
// //                   Email *
// //                   <input type="email" value={form.contact_person_email}
// //                     onChange={(e) => handleFieldChange("contact_person_email", e.target.value)}
// //                     placeholder="admin@bank.com" />
// //                   <small className="field-hint">This email will be used for portal login.</small>
// //                 </label>
// //                 <label>
// //                   Mobile *
// //                   <input type="tel" value={form.admin_mobile}
// //                     onChange={(e) => handleFieldChange("admin_mobile", e.target.value)}
// //                     placeholder="+91 00000 00000" />
// //                 </label>
// //                 <label>
// //                   {isEditing ? "Login Password (leave blank to keep current)" : "Login Password *"}
// //                   <input type="password" value={form.password}
// //                     onChange={(e) => handleFieldChange("password", e.target.value)}
// //                     placeholder={isEditing ? "••••••••" : "Set a password"}
// //                     required={!isEditing} autoComplete="new-password" />
// //                 </label>
// //                 <label>
// //                   {isEditing ? "Confirm New Password" : "Confirm Password *"}
// //                   <input type="password" value={form.confirm_password}
// //                     onChange={(e) => handleFieldChange("confirm_password", e.target.value)}
// //                     placeholder="Confirm password"
// //                     required={!isEditing || Boolean(form.password)}
// //                     autoComplete="new-password" />
// //                 </label>
// //               </div>
// //             </div>

// //             {/* Hierarchy selector */}
// //             <div className="assign-card assign-card--spaced">
// //               <div className="assign-row">
// //                 <span className="assign-label">Location Hierarchy *</span>
// //               </div>
// //               <div className="hierarchy-options-grid">
// //                 {HIERARCHY_OPTIONS.map((option) => {
// //                   const selected = selectedHierarchy === option.value;
// //                   return (
// //                     <div
// //                       key={option.value}
// //                       className={`hierarchy-option ${selected ? "is-selected" : ""} ${isEditing ? "is-fixed" : ""}`}
// //                     >
// //                       <label className="hierarchy-option__inner">
// //                         <input
// //                           type="radio"
// //                           name="hierarchy_type"
// //                           value={option.value}
// //                           checked={selected}
// //                           disabled={isEditing}
// //                           onChange={(e) => handleHierarchyChange(e.target.value)}
// //                         />
// //                         <div>
// //                           <div className="hierarchy-option__label">{option.label}</div>
// //                           {/* <div className="hierarchy-option__desc">{option.description}</div> */}
// //                           <div className="hierarchy-option__desc">
// //                             {option.value === "ZONAL"
// //                               ? `India → ${[
// //                                   "zone",
// //                                   ...(zonalConfig?.levels || ["circle", "branch", "floor"]).filter(
// //                                     (level) => level !== "zone"
// //                                   ),
// //                                 ]
// //                                   .map(zonalLabel)
// //                                   .join(" → ")} (editable)`
// //                               : option.description}
// //                           </div>
// //                         </div>
// //                       </label>
// //                       {option.value === "ZONAL" && selected && (
// //                         <button
// //                           type="button"
// //                           className="btn-secondary hierarchy-option__edit"
// //                           title={form.id
// //                             ? "Edit this customer's hierarchy"
// //                             : "Edit the hierarchy before saving this customer"}
// //                           onClick={openHierarchyEditor}
// //                         >
// //                           Edit Hierarchy
// //                         </button>
// //                       )}
// //                     </div>
// //                   );
// //                 })}
// //               </div>

// //               {isEditing && (
// //                 <p className="hierarchy-note">
// //                   The hierarchy type remains fixed for an existing customer. You can edit its Zonal levels in step 3: Hierarchy.
// //                 </p>
// //               )}
// //               {selectedHierarchy === "GEOGRAPHICAL" && (
// //                 <p className="hierarchy-note hierarchy-note--tight">
// //                   <strong>Geographical hierarchy is fixed and cannot be customized.</strong>
// //                 </p>
// //               )}
// //               {selectedHierarchy === "ZONAL" && (
// //                 <p className="hierarchy-note hierarchy-note--tight">
// //                   <strong>Zonal hierarchy can be customized according to the user's needs.</strong>
// //                 </p>
// //               )}
// //             </div>

// //             <div className="assign-card--spaced">
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
// //               <button type="button" className="btn-secondary" onClick={backToList} disabled={saving}>
// //                 Cancel
// //               </button>
// //               <button
// //                 type="submit"
// //                 className="btn-primary"
// //                 disabled={saving}
// //               >
// //                 {saving ? "Saving..." : isEditing ? "Save Changes" : "Register & Continue"}
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       )}

// //       {/* HIERARCHY STEP (Step 3) - rendered as a normal page, not a popup */}
// //       {view === "hierarchy" && (
// //         // <div className="hierarchy-step-page">
// //           <div className="admins-panel hierarchy-step-panel">
// //             <button className="btn-back" onClick={() => setView("form")}>
// //               <FiArrowLeft /> Back to customer
// //             </button>

// //             {/* <div className="admins-panel-header hierarchy-modal__header">
// //               <FiMapPin size={22} />
// //               <div>
// //                 <h2>Configure Hierarchy</h2>
// //                 <p>Configure the location structure for <strong>{form.company}</strong></p>
// //               </div>
// //             </div>

// //             <div className="assign-card">
// //               <div className="assign-row">
// //                 <span className="assign-label">Customer</span>
// //                 <span className="assign-value">{form.company || "-"}</span>
// //               </div>
// //               <div className="assign-row">
// //                 <span className="assign-label">Code</span>
// //                 <span className="assign-value">{form.code || "-"}</span>
// //               </div>
// //               <div className="assign-row">
// //                 <span className="assign-label">Type</span>
// //                 <span className="assign-value">{form.bank_type || "-"}</span>
// //               </div>
// //               <div className="assign-row">
// //                 <span className="assign-label">Hierarchy</span>
// //                 <span className="assign-value">{hierarchyName}</span>
// //               </div>
// //             </div> */}

// //             {selectedHierarchy === "GEOGRAPHICAL" && (
// //               <div className="assign-card hierarchy-card--tight">
// //                 {/* <h3 style={{ marginTop: 0 }}>Geographical Hierarchy</h3> */}
// //                 <div className="hierarchy-info-box">
// //                   <div className="hierarchy-info-box__title">India</div>
// //                   <div className="hierarchy-info-box__path">
// //                     India → State → District → Taluka → Branch
// //                   </div>
// //                   <div className="hierarchy-info-box__divider">
// //                     <strong>Branch can contain:</strong>
// //                     <ul className="hierarchy-info-box__list">
// //                       <li>Multiple Floors</li>
// //                       <li>Direct AC units</li>
// //                       <li>Both Floors and Direct AC units</li>
// //                     </ul>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}

// //             {selectedHierarchy === "ZONAL" && (
// //               <div className="assign-card assign-card--spaced">
// //                 {/* <h3 style={{ marginTop: 0 }}>Zonal Hierarchy</h3> */}

// //                 {!isEditingZonalHierarchy ? (
// //                   <>
// //                     <div className="zonal-readonly">
// //                       <strong>India</strong>
// //                       <div className="zonal-readonly__path">
// //                         {`India → ${(zonalConfig?.levels || ["zone", "circle", "branch", "floor"])
// //                           .map(zonalLabel)
// //                           .join(" → ")}`}
// //                       </div>
// //                     </div>
// //                     <div className="panel-actions zonal-actions">
// //                       <button type="button" className="btn-primary" onClick={() => setIsEditingZonalHierarchy(true)}>
// //                         Edit Hierarchy
// //                       </button>
// //                     </div>
// //                   </>
// //                 ) : (
// //                   <div className="zonal-editor">
// //                     <p className="zonal-editor__intro">
// //                       Build the customer's location path by selecting the levels it uses. Required levels cannot be removed.
// //                     </p>

// //                     <div className="zonal-editor__grid">
// //                       {/* Administrative path */}
// //                       <section className="hierarchy-section">
// //                         <div className="hierarchy-section__head">
// //                           <div className="hierarchy-section__part">Part 1</div>
// //                           <h4 className="hierarchy-section__title">Administrative hierarchy</h4>
// //                           <p className="hierarchy-section__hint">Choose the path from Zone to Branch.</p>
// //                         </div>
// //                         <div className="hierarchy-levels">
// //                           <div className="hierarchy-levels__line" />
// //                           {[
// //                             { key: "zone", label: "Zone", required: true, hint: "Top administrative level" },
// //                             { key: "circle", label: "Circle", hint: "Optional administrative level" },
// //                             { key: "region", label: "Region", hint: "Optional administrative level" },
// //                             { key: "division", label: "Division", hint: "Available when Region is selected" },
// //                             { key: "branch", label: "Branch", required: true, hint: "Branch location" },
// //                           ].map((item, index) => {
// //                             const checked = (zonalConfig?.levels || []).includes(item.key);
// //                             const disabled =
// //                               Boolean(item.required) ||
// //                               (item.key === "division" && !(zonalConfig?.levels || []).includes("region"));
// //                             return (
// //                               <label
// //                                 key={item.key}
// //                                 className={`hierarchy-level ${checked ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}
// //                               >
// //                                 <span className={`hierarchy-level__num ${checked ? "is-selected" : ""}`}>
// //                                   {index + 1}
// //                                 </span>
// //                                 <span className="hierarchy-level__body">
// //                                   <span className="hierarchy-level__title-row">
// //                                     {checked ? zonalLabel(item.key) : item.label}
// //                                     {checked && (
// //                                       <button
// //                                         type="button"
// //                                         title={`Edit ${item.label} heading`}
// //                                         aria-label={`Edit ${item.label} heading`}
// //                                         onClick={(e) => {
// //                                           e.preventDefault();
// //                                           e.stopPropagation();
// //                                           setEditingZonalLabelLevel(
// //                                             editingZonalLabelLevel === item.key ? null : item.key
// //                                           );
// //                                         }}
// //                                       >
// //                                         {/* <FiEdit2 size={12} /> */}
// //                                       </button>
// //                                     )}
// //                                   </span>
// //                                   {checked && editingZonalLabelLevel === item.key && (
// //                                     <input
// //                                       type="text"
// //                                       autoFocus
// //                                       className="hierarchy-level__label-input"
// //                                       value={(zonalConfig?.labels || {})[item.key] ?? ZONAL_LEVEL_DEFAULT_LABELS[item.key] ?? item.label}
// //                                       maxLength={60}
// //                                       onClick={(e) => e.stopPropagation()}
// //                                       onChange={(e) => updateZonalLabel(item.key, e.target.value)}
// //                                       placeholder={`Enter ${item.label} heading`}
// //                                     />
// //                                   )}
// //                                   <span className="hierarchy-level__sub">
// //                                     {item.required ? "Required" : item.hint}
// //                                   </span>
// //                                 </span>
// //                                 <input
// //                                   type="checkbox"
// //                                   className="hierarchy-level__checkbox"
// //                                   checked={checked}
// //                                   disabled={disabled}
// //                                   onChange={(e) => updateZonalConfig(item.key, e.target.checked)}
// //                                 />
// //                               </label>
// //                             );
// //                           })}
// //                         </div>
// //                         <p className="hierarchy-levels__note">
// //                           You can connect Zone directly to Branch, or include Circle and/or Region. Division requires Region.
// //                         </p>
// //                       </section>

// //                       {/* Physical path */}
// //                       <section className="hierarchy-section">
// //                         <div className="hierarchy-section__head">
// //                           <div className="hierarchy-section__part">Part 2</div>
// //                           <h4 className="hierarchy-section__title">Physical hierarchy</h4>
// //                           <p className="hierarchy-section__hint">Choose how locations are organized after Branch.</p>
// //                         </div>
// //                         <div className="hierarchy-levels">
// //                           <div className="hierarchy-levels__line hierarchy-levels__line--green" />
// //                           {[
// //                             { key: "building", label: "Building", hint: "Optional; for multiple buildings" },
// //                             { key: "floor", label: "Floor", required: true, hint: "Required physical level" },
// //                             { key: "room", label: "Room", hint: "Optional; requires Floor" },
// //                           ].map((item, index) => {
// //                             const checked = (zonalConfig?.levels || []).includes(item.key);
// //                             const disabled =
// //                               Boolean(item.required) ||
// //                               (item.key === "room" && !(zonalConfig?.levels || []).includes("floor"));
// //                             return (
// //                               <label
// //                                 key={item.key}
// //                                 className={`hierarchy-level ${checked ? "is-selected is-selected--green" : ""} ${disabled ? "is-disabled" : ""}`}
// //                               >
// //                                 <span className={`hierarchy-level__num ${checked ? "is-selected is-selected--green" : ""}`}>
// //                                   {index + 1}
// //                                 </span>
// //                                 <span className="hierarchy-level__body">
// //                                   <span className="hierarchy-level__title-row">
// //                                     {checked ? zonalLabel(item.key) : item.label}
// //                                     {checked && (
// //                                       <button
// //                                         type="button"
// //                                         title={`Edit ${item.label} heading`}
// //                                         aria-label={`Edit ${item.label} heading`}
// //                                         onClick={(e) => {
// //                                           e.preventDefault();
// //                                           e.stopPropagation();
// //                                           setEditingZonalLabelLevel(
// //                                             editingZonalLabelLevel === item.key ? null : item.key
// //                                           );
// //                                         }}
// //                                       >
// //                                         {/* <FiEdit2 size={12} /> */}
// //                                       </button>
// //                                     )}
// //                                   </span>
// //                                   {checked && editingZonalLabelLevel === item.key && (
// //                                     <input
// //                                       type="text"
// //                                       autoFocus
// //                                       className="hierarchy-level__label-input"
// //                                       value={(zonalConfig?.labels || {})[item.key] ?? ZONAL_LEVEL_DEFAULT_LABELS[item.key] ?? item.label}
// //                                       maxLength={60}
// //                                       onClick={(e) => e.stopPropagation()}
// //                                       onChange={(e) => updateZonalLabel(item.key, e.target.value)}
// //                                       placeholder={`Enter ${item.label} heading`}
// //                                     />
// //                                   )}
// //                                   <span className="hierarchy-level__sub">
// //                                     {item.required ? "Required" : item.hint}
// //                                   </span>
// //                                 </span>
// //                                 <input
// //                                   type="checkbox"
// //                                   className="hierarchy-level__checkbox hierarchy-level__checkbox--green"
// //                                   checked={checked}
// //                                   disabled={disabled}
// //                                   onChange={(e) => updateZonalConfig(item.key, e.target.checked)}
// //                                 />
// //                               </label>
// //                             );
// //                           })}
// //                         </div>
// //                         <p className="hierarchy-levels__note">
// //                           Floor is directly under Branch unless Building is selected. Room is always under Floor.
// //                         </p>
// //                       </section>
// //                     </div>

// //                     {/* Physical hierarchy records */}
// //                     {form.id &&
// //                       (zonalConfig?.levels || []).some((l) => ["building", "floor", "room"].includes(l)) && (
// //                         <section className="physical-section">
// //                           <div className="physical-section__head">
// //                             <div>
// //                               <h4 className="physical-section__title">Physical hierarchy records</h4>
// //                               <p className="physical-section__hint">
// //                                 Add buildings under branches, floors under buildings (or branches), and rooms under floors.
// //                                 New records are saved immediately.
// //                               </p>
// //                             </div>
// //                             <button
// //                               type="button"
// //                               className="btn-secondary"
// //                               onClick={loadPhysicalHierarchy}
// //                               disabled={physicalHierarchyLoading}
// //                             >
// //                               {physicalHierarchyLoading ? "Refreshing..." : "Refresh"}
// //                             </button>
// //                           </div>
// //                           {physicalHierarchyLoading && <p className="physical-loading">Loading physical hierarchy...</p>}
// //                           {physicalHierarchyError && (
// //                             <p role="alert" className="physical-error">{physicalHierarchyError}</p>
// //                           )}
// //                           {!physicalHierarchyLoading && physicalHierarchy.length === 0 && (
// //                             <p className="physical-empty">
// //                               No branches found for this customer yet. Create branches first, then add physical levels here.
// //                             </p>
// //                           )}
// //                           <div className="physical-tree">
// //                             {physicalHierarchy.map((branch) => (
// //                               <div key={branch.id} className="physical-branch">
// //                                 <div className="physical-branch__head">
// //                                   <strong className="physical-branch__title">
// //                                     {branch.name} <span className="physical-branch__tag">(Branch)</span>
// //                                   </strong>
// //                                   <div className="physical-branch__actions">
// //                                     {(zonalConfig?.levels || []).includes("building") && (
// //                                       <button type="button" className="btn-secondary"
// //                                         onClick={() => openPhysicalNodeForm("building", { id: branch.id })}>
// //                                         <FiPlus /> Building
// //                                       </button>
// //                                     )}
// //                                     {!(zonalConfig?.levels || []).includes("building") && (
// //                                       <button type="button" className="btn-secondary"
// //                                         onClick={() => openPhysicalNodeForm("floor", { id: branch.id, type: "branch" })}>
// //                                         <FiPlus /> Floor
// //                                       </button>
// //                                     )}
// //                                   </div>
// //                                 </div>
// //                                 <div className="physical-branch__children">
// //                                   {branch.buildings.map((building) => (
// //                                     <div key={building.id} className="physical-building">
// //                                       <div className="physical-building__head">
// //                                         <strong>
// //                                           {building.name} <span className="physical-building__tag">(Building)</span>
// //                                         </strong>
// //                                         {(zonalConfig?.levels || []).includes("floor") && (
// //                                           <button type="button" className="btn-secondary"
// //                                             onClick={() =>
// //                                               openPhysicalNodeForm("floor", {
// //                                                 id: building.id,
// //                                                 type: "building",
// //                                                 branchId: branch.id,
// //                                               })
// //                                             }
// //                                           >
// //                                             <FiPlus /> Floor
// //                                           </button>
// //                                         )}
// //                                       </div>
// //                                       <div className="physical-building__children">
// //                                         {building.floors.map((floor) => (
// //                                           <div key={floor.id} className="physical-floor">
// //                                             <div className="physical-floor__head">
// //                                               <span>
// //                                                 {floor.name} <span className="physical-floor__tag">(Floor)</span>
// //                                               </span>
// //                                               {(zonalConfig?.levels || []).includes("room") && (
// //                                                 <button type="button" className="btn-secondary"
// //                                                   onClick={() => openPhysicalNodeForm("room", { id: floor.id })}>
// //                                                   <FiPlus /> Room
// //                                                 </button>
// //                                               )}
// //                                             </div>
// //                                             {floor.rooms.map((room) => (
// //                                               <div key={room.id} className="physical-room">
// //                                                 └ {room.name} <span className="physical-room__tag">(Room)</span>
// //                                               </div>
// //                                             ))}
// //                                           </div>
// //                                         ))}
// //                                       </div>
// //                                     </div>
// //                                   ))}
// //                                   {branch.directFloors.map((floor) => (
// //                                     <div key={floor.id} className="physical-floor">
// //                                       <div className="physical-floor__head">
// //                                         <span>
// //                                           {floor.name} <span className="physical-floor__tag">(Floor)</span>
// //                                         </span>
// //                                         {(zonalConfig?.levels || []).includes("room") && (
// //                                           <button type="button" className="btn-secondary"
// //                                             onClick={() => openPhysicalNodeForm("room", { id: floor.id })}>
// //                                             <FiPlus /> Room
// //                                           </button>
// //                                         )}
// //                                       </div>
// //                                       {floor.rooms.map((room) => (
// //                                         <div key={room.id} className="physical-room">
// //                                           └ {room.name} <span className="physical-room__tag">(Room)</span>
// //                                         </div>
// //                                       ))}
// //                                     </div>
// //                                   ))}
// //                                 </div>
// //                               </div>
// //                             ))}
// //                           </div>
// //                         </section>
// //                       )}

// //                     {physicalNodeModal && (
// //                       <div role="dialog" aria-modal="true"
// //                         aria-label={`Add ${physicalNodeModal.type}`}
// //                         className="physical-node-form">
// //                         <form onSubmit={savePhysicalNode}>
// //                           <h4>
// //                             Add {physicalNodeModal.type.charAt(0).toUpperCase() + physicalNodeModal.type.slice(1)}
// //                           </h4>
// //                           <label>
// //                             Name
// //                             <input required maxLength={255}
// //                               value={physicalNodeForm.name}
// //                               onChange={(e) => setPhysicalNodeForm((c) => ({ ...c, name: e.target.value }))}
// //                               placeholder={`Enter ${physicalNodeModal.type} name`} />
// //                           </label>
// //                           <label>
// //                             Code
// //                             <input required maxLength={50}
// //                               value={physicalNodeForm.code}
// //                               onChange={(e) => setPhysicalNodeForm((c) => ({ ...c, code: e.target.value }))}
// //                               placeholder={`Enter unique ${physicalNodeModal.type} code`} />
// //                           </label>
// //                           <div className="physical-node-form__actions">
// //                             <button type="button" className="btn-secondary"
// //                               disabled={savingPhysicalNode}
// //                               onClick={() => setPhysicalNodeModal(null)}>
// //                               Cancel
// //                             </button>
// //                             <button type="submit" className="btn-primary" disabled={savingPhysicalNode}>
// //                               {savingPhysicalNode ? "Saving..." : `Save ${physicalNodeModal.type}`}
// //                             </button>
// //                           </div>
// //                         </form>
// //                       </div>
// //                     )}

// //                     {/* Live preview */}
// //                     <div className="live-preview">
// //                       <div className="live-preview__label">Live preview</div>
// //                       <div className="live-preview__path">
// //                         {["zone", ...(zonalConfig?.levels || []).filter((l) => l !== "zone")].map((level, index, items) => (
// //                           <React.Fragment key={level}>
// //                             <span
// //                               className={`live-preview__chip ${
// //                                 ["building", "floor", "room"].includes(level)
// //                                   ? "live-preview__chip--physical"
// //                                   : ""
// //                               }`}
// //                             >
// //                               {zonalLabel(level)}
// //                             </span>
// //                             {index < items.length - 1 && (
// //                               <span className="live-preview__arrow">→</span>
// //                             )}
// //                           </React.Fragment>
// //                         ))}
// //                       </div>
// //                       <p className="live-preview__hint">
// //                         This is the hierarchy that will be used for this customer when saved.
// //                       </p>
// //                     </div>

// //                     <div className="panel-actions panel-actions--spaced">
// //                       <button type="button" className="btn-secondary"
// //                         disabled={savingZonalConfig}
// //                         onClick={() => {
// //                           setZonalConfig(
// //                             form.zonal_hierarchy_config || {
// //                               version: 1,
// //                               levels: ["zone", "circle", "branch", "floor"],
// //                               labels: { ...ZONAL_LEVEL_DEFAULT_LABELS },
// //                             }
// //                           );
// //                           setIsEditingZonalHierarchy(false);
// //                           setHierarchyError("");
// //                           setView("form");
// //                         }}>
// //                         Cancel
// //                       </button>
// //                       <button type="button" className="btn-primary"
// //                         disabled={savingZonalConfig}
// //                         onClick={saveZonalHierarchyConfig}>
// //                         {savingZonalConfig ? "Saving..." : "Save Hierarchy"}
// //                       </button>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             )}

// //             {hierarchyError && <div className="form-error">{hierarchyError}</div>}

// //             {/* <div className="panel-actions">
// //               <button type="button" className="btn-secondary" onClick={() => setView("form")}>
// //                 Back to Customer
// //               </button>
// //               <button type="button" className="btn-secondary" onClick={backToList}>
// //                 Save and Exit
// //               </button>
// //             </div> */}
// //           </div>
// //         // </div>
// //       )}

// //       {/* ASSIGN SITE */}
// //       {view === "assignSite" && (
// //         <div className="admins-panel">
// //           <div className="admins-panel-header">
// //             <FiMapPin size={22} />
// //             <div>
// //               <h2>Assign Customer to Branch</h2>
// //               <p>Select a customer and one of its Branch to create the assignment.</p>
// //             </div>
// //           </div>

// //           {assignLoading ? (
// //             <div className="admins-loading">Loading customers and branch...</div>
// //           ) : (
// //             <form onSubmit={handleAssignSite} className="admins-form">
// //               <div className="assign-card">
// //                 <div className="form-grid">
// //                   <label>
// //                     Select Customer *
// //                     <select value={assignCustomerId}
// //                       onChange={(e) => {
// //                         setAssignCustomerId(e.target.value);
// //                         setAssignSiteId("");
// //                         setAssignError("");
// //                         setAssignSuccess("");
// //                       }}>
// //                       <option value="">Choose a customer</option>
// //                       {assignCustomers.map((c) => (
// //                         <option key={c.id} value={c.id}>
// //                           {customerNameOf(c)}{c.code ? ` (${c.code})` : ""}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </label>
// //                   <label>
// //                     Select Branch *
// //                     <select value={assignSiteId}
// //                       onChange={(e) => {
// //                         setAssignSiteId(e.target.value);
// //                         setAssignError("");
// //                         setAssignSuccess("");
// //                       }}
// //                       disabled={!assignCustomerId}>
// //                       <option value="">Choose a branch</option>
// //                       {assignSites.map((site) => {
// //                         const siteId = site.tpt_site_id ?? site.id;
// //                         return (
// //                           <option key={String(siteId)} value={String(siteId)}>
// //                             {site.name || "Unnamed site"}{site.code ? ` (${site.code})` : ""}
// //                           </option>
// //                         );
// //                       })}
// //                     </select>
// //                   </label>
// //                 </div>

// //                 {assignCustomerId && (
// //                   <div className="assign-site-summary">
// //                     <h3>Assignment Summary</h3>
// //                     <p>
// //                       <strong>Customer:</strong>{" "}
// //                       {customerNameOf(
// //                         assignCustomers.find((c) => String(c.id) === String(assignCustomerId))
// //                       ) || "-"}
// //                     </p>
// //                     <p>
// //                       <strong>Branch:</strong>{" "}
// //                       {assignSites.find(
// //                         (s) => String(s.tpt_site_id ?? s.id) === String(assignSiteId)
// //                       )?.name || "Not selected"}
// //                     </p>
// //                   </div>
// //                 )}
// //               </div>

// //               {assignError && <div className="form-error">{assignError}</div>}
// //               {assignSuccess && <div className="assign-success" role="status">{assignSuccess}</div>}

// //               <div className="panel-actions">
// //                 <button type="button" className="btn-secondary" onClick={backToList} disabled={assignSaving}>
// //                   Save and Exit
// //                 </button>
// //                 {!assignSuccess && (
// //                   <button type="submit" className="btn-primary"
// //                     disabled={assignSaving || !assignCustomerId || !assignSiteId}>
// //                     {assignSaving ? "Assigning..." : "Assign Site"}
// //                   </button>
// //                 )}
// //                 {assignSuccess && (
// //                   <button type="button" className="btn-primary"
// //                     onClick={async () => { await fetchCustomers(); setView("list"); }}>
// //                     <FiCheckCircle /> Finish
// //                   </button>
// //                 )}
// //               </div>
// //             </form>
// //           )}
// //         </div>
// //       )}

// //       {/* DELETE CONFIRM */}
// //       {confirmDelete && (
// //         <div className="admins-modal-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
// //           <div className="admins-modal admins-modal-small" onClick={(e) => e.stopPropagation()}>
// //             <h2>Delete Customer</h2>
// //             <p>
// //               Are you sure you want to delete <strong>{customerNameOf(confirmDelete)}</strong>?
// //               <br />This cannot be undone.
// //             </p>
// //             <div className="panel-actions">
// //               <button className="btn-secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>
// //                 Cancel
// //               </button>
// //               <button className="btn-danger-solid" onClick={handleDelete} disabled={deleting}>
// //                 {deleting ? "Deleting..." : "Delete"}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* TOAST */}
// //       {toast && (
// //         <div key={toast.id} className={`admins-toast admins-toast-${toast.type}`} role="status">
// //           <span className="admins-toast-icon">{toast.type === "success" ? "✓" : "!"}</span>
// //           <span>{toast.message}</span>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default CustomerCreation;




// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   FiTrash2,
//   FiPlus,
//   FiArrowLeft,
//   FiCheckCircle,
//   FiUserPlus,
//   FiEdit3,
//   FiEdit2,
//   FiMapPin,
// } from "react-icons/fi";

// import "./CustomerCreation.css";
// // import "./AdminCreation.css";

// const API_BASE =
//   import.meta.env.VITE_API_BASE_URL ||
//   `http://${window.location.hostname}:8000/api`;
// const LOCATIONS_URL = `${API_BASE}/v1/filters/locations/`;
// const CUSTOMERS_URL = `${API_BASE}/customers/`;
// const SITES_URL = `${API_BASE}/cloud/sites/?pageSize=1000&page=0`;

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

// const HIERARCHY_OPTIONS = [
//   {
//     value: "GEOGRAPHICAL",
//     label: "Geographical",
//     description: "India → State → District → Taluka → Branch",
//   },
//   {
//     value: "ZONAL",
//     label: "Zonal",
//     description: "India → Zone → Circle → Branch → Floor (editable)",
//   },
// ];

// const HIERARCHY_LABEL = { GEOGRAPHICAL: "Geographical", ZONAL: "Zonal" };
// const CUSTOMER_TYPES = ["Public Sector Bank", "Private Sector Bank"];

// // Keep the geographical classification separate from the customer's Zonal
// // organizational path. This mapping is recalculated whenever the level order changes.
// const buildGeographicalMapping = (levels = []) => {
//   const organizational = levels.filter((level) =>
//     ["zone", "circle", "region", "division", "branch"].includes(level)
//   );
//   let assigned = [];
//   if (organizational.length === 1) assigned = ["STATE"];
//   else if (organizational.length === 2) assigned = ["STATE", "CITY"];
//   else if (organizational.length === 3) assigned = ["STATE", "DISTRICT", "CITY"];
//   else assigned = ["STATE", "DISTRICT", "TALUKA", "CITY"];

//   return Object.fromEntries(
//     organizational.map((level, index) => [level, assigned[index] || null])
//   );
// };

// const withGeographicalMapping = (config = {}) => {
//   const levels = Array.isArray(config.levels) ? config.levels : [];
//   return {
//     ...config,
//     version: 2,
//     geographical_mapping: buildGeographicalMapping(levels),
//   };
// };

// const emptyForm = {
//   id: null,
//   company: "",
//   code: "",
//   company_email: "",
//   contact_person: "",
//   contact_person_email: "",
//   phone: "",
//   password: "",
//   confirm_password: "",
//   hierarchy_type: "",
//   zonal_hierarchy_config: { version: 1, levels: ["zone", "circle", "branch", "floor"] },
//   is_active: true,
//   bank_short_name: "",
//   bank_type: "",
//   website: "",
//   address_line_1: "",
//   state: "",
//   district: "",
//   taluka: "",
//   city: "",
//   pincode: "",
//   designation: "",
//   admin_mobile: "",
// };

// /* ---------------- helpers ---------------- */
// function normalizeList(result) {
//   if (Array.isArray(result)) return result;
//   if (result && Array.isArray(result.data)) return result.data;
//   if (result && Array.isArray(result.results)) return result.results;
//   return [];
// }
// const customerNameOf = (c) => c?.company ?? c?.bank_name ?? c?.name ?? "";
// const customerEmailOf = (c) => c?.company_email ?? c?.email ?? "";

// const getCustomerHierarchyPath = (customer) => {
//   const t = customer?.hierarchy_type;
//   if (t === "GEOGRAPHICAL") return "Geographical";
//   if (t === "ZONAL") {
//     const config = customer?.zonal_hierarchy_config || {};
//     const levels = Array.isArray(config.levels) && config.levels.length
//       ? config.levels
//       : ["zone", "circle", "branch", "floor"];
//     const names = config.level_names || config.display_names || config.levelNames || {};
//     const titleFor = (lvl) =>
//       typeof names[lvl] === "string" && names[lvl].trim()
//         ? names[lvl].trim()
//         : lvl.charAt(0).toUpperCase() + lvl.slice(1);
//     return ["India", ...levels.map(titleFor)].join(" → ");
//   }
//   return "-";
// };

// const getHeadOfficeHierarchy = (customer) => {
//   const t = customer?.hierarchy_type;
//   if (t === "GEOGRAPHICAL") {
//     return ["India", customer?.state, customer?.district, customer?.taluka, customer?.city]
//       .filter(Boolean).join(" → ");
//   }
//   if (t === "ZONAL") {
//     return ["India", customer?.zone, customer?.circle, customer?.region, customer?.division]
//       .filter(Boolean).join(" → ");
//   }
//   return "-";
// };

// const ZONAL_LEVEL_DEFAULT_LABELS = {
//   zone: "Zone", circle: "Circle", region: "Region", division: "Division",
//   branch: "Branch", building: "Building", floor: "Floor", room: "Room",
// };

// function CustomerCreation() {
//   /* ----- state ----- */
//   const [view, setView] = useState("list");
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [form, setForm] = useState(emptyForm);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [selectedHierarchy, setSelectedHierarchy] = useState("");
//   const [hierarchyError, setHierarchyError] = useState("");
//   const [zonalConfig, setZonalConfig] = useState({
//     version: 1,
//     levels: ["zone", "circle", "branch", "floor"],
//     labels: { ...ZONAL_LEVEL_DEFAULT_LABELS },
//   });
//   const [isEditingZonalHierarchy, setIsEditingZonalHierarchy] = useState(false);
//   const [editingZonalLabelLevel, setEditingZonalLabelLevel] = useState(null);
//   const [savingZonalConfig, setSavingZonalConfig] = useState(false);
//   const [confirmDelete, setConfirmDelete] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   const [assignCustomers, setAssignCustomers] = useState([]);
//   const [assignSites, setAssignSites] = useState([]);
//   const [assignCustomerId, setAssignCustomerId] = useState("");
//   const [assignSiteId, setAssignSiteId] = useState("");
//   const [assignLoading, setAssignLoading] = useState(false);
//   const [assignSaving, setAssignSaving] = useState(false);
//   const [assignError, setAssignError] = useState("");
//   const [assignSuccess, setAssignSuccess] = useState("");

//   const [locationTree, setLocationTree] = useState([]);
//   const [locationsLoading, setLocationsLoading] = useState(false);
//   const [locationsError, setLocationsError] = useState("");

//   const [physicalHierarchy, setPhysicalHierarchy] = useState([]);
//   const [physicalHierarchyLoading, setPhysicalHierarchyLoading] = useState(false);
//   const [physicalHierarchyError, setPhysicalHierarchyError] = useState("");
//   const [physicalNodeModal, setPhysicalNodeModal] = useState(null);
//   const [physicalNodeForm, setPhysicalNodeForm] = useState({ name: "", code: "" });
//   const [savingPhysicalNode, setSavingPhysicalNode] = useState(false);

//   const [toast, setToast] = useState(null);
//   const isEditing = Boolean(form.id);

//   /* ----- zonal config ----- */
//   const openHierarchyEditor = () => {
//     setIsEditingZonalHierarchy(true);
//     setHierarchyError("");
//     setView("hierarchy");
//   };

//   const updateZonalConfig = (level, enabled) => {
//     setZonalConfig((current) => {
//       const selected = new Set(current?.levels || ["zone", "circle", "branch", "floor"]);
//       if (["circle", "region", "division"].includes(level)) {
//         if (enabled) selected.add(level);
//         else selected.delete(level);
//         if (level === "region" && !enabled) selected.delete("division");
//       } else if (["building", "room"].includes(level)) {
//         if (enabled) selected.add(level);
//         else selected.delete(level);
//       }
//       selected.add("zone");
//       selected.add("branch");
//       selected.add("floor");
//       if (selected.has("division")) selected.add("region");
//       if (selected.has("room")) selected.add("floor");
//       const order = ["zone", "circle", "region", "division", "branch", "building", "floor", "room"];
//       const nextConfig = {
//         ...current,
//         version: 2,
//         levels: order.filter((i) => selected.has(i)),
//         labels: { ...ZONAL_LEVEL_DEFAULT_LABELS, ...(current?.labels || {}) },
//       };
//       return withGeographicalMapping(nextConfig);
//     });
//   };

//   const updateZonalLabel = (level, value) =>
//     setZonalConfig((c) => ({
//       ...c,
//       labels: { ...ZONAL_LEVEL_DEFAULT_LABELS, ...(c?.labels || {}), [level]: value },
//     }));

//   const zonalLabel = (level) =>
//     (zonalConfig?.labels || {})[level] || ZONAL_LEVEL_DEFAULT_LABELS[level] || level;

//   /* ----- physical hierarchy ----- */
//   const readApiRows = async (url) => {
//     const response = await fetch(url, { headers: authHeaders(), cache: "no-store" });
//     const result = await response.json().catch(() => ({}));
//     if (!response.ok)
//       throw new Error(result.detail || result.message || "Unable to load physical hierarchy.");
//     return Array.isArray(result) ? result : result.results || result.data || [];
//   };

//   const loadPhysicalHierarchy = useCallback(async () => {
//     if (!form.id) { setPhysicalHierarchy([]); return; }
//     setPhysicalHierarchyLoading(true);
//     setPhysicalHierarchyError("");
//     try {
//       const branches = await readApiRows(`${API_BASE}/branches/?customer=${encodeURIComponent(form.id)}`);
//       const tree = await Promise.all(
//         branches.map(async (branch) => {
//           const [buildings, branchFloors] = await Promise.all([
//             readApiRows(`${API_BASE}/buildings/?branch=${encodeURIComponent(branch.id)}`),
//             readApiRows(`${API_BASE}/floors/?branch=${encodeURIComponent(branch.id)}`),
//           ]);
//           const buildingNodes = await Promise.all(
//             buildings.map(async (building) => {
//               const floors = branchFloors.filter(
//                 (f) => String(f.building || "") === String(building.id)
//               );
//               return {
//                 ...building,
//                 floors: await Promise.all(
//                   floors.map(async (floor) => ({
//                     ...floor,
//                     rooms: await readApiRows(`${API_BASE}/rooms/?floor=${encodeURIComponent(floor.id)}`),
//                   }))
//                 ),
//               };
//             })
//           );
//           const directFloors = branchFloors.filter((f) => !f.building);
//           return {
//             ...branch,
//             buildings: buildingNodes,
//             directFloors: await Promise.all(
//               directFloors.map(async (floor) => ({
//                 ...floor,
//                 rooms: await readApiRows(`${API_BASE}/rooms/?floor=${encodeURIComponent(floor.id)}`),
//               }))
//             ),
//           };
//         })
//       );
//       setPhysicalHierarchy(tree);
//     } catch (e) {
//       setPhysicalHierarchyError(e.message || "Unable to load physical hierarchy.");
//     } finally {
//       setPhysicalHierarchyLoading(false);
//     }
//   }, [form.id]);

//   useEffect(() => {
//     if (view === "hierarchy" && selectedHierarchy === "ZONAL" && form.id)
//       loadPhysicalHierarchy();
//   }, [view, selectedHierarchy, form.id, loadPhysicalHierarchy]);

//   const openPhysicalNodeForm = (type, parent) => {
//     setPhysicalNodeForm({ name: "", code: "" });
//     setPhysicalNodeModal({ type, parent });
//     setPhysicalHierarchyError("");
//   };

//   const savePhysicalNode = async (event) => {
//     event.preventDefault();
//     if (!physicalNodeModal || !form.id) return;
//     const { type, parent } = physicalNodeModal;
//     const payload = { name: physicalNodeForm.name.trim(), code: physicalNodeForm.code.trim() };
//     if (!payload.name || !payload.code) return;
//     if (type === "building") payload.branch = parent.id;
//     if (type === "floor") {
//       payload.branch = parent.branchId || parent.id;
//       if (parent.type === "building") payload.building = parent.id;
//     }
//     if (type === "room") payload.floor = parent.id;
//     const endpoint = type === "building" ? "buildings" : type === "floor" ? "floors" : "rooms";
//     setSavingPhysicalNode(true);
//     setPhysicalHierarchyError("");
//     try {
//       const response = await fetch(`${API_BASE}/${endpoint}/`, {
//         method: "POST",
//         headers: authHeaders(),
//         body: JSON.stringify(payload),
//       });
//       const result = await response.json().catch(() => ({}));
//       if (!response.ok)
//         throw new Error(result.detail || result.message || JSON.stringify(result) || `Unable to create ${type}.`);
//       setPhysicalNodeModal(null);
//       setPhysicalNodeForm({ name: "", code: "" });
//       await loadPhysicalHierarchy();
//     } catch (e) {
//       setPhysicalHierarchyError(e.message || `Unable to create ${type}.`);
//     } finally {
//       setSavingPhysicalNode(false);
//     }
//   };

//   const saveZonalHierarchyConfig = async () => {
//     const configToSave = withGeographicalMapping(zonalConfig);
//     const levels = configToSave?.levels || [];
//     if (levels.includes("division") && !levels.includes("region")) {
//       setHierarchyError("Division requires Region."); return;
//     }
//     if (levels.includes("room") && !levels.includes("floor")) {
//       setHierarchyError("Room requires Floor."); return;
//     }
//     const invalidLabel = levels.find(
//       (lvl) => !String(configToSave?.labels?.[lvl] ?? ZONAL_LEVEL_DEFAULT_LABELS[lvl] ?? "").trim()
//     );
//     if (invalidLabel) {
//       setHierarchyError(`Enter a display heading for ${ZONAL_LEVEL_DEFAULT_LABELS[invalidLabel] || invalidLabel}.`);
//       return;
//     }
//     setHierarchyError("");
//     if (!form.id) {
//       setForm((c) => ({ ...c, zonal_hierarchy_config: configToSave }));
//       setIsEditingZonalHierarchy(false);
//       setView("form");
//       return;
//     }
//     try {
//       setSavingZonalConfig(true);
//       const response = await fetch(`${CUSTOMERS_URL}${form.id}/`, {
//         method: "PATCH",
//         headers: authHeaders(),
//         body: JSON.stringify({ zonal_hierarchy_config: configToSave }),
//       });
//       const result = await response.json().catch(() => ({}));
//       if (!response.ok)
//         throw new Error(result.detail || result.message || "Unable to save the hierarchy configuration.");
//       const savedConfig = result.zonal_hierarchy_config || configToSave;
//       setZonalConfig(savedConfig);
//       setForm((c) => ({ ...c, zonal_hierarchy_config: savedConfig }));
//       setIsEditingZonalHierarchy(false);
//       setView("form");
//     } catch (e) {
//       setHierarchyError(e.message || "Unable to save the hierarchy configuration.");
//     } finally {
//       setSavingZonalConfig(false);
//     }
//   };

//   /* ----- branches / customers ----- */
//   const [formSites, setFormSites] = useState([]);
//   const [formSiteId, setFormSiteId] = useState("");
//   const [sitesLoading, setSitesLoading] = useState(false);
//   const [sitesError, setSitesError] = useState("");

//   const loadSites = useCallback(async () => {
//     setSitesLoading(true);
//     setSitesError("");
//     try {
//       const res = await fetch(SITES_URL, { method: "GET", headers: authHeaders(), cache: "no-store" });
//       const body = await res.json().catch(() => ({}));
//       if (!res.ok || body.status === "error" || !Array.isArray(body.sites))
//         throw new Error(body.message || `Could not load branches (${res.status}).`);
//       setFormSites(body.sites);
//     } catch (e) {
//       setSitesError(e.message || "Could not load branches.");
//     } finally {
//       setSitesLoading(false);
//     }
//   }, []);

//   const fetchCustomers = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await fetch(CUSTOMERS_URL, { method: "GET", cache: "no-store", headers: authHeaders() });
//       if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const result = await res.json();
//       setCustomers(normalizeList(result));
//     } catch (err) {
//       setError(err.message || "Unable to load customers.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const openAssignSite = async (customerId = "") => {
//     setView("assignSite");
//     setAssignError("");
//     setAssignSuccess("");
//     setAssignCustomerId(String(customerId || ""));
//     setAssignSiteId("");
//     setAssignLoading(true);
//     try {
//       const [customerResponse, siteResponse] = await Promise.all([
//         fetch(CUSTOMERS_URL, { method: "GET", headers: authHeaders(), cache: "no-store" }),
//         fetch(SITES_URL, { method: "GET", headers: authHeaders(), cache: "no-store" }),
//       ]);
//       if (!customerResponse.ok) throw new Error(`Could not load customers (${customerResponse.status}).`);
//       if (!siteResponse.ok) {
//         const errorBody = await siteResponse.json().catch(() => ({}));
//         throw new Error(errorBody.message || `Could not load 3TP sites (${siteResponse.status}).`);
//       }
//       const customerData = await customerResponse.json();
//       const siteData = await siteResponse.json();
//       if (siteData.status === "error") throw new Error(siteData.message || "Could not load 3TP sites.");
//       if (!Array.isArray(siteData.sites)) throw new Error("Invalid response: expected a sites array.");
//       const loadedCustomers = normalizeList(customerData);
//       setAssignCustomers(loadedCustomers);
//       setAssignSites(siteData.sites);
//       const exists = loadedCustomers.some((c) => String(c.id) === String(customerId));
//       setAssignCustomerId(exists ? String(customerId) : "");
//     } catch (err) {
//       setAssignCustomers([]);
//       setAssignSites([]);
//       setAssignError(err.message || "Could not load assignment data.");
//     } finally {
//       setAssignLoading(false);
//     }
//   };

//   const handleAssignSite = async (e) => {
//     e.preventDefault();
//     setAssignError("");
//     setAssignSuccess("");
//     const payload = {
//       customer_id: String(assignCustomerId || "").trim(),
//       tpt_site_id: String(assignSiteId || "").trim(),
//     };
//     if (!payload.customer_id || !payload.tpt_site_id) {
//       setAssignError("Please select both a customer and a site."); return;
//     }
//     setAssignSaving(true);
//     try {
//       const response = await fetch(`${API_BASE}/customers/assign/site/`, {
//         method: "POST",
//         headers: authHeaders(),
//         body: JSON.stringify(payload),
//       });
//       const result = await response.json().catch(() => ({}));
//       if (!response.ok)
//         throw new Error(result.message || result.details || `Assignment failed (${response.status}).`);
//       setAssignSuccess(result.message || "Customer assigned to site successfully.");
//       setAssignSiteId("");
//     } catch (err) {
//       setAssignError(err.message || "Could not assign customer to site.");
//     } finally {
//       setAssignSaving(false);
//     }
//   };

//   useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

//   useEffect(() => {
//     let cancelled = false;
//     const fetchLocationTree = async () => {
//       setLocationsLoading(true);
//       setLocationsError("");
//       try {
//         const response = await fetch(`${LOCATIONS_URL}?hierarchy=GEOGRAPHICAL`, {
//           method: "GET",
//           headers: { Accept: "application/json", ...authHeaders() },
//           cache: "no-store",
//         });
//         if (!response.ok) throw new Error(`Unable to load locations (${response.status})`);
//         const result = await response.json();
//         if (!cancelled) setLocationTree(Array.isArray(result?.data) ? result.data : []);
//       } catch (err) {
//         if (!cancelled) setLocationsError(err.message);
//       } finally {
//         if (!cancelled) setLocationsLoading(false);
//       }
//     };
//     fetchLocationTree();
//     return () => { cancelled = true; };
//   }, []);

//   const headOfficeOptions = useMemo(() => {
//     const india = locationTree.find(
//       (item) => String(item?.country_name || "").toLowerCase() === "india"
//     );
//     const states = india?.states || [];
//     const selectedState = states.find((i) => i.state_name === form.state);
//     const districts = selectedState?.districts || [];
//     const selectedDistrict = districts.find((i) => i.district_name === form.district);
//     const talukas = selectedDistrict?.talukas || [];
//     return {
//       states: states.map((i) => i.state_name).filter(Boolean),
//       districts: districts.map((i) => i.district_name).filter(Boolean),
//       talukas: talukas.map((i) => i.taluka_name).filter(Boolean),
//     };
//   }, [locationTree, form.state, form.district]);

//   const filteredCustomers = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return customers;
//     return customers.filter((c) => {
//       const fields = [
//         customerNameOf(c), c.code, customerEmailOf(c), c.contact_person, c.phone,
//         c.hierarchy_type, c.bank_short_name, c.bank_type,
//       ];
//       return fields.filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
//     });
//   }, [customers, search]);

//   /* ----- create / edit / back ----- */
//   const goToCreate = () => {
//     setForm({ ...emptyForm });
//     setFormSiteId("");
//     loadSites();
//     setSelectedHierarchy("");
//     setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
//     setIsEditingZonalHierarchy(false);
//     setFormError("");
//     setHierarchyError("");
//     setView("form");
//   };

//   const openEditPanel = (customer) => {
//     const hierarchy = customer.hierarchy_type || "";
//     setForm({
//       ...emptyForm,
//       id: customer.id,
//       company: customer.company ?? customer.bank_name ?? customer.name ?? "",
//       code: customer.code || "",
//       company_email: customer.company_email ?? customer.email ?? "",
//       contact_person: customer.contact_person || "",
//       contact_person_email: customer.contact_person_email || "",
//       phone: customer.phone || "",
//       hierarchy_type: hierarchy,
//       zonal_hierarchy_config:
//         customer.zonal_hierarchy_config || { version: 1, levels: ["zone", "circle", "branch", "floor"] },
//       is_active: customer.is_active ?? true,
//       bank_short_name: customer.bank_short_name || "",
//       bank_type: customer.bank_type || "",
//       website: customer.website || "",
//       address_line_1: customer.address_line_1 || "",
//       state: customer.state || "",
//       district: customer.district || "",
//       taluka: customer.taluka || "",
//       city: customer.city || "",
//       pincode: customer.pincode || "",
//       designation: customer.designation || "",
//       admin_mobile: customer.admin_mobile || customer.phone || "",
//       password: "",
//       confirm_password: "",
//     });
//     setSelectedHierarchy(hierarchy);
//     setZonalConfig(withGeographicalMapping(
//       customer.zonal_hierarchy_config || { version: 2, levels: ["zone", "circle", "branch", "floor"] }
//     ));
//     setIsEditingZonalHierarchy(false);
//     setFormError("");
//     setHierarchyError("");
//     setView("form");
//   };

//   const backToList = () => {
//     setView("list");
//     setForm({ ...emptyForm });
//     setFormSiteId("");
//     setSelectedHierarchy("");
//     setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
//     setIsEditingZonalHierarchy(false);
//     setFormError("");
//     setHierarchyError("");
//   };

//   const handleFieldChange = (field, value) =>
//     setForm((prev) => ({ ...prev, [field]: value }));

//   const handleHierarchyChange = (value) => {
//     setSelectedHierarchy(value);
//     setForm((prev) => ({ ...prev, hierarchy_type: value }));
//     if (value === "ZONAL")
//       setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
//     setHierarchyError("");
//   };

//   const validateForm = () => {
//     if (!form.company.trim()) return "Customer name is required.";
//     if (!form.code.trim()) return "Customer code is required.";
//     if (!form.bank_short_name.trim()) return "Short name is required.";
//     if (!form.bank_type) return "Customer type is required.";
//     if (!form.company_email.trim()) return "Customer email is required.";
//     if (!form.phone.trim()) return "Customer phone number is required.";
//     if (!form.contact_person.trim()) return "Contact person name is required.";
//     if (!form.contact_person_email.trim()) return "Contact person email is required.";
//     if (!form.admin_mobile.trim()) return "Contact person mobile is required.";
//     if (!form.state) return "Please select a state.";
//     if (!form.district) return "Please select a district.";
//     if (!form.taluka) return "Please select a taluka.";
//     if (!isEditing) {
//       if (!form.password.trim()) return "Password is required.";
//       if (!form.confirm_password.trim()) return "Confirm password is required.";
//       if (form.password !== form.confirm_password)
//         return "Password and confirm password do not match.";
//     }
//     if (form.password.trim() && form.password !== form.confirm_password)
//       return "Password and confirm password do not match.";
//     if (!selectedHierarchy) return "Please select a location hierarchy.";
//     if (form.pincode && !/^\d{6}$/.test(form.pincode.trim()))
//       return "PIN code must contain exactly 6 digits.";
//     if (form.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.company_email.trim()))
//       return "Please enter a valid customer email.";
//     if (form.contact_person_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_person_email.trim()))
//       return "Please enter a valid contact person email.";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setFormError("");
//     const validationError = validateForm();
//     if (validationError) { setFormError(validationError); return; }
//     const payload = {
//       company: form.company.trim(),
//       code: form.code.trim(),
//       company_email: form.company_email.trim(),
//       contact_person: form.contact_person.trim(),
//       contact_person_email: form.contact_person_email.trim(),
//       phone: form.admin_mobile.trim() || form.phone.trim(),
//       hierarchy_type: selectedHierarchy || form.hierarchy_type,
//       zonal_hierarchy_config:
//         (selectedHierarchy || form.hierarchy_type) === "ZONAL"
//           ? withGeographicalMapping(zonalConfig)
//           : { version: 1, levels: ["zone", "circle", "branch", "floor"] },
//       is_active: form.is_active,
//       state: form.state.trim(),
//       district: form.district.trim(),
//       taluka: form.taluka,
//       city: form.city.trim(),
//       pincode: form.pincode.trim(),
//     };
//     if (form.password.trim()) payload.password = form.password.trim();
//     setSaving(true);
//     try {
//       const url = isEditing ? `${CUSTOMERS_URL}${form.id}/` : CUSTOMERS_URL;
//       const method = isEditing ? "PATCH" : "POST";
//       const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
//       if (!res.ok) {
//         const errBody = await res.json().catch(() => ({}));
//         const message = typeof errBody === "object" && errBody !== null
//           ? Object.entries(errBody)
//               .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
//               .join(" | ")
//           : `HTTP ${res.status}`;
//         throw new Error(message || `HTTP ${res.status}`);
//       }
//       const saved = await res.json();
//       await fetchCustomers();
//       if (!isEditing) {
//         const assignRes = await fetch(`${API_BASE}/customers/assign/site/`, {
//           method: "POST",
//           headers: authHeaders(),
//           body: JSON.stringify({ customer_id: String(saved.id), tpt_site_id: String(formSiteId) }),
//         });
//         const assignBody = await assignRes.json().catch(() => ({}));
//         // if (!assignRes.ok) {
//         //   setForm((prev) => ({ ...prev, id: saved.id }));
//         //   setFormError("");
//         //   setView("hierarchy");
//         //   showToast(
//         //     "error",
//         //     `Customer created, but branch assignment failed: ${
//         //       assignBody.message || assignBody.details || assignRes.status
//         //     }. Use the pin icon in the customer list to retry.`
//         //   );
//         //   return;
//         // }
//       }
//       if (isEditing) {
//         backToList();
//         showToast("success", "Customer updated successfully.");
//         return;
//       }
//       setForm((prev) => ({ ...prev, id: saved.id }));
//       setFormError("");
//       setView("hierarchy");
//       showToast("success", "Customer created successfully.");
//     } catch (err) {
//       const msg = err.message || "Could not save customer.";
//       setFormError(msg);
//       showToast("error", msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirmDelete || deleting) return;
//     const name = customerNameOf(confirmDelete) || confirmDelete.code || "Customer";
//     setDeleting(true);
//     try {
//       const res = await fetch(`${CUSTOMERS_URL}${confirmDelete.id}/`, {
//         method: "DELETE",
//         headers: authHeaders(),
//       });
//       if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
//       setCustomers((prev) => prev.filter((c) => c.id !== confirmDelete.id));
//       setConfirmDelete(null);
//       showToast("success", `${name} deleted successfully.`);
//     } catch (err) {
//       const msg = err.message || "Could not delete customer.";
//       setError(msg);
//       setConfirmDelete(null);
//       showToast("error", msg);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const hierarchyName = HIERARCHY_LABEL[selectedHierarchy] || "-";

//   const showToast = useCallback((type, message) => {
//     setToast({ type, message, id: Date.now() });
//   }, []);

//   useEffect(() => {
//     if (!toast) return;
//     const t = setTimeout(() => setToast(null), 3000);
//     return () => clearTimeout(t);
//   }, [toast]);

//     /* =====================================================
//      INLINE ACTION BUTTON STYLES (MATCHING ADMIN CREATION)
//   ===================================================== */
//   const iconBtnStyle = {
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     width: 30,
//     height: 30,
//     padding: 0,
//     borderRadius: 6,
//     border: "1px solid #e5e7eb",
//     background: "#fff",
//     cursor: "pointer",
//     marginLeft: 6,
//     transition: "background .15s, border-color .15s",
//   };

//   const editBtnStyle = { ...iconBtnStyle, color: "#2563eb" };
//   const deleteBtnStyle = { ...iconBtnStyle, color: "#dc2626" };
//   const assignBtnStyle = { ...iconBtnStyle, color: "#16a34a" }; // Matches the green branch pin in Admin

//   return (
//     <div className="admins-page">
//       {/* STEPPER */}
//       <ol className="admins-stepper">
//         <li className={view === "list" ? "active" : "done"}>
//           <button type="button" className="step-btn" onClick={backToList}>
//             <span className="step-num">1</span> Customers
//           </button>
//         </li>
//         <li className={view === "form" ? "active" : view === "hierarchy" ? "done" : ""}>
//           <button type="button" className="step-btn" onClick={goToCreate}>
//             <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
//           </button>
//         </li>
//         {/* <li className={view === "hierarchy" ? "active" : ""}>
//           <button
//             type="button"
//             className="step-btn"
//             disabled={!selectedHierarchy}
//             onClick={() => {
//               if (!selectedHierarchy) return;
//               setIsEditingZonalHierarchy(true);
//               setView("hierarchy");
//               if (selectedHierarchy === "ZONAL" && form.id) loadPhysicalHierarchy();
//             }}
//           >
//             <span className="step-num">3</span> Hierarchy
//           </button>
//         </li> */}
//       </ol>

//       {/* LIST */}
//       {view === "list" && (
//         <>
//           <div className="admins-header">
//             <div>
//               <h1>Customers</h1>
//               <p>Register and manage customers under your organization.</p>
//             </div>
//           </div>
//           <div className="admins-toolbar">
//             <input
//               type="text"
//               className="admins-search"
//               placeholder="Search by customer name, code, email, phone or hierarchy..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//             <span className="admins-count">
//               {filteredCustomers.length} of {customers.length} customers
//             </span>
//           </div>
//           {error && <div className="admins-error">{error}</div>}
//           <div className="admins-table-card" style={{ overflowX: "auto" }}>
//             {loading ? (
//               <div className="admins-loading">Loading Customers...</div>
//             ) : filteredCustomers.length === 0 ? (
//               <div className="admins-empty">
//                 {customers.length === 0
//                   ? "No customers registered yet. Click “Create Customer” to create one."
//                   : "No customers match your search."}
//               </div>
//             ) : (
//               <table className="admins-table" style={{ minWidth: "1100px" }}>
//                 <thead>
//                   <tr>
//                     <th>Customer</th>
//                     <th>Code</th>
//                     <th>Email</th>
//                     <th>Contact</th>
//                     <th>Phone</th>
//                     <th>Hierarchy</th>
//                     {/* <th>Head Office</th> */}
//                     <th>Status</th>
//                     <th className="actions-col">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredCustomers.map((customer) => (
//                     <tr key={customer.id}>
//                       <td>
//                         <strong>{customerNameOf(customer)}</strong>
//                         {customer.bank_short_name && (
//                           <small className="customer-name-sub">{customer.bank_short_name}</small>
//                         )}
//                       </td>
//                       <td>{customer.code || "-"}</td>
//                       <td>{customerEmailOf(customer) || "-"}</td>
//                       <td>{customer.contact_person || "-"}</td>
//                       <td>{customer.phone || "-"}</td>
//                       <td className="customer-hierarchy-path">{getCustomerHierarchyPath(customer)}</td>
//                       {/* <td className="head-office-hierarchy">{getHeadOfficeHierarchy(customer)}</td> */}
//                       <td>
//                         <span className={customer.is_active ? "status-active" : "status-inactive"}>
//                           {customer.is_active ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td className="actions-col">
//                         <div
//                           style={{
//                             alignItems: "center",
//                             flexWrap: "wrap",
//                             gap: 6,
//                           }}
//                         >
//                           {/* ASSIGN SITE */}
//                           <button
//                             type="button"
//                             title="Assign Site"
//                             aria-label={`Assign site to ${customerNameOf(customer)}`}
//                             style={assignBtnStyle}
//                             onClick={() => openAssignSite(customer.id)}
//                           >
//                             <FiMapPin size={16} />
//                           </button>

//                           {/* EDIT */}
//                           <button
//                             type="button"
//                             title="Edit"
//                             aria-label="Edit"
//                             style={editBtnStyle}
//                             onClick={() => openEditPanel(customer)}
//                           >
//                             <FiEdit2 size={16} />
//                           </button>

//                           {/* DELETE */}
//                           <button
//                             type="button"
//                             title="Delete"
//                             aria-label="Delete"
//                             style={deleteBtnStyle}
//                             onClick={() => setConfirmDelete(customer)}
//                           >
//                             <FiTrash2 size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           <div className="admins-table-card" style={{ overflowX: "auto" }}>
//   {loading ? (
//     <div className="admins-loading">Loading Customers...</div>
//   ) : filteredCustomers.length === 0 ? (
//     <div className="admins-empty">
//       {customers.length === 0
//         ? "No customers registered yet. Click “Create Customer” to create one."
//         : "No customers match your search."}
//     </div>
//   ) : (
//     <table className="admins-table" style={{ minWidth: "1100px" }}>
//       {/* ... table content ... */}
//     </table>
//   )}
// </div>

//         </>
//       )}

//       {/* FORM */}
//       {view === "form" && (
//         <div className="admins-panel">
//           <div className="admins-panel-header">
//             {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
//             <div>
//               <h2>{isEditing ? "Edit Customer" : "Register New Customer"}</h2>
//               <p>
//                 {isEditing
//                   ? `Update details for ${form.company || form.code}.`
//                   : "Register a new customer and configure their portal access and location hierarchy."}
//               </p>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="admins-form">
//             {/* Customer info */}
//             <div className="assign-card">
//               <div className="assign-row">
//                 <span className="assign-label">Customer Information</span>
//               </div>
//               <div className="form-grid form-grid--spaced">
//                 <label>
//                   Name *
//                   <input type="text" value={form.company}
//                     onChange={(e) => handleFieldChange("company", e.target.value)}
//                     placeholder="HDFC Bank" />
//                 </label>
//                 <label>
//                   Code *
//                   <input type="text" value={form.code}
//                     onChange={(e) => handleFieldChange("code", e.target.value.toUpperCase())}
//                     placeholder="HDFC001" />
//                 </label>
//                 <label>
//                   Short Name *
//                   <input type="text" value={form.bank_short_name}
//                     onChange={(e) => handleFieldChange("bank_short_name", e.target.value.toUpperCase())}
//                     placeholder="HDFC" />
//                 </label>
//                 <label>
//                   Type *
//                   <select value={form.bank_type}
//                     onChange={(e) => handleFieldChange("bank_type", e.target.value)}>
//                     <option value="">Select Customer Type</option>
//                     {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
//                   </select>
//                 </label>
//                 <label>
//                   Email *
//                   <input type="email" value={form.company_email}
//                     onChange={(e) => handleFieldChange("company_email", e.target.value)}
//                     placeholder="admin@bank.com" />
//                 </label>
//                 <label>
//                   Phone *
//                   <input type="tel" value={form.phone}
//                     onChange={(e) => handleFieldChange("phone", e.target.value)}
//                     placeholder="+91 22 XXXXXXXX" />
//                 </label>
//                 <label>
//                   Website
//                   <input type="url" value={form.website}
//                     onChange={(e) => handleFieldChange("website", e.target.value)}
//                     placeholder="https://www.bank.com" />
//                 </label>
//               </div>
//             </div>

//             {/* Head office */}
//             <div className="assign-card assign-card--spaced">
//               <div className="assign-row">
//                 <span className="assign-label">Head Office Details</span>
//               </div>
//               <div className="form-grid form-grid--spaced">
//                 <label className="form-grid__full">
//                   Address Line 1 *
//                   <input type="text" value={form.address_line_1}
//                     onChange={(e) => handleFieldChange("address_line_1", e.target.value)}
//                     placeholder="Building / Street / Area" />
//                 </label>
//                 <label>
//                   State *
//                   <select value={form.state} required disabled={locationsLoading}
//                     onChange={(e) => setForm((p) => ({ ...p, state: e.target.value, district: "", taluka: "", city: "" }))}>
//                     <option value="">{locationsLoading ? "Loading states..." : "Select State"}</option>
//                     {headOfficeOptions.states.map((s) => <option key={s} value={s}>{s}</option>)}
//                   </select>
//                 </label>
//                 <label>
//                   District *
//                   <select value={form.district} required disabled={!form.state || locationsLoading}
//                     onChange={(e) => setForm((p) => ({ ...p, district: e.target.value, taluka: "", city: "" }))}>
//                     <option value="">Select District</option>
//                     {headOfficeOptions.districts.map((d) => <option key={d} value={d}>{d}</option>)}
//                   </select>
//                 </label>
//                 <label>
//                   Taluka *
//                   <select value={form.taluka} required disabled={!form.district || locationsLoading}
//                     onChange={(e) => setForm((p) => ({ ...p, taluka: e.target.value, city: "" }))}>
//                     <option value="">Select Taluka</option>
//                     {headOfficeOptions.talukas.map((t) => <option key={t} value={t}>{t}</option>)}
//                   </select>
//                 </label>
//                 {locationsError && <p className="form-error">{locationsError}</p>}
//                 <label>
//                   PIN Code
//                   <input type="text" maxLength={6} value={form.pincode}
//                     onChange={(e) => handleFieldChange("pincode", e.target.value.replace(/\D/g, ""))}
//                     placeholder="411001" />
//                 </label>
//               </div>
//             </div>

//             {/* Contact person */}
//             <div className="assign-card assign-card--spaced">
//               <div className="assign-row">
//                 <span className="assign-label">Contact Person Details</span>
//               </div>
//               <div className="form-grid form-grid--spaced">
//                 <label>
//                   Name *
//                   <input type="text" value={form.contact_person}
//                     onChange={(e) => handleFieldChange("contact_person", e.target.value)}
//                     placeholder="Rahul Sharma" />
//                 </label>
//                 <label>
//                   Email *
//                   <input type="email" value={form.contact_person_email}
//                     onChange={(e) => handleFieldChange("contact_person_email", e.target.value)}
//                     placeholder="admin@bank.com" />
//                   <small className="field-hint">This email will be used for portal login.</small>
//                 </label>
//                 <label>
//                   Mobile *
//                   <input type="tel" value={form.admin_mobile}
//                     onChange={(e) => handleFieldChange("admin_mobile", e.target.value)}
//                     placeholder="+91 00000 00000" />
//                 </label>
//                 <label>
//                   {isEditing ? "Login Password (leave blank to keep current)" : "Login Password *"}
//                   <input type="password" value={form.password}
//                     onChange={(e) => handleFieldChange("password", e.target.value)}
//                     placeholder={isEditing ? "••••••••" : "Set a password"}
//                     required={!isEditing} autoComplete="new-password" />
//                 </label>
//                 <label>
//                   {isEditing ? "Confirm New Password" : "Confirm Password *"}
//                   <input type="password" value={form.confirm_password}
//                     onChange={(e) => handleFieldChange("confirm_password", e.target.value)}
//                     placeholder="Confirm password"
//                     required={!isEditing || Boolean(form.password)}
//                     autoComplete="new-password" />
//                 </label>
//               </div>
//             </div>

//             {/* Hierarchy selector */}
//             <div className="assign-card assign-card--spaced">
//               <div className="assign-row">
//                 <span className="assign-label">Location Hierarchy *</span>
//               </div>
//               <div className="hierarchy-options-grid">
//                 {HIERARCHY_OPTIONS.map((option) => {
//                   const selected = selectedHierarchy === option.value;
//                   return (
//                     <div
//                       key={option.value}
//                       className={`hierarchy-option ${selected ? "is-selected" : ""} ${isEditing ? "is-fixed" : ""}`}
//                     >
//                       <label className="hierarchy-option__inner">
//                         <input
//                           type="radio"
//                           name="hierarchy_type"
//                           value={option.value}
//                           checked={selected}
//                           disabled={isEditing}
//                           onChange={(e) => handleHierarchyChange(e.target.value)}
//                         />
//                         <div>
//                           <div className="hierarchy-option__label">{option.label}</div>
//                           {/* <div className="hierarchy-option__desc">{option.description}</div> */}
//                           <div className="hierarchy-option__desc">
//                             {option.value === "ZONAL"
//                               ? `India → ${[
//                                   "zone",
//                                   ...(zonalConfig?.levels || ["circle", "branch", "floor"]).filter(
//                                     (level) => level !== "zone"
//                                   ),
//                                 ]
//                                   .map(zonalLabel)
//                                   .join(" → ")} (editable)`
//                               : option.description}
//                           </div>
//                         </div>
//                       </label>
//                       {option.value === "ZONAL" && selected && !isEditing && (
//                         <button
//                           type="button"
//                           className="btn-secondary hierarchy-option__edit"
//                           title="Edit the hierarchy before saving this customer"
//                           onClick={openHierarchyEditor}
//                         >
//                           Edit Hierarchy
//                         </button>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               {isEditing && (
//                 <p className="hierarchy-note">
//                   The hierarchy type remains fixed for an existing customer. You can edit its Zonal levels in step 3: Hierarchy.
//                 </p>
//               )}
//               {selectedHierarchy === "GEOGRAPHICAL" && (
//                 <p className="hierarchy-note hierarchy-note--tight">
//                   <strong>Geographical hierarchy is fixed and cannot be customized.</strong>
//                 </p>
//               )}
//               {selectedHierarchy === "ZONAL" && (
//                 <p className="hierarchy-note hierarchy-note--tight">
//                   <strong>Zonal hierarchy can be customized according to the user's needs.</strong>
//                 </p>
//               )}
//             </div>

//             <div className="assign-card--spaced">
//               <label className="checkbox-row">
//                 <input
//                   type="checkbox"
//                   checked={form.is_active}
//                   onChange={(e) => handleFieldChange("is_active", e.target.checked)}
//                 />
//                 Active
//               </label>
//             </div>

//             {formError && <div className="form-error">{formError}</div>}

//             <div className="panel-actions">
//               <button type="button" className="btn-secondary" onClick={backToList} disabled={saving}>
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="btn-primary"
//                 disabled={saving}
//               >
//                 {saving ? "Saving..." : isEditing ? "Save Changes" : "Register & Continue"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* HIERARCHY STEP (Step 3) - rendered as a normal page, not a popup */}
//       {view === "hierarchy" && (
//         // <div className="hierarchy-step-page">
//           <div className="admins-panel hierarchy-step-panel">
//             <button className="btn-back" onClick={() => setView("form")}>
//               <FiArrowLeft /> Back to customer
//             </button>

//             {/* <div className="admins-panel-header hierarchy-modal__header">
//               <FiMapPin size={22} />
//               <div>
//                 <h2>Configure Hierarchy</h2>
//                 <p>Configure the location structure for <strong>{form.company}</strong></p>
//               </div>
//             </div>

//             <div className="assign-card">
//               <div className="assign-row">
//                 <span className="assign-label">Customer</span>
//                 <span className="assign-value">{form.company || "-"}</span>
//               </div>
//               <div className="assign-row">
//                 <span className="assign-label">Code</span>
//                 <span className="assign-value">{form.code || "-"}</span>
//               </div>
//               <div className="assign-row">
//                 <span className="assign-label">Type</span>
//                 <span className="assign-value">{form.bank_type || "-"}</span>
//               </div>
//               <div className="assign-row">
//                 <span className="assign-label">Hierarchy</span>
//                 <span className="assign-value">{hierarchyName}</span>
//               </div>
//             </div> */}

//             {selectedHierarchy === "GEOGRAPHICAL" && (
//               <div className="assign-card hierarchy-card--tight">
//                 {/* <h3 style={{ marginTop: 0 }}>Geographical Hierarchy</h3> */}
//                 <div className="hierarchy-info-box">
//                   <div className="hierarchy-info-box__title">India</div>
//                   <div className="hierarchy-info-box__path">
//                     India → State → District → Taluka → Branch
//                   </div>
//                   <div className="hierarchy-info-box__divider">
//                     <strong>Branch can contain:</strong>
//                     <ul className="hierarchy-info-box__list">
//                       <li>Multiple Floors</li>
//                       <li>Direct AC units</li>
//                       <li>Both Floors and Direct AC units</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {selectedHierarchy === "ZONAL" && (
//               <div className="assign-card assign-card--spaced">
//                 {/* <h3 style={{ marginTop: 0 }}>Zonal Hierarchy</h3> */}

//                 {!isEditingZonalHierarchy ? (
//                   <>
//                     <div className="zonal-readonly">
//                       <strong>India</strong>
//                       <div className="zonal-readonly__path">
//                         {`India → ${(zonalConfig?.levels || ["zone", "circle", "branch", "floor"])
//                           .map(zonalLabel)
//                           .join(" → ")}`}
//                       </div>
//                     </div>
//                     <div className="panel-actions zonal-actions">
//                       <button type="button" className="btn-primary" onClick={() => setIsEditingZonalHierarchy(true)}>
//                         Edit Hierarchy
//                       </button>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="zonal-editor">
//                     <p className="zonal-editor__intro">
//                       Build the customer's location path by selecting the levels it uses. Required levels cannot be removed.
//                     </p>

//                     <div className="zonal-editor__grid">
//                       {/* Administrative path */}
//                       <section className="hierarchy-section">
//                         <div className="hierarchy-section__head">
//                           <div className="hierarchy-section__part">Part 1</div>
//                           <h4 className="hierarchy-section__title">Administrative hierarchy</h4>
//                           <p className="hierarchy-section__hint">Choose the path from Zone to Branch.</p>
//                         </div>
//                         <div className="hierarchy-levels">
//                           <div className="hierarchy-levels__line" />
//                           {[
//                             { key: "zone", label: "Zone", required: true, hint: "Top administrative level" },
//                             { key: "circle", label: "Circle", hint: "Optional administrative level" },
//                             { key: "region", label: "Region", hint: "Optional administrative level" },
//                             { key: "division", label: "Division", hint: "Available when Region is selected" },
//                             { key: "branch", label: "Branch", required: true, hint: "Branch location" },
//                           ].map((item, index) => {
//                             const checked = (zonalConfig?.levels || []).includes(item.key);
//                             const disabled =
//                               Boolean(item.required) ||
//                               (item.key === "division" && !(zonalConfig?.levels || []).includes("region"));
//                             return (
//                               <label
//                                 key={item.key}
//                                 className={`hierarchy-level ${checked ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}
//                               >
//                                 <span className={`hierarchy-level__num ${checked ? "is-selected" : ""}`}>
//                                   {index + 1}
//                                 </span>
//                                 <span className="hierarchy-level__body">
//                                   <span className="hierarchy-level__title-row">
//                                     {checked ? zonalLabel(item.key) : item.label}
//                                     {checked && (
//                                       <button
//                                         type="button"
//                                         title={`Edit ${item.label} heading`}
//                                         aria-label={`Edit ${item.label} heading`}
//                                         onClick={(e) => {
//                                           e.preventDefault();
//                                           e.stopPropagation();
//                                           setEditingZonalLabelLevel(
//                                             editingZonalLabelLevel === item.key ? null : item.key
//                                           );
//                                         }}
//                                       >
//                                         {/* <FiEdit2 size={12} /> */}
//                                       </button>
//                                     )}
//                                   </span>
//                                   {checked && editingZonalLabelLevel === item.key && (
//                                     <input
//                                       type="text"
//                                       autoFocus
//                                       className="hierarchy-level__label-input"
//                                       value={(zonalConfig?.labels || {})[item.key] ?? ZONAL_LEVEL_DEFAULT_LABELS[item.key] ?? item.label}
//                                       maxLength={60}
//                                       onClick={(e) => e.stopPropagation()}
//                                       onChange={(e) => updateZonalLabel(item.key, e.target.value)}
//                                       placeholder={`Enter ${item.label} heading`}
//                                     />
//                                   )}
//                                   <span className="hierarchy-level__sub">
//                                     {item.required ? "Required" : item.hint}
//                                   </span>
//                                 </span>
//                                 <input
//                                   type="checkbox"
//                                   className="hierarchy-level__checkbox"
//                                   checked={checked}
//                                   disabled={disabled}
//                                   onChange={(e) => updateZonalConfig(item.key, e.target.checked)}
//                                 />
//                               </label>
//                             );
//                           })}
//                         </div>
//                         <p className="hierarchy-levels__note">
//                           You can connect Zone directly to Branch, or include Circle and/or Region. Division requires Region.
//                         </p>
//                       </section>

//                       {/* Physical path */}
//                       <section className="hierarchy-section">
//                         <div className="hierarchy-section__head">
//                           <div className="hierarchy-section__part">Part 2</div>
//                           <h4 className="hierarchy-section__title">Physical hierarchy</h4>
//                           <p className="hierarchy-section__hint">Choose how locations are organized after Branch.</p>
//                         </div>
//                         <div className="hierarchy-levels">
//                           <div className="hierarchy-levels__line hierarchy-levels__line--green" />
//                           {[
//                             { key: "building", label: "Building", hint: "Optional; for multiple buildings" },
//                             { key: "floor", label: "Floor", required: true, hint: "Required physical level" },
//                             { key: "room", label: "Room", hint: "Optional; requires Floor" },
//                           ].map((item, index) => {
//                             const checked = (zonalConfig?.levels || []).includes(item.key);
//                             const disabled =
//                               Boolean(item.required) ||
//                               (item.key === "room" && !(zonalConfig?.levels || []).includes("floor"));
//                             return (
//                               <label
//                                 key={item.key}
//                                 className={`hierarchy-level ${checked ? "is-selected is-selected--green" : ""} ${disabled ? "is-disabled" : ""}`}
//                               >
//                                 <span className={`hierarchy-level__num ${checked ? "is-selected is-selected--green" : ""}`}>
//                                   {index + 1}
//                                 </span>
//                                 <span className="hierarchy-level__body">
//                                   <span className="hierarchy-level__title-row">
//                                     {checked ? zonalLabel(item.key) : item.label}
//                                     {checked && (
//                                       <button
//                                         type="button"
//                                         title={`Edit ${item.label} heading`}
//                                         aria-label={`Edit ${item.label} heading`}
//                                         onClick={(e) => {
//                                           e.preventDefault();
//                                           e.stopPropagation();
//                                           setEditingZonalLabelLevel(
//                                             editingZonalLabelLevel === item.key ? null : item.key
//                                           );
//                                         }}
//                                       >
//                                         {/* <FiEdit2 size={12} /> */}
//                                       </button>
//                                     )}
//                                   </span>
//                                   {checked && editingZonalLabelLevel === item.key && (
//                                     <input
//                                       type="text"
//                                       autoFocus
//                                       className="hierarchy-level__label-input"
//                                       value={(zonalConfig?.labels || {})[item.key] ?? ZONAL_LEVEL_DEFAULT_LABELS[item.key] ?? item.label}
//                                       maxLength={60}
//                                       onClick={(e) => e.stopPropagation()}
//                                       onChange={(e) => updateZonalLabel(item.key, e.target.value)}
//                                       placeholder={`Enter ${item.label} heading`}
//                                     />
//                                   )}
//                                   <span className="hierarchy-level__sub">
//                                     {item.required ? "Required" : item.hint}
//                                   </span>
//                                 </span>
//                                 <input
//                                   type="checkbox"
//                                   className="hierarchy-level__checkbox hierarchy-level__checkbox--green"
//                                   checked={checked}
//                                   disabled={disabled}
//                                   onChange={(e) => updateZonalConfig(item.key, e.target.checked)}
//                                 />
//                               </label>
//                             );
//                           })}
//                         </div>
//                         <p className="hierarchy-levels__note">
//                           Floor is directly under Branch unless Building is selected. Room is always under Floor.
//                         </p>
//                       </section>
//                     </div>

//                     {/* Physical hierarchy records */}
//                     {form.id &&
//                       (zonalConfig?.levels || []).some((l) => ["building", "floor", "room"].includes(l)) && (
//                         <section className="physical-section">
//                           <div className="physical-section__head">
//                             <div>
//                               <h4 className="physical-section__title">Physical hierarchy records</h4>
//                               <p className="physical-section__hint">
//                                 Add buildings under branches, floors under buildings (or branches), and rooms under floors.
//                                 New records are saved immediately.
//                               </p>
//                             </div>
//                             <button
//                               type="button"
//                               className="btn-secondary"
//                               onClick={loadPhysicalHierarchy}
//                               disabled={physicalHierarchyLoading}
//                             >
//                               {physicalHierarchyLoading ? "Refreshing..." : "Refresh"}
//                             </button>
//                           </div>
//                           {physicalHierarchyLoading && <p className="physical-loading">Loading physical hierarchy...</p>}
//                           {physicalHierarchyError && (
//                             <p role="alert" className="physical-error">{physicalHierarchyError}</p>
//                           )}
//                           {!physicalHierarchyLoading && physicalHierarchy.length === 0 && (
//                             <p className="physical-empty">
//                               No branches found for this customer yet. Create branches first, then add physical levels here.
//                             </p>
//                           )}
//                           <div className="physical-tree">
//                             {physicalHierarchy.map((branch) => (
//                               <div key={branch.id} className="physical-branch">
//                                 <div className="physical-branch__head">
//                                   <strong className="physical-branch__title">
//                                     {branch.name} <span className="physical-branch__tag">(Branch)</span>
//                                   </strong>
//                                   <div className="physical-branch__actions">
//                                     {(zonalConfig?.levels || []).includes("building") && (
//                                       <button type="button" className="btn-secondary"
//                                         onClick={() => openPhysicalNodeForm("building", { id: branch.id })}>
//                                         <FiPlus /> Building
//                                       </button>
//                                     )}
//                                     {!(zonalConfig?.levels || []).includes("building") && (
//                                       <button type="button" className="btn-secondary"
//                                         onClick={() => openPhysicalNodeForm("floor", { id: branch.id, type: "branch" })}>
//                                         <FiPlus /> Floor
//                                       </button>
//                                     )}
//                                   </div>
//                                 </div>
//                                 <div className="physical-branch__children">
//                                   {branch.buildings.map((building) => (
//                                     <div key={building.id} className="physical-building">
//                                       <div className="physical-building__head">
//                                         <strong>
//                                           {building.name} <span className="physical-building__tag">(Building)</span>
//                                         </strong>
//                                         {(zonalConfig?.levels || []).includes("floor") && (
//                                           <button type="button" className="btn-secondary"
//                                             onClick={() =>
//                                               openPhysicalNodeForm("floor", {
//                                                 id: building.id,
//                                                 type: "building",
//                                                 branchId: branch.id,
//                                               })
//                                             }
//                                           >
//                                             <FiPlus /> Floor
//                                           </button>
//                                         )}
//                                       </div>
//                                       <div className="physical-building__children">
//                                         {building.floors.map((floor) => (
//                                           <div key={floor.id} className="physical-floor">
//                                             <div className="physical-floor__head">
//                                               <span>
//                                                 {floor.name} <span className="physical-floor__tag">(Floor)</span>
//                                               </span>
//                                               {(zonalConfig?.levels || []).includes("room") && (
//                                                 <button type="button" className="btn-secondary"
//                                                   onClick={() => openPhysicalNodeForm("room", { id: floor.id })}>
//                                                   <FiPlus /> Room
//                                                 </button>
//                                               )}
//                                             </div>
//                                             {floor.rooms.map((room) => (
//                                               <div key={room.id} className="physical-room">
//                                                 └ {room.name} <span className="physical-room__tag">(Room)</span>
//                                               </div>
//                                             ))}
//                                           </div>
//                                         ))}
//                                       </div>
//                                     </div>
//                                   ))}
//                                   {branch.directFloors.map((floor) => (
//                                     <div key={floor.id} className="physical-floor">
//                                       <div className="physical-floor__head">
//                                         <span>
//                                           {floor.name} <span className="physical-floor__tag">(Floor)</span>
//                                         </span>
//                                         {(zonalConfig?.levels || []).includes("room") && (
//                                           <button type="button" className="btn-secondary"
//                                             onClick={() => openPhysicalNodeForm("room", { id: floor.id })}>
//                                             <FiPlus /> Room
//                                           </button>
//                                         )}
//                                       </div>
//                                       {floor.rooms.map((room) => (
//                                         <div key={room.id} className="physical-room">
//                                           └ {room.name} <span className="physical-room__tag">(Room)</span>
//                                         </div>
//                                       ))}
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </section>
//                       )}

//                     {physicalNodeModal && (
//                       <div role="dialog" aria-modal="true"
//                         aria-label={`Add ${physicalNodeModal.type}`}
//                         className="physical-node-form">
//                         <form onSubmit={savePhysicalNode}>
//                           <h4>
//                             Add {physicalNodeModal.type.charAt(0).toUpperCase() + physicalNodeModal.type.slice(1)}
//                           </h4>
//                           <label>
//                             Name
//                             <input required maxLength={255}
//                               value={physicalNodeForm.name}
//                               onChange={(e) => setPhysicalNodeForm((c) => ({ ...c, name: e.target.value }))}
//                               placeholder={`Enter ${physicalNodeModal.type} name`} />
//                           </label>
//                           <label>
//                             Code
//                             <input required maxLength={50}
//                               value={physicalNodeForm.code}
//                               onChange={(e) => setPhysicalNodeForm((c) => ({ ...c, code: e.target.value }))}
//                               placeholder={`Enter unique ${physicalNodeModal.type} code`} />
//                           </label>
//                           <div className="physical-node-form__actions">
//                             <button type="button" className="btn-secondary"
//                               disabled={savingPhysicalNode}
//                               onClick={() => setPhysicalNodeModal(null)}>
//                               Cancel
//                             </button>
//                             <button type="submit" className="btn-primary" disabled={savingPhysicalNode}>
//                               {savingPhysicalNode ? "Saving..." : `Save ${physicalNodeModal.type}`}
//                             </button>
//                           </div>
//                         </form>
//                       </div>
//                     )}

//                     {/* Live preview */}
//                     <div className="live-preview">
//                       <div className="live-preview__label">Live preview</div>
//                       <div className="live-preview__path">
//                         {["zone", ...(zonalConfig?.levels || []).filter((l) => l !== "zone")].map((level, index, items) => (
//                           <React.Fragment key={level}>
//                             <span
//                               className={`live-preview__chip ${
//                                 ["building", "floor", "room"].includes(level)
//                                   ? "live-preview__chip--physical"
//                                   : ""
//                               }`}
//                             >
//                               {zonalLabel(level)}
//                             </span>
//                             {index < items.length - 1 && (
//                               <span className="live-preview__arrow">→</span>
//                             )}
//                           </React.Fragment>
//                         ))}
//                       </div>
//                       <p className="live-preview__hint">
//                         This is the hierarchy that will be used for this customer when saved.
//                       </p>
//                     </div>

//                     <div className="panel-actions panel-actions--spaced">
//                       <button type="button" className="btn-secondary"
//                         disabled={savingZonalConfig}
//                         onClick={() => {
//                           setZonalConfig(
//                             form.zonal_hierarchy_config || {
//                               version: 1,
//                               levels: ["zone", "circle", "branch", "floor"],
//                               labels: { ...ZONAL_LEVEL_DEFAULT_LABELS },
//                             }
//                           );
//                           setIsEditingZonalHierarchy(false);
//                           setHierarchyError("");
//                           setView("form");
//                         }}>
//                         Cancel
//                       </button>
//                       <button type="button" className="btn-primary"
//                         disabled={savingZonalConfig}
//                         onClick={saveZonalHierarchyConfig}>
//                         {savingZonalConfig ? "Saving..." : "Save Hierarchy"}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {hierarchyError && <div className="form-error">{hierarchyError}</div>}

//             {/* <div className="panel-actions">
//               <button type="button" className="btn-secondary" onClick={() => setView("form")}>
//                 Back to Customer
//               </button>
//               <button type="button" className="btn-secondary" onClick={backToList}>
//                 Save and Exit
//               </button>
//             </div> */}
//           </div>
//         // </div>
//       )}

//       {/* ASSIGN SITE */}
//       {view === "assignSite" && (
//         <div className="admins-panel">
//           <div className="admins-panel-header">
//             <FiMapPin size={22} />
//             <div>
//               <h2>Assign Customer to Branch</h2>
//               <p>Select a customer and one of its Branch to create the assignment.</p>
//             </div>
//           </div>

//           {assignLoading ? (
//             <div className="admins-loading">Loading customers and branch...</div>
//           ) : (
//             <form onSubmit={handleAssignSite} className="admins-form">
//               <div className="assign-card">
//                 <div className="form-grid">
//                   <label>
//                     Select Customer *
//                     <select value={assignCustomerId}
//                       onChange={(e) => {
//                         setAssignCustomerId(e.target.value);
//                         setAssignSiteId("");
//                         setAssignError("");
//                         setAssignSuccess("");
//                       }}>
//                       <option value="">Choose a customer</option>
//                       {assignCustomers.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {customerNameOf(c)}{c.code ? ` (${c.code})` : ""}
//                         </option>
//                       ))}
//                     </select>
//                   </label>
//                   <label>
//                     Select Branch *
//                     <select value={assignSiteId}
//                       onChange={(e) => {
//                         setAssignSiteId(e.target.value);
//                         setAssignError("");
//                         setAssignSuccess("");
//                       }}
//                       disabled={!assignCustomerId}>
//                       <option value="">Choose a branch</option>
//                       {assignSites.map((site) => {
//                         const siteId = site.tpt_site_id ?? site.id;
//                         return (
//                           <option key={String(siteId)} value={String(siteId)}>
//                             {site.name || "Unnamed site"}{site.code ? ` (${site.code})` : ""}
//                           </option>
//                         );
//                       })}
//                     </select>
//                   </label>
//                 </div>

//                 {assignCustomerId && (
//                   <div className="assign-site-summary">
//                     <h3>Assignment Summary</h3>
//                     <p>
//                       <strong>Customer:</strong>{" "}
//                       {customerNameOf(
//                         assignCustomers.find((c) => String(c.id) === String(assignCustomerId))
//                       ) || "-"}
//                     </p>
//                     <p>
//                       <strong>Branch:</strong>{" "}
//                       {assignSites.find(
//                         (s) => String(s.tpt_site_id ?? s.id) === String(assignSiteId)
//                       )?.name || "Not selected"}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {assignError && <div className="form-error">{assignError}</div>}
//               {assignSuccess && <div className="assign-success" role="status">{assignSuccess}</div>}

//               <div className="panel-actions">
//                 <button type="button" className="btn-secondary" onClick={backToList} disabled={assignSaving}>
//                   Save and Exit
//                 </button>
//                 {!assignSuccess && (
//                   <button type="submit" className="btn-primary"
//                     disabled={assignSaving || !assignCustomerId || !assignSiteId}>
//                     {assignSaving ? "Assigning..." : "Assign Site"}
//                   </button>
//                 )}
//                 {assignSuccess && (
//                   <button type="button" className="btn-primary"
//                     onClick={async () => { await fetchCustomers(); setView("list"); }}>
//                     <FiCheckCircle /> Finish
//                   </button>
//                 )}
//               </div>
//             </form>
//           )}
//         </div>
//       )}

//       {/* DELETE CONFIRM */}
//       {confirmDelete && (
//         <div className="admins-modal-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
//           <div className="admins-modal admins-modal-small" onClick={(e) => e.stopPropagation()}>
//             <h2>Delete Customer</h2>
//             <p>
//               Are you sure you want to delete <strong>{customerNameOf(confirmDelete)}</strong>?
//               <br />This cannot be undone.
//             </p>
//             <div className="panel-actions">
//               <button className="btn-secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>
//                 Cancel
//               </button>
//               <button className="btn-danger-solid" onClick={handleDelete} disabled={deleting}>
//                 {deleting ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* TOAST */}
//       {toast && (
//         <div key={toast.id} className={`admins-toast admins-toast-${toast.type}`} role="status">
//           <span className="admins-toast-icon">{toast.type === "success" ? "✓" : "!"}</span>
//           <span>{toast.message}</span>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CustomerCreation;



import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiCheckCircle,
  FiUserPlus,
  FiEdit3,
  FiEdit2,
  FiMapPin,
} from "react-icons/fi";

import "./CustomerCreation.css";
// import "./AdminCreation.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:8000/api`;
const LOCATIONS_URL = `${API_BASE}/v1/filters/locations/`;
const CUSTOMERS_URL = `${API_BASE}/customers/`;
const SITES_URL = `${API_BASE}/cloud/sites/?pageSize=1000&page=0`;

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

const HIERARCHY_OPTIONS = [
  {
    value: "GEOGRAPHICAL",
    label: "Geographical",
    description: "India → State → District → Taluka → Branch",
  },
  {
    value: "ZONAL",
    label: "Zonal",
    description: "India → Zone → Circle → Branch → Floor (editable)",
  },
];

const HIERARCHY_LABEL = { GEOGRAPHICAL: "Geographical", ZONAL: "Zonal" };
const CUSTOMER_TYPES = ["Public Sector Bank", "Private Sector Bank"];

// Keep the geographical classification separate from the customer's Zonal
// organizational path. This mapping is recalculated whenever the level order changes.
const buildGeographicalMapping = (levels = []) => {
  const organizational = levels.filter((level) =>
    ["zone", "circle", "region", "division", "branch"].includes(level)
  );
  let assigned = [];
  if (organizational.length === 1) assigned = ["STATE"];
  else if (organizational.length === 2) assigned = ["STATE", "CITY"];
  else if (organizational.length === 3) assigned = ["STATE", "DISTRICT", "CITY"];
  else assigned = ["STATE", "DISTRICT", "TALUKA", "CITY"];

  return Object.fromEntries(
    organizational.map((level, index) => [level, assigned[index] || null])
  );
};

const withGeographicalMapping = (config = {}) => {
  const levels = Array.isArray(config.levels) ? config.levels : [];
  return {
    ...config,
    version: 2,
    geographical_mapping: buildGeographicalMapping(levels),
  };
};

const emptyForm = {
  id: null,
  company: "",
  code: "",
  company_email: "",
  contact_person: "",
  contact_person_email: "",
  phone: "",
  password: "",
  confirm_password: "",
  hierarchy_type: "",
  zonal_hierarchy_config: { version: 1, levels: ["zone", "circle", "branch", "floor"] },
  is_active: true,
  bank_short_name: "",
  bank_type: "",
  website: "",
  address_line_1: "",
  state: "",
  district: "",
  taluka: "",
  city: "",
  pincode: "",
  designation: "",
  admin_mobile: "",
};

/* ---------------- helpers ---------------- */
function normalizeList(result) {
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.data)) return result.data;
  if (result && Array.isArray(result.results)) return result.results;
  return [];
}
const customerNameOf = (c) => c?.company ?? c?.bank_name ?? c?.name ?? "";
const customerEmailOf = (c) => c?.company_email ?? c?.email ?? "";

const getCustomerHierarchyPath = (customer) => {
  const t = customer?.hierarchy_type;
  if (t === "GEOGRAPHICAL") return "Geographical";
  if (t === "ZONAL") {
    const config = customer?.zonal_hierarchy_config || {};
    const levels = Array.isArray(config.levels) && config.levels.length
      ? config.levels
      : ["zone", "circle", "branch", "floor"];
    const names = config.level_names || config.display_names || config.levelNames || {};
    const titleFor = (lvl) =>
      typeof names[lvl] === "string" && names[lvl].trim()
        ? names[lvl].trim()
        : lvl.charAt(0).toUpperCase() + lvl.slice(1);
    return ["India", ...levels.map(titleFor)].join(" → ");
  }
  return "-";
};

const getHeadOfficeHierarchy = (customer) => {
  const t = customer?.hierarchy_type;
  if (t === "GEOGRAPHICAL") {
    return ["India", customer?.state, customer?.district, customer?.taluka, customer?.city]
      .filter(Boolean).join(" → ");
  }
  if (t === "ZONAL") {
    return ["India", customer?.zone, customer?.circle, customer?.region, customer?.division]
      .filter(Boolean).join(" → ");
  }
  return "-";
};

const ZONAL_LEVEL_DEFAULT_LABELS = {
  zone: "Zone", circle: "Circle", region: "Region", division: "Division",
  branch: "Branch", building: "Building", floor: "Floor", room: "Room",
};

function CustomerCreation() {
  /* ----- state ----- */
  const [view, setView] = useState("list");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedHierarchy, setSelectedHierarchy] = useState("");
  const [hierarchyError, setHierarchyError] = useState("");
  const [zonalConfig, setZonalConfig] = useState({
    version: 1,
    levels: ["zone", "circle", "branch", "floor"],
    labels: { ...ZONAL_LEVEL_DEFAULT_LABELS },
  });
  const [isEditingZonalHierarchy, setIsEditingZonalHierarchy] = useState(false);
  const [editingZonalLabelLevel, setEditingZonalLabelLevel] = useState(null);
  const [savingZonalConfig, setSavingZonalConfig] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [assignCustomers, setAssignCustomers] = useState([]);
  const [assignSites, setAssignSites] = useState([]);
  const [assignCustomerId, setAssignCustomerId] = useState("");
  const [assignSiteId, setAssignSiteId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const [locationTree, setLocationTree] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState("");

  const [physicalHierarchy, setPhysicalHierarchy] = useState([]);
  const [physicalHierarchyLoading, setPhysicalHierarchyLoading] = useState(false);
  const [physicalHierarchyError, setPhysicalHierarchyError] = useState("");
  const [physicalNodeModal, setPhysicalNodeModal] = useState(null);
  const [physicalNodeForm, setPhysicalNodeForm] = useState({ name: "", code: "" });
  const [savingPhysicalNode, setSavingPhysicalNode] = useState(false);

  const [toast, setToast] = useState(null);
  const isEditing = Boolean(form.id);

  /* ----- zonal config ----- */
  const openHierarchyEditor = () => {
    setIsEditingZonalHierarchy(true);
    setHierarchyError("");
    setView("hierarchy");
  };

  const updateZonalConfig = (level, enabled) => {
    setZonalConfig((current) => {
      const selected = new Set(current?.levels || ["zone", "circle", "branch", "floor"]);
      if (["circle", "region", "division"].includes(level)) {
        if (enabled) selected.add(level);
        else selected.delete(level);
        if (level === "region" && !enabled) selected.delete("division");
      } else if (["building", "room"].includes(level)) {
        if (enabled) selected.add(level);
        else selected.delete(level);
      }
      selected.add("zone");
      selected.add("branch");
      selected.add("floor");
      if (selected.has("division")) selected.add("region");
      if (selected.has("room")) selected.add("floor");
      const order = ["zone", "circle", "region", "division", "branch", "building", "floor", "room"];
      const nextConfig = {
        ...current,
        version: 2,
        levels: order.filter((i) => selected.has(i)),
        labels: { ...ZONAL_LEVEL_DEFAULT_LABELS, ...(current?.labels || {}) },
      };
      return withGeographicalMapping(nextConfig);
    });
  };

  const updateZonalLabel = (level, value) =>
    setZonalConfig((c) => ({
      ...c,
      labels: { ...ZONAL_LEVEL_DEFAULT_LABELS, ...(c?.labels || {}), [level]: value },
    }));

  const zonalLabel = (level) =>
    (zonalConfig?.labels || {})[level] || ZONAL_LEVEL_DEFAULT_LABELS[level] || level;

  /* ----- physical hierarchy ----- */
  const readApiRows = async (url) => {
    const response = await fetch(url, { headers: authHeaders(), cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(result.detail || result.message || "Unable to load physical hierarchy.");
    return Array.isArray(result) ? result : result.results || result.data || [];
  };

  const loadPhysicalHierarchy = useCallback(async () => {
    if (!form.id) { setPhysicalHierarchy([]); return; }
    setPhysicalHierarchyLoading(true);
    setPhysicalHierarchyError("");
    try {
      const branches = await readApiRows(`${API_BASE}/branches/?customer=${encodeURIComponent(form.id)}`);
      const tree = await Promise.all(
        branches.map(async (branch) => {
          const [buildings, branchFloors] = await Promise.all([
            readApiRows(`${API_BASE}/buildings/?branch=${encodeURIComponent(branch.id)}`),
            readApiRows(`${API_BASE}/floors/?branch=${encodeURIComponent(branch.id)}`),
          ]);
          const buildingNodes = await Promise.all(
            buildings.map(async (building) => {
              const floors = branchFloors.filter(
                (f) => String(f.building || "") === String(building.id)
              );
              return {
                ...building,
                floors: await Promise.all(
                  floors.map(async (floor) => ({
                    ...floor,
                    rooms: await readApiRows(`${API_BASE}/rooms/?floor=${encodeURIComponent(floor.id)}`),
                  }))
                ),
              };
            })
          );
          const directFloors = branchFloors.filter((f) => !f.building);
          return {
            ...branch,
            buildings: buildingNodes,
            directFloors: await Promise.all(
              directFloors.map(async (floor) => ({
                ...floor,
                rooms: await readApiRows(`${API_BASE}/rooms/?floor=${encodeURIComponent(floor.id)}`),
              }))
            ),
          };
        })
      );
      setPhysicalHierarchy(tree);
    } catch (e) {
      setPhysicalHierarchyError(e.message || "Unable to load physical hierarchy.");
    } finally {
      setPhysicalHierarchyLoading(false);
    }
  }, [form.id]);

  useEffect(() => {
    if (view === "hierarchy" && selectedHierarchy === "ZONAL" && form.id)
      loadPhysicalHierarchy();
  }, [view, selectedHierarchy, form.id, loadPhysicalHierarchy]);

  const openPhysicalNodeForm = (type, parent) => {
    setPhysicalNodeForm({ name: "", code: "" });
    setPhysicalNodeModal({ type, parent });
    setPhysicalHierarchyError("");
  };

  const savePhysicalNode = async (event) => {
    event.preventDefault();
    if (!physicalNodeModal || !form.id) return;
    const { type, parent } = physicalNodeModal;
    const payload = { name: physicalNodeForm.name.trim(), code: physicalNodeForm.code.trim() };
    if (!payload.name || !payload.code) return;
    if (type === "building") payload.branch = parent.id;
    if (type === "floor") {
      payload.branch = parent.branchId || parent.id;
      if (parent.type === "building") payload.building = parent.id;
    }
    if (type === "room") payload.floor = parent.id;
    const endpoint = type === "building" ? "buildings" : type === "floor" ? "floors" : "rooms";
    setSavingPhysicalNode(true);
    setPhysicalHierarchyError("");
    try {
      const response = await fetch(`${API_BASE}/${endpoint}/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.detail || result.message || JSON.stringify(result) || `Unable to create ${type}.`);
      setPhysicalNodeModal(null);
      setPhysicalNodeForm({ name: "", code: "" });
      await loadPhysicalHierarchy();
    } catch (e) {
      setPhysicalHierarchyError(e.message || `Unable to create ${type}.`);
    } finally {
      setSavingPhysicalNode(false);
    }
  };

  const saveZonalHierarchyConfig = async () => {
    const configToSave = withGeographicalMapping(zonalConfig);
    const levels = configToSave?.levels || [];
    if (levels.includes("division") && !levels.includes("region")) {
      setHierarchyError("Division requires Region."); return;
    }
    if (levels.includes("room") && !levels.includes("floor")) {
      setHierarchyError("Room requires Floor."); return;
    }
    const invalidLabel = levels.find(
      (lvl) => !String(configToSave?.labels?.[lvl] ?? ZONAL_LEVEL_DEFAULT_LABELS[lvl] ?? "").trim()
    );
    if (invalidLabel) {
      setHierarchyError(`Enter a display heading for ${ZONAL_LEVEL_DEFAULT_LABELS[invalidLabel] || invalidLabel}.`);
      return;
    }
    setHierarchyError("");
    if (!form.id) {
      setForm((c) => ({ ...c, zonal_hierarchy_config: configToSave }));
      setIsEditingZonalHierarchy(false);
      setView("form");
      return;
    }
    try {
      setSavingZonalConfig(true);
      const response = await fetch(`${CUSTOMERS_URL}${form.id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ zonal_hierarchy_config: configToSave }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.detail || result.message || "Unable to save the hierarchy configuration.");
      const savedConfig = result.zonal_hierarchy_config || configToSave;
      setZonalConfig(savedConfig);
      setForm((c) => ({ ...c, zonal_hierarchy_config: savedConfig }));
      setIsEditingZonalHierarchy(false);
      setView("form");
    } catch (e) {
      setHierarchyError(e.message || "Unable to save the hierarchy configuration.");
    } finally {
      setSavingZonalConfig(false);
    }
  };

  /* ----- branches / customers ----- */
  const [formSites, setFormSites] = useState([]);
  const [formSiteId, setFormSiteId] = useState("");
  const [sitesLoading, setSitesLoading] = useState(false);
  const [sitesError, setSitesError] = useState("");

  const loadSites = useCallback(async () => {
    setSitesLoading(true);
    setSitesError("");
    try {
      const res = await fetch(SITES_URL, { method: "GET", headers: authHeaders(), cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.status === "error" || !Array.isArray(body.sites))
        throw new Error(body.message || `Could not load branches (${res.status}).`);
      setFormSites(body.sites);
    } catch (e) {
      setSitesError(e.message || "Could not load branches.");
    } finally {
      setSitesLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(CUSTOMERS_URL, { method: "GET", cache: "no-store", headers: authHeaders() });
      if (res.status === 401) throw new Error("401 Unauthorized. Please login again.");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setCustomers(normalizeList(result));
    } catch (err) {
      setError(err.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  const openAssignSite = async (customerId = "") => {
    setView("assignSite");
    setAssignError("");
    setAssignSuccess("");
    setAssignCustomerId(String(customerId || ""));
    setAssignSiteId("");
    setAssignLoading(true);
    try {
      const [customerResponse, siteResponse] = await Promise.all([
        fetch(CUSTOMERS_URL, { method: "GET", headers: authHeaders(), cache: "no-store" }),
        fetch(SITES_URL, { method: "GET", headers: authHeaders(), cache: "no-store" }),
      ]);
      if (!customerResponse.ok) throw new Error(`Could not load customers (${customerResponse.status}).`);
      if (!siteResponse.ok) {
        const errorBody = await siteResponse.json().catch(() => ({}));
        throw new Error(errorBody.message || `Could not load 3TP sites (${siteResponse.status}).`);
      }
      const customerData = await customerResponse.json();
      const siteData = await siteResponse.json();
      if (siteData.status === "error") throw new Error(siteData.message || "Could not load 3TP sites.");
      if (!Array.isArray(siteData.sites)) throw new Error("Invalid response: expected a sites array.");
      const loadedCustomers = normalizeList(customerData);
      setAssignCustomers(loadedCustomers);
      setAssignSites(siteData.sites);
      const exists = loadedCustomers.some((c) => String(c.id) === String(customerId));
      setAssignCustomerId(exists ? String(customerId) : "");
    } catch (err) {
      setAssignCustomers([]);
      setAssignSites([]);
      setAssignError(err.message || "Could not load assignment data.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignSite = async (e) => {
    e.preventDefault();
    setAssignError("");
    setAssignSuccess("");
    const payload = {
      customer_id: String(assignCustomerId || "").trim(),
      tpt_site_id: String(assignSiteId || "").trim(),
    };
    if (!payload.customer_id || !payload.tpt_site_id) {
      setAssignError("Please select both a customer and a site."); return;
    }
    setAssignSaving(true);
    try {
      const response = await fetch(`${API_BASE}/customers/assign/site/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.message || result.details || `Assignment failed (${response.status}).`);
      setAssignSuccess(result.message || "Customer assigned to site successfully.");
      setAssignSiteId("");
    } catch (err) {
      setAssignError(err.message || "Could not assign customer to site.");
    } finally {
      setAssignSaving(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    let cancelled = false;
    const fetchLocationTree = async () => {
      setLocationsLoading(true);
      setLocationsError("");
      try {
        const response = await fetch(`${LOCATIONS_URL}?hierarchy=GEOGRAPHICAL`, {
          method: "GET",
          headers: { Accept: "application/json", ...authHeaders() },
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Unable to load locations (${response.status})`);
        const result = await response.json();
        if (!cancelled) setLocationTree(Array.isArray(result?.data) ? result.data : []);
      } catch (err) {
        if (!cancelled) setLocationsError(err.message);
      } finally {
        if (!cancelled) setLocationsLoading(false);
      }
    };
    fetchLocationTree();
    return () => { cancelled = true; };
  }, []);

  const headOfficeOptions = useMemo(() => {
    const india = locationTree.find(
      (item) => String(item?.country_name || "").toLowerCase() === "india"
    );
    const states = india?.states || [];
    const selectedState = states.find((i) => i.state_name === form.state);
    const districts = selectedState?.districts || [];
    const selectedDistrict = districts.find((i) => i.district_name === form.district);
    const talukas = selectedDistrict?.talukas || [];
    return {
      states: states.map((i) => i.state_name).filter(Boolean),
      districts: districts.map((i) => i.district_name).filter(Boolean),
      talukas: talukas.map((i) => i.taluka_name).filter(Boolean),
    };
  }, [locationTree, form.state, form.district]);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const fields = [
        customerNameOf(c), c.code, customerEmailOf(c), c.contact_person, c.phone,
        c.hierarchy_type, c.bank_short_name, c.bank_type,
      ];
      return fields.filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
    });
  }, [customers, search]);

  /* ----- create / edit / back ----- */
  const goToCreate = () => {
    setForm({ ...emptyForm });
    setFormSiteId("");
    loadSites();
    setSelectedHierarchy("");
    setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
    setIsEditingZonalHierarchy(false);
    setFormError("");
    setHierarchyError("");
    setView("form");
  };

  const openEditPanel = (customer) => {
    const hierarchy = customer.hierarchy_type || "";
    setForm({
      ...emptyForm,
      id: customer.id,
      company: customer.company ?? customer.bank_name ?? customer.name ?? "",
      code: customer.code || "",
      company_email: customer.company_email ?? customer.email ?? "",
      contact_person: customer.contact_person || "",
      contact_person_email: customer.contact_person_email || "",
      phone: customer.phone || "",
      hierarchy_type: hierarchy,
      zonal_hierarchy_config:
        customer.zonal_hierarchy_config || { version: 1, levels: ["zone", "circle", "branch", "floor"] },
      is_active: customer.is_active ?? true,
      bank_short_name: customer.bank_short_name || "",
      bank_type: customer.bank_type || "",
      website: customer.website || "",
      address_line_1: customer.address_line_1 || "",
      state: customer.state || "",
      district: customer.district || "",
      taluka: customer.taluka || "",
      city: customer.city || "",
      pincode: customer.pincode || "",
      designation: customer.designation || "",
      admin_mobile: customer.admin_mobile || customer.phone || "",
      password: "",
      confirm_password: "",
    });
    setSelectedHierarchy(hierarchy);
    setZonalConfig(withGeographicalMapping(
      customer.zonal_hierarchy_config || { version: 2, levels: ["zone", "circle", "branch", "floor"] }
    ));
    setIsEditingZonalHierarchy(false);
    setFormError("");
    setHierarchyError("");
    setView("form");
  };

  const backToList = () => {
    setView("list");
    setForm({ ...emptyForm });
    setFormSiteId("");
    setSelectedHierarchy("");
    setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
    setIsEditingZonalHierarchy(false);
    setFormError("");
    setHierarchyError("");
  };

  const handleFieldChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleHierarchyChange = (value) => {
    setSelectedHierarchy(value);
    setForm((prev) => ({ ...prev, hierarchy_type: value }));
    if (value === "ZONAL")
      setZonalConfig({ version: 1, levels: ["zone", "circle", "branch", "floor"] });
    setHierarchyError("");
  };

  const validateForm = () => {
    if (!form.company.trim()) return "Customer name is required.";
    if (!form.code.trim()) return "Customer code is required.";
    if (!form.bank_short_name.trim()) return "Short name is required.";
    if (!form.bank_type) return "Customer type is required.";
    if (!form.company_email.trim()) return "Customer email is required.";
    if (!form.phone.trim()) return "Customer phone number is required.";
    if (!form.contact_person.trim()) return "Contact person name is required.";
    if (!form.contact_person_email.trim()) return "Contact person email is required.";
    if (!form.admin_mobile.trim()) return "Contact person mobile is required.";
    if (!form.state) return "Please select a state.";
    if (!form.district) return "Please select a district.";
    if (!form.taluka) return "Please select a taluka.";
    if (!isEditing) {
      if (!form.password.trim()) return "Password is required.";
      if (!form.confirm_password.trim()) return "Confirm password is required.";
      if (form.password !== form.confirm_password)
        return "Password and confirm password do not match.";
    }
    if (form.password.trim() && form.password !== form.confirm_password)
      return "Password and confirm password do not match.";
    if (!selectedHierarchy) return "Please select a location hierarchy.";
    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim()))
      return "PIN code must contain exactly 6 digits.";
    if (form.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.company_email.trim()))
      return "Please enter a valid customer email.";
    if (form.contact_person_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_person_email.trim()))
      return "Please enter a valid contact person email.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const validationError = validateForm();
    if (validationError) { setFormError(validationError); return; }
    const payload = {
      company: form.company.trim(),
      code: form.code.trim(),
      company_email: form.company_email.trim(),
      contact_person: form.contact_person.trim(),
      contact_person_email: form.contact_person_email.trim(),
      phone: form.admin_mobile.trim() || form.phone.trim(),
      hierarchy_type: selectedHierarchy || form.hierarchy_type,
      zonal_hierarchy_config:
        (selectedHierarchy || form.hierarchy_type) === "ZONAL"
          ? withGeographicalMapping(zonalConfig)
          : { version: 1, levels: ["zone", "circle", "branch", "floor"] },
      is_active: form.is_active,
      state: form.state.trim(),
      district: form.district.trim(),
      taluka: form.taluka,
      city: form.city.trim(),
      pincode: form.pincode.trim(),
    };
    if (form.password.trim()) payload.password = form.password.trim();
    setSaving(true);
    try {
      const url = isEditing ? `${CUSTOMERS_URL}${form.id}/` : CUSTOMERS_URL;
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const message = typeof errBody === "object" && errBody !== null
          ? Object.entries(errBody)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : `HTTP ${res.status}`;
        throw new Error(message || `HTTP ${res.status}`);
      }
      const saved = await res.json();
      await fetchCustomers();
      if (!isEditing) {
        const assignRes = await fetch(`${API_BASE}/customers/assign/site/`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ customer_id: String(saved.id), tpt_site_id: String(formSiteId) }),
        });
        const assignBody = await assignRes.json().catch(() => ({}));
        // if (!assignRes.ok) {
        //   setForm((prev) => ({ ...prev, id: saved.id }));
        //   setFormError("");
        //   setView("hierarchy");
        //   showToast(
        //     "error",
        //     `Customer created, but branch assignment failed: ${
        //       assignBody.message || assignBody.details || assignRes.status
        //     }. Use the pin icon in the customer list to retry.`
        //   );
        //   return;
        // }
      }
      if (isEditing) {
        backToList();
        showToast("success", "Customer updated successfully.");
        return;
      }
      setForm((prev) => ({ ...prev, id: saved.id }));
      setFormError("");
      setView("hierarchy");
      showToast("success", "Customer created successfully.");
    } catch (err) {
      const msg = err.message || "Could not save customer.";
      setFormError(msg);
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete || deleting) return;
    const name = customerNameOf(confirmDelete) || confirmDelete.code || "Customer";
    setDeleting(true);
    try {
      const res = await fetch(`${CUSTOMERS_URL}${confirmDelete.id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setCustomers((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      setConfirmDelete(null);
      showToast("success", `${name} deleted successfully.`);
    } catch (err) {
      const msg = err.message || "Could not delete customer.";
      setError(msg);
      setConfirmDelete(null);
      showToast("error", msg);
    } finally {
      setDeleting(false);
    }
  };

  const hierarchyName = HIERARCHY_LABEL[selectedHierarchy] || "-";

  const showToast = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

    /* =====================================================
     INLINE ACTION BUTTON STYLES (MATCHING ADMIN CREATION)
  ===================================================== */
  const iconBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    padding: 0,
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    marginLeft: 6,
    transition: "background .15s, border-color .15s",
  };

  const editBtnStyle = { ...iconBtnStyle, color: "#2563eb" };
  const deleteBtnStyle = { ...iconBtnStyle, color: "#dc2626" };
  const assignBtnStyle = { ...iconBtnStyle, color: "#16a34a" }; // Matches the green branch pin in Admin

  return (
    <div className="admins-page">
      {/* STEPPER */}
      <ol className="admins-stepper">
        <li className={view === "list" ? "active" : "done"}>
          <button type="button" className="step-btn" onClick={backToList}>
            <span className="step-num">1</span> Customers
          </button>
        </li>
        <li className={view === "form" ? "active" : view === "hierarchy" ? "done" : ""}>
          <button type="button" className="step-btn" onClick={goToCreate}>
            <span className="step-num">2</span> {isEditing ? "Edit" : "Create"}
          </button>
        </li>
        {/* <li className={view === "hierarchy" ? "active" : ""}>
          <button
            type="button"
            className="step-btn"
            disabled={!selectedHierarchy}
            onClick={() => {
              if (!selectedHierarchy) return;
              setIsEditingZonalHierarchy(true);
              setView("hierarchy");
              if (selectedHierarchy === "ZONAL" && form.id) loadPhysicalHierarchy();
            }}
          >
            <span className="step-num">3</span> Hierarchy
          </button>
        </li> */}
      </ol>

      {/* LIST */}
      {view === "list" && (
        <>
          <div className="admins-header">
            <div>
              <h1>Customers</h1>
              <p>Register and manage customers under your organization.</p>
            </div>
          </div>
          <div className="admins-toolbar">
            <input
              type="text"
              className="admins-search"
              placeholder="Search by customer name, code, email, phone or hierarchy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="admins-count">
              {filteredCustomers.length} of {customers.length} customers
            </span>
          </div>
          {error && <div className="admins-error">{error}</div>}
          <div className="admins-table-card" style={{ overflowX: "auto" }}>
            {loading ? (
              <div className="admins-loading">Loading Customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="admins-empty">
                {customers.length === 0
                  ? "No customers registered yet. Click “Create Customer” to create one."
                  : "No customers match your search."}
              </div>
            ) : (
              <table className="admins-table" style={{ minWidth: "1100px" }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Code</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Hierarchy</th>
                    {/* <th>Head Office</th> */}
                    <th>Status</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customerNameOf(customer)}</strong>
                        {customer.bank_short_name && (
                          <small className="customer-name-sub">{customer.bank_short_name}</small>
                        )}
                      </td>
                      <td>{customer.code || "-"}</td>
                      <td>{customerEmailOf(customer) || "-"}</td>
                      <td>{customer.contact_person || "-"}</td>
                      <td>{customer.phone || "-"}</td>
                      <td className="customer-hierarchy-path">{getCustomerHierarchyPath(customer)}</td>
                      {/* <td className="head-office-hierarchy">{getHeadOfficeHierarchy(customer)}</td> */}
                      <td>
                        <span className={customer.is_active ? "status-active" : "status-inactive"}>
                          {customer.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="actions-col">
                        <div
                          style={{
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          {/* ASSIGN SITE */}
                          <button
                            type="button"
                            title="Assign Site"
                            aria-label={`Assign site to ${customerNameOf(customer)}`}
                            style={assignBtnStyle}
                            onClick={() => openAssignSite(customer.id)}
                          >
                            <FiMapPin size={16} />
                          </button>

                          {/* EDIT */}
                          <button
                            type="button"
                            title="Edit"
                            aria-label="Edit"
                            style={editBtnStyle}
                            onClick={() => openEditPanel(customer)}
                          >
                            <FiEdit2 size={16} />
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            title="Delete"
                            aria-label="Delete"
                            style={deleteBtnStyle}
                            onClick={() => setConfirmDelete(customer)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admins-table-card" style={{ overflowX: "auto" }}>
  {loading ? (
    <div className="admins-loading">Loading Customers...</div>
  ) : filteredCustomers.length === 0 ? (
    <div className="admins-empty">
      {customers.length === 0
        ? "No customers registered yet. Click “Create Customer” to create one."
        : "No customers match your search."}
    </div>
  ) : (
    <table className="admins-table" style={{ minWidth: "1100px" }}>
      {/* ... table content ... */}
    </table>
  )}
</div>

        </>
      )}

      {/* FORM */}
      {view === "form" && (
        <div className="admins-panel">
          <div className="admins-panel-header">
            {isEditing ? <FiEdit3 size={22} /> : <FiUserPlus size={22} />}
            <div>
              <h2>{isEditing ? "Edit Customer" : "Register New Customer"}</h2>
              <p>
                {isEditing
                  ? `Update details for ${form.company || form.code}.`
                  : "Register a new customer and configure their portal access and location hierarchy."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admins-form">
            {/* Customer info */}
            <div className="assign-card">
              <div className="assign-row">
                <span className="assign-label">Customer Information</span>
              </div>
              <div className="form-grid form-grid--spaced">
                <label>
                  Name *
                  <input type="text" value={form.company}
                    onChange={(e) => handleFieldChange("company", e.target.value)}
                    placeholder="HDFC Bank" />
                </label>
                <label>
                  Code *
                  <input type="text" value={form.code}
                    onChange={(e) => handleFieldChange("code", e.target.value.toUpperCase())}
                    placeholder="HDFC001" />
                </label>
                <label>
                  Short Name *
                  <input type="text" value={form.bank_short_name}
                    onChange={(e) => handleFieldChange("bank_short_name", e.target.value.toUpperCase())}
                    placeholder="HDFC" />
                </label>
                <label>
                  Type *
                  <select value={form.bank_type}
                    onChange={(e) => handleFieldChange("bank_type", e.target.value)}>
                    <option value="">Select Customer Type</option>
                    {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label>
                  Email *
                  <input type="email" value={form.company_email}
                    onChange={(e) => handleFieldChange("company_email", e.target.value)}
                    placeholder="admin@bank.com" />
                </label>
                <label>
                  Phone *
                  <input type="tel" value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+91 22 XXXXXXXX" />
                </label>
                <label>
                  Website
                  <input type="url" value={form.website}
                    onChange={(e) => handleFieldChange("website", e.target.value)}
                    placeholder="https://www.bank.com" />
                </label>
              </div>
            </div>

            {/* Head office */}
            <div className="assign-card assign-card--spaced">
              <div className="assign-row">
                <span className="assign-label">Head Office Details</span>
              </div>
              <div className="form-grid form-grid--spaced">
                <label className="form-grid__full">
                  Address Line 1 *
                  <input type="text" value={form.address_line_1}
                    onChange={(e) => handleFieldChange("address_line_1", e.target.value)}
                    placeholder="Building / Street / Area" />
                </label>
                <label>
                  State *
                  <select value={form.state} required disabled={locationsLoading}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value, district: "", taluka: "", city: "" }))}>
                    <option value="">{locationsLoading ? "Loading states..." : "Select State"}</option>
                    {headOfficeOptions.states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label>
                  District *
                  <select value={form.district} required disabled={!form.state || locationsLoading}
                    onChange={(e) => setForm((p) => ({ ...p, district: e.target.value, taluka: "", city: "" }))}>
                    <option value="">Select District</option>
                    {headOfficeOptions.districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label>
                  Taluka *
                  <select value={form.taluka} required disabled={!form.district || locationsLoading}
                    onChange={(e) => setForm((p) => ({ ...p, taluka: e.target.value, city: "" }))}>
                    <option value="">Select Taluka</option>
                    {headOfficeOptions.talukas.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                {locationsError && <p className="form-error">{locationsError}</p>}
                <label>
                  PIN Code
                  <input type="text" maxLength={6} value={form.pincode}
                    onChange={(e) => handleFieldChange("pincode", e.target.value.replace(/\D/g, ""))}
                    placeholder="411001" />
                </label>
              </div>
            </div>

            {/* Contact person */}
            <div className="assign-card assign-card--spaced">
              <div className="assign-row">
                <span className="assign-label">Contact Person Details</span>
              </div>
              <div className="form-grid form-grid--spaced">
                <label>
                  Name *
                  <input type="text" value={form.contact_person}
                    onChange={(e) => handleFieldChange("contact_person", e.target.value)}
                    placeholder="Rahul Sharma" />
                </label>
                <label>
                  Email *
                  <input type="email" value={form.contact_person_email}
                    onChange={(e) => handleFieldChange("contact_person_email", e.target.value)}
                    placeholder="admin@bank.com" />
                  <small className="field-hint">This email will be used for portal login.</small>
                </label>
                <label>
                  Mobile *
                  <input type="tel" value={form.admin_mobile}
                    onChange={(e) => handleFieldChange("admin_mobile", e.target.value)}
                    placeholder="+91 00000 00000" />
                </label>
                <label>
                  {isEditing ? "Login Password (leave blank to keep current)" : "Login Password *"}
                  <input type="password" value={form.password}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                    placeholder={isEditing ? "••••••••" : "Set a password"}
                    required={!isEditing} autoComplete="new-password" />
                </label>
                <label>
                  {isEditing ? "Confirm New Password" : "Confirm Password *"}
                  <input type="password" value={form.confirm_password}
                    onChange={(e) => handleFieldChange("confirm_password", e.target.value)}
                    placeholder="Confirm password"
                    required={!isEditing || Boolean(form.password)}
                    autoComplete="new-password" />
                </label>
              </div>
            </div>

            {/* Hierarchy selector */}
            <div className="assign-card assign-card--spaced">
              <div className="assign-row">
                <span className="assign-label">Location Hierarchy *</span>
              </div>
              <div className="hierarchy-options-grid">
                {HIERARCHY_OPTIONS.map((option) => {
                  const selected = selectedHierarchy === option.value;
                  return (
                    <div
                      key={option.value}
                      className={`hierarchy-option ${selected ? "is-selected" : ""} ${isEditing ? "is-fixed" : ""}`}
                    >
                      <label className="hierarchy-option__inner">
                        <input
                          type="radio"
                          name="hierarchy_type"
                          value={option.value}
                          checked={selected}
                          disabled={isEditing}
                          onChange={(e) => handleHierarchyChange(e.target.value)}
                        />
                        <div>
                          <div className="hierarchy-option__label">{option.label}</div>
                          {/* <div className="hierarchy-option__desc">{option.description}</div> */}
                          <div className="hierarchy-option__desc">
                            {option.value === "ZONAL"
                              ? `India → ${[
                                  "zone",
                                  ...(zonalConfig?.levels || ["circle", "branch", "floor"]).filter(
                                    (level) => level !== "zone"
                                  ),
                                ]
                                  .map(zonalLabel)
                                  .join(" → ")} (editable)`
                              : option.description}
                          </div>
                        </div>
                      </label>
                      {option.value === "ZONAL" && selected && !isEditing && (
                        <button
                          type="button"
                          className="btn-secondary hierarchy-option__edit"
                          title="Edit the hierarchy before saving this customer"
                          onClick={openHierarchyEditor}
                        >
                          Edit Hierarchy
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {isEditing && (
                <p className="hierarchy-note">
                  The hierarchy type remains fixed for an existing customer. You can edit its Zonal levels in step 3: Hierarchy.
                </p>
              )}
              {selectedHierarchy === "GEOGRAPHICAL" && (
                <p className="hierarchy-note hierarchy-note--tight">
                  <strong>Geographical hierarchy is fixed and cannot be customized.</strong>
                </p>
              )}
              {selectedHierarchy === "ZONAL" && (
                <p className="hierarchy-note hierarchy-note--tight">
                  <strong>Zonal hierarchy can be customized according to the user's needs.</strong>
                </p>
              )}
            </div>

            <div className="assign-card--spaced">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleFieldChange("is_active", e.target.checked)}
                />
                Active
              </label>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <div className="panel-actions">
              <button type="button" className="btn-secondary" onClick={backToList} disabled={saving}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Register & Continue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HIERARCHY STEP (Step 3) - rendered as a normal page, not a popup */}
      {view === "hierarchy" && (
        // <div className="hierarchy-step-page">
          <div className="admins-panel hierarchy-step-panel">
            <button className="btn-back" onClick={() => setView("form")}>
              <FiArrowLeft /> Back to customer
            </button>

            {/* <div className="admins-panel-header hierarchy-modal__header">
              <FiMapPin size={22} />
              <div>
                <h2>Configure Hierarchy</h2>
                <p>Configure the location structure for <strong>{form.company}</strong></p>
              </div>
            </div>

            <div className="assign-card">
              <div className="assign-row">
                <span className="assign-label">Customer</span>
                <span className="assign-value">{form.company || "-"}</span>
              </div>
              <div className="assign-row">
                <span className="assign-label">Code</span>
                <span className="assign-value">{form.code || "-"}</span>
              </div>
              <div className="assign-row">
                <span className="assign-label">Type</span>
                <span className="assign-value">{form.bank_type || "-"}</span>
              </div>
              <div className="assign-row">
                <span className="assign-label">Hierarchy</span>
                <span className="assign-value">{hierarchyName}</span>
              </div>
            </div> */}

            {selectedHierarchy === "GEOGRAPHICAL" && (
              <div className="assign-card hierarchy-card--tight">
                {/* <h3 style={{ marginTop: 0 }}>Geographical Hierarchy</h3> */}
                <div className="hierarchy-info-box">
                  <div className="hierarchy-info-box__title">India</div>
                  <div className="hierarchy-info-box__path">
                    India → State → District → Taluka → Branch
                  </div>
                  <div className="hierarchy-info-box__divider">
                    <strong>Branch can contain:</strong>
                    <ul className="hierarchy-info-box__list">
                      <li>Multiple Floors</li>
                      <li>Direct AC units</li>
                      <li>Both Floors and Direct AC units</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedHierarchy === "ZONAL" && (
              <div className="assign-card assign-card--spaced">
                {/* <h3 style={{ marginTop: 0 }}>Zonal Hierarchy</h3> */}

                {!isEditingZonalHierarchy ? (
                  <>
                    <div className="zonal-readonly">
                      <strong>India</strong>
                      <div className="zonal-readonly__path">
                        {`India → ${(zonalConfig?.levels || ["zone", "circle", "branch", "floor"])
                          .map(zonalLabel)
                          .join(" → ")}`}
                      </div>
                    </div>
                    <div className="panel-actions zonal-actions">
                      <button type="button" className="btn-primary" onClick={() => setIsEditingZonalHierarchy(true)}>
                        Edit Hierarchy
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="zonal-editor">
                    <p className="zonal-editor__intro">
                      Build the customer's location path by selecting the levels it uses. Required levels cannot be removed.
                    </p>

                    <div className="zonal-editor__grid">
                      {/* Administrative path */}
                      <section className="hierarchy-section">
                        <div className="hierarchy-section__head">
                          <div className="hierarchy-section__part">Part 1</div>
                          <h4 className="hierarchy-section__title">Administrative hierarchy</h4>
                          <p className="hierarchy-section__hint">Choose the path from Zone to Branch.</p>
                        </div>
                        <div className="hierarchy-levels">
                          <div className="hierarchy-levels__line" />
                          {[
                            { key: "zone", label: "Zone", required: true, hint: "Top administrative level" },
                            { key: "circle", label: "Circle", hint: "Optional administrative level" },
                            { key: "region", label: "Region", hint: "Optional administrative level" },
                            { key: "division", label: "Division", hint: "Available when Region is selected" },
                            { key: "branch", label: "Branch", required: true, hint: "Branch location" },
                          ].map((item, index) => {
                            const checked = (zonalConfig?.levels || []).includes(item.key);
                            const disabled =
                              Boolean(item.required) ||
                              (item.key === "division" && !(zonalConfig?.levels || []).includes("region"));
                            return (
                              <label
                                key={item.key}
                                className={`hierarchy-level ${checked ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}
                              >
                                <span className={`hierarchy-level__num ${checked ? "is-selected" : ""}`}>
                                  {index + 1}
                                </span>
                                <span className="hierarchy-level__body">
                                  <span className="hierarchy-level__title-row">
                                    {checked ? zonalLabel(item.key) : item.label}
                                    {checked && (
                                      <button
                                        type="button"
                                        title={`Edit ${item.label} heading`}
                                        aria-label={`Edit ${item.label} heading`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setEditingZonalLabelLevel(
                                            editingZonalLabelLevel === item.key ? null : item.key
                                          );
                                        }}
                                      >
                                        {/* <FiEdit2 size={12} /> */}
                                      </button>
                                    )}
                                  </span>
                                  {checked && editingZonalLabelLevel === item.key && (
                                    <input
                                      type="text"
                                      autoFocus
                                      className="hierarchy-level__label-input"
                                      value={(zonalConfig?.labels || {})[item.key] ?? ZONAL_LEVEL_DEFAULT_LABELS[item.key] ?? item.label}
                                      maxLength={60}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => updateZonalLabel(item.key, e.target.value)}
                                      placeholder={`Enter ${item.label} heading`}
                                    />
                                  )}
                                  <span className="hierarchy-level__sub">
                                    {item.required ? "Required" : item.hint}
                                  </span>
                                </span>
                                <input
                                  type="checkbox"
                                  className="hierarchy-level__checkbox"
                                  checked={checked}
                                  disabled={disabled}
                                  onChange={(e) => updateZonalConfig(item.key, e.target.checked)}
                                />
                              </label>
                            );
                          })}
                        </div>
                        <p className="hierarchy-levels__note">
                          You can connect Zone directly to Branch, or include Circle and/or Region. Division requires Region.
                        </p>
                      </section>

                      {/* Physical path */}
                      <section className="hierarchy-section">
                        <div className="hierarchy-section__head">
                          <div className="hierarchy-section__part">Part 2</div>
                          <h4 className="hierarchy-section__title">Physical hierarchy</h4>
                          <p className="hierarchy-section__hint">Choose how locations are organized after Branch.</p>
                        </div>
                        <div className="hierarchy-levels">
                          <div className="hierarchy-levels__line hierarchy-levels__line--green" />
                          {[
                            { key: "building", label: "Building", hint: "Optional; for multiple buildings" },
                            { key: "floor", label: "Floor", required: true, hint: "Required physical level" },
                            { key: "room", label: "Room", hint: "Optional; requires Floor" },
                          ].map((item, index) => {
                            const checked = (zonalConfig?.levels || []).includes(item.key);
                            const disabled =
                              Boolean(item.required) ||
                              (item.key === "room" && !(zonalConfig?.levels || []).includes("floor"));
                            return (
                              <label
                                key={item.key}
                                className={`hierarchy-level ${checked ? "is-selected is-selected--green" : ""} ${disabled ? "is-disabled" : ""}`}
                              >
                                <span className={`hierarchy-level__num ${checked ? "is-selected is-selected--green" : ""}`}>
                                  {index + 1}
                                </span>
                                <span className="hierarchy-level__body">
                                  <span className="hierarchy-level__title-row">
                                    {checked ? zonalLabel(item.key) : item.label}
                                    {checked && (
                                      <button
                                        type="button"
                                        title={`Edit ${item.label} heading`}
                                        aria-label={`Edit ${item.label} heading`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setEditingZonalLabelLevel(
                                            editingZonalLabelLevel === item.key ? null : item.key
                                          );
                                        }}
                                      >
                                        {/* <FiEdit2 size={12} /> */}
                                      </button>
                                    )}
                                  </span>
                                  {checked && editingZonalLabelLevel === item.key && (
                                    <input
                                      type="text"
                                      autoFocus
                                      className="hierarchy-level__label-input"
                                      value={(zonalConfig?.labels || {})[item.key] ?? ZONAL_LEVEL_DEFAULT_LABELS[item.key] ?? item.label}
                                      maxLength={60}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => updateZonalLabel(item.key, e.target.value)}
                                      placeholder={`Enter ${item.label} heading`}
                                    />
                                  )}
                                  <span className="hierarchy-level__sub">
                                    {item.required ? "Required" : item.hint}
                                  </span>
                                </span>
                                <input
                                  type="checkbox"
                                  className="hierarchy-level__checkbox hierarchy-level__checkbox--green"
                                  checked={checked}
                                  disabled={disabled}
                                  onChange={(e) => updateZonalConfig(item.key, e.target.checked)}
                                />
                              </label>
                            );
                          })}
                        </div>
                        <p className="hierarchy-levels__note">
                          Floor is directly under Branch unless Building is selected. Room is always under Floor.
                        </p>
                      </section>
                    </div>

                    {/* Physical hierarchy records */}
                    {form.id &&
                      (zonalConfig?.levels || []).some((l) => ["building", "floor", "room"].includes(l)) && (
                        <section className="physical-section">
                          <div className="physical-section__head">
                            <div>
                              <h4 className="physical-section__title">Physical hierarchy records</h4>
                              <p className="physical-section__hint">
                                Add buildings under branches, floors under buildings (or branches), and rooms under floors.
                                New records are saved immediately.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={loadPhysicalHierarchy}
                              disabled={physicalHierarchyLoading}
                            >
                              {physicalHierarchyLoading ? "Refreshing..." : "Refresh"}
                            </button>
                          </div>
                          {physicalHierarchyLoading && <p className="physical-loading">Loading physical hierarchy...</p>}
                          {physicalHierarchyError && (
                            <p role="alert" className="physical-error">{physicalHierarchyError}</p>
                          )}
                          {!physicalHierarchyLoading && physicalHierarchy.length === 0 && (
                            <p className="physical-empty">
                              No branches found for this customer yet. Create branches first, then add physical levels here.
                            </p>
                          )}
                          <div className="physical-tree">
                            {physicalHierarchy.map((branch) => (
                              <div key={branch.id} className="physical-branch">
                                <div className="physical-branch__head">
                                  <strong className="physical-branch__title">
                                    {branch.name} <span className="physical-branch__tag">(Branch)</span>
                                  </strong>
                                  <div className="physical-branch__actions">
                                    {(zonalConfig?.levels || []).includes("building") && (
                                      <button type="button" className="btn-secondary"
                                        onClick={() => openPhysicalNodeForm("building", { id: branch.id })}>
                                        <FiPlus /> Building
                                      </button>
                                    )}
                                    {!(zonalConfig?.levels || []).includes("building") && (
                                      <button type="button" className="btn-secondary"
                                        onClick={() => openPhysicalNodeForm("floor", { id: branch.id, type: "branch" })}>
                                        <FiPlus /> Floor
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="physical-branch__children">
                                  {branch.buildings.map((building) => (
                                    <div key={building.id} className="physical-building">
                                      <div className="physical-building__head">
                                        <strong>
                                          {building.name} <span className="physical-building__tag">(Building)</span>
                                        </strong>
                                        {(zonalConfig?.levels || []).includes("floor") && (
                                          <button type="button" className="btn-secondary"
                                            onClick={() =>
                                              openPhysicalNodeForm("floor", {
                                                id: building.id,
                                                type: "building",
                                                branchId: branch.id,
                                              })
                                            }
                                          >
                                            <FiPlus /> Floor
                                          </button>
                                        )}
                                      </div>
                                      <div className="physical-building__children">
                                        {building.floors.map((floor) => (
                                          <div key={floor.id} className="physical-floor">
                                            <div className="physical-floor__head">
                                              <span>
                                                {floor.name} <span className="physical-floor__tag">(Floor)</span>
                                              </span>
                                              {(zonalConfig?.levels || []).includes("room") && (
                                                <button type="button" className="btn-secondary"
                                                  onClick={() => openPhysicalNodeForm("room", { id: floor.id })}>
                                                  <FiPlus /> Room
                                                </button>
                                              )}
                                            </div>
                                            {floor.rooms.map((room) => (
                                              <div key={room.id} className="physical-room">
                                                └ {room.name} <span className="physical-room__tag">(Room)</span>
                                              </div>
                                            ))}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  {branch.directFloors.map((floor) => (
                                    <div key={floor.id} className="physical-floor">
                                      <div className="physical-floor__head">
                                        <span>
                                          {floor.name} <span className="physical-floor__tag">(Floor)</span>
                                        </span>
                                        {(zonalConfig?.levels || []).includes("room") && (
                                          <button type="button" className="btn-secondary"
                                            onClick={() => openPhysicalNodeForm("room", { id: floor.id })}>
                                            <FiPlus /> Room
                                          </button>
                                        )}
                                      </div>
                                      {floor.rooms.map((room) => (
                                        <div key={room.id} className="physical-room">
                                          └ {room.name} <span className="physical-room__tag">(Room)</span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                    {physicalNodeModal && (
                      <div role="dialog" aria-modal="true"
                        aria-label={`Add ${physicalNodeModal.type}`}
                        className="physical-node-form">
                        <form onSubmit={savePhysicalNode}>
                          <h4>
                            Add {physicalNodeModal.type.charAt(0).toUpperCase() + physicalNodeModal.type.slice(1)}
                          </h4>
                          <label>
                            Name
                            <input required maxLength={255}
                              value={physicalNodeForm.name}
                              onChange={(e) => setPhysicalNodeForm((c) => ({ ...c, name: e.target.value }))}
                              placeholder={`Enter ${physicalNodeModal.type} name`} />
                          </label>
                          <label>
                            Code
                            <div className="physical-node-form__input-save">
                              <input required maxLength={50}
                                value={physicalNodeForm.code}
                                onChange={(e) => setPhysicalNodeForm((c) => ({ ...c, code: e.target.value }))}
                                placeholder={`Enter unique ${physicalNodeModal.type} code`} />
                              <button type="submit" className="physical-node-form__save-icon"
                                aria-label={`Save ${physicalNodeModal.type}`}
                                title={`Save ${physicalNodeModal.type}`}
                                disabled={savingPhysicalNode || !physicalNodeForm.name.trim() || !physicalNodeForm.code.trim()}>
                                {savingPhysicalNode ? <span className="physical-node-form__spinner" /> : <FiCheckCircle />}
                              </button>
                            </div>
                          </label>
                          <div className="physical-node-form__actions">
                            <button type="button" className="btn-secondary"
                              disabled={savingPhysicalNode}
                              onClick={() => setPhysicalNodeModal(null)}>
                              Cancel
                            </button>
                            <small>Save immediately to the database</small>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Live preview */}
                    <div className="live-preview">
                      <div className="live-preview__label">Live preview</div>
                      <div className="live-preview__path">
                        {["zone", ...(zonalConfig?.levels || []).filter((l) => l !== "zone")].map((level, index, items) => (
                          <React.Fragment key={level}>
                            <span
                              className={`live-preview__chip ${
                                ["building", "floor", "room"].includes(level)
                                  ? "live-preview__chip--physical"
                                  : ""
                              }`}
                            >
                              {zonalLabel(level)}
                            </span>
                            {index < items.length - 1 && (
                              <span className="live-preview__arrow">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="live-preview__hint">
                        This is the hierarchy that will be used for this customer when saved.
                      </p>
                    </div>

                    <div className="panel-actions panel-actions--spaced">
                      <button type="button" className="btn-secondary"
                        disabled={savingZonalConfig}
                        onClick={() => {
                          setZonalConfig(
                            form.zonal_hierarchy_config || {
                              version: 1,
                              levels: ["zone", "circle", "branch", "floor"],
                              labels: { ...ZONAL_LEVEL_DEFAULT_LABELS },
                            }
                          );
                          setIsEditingZonalHierarchy(false);
                          setHierarchyError("");
                          setView("form");
                        }}>
                        Cancel
                      </button>
                      <button type="button" className="btn-primary"
                        disabled={savingZonalConfig}
                        onClick={saveZonalHierarchyConfig}>
                        {savingZonalConfig ? "Saving..." : "Save Hierarchy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {hierarchyError && <div className="form-error">{hierarchyError}</div>}

            {/* <div className="panel-actions">
              <button type="button" className="btn-secondary" onClick={() => setView("form")}>
                Back to Customer
              </button>
              <button type="button" className="btn-secondary" onClick={backToList}>
                Save and Exit
              </button>
            </div> */}
          </div>
        // </div>
      )}

      {/* ASSIGN SITE */}
      {view === "assignSite" && (
        <div className="admins-panel">
          <div className="admins-panel-header">
            <FiMapPin size={22} />
            <div>
              <h2>Assign Customer to Branch</h2>
              <p>Select a customer and one of its Branch to create the assignment.</p>
            </div>
          </div>

          {assignLoading ? (
            <div className="admins-loading">Loading customers and branch...</div>
          ) : (
            <form onSubmit={handleAssignSite} className="admins-form">
              <div className="assign-card">
                <div className="form-grid">
                  <label>
                    Select Customer *
                    <select value={assignCustomerId}
                      onChange={(e) => {
                        setAssignCustomerId(e.target.value);
                        setAssignSiteId("");
                        setAssignError("");
                        setAssignSuccess("");
                      }}>
                      <option value="">Choose a customer</option>
                      {assignCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {customerNameOf(c)}{c.code ? ` (${c.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Select Branch *
                    <select value={assignSiteId}
                      onChange={(e) => {
                        setAssignSiteId(e.target.value);
                        setAssignError("");
                        setAssignSuccess("");
                      }}
                      disabled={!assignCustomerId}>
                      <option value="">Choose a branch</option>
                      {assignSites.map((site) => {
                        const siteId = site.tpt_site_id ?? site.id;
                        return (
                          <option key={String(siteId)} value={String(siteId)}>
                            {site.name || "Unnamed site"}{site.code ? ` (${site.code})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                </div>

                {assignCustomerId && (
                  <div className="assign-site-summary">
                    <h3>Assignment Summary</h3>
                    <p>
                      <strong>Customer:</strong>{" "}
                      {customerNameOf(
                        assignCustomers.find((c) => String(c.id) === String(assignCustomerId))
                      ) || "-"}
                    </p>
                    <p>
                      <strong>Branch:</strong>{" "}
                      {assignSites.find(
                        (s) => String(s.tpt_site_id ?? s.id) === String(assignSiteId)
                      )?.name || "Not selected"}
                    </p>
                  </div>
                )}
              </div>

              {assignError && <div className="form-error">{assignError}</div>}
              {assignSuccess && <div className="assign-success" role="status">{assignSuccess}</div>}

              <div className="panel-actions">
                <button type="button" className="btn-secondary" onClick={backToList} disabled={assignSaving}>
                  Save and Exit
                </button>
                {!assignSuccess && (
                  <button type="submit" className="btn-primary"
                    disabled={assignSaving || !assignCustomerId || !assignSiteId}>
                    {assignSaving ? "Assigning..." : "Assign Site"}
                  </button>
                )}
                {assignSuccess && (
                  <button type="button" className="btn-primary"
                    onClick={async () => { await fetchCustomers(); setView("list"); }}>
                    <FiCheckCircle /> Finish
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className="admins-modal-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
          <div className="admins-modal admins-modal-small" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Customer</h2>
            <p>
              Are you sure you want to delete <strong>{customerNameOf(confirmDelete)}</strong>?
              <br />This cannot be undone.
            </p>
            <div className="panel-actions">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn-danger-solid" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div key={toast.id} className={`admins-toast admins-toast-${toast.type}`} role="status">
          <span className="admins-toast-icon">{toast.type === "success" ? "✓" : "!"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default CustomerCreation;