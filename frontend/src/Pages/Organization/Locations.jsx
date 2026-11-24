

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, MapPin, Building2, Pencil } from "lucide-react";
import "./Locations.css";
import SearchableSelect from "./SearchableSelect ";

// const API_BASE = "http://192.168.1.9:8000/api";
// const API_BASE = import.meta.env.VITE_API_BASE_URL;

const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    `http://${window.location.hostname}:8000/api`;

const FILTER_LOCATIONS_URL = `${API_BASE}/v1/filters/locations/`;
const BRANCHES_URL = `${API_BASE}/branches/`;

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
        ...(token
        ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` }
        : {}),
    };
};

const fetchJSON = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) },
        cache: "no-store",
    });
    const raw = await response.text();
    let result = {};
    try {
        result = raw ? JSON.parse(raw) : {};
    } catch {
        result = { raw_response: raw };
    }
    if (!response.ok) {
        throw new Error(
            result?.message || result?.detail || result?.error ||
            result?.raw_response || `HTTP ${response.status}`
        );
    }
    return result;
};

const getList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.branches)) return response.branches;
    return [];
};

const getItemId = (item) => 
    String(item?.id ?? item?.uuid ?? item?.pk ?? "");
const getItemLabel = (item) =>
    item?.name ?? item?.title ?? item?.city_name ?? item?.state_name ??
    item?.company_name ?? item?.company ?? item?.customer_name ?? item?.code ??
    getItemId(item);

const normalize = (value) =>
    String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const EMPTY_SELECTION = {
    state: "", 
    district: "", 
    taluka: "", 
    zone: "", 
    circle: "", 
    region: "", 
    division: "",
};

const EMPTY_OPTIONS = {
    states: [], 
    districts: [], 
    talukas: [], 
    zones: [], 
    circles: [], 
    regions: [], 
    divisions: [],
};

const HIERARCHY_CONFIG = {
    GEOGRAPHICAL: [
        { name: "state", id: "state_id", children: "districts" },
        { name: "district", id: "district_id", children: "talukas" },
        { name: "taluka", id: "taluka_id", children: "cities" },
    ],
    ZONAL: [
        { name: "zone", id: "zone_id", children: "circles" },
        { name: "circle", id: "circle_id", children: "regions" },
        { name: "region", id: "region_id", children: "divisions" },
        { name: "division", id: "division_id", children: "branches" },
    ],
};

const nodeId = (node, level) =>
    String(node?.[`${level}_id`] ?? node?.id?.id ?? node?.id ?? node?.uuid ?? "");
const nodeName = (node, level) =>
    String(node?.[`${level}_name`] ?? node?.name ?? node?.title ?? node?.code ?? "");

const getIndiaNode = (tree) => {
    const list = Array.isArray(tree) ? tree : [];
    return list.find((item) => normalize(item?.country_name || item?.name) === "india") || list[0] || null;
};

const getStateOptions = (tree) => {
    const india = getIndiaNode(tree);
    const states = india?.states || india?.children || [];
    return states.map((state) => ({
        id: String(state?.state_id ?? state?.id ?? state?.code ?? ""),
        name: String(state?.state_name ?? state?.name ?? ""),
        raw: state,
    })).filter((state) => state.id && state.name);
};

const getCitiesForState = (stateNode) => {
    const cities = [];
    const walk = (node) => {
        if (!node || typeof node !== "object") return;
        (node.cities || []).forEach((city) => {
            cities.push({
                id: String(city?.city_id ?? city?.id ?? city?.code ?? ""),
                name: String(city?.city_name ?? city?.name ?? ""),
            });
        });
        (node.districts || []).forEach(walk);
        (node.talukas || []).forEach(walk);
    };
    walk(stateNode);
    return cities.filter((city) => city.id && city.name);
};

function Locations () {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
    const [customerHierarchy, setCustomerHierarchy] = useState("");
    const [customerLocationTree, setCustomerLocationTree] = useState([]);
    const [zoneRecords, setZoneRecords] = useState([]);
    const [geographicalMasterTree, setGeographicalMasterTree] = useState([]);
    const [zoneGeographyMode, setZoneGeographyMode] = useState("");
    const [geographicStateId, setGeographicStateId] = useState("");
    const [geographicCityId, setGeographicCityId] = useState("");
    const [hierarchySelection, setHierarchySelection] = useState(EMPTY_SELECTION);
    const [showCreate, setShowCreate] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", code: "", ifsc_code: "", address: "", pincode: "", latitude: "", longitude: "", is_active: true });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");
    const [zonalParentModal, setZonalParentModal] = useState(null);
    const [zonalParentName, setZonalParentName] = useState("");
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [branchForm, setBranchForm] = useState({
        name: "",
        code: "",
        address: "",
        ifsc:"",
        pincode: "",
        latitude: "",
        longitude: "",
    });

    const loadBranches = useCallback(async (customerId = selectedCustomer, isRefresh = false) => {
        try {
            if (isRefresh) 
                setRefreshing(true);
            else 
                setLoading(true);
            setError("");
            const suffix = customerId ? `?customer=${encodeURIComponent(customerId)}` : "";
            const result = await fetchJSON(`${BRANCHES_URL}${suffix}`);
            setBranches(getList(result));
        } catch (err) {
            setError(err.message || "Unable to load branches.");
            setBranches([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCustomer]);

    // useEffect(() => {
    //     let cancelled = false;
    //     (async () => {
    //     try {
    //         const response = await fetchJSON(`${API_BASE}/auth/me/`);
    //         const user = response?.user ?? response?.data ?? response;
    //         if (cancelled) 
    //             return;
    //         setCurrentUser(user);
    //         const role = String(user?.role ?? user?.user_role ?? "").toUpperCase();
    //         if (role === "CUSTOMER") {
    //             const customerId = user?.customer_id ?? user?.customer?.id ?? user?.customer;
    //             if (!customerId) 
    //                 throw new Error("Your login is not linked to a customer.");
    //             setSelectedCustomer(String(customerId));
    //         } else if (role === "ORG_SUPER_ADMIN") {
    //         const customerResponse = await fetchJSON(`${API_BASE}/customers/`);
    //         if (!cancelled) 
    //             setCustomers(getList(customerResponse));
    //         } else {
    //             throw new Error("Your account does not have permission to manage branches.");
    //         }
    //     } catch (err) {
    //         if (!cancelled) setError(err.message || "Unable to load user/customer context.");
    //     }
    //     })();
    //     return () => { cancelled = true; };
    // }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const response = await fetchJSON(`${API_BASE}/auth/me/`);

                // Support different API response structures
                const user =
                    response?.user?.user ??
                    response?.user ??
                    response?.data?.user ??
                    response?.data ??
                    response;

                if (cancelled) return;

                setCurrentUser(user);

                const role = String(
                    user?.role ??
                    user?.user_role ??
                    user?.role_name ??
                    ""
                ).trim().toUpperCase();

                console.log("Current user:", user);
                console.log("Current role:", role);

                if (role === "CUSTOMER") {
                    const customerId =
                        user?.customer_id ??
                        user?.customer?.id ??
                        user?.customer;

                    if (!customerId) {
                        throw new Error(
                            "Your login is not linked to a customer."
                        );
                    }

                    setSelectedCustomer(String(customerId));

                } else if (role === "ORG_SUPER_ADMIN") {

                    const customerResponse = await fetchJSON(
                        `${API_BASE}/customers/`
                    );

                    if (!cancelled) {
                        setCustomers(getList(customerResponse));
                    }

                } else {
                    throw new Error(
                        `Unsupported account role: ${role || "ROLE NOT FOUND"}`
                    );
                }

            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load user/customer context.");
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);


    useEffect(() => {
        if (!selectedCustomer) {
            setSelectedCustomerDetails(null);
            setCustomerHierarchy("");
            setCustomerLocationTree([]);
            setZoneRecords([]);
            setGeographicalMasterTree([]);
            setZoneGeographyMode("");
            setGeographicStateId("");
            setGeographicCityId("");

            const role = String(
                currentUser?.role ?? currentUser?.user_role ?? ""
            ).toUpperCase();

            if (role === "ORG_SUPER_ADMIN") {
                // "All" selected → load every branch across customers
                loadBranches("", false);
            } else {
                setBranches([]);
                setLoading(false);
            }
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                setError("");
                const customerResponse = await fetchJSON(
                    `${API_BASE}/customers/${encodeURIComponent(selectedCustomer)}/`
                );
                const customer = customerResponse?.customer
                    ?? customerResponse?.data
                    ?? customerResponse;
                const type = String(customer?.hierarchy_type ?? "").toUpperCase();
                if (type !== "GEOGRAPHICAL" && type !== "ZONAL") {
                    throw new Error("The selected customer has no valid hierarchy configured.");
                }
                if (cancelled) return;
                setSelectedCustomerDetails(customer);
                setCustomerHierarchy(type);

                const params = new URLSearchParams({
                    hierarchy: type,
                    customer_id: selectedCustomer,
                    t: String(Date.now()),
                });
                const tree = await fetchJSON(`${FILTER_LOCATIONS_URL}?${params.toString()}`);
                if (cancelled) return;
                setCustomerLocationTree(Array.isArray(tree?.data) ? tree.data : []);

                if (type === "ZONAL") {
                    const [zonesResponse, geoResponse] = await Promise.all([
                        fetchJSON(`${API_BASE}/zones/?customer=${encodeURIComponent(selectedCustomer)}`),
                        fetchJSON(`${FILTER_LOCATIONS_URL}?hierarchy=GEOGRAPHICAL&customer_id=${encodeURIComponent(selectedCustomer)}&t=${Date.now()}`),
                    ]);
                    if (cancelled) return;
                    setZoneRecords(getList(zonesResponse));
                    setGeographicalMasterTree(Array.isArray(geoResponse?.data) ? geoResponse.data : []);
                } else {
                    setZoneRecords([]);
                    setGeographicalMasterTree([]);
                }
                await loadBranches(selectedCustomer);
            } catch (err) {
                if (!cancelled) setError(err.message || "Unable to load customer hierarchy.");
            }
        })();

        return () => { cancelled = true; };
    }, [selectedCustomer, loadBranches, currentUser]);

    // The customer's saved configuration is the source of truth for Zonal
    // parent levels. Keep the canonical order, but omit levels not selected
    // for this customer (for example Zone -> Branch or Zone -> Region -> Branch).
    const zonalLevels = useMemo(() => {
        const configured = selectedCustomerDetails?.zonal_hierarchy_config?.levels;
        return Array.isArray(configured) && configured.length
            ? configured
            : ["zone", "circle", "branch", "floor"];
    }, [selectedCustomerDetails]);
    const zonalParentLevels = useMemo(() => {
        const branchIndex = zonalLevels.indexOf("branch");
        return branchIndex >= 0 ? zonalLevels.slice(0, branchIndex) : ["zone", "circle"];
    }, [zonalLevels]);
    const isDirectZoneBranch = customerHierarchy === "ZONAL" &&
        zonalParentLevels.length === 1 && zonalParentLevels[0] === "zone";
    const selectedZoneRecord = useMemo(() => zoneRecords.find(
        (zone) => String(zone.id ?? zone.pk) === String(hierarchySelection.zone) || String(zone.code ?? "") === String(hierarchySelection.zone)
    ) || null, [zoneRecords, hierarchySelection.zone]);
    const geographicalStates = useMemo(
        () => getStateOptions(geographicalMasterTree), [geographicalMasterTree]
    );
    const selectedGeographicalState = useMemo(() => geographicalStates.find(
        (state) => state.id === String(geographicStateId)
    ) || null, [geographicalStates, geographicStateId]);
    const geographicalCities = useMemo(
        () => getCitiesForState(selectedGeographicalState?.raw), [selectedGeographicalState]
    );

    useEffect(() => {
        setZoneGeographyMode(selectedZoneRecord?.geography_mode || "");
        setGeographicStateId("");
        setGeographicCityId("");
    }, [selectedZoneRecord?.id, selectedZoneRecord?.geography_mode]);
    const hierarchyLabel = (level) => {
        const configuredLabel = selectedCustomerDetails?.zonal_hierarchy_config?.labels?.[level];
        if (customerHierarchy === "ZONAL" && typeof configuredLabel === "string" && configuredLabel.trim()) {
            return configuredLabel.trim();
        }
        return ({
            state: "State", district: "District", taluka: "Taluka",
            zone: "Zone", circle: "Circle", region: "Region", division: "Division",
            branch: "Branch", building: "Building", floor: "Floor", room: "Room",
        }[level] || level.charAt(0).toUpperCase() + level.slice(1));
    };
    const childKeyFor = (level) => ({
        state: "districts", district: "talukas", taluka: "cities",
        zone: "zones", circle: "circles", region: "regions", division: "divisions",
        branch: "branches",
    }[level] || `${level}s`);

    const getHierarchyOptions = useCallback((targetLevel) => {
        if (!customerLocationTree.length) return [];
        const levels = customerHierarchy === "GEOGRAPHICAL"
            ? HIERARCHY_CONFIG.GEOGRAPHICAL.map((item) => item.name)
            : zonalParentLevels;
        const rootKey = customerHierarchy === "GEOGRAPHICAL" ? "states" : "zones";
        let nodes = customerLocationTree;
        const country = nodes.find((n) => normalize(n?.country_name) === "india");
        if (country?.[rootKey]) nodes = country[rootKey];
        else {
            const wrapper = nodes.find((n) => Array.isArray(n?.[rootKey]));
            if (wrapper) nodes = wrapper[rootKey];
        }
        for (const level of levels) {
            if (level === targetLevel) return Array.isArray(nodes) ? nodes : [];
            const selectedId = hierarchySelection[level];
            if (!selectedId) return [];
            const selected = nodes.find((n) => nodeId(n, level) === String(selectedId));
            if (!selected) return [];
            const nextLevel = levels[levels.indexOf(level) + 1];
            nodes = selected[childKeyFor(nextLevel)] || [];
        }
        return [];
    }, [customerHierarchy, customerLocationTree, hierarchySelection, zonalParentLevels]);

    const handleHierarchyChange = (level, value) => {
        const levels = customerHierarchy === "GEOGRAPHICAL"
            ? HIERARCHY_CONFIG.GEOGRAPHICAL.map((item) => item.name)
            : zonalParentLevels;
        const index = levels.indexOf(level);
        setHierarchySelection((previous) => {
            const next = { ...previous, [level]: value };
            for (let i = index + 1; i < levels.length; i++) next[levels[i]] = "";
            return next;
        });
    };

    // Create a missing customer-specific Zonal parent directly from its dropdown.
    // The new record is selected after the customer hierarchy tree is refreshed.
    const addZonalParent = async (level) => {
        if (customerHierarchy !== "ZONAL" || !selectedCustomer) return;
        const levelIndex = zonalParentLevels.indexOf(level);
        const parentLevel = levelIndex > 0 ? zonalParentLevels[levelIndex - 1] : null;
        const parentId = parentLevel ? hierarchySelection[parentLevel] : "";
        if (parentLevel && !parentId) {
            setFormError(`Select ${hierarchyLabel(parentLevel)} before adding ${hierarchyLabel(level)}.`);
            return;
        }

        setZonalParentName("");
        setZonalParentModal({ level, parentId });
        return;
        // const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-6);
        // const payload = { name, code };
        // if (level === "zone") payload.customer = selectedCustomer;
        // if (level === "circle") payload.zone = parentId;
        // if (level === "region") {
        //     if (parentLevel === "circle") payload.circle = parentId;
        //     else if (parentLevel === "zone") payload.zone = parentId;
        // }
        // if (level === "division") payload.region = parentId;

        // const endpoint = ({ zone: "zones", circle: "circles", region: "regions", division: "divisions" })[level];
        // try {
        //     setFormError("");
        //     setSuccess("");
        //     const created = await fetchJSON(`${API_BASE}/${endpoint}/`, {
        //         method: "POST",
        //         body: JSON.stringify(payload),
        //     });
        //     const createdRecord = created?.data ?? created?.[level] ?? created;
        //     const createdId = getItemId(createdRecord);
        //     if (!createdId) throw new Error(`${hierarchyLabel(level)} was created, but the API did not return its ID.`);

        //     const params = new URLSearchParams({
        //         hierarchy: "ZONAL", customer_id: selectedCustomer, t: String(Date.now()),
        //     });
        //     const tree = await fetchJSON(`${FILTER_LOCATIONS_URL}?${params.toString()}`);
        //     setCustomerLocationTree(Array.isArray(tree?.data) ? tree.data : []);
        //     setHierarchySelection((previous) => {
        //         const next = { ...previous, [level]: createdId };
        //         const start = zonalParentLevels.indexOf(level);
        //         for (let i = start + 1; i < zonalParentLevels.length; i++) next[zonalParentLevels[i]] = "";
        //         return next;
        //     });
        //     if (level === "zone") {
        //         const zones = await fetchJSON(`${API_BASE}/zones/?customer=${encodeURIComponent(selectedCustomer)}`);
        //         setZoneRecords(getList(zones));
        //     }
        //     setSuccess(`${hierarchyLabel(level)} added and selected.`);
        // } catch (err) {
        //     setFormError(err.message || `Unable to add ${hierarchyLabel(level)}.`);
        // }
    };

    const createZonalParent = async () => {
        if (!zonalParentModal || !zonalParentName.trim()) return;

        const { level, parentId } = zonalParentModal;
        const name = zonalParentName.trim();

        const code =
            name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "") +
            "-" +
            Date.now().toString().slice(-6);

        const payload = { name, code };

        if (level === "zone") payload.customer = selectedCustomer;
        if (level === "circle") payload.zone = parentId;

        if (level === "region") {
            if (zonalParentLevels[zonalParentLevels.indexOf(level) - 1] === "circle")
                payload.circle = parentId;
            else
                payload.zone = parentId;
        }

        if (level === "division") payload.region = parentId;

        const endpoint = {
            zone: "zones",
            circle: "circles",
            region: "regions",
            division: "divisions",
        }[level];

        try {
            setFormError("");
            setSuccess("");

            const created = await fetchJSON(`${API_BASE}/${endpoint}/`, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const createdRecord = created?.data ?? created?.[level] ?? created;
            const createdId = getItemId(createdRecord);

            if (!createdId) {
                throw new Error(`${hierarchyLabel(level)} was created, but the API did not return its ID.`);
            }

            const params = new URLSearchParams({
                hierarchy: "ZONAL",
                customer_id: selectedCustomer,
                t: String(Date.now()),
            });

            const tree = await fetchJSON(
                `${FILTER_LOCATIONS_URL}?${params.toString()}`
            );

            setCustomerLocationTree(Array.isArray(tree?.data) ? tree.data : []);

            setHierarchySelection((previous) => {
                const next = { ...previous, [level]: createdId };
                const start = zonalParentLevels.indexOf(level);

                for (let i = start + 1; i < zonalParentLevels.length; i++) {
                    next[zonalParentLevels[i]] = "";
                }

                return next;
            });

            if (level === "zone") {
                const zones = await fetchJSON(
                    `${API_BASE}/zones/?customer=${encodeURIComponent(selectedCustomer)}`
                );
                setZoneRecords(getList(zones));
            }

            setSuccess(`${hierarchyLabel(level)} added and selected.`);
            setZonalParentModal(null);
            setZonalParentName("");

        } catch (err) {
            setFormError(err.message || `Unable to add ${hierarchyLabel(level)}.`);
        }
    };

    const resetForm = () => {
        setHierarchySelection(EMPTY_SELECTION);
        setGeographicStateId("");
        setGeographicCityId("");
        setBranchForm({
            name: "",
            code: "",
            address: "",
            ifsc: "",
            pincode: "",
            latitude: "",
            longitude: "",
        });
        setFormError("");
        setSuccess("");
    };

    const createBranch = async (event) => {
        event.preventDefault();
        setFormError("");
        setSuccess("");
        if (!selectedCustomer || !customerHierarchy) {
            setFormError("Select a valid customer first.");
            return;
        }
        if (!branchForm.name.trim() || !branchForm.code.trim()) {
            setFormError("Branch name and branch code are required.");
            return;
        }
        if (branchForm.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(branchForm.ifsc)) {
            setFormError("IFSC code must be 11 characters (e.g. HDFC0001234).");
            return;
        }
        if (branchForm.pincode && !/^\d{6}$/.test(branchForm.pincode)) {
            setFormError("Pincode must contain exactly 6 digits.");
            return;
        }
        const payload = {
            customer_id: selectedCustomer,
            hierarchy_type: customerHierarchy,
            name: branchForm.name.trim(),
            code: branchForm.code.trim().toUpperCase(),
            ifsc: branchForm.ifsc.trim().toUpperCase(),   // <-- added
            address: branchForm.address.trim(),
            pincode: branchForm.pincode.trim(),
            latitude: branchForm.latitude === "" ? null : Number(branchForm.latitude),
            longitude: branchForm.longitude === "" ? null : Number(branchForm.longitude),
        };
        if (customerHierarchy === "GEOGRAPHICAL") {
            if (!hierarchySelection.state || !hierarchySelection.district || !hierarchySelection.taluka) {
                setFormError("Select State, District, and Taluka before creating the branch.");
                return;
            }
            payload.state_id = hierarchySelection.state;
            payload.district_id = hierarchySelection.district;
            payload.taluka_id = hierarchySelection.taluka;
        } else {
            const missingParent = zonalParentLevels.find((level) => !hierarchySelection[level]);
            if (missingParent) {
                setFormError(`Select ${hierarchyLabel(missingParent)} before creating the branch.`);
                return;
            }
            // Send only configured parent levels. The backend validates that
            // these records belong to this customer and form the correct chain.
            zonalParentLevels.forEach((level) => {
                payload[`${level}_id`] = hierarchySelection[level];
            });
            if (isDirectZoneBranch) {
                if (!zoneGeographyMode) {
                    setFormError("Choose State-wise or City-wise classification for this Zone.");
                    return;
                }
                if (!geographicStateId) {
                    setFormError("Select a State for this branch.");
                    return;
                }
                if (zoneGeographyMode === "CITY" && !geographicCityId) {
                    setFormError("Select a City for this branch.");
                    return;
                }
                payload.zone_geography_mode = zoneGeographyMode;
                payload.geographic_state_id = geographicStateId;
                if (zoneGeographyMode === "CITY") {
                    payload.geographic_city_id = geographicCityId;
                }
            }
        }

        try {
            setSaving(true);
            const response = await fetchJSON(`${API_BASE}/hierarchy-branch/create/`, {
                method: "POST",
                body: JSON.stringify(payload),
        });
        setSuccess(response?.message || "Branch created.");
        resetForm();
        setShowCreate(false);
        await loadBranches(selectedCustomer, true);
        if (isDirectZoneBranch) {
            const refreshedZones = await fetchJSON(`${API_BASE}/zones/?customer=${encodeURIComponent(selectedCustomer)}`);
            setZoneRecords(getList(refreshedZones));
        }
        // Refresh hierarchy so the new branch appears in the hierarchy selectors.
        const params = new URLSearchParams({
            hierarchy: customerHierarchy, customer_id: selectedCustomer, t: String(Date.now()),
        });
        const tree = await fetchJSON(`${FILTER_LOCATIONS_URL}?${params.toString()}`);
        setCustomerLocationTree(Array.isArray(tree?.data) ? tree.data : []);
        } catch (err) {
        setFormError(err.message || "Unable to create branch.");
        } finally {
        setSaving(false);
        }
    };

    const openEditBranch = (branch) => {
        setEditingBranch(branch);
        setEditForm({
            name: branch.name || "",
            code: branch.code || "",
            ifsc_code: branch.ifsc_code || branch.ifsc || "",
            address: branch.address || "",
            pincode: branch.pincode || "",
            latitude: branch.latitude ?? "",
            longitude: branch.longitude ?? "",
            is_active: branch.is_active !== false,
        });
        setFormError("");
        setSuccess("");
    };

    const saveBranchChanges = async (event) => {
        event.preventDefault();
        if (!editingBranch) return;
        setFormError("");
        setSuccess("");
        if (!editForm.name.trim() || !editForm.code.trim()) {
            setFormError("Branch name and branch code are required.");
            return;
        }
        if (editForm.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(editForm.ifsc_code)) {
            setFormError("IFSC code must be 11 characters (e.g. HDFC0001234).");
            return;
        }
        if (editForm.pincode && !/^\d{6}$/.test(editForm.pincode)) {
            setFormError("Pincode must contain exactly 6 digits.");
            return;
        }

        const branchId = editingBranch.id || editingBranch.pk;
        try {
            setSaving(true);
            await fetchJSON(`${BRANCHES_URL}${encodeURIComponent(branchId)}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: editForm.name.trim(),
                    code: editForm.code.trim().toUpperCase(),
                    ifsc_code: editForm.ifsc_code.trim().toUpperCase(),
                    address: editForm.address.trim(),
                    pincode: editForm.pincode.trim(),
                    latitude: editForm.latitude === "" ? null : Number(editForm.latitude),
                    longitude: editForm.longitude === "" ? null : Number(editForm.longitude),
                    is_active: Boolean(editForm.is_active),
                }),
            });
            setEditingBranch(null);
            setSuccess("Branch information updated successfully.");
            await loadBranches(selectedCustomer, true);
        } catch (err) {
            setFormError(err.message || "Unable to update branch information.");
        } finally {
            setSaving(false);
        }
    };

    const filteredBranches = useMemo(() => {
        const q = normalize(search);
        return branches.filter((branch) => {
        if (!q) return true;
        return [
            branch.name, branch.code, branch.address, branch.pincode,
            branch.state_name, branch.district_name, branch.taluka_name,
            branch.city_name, branch.zone_name, branch.circle_name,
            branch.region_name, branch.division_name, branch.customer_name,
            branch.tpt_branch_id,
        ].some((value) => normalize(value).includes(q));
        });
        }, [branches, search]);
        const filteredCustomers = useMemo(() => {
        const q = normalize(customerSearchTerm);
        return customers.filter((customer) =>
            normalize(getItemLabel(customer)).includes(q)
        );
    }, [customers, customerSearchTerm]);

    const selectedCustomerName = useMemo(() => {
        if (!selectedCustomer) return "All Customers";
        const customer = customers.find(
            (item) => getItemId(item) === String(selectedCustomer)
        );
        return customer ? getItemLabel(customer) : "Select Customer";
    }, [customers, selectedCustomer]);

    const totalStates = useMemo(
        () => new Set(branches.map((b) => normalize(b.state_name)).filter(Boolean)).size,
        [branches]
    );

    const hierarchyFields = customerHierarchy === "GEOGRAPHICAL"
        ? [["state", "State"], ["district", "District"], ["taluka", "Taluka"]]
        : zonalParentLevels.map((level) => [level, hierarchyLabel(level)]);

    return (
        <div className="locations-page">
            <div className="locations-header">
                <div className="locations-title">
                <h1>Branches</h1>
                <p>Branches synchronized with the customer's hierarchy</p>
                </div>
                <div className="locations-header-actions">
                <button type="button" className="refresh-btn" onClick={() => loadBranches(selectedCustomer, true)} disabled={refreshing}>
                    <RefreshCw size={17} className={refreshing ? "refresh-spinning" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
                <button type="button" className="add-site-btn" onClick={() => { resetForm(); setShowCreate(true); }}>
                    + Add Branch
                </button>
                </div>
            </div>

            {/* {String(currentUser?.role ?? currentUser?.user_role ?? "").toUpperCase() === "ORG_SUPER_ADMIN" && (
                <div className="branch-customer-search">
                    <label>Customer</label>

                    <div className="customer-search-wrapper">
                        <button
                            type="button"
                            className="customer-search-trigger"
                            onClick={() => {
                                setCustomerSearchOpen((previous) => !previous);
                                setCustomerSearchTerm("");
                            }}
                        >
                            <span className="customer-search-selected">
                                <Search size={17} />
                                {selectedCustomerName}
                            </span>

                            <span className={`customer-search-arrow ${customerSearchOpen ? "open" : ""}`}>
                                ▼
                            </span>
                        </button>

                        {customerSearchOpen && (
                            <div className="customer-search-dropdown">
                                <div className="customer-search-input">
                                    <Search size={16} />

                                    <input
                                        type="text"
                                        placeholder="Search customer..."
                                        value={customerSearchTerm}
                                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="customer-search-options">
                                    <button
                                        type="button"
                                        className={`customer-search-option ${!selectedCustomer ? "selected" : ""}`}
                                        onClick={() => {
                                            setSelectedCustomer("");
                                            setCustomerSearchOpen(false);
                                            setCustomerSearchTerm("");
                                        }}
                                    >
                                        All Customers
                                    </button>

                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map((customer) => {
                                            const customerId = getItemId(customer);

                                            return (
                                                <button
                                                    type="button"
                                                    key={customerId}
                                                    className={`customer-search-option ${
                                                        String(selectedCustomer) === customerId ? "selected" : ""
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedCustomer(customerId);
                                                        setCustomerSearchOpen(false);
                                                        setCustomerSearchTerm("");
                                                    }}
                                                >
                                                    {getItemLabel(customer)}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="customer-search-empty">
                                            No customers found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )} */}

            {String(currentUser?.role ?? currentUser?.user_role ?? "").toUpperCase() === "ORG_SUPER_ADMIN" && (
                <div className="branch-customer-search">
                    <label>Customer</label>
                    <SearchableSelect
                        value={selectedCustomer}
                        onChange={(val) => setSelectedCustomer(val)}
                        placeholder="Select Customer"
                        options={[
                            { value: "", label: "All" },
                            ...customers.map((c) => ({ value: getItemId(c), label: getItemLabel(c) }))
                        ]}
                    />
                </div>
            )}

            <div className="location-summary">
                <div className="summary-card">
                    <div className="summary-icon branch-icon"><Building2 size={21} /></div>
                    <div className="summary-content"><span>Total Branches</span><strong>{branches.length}</strong></div>
                </div>
                {/* <div className="summary-card">
                    <div className="summary-icon state-icon"><MapPin size={21} /></div>
                    <div className="summary-content"><span>States</span><strong>{totalStates}</strong></div>
                </div> */}
            </div>

            {error && <div className="location-error"><strong>Unable to load branches</strong><span>{error}</span></div>}

            <div className="sites-card">
                <div className="sites-card-header">
                <div><h2>Branch List</h2><p>Branches associated with the selected customer</p></div>
                <div style={{ position: "relative", minWidth: 240 }}>
                    <Search size={17} style={{ position: "absolute", left: 10, top: 12 }} />
                    <input className="admins-search" style={{ paddingLeft: 34, width: "100%" }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search branches..." />
                </div>
                </div>
                {loading ? (
                <div className="locations-loading"><div className="locations-spinner" /><span>Loading branches...</span></div>
                ) : filteredBranches.length === 0 ? (
                <div className="locations-loading">No branches found for this customer.</div>
                ) : (
                <div className="sites-table-wrap">
                    <table className="sites-table">
                        <thead>
                            <tr>
                                <th>Branch</th>
                                <th>Code</th>
                                <th>Hierarchy</th>
                                {/* <th>Parent</th> */}
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredBranches.map((branch) => {
                                const parent = branch.taluka_name || branch.city_name || branch.division_name || "—";
                                const hierarchy = branch.hierarchy_type || customerHierarchy || "—";
                                const sync = branch.tpt_sync_status || (branch.tpt_branch_id ? "SYNCED" : "UNKNOWN");
                                return (
                                    <tr key={branch.id || branch.pk || branch.code}>
                                    {(() => {
                                        const sameId = (a, b) =>
                                            a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b);
                                        const headOfficeCityId = selectedCustomerDetails?.head_office_city;
                                        const headOfficeDivisionId = selectedCustomerDetails?.head_office_division;
                                        const headOfficeHierarchy = String(selectedCustomerDetails?.head_office_hierarchy || "").toLowerCase();
                                        const isHeadOffice =
                                            sameId(branch.city, headOfficeCityId) ||
                                            sameId(branch.division, headOfficeDivisionId) ||
                                            (Boolean(branch.city_name) && Boolean(selectedCustomerDetails?.city) && normalize(branch.city_name) === normalize(selectedCustomerDetails.city)) ||
                                            (Boolean(branch.division_name) && Boolean(headOfficeHierarchy) && normalize(branch.division_name) === normalize(headOfficeHierarchy.split("→").pop()));
                                        return (
                                            <td>
                                                <span className="branch-name-cell">
                                                    {isHeadOffice && <span className="head-office-dot" title="Customer Head Office" aria-label="Customer Head Office" />}
                                                    <strong>{branch.name || "—"}</strong>
                                                </span>
                                            </td>
                                        );
                                    })()}
                                    <td>{branch.code || "—"}</td>
                                    <td>{hierarchy}</td>
                                    {/* <td>{parent}</td> */}
                                    <td>{branch.address || "—"}</td>
                                    <td>
                                        <button type="button" className="branch-edit-btn" onClick={() => openEditBranch(branch)} title="Edit branch information">
                                            <Pencil size={15} />
                                        </button>
                                    </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                )}
                <div className="sites-card-footer">
                    Showing <strong>{filteredBranches.length}</strong> of <strong>{branches.length}</strong> branches
                </div>
            </div>

            {editingBranch && (
                <div className="site-modal-overlay" role="presentation">
                    <div className="site-modal hierarchy-site-modal" role="dialog" aria-modal="true" aria-labelledby="edit-branch-title">
                        <div className="site-modal-header">
                            <div><h2 id="edit-branch-title">Edit Branch Information</h2><p>Update the selected branch details.</p></div>
                            <button type="button" className="modal-close-btn" disabled={saving} onClick={() => setEditingBranch(null)}>×</button>
                        </div>
                        <form onSubmit={saveBranchChanges}>
                            <div className="site-form-grid">
                                <div className="form-group"><label>Branch Name *</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></div>
                                <div className="form-group"><label>Branch Code *</label><input value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} required /></div>
                                <div className="form-group"><label>IFSC Code</label><input value={editForm.ifsc_code} onChange={(e) => setEditForm({ ...editForm, ifsc_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11) })} maxLength={11} placeholder="e.g. HDFC0001234" /></div>
                                <div className="form-group"><label>Pincode</label><input value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" maxLength={6} /></div>
                                <div className="form-group full-width"><label>Address</label><textarea rows={3} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
                                <div className="form-group"><label>Latitude</label><input type="number" step="any" min="-90" max="90" value={editForm.latitude} onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })} /></div>
                                <div className="form-group"><label>Longitude</label><input type="number" step="any" min="-180" max="180" value={editForm.longitude} onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })} /></div>
                                <div className="form-group"><label>Branch Status</label><select value={editForm.is_active ? "true" : "false"} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === "true" })}><option value="true">Active</option><option value="false">Inactive</option></select></div>
                            </div>
                            {formError && <div className="location-error"><span>{formError}</span></div>}
                            <div className="site-modal-footer">
                                <button type="button" className="cancel-btn" disabled={saving} onClick={() => setEditingBranch(null)}>Cancel</button>
                                <button type="submit" className="save-site-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCreate && (
                <div className="site-modal-overlay">
                <div className="site-modal hierarchy-site-modal">
                    <div className="site-modal-header">
                    <div><h2>Create Branch</h2><p>Select the customer's hierarchy parent, then enter branch details.</p></div>
                    <button type="button" className="modal-close-btn" disabled={saving} onClick={() => setShowCreate(false)}>×</button>
                    </div>
                    <form onSubmit={createBranch}>
                    <div className="site-form-grid">
                        {String(currentUser?.role ?? currentUser?.user_role ?? "").toUpperCase() === "ORG_SUPER_ADMIN" && (
                        <div className="form-group full-width">
                            <label>Customer *</label>
                            <select value={selectedCustomer} onChange={(e) => { setHierarchySelection(EMPTY_SELECTION); setCustomerHierarchy(""); setCustomerLocationTree([]); setSelectedCustomer(e.target.value); }} required>
                            <option value="">Select customer</option>
                            {customers.map((customer) => <option key={getItemId(customer)} value={getItemId(customer)}>{getItemLabel(customer)}</option>)}
                            </select>
                        </div>
                        )}
                        <div className="form-group full-width">
                            <label>Hierarchy Type</label>
                            <input value={customerHierarchy || "Select a customer"} readOnly />
                        </div>
                        {hierarchyFields.map(([key, label]) => (
                        <div className="form-group" key={key}>
                            <label>{label} *</label>
                            <select value={hierarchySelection[key]} onChange={(e) => handleHierarchyChange(key, e.target.value)} required>
                            <option value="">Select {label.toLowerCase()}</option>
                                {getHierarchyOptions(key).map((item) => (
                                    <option key={nodeId(item, key)} value={nodeId(item, key)}>{nodeName(item, key)}</option>
                                ))}
                            </select>
                            {customerHierarchy === "ZONAL" && ["ORG_SUPER_ADMIN", "CUSTOMER"].includes(String(currentUser?.role ?? currentUser?.user_role ?? "").toUpperCase()) && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    style={{ marginTop: 8, padding: "7px 12px" }}
                                    onClick={() => addZonalParent(key)}
                                    disabled={saving || (zonalParentLevels.indexOf(key) > 0 && !hierarchySelection[zonalParentLevels[zonalParentLevels.indexOf(key) - 1]])}
                                >
                                    + Add {label}
                                </button>
                            )}
                        </div>
                        ))}
                        {isDirectZoneBranch && hierarchySelection.zone && (
                            <>
                                <div className="form-group full-width">
                                    <label>Choose geographical classification for this Zone *</label>
                                    <div className="zone-geography-radio-group" role="radiogroup" aria-label="Zone geographical classification">
                                        <label className="zone-geography-radio-option">
                                            <input
                                                type="radio"
                                                name="zoneGeographyMode"
                                                value="STATE"
                                                checked={zoneGeographyMode === "STATE"}
                                                onChange={() => { setZoneGeographyMode("STATE"); setGeographicStateId(""); setGeographicCityId(""); }}
                                                disabled={Boolean(selectedZoneRecord?.geography_mode)}
                                                required
                                            />
                                            <span>State-wise</span>
                                        </label>
                                        <label className="zone-geography-radio-option">
                                            <input
                                                type="radio"
                                                name="zoneGeographyMode"
                                                value="CITY"
                                                checked={zoneGeographyMode === "CITY"}
                                                onChange={() => { setZoneGeographyMode("CITY"); setGeographicStateId(""); setGeographicCityId(""); }}
                                                disabled={Boolean(selectedZoneRecord?.geography_mode)}
                                            />
                                            <span>City-wise</span>
                                        </label>
                                    </div>
                                    {selectedZoneRecord?.geography_mode && <small>This Zone is already configured and its classification is locked.</small>}
                                </div>
                                {zoneGeographyMode && (
                                    <div className="form-group">
                                        <label>State *</label>
                                        <select value={geographicStateId} onChange={(e) => { setGeographicStateId(e.target.value); setGeographicCityId(""); }} required>
                                            <option value="">Select State</option>
                                            {geographicalStates.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                {zoneGeographyMode === "CITY" && geographicStateId && (
                                    <div className="form-group">
                                        <label>City *</label>
                                        <select value={geographicCityId} onChange={(e) => setGeographicCityId(e.target.value)} required>
                                            <option value="">Select City</option>
                                            {geographicalCities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="form-group"><label>Branch Name *</label><input value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} required placeholder="Enter branch name" /></div>
                        <div className="form-group"><label>Branch Code *</label><input value={branchForm.code} onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })} required placeholder="Unique branch code" /></div>
                        <div className="form-group">
                            <label>IFSC Code *</label>
                            <input
                                value={branchForm.ifsc}
                                onChange={(e) =>
                                    setBranchForm({
                                        ...branchForm,
                                        ifsc: e.target.value
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, "")
                                            .slice(0, 11),
                                    })
                                }
                                maxLength={11}
                                placeholder="e.g. HDFC0001234"
                            />
                        </div>
                        <div className="form-group"><label>Pincode</label><input value={branchForm.pincode} onChange={(e) => setBranchForm({ ...branchForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" maxLength={6} placeholder="6-digit pincode" /></div>
                        <div className="form-group full-width"><label>Address</label><textarea value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} rows={3} placeholder="Enter branch address" /></div>
                        <div className="form-group"><label>Latitude</label><input type="number" step="any" min="-90" max="90" value={branchForm.latitude} onChange={(e) => setBranchForm({ ...branchForm, latitude: e.target.value })} /></div>
                        <div className="form-group"><label>Longitude</label><input type="number" step="any" min="-180" max="180" value={branchForm.longitude} onChange={(e) => setBranchForm({ ...branchForm, longitude: e.target.value })} /></div>
                    </div>
                    {formError && <div className="location-error"><span>{formError}</span></div>}
                    {success && <div className="location-success"><span>{success}</span></div>}
                    <div className="site-modal-footer">
                        <button type="button" className="cancel-btn" disabled={saving} onClick={() => setShowCreate(false)}>Cancel</button>
                        <button type="submit" className="save-site-btn" disabled={saving || !selectedCustomer || !customerHierarchy}>
                        {saving ? "Creating..." : "Create Branch"}
                        </button>
                    </div>
                    
                    </form>
                </div>
                </div>
            )}
            {zonalParentModal && (
    <div className="zonal-parent-overlay">
        <div className="zonal-parent-modal">
            <div className="zonal-parent-header">
                <h3>Add {hierarchyLabel(zonalParentModal.level)}</h3>
                <button
                    type="button"
                    onClick={() => setZonalParentModal(null)}
                >
                    ×
                </button>
            </div>

            <div className="zonal-parent-body">
                <label>
                    {hierarchyLabel(zonalParentModal.level)} Name
                </label>

                <input
                    type="text"
                    value={zonalParentName}
                    onChange={(e) => setZonalParentName(e.target.value)}
                    placeholder={`Enter ${hierarchyLabel(zonalParentModal.level)} name`}
                    autoFocus
                />
            </div>

            <div className="zonal-parent-footer">
                <button
                    type="button"
                    className="zonal-cancel-btn"
                    onClick={() => setZonalParentModal(null)}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="zonal-save-btn"
                    disabled={!zonalParentName.trim()}
                    onClick={createZonalParent}
                >
                    Add {hierarchyLabel(zonalParentModal.level)}
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default Locations;
