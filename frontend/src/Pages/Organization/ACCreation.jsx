
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiArrowLeft, FiCheckCircle, FiCpu, FiMapPin,
    FiPlus, FiRefreshCw, FiSearch,
} from "react-icons/fi";
import "./AdminCreation.css";

const API_BASE      = "http://localhost:8000/api";
const DEVICES_URL   = `${API_BASE}/devices/`;
const LOCATIONS_URL = `${API_BASE}/v1/filters/locations/`;

const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") || "";

const authHeaders = () => {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
    };
};

const normalizeList = (r) =>
    Array.isArray(r) ? r
        : Array.isArray(r?.data) ? r.data
        : Array.isArray(r?.results) ? r.results
        : [];

const emptyForm = {
    ac_id: "",
    device_name: "",
    status: "OFF",
    branch_id: "",
    floor_id: "",
    capacity_ton: "",
    installation_date: "",
    last_maintenance_date: "",
};

const hierarchyLabel = (v) =>
    v === "GEOGRAPHICAL" ? "Geographical" : v === "ZONAL" ? "Zonal" : "-";

const customerName = (c) =>
    !c ? "" : c.company || c.name || c.code || `Customer #${c.id}`;


const branchPath = (branch, hierarchy) => {
    if (!branch) return "";
        const parts = hierarchy === "GEOGRAPHICAL"
        ? [branch.state_name, branch.district_name, branch.taluka_name, branch.city_name, branch.branch_name]
        : [branch.zone_name, branch.circle_name, branch.region_name, branch.division_name, branch.branch_name];
    return parts.filter(Boolean).join(" / ");
};

const flattenGeographical = (tree = []) => 
tree.flatMap((state) =>
    (state.districts || []).flatMap((district) =>
        (district.talukas || []).flatMap((taluka) =>
            (taluka.cities || []).flatMap((city) =>
                (city.branches || []).map((branch) => ({
                    branch_id:   branch.branch_id,
                    branch_name: branch.branch_name,
                    floors:      branch.floors || [],
                    state_id:    state.state_id,
                    state_name:  state.state_name,
                    district_id: district.district_id,
                    district_name: district.district_name,
                    taluka_id:   taluka.taluka_id,
                    taluka_name: taluka.taluka_name,
                    city_id:     city.city_id,
                    city_name:   city.city_name,
                }
            )
        )
        )
    )
));

const flattenZonal = (tree = []) =>
tree.flatMap((zone) =>
    (zone.circles || []).flatMap((circle) =>
        (circle.regions || []).flatMap((region) =>
            (region.divisions || []).flatMap((division) =>
                (division.branches || []).map((branch) => ({
                    branch_id:   branch.branch_id,
                    branch_name: branch.branch_name,
                    floors:      branch.floors || [],
                    zone_id:     zone.zone_id,
                    zone_name:   zone.zone_name,
                    circle_id:   circle.circle_id,
                    circle_name: circle.circle_name,
                    region_id:   region.region_id,
                    region_name: region.region_name,
                    division_id: division.division_id,
                    division_name: division.division_name,
                })
            )
        )
    )
));

