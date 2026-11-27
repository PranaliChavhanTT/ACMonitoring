
import { useLocation, useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Building2, Trash2 } from "lucide-react";
import "./Locations.css";
import SearchableSelect from "./SearchableSelect ";
import { FiEdit2 } from "react-icons/fi";

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

const mapGeoNodes = (rows, idKey, nameKey) => (rows || []).map((row) => ({
    id: String(row?.[idKey] ?? row?.id ?? row?.code ?? ""),
    name: String(row?.[nameKey] ?? row?.name ?? ""),
    raw: row,
})).filter((row) => row.id && row.name);

const getDistrictsForState = (stateNode) => mapGeoNodes(stateNode?.districts, "district_id", "district_name");
const getTalukasForDistrict = (districtNode) => mapGeoNodes(districtNode?.talukas, "taluka_id", "taluka_name");
const getCitiesForTaluka = (talukaNode) => mapGeoNodes(talukaNode?.cities, "city_id", "city_name");

const deriveGeoMapping = (levels = []) => {
    const orgLevels = levels.filter((level) => ["zone", "circle", "region", "division", "branch"].includes(level));
    const sequence = orgLevels.length === 2 ? ["STATE", "CITY"]
        : orgLevels.length === 3 ? ["STATE", "DISTRICT", "CITY"]
        : ["STATE", "DISTRICT", "TALUKA", "CITY"];
    return Object.fromEntries(orgLevels.map((level, index) => [level, sequence[index] || null]));
};

