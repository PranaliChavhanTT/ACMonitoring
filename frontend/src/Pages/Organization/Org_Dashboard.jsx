
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import "./Org_Dashboard.css";

import FilterDashboard from "./FilterDashboard";
import ACDashboard from "../../Second_Person/Forntend/ACDashboard";

const API_URL = "http://192.168.1.8:8000/api/ac-data/";

const FILTER_KEYS = [
    "zone",
    "state",
    "district",
    "taluka",
    "circle",
    "region",
    "division",
    "city",
    "branch",
    "floor",
];

const FILTER_LABELS = {
    zone:     "Zone",
    state:    "State",
    district: "District",
    taluka:   "Taluka",
    circle:   "Circle",
    region:   "Region",
    division: "Division",
    city:     "City",
    branch:   "Branch",
    floor:    "Floor",
};

const EMPTY_FILTERS = {
    hierarchy: "",
    ...Object.fromEntries(FILTER_KEYS.map((k) => [k, ""])),
};

const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    "";

const normalizeResponse = (result) => {
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.data)) return result.data;
    if (result && Array.isArray(result.results)) return result.results;
    return [];
};

function Org_Dashboard() {
    const [apiData, setApiData]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [filters, setFilters]         = useState(EMPTY_FILTERS);

    const fetchACData = useCallback(async () => {
        try {
            setLoading(true);

            const token  = getToken();
            const params = new URLSearchParams();

            if (filters.hierarchy) {
                params.append("hierarchy", filters.hierarchy);
            }

            FILTER_KEYS.forEach((key) => {
                const value = filters[key];
                if (value) params.append(key, value);
            });

            params.append("t", Date.now());

            const url = `${API_URL}?${params.toString()}`;
            console.log("FILTERED API URL:", url);

            const response = await fetch(url, {
                method: "GET",
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Token ${token}` } : {}),
                },
            });

            if (response.status === 401) {
                throw new Error("401 Unauthorized. Please login again.");
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result  = await response.json();
            const records = normalizeResponse(result);

            console.log("FILTERED API DATA:", result);

            setApiData(records);
            setLastUpdated(new Date());
            setError("");

        } catch (err) {
            console.error("AC API ERROR:", err);
            setError(err.message || "Unable to fetch AC data.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchACData();
        const interval = setInterval(fetchACData, 2000);
        return () => clearInterval(interval);
    }, [fetchACData]);

    const handleFilterChange = useCallback((newFilters) => {
        console.log("SELECTED FILTERS:", newFilters);

        setFilters({
            hierarchy: newFilters?.hierarchy ?? "",
            ...Object.fromEntries(
                FILTER_KEYS.map((k) => [k, newFilters?.[k] ?? ""])
            ),
        });
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters(EMPTY_FILTERS);
    }, []);

    const filterSummary = useMemo(() => {
        const parts = FILTER_KEYS
            .filter((k) => filters[k])
            .map((k) => `${FILTER_LABELS[k]}: ${filters[k]}`);

        return parts.length ? parts.join("  •  ") : "All Locations";
    }, [filters]);

    const lastUpdatedText = lastUpdated
        ? lastUpdated.toLocaleTimeString()
        : "--";

    return (
        <div className="organization-dashboard">
            <div className="organization-filter-card">
                <FilterDashboard
                    value={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
                <br />
            </div>

            {error && (
                <div className="organization-error">
                    <strong>Data API Error:</strong>
                    <span>{error}</span>
                </div>
            )}

            {loading && apiData.length === 0 ? (
                <div className="organization-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading AC data...</span>
                </div>
            ) : (
                <ACDashboard
                    data={apiData}
                    filters={filters}
                />
            )}
        </div>
    );
}

export default Org_Dashboard;