function ACCreation() {

    const [view, setView]     = useState("list");
    const [devices, setDevices]     = useState([]);
    const [locations, setLocations] = useState({ GEOGRAPHICAL: [], ZONAL: [] });

    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        state_id: "", district_id: "", taluka_id: "", city_id: "",
        zone_id: "", circle_id: "", region_id: "", division_id: "",
    });

    const [loading, setLoading]                 = useState(true);
    const [saving, setSaving]                   = useState(false);

    const [error, setError]         = useState("");
    const [formError, setFormError] = useState("");

    const [selectedHierarchy, setSelectedHierarchy] = useState("");


    const allBranches = useMemo(() => {
        if (selectedHierarchy === "GEOGRAPHICAL") return flattenGeographical(locations.GEOGRAPHICAL);
        if (selectedHierarchy === "ZONAL")        return flattenZonal(locations.ZONAL);
        return [];
    }, [locations, selectedHierarchy]);


    const [branchAssignments, setBranchAssignments] = useState(null);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [assignmentsError, setAssignmentsError] = useState("");

    const fetchBranchAssignments = useCallback(async (branchId) => {
        if (!branchId) {
            setBranchAssignments(null);
            setAssignmentsError("");
            return;
        }
        try {
            setLoadingAssignments(true);
            setAssignmentsError("");

            const url = `${API_BASE}/branches/assignments/?branch_id=${encodeURIComponent(branchId)}`;
            const res = await fetch(url, {
                method: "GET", headers: authHeaders(), cache: "no-store",
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(result?.message || `HTTP ${res.status}`);

            setBranchAssignments(result.data || null);
        } catch (err) {
            setAssignmentsError(err.message || "Unable to load branch assignments.");
            setBranchAssignments(null);
        } finally {
            setLoadingAssignments(false);
        }
    }, []);

    useEffect(() => {
        fetchBranchAssignments(form.branch_id);
    }, [form.branch_id, fetchBranchAssignments]);

    const fetchDevices = useCallback(async () => {
        try {
        setLoading(true);
        setError("");
        const res = await fetch(DEVICES_URL, {
            method: "GET", headers: authHeaders(), cache: "no-store",
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result?.message || result?.detail || `HTTP ${res.status}`);
            setDevices(normalizeList(result));
        } catch (err) {
            setError(err.message || "Unable to load devices.");
        } finally {
            setLoading(false);
        }
    }, []);


    const fetchLocations = useCallback(async () => {
        try {
        const res = await fetch(LOCATIONS_URL, {
            method: "GET", headers: authHeaders(), cache: "no-store",
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (result.success !== true) throw new Error("Location API returned success=false");

        setLocations({
            GEOGRAPHICAL: Array.isArray(result.geographical?.data) ? result.geographical.data : [],
            ZONAL:        Array.isArray(result.zonal?.data)        ? result.zonal.data        : [],
        });
        } catch (err) {
            setFormError(err.message || "Unable to load location hierarchy.");
        }
    }, []);


    useEffect(() => {
        fetchDevices();
        fetchLocations();
    }, [fetchDevices, fetchLocations]);

    const filteredBranches = useMemo(() => {
        if (!selectedHierarchy) return [];

        return allBranches.filter((branch) => {
            if (selectedHierarchy === "GEOGRAPHICAL") {
                return (
                (!filters.state_id    || branch.state_id    === filters.state_id)    &&
                (!filters.district_id || branch.district_id === filters.district_id) &&
                (!filters.taluka_id   || branch.taluka_id   === filters.taluka_id)   &&
                (!filters.city_id     || branch.city_id     === filters.city_id)
                );
            }
            return (
                (!filters.zone_id     || branch.zone_id     === filters.zone_id)     &&
                (!filters.circle_id   || branch.circle_id   === filters.circle_id)   &&
                (!filters.region_id   || branch.region_id   === filters.region_id)   &&
                (!filters.division_id || branch.division_id === filters.division_id)
            );
        });
    }, [allBranches, selectedHierarchy, filters]);

    const stateOptions = useMemo(() => {
        const seen = new Map();
        allBranches.forEach((b) => { if (b.state_id && !seen.has(b.state_id)) seen.set(b.state_id, b.state_name); });
        return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }, [allBranches]);

    const districtOptions = useMemo(() => {
        const seen = new Map();
        allBranches
        .filter((b) => !filters.state_id || b.state_id === filters.state_id)
        .forEach((b) => { if (b.district_id && !seen.has(b.district_id)) seen.set(b.district_id, b.district_name); });
        return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }, [allBranches, filters.state_id]);

    const talukaOptions = useMemo(() => {
        const seen = new Map();
        allBranches
        .filter((b) => !filters.district_id || b.district_id === filters.district_id)
        .forEach((b) => { if (b.taluka_id && !seen.has(b.taluka_id)) seen.set(b.taluka_id, b.taluka_name); });
        return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }, [allBranches, filters.district_id]);

    const cityOptions = useMemo(() => {
        const seen = new Map();
        allBranches
        .filter((b) => !filters.taluka_id || b.taluka_id === filters.taluka_id)
        .forEach((b) => { if (b.city_id && !seen.has(b.city_id)) seen.set(b.city_id, b.city_name); });
        return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }, [allBranches, filters.taluka_id]);

    const zoneOptions = useMemo(() => {
        const seen = new Map();
        allBranches.forEach((b) => { if (b.zone_id && !seen.has(b.zone_id)) seen.set(b.zone_id, b.zone_name); });
        return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }, [allBranches]);

    const circleOptions = useMemo(() => {
        const seen = new Map();
        allBranches
        .filter((b) => !filters.zone_id || b.zone_id === filters.zone_id)
        .forEach((b) => { if (b.circle_id && !seen.has(b.circle_id)) seen.set(b.circle_id, b.circle_name); });
        return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }, [allBranches, filters.zone_id]);

    const regionOptions = useMemo(() => {
        const seen = new Map();
        allBranches
        .filter((b) => !filters.circle_id || b.circle_id === filters.circle_id)
        .forEach((b) => { if (b.region_id && !seen.has(b.region_id)) seen.set(b.region_id, b.region_name); });
        return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }, [allBranches, filters.circle_id]);

    const divisionOptions = useMemo(() => {
        const seen = new Map();
        allBranches
        .filter((b) => !filters.region_id || b.region_id === filters.region_id)
        .forEach((b) => { if (b.division_id && !seen.has(b.division_id)) seen.set(b.division_id, b.division_name); });
        return [...seen.entries()].map(([value, label]) => ({ value, label }));
    }, [allBranches, filters.region_id]);

    const selectedBranch = useMemo(
        () => allBranches.find((b) => b.branch_id === form.branch_id) || null,
        [allBranches, form.branch_id]
    );

    const floorOptions = selectedBranch?.floors || [];

    const filteredDevices = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) 
            return devices;
        return devices.filter((d) =>
        [d.ac_id, d.device_name, d.status, d.branch_name, d.floor_name,
        d.state_name, d.district_name, d.zone_name, d.circle_name]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [devices, search]);

    const resetForm = useCallback(() => {
        setForm({ ...emptyForm });
        setFilters({ state_id: "", district_id: "", taluka_id: "", city_id: "",
                    zone_id: "", circle_id: "", region_id: "", division_id: "" });
        setSelectedHierarchy("");
        setFormError("");
    }, []);

    const openCreate = () => {
        resetForm();
        setView("form");
    };

    const backToList = () => { setView("list"); resetForm(); };


    const handleFilterChange = (key, value, resetKeys = []) => {
        setFilters((prev) => {
        const next = { ...prev, [key]: value };
        resetKeys.forEach((k) => { next[k] = ""; });
        return next;
        });
        setForm((prev) => ({ ...prev, branch_id: "", floor_id: "" }));
    };

    const handleBranchChange = (branchId) => {
        setForm((prev) => ({ ...prev, branch_id: branchId, floor_id: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        if (!form.ac_id.trim())       return setFormError("AC ID is required.");
        if (!form.device_name.trim()) return setFormError("Device name is required.");
        if (!selectedHierarchy)       return setFormError("Please select a location type.");
        if (!form.branch_id)          return setFormError("Please select a branch.");

        const capacity = Number(form.capacity_ton);
        if (!Number.isFinite(capacity) || capacity <= 0) {
            return setFormError("Capacity must be greater than 0 Ton.");
        }
        if (!form.installation_date) {
            return setFormError("Installation date is required.");
        }
        if (form.last_maintenance_date && form.last_maintenance_date < form.installation_date) {
            return setFormError("Last maintenance date cannot be before the installation date.");
        }

        setSaving(true);
        try {
        const payload = {
            ac_id:          form.ac_id.trim(),
            device_name:    form.device_name.trim(),
            status:         form.status,
            hierarchy_type: selectedHierarchy,
            branch_id:      form.branch_id,
            floor_id:       form.floor_id || "",
            capacity_ton:   capacity,
            installation_date: form.installation_date,
            last_maintenance_date: form.last_maintenance_date || "",
            customer_id:    branchAssignments?.customer?.id ?? "",
        };

        const res = await fetch(DEVICES_URL, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
            let message = result?.message || result?.detail || `HTTP ${res.status}`;
            if (typeof result === "object" && result !== null && !result.message && !result.detail) {
            const errors = Object.entries(result)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" | ");
            if (errors) message = errors;
            }
            throw new Error(message);
        }

        await fetchDevices();
        setView("list");
        resetForm();
        } catch (err) {
            setFormError(err.message || "Could not create device.");
        } finally {
            setSaving(false);
        }
    };

    const hierarchyReady = Boolean(selectedHierarchy && allBranches.length > 0);
    const showEmptyHierarchy =
        selectedHierarchy && allBranches.length === 0;

    return (
        <div className="admins-page">

            <ol className="admins-stepper">
                <li className={view === "list" ? "active" : "done"}>
                    <button type="button" className="step-btn" onClick={backToList}>
                        <span className="step-num">1</span> Devices
                    </button>
                </li>
                <li className={view === "form" ? "active" : ""}>
                    <button type="button" className="step-btn" onClick={openCreate}>
                        <span className="step-num">2</span> Add Device
                    </button>
                </li>
            </ol>
            {view === "list" ? (
                <>
                <div className="admins-header">
                    <div>
                        <h1>AC Devices</h1>
                        <p>Manage AC devices and assign them to the selected end location.</p>
                    </div>
                    {/* <button type="button" className="btn-primary" onClick={openCreate}>
                        <FiPlus /> Add AC Device
                    </button> */}
                </div>

                <div className="admins-toolbar">
                    <div style={{ position: "relative", flex: 1 }}>
                        <FiSearch style={{ position: "absolute", left: 12, top: 12, color: "#9ca3af" }} />
                        <input
                            className="admins-search"
                            style={{ paddingLeft: 36, width: "100%" }}
                            placeholder="Search by AC ID, device name, branch or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <span className="admins-count">
                        {filteredDevices.length} of {devices.length} devices
                    </span>
                    <button type="button" className="btn-secondary" onClick={fetchDevices}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>

                {error && <div className="admins-error">{error}</div>}

                <div className="admins-table-card">
                    {loading ? (
                    <div className="admins-loading">Loading devices...</div>
                    ) : filteredDevices.length === 0 ? (
                        <div className="admins-empty">
                            No AC devices found. Click “Add AC Device” to create one.
                        </div>
                    ) : (
                        <table
                            className="admins-table"
                            style={{ tableLayout: "fixed", width: "100%" }}
                        >
                            <colgroup>
                                <col style={{ width: "10%", minWidth: 110 }} /><col style={{ width: "10%", minWidth: 100 }} /><col style={{ width: "12%", minWidth: 120 }} /><col style={{ width: "14%", minWidth: 140 }} /><col style={{ width: "9%", minWidth: 90 }} /><col style={{ width: "24%", minWidth: 220 }} /><col style={{ width: "14%", minWidth: 160 }} /><col style={{ width: "7%", minWidth: 75 }} />
                            </colgroup>

                            <thead>
                                <tr>
                                <th style={{ whiteSpace: "nowrap" }}>AC ID</th>
                                <th style={{ whiteSpace: "nowrap" }}>Device</th>
                                <th style={{ whiteSpace: "nowrap" }}>Customer</th>
                                <th style={{ whiteSpace: "nowrap" }}>Assigned By</th>
                                <th style={{ whiteSpace: "nowrap" }}>Hierarchy</th>
                                <th style={{ whiteSpace: "nowrap" }}>Location</th>
                                <th style={{ whiteSpace: "nowrap" }}>Specifications</th>
                                <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredDevices.map((device) => {
                                const locationText =
                                    [device.zone_name, device.circle_name, device.region_name,
                                    device.division_name, device.state_name, device.district_name,
                                    device.taluka_name, device.city_name,
                                    device.branch_name, device.floor_name]
                                    .filter(Boolean).join(" / ") || "-";

                                const custLabel =
                                    device.customer_name ||
                                    (device.customer_id ? `Customer #${device.customer_id}` : "-");

                                const adminLabel =
                                    device.created_by_name ||
                                    device.created_by_email ||
                                    device.created_by_id ||
                                    "-";

                                return (
                                    <tr key={device.ac_id}>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        <strong>{device.ac_id}</strong>
                                    </td>

                                    <td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {device.device_name || "-"}
                                    </td>

                                    <td
                                        title={custLabel}
                                        style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                    >
                                        {custLabel}
                                    </td>

                                    <td
                                        title={
                                        device.created_by_email && device.created_by_email !== adminLabel
                                            ? `${adminLabel} · ${device.created_by_email}`
                                            : adminLabel
                                        }
                                        style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                    >
                                        {adminLabel}
                                        {device.created_by_role && (
                                        <span
                                            style={{
                                            marginLeft: 6,
                                            fontSize: 10,
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.04em",
                                            }}
                                        >
                                            {device.created_by_role}
                                        </span>
                                        )}
                                    </td>

                                    <td style={{ whiteSpace: "nowrap" }}>
                                        {hierarchyLabel(device.hierarchy_type)}
                                    </td>

                                    <td
                                        title={locationText}
                                        style={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        lineHeight: 1.4,
                                        }}
                                    >
                                        {locationText}
                                    </td>

                                    <td style={{ whiteSpace: "nowrap", fontSize: 12, lineHeight: 1.5 }}>
                                        <div><strong>{device.capacity_ton ? `${device.capacity_ton} Ton` : "-"}</strong></div>
                                        <div>Install: {device.installation_date || "-"}</div>
                                        <div>Maintenance: {device.last_maintenance_date || "-"}</div>
                                    </td>

                                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                        <span className={device.status === "ON" ? "status-active" : "status-inactive"}>
                                        ● {device.status || "OFF"}
                                        </span>
                                    </td>
                                    </tr>
                                );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                </>
            ) : (
                <div className="admins-panel">

                    <div className="admins-panel-header">
                        <FiCpu size={22} />
                        <div>
                            <h2>Add AC Device</h2>
                            <p>Create the AC and assign it to a branch / floor / site.</p>
                        </div>
                    </div>

                    <form className="admins-form" onSubmit={handleSubmit}>
                        <div className="form-grid">

                            <label>
                                AC ID *
                                <input
                                value={form.ac_id}
                                onChange={(e) => setForm((p) => ({ ...p, ac_id: e.target.value }))}
                                placeholder="AC-MH-PUN-001"
                                required
                                />
                                <small className="field-hint">
                                    This should match the device ID used by your live AC/ThingsBoard data.
                                </small>
                            </label>

                            <label>
                                Device Name *
                                <input
                                value={form.device_name}
                                onChange={(e) => setForm((p) => ({ ...p, device_name: e.target.value }))}
                                placeholder="Pune Office AC 01"
                                required
                                />
                            </label>

                            <label>
                                Status *
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                                >
                                <option value="OFF">OFF</option>
                                <option value="ON">ON</option>
                                </select>
                            </label>

                            <div className="assign-card" style={{ marginTop: 20 }}>
                                {/* <div className="form-grid"> */}
                                    <label>
                                        Location Type *
                                        <select
                                            value={selectedHierarchy}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSelectedHierarchy(value);
                                                setFilters({
                                                    state_id: "", district_id: "", taluka_id: "", city_id: "",
                                                    zone_id: "", circle_id: "", region_id: "", division_id: "",
                                                });
                                                setForm((p) => ({ ...p, branch_id: "", floor_id: "" }));
                                                setFormError("");
                                            }}
                                            required
                                        >
                                            <option value="">— Select location type —</option>
                                            <option value="GEOGRAPHICAL">Geographical</option>
                                            <option value="ZONAL">Zonal</option>
                                        </select>
                                        <small className="field-hint">Select the location hierarchy first. Customer and users are assigned automatically from the selected end location.</small>
                                    </label>
                                {/* </div> */}
                            </div>

                        </div>

                        <div className="form-grid" style={{ marginTop: 18 }}>
                            <label>
                                Capacity (Ton) *
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={form.capacity_ton}
                                    onChange={(e) => setForm((p) => ({ ...p, capacity_ton: e.target.value }))}
                                    placeholder="1.5"
                                    required
                                />
                                <small className="field-hint">Enter the AC cooling capacity in Ton.</small>
                            </label>

                            <label>
                                Installation Date *
                                <input
                                    type="date"
                                    value={form.installation_date}
                                    onChange={(e) => setForm((p) => ({ ...p, installation_date: e.target.value }))}
                                    required
                                />
                            </label>

                            <label>
                                Last Maintenance Date
                                <input
                                    type="date"
                                    value={form.last_maintenance_date}
                                    min={form.installation_date || undefined}
                                    onChange={(e) => setForm((p) => ({ ...p, last_maintenance_date: e.target.value }))}
                                />
                                <small className="field-hint">Leave empty if maintenance has not been recorded yet.</small>
                            </label>
                        </div>


                        {/* Selected location summary */}
                        {selectedHierarchy && form.branch_id && (
                            <div className="assign-card" style={{ marginTop: 24 }}>
                                <div className="assign-row">
                                    <span className="assign-label">Location Hierarchy</span>
                                    <span className="assign-value">{hierarchyLabel(selectedHierarchy)}</span>
                                </div>
                                <div className="assign-row">
                                    <span className="assign-label">Selected Branch</span>
                                    <span className="assign-value">
                                        {selectedBranch?.branch_name || form.branch_id}
                                    </span>
                                </div>
                                {form.floor_id && (
                                    <div className="assign-row">
                                        <span className="assign-label">Selected Floor</span>
                                        <span className="assign-value">
                                            {floorOptions.find((f) => f.floor_id === form.floor_id)?.floor_name || form.floor_id}
                                        </span>
                                    </div>
                                )}

                                {/* ------- fetched from /branches/assignments/ ------- */}
                                {loadingAssignments && (
                                    <div className="assign-row">
                                        <span className="assign-label">Assignments</span>
                                        <span className="assign-value">Loading…</span>
                                    </div>
                                )}

                                {!loadingAssignments && assignmentsError && (
                                    <div className="assign-row">
                                        <span className="assign-label">Assignments</span>
                                        <span className="assign-value" style={{ color: "#b91c1c" }}>
                                            {assignmentsError}
                                        </span>
                                    </div>
                                )}

                                {!loadingAssignments && branchAssignments && (
                                    <>
                                        <div className="assign-row">
                                            <span className="assign-label">Customer</span>
                                            <span className="assign-value">
                                                {branchAssignments.customer
                                                    ? (branchAssignments.customer.company ||
                                                    branchAssignments.customer.code ||
                                                    `Customer #${branchAssignments.customer.id}`)
                                                    : "— not linked to a customer —"}
                                            </span>
                                        </div>

                                        <div className="assign-row">
                                            <span className="assign-label">
                                                Branch Admins ({branchAssignments.admins.length})
                                            </span>
                                            <span className="assign-value">
                                                {branchAssignments.admins.length === 0
                                                    ? "— none —"
                                                    : branchAssignments.admins.map((u) => u.name || u.email).join(", ")}
                                            </span>
                                        </div>

                                        <div className="assign-row">
                                            <span className="assign-label">
                                                Engineers ({branchAssignments.engineers.length})
                                            </span>
                                            <span className="assign-value">
                                                {branchAssignments.engineers.length === 0
                                                    ? "— none —"
                                                    : branchAssignments.engineers.map((u) => u.name || u.email).join(", ")}
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className="assign-row">
                                    <span className="assign-label">Automatic Assignment</span>
                                    <span className="assign-value">
                                        Customer, branch admins and engineers/users assigned to this
                                        location will be linked automatically.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* No branches for this hierarchy */}
                        {showEmptyHierarchy && (
                        <div className="assign-card" style={{ marginTop: 20 }}>
                            <span className="assign-loading">
                            No {selectedHierarchy === "GEOGRAPHICAL" ? "geographical" : "zonal"} locations
                            have been created yet. Add them from the Sites page first.
                            </span>
                        </div>
                        )}

                        {/* =================================================
                            LOCATION ASSIGNMENT
                        ================================================= */}
                        {hierarchyReady && (
                        <div className="assign-card" style={{ marginTop: 20 }}>
                            <div className="admins-panel-header" style={{ marginBottom: 20 }}>
                            <FiMapPin size={20} />
                            <div>
                                <h3 style={{ margin: 0 }}>Assign Location</h3>
                                <p>Select the end location. The backend will resolve the customer and users from this location.</p>
                            </div>
                            </div>

                            <div className="form-grid">

                            {/* ============ GEOGRAPHICAL CASCADE ============ */}
                            {selectedHierarchy === "GEOGRAPHICAL" && (
                                <>
                                <label>
                                    State
                                    <select
                                    value={filters.state_id}
                                    onChange={(e) =>
                                        handleFilterChange("state_id", e.target.value,
                                        ["district_id", "taluka_id", "city_id"])
                                    }
                                    >
                                    <option value="">All states</option>
                                    {stateOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    </select>
                                </label>

                                <label>
                                    District
                                    <select
                                    value={filters.district_id}
                                    onChange={(e) =>
                                        handleFilterChange("district_id", e.target.value,
                                        ["taluka_id", "city_id"])
                                    }
                                    disabled={!filters.state_id}
                                    >
                                    <option value="">All districts</option>
                                    {districtOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    </select>
                                </label>

                                <label>
                                    Taluka
                                    <select
                                    value={filters.taluka_id}
                                    onChange={(e) =>
                                        handleFilterChange("taluka_id", e.target.value, ["city_id"])
                                    }
                                    disabled={!filters.district_id}
                                    >
                                    <option value="">All talukas</option>
                                    {talukaOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    </select>
                                </label>

                                <label>
                                    City
                                    <select
                                    value={filters.city_id}
                                    onChange={(e) => handleFilterChange("city_id", e.target.value)}
                                    disabled={!filters.taluka_id}
                                    >
                                    <option value="">All cities</option>
                                    {cityOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    </select>
                                </label>
                                </>
                            )}

                            {/* ============ ZONAL CASCADE ============ */}
                            {selectedHierarchy === "ZONAL" && (
                                <>
                                <label>
                                    Zone
                                    <select
                                    value={filters.zone_id}
                                    onChange={(e) =>
                                        handleFilterChange("zone_id", e.target.value,
                                        ["circle_id", "region_id", "division_id"])
                                    }
                                    >
                                    <option value="">All zones</option>
                                    {zoneOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    </select>
                                </label>

                                <label>
                                    Circle
                                    <select
                                    value={filters.circle_id}
                                    onChange={(e) =>
                                        handleFilterChange("circle_id", e.target.value,
                                        ["region_id", "division_id"])
                                    }
                                    disabled={!filters.zone_id}
                                    >
                                    <option value="">All circles</option>
                                    {circleOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    </select>
                                </label>

                                <label>
                                    Region
                                    <select
                                    value={filters.region_id}
                                    onChange={(e) =>
                                        handleFilterChange("region_id", e.target.value, ["division_id"])
                                    }
                                    disabled={!filters.circle_id}
                                    >
                                    <option value="">All regions</option>
                                    {regionOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    </select>
                                </label>

                                <label>
                                    Division
                                    <select
                                    value={filters.division_id}
                                    onChange={(e) => handleFilterChange("division_id", e.target.value)}
                                    disabled={!filters.region_id}
                                    >
                                    <option value="">All divisions</option>
                                    {divisionOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                    </select>
                                </label>
                                </>
                            )}

                            <label style={{ gridColumn: "1 / -1" }}>
                                Branch *
                                <select
                                value={form.branch_id}
                                onChange={(e) => handleBranchChange(e.target.value)}
                                required
                                >
                                <option value="">— Select branch —</option>
                                {filteredBranches.map((branch) => (
                                    <option key={branch.branch_id} value={branch.branch_id}>
                                    {branchPath(branch, selectedHierarchy)}
                                    </option>
                                ))}
                                </select>
                                {filteredBranches.length === 0 && (
                                <small className="field-hint">
                                    No branches match the selected filters.
                                </small>
                                )}
                            </label>

                            <label>
                                Floor
                                <select
                                value={form.floor_id}
                                onChange={(e) => setForm((p) => ({ ...p, floor_id: e.target.value }))}
                                disabled={!form.branch_id || floorOptions.length === 0}
                                >
                                <option value="">Directly under branch</option>
                                {floorOptions.map((floor) => (
                                    <option key={floor.floor_id} value={floor.floor_id}>
                                    {floor.floor_name}
                                    {floor.floor_id ? ` (${floor.floor_id})` : ""}
                                    </option>
                                ))}
                                </select>
                                <small className="field-hint">
                                Leave this empty if the AC is directly under the branch.
                                </small>
                            </label>
                            </div>
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
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving || !selectedHierarchy || !form.branch_id}
                        >
                            <FiCheckCircle />
                            {saving ? "Creating..." : "Create & Assign Device"}
                        </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ACCreation;