function Locations () {
    const navigate = useNavigate();
    const location = useLocation();
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
    const [zoneTypeDraft, setZoneTypeDraft] = useState("GEOGRAPHICAL");
    const [zoneConfigDraft, setZoneConfigDraft] = useState(null);
    const [zoneCoverageSearch, setZoneCoverageSearch] = useState("");
    const [zonalGeoDraft, setZonalGeoDraft] = useState({ state_id: "", district_id: "", taluka_id: "", city_id: "" });
    const [branchGeoDraft, setBranchGeoDraft] = useState({ state_id: "", district_id: "", taluka_id: "", city_id: "" });
    const [physicalForm, setPhysicalForm] = useState({ building_name: "", building_code: "", floor_name: "", floor_code: "", room_name: "", room_code: "" });
    // Repeatable rows for creating multiple physical locations with a branch.
    const [newBuildings, setNewBuildings] = useState([]);
    const [newFloors, setNewFloors] = useState([]);
    const [newRooms, setNewRooms] = useState([]);
    const [showPhysicalLayers, setShowPhysicalLayers] = useState(false);
    const [physicalModalBranch, setPhysicalModalBranch] = useState(null);
    const [physicalModalType, setPhysicalModalType] = useState("building");
    const [physicalModalForm, setPhysicalModalForm] = useState({
        name: "", code: "", building: "", floor: ""
    });
    const [physicalBuildings, setPhysicalBuildings] = useState([]);
    const [physicalFloors, setPhysicalFloors] = useState([]);
    const [editPhysicalRooms, setEditPhysicalRooms] = useState([]);
    const [editPhysicalLoading, setEditPhysicalLoading] = useState(false);
    const [editPhysicalChecked, setEditPhysicalChecked] = useState(false);
    const [physicalAllowedLevels, setPhysicalAllowedLevels] = useState([]);
    const [physicalModalLoading, setPhysicalModalLoading] = useState(false);
    const [physicalModalSaving, setPhysicalModalSaving] = useState(false);
    const [physicalModalError, setPhysicalModalError] = useState("");
    const [physicalModalSuccess, setPhysicalModalSuccess] = useState("");
    // State-based Zones: type (District/Taluka/City) and ticked locations of the level being added.
    const [nextLevelType, setNextLevelType] = useState("");
    const [nextLevelIds, setNextLevelIds] = useState([]);
    const [nextLevelSearch, setNextLevelSearch] = useState("");
    const [nextLevelInfo, setNextLevelInfo] = useState({ allowed: [], locked: null, options: [], loading: false, error: "" });
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

    useEffect(() => {
        const result = location.state?.zonalStructureResult;
        if (!result) return;
        if (location.state?.customerId) setSelectedCustomer(String(location.state.customerId));
        setShowCreate(true);
        setZonalParentModal(location.state?.zonalParentModal || { level: "zone", parentId: null });
        setZonalParentName(location.state?.zonalParentName || "");
        setZoneTypeDraft(result.zoneType || "GEOGRAPHICAL");
        setZoneConfigDraft(result.config || null);
        navigate(location.pathname, { replace: true, state: {} });
    }, [location.state, location.pathname, navigate]);

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
        // Clear the previous customer's hierarchy immediately. This prevents
        // old zones remaining selectable while the next customer's DB tree loads.
        setCustomerLocationTree([]);
        setZoneRecords([]);
        setHierarchySelection(EMPTY_SELECTION);
        setCustomerHierarchy("");
        setBranchGeoDraft({ state_id: "", district_id: "", taluka_id: "", city_id: "" });
        setZonalGeoDraft({ state_id: "", district_id: "", taluka_id: "", city_id: "" });

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
                if (String(tree?.hierarchy_type || "").toUpperCase() !== type) {
                    throw new Error(`The server returned the wrong hierarchy for this customer (${type}).`);
                }
                setCustomerLocationTree(Array.isArray(tree?.data) ? tree.data : []);

                if (type === "ZONAL") {
                    const [zonesResponse, geoResponse] = await Promise.all([
                        fetchJSON(`${API_BASE}/zones/?customer=${encodeURIComponent(selectedCustomer)}`),
                        fetchJSON(`${FILTER_LOCATIONS_URL}?hierarchy=GEOGRAPHICAL`),
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

    const selectedZoneRecord = useMemo(() => zoneRecords.find(
        (zone) => String(zone.id ?? zone.pk) === String(hierarchySelection.zone) || String(zone.code ?? "") === String(hierarchySelection.zone)
    ) || null, [zoneRecords, hierarchySelection.zone]);
    // Each Zone owns its own hierarchy; customer config remains a legacy fallback.
    const zonalLevels = useMemo(() => {
        const configured = selectedZoneRecord?.hierarchy_config?.levels || selectedCustomerDetails?.zonal_hierarchy_config?.levels;
        return Array.isArray(configured) && configured.length ? configured : ["zone", "circle", "branch", "floor"];
    }, [selectedZoneRecord, selectedCustomerDetails]);
    const zonalParentLevels = useMemo(() => {
        const branchIndex = zonalLevels.indexOf("branch");
        return branchIndex >= 0 ? zonalLevels.slice(0, branchIndex) : ["zone", "circle"];
    }, [zonalLevels]);
    const zonalGeographicalMapping = useMemo(() => {
        const configured = selectedCustomerDetails?.zonal_hierarchy_config?.geographical_mapping;
        const base = configured && typeof configured === "object" ? configured : deriveGeoMapping(zonalLevels);
        const effectiveZoneType = zonalParentModal?.level === "zone"
            ? zoneTypeDraft
            : selectedZoneRecord?.zone_type;
        // State-based Zones pick their geography through the next-level flow, not the old single-id mapping.
        if (effectiveZoneType === "STATE_BASED") {
            return { zone: null, circle: null, region: null, division: null, branch: null };
        }
        if (effectiveZoneType === "CITY_BASED") {
            return { zone: "CITY", circle: null, region: null, division: null, branch: null };
        }
        return base;
    }, [selectedCustomerDetails, zonalLevels, zonalParentModal, zoneTypeDraft, selectedZoneRecord]);
    const branchGeographicalType = zonalGeographicalMapping?.branch || null;
    const isNextLevelFlow = !!zonalParentModal
        && ["circle", "region", "division"].includes(zonalParentModal.level)
        && selectedZoneRecord?.zone_type === "STATE_BASED";
    const nextLevelZoneId = selectedZoneRecord?.id ?? selectedZoneRecord?.pk ?? "";
    const nextLevelParentId = zonalParentModal?.parentId || "";
    const nextLevelName = zonalParentModal?.level || "";

    // Allowed types (and the locked one) for this level.
    useEffect(() => {
        setNextLevelType("");
        setNextLevelIds([]);
        setNextLevelSearch("");
        if (!isNextLevelFlow || !nextLevelZoneId) {
            setNextLevelInfo({ allowed: [], locked: null, options: [], loading: false, error: "" });
            return undefined;
        }
        let cancelled = false;
        setNextLevelInfo({ allowed: [], locked: null, options: [], loading: true, error: "" });
        const params = new URLSearchParams({ customer_id: selectedCustomer, zone_id: nextLevelZoneId, level: nextLevelName, parent_id: nextLevelParentId });
        fetchJSON(`${API_BASE}/zonal-geography/next-level-options/?${params.toString()}`)
            .then((res) => {
                if (cancelled) return;
                const data = res?.data || {};
                setNextLevelInfo({ allowed: data.allowed_types || [], locked: data.locked_type || null, options: [], loading: false, error: "" });
                if (data.locked_type) setNextLevelType(data.locked_type);
                else if ((data.allowed_types || []).length === 1) setNextLevelType(data.allowed_types[0]);
            })
            .catch((err) => {
                if (!cancelled) setNextLevelInfo({ allowed: [], locked: null, options: [], loading: false, error: err.message || "Unable to load options." });
            });
        return () => { cancelled = true; };
    }, [isNextLevelFlow, nextLevelZoneId, nextLevelName, nextLevelParentId, selectedCustomer]);

    // The checkbox list for the chosen type, limited to the parent's coverage.
    useEffect(() => {
        setNextLevelIds([]);
        if (!isNextLevelFlow || !nextLevelType || !nextLevelZoneId) return undefined;
        let cancelled = false;
        setNextLevelInfo((old) => ({ ...old, options: [], loading: true, error: "" }));
        const params = new URLSearchParams({ customer_id: selectedCustomer, zone_id: nextLevelZoneId, level: nextLevelName, parent_id: nextLevelParentId, location_type: nextLevelType });
        fetchJSON(`${API_BASE}/zonal-geography/next-level-options/?${params.toString()}`)
            .then((res) => {
                if (!cancelled) setNextLevelInfo((old) => ({ ...old, options: res?.data?.options || [], loading: false }));
            })
            .catch((err) => {
                if (!cancelled) setNextLevelInfo((old) => ({ ...old, options: [], loading: false, error: err.message || "Unable to load options." }));
            });
        return () => { cancelled = true; };
    }, [nextLevelType, isNextLevelFlow, nextLevelZoneId, nextLevelName, nextLevelParentId, selectedCustomer]);

    // Physical layers this customer actually has in its hierarchy.
    const physicalLevels = useMemo(() => {
        if (customerHierarchy !== "ZONAL") return ["floor", "room"];
        const configured = selectedCustomerDetails?.zonal_hierarchy_config?.levels;
        const list = Array.isArray(configured) && configured.length ? configured : ["floor"];
        return list.filter((x) => ["building", "floor", "room"].includes(x));
    }, [customerHierarchy, selectedCustomerDetails]);
    const getAllowedPhysicalLevelsForBranch = useCallback((branch, customerDetails = selectedCustomerDetails, hierarchyType = customerHierarchy) => {
        if (hierarchyType === "GEOGRAPHICAL") return ["floor", "room"];
        if (hierarchyType !== "ZONAL") return [];

        const branchZoneId = String(
            branch?.zone_id ?? branch?.zone?.id ?? branch?.zone ?? ""
        );
        const branchZone = zoneRecords.find((zone) =>
            String(zone.id ?? zone.pk) === branchZoneId
        );
        const zoneLevels = branchZone?.hierarchy_config?.levels;
        const customerLevels = customerDetails?.zonal_hierarchy_config?.levels;
        const configured = Array.isArray(zoneLevels) && zoneLevels.length
            ? zoneLevels
            : customerLevels;
        if (!Array.isArray(configured)) return [];
        return ["building", "floor", "room"].filter((level) => configured.includes(level));
    }, [customerHierarchy, zoneRecords, selectedCustomerDetails]);

    const hasBuildingLevel = physicalLevels.includes("building");
    const hasFloorLevel = physicalLevels.includes("floor");
    const hasRoomLevel = physicalLevels.includes("room");
    const isDirectZoneBranch = customerHierarchy === "ZONAL" &&
        zonalParentLevels.length === 1 && zonalParentLevels[0] === "zone";
    const geographicalStates = useMemo(
        () => getStateOptions(geographicalMasterTree), [geographicalMasterTree]
    );
    const selectedGeographicalState = useMemo(() => geographicalStates.find(
        (state) => state.id === String(geographicStateId)
    ) || null, [geographicalStates, geographicStateId]);
    const geographicalCities = useMemo(
        () => getCitiesForState(selectedGeographicalState?.raw), [selectedGeographicalState]
    );
    const zonalGeoState = geographicalStates.find((x) => x.id === String(zonalGeoDraft.state_id));
    const zonalGeoDistricts = getDistrictsForState(zonalGeoState?.raw);
    const zonalGeoDistrict = zonalGeoDistricts.find((x) => x.id === String(zonalGeoDraft.district_id));
    const zonalGeoTalukas = getTalukasForDistrict(zonalGeoDistrict?.raw);
    const zonalGeoTaluka = zonalGeoTalukas.find((x) => x.id === String(zonalGeoDraft.taluka_id));
    const zonalGeoCities = getCitiesForTaluka(zonalGeoTaluka?.raw);
    const branchGeoState = geographicalStates.find((x) => x.id === String(branchGeoDraft.state_id));
    const branchGeoDistricts = getDistrictsForState(branchGeoState?.raw);
    const branchGeoDistrict = branchGeoDistricts.find((x) => x.id === String(branchGeoDraft.district_id));
    const branchGeoTalukas = getTalukasForDistrict(branchGeoDistrict?.raw);
    const branchGeoTaluka = branchGeoTalukas.find((x) => x.id === String(branchGeoDraft.taluka_id));
    const branchGeoCities = getCitiesForTaluka(branchGeoTaluka?.raw);
    const allZoneCities = useMemo(() => geographicalStates.flatMap((state) =>
        getCitiesForState(state.raw).map((city) => ({
            ...city,
            state_id: state.id,
            state_name: state.name,
            key: city.id,
        }))
    ), [geographicalStates]);
    const zoneCoverageOptions = zoneTypeDraft === "STATE_BASED"
        ? geographicalStates.map((state) => ({ id: state.id, name: state.name, key: state.id }))
        : allZoneCities;
    const geographicalRegionOptions = [
        ["EASTERN", "Eastern"],
        ["WESTERN", "Western"],
        ["NORTHERN", "Northern"],
        ["SOUTHERN", "Southern"],
        ["NORTH_EASTERN", "North Eastern"],
        ["CENTRAL", "Central"],
    ];

    useEffect(() => {
        setZoneGeographyMode(selectedZoneRecord?.geography_mode || "");
        setGeographicStateId("");
        setGeographicCityId("");
        setBranchGeoDraft({ state_id: "", district_id: "", taluka_id: "", city_id: "" });
    }, [selectedZoneRecord?.id, selectedZoneRecord?.geography_mode]);
    const hierarchyLabel = (level) => {
        const configuredLabel = selectedZoneRecord?.hierarchy_config?.labels?.[level] || selectedCustomerDetails?.zonal_hierarchy_config?.labels?.[level];
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
        setZonalGeoDraft({ state_id: "", district_id: "", taluka_id: "", city_id: "" });
        if (level === "zone") {
            setZoneTypeDraft("GEOGRAPHICAL");
            setZoneConfigDraft(buildZoneConfig("GEOGRAPHICAL", "MULTI_STATE"));
        }
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

    const buildZoneConfig = (zoneType, coverageType) => {
        const defaults = {
            GEOGRAPHICAL: ["zone", "region", "division", "branch"],
            STATE_BASED: ["zone", "circle", "region", "branch"],
            CITY_BASED: ["zone", "circle", "region", "branch"],
            BUSINESS: ["zone", "circle", "region", "branch"],
            ADMINISTRATIVE: ["zone", "circle", "region", "branch"],
            FUNCTIONAL: ["zone", "circle", "region", "branch"],
        };
        const labels = { zone: "Zone", circle: "Circle", region: "Region", division: "Division", branch: "Branch" };
        return {
            version: 1,
            coverage_type: coverageType,
            coverage_ids: [],
            levels: defaults[zoneType] || defaults.GEOGRAPHICAL,
            labels,
        };
    };

    const getGeoDraftForType = (type, draft) => ({
        state_id: draft.state_id,
        district_id: ["DISTRICT", "TALUKA", "CITY"].includes(type) ? draft.district_id : "",
        taluka_id: ["TALUKA", "CITY"].includes(type) ? draft.taluka_id : "",
        city_id: type === "CITY" ? draft.city_id : "",
    });

    const validateGeoDraft = (type, draft) => {
        if (!type) return "";
        if (["STATE", "DISTRICT", "TALUKA", "CITY"].includes(type) && !draft.state_id) return "Select a State.";
        if (["DISTRICT", "TALUKA", "CITY"].includes(type) && !draft.district_id) return "Select a District.";
        if (["TALUKA", "CITY"].includes(type) && !draft.taluka_id) return "Select a Taluka.";
        if (type === "CITY" && !draft.city_id) return "Select a City.";
        return "";
    };


    const createZonalParent = async () => {
        if (!zonalParentModal || !zonalParentName.trim()) return;

        const { level, parentId } = zonalParentModal;
        const name = zonalParentName.trim();
        const geoType = zonalGeographicalMapping?.[level] || null;
        const geoError = validateGeoDraft(geoType, zonalGeoDraft);
        if (geoError) { setFormError(geoError); return; }
        if (isNextLevelFlow) {
            if (!nextLevelType) { setFormError(`Select what this ${hierarchyLabel(level)} covers (${nextLevelInfo.allowed.map((t) => t.toLowerCase()).join(", ") || "district, taluka or city"}).`); return; }
            if (!nextLevelIds.length) { setFormError(`Select at least one ${nextLevelType.toLowerCase()}.`); return; }
        }

        const code =
            name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "") +
            "-" +
            Date.now().toString().slice(-6);

        const payload = { name, code };

        if (level === "zone") {
            if (zoneTypeDraft === "GEOGRAPHICAL" && !(zoneConfigDraft?.coverage_ids || []).length) {
                setFormError("Select at least one geographical region for this Zone.");
                return;
            }
            if (["STATE_BASED", "CITY_BASED"].includes(zoneTypeDraft) && !(zoneConfigDraft?.coverage_ids || []).length) {
                setFormError(`Select at least one ${zoneTypeDraft === "STATE_BASED" ? "State" : "City"} for this Zone.`);
                return;
            }
            payload.customer = selectedCustomer;
            payload.zone_type = zoneTypeDraft;
            payload.hierarchy_config = zoneConfigDraft || buildZoneConfig(zoneTypeDraft, "MULTI_STATE");
            payload.hierarchy_config.coverage_ids = Array.isArray(payload.hierarchy_config.coverage_ids)
                ? payload.hierarchy_config.coverage_ids : [];
            payload.geography_mode = ["STATE", "MULTI_STATE"].includes(payload.hierarchy_config.coverage_type)
                ? "STATE"
                : ["CITY", "MULTI_CITY"].includes(payload.hierarchy_config.coverage_type) ? "CITY" : null;
        }
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

            const assignmentZoneId = level === "zone" ? createdId : (selectedZoneRecord?.id || hierarchySelection.zone);
            if (isNextLevelFlow) {
                try {
                    await fetchJSON(`${API_BASE}/zonal-geography/assign-next-level/`, {
                        method: "POST",
                        body: JSON.stringify({
                            customer_id: selectedCustomer,
                            zone_id: assignmentZoneId,
                            level,
                            node_id: createdId,
                            parent_id: parentId || null,
                            location_type: nextLevelType,
                            location_ids: nextLevelIds,
                        }),
                    });
                } catch (assignErr) {
                    throw new Error(`${hierarchyLabel(level)} was created, but its ${nextLevelType.toLowerCase()} selection could not be saved: ${assignErr.message}`);
                }
            }
            if (geoType && assignmentZoneId) {
                await fetchJSON(`${API_BASE}/zonal-geography/assign/`, {
                    method: "POST",
                    body: JSON.stringify({
                        customer_id: selectedCustomer,
                        zone_id: assignmentZoneId,
                        level,
                        node_id: createdId,
                        parent_level: zonalParentModal.level === "zone" ? null : zonalParentLevels[zonalParentLevels.indexOf(level) - 1],
                        parent_id: parentId || null,
                        geographical_type: geoType,
                        ...getGeoDraftForType(geoType, zonalGeoDraft),
                    }),
                });
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

            if (level === "zone" || isNextLevelFlow) {
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
        setBranchGeoDraft({ state_id: "", district_id: "", taluka_id: "", city_id: "" });
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
        setPhysicalForm({ building_name: "", building_code: "", floor_name: "", floor_code: "", room_name: "", room_code: "" });
        setNewBuildings([]);
        setNewFloors([]);
        setNewRooms([]);
        setShowPhysicalLayers(false);
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
            const branchGeoError = validateGeoDraft(branchGeographicalType, branchGeoDraft);
            if (branchGeoError) { setFormError(branchGeoError); return; }
            if (branchGeographicalType) {
                Object.assign(payload, getGeoDraftForType(branchGeographicalType, branchGeoDraft));
                payload.geographical_type = branchGeographicalType;
                if (isDirectZoneBranch && branchGeographicalType === "CITY") {
                    payload.zone_geography_mode = "CITY";
                    payload.geographic_state_id = branchGeoDraft.state_id;
                    payload.geographic_city_id = branchGeoDraft.city_id;
                }
            }
        }

        try {
            setSaving(true);
            const response = await fetchJSON(`${API_BASE}/hierarchy-branch/create/`, {
                method: "POST",
                body: JSON.stringify(payload),
        });
        const createdBranch = response?.data ?? response?.branch ?? response;
        const createdBranchId = getItemId(createdBranch);
        if (!createdBranchId) throw new Error("Branch was created, but the API did not return its ID.");
        if (branchGeographicalType) {
            await fetchJSON(`${API_BASE}/zonal-geography/assign/`, {
                method: "POST",
                body: JSON.stringify({
                    customer_id: selectedCustomer,
                    zone_id: hierarchySelection.zone,
                    level: "branch",
                    node_id: createdBranchId,
                    parent_level: zonalParentLevels[zonalParentLevels.length - 1],
                    parent_id: hierarchySelection[zonalParentLevels[zonalParentLevels.length - 1]],
                    geographical_type: branchGeographicalType,
                    ...getGeoDraftForType(branchGeographicalType, branchGeoDraft),
                }),
            });
        }
        try {
            const createdBuildingIds = [];
            const createdFloorIds = [];
            if (hasBuildingLevel) {
                for (const [buildingIndex, item] of newBuildings.entries()) {
                    if (!item.name.trim()) continue;
                    const response = await fetchJSON(`${API_BASE}/buildings/`, {
                        method: "POST",
                        body: JSON.stringify({ branch: createdBranchId, name: item.name.trim(), code: item.code.trim().toUpperCase() }),
                    });
                    const id = getItemId(response?.data ?? response);
                    if (!id) throw new Error(`Building "${item.name}" was created without an ID.`);
                    createdBuildingIds[buildingIndex] = id;
                }
            }
            if (hasFloorLevel) {
                for (const [floorIndex, item] of newFloors.entries()) {
                    if (!item.name.trim()) continue;
                    const buildingId = hasBuildingLevel ? createdBuildingIds[Number(item.buildingIndex)] : null;
                    if (hasBuildingLevel && !buildingId) throw new Error(`Select a valid building for floor "${item.name}".`);
                    const response = await fetchJSON(`${API_BASE}/floors/`, {
                        method: "POST",
                        body: JSON.stringify({ branch: createdBranchId, building: buildingId, name: item.name.trim(), code: item.code.trim().toUpperCase() }),
                    });
                    const id = getItemId(response?.data ?? response);
                    if (!id) throw new Error(`Floor "${item.name}" was created without an ID.`);
                    createdFloorIds[floorIndex] = id;
                }
            }
            if (hasRoomLevel) {
                for (const item of newRooms) {
                    if (!item.name.trim()) continue;
                    const floorId = createdFloorIds[Number(item.floorIndex)];
                    if (!floorId) throw new Error(`Select a valid floor for room "${item.name}".`);
                    await fetchJSON(`${API_BASE}/rooms/`, {
                        method: "POST",
                        body: JSON.stringify({ floor: floorId, name: item.name.trim(), code: item.code.trim().toUpperCase() }),
                    });
                }
            }
            setSuccess("Branch and physical infrastructure created.");
        } catch (infraError) {
            setSuccess(`Branch created. Add the physical infrastructure separately: ${infraError.message}`);
        }
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

    const openEditBranch = async (branch) => {
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
        setShowPhysicalLayers(false);
        setEditPhysicalChecked(false);
        setEditPhysicalLoading(true);
        setEditPhysicalRooms([]);
        setPhysicalBuildings([]);
        setPhysicalFloors([]);
        setPhysicalAllowedLevels([]);

        try {
            // 1) Check what already exists under this branch first.
            const branchId = branch.id || branch.pk;
            const [buildingsResponse, floorsResponse] = await Promise.all([
                fetchJSON(`${API_BASE}/buildings/?branch=${encodeURIComponent(branchId)}`),
                fetchJSON(`${API_BASE}/floors/?branch=${encodeURIComponent(branchId)}`),
            ]);
            const buildings = getList(buildingsResponse);
            const floors = getList(floorsResponse);
            const roomResponses = await Promise.all(floors.map((floor) => {
                const floorId = floor.id || floor.pk;
                return fetchJSON(`${API_BASE}/rooms/?floor=${encodeURIComponent(floorId)}`);
            }));
            const rooms = roomResponses.flatMap(getList);
            setPhysicalBuildings(buildings);
            setPhysicalFloors(floors);
            setEditPhysicalRooms(rooms);

            // 2) Resolve the actual branch customer's hierarchy configuration.
            const branchCustomerId = String(
                branch.customer_id ?? branch.customer?.id ?? branch.customer ?? selectedCustomer ?? ""
            );
            let branchCustomerDetails = selectedCustomerDetails;
            let branchHierarchyType = customerHierarchy;
            if (branchCustomerId && (branchCustomerId !== String(selectedCustomer) || !branchCustomerDetails)) {
                const customerResponse = await fetchJSON(
                    `${API_BASE}/customers/${encodeURIComponent(branchCustomerId)}/`
                );
                branchCustomerDetails = customerResponse?.customer ?? customerResponse?.data ?? customerResponse;
                branchHierarchyType = String(branchCustomerDetails?.hierarchy_type ?? "").toUpperCase();
            }
            const allowed = getAllowedPhysicalLevelsForBranch(
                branch, branchCustomerDetails, branchHierarchyType
            );
            setPhysicalAllowedLevels(allowed);
            setEditPhysicalChecked(true);
        } catch (err) {
            setFormError(err.message || "Unable to check existing buildings, floors and rooms.");
            setEditPhysicalChecked(false);
        } finally {
            setEditPhysicalLoading(false);
        }
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

    const openPhysicalLocationModal = async (branch, type = "building") => {
        setPhysicalModalBranch(branch);
        setPhysicalModalType(type);
        setPhysicalModalForm({ name: "", code: "", building: "", floor: "" });
        setPhysicalModalError("");
        setPhysicalModalSuccess("");
        setPhysicalModalLoading(true);
        try {
            const branchId = branch.id || branch.pk;
            const [buildingsResponse, floorsResponse] = await Promise.all([
                fetchJSON(`${API_BASE}/buildings/?branch=${encodeURIComponent(branchId)}`),
                fetchJSON(`${API_BASE}/floors/?branch=${encodeURIComponent(branchId)}`)
            ]);
            setPhysicalBuildings(getList(buildingsResponse));
            setPhysicalFloors(getList(floorsResponse));
        } catch (err) {
            setPhysicalModalError(err.message || "Unable to load buildings and floors.");
            setPhysicalBuildings([]);
            setPhysicalFloors([]);
        } finally {
            setPhysicalModalLoading(false);
        }
    };

    const savePhysicalLocation = async (event) => {
        event.preventDefault();
        if (!physicalModalBranch) return;
        const branchId = physicalModalBranch.id || physicalModalBranch.pk;
        const name = physicalModalForm.name.trim();
        const code = physicalModalForm.code.trim().toUpperCase();
        if (!name || !code) {
            setPhysicalModalError("Name and code are required.");
            return;
        }

        let endpoint = "";
        let payload = { name, code };
        if (physicalModalType === "building") {
            endpoint = "buildings";
            payload.branch = branchId;
        } else if (physicalModalType === "floor") {
            endpoint = "floors";
            if (!physicalModalForm.building) {
                setPhysicalModalError("Select a building before adding a floor.");
                return;
            }
            payload.branch = branchId;
            payload.building = physicalModalForm.building;
        } else {
            endpoint = "rooms";
            if (!physicalModalForm.floor) {
                setPhysicalModalError("Select a floor before adding a room.");
                return;
            }
            payload.floor = physicalModalForm.floor;
        }

        try {
            setPhysicalModalSaving(true);
            setPhysicalModalError("");
            setPhysicalModalSuccess("");
            await fetchJSON(`${API_BASE}/${endpoint}/`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const [buildingsResponse, floorsResponse] = await Promise.all([
                fetchJSON(`${API_BASE}/buildings/?branch=${encodeURIComponent(branchId)}`),
                fetchJSON(`${API_BASE}/floors/?branch=${encodeURIComponent(branchId)}`)
            ]);
            const refreshedBuildings = getList(buildingsResponse);
            const refreshedFloors = getList(floorsResponse);
            setPhysicalBuildings(refreshedBuildings);
            setPhysicalFloors(refreshedFloors);
            if (editingBranch && String(editingBranch.id || editingBranch.pk) === String(branchId)) {
                const refreshedRoomResponses = await Promise.all(refreshedFloors.map((floor) =>
                    fetchJSON(`${API_BASE}/rooms/?floor=${encodeURIComponent(floor.id || floor.pk)}`)
                ));
                setEditPhysicalRooms(refreshedRoomResponses.flatMap(getList));
            }
            setPhysicalModalForm({ name: "", code: "", building: physicalModalForm.building, floor: physicalModalForm.floor });
            setPhysicalModalSuccess(`${physicalModalType.charAt(0).toUpperCase() + physicalModalType.slice(1)} added successfully.`);
        } catch (err) {
            setPhysicalModalError(err.message || `Unable to add ${physicalModalType}.`);
        } finally {
            setPhysicalModalSaving(false);
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
                                        <div className="branch-row-actions customer-style-actions">
                                            <button type="button" className="customer-style-action-btn customer-style-edit-btn" onClick={() => openEditBranch(branch)} title="Edit branch information">
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="customer-style-action-btn customer-style-physical-btn physical-location-icon-btn"
                                                onClick={() => openPhysicalLocationModal(branch, "building")}
                                                title="Add or manage buildings, floors, and rooms"
                                                aria-label="Add or manage buildings, floors, and rooms"
                                            >
                                                <Building2 size={18} />
                                            </button>
                                        </div>
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
                                {/* <div className="form-group"><label>Branch Status</label><select value={editForm.is_active ? "true" : "false"} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === "true" })}><option value="true">Active</option><option value="false">Inactive</option></select></div> */}
                                <div className="branch-status-field">
                                    <label className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={!!editForm.is_active}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    is_active: e.target.checked,
                                                })
                                            }
                                        />
                                        Active
                                    </label>
                                </div>
                                <div className="form-group full-width">
                                    <div className="physical-infrastructure-heading">
                                        <h4>Physical Infrastructure</h4>
                                        <small>Existing locations are checked first. Add options are shown only when permitted by this customer's hierarchy.</small>
                                    </div>
                                    {editPhysicalLoading ? (
                                        <small className="physical-check-status">Checking existing buildings, floors and rooms...</small>
                                    ) : editPhysicalChecked && physicalAllowedLevels.length > 0 ? (
                                        <>
                                           
                                            <div className="form-group full-width physical-layer-toggle">
                                                {/* <button
                                                    type="button"
                                                    className="physical-layer-toggle-link"
                                                    onClick={() => setShowPhysicalLayers((open) => !open)}
                                                    aria-expanded={showPhysicalLayers}
                                                >
                                                    {showPhysicalLayers ? "Cancel" : `+ Want to add ${physicalAllowedLevels.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(", ")} ?`}
                                                </button> */}
                                                <button
                                                        type="button"
                                                        className="physical-layer-toggle-link"
                                                        onClick={() => {
                                                            const firstAvailable = physicalAllowedLevels.find((level) =>
                                                                level === "building" ||
                                                                (level === "floor" && (!physicalAllowedLevels.includes("building") || physicalBuildings.length > 0)) ||
                                                                (level === "room" && physicalFloors.length > 0)
                                                            );
                                                            if (firstAvailable) openPhysicalLocationModal(editingBranch, firstAvailable);
                                                        }}
                                                    >
                                                        {/* + Add Physical Location */}
                                                        {showPhysicalLayers ? "Cancel" : `+ Want to add ${physicalAllowedLevels.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(", ")} ?`}

                                                    </button>
                                            </div>
                                            {showPhysicalLayers && (
                                                <div className="physical-add-panel">
                                                    {/* <p>Allowed by customer hierarchy: {physicalAllowedLevels.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(", ")}</p>
                                                    <div className="physical-existing-summary">
                                                        <span>Buildings: {physicalBuildings.length}</span>
                                                        <span>Floors: {physicalFloors.length}</span>
                                                        <span>Rooms: {editPhysicalRooms.length}</span>
                                                    </div> */}
                                                    <button
                                                        type="button"
                                                        className="physical-layer-toggle-link"
                                                        onClick={() => {
                                                            const firstAvailable = physicalAllowedLevels.find((level) =>
                                                                level === "building" ||
                                                                (level === "floor" && (!physicalAllowedLevels.includes("building") || physicalBuildings.length > 0)) ||
                                                                (level === "room" && physicalFloors.length > 0)
                                                            );
                                                            if (firstAvailable) openPhysicalLocationModal(editingBranch, firstAvailable);
                                                        }}
                                                    >
                                                        + Add Physical Location
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : editPhysicalChecked ? (
                                        <small className="physical-check-status">This customer's hierarchy does not permit adding buildings, floors or rooms for this branch.</small>
                                    ) : null}
                                </div>
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
                                    className="hierarchy-add-link"
                                    onClick={() => addZonalParent(key)}
                                    disabled={saving || (zonalParentLevels.indexOf(key) > 0 && !hierarchySelection[zonalParentLevels[zonalParentLevels.indexOf(key) - 1]])}
                                >
                                    + Add {label}
                                </button>
                            )}
                        </div>
                        ))}
                        {/* {customerHierarchy === "ZONAL" && branchGeographicalType && (
                            <div className="form-group full-width">
                                {renderGeoSelectors(branchGeographicalType, branchGeoDraft, setBranchGeoDraft, "branch")}
                            </div>
                        )} */}
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
                        {physicalLevels.length > 0 && <div className="form-group full-width physical-layer-toggle">
                            <button type="button" className="physical-layer-toggle-link" onClick={() => setShowPhysicalLayers((open) => !open)} aria-expanded={showPhysicalLayers}>
                                {showPhysicalLayers ? "Cancle" : `+ Want to add ${physicalLevels.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(", ")} ?`}
                            </button>
                        </div>}
                        {physicalLevels.length > 0 && showPhysicalLayers && (
                            <>
                                <div className="form-group full-width physical-infrastructure-heading">
                                    <h4>Physical Infrastructure</h4>
                                    <small>Add one or more entries. Only levels enabled for this customer are shown.</small>
                                </div>
                                {hasBuildingLevel && <div className="form-group full-width physical-repeat-section">
                                    <div className="physical-repeat-heading"><label>Buildings</label><button type="button" className="physical-layer-toggle-link" onClick={() => setNewBuildings((rows) => [...rows, { name: "", code: "" }])}>+ Add Building</button></div>
                                    {newBuildings.map((item, index) => <div className="physical-repeat-row" key={`building-${index}`}>
                                        <input value={item.name} onChange={(e) => setNewBuildings((rows) => rows.map((row, i) => i === index ? { ...row, name: e.target.value } : row))} placeholder={`Building ${index + 1} name`} />
                                        <input value={item.code} onChange={(e) => setNewBuildings((rows) => rows.map((row, i) => i === index ? { ...row, code: e.target.value.toUpperCase() } : row))} placeholder="Building code" />
                                        <button type="button" className="physical-remove-link" onClick={() => { setNewBuildings((rows) => rows.filter((_, i) => i !== index)); setNewFloors((rows) => rows.map((row) => { const selected = Number(row.buildingIndex); return { ...row, buildingIndex: row.buildingIndex === "" ? "" : selected === index ? "" : selected > index ? String(selected - 1) : row.buildingIndex }; })); }} aria-label="Delete building row" title="Delete building"><Trash2 size={17} strokeWidth={2} /></button>
                                    </div>)}
                                    {!newBuildings.length && <small>No buildings added yet.</small>}
                                </div>}
                                {hasFloorLevel && <div className="form-group full-width physical-repeat-section">
                                    <div className="physical-repeat-heading"><label>Floors</label><button type="button" className="physical-layer-toggle-link" onClick={() => setNewFloors((rows) => [...rows, { name: "", code: "", buildingIndex: "" }])}>+ Add Floor</button></div>
                                    {newFloors.map((item, index) => <div className="physical-repeat-row" key={`floor-${index}`}>
                                        <input value={item.name} onChange={(e) => setNewFloors((rows) => rows.map((row, i) => i === index ? { ...row, name: e.target.value } : row))} placeholder={`Floor ${index + 1} name`} />
                                        <input value={item.code} onChange={(e) => setNewFloors((rows) => rows.map((row, i) => i === index ? { ...row, code: e.target.value.toUpperCase() } : row))} placeholder="Floor code" />
                                        {hasBuildingLevel && <select value={item.buildingIndex} onChange={(e) => setNewFloors((rows) => rows.map((row, i) => i === index ? { ...row, buildingIndex: e.target.value } : row))}><option value="">Select building</option>{newBuildings.map((building, i) => <option key={i} value={i}>{building.name.trim() || `Building ${i + 1}`}</option>)}</select>}
                                        <button type="button" className="physical-remove-link" onClick={() => { setNewFloors((rows) => rows.filter((_, i) => i !== index)); setNewRooms((rows) => rows.map((row) => { const selected = Number(row.floorIndex); return { ...row, floorIndex: row.floorIndex === "" ? "" : selected === index ? "" : selected > index ? String(selected - 1) : row.floorIndex }; })); }} aria-label="Delete floor row" title="Delete floor"><Trash2 size={17} strokeWidth={2} /></button>
                                    </div>)}
                                    {!newFloors.length && <small>No floors added yet.</small>}
                                </div>}
                                {hasRoomLevel && <div className="form-group full-width physical-repeat-section">
                                    <div className="physical-repeat-heading"><label>Rooms</label><button type="button" className="physical-layer-toggle-link" onClick={() => setNewRooms((rows) => [...rows, { name: "", code: "", floorIndex: "" }])}>+ Add Room</button></div>
                                    {newRooms.map((item, index) => <div className="physical-repeat-row" key={`room-${index}`}>
                                        <input value={item.name} onChange={(e) => setNewRooms((rows) => rows.map((row, i) => i === index ? { ...row, name: e.target.value } : row))} placeholder={`Room ${index + 1} name`} />
                                        <input value={item.code} onChange={(e) => setNewRooms((rows) => rows.map((row, i) => i === index ? { ...row, code: e.target.value.toUpperCase() } : row))} placeholder="Room code" />
                                        <select value={item.floorIndex} onChange={(e) => setNewRooms((rows) => rows.map((row, i) => i === index ? { ...row, floorIndex: e.target.value } : row))}><option value="">Select floor</option>{newFloors.map((floor, i) => <option key={i} value={i}>{floor.name.trim() || `Floor ${i + 1}`}</option>)}</select>
                                        <button type="button" className="physical-remove-link" onClick={() => setNewRooms((rows) => rows.filter((_, i) => i !== index))} aria-label="Delete room row" title="Delete room"><Trash2 size={17} strokeWidth={2} /></button>
                                    </div>)}
                                    {!newRooms.length && <small>No rooms added yet.</small>}
                                </div>}
                            </>
                        )}
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
            {physicalModalBranch && (
                <div className="site-modal-overlay" role="presentation">
                    <div className="site-modal hierarchy-site-modal" role="dialog" aria-modal="true" aria-labelledby="physical-location-title">
                        <div className="site-modal-header">
                            <div>
                                <h2 id="physical-location-title">Add Physical Location</h2>
                                <p>{physicalModalBranch.name} · Add a building, floor, or room independently.</p>
                            </div>
                            <button type="button" className="modal-close-btn" disabled={physicalModalSaving} onClick={() => setPhysicalModalBranch(null)}>×</button>
                        </div>
                        <form onSubmit={savePhysicalLocation}>
                            <div className="site-form-grid">
                                <div className="form-group full-width">
                                    <label>What would you like to add?</label>
                                    <select value={physicalModalType} onChange={(e) => {
                                        setPhysicalModalType(e.target.value);
                                        setPhysicalModalForm((old) => ({ ...old, name: "", code: "" }));
                                        setPhysicalModalError("");
                                        setPhysicalModalSuccess("");
                                    }}>
                                        {(editingBranch ? physicalAllowedLevels : ["building", "floor", "room"]).map((level) => (
                                            <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                {physicalModalLoading ? (
                                    <div className="form-group full-width">Loading branch locations...</div>
                                ) : (
                                    <>
                                        {physicalModalType === "floor" && (
                                            <div className="form-group full-width">
                                                <label>Building *</label>
                                                <select value={physicalModalForm.building} onChange={(e) => setPhysicalModalForm((old) => ({ ...old, building: e.target.value }))} required>
                                                    <option value="">Select building</option>
                                                    {physicalBuildings.map((item) => <option key={getItemId(item)} value={getItemId(item)}>{getItemLabel(item)}</option>)}
                                                </select>
                                                {!physicalBuildings.length && <small>No building found. Add a building first.</small>}
                                            </div>
                                        )}
                                        {physicalModalType === "room" && (
                                            <>
                                                <div className="form-group full-width">
                                                    <label>Building *</label>
                                                    <select value={physicalModalForm.building} onChange={(e) => {
                                                        const building = e.target.value;
                                                        setPhysicalModalForm((old) => ({ ...old, building, floor: "" }));
                                                    }} required>
                                                        <option value="">Select building</option>
                                                        {physicalBuildings.map((item) => <option key={getItemId(item)} value={getItemId(item)}>{getItemLabel(item)}</option>)}
                                                    </select>
                                                </div>
                                                <div className="form-group full-width">
                                                    <label>Floor *</label>
                                                    <select value={physicalModalForm.floor} onChange={(e) => setPhysicalModalForm((old) => ({ ...old, floor: e.target.value }))} required>
                                                        <option value="">Select floor</option>
                                                        {physicalFloors.filter((item) => !physicalModalForm.building || String(item.building?.id ?? item.building ?? item.building_id ?? "") === String(physicalModalForm.building)).map((item) => <option key={getItemId(item)} value={getItemId(item)}>{getItemLabel(item)}</option>)}
                                                    </select>
                                                    {!physicalModalForm.building && <small>Select a building to view its floors.</small>}
                                                </div>
                                            </>
                                        )}
                                        <div className="form-group">
                                            <label>{physicalModalType.charAt(0).toUpperCase() + physicalModalType.slice(1)} Name *</label>
                                            <input value={physicalModalForm.name} onChange={(e) => setPhysicalModalForm((old) => ({ ...old, name: e.target.value }))} placeholder={`Enter ${physicalModalType} name`} required />
                                        </div>
                                        <div className="form-group">
                                            <label>{physicalModalType.charAt(0).toUpperCase() + physicalModalType.slice(1)} Code *</label>
                                            <input value={physicalModalForm.code} onChange={(e) => setPhysicalModalForm((old) => ({ ...old, code: e.target.value.toUpperCase() }))} placeholder={`Enter ${physicalModalType} code`} required />
                                        </div>
                                    </>
                                )}
                            </div>
                            {physicalModalError && <div className="location-error"><span>{physicalModalError}</span></div>}
                            {physicalModalSuccess && <div className="location-success"><span>{physicalModalSuccess}</span></div>}
                            <div className="site-modal-footer">
                                <button type="button" className="cancel-btn" disabled={physicalModalSaving} onClick={() => setPhysicalModalBranch(null)}>Close</button>
                                <button type="submit" className="save-site-btn" disabled={physicalModalSaving || physicalModalLoading || (physicalModalType === "floor" && !physicalBuildings.length) || (physicalModalType === "room" && (!physicalBuildings.length || !physicalFloors.length))}>
                                    {physicalModalSaving ? "Adding..." : `Add ${physicalModalType.charAt(0).toUpperCase() + physicalModalType.slice(1)}`}
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
                            <label>{hierarchyLabel(zonalParentModal.level)} Name</label>
                            <input type="text" value={zonalParentName} onChange={(e) => setZonalParentName(e.target.value)} placeholder={`Enter ${hierarchyLabel(zonalParentModal.level)} name`} autoFocus />
                            {/* {zonalGeographicalMapping?.[zonalParentModal.level] && (
                                renderGeoSelectors(zonalGeographicalMapping[zonalParentModal.level], zonalGeoDraft, setZonalGeoDraft, "modal")
                            )} */}
                            {isNextLevelFlow && (
                                <div className="zone-coverage-picker next-level-picker">
                                    <label className="zonal-field-label">{hierarchyLabel(zonalParentModal.level)} covers *</label>
                                    <select
                                        className="zonal-field-control"
                                        value={nextLevelType}
                                        disabled={nextLevelInfo.loading || !!nextLevelInfo.locked || !nextLevelInfo.allowed.length}
                                        onChange={(e) => setNextLevelType(e.target.value)}
                                    >
                                        <option value="">Select next level type</option>
                                        {nextLevelInfo.allowed.map((type) => (
                                            <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                    {nextLevelInfo.locked && (
                                        <small className="zone-coverage-empty">All {hierarchyLabel(zonalParentModal.level)} levels in this Zone use {nextLevelInfo.locked.toLowerCase()}s.</small>
                                    )}
                                    {nextLevelInfo.error && <small className="zone-coverage-empty">{nextLevelInfo.error}</small>}
                                    {nextLevelType && (
                                        <>
                                            <label className="zonal-field-label">
                                                Select {nextLevelType.toLowerCase()}s * ({nextLevelIds.length} selected)
                                            </label>
                                            <input
                                                type="text"
                                                className="zonal-field-control"
                                                placeholder={`Search ${nextLevelType.toLowerCase()}s`}
                                                value={nextLevelSearch}
                                                onChange={(e) => setNextLevelSearch(e.target.value)}
                                            />
                                            <div className="zone-coverage-options">
                                                {nextLevelInfo.loading && <small className="zone-coverage-empty">Loading…</small>}
                                                {!nextLevelInfo.loading && nextLevelInfo.options
                                                    .filter((item) => normalize(item.name).includes(normalize(nextLevelSearch)) || normalize(item.state_name).includes(normalize(nextLevelSearch)))
                                                    .map((item) => (
                                                        <label className="zone-coverage-option" key={item.id}>
                                                            <input
                                                                type="checkbox"
                                                                checked={nextLevelIds.includes(item.id)}
                                                                onChange={(e) => setNextLevelIds((old) => (
                                                                    e.target.checked ? [...old, item.id] : old.filter((id) => id !== item.id)
                                                                ))}
                                                            />
                                                            <span>{item.name}{item.state_name ? ` (${item.state_name})` : ""}</span>
                                                        </label>
                                                    ))}
                                                {!nextLevelInfo.loading && !nextLevelInfo.options.length && (
                                                    <small className="zone-coverage-empty">No {nextLevelType.toLowerCase()}s available under the selected state(s), or all are already assigned.</small>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {zonalParentModal.level === "zone" && <>
                                <label className="zonal-field-label">Zone classification *</label>
                                <select
                                    className="zonal-field-control"
                                    value={zoneTypeDraft}
                                    onChange={(e) => {
                                        const nextType = e.target.value;
                                        const defaultCoverage = nextType === "STATE_BASED" ? "MULTI_STATE"
                                            : nextType === "CITY_BASED" ? "MULTI_CITY"
                                            : ["BUSINESS", "ADMINISTRATIVE", "FUNCTIONAL"].includes(nextType) ? "CUSTOM"
                                            : "MULTI_STATE";
                                        setZoneTypeDraft(nextType);
                                        setZoneCoverageSearch("");
                                        setZoneConfigDraft(buildZoneConfig(nextType, defaultCoverage));
                                    }}
                                >
                                    <option value="GEOGRAPHICAL">Geographical Zone</option>
                                    <option value="STATE_BASED">State-based Zone</option>
                                    <option value="CITY_BASED">City-based Zone</option>
                                    <option value="BUSINESS">Business Zone</option>
                                    <option value="ADMINISTRATIVE">Administrative Zone</option>
                                    <option value="FUNCTIONAL">Functional Zone</option>
                                </select>

                                {zoneTypeDraft === "GEOGRAPHICAL" && (
                                    <div className="zone-coverage-picker">
                                        <label className="zonal-field-label">Select geographical regions *</label>
                                        <div className="zone-coverage-options zone-coverage-regions">
                                            {geographicalRegionOptions.map(([value, label]) => {
                                                const checked = (zoneConfigDraft?.coverage_ids || []).includes(value);
                                                return (
                                                    <label className="zone-coverage-option" key={value}>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => setZoneConfigDraft((old) => {
                                                                const current = old?.coverage_ids || [];
                                                                const next = e.target.checked
                                                                    ? [...current, value]
                                                                    : current.filter((region) => region !== value);
                                                                return {
                                                                    ...(old || buildZoneConfig(zoneTypeDraft, "DIRECTION")),
                                                                    coverage_type: "DIRECTION",
                                                                    coverage_ids: next,
                                                                };
                                                            })}
                                                        />
                                                        <span>{label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {(zoneTypeDraft === "STATE_BASED" || zoneTypeDraft === "CITY_BASED") && (
                                    <div className="zone-coverage-picker">
                                        <label className="zonal-field-label">
                                            Select {zoneTypeDraft === "STATE_BASED" ? "States" : "Cities"} *
                                        </label>
                                        <div className="zone-coverage-search">
                                            <Search size={16} />
                                            <input
                                                type="text"
                                                value={zoneCoverageSearch}
                                                onChange={(e) => setZoneCoverageSearch(e.target.value)}
                                                placeholder={`Search ${zoneTypeDraft === "STATE_BASED" ? "states" : "cities"}...`}
                                            />
                                        </div>
                                        <div className="zone-coverage-options">
                                            {zoneCoverageOptions
                                                .filter((item) => normalize(item.name).includes(normalize(zoneCoverageSearch)) || (item.state_name && normalize(item.state_name).includes(normalize(zoneCoverageSearch))))
                                                .map((item) => {
                                                    const selectedValue = zoneTypeDraft === "STATE_BASED" ? item.id : item.key;
                                                    const checked = (zoneConfigDraft?.coverage_ids || []).map(String).includes(String(selectedValue));
                                                    return (
                                                        <label className="zone-coverage-option" key={selectedValue}>
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(e) => setZoneConfigDraft((old) => {
                                                                    const current = (old?.coverage_ids || []).map(String);
                                                                    const next = e.target.checked
                                                                        ? [...current, String(selectedValue)]
                                                                        : current.filter((id) => id !== String(selectedValue));
                                                                    return {
                                                                        ...(old || buildZoneConfig(zoneTypeDraft, zoneTypeDraft === "STATE_BASED" ? "MULTI_STATE" : "MULTI_CITY")),
                                                                        coverage_type: zoneTypeDraft === "STATE_BASED" ? "MULTI_STATE" : "MULTI_CITY",
                                                                        coverage_ids: next,
                                                                    };
                                                                })}
                                                            />
                                                            <span>{item.name}{item.state_name ? ` (${item.state_name})` : ""}</span>
                                                        </label>
                                                    );
                                                })}
                                            {zoneCoverageOptions.filter((item) => normalize(item.name).includes(normalize(zoneCoverageSearch)) || (item.state_name && normalize(item.state_name).includes(normalize(zoneCoverageSearch)))).length === 0 && (
                                                <small className="zone-coverage-empty">No matching {zoneTypeDraft === "STATE_BASED" ? "states" : "cities"} found.</small>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {!['GEOGRAPHICAL', 'STATE_BASED', 'CITY_BASED'].includes(zoneTypeDraft) && (
                                    <>
                                        <label className="zonal-field-label">Geographical coverage *</label>
                                        <select
                                            className="zonal-field-control"
                                            value={zoneConfigDraft?.coverage_type || "CUSTOM"}
                                            onChange={(e) => setZoneConfigDraft((old) => ({
                                                ...(old || buildZoneConfig(zoneTypeDraft, e.target.value)),
                                                coverage_type: e.target.value,
                                                coverage_ids: [],
                                            }))}
                                        >
                                            <option value="CUSTOM">Custom / assigned branches</option>
                                            <option value="NONE">No fixed geographical boundary</option>
                                        </select>
                                    </>
                                )}
                            </>}
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
                                disabled={!zonalParentName.trim() || (zonalParentModal.level === "zone" && !zoneConfigDraft?.levels?.length) || (isNextLevelFlow && (!nextLevelType || !nextLevelIds.length))}
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
