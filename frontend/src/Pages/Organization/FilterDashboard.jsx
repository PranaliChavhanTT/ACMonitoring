
import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8000/api/v1/filters/locations/";

const HIERARCHY_CONFIG = {
  GEOGRAPHICAL: {
    label: "Geographical",
    levels: [
      { name: "state",    label: "State",    field: "state_name",    childrenKey: "districts" },
      { name: "district", label: "District", field: "district_name", childrenKey: "talukas"   },
      { name: "taluka",   label: "Taluka",   field: "taluka_name",   childrenKey: "cities"    },
      { name: "city",     label: "City",     field: "city_name",     childrenKey: "branches"  },
      { name: "branch",   label: "Branch",   field: "branch_name",   childrenKey: "floors"    },
      { name: "floor",    label: "Floor",    field: "floor_name",    childrenKey: null        },
    ],
  },
  ZONAL: {
    label: "Zonal",
    levels: [
      { name: "zone",     label: "Zone",     field: "zone_name",     childrenKey: "circles"   },
      { name: "circle",   label: "Circle",   field: "circle_name",   childrenKey: "regions"   },
      { name: "region",   label: "Region",   field: "region_name",   childrenKey: "divisions" },
      { name: "division", label: "Division", field: "division_name", childrenKey: "branches"  },
      { name: "branch",   label: "Branch",   field: "branch_name",   childrenKey: "floors"    },
      { name: "floor",    label: "Floor",    field: "floor_name",    childrenKey: null        },
    ],
  },
};

const FilterDashboard = ({ onFilterChange, onReset }) => {
  const [hierarchy, setHierarchy] = useState("GEOGRAPHICAL");
  const [tree, setTree]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [selected, setSelected]   = useState({});

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    setTree([]);
    setSelected({});

    (async () => {
      try {
        const url =
          `${API_BASE}?hierarchy=${encodeURIComponent(hierarchy)}` +
          `&t=${Date.now()}`;

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result = await res.json();
        if (cancelled) return;

        const data = Array.isArray(result?.data) ? result.data : [];
        setTree(data);
      } catch (err) {
        if (cancelled) return;
        console.error("LOCATIONS API ERROR:", err);
        setError(err.message || "Unable to fetch filter locations.");
        setTree([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hierarchy]);

  const levels = HIERARCHY_CONFIG[hierarchy].levels;

  const optionsByLevel = useMemo(() => {
    const result = {};
    let current = tree;

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];

      const seen   = new Set();
      const values = [];
      for (const item of current || []) {
        const v = item[level.field];
        if (v && !seen.has(v)) {
          seen.add(v);
          values.push(v);
        }
      }
      result[level.name] = values;

      const picked = selected[level.name];

      if (!picked || !level.childrenKey) {
        for (let j = i + 1; j < levels.length; j++) {
          result[levels[j].name] = [];
        }
        break;
      }

      const matched = (current || []).find(
        (item) => item[level.field] === picked
      );
      current = (matched && matched[level.childrenKey]) || [];
    }

    return result;
  }, [tree, levels, selected]);

  useEffect(() => {
    if (typeof onFilterChange === "function") {
      onFilterChange({ hierarchy, ...selected });
    }
  }, [hierarchy, selected, onFilterChange]);

  const handleChange = (levelName, value) => {
    const idx = levels.findIndex((l) => l.name === levelName);

    setSelected((prev) => {
      const next = { ...prev, [levelName]: value };
      for (let i = idx + 1; i < levels.length; i++) {
        next[levels[i].name] = "";
      }
      return next;
    });
  };

  const handleReset = () => {
    setSelected({});
    if (typeof onReset === "function") onReset();
  };

  return (
    <div
      className="filter-dashboard"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 15px",
        background: "#ffffff",
        border: "1px solid #e1e8f0",
        borderRadius: "8px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          overflow: "hidden",
          height: "35px",
        }}
      >
        {Object.entries(HIERARCHY_CONFIG).map(([key, cfg]) => {
          const active = hierarchy === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setHierarchy(key)}
              style={{
                padding: "0 14px",
                border: "none",
                background: active ? "#2563eb" : "#ffffff",
                color: active ? "#ffffff" : "#374151",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: active ? 600 : 500,
              }}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {levels.map((level, index) => {
        const parentLevel = index > 0 ? levels[index - 1] : null;
        const disabled =
          index === 0 ? loading : !selected[parentLevel.name];

        const options = optionsByLevel[level.name] || [];
        const placeholder =
          loading && index === 0
            ? "Loading..."
            : `Select ${level.label}`;

        return (
          <select
            key={level.name}
            value={selected[level.name] || ""}
            onChange={(e) => handleChange(level.name, e.target.value)}
            disabled={disabled}
            className="filter-dropdown"
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      })}

      <button
        type="button"
        onClick={handleReset}
        style={{
          height: "35px",
          padding: "0 14px",
          border: "1px solid #d1d5db",
          borderRadius: "5px",
          background: "#ffffff",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Reset
      </button>

      {error && (
        <span style={{ color: "#c0392b", fontSize: "12px" }}>{error}</span>
      )}
    </div>
  );
};

export default FilterDashboard;