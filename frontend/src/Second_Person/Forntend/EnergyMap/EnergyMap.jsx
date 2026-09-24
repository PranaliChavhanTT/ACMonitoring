// import React, { useMemo, useState } from "react";
// import {
//     ComposableMap,
//     Geographies,
//     Geography,
//     Marker,
// } from "react-simple-maps";

// import { ZONE_STATES, ALL_STATES, ZONE_COLORS } from "./mapConfig";
// import "./EnergyMap.css";

// const INDIA_GEO_URL = "/maps/india-states.json";

// const ALIASES = {
//     orissa: "odisha",
//     pondicherry: "puducherry",
//     "daman and diu": "dadra and nagar haveli and daman and diu",
//     "daman & diu": "dadra and nagar haveli and daman and diu",
//     "dadra and nagar haveli": "dadra and nagar haveli and daman and diu",
//     "dadra nagar haveli": "dadra and nagar haveli and daman and diu",
//     daman: "dadra and nagar haveli and daman and diu",
//     diu: "dadra and nagar haveli and daman and diu",
//     uttaranchal: "uttarakhand",
//     "jammu & kashmir": "jammu and kashmir",
// };

// const normalizeName = (value) => {
//     if (!value) return "";

//     const name = String(value)
//         .trim()
//         .toLowerCase()
//         .replace(/&/g, "and")
//         .replace(/[.,]/g, "")
//         .replace(/\s+/g, " ");

//     return ALIASES[name] || name;
// };

// const getStateNameFromGeo = (geo) => {
//     const p = geo?.properties || {};
//     return (
//         p.name || p.NAME || p.NAME_1 ||
//         p.st_nm || p.ST_NM ||
//         p.state || p.State ||
//         p.state_name || p.State_Name ||
//         ""
//     );
// };

// const getState = (item) =>
//     item?.state || item?.State ||
//     item?.state_name || item?.State_Name ||
//     item?.st_nm || item?.ST_NM || "";

// const getZone = (item) => {
//     const apiZone =
//         item?.zone || item?.Zone ||
//         item?.zone_name || item?.Zone_Name || "";

//     if (apiZone) return apiZone;

//     const state = normalizeName(getState(item));

//     for (const [zone, states] of Object.entries(ZONE_STATES)) {
//         if (states.map(normalizeName).includes(state)) return zone;
//     }

//     return "";
// };

// const getCircle = (item) =>
//     item?.circle || item?.Circle ||
//     item?.circle_name || item?.Circle_Name || "";

// const getCity = (item) =>
//     item?.city || item?.City ||
//     item?.city_name || item?.City_Name || "";

// const getBranch = (item) =>
//     item?.branch || item?.Branch ||
//     item?.branch_name || item?.Branch_Name || "";

// const getEnergy = (item) => {
//     const value =
//         item?.energy_consumption ?? item?.Energy_Consumption ??
//         item?.energy ?? item?.Energy ??
//         item?.kwh ?? item?.kWh ?? 0;

//     const number = Number(value);
//     return Number.isFinite(number) ? number : 0;
// };

// const getLatitude = (item) => {
//     const value = item?.latitude ?? item?.Latitude ?? item?.lat ?? item?.Lat;
//     const number = Number(value);
//     return Number.isFinite(number) ? number : null;
// };

// const getLongitude = (item) => {
//     const value =
//         item?.longitude ?? item?.Longitude ??
//         item?.lng ?? item?.lon ?? item?.Lon;

//     const number = Number(value);
//     return Number.isFinite(number) ? number : null;
// };

// const getZoneFromState = (stateName) => {
//     const state = normalizeName(stateName);

//     for (const [zone, states] of Object.entries(ZONE_STATES)) {
//         if (states.map(normalizeName).includes(state)) return zone;
//     }

//     return "";
// };

// const generateBlueShades = (count) => {
//     const colors = [
//         "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6",
//         "#2563EB", "#1D4ED8", "#1557B0", "#0B3D91",
//     ];

//     if (count <= colors.length) return colors.slice(0, count);

//     return Array.from({ length: count }, (_, index) => {
//         const lightness = 75 - (index / Math.max(count - 1, 1)) * 50;
//         return `hsl(215, 90%, ${lightness}%)`;
//     });
// };

// const ZONE_NAME_TO_KEY = {
//     northern: "ZN-N",
//     central: "ZN-C",
//     western: "ZN-W",
//     eastern: "ZN-E",
//     "north eastern": "ZN-NE",
//     // northeastern: "ZN-NE",
//     southern: "ZN-S",
// };

// const resolveZoneKey = (zoneValue) => {
//     if (!zoneValue) return "";

//     const raw = String(zoneValue).trim();

//     if (ZONE_STATES[raw]) return raw;
//     if (ZONE_COLORS[raw]) return raw;

//     const upper = raw.toUpperCase();
//     if (ZONE_STATES[upper]) return upper;

//     const lowered = raw.toLowerCase();
//     if (ZONE_NAME_TO_KEY[lowered]) {
//         return ZONE_NAME_TO_KEY[lowered];
//     }

//     return "";
// };

// const ZONE_VIEW = {
//     "ZN-N":  { center: [75, 30], scale: 1400 },
//     "ZN-C":  { center: [79, 24], scale: 1500 },
//     "ZN-W":  { center: [73, 21], scale: 1600 },
//     "ZN-E":  { center: [86, 24], scale: 1800 },
//     "ZN-NE": { center: [93, 26], scale: 2200 },
//     "ZN-S":  { center: [78, 14], scale: 1500 },
// };

// const ZONE_NAME_VIEW = {
//     northern: ZONE_VIEW["ZN-N"],
//     central: ZONE_VIEW["ZN-C"],
//     western: ZONE_VIEW["ZN-W"],
//     eastern: ZONE_VIEW["ZN-E"],
//     "north eastern": ZONE_VIEW["ZN-NE"],
//     southern: ZONE_VIEW["ZN-S"],
// };

// const getZoneView = (zoneKey) => {
//     if (!zoneKey) return null;

//     return (
//         ZONE_VIEW[zoneKey] ||
//         ZONE_NAME_VIEW[String(zoneKey).trim().toLowerCase()] ||
//         null
//     );
// };

// const computeProjectionFromPoints = (points) => {
//     const valid = (points || []).filter(
//         (p) => p.latitude !== null && p.longitude !== null
//     );

//     if (valid.length === 0) return null;

//     const lats = valid.map((p) => p.latitude);
//     const lngs = valid.map((p) => p.longitude);

//     const minLat = Math.min(...lats);
//     const maxLat = Math.max(...lats);
//     const minLng = Math.min(...lngs);
//     const maxLng = Math.max(...lngs);

//     const centerLat = (minLat + maxLat) / 2;
//     const centerLng = (minLng + maxLng) / 2;

//     const latSpan = Math.max(maxLat - minLat, 0.05);
//     const lngSpan = Math.max(maxLng - minLng, 0.05);

//     const lngScale = 25000 / lngSpan;
//     const latScale =
//         25000 / (latSpan / Math.cos((centerLat * Math.PI) / 180));

//     const raw = Math.min(lngScale, latScale);
//     const scale = Math.min(15000, Math.max(1500, raw));

//     return { center: [centerLng, centerLat], scale };
// };

// const EnergyMap = ({ data = [], filters = {} }) => {
//     const [tooltip, setTooltip] = useState(null);

//     const safeData = useMemo(() => {
//         if (Array.isArray(data)) return data;
//         if (Array.isArray(data?.data)) return data.data;
//         if (Array.isArray(data?.results)) return data.results;
//         return [];
//     }, [data]);

//     const selectedZone = filters?.zone || filters?.Zone || "";
//     const selectedState = filters?.state || filters?.State || "";
//     const selectedCircle = filters?.circle || filters?.Circle || "";
//     const selectedCity = filters?.city || filters?.City || "";
//     const selectedBranch = filters?.branch || filters?.Branch || "";

//     const selectedZoneKey = useMemo(
//         () => resolveZoneKey(selectedZone),
//         [selectedZone]
//     );
    
//     let mapLevel = "india";
//     if (selectedBranch) mapLevel = "branch";
//     else if (selectedCity) mapLevel = "city";
//     else if (selectedCircle) mapLevel = "circle";
//     else if (selectedState) mapLevel = "state";
//     else if (selectedZone) mapLevel = "zone";

//     const filteredData = useMemo(() => {
//         return safeData.filter((item) => {
//             const itemZone = normalizeName(getZone(item));
//             const itemState = normalizeName(getState(item));
//             const itemCircle = normalizeName(getCircle(item));
//             const itemCity = normalizeName(getCity(item));
//             const itemBranch = normalizeName(getBranch(item));

//             if (selectedZoneKey) {
//                 const itemZoneKey = resolveZoneKey(getZone(item));
//                 if (itemZoneKey !== selectedZoneKey) return false;
//             // }if (selectedState && itemState !== normalizeName(selectedState)) return false;
//             }if (selectedState && itemState !== normalizeName(selectedState)) return false;
//             if (selectedCircle && itemCircle !== normalizeName(selectedCircle)) return false;
//             if (selectedCity && itemCity !== normalizeName(selectedCity)) return false;
//             if (selectedBranch && itemBranch !== normalizeName(selectedBranch)) return false;

//             return true;
//         });
//     }, [
//         safeData,
//         selectedZoneKey,
//         selectedState,
//         selectedCircle,
//         selectedCity,
//         selectedBranch,
//     ]);

//     const stateEnergy = useMemo(() => {
//         const result = {};

//         filteredData.forEach((item) => {
//             const state = getState(item);
//             if (!state) return;

//             const key = normalizeName(state);

//             if (!result[key]) result[key] = { name: state, energy: 0 };
//             result[key].energy += getEnergy(item);
//         });

//         return result;
//     }, [filteredData]);

//     const zoneEnergy = useMemo(() => {
//         const result = {};

//         Object.keys(ZONE_STATES).forEach((zone) => {
//             result[zone] = 0;
//         });

//         filteredData.forEach((item) => {
//             const zoneKey = resolveZoneKey(getZone(item));
//             if (zoneKey && result[zoneKey] !== undefined) {
//                 result[zoneKey] += getEnergy(item);
//             }
//         });

//         return result;
//     }, [filteredData]);

//     const statesToRender = useMemo(() => {
//         if (selectedState) {
//             return new Set([normalizeName(selectedState)]);
//         }

//         if (selectedCircle || selectedCity || selectedBranch) {
//             const fromData = new Set();

//             filteredData.forEach((item) => {
//                 const state = getState(item);
//                 if (state) fromData.add(normalizeName(state));
//             });

//             if (fromData.size > 0) return fromData;
//         }

//         if (selectedZoneKey) {
//             return new Set(
//                 (ZONE_STATES[selectedZoneKey] || []).map(normalizeName)
//             );
//         }

//         return new Set(ALL_STATES.map(normalizeName));
//     }, [
//         selectedZoneKey,
//         selectedState,
//         selectedCircle,
//         selectedCity,
//         selectedBranch,
//         filteredData,
//     ]);

//     const childLocations = useMemo(() => {
//         const result = {};

//         filteredData.forEach((item) => {
//             let name = "";

//             if (mapLevel === "state" || mapLevel === "circle") {
//                 name = getCity(item);
//             } else if (mapLevel === "city" || mapLevel === "branch") {
//                 name = getBranch(item);
//             }

//             if (!name) return;

//             const key = normalizeName(name);

//             if (!result[key]) {
//                 result[key] = {
//                     name,
//                     energy: 0,
//                     latitude: getLatitude(item),
//                     longitude: getLongitude(item),
//                 };
//             }

//             result[key].energy += getEnergy(item);

//             if (result[key].latitude === null && getLatitude(item) !== null) {
//                 result[key].latitude = getLatitude(item);
//             }

//             if (result[key].longitude === null && getLongitude(item) !== null) {
//                 result[key].longitude = getLongitude(item);
//             }
//         });

//         return Object.values(result);
//     }, [filteredData, mapLevel]);

//     const childColors = useMemo(() => {
//         const sorted = [...childLocations].sort((a, b) => b.energy - a.energy);
//         const shades = generateBlueShades(sorted.length);
//         const result = {};

//         sorted.forEach((item, index) => {
//             result[normalizeName(item.name)] = shades[index] || "#3B82F6";
//         });

//         return result;
//     }, [childLocations]);

//     const projection = useMemo(() => {
//         if (mapLevel === "india") {
//             return { center: [82, 22.5], scale: 700 };
//         }

//         if (mapLevel === "zone") {
//             const view = getZoneView(selectedZoneKey);
//             if (view) return view;
//         }

//         const fromPoints = computeProjectionFromPoints(childLocations);
//         if (fromPoints) return fromPoints;

//         const fallback = {
//             state: 2500,
//             circle: 3500,
//             city: 5000,
//             branch: 8000,
//         }[mapLevel];

//         return { center: [82, 22.5], scale: fallback || 700 };
//     }, [mapLevel, selectedZoneKey, childLocations]);

//     const mapTitle = {
//         india: "India – Zone-wise Energy Consumption",
//         zone: `${selectedZone} – State-wise Energy`,
//         state: `${selectedState} – City-wise Energy`,
//         circle: `${selectedCircle} – City-wise Energy`,
//         city: `${selectedCity} – Branch-wise Energy`,
//         branch: `${selectedBranch} – Energy Consumption`,
//     }[mapLevel];

//     return (
//         <div className="energy-map-card">
//             <div className="energy-map-header">
//                 <h3>{mapTitle}</h3>
//             </div>

//             <div className="energy-map-wrapper">
//                 <ComposableMap
//                     projection="geoMercator"
//                     projectionConfig={projection}
//                     width={800}
//                     height={500}
//                 >
//                     <Geographies geography={INDIA_GEO_URL}>
//                         {({ geographies }) => (
//                             <>
//                                 {geographies
//                                     .filter((geo) => {
//                                         const stateName = normalizeName(
//                                             getStateNameFromGeo(geo)
//                                         );
//                                         return statesToRender.has(stateName);
//                                     })
//                                     .map((geo) => {
//                                         const originalName =
//                                             getStateNameFromGeo(geo);
//                                         const stateName =
//                                             normalizeName(originalName);
//                                         const energy =
//                                             stateEnergy[stateName]?.energy || 0;

//                                         let fill;

//                                         if (selectedState) {
//                                             fill =
//                                                 stateName ===
//                                                 normalizeName(selectedState)
//                                                     ? "#2563EB"
//                                                     : "#E5E7EB";
//                                         } else if (
//                                             selectedCircle ||
//                                             selectedCity ||
//                                             selectedBranch
//                                         ) {
//                                             const zone =
//                                                 getZoneFromState(stateName);
//                                             fill =
//                                                 ZONE_COLORS[zone] || "#93C5FD";
//                                         } else if (selectedZoneKey) {
//                                             const states = ZONE_STATES[selectedZoneKey] || [];
//                                             const index = states.findIndex(
//                                                 (s) => normalizeName(s) === stateName
//                                             );
//                                             const shades = generateBlueShades(states.length);
//                                             fill =
//                                                 shades[index >= 0 ? index : 0] ||
//                                                 ZONE_COLORS[selectedZoneKey] ||
//                                                 "#DBEAFE";
//                                         } else {
//                                             const zone =
//                                                 getZoneFromState(stateName);
//                                             fill =
//                                                 ZONE_COLORS[zone] || "#DBEAFE";
//                                         }

//                                         return (
//                                             <Geography
//                                                 key={geo.rsmKey}
//                                                 geography={geo}
//                                                 fill={fill}
//                                                 stroke="#FFFFFF"
//                                                 strokeWidth={0.8}
//                                                 style={{
//                                                     default: { outline: "none" },
//                                                     hover: {
//                                                         outline: "none",
//                                                         opacity: 0.82,
//                                                         cursor: "pointer",
//                                                     },
//                                                     pressed: { outline: "none" },
//                                                 }}
//                                                 onMouseEnter={() =>
//                                                     setTooltip({
//                                                         name: originalName,
//                                                         energy,
//                                                     })
//                                                 }
//                                                 onMouseLeave={() =>
//                                                     setTooltip(null)
//                                                 }
//                                             />
//                                         );
//                                     })}
//                             </>
//                         )}
//                     </Geographies>

//                     {(mapLevel === "state" ||
//                         mapLevel === "circle" ||
//                         mapLevel === "city" ||
//                         mapLevel === "branch") &&
//                         childLocations
//                             .filter(
//                                 (item) =>
//                                     item.latitude !== null &&
//                                     item.longitude !== null
//                             )
//                             .map((item) => {
//                                 const key = normalizeName(item.name);
//                                 const color = childColors[key] || "#3B82F6";

//                                 return (
//                                     <Marker
//                                         key={`${key}-${item.latitude}-${item.longitude}`}
//                                         coordinates={[
//                                             item.longitude,
//                                             item.latitude,
//                                         ]}
//                                     >
//                                         <circle
//                                             r={mapLevel === "branch" ? 6 : 7}
//                                             fill={color}
//                                             stroke="#FFFFFF"
//                                             strokeWidth={1.5}
//                                             onMouseEnter={() =>
//                                                 setTooltip({
//                                                     name: item.name,
//                                                     energy: item.energy,
//                                                 })
//                                             }
//                                             onMouseLeave={() =>
//                                                 setTooltip(null)
//                                             }
//                                         />

//                                         <text
//                                             textAnchor="middle"
//                                             y="-10"
//                                             className="energy-map-label"
//                                         >
//                                             {item.name}
//                                         </text>
//                                     </Marker>
//                                 );
//                             })}

//                     {!selectedZone && !selectedState && (
//                         <>
//                             <Marker coordinates={[78, 30]}>
//                                 <text textAnchor="middle" className="zone-label">
//                                     North
//                                 </text>
//                             </Marker>

//                             <Marker coordinates={[79, 23]}>
//                                 <text textAnchor="middle" className="zone-label">
//                                     Central
//                                 </text>
//                             </Marker>

//                             <Marker coordinates={[72, 20]}>
//                                 <text textAnchor="middle" className="zone-label">
//                                     West
//                                 </text>
//                             </Marker>

//                             <Marker coordinates={[87, 24]}>
//                                 <text textAnchor="middle" className="zone-label">
//                                     East
//                                 </text>
//                             </Marker>

//                             <Marker coordinates={[94, 26]}>
//                                 <text textAnchor="middle" className="zone-label">
//                                     North-East
//                                 </text>
//                             </Marker>

//                             <Marker coordinates={[78, 13]}>
//                                 <text textAnchor="middle" className="zone-label">
//                                     South
//                                 </text>
//                             </Marker>
//                         </>
//                     )}
//                 </ComposableMap>

//                 {tooltip && (
//                     <div className="energy-map-tooltip">
//                         <strong>{tooltip.name}</strong>
//                         <span>
//                             Energy:{" "}
//                             {Number(tooltip.energy || 0).toFixed(2)} kWh
//                         </span>
//                     </div>
//                 )}
//             </div>

//             <div className="energy-map-breadcrumb">
//                 <span>India</span>

//                 {selectedZone && (
//                     <>
//                         <b>›</b>
//                         <span>{selectedZone}</span>
//                     </>
//                 )}

//                 {selectedState && (
//                     <>
//                         <b>›</b>
//                         <span>{selectedState}</span>
//                     </>
//                 )}

//                 {selectedCircle && (
//                     <>
//                         <b>›</b>
//                         <span>{selectedCircle}</span>
//                     </>
//                 )}

//                 {selectedCity && (
//                     <>
//                         <b>›</b>
//                         <span>{selectedCity}</span>
//                     </>
//                 )}

//                 {selectedBranch && (
//                     <>
//                         <b>›</b>
//                         <span>{selectedBranch}</span>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default EnergyMap;



import React, { useEffect, useMemo, useState } from "react";
import { geoBounds } from "d3-geo";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";

import { ZONE_STATES, ALL_STATES, ZONE_COLORS } from "./mapConfig";
import "./EnergyMap.css";

const INDIA_GEO_URL = "/maps/india-states.json";

// ============================================================
// NAME NORMALIZATION
// ============================================================

const ALIASES = {
    orissa: "odisha",
    pondicherry: "puducherry",
    "daman and diu": "dadra and nagar haveli and daman and diu",
    "daman & diu": "dadra and nagar haveli and daman and diu",
    "dadra and nagar haveli": "dadra and nagar haveli and daman and diu",
    "dadra nagar haveli": "dadra and nagar haveli and daman and diu",
    daman: "dadra and nagar haveli and daman and diu",
    diu: "dadra and nagar haveli and daman and diu",
    uttaranchal: "uttarakhand",
    "jammu & kashmir": "jammu and kashmir",
};

const normalizeName = (value) => {
    if (!value) return "";

    const name = String(value)
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[.,]/g, "")
        .replace(/\s+/g, " ");

    return ALIASES[name] || name;
};

// ============================================================
// DATA ACCESSORS
// ============================================================

const getStateNameFromGeo = (geo) => {
    const p = geo?.properties || {};
    return (
        p.name || p.NAME || p.NAME_1 ||
        p.st_nm || p.ST_NM ||
        p.state || p.State ||
        p.state_name || p.State_Name ||
        ""
    );
};

const getState = (item) =>
    item?.state || item?.State ||
    item?.state_name || item?.State_Name ||
    item?.st_nm || item?.ST_NM || "";

const getZone = (item) => {
    const apiZone =
        item?.zone || item?.Zone ||
        item?.zone_name || item?.Zone_Name || "";

    if (apiZone) return apiZone;

    const state = normalizeName(getState(item));

    for (const [zone, states] of Object.entries(ZONE_STATES)) {
        if (states.map(normalizeName).includes(state)) return zone;
    }

    return "";
};

const getCircle = (item) =>
    item?.circle || item?.Circle ||
    item?.circle_name || item?.Circle_Name || "";

const getCity = (item) =>
    item?.city || item?.City ||
    item?.city_name || item?.City_Name || "";

const getBranch = (item) =>
    item?.branch || item?.Branch ||
    item?.branch_name || item?.Branch_Name || "";

const getEnergy = (item) => {
    const value =
        item?.energy_consumption ?? item?.Energy_Consumption ??
        item?.energy ?? item?.Energy ??
        item?.kwh ?? item?.kWh ?? 0;

    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const getLatitude = (item) => {
    const value = item?.latitude ?? item?.Latitude ?? item?.lat ?? item?.Lat;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const getLongitude = (item) => {
    const value =
        item?.longitude ?? item?.Longitude ??
        item?.lng ?? item?.lon ?? item?.Lon;

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const getZoneFromState = (stateName) => {
    const state = normalizeName(stateName);

    for (const [zone, states] of Object.entries(ZONE_STATES)) {
        if (states.map(normalizeName).includes(state)) return zone;
    }

    return "";
};

// ============================================================
// BLUE SHADES
// ============================================================

const generateBlueShades = (count) => {
    const colors = [
        "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6",
        "#2563EB", "#1D4ED8", "#1557B0", "#0B3D91",
    ];

    if (count <= colors.length) return colors.slice(0, count);

    return Array.from({ length: count }, (_, index) => {
        const lightness = 75 - (index / Math.max(count - 1, 1)) * 50;
        return `hsl(215, 90%, ${lightness}%)`;
    });
};

// ============================================================
// ZONE KEY RESOLUTION
// Filters may pass either "ZN-N" or "Northern" — resolve both.
// ============================================================

const ZONE_NAME_TO_KEY = {
    northern: "ZN-N",
    central: "ZN-C",
    western: "ZN-W",
    eastern: "ZN-E",
    "north eastern": "ZN-NE",
    northeastern: "ZN-NE",
    southern: "ZN-S",
};

const resolveZoneKey = (zoneValue) => {
    if (!zoneValue) return "";

    const raw = String(zoneValue).trim();

    if (ZONE_STATES[raw]) return raw;
    if (ZONE_COLORS[raw]) return raw;

    const upper = raw.toUpperCase();
    if (ZONE_STATES[upper]) return upper;

    const lowered = raw.toLowerCase();
    if (ZONE_NAME_TO_KEY[lowered]) return ZONE_NAME_TO_KEY[lowered];

    return "";
};

// ============================================================
// PROJECTION HELPERS
// ============================================================

/**
 * Fit a geoMercator projection to a set of lat/lng points.
 * Used for city / branch levels where we don't need state polygons.
 */
const computeProjectionFromPoints = (points) => {
    const valid = (points || []).filter(
        (p) => p.latitude !== null && p.longitude !== null
    );

    if (valid.length === 0) return null;

    const lats = valid.map((p) => p.latitude);
    const lngs = valid.map((p) => p.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const latSpan = Math.max(maxLat - minLat, 0.05);
    const lngSpan = Math.max(maxLng - minLng, 0.05);

    const lngScale = 25000 / lngSpan;
    const latScale =
        25000 / (latSpan / Math.cos((centerLat * Math.PI) / 180));

    const raw = Math.min(lngScale, latScale);
    const scale = Math.min(15000, Math.max(1500, raw));

    return { center: [centerLng, centerLat], scale };
};

/**
 * Fit a geoMercator projection to a geographic bounding box.
 *
 * `bounds` is [[minLng, minLat], [maxLng, maxLat]] as returned
 * by d3-geo's `geoBounds`.
 *
 * For geoMercator:
 *   - 1 radian of longitude  = `scale` pixels
 *   - 1 radian of latitude   ≈ `scale / cos(centerLat)` pixels
 *
 * So we solve for the scale that fits both axes inside the
 * available area (width/height minus padding) and take the
 * smaller one so nothing gets cropped.
 */
const computeProjectionFromBounds = (
    bounds,
    width = 800,
    height = 500,
    padding = 60
) => {
    if (!bounds || !bounds[0] || !bounds[1]) return null;

    const [[minLng, minLat], [maxLng, maxLat]] = bounds;

    if (
        !Number.isFinite(minLng) ||
        !Number.isFinite(minLat) ||
        !Number.isFinite(maxLng) ||
        !Number.isFinite(maxLat)
    ) {
        return null;
    }

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    const lngSpan = Math.max(maxLng - minLng, 0.05);
    const latSpan = Math.max(maxLat - minLat, 0.05);

    const availW = width - padding * 2;
    const availH = height - padding * 2;

    const rad = Math.PI / 180;
    const cosLat = Math.cos(centerLat * rad);

    const lngScale = availW / (lngSpan * rad);
    const latScale = availH / ((latSpan * rad) / cosLat);

    const scale = Math.min(lngScale, latScale);

    return { center: [centerLng, centerLat], scale };
};

// ============================================================
// COMPONENT
// ============================================================

const EnergyMap = ({ data = [], filters = {} }) => {
    const [tooltip, setTooltip] = useState(null);

    // Raw GeoJSON features (loaded once)
    const [geoFeatures, setGeoFeatures] = useState([]);

    // --------------------------------------------------------
    // LOAD INDIA GEOJSON
    // --------------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        fetch(INDIA_GEO_URL)
            .then((res) => res.json())
            .then((json) => {
                if (cancelled) return;
                setGeoFeatures(json?.features || []);
            })
            .catch(() => {
                if (!cancelled) setGeoFeatures([]);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // --------------------------------------------------------
    // API DATA
    // --------------------------------------------------------

    const safeData = useMemo(() => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
    }, [data]);

    // --------------------------------------------------------
    // FILTERS
    // --------------------------------------------------------

    const selectedZone = filters?.zone || filters?.Zone || "";
    const selectedState = filters?.state || filters?.State || "";
    const selectedCircle = filters?.circle || filters?.Circle || "";
    const selectedCity = filters?.city || filters?.City || "";
    const selectedBranch = filters?.branch || filters?.Branch || "";

    const selectedZoneKey = useMemo(
        () => resolveZoneKey(selectedZone),
        [selectedZone]
    );

    // --------------------------------------------------------
    // MAP LEVEL
    // --------------------------------------------------------

    let mapLevel = "india";
    if (selectedBranch) mapLevel = "branch";
    else if (selectedCity) mapLevel = "city";
    else if (selectedCircle) mapLevel = "circle";
    else if (selectedState) mapLevel = "state";
    else if (selectedZone) mapLevel = "zone";

    // --------------------------------------------------------
    // FILTER DATA (hierarchy-aware)
    // --------------------------------------------------------

    const filteredData = useMemo(() => {
        return safeData.filter((item) => {
            const itemState = normalizeName(getState(item));
            const itemCircle = normalizeName(getCircle(item));
            const itemCity = normalizeName(getCity(item));
            const itemBranch = normalizeName(getBranch(item));

            if (selectedZoneKey) {
                const itemZoneKey = resolveZoneKey(getZone(item));
                if (itemZoneKey !== selectedZoneKey) return false;
            }

            if (selectedState && itemState !== normalizeName(selectedState)) return false;
            if (selectedCircle && itemCircle !== normalizeName(selectedCircle)) return false;
            if (selectedCity && itemCity !== normalizeName(selectedCity)) return false;
            if (selectedBranch && itemBranch !== normalizeName(selectedBranch)) return false;

            return true;
        });
    }, [
        safeData,
        selectedZoneKey,
        selectedState,
        selectedCircle,
        selectedCity,
        selectedBranch,
    ]);

    // --------------------------------------------------------
    // STATE ENERGY
    // --------------------------------------------------------

    const stateEnergy = useMemo(() => {
        const result = {};

        filteredData.forEach((item) => {
            const state = getState(item);
            if (!state) return;

            const key = normalizeName(state);

            if (!result[key]) result[key] = { name: state, energy: 0 };
            result[key].energy += getEnergy(item);
        });

        return result;
    }, [filteredData]);

    // --------------------------------------------------------
    // ZONE ENERGY
    // --------------------------------------------------------

    const zoneEnergy = useMemo(() => {
        const result = {};

        Object.keys(ZONE_STATES).forEach((zone) => {
            result[zone] = 0;
        });

        filteredData.forEach((item) => {
            const zoneKey = resolveZoneKey(getZone(item));
            if (zoneKey && result[zoneKey] !== undefined) {
                result[zoneKey] += getEnergy(item);
            }
        });

        return result;
    }, [filteredData]);

    // --------------------------------------------------------
    // STATES TO RENDER
    // The set of state polygons that should be visible.
    // --------------------------------------------------------

    const statesToRender = useMemo(() => {
        if (selectedState) {
            return new Set([normalizeName(selectedState)]);
        }

        if (selectedCircle || selectedCity || selectedBranch) {
            const fromData = new Set();

            filteredData.forEach((item) => {
                const state = getState(item);
                if (state) fromData.add(normalizeName(state));
            });

            if (fromData.size > 0) return fromData;
        }

        if (selectedZoneKey) {
            return new Set(
                (ZONE_STATES[selectedZoneKey] || []).map(normalizeName)
            );
        }

        return new Set(ALL_STATES.map(normalizeName));
    }, [
        selectedZoneKey,
        selectedState,
        selectedCircle,
        selectedCity,
        selectedBranch,
        filteredData,
    ]);

    // --------------------------------------------------------
    // CHILD LOCATIONS (cities / branches)
    // --------------------------------------------------------

    const childLocations = useMemo(() => {
        const result = {};

        filteredData.forEach((item) => {
            let name = "";

            if (mapLevel === "state" || mapLevel === "circle") {
                name = getCity(item);
            } else if (mapLevel === "city" || mapLevel === "branch") {
                name = getBranch(item);
            }

            if (!name) return;

            const key = normalizeName(name);

            if (!result[key]) {
                result[key] = {
                    name,
                    energy: 0,
                    latitude: getLatitude(item),
                    longitude: getLongitude(item),
                };
            }

            result[key].energy += getEnergy(item);

            if (result[key].latitude === null && getLatitude(item) !== null) {
                result[key].latitude = getLatitude(item);
            }

            if (result[key].longitude === null && getLongitude(item) !== null) {
                result[key].longitude = getLongitude(item);
            }
        });

        return Object.values(result);
    }, [filteredData, mapLevel]);

    // --------------------------------------------------------
    // CHILD COLORS
    // --------------------------------------------------------

    const childColors = useMemo(() => {
        const sorted = [...childLocations].sort((a, b) => b.energy - a.energy);
        const shades = generateBlueShades(sorted.length);
        const result = {};

        sorted.forEach((item, index) => {
            result[normalizeName(item.name)] = shades[index] || "#3B82F6";
        });

        return result;
    }, [childLocations]);

    // --------------------------------------------------------
    // DYNAMIC PROJECTION
    //
    // India level          → fixed India-wide view
    // Zone / state / circle → fit to geographic bounds of
    //                         currently visible state polygons
    // City / branch         → fit to the bounding box of
    //                         city / branch marker points
    // --------------------------------------------------------

    const projection = useMemo(() => {
        if (mapLevel === "india") {
            return { center: [82, 22.5], scale: 700 };
        }

        const useBounds =
            mapLevel === "zone" ||
            mapLevel === "state" ||
            mapLevel === "circle";

        if (useBounds && geoFeatures.length > 0 && statesToRender.size > 0) {
            const visible = geoFeatures.filter((feature) =>
                statesToRender.has(normalizeName(getStateNameFromGeo(feature)))
            );

            if (visible.length > 0) {
                const bounds = geoBounds({
                    type: "FeatureCollection",
                    features: visible,
                });

                const fitted = computeProjectionFromBounds(bounds, 800, 500, 60);
                if (fitted) return fitted;
            }
        }

        const fromPoints = computeProjectionFromPoints(childLocations);
        if (fromPoints) return fromPoints;

        const fallback = {
            state: 2500,
            circle: 3500,
            city: 5000,
            branch: 8000,
        }[mapLevel];

        return { center: [82, 22.5], scale: fallback || 700 };
    }, [mapLevel, statesToRender, geoFeatures, childLocations]);

    // --------------------------------------------------------
    // MAP TITLE
    // --------------------------------------------------------

    const mapTitle = {
        india: "India – Zone-wise Energy Consumption",
        zone: `${selectedZone} – State-wise Energy`,
        state: `${selectedState} – City-wise Energy`,
        circle: `${selectedCircle} – City-wise Energy`,
        city: `${selectedCity} – Branch-wise Energy`,
        branch: `${selectedBranch} – Energy Consumption`,
    }[mapLevel];

    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    return (
        <div className="energy-map-card">
            <div className="energy-map-header">
                <h3>{mapTitle}</h3>
            </div>

            <div className="energy-map-wrapper">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={projection}
                    width={800}
                    height={500}
                >
                    {/* ==========================================
                        STATE POLYGONS
                    ========================================== */}
                    <Geographies geography={INDIA_GEO_URL}>
                        {({ geographies }) => (
                            <>
                                {geographies
                                    .filter((geo) => {
                                        const stateName = normalizeName(
                                            getStateNameFromGeo(geo)
                                        );
                                        return statesToRender.has(stateName);
                                    })
                                    .map((geo) => {
                                        const originalName =
                                            getStateNameFromGeo(geo);
                                        const stateName =
                                            normalizeName(originalName);
                                        const energy =
                                            stateEnergy[stateName]?.energy || 0;

                                        let fill;

                                        if (selectedState) {
                                            fill =
                                                stateName ===
                                                normalizeName(selectedState)
                                                    ? "#2563EB"
                                                    : "#E5E7EB";
                                        } else if (
                                            selectedCircle ||
                                            selectedCity ||
                                            selectedBranch
                                        ) {
                                            const zone =
                                                getZoneFromState(stateName);
                                            fill =
                                                ZONE_COLORS[zone] || "#93C5FD";
                                        } else if (selectedZoneKey) {
                                            const states =
                                                ZONE_STATES[selectedZoneKey] || [];
                                            const index = states.findIndex(
                                                (s) =>
                                                    normalizeName(s) === stateName
                                            );
                                            const shades = generateBlueShades(
                                                states.length
                                            );
                                            fill =
                                                shades[index >= 0 ? index : 0] ||
                                                ZONE_COLORS[selectedZoneKey] ||
                                                "#DBEAFE";
                                        } else {
                                            const zone =
                                                getZoneFromState(stateName);
                                            fill =
                                                ZONE_COLORS[zone] || "#DBEAFE";
                                        }

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={fill}
                                                stroke="#FFFFFF"
                                                strokeWidth={0.8}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: {
                                                        outline: "none",
                                                        opacity: 0.82,
                                                        cursor: "pointer",
                                                    },
                                                    pressed: { outline: "none" },
                                                }}
                                                onMouseEnter={() =>
                                                    setTooltip({
                                                        name: originalName,
                                                        energy,
                                                    })
                                                }
                                                onMouseLeave={() =>
                                                    setTooltip(null)
                                                }
                                            />
                                        );
                                    })}
                            </>
                        )}
                    </Geographies>

                    {/* ==========================================
                        CITY / BRANCH MARKERS
                    ========================================== */}
                    {(mapLevel === "state" ||
                        mapLevel === "circle" ||
                        mapLevel === "city" ||
                        mapLevel === "branch") &&
                        childLocations
                            .filter(
                                (item) =>
                                    item.latitude !== null &&
                                    item.longitude !== null
                            )
                            .map((item) => {
                                const key = normalizeName(item.name);
                                const color = childColors[key] || "#3B82F6";

                                return (
                                    <Marker
                                        key={`${key}-${item.latitude}-${item.longitude}`}
                                        coordinates={[
                                            item.longitude,
                                            item.latitude,
                                        ]}
                                    >
                                        <circle
                                            r={mapLevel === "branch" ? 6 : 7}
                                            fill={color}
                                            stroke="#FFFFFF"
                                            strokeWidth={1.5}
                                            onMouseEnter={() =>
                                                setTooltip({
                                                    name: item.name,
                                                    energy: item.energy,
                                                })
                                            }
                                            onMouseLeave={() =>
                                                setTooltip(null)
                                            }
                                        />

                                        <text
                                            textAnchor="middle"
                                            y="-10"
                                            className="energy-map-label"
                                        >
                                            {item.name}
                                        </text>
                                    </Marker>
                                );
                            })}

                    {/* ==========================================
                        ZONE LABELS (India level only)
                    ========================================== */}
                    {!selectedZoneKey && !selectedState && (
                        <>
                            <Marker coordinates={[78, 30]}>
                                <text textAnchor="middle" className="zone-label">
                                    North
                                </text>
                            </Marker>

                            <Marker coordinates={[79, 23]}>
                                <text textAnchor="middle" className="zone-label">
                                    Central
                                </text>
                            </Marker>

                            <Marker coordinates={[72, 20]}>
                                <text textAnchor="middle" className="zone-label">
                                    West
                                </text>
                            </Marker>

                            <Marker coordinates={[87, 24]}>
                                <text textAnchor="middle" className="zone-label">
                                    East
                                </text>
                            </Marker>

                            <Marker coordinates={[94, 26]}>
                                <text textAnchor="middle" className="zone-label">
                                    North-East
                                </text>
                            </Marker>

                            <Marker coordinates={[78, 13]}>
                                <text textAnchor="middle" className="zone-label">
                                    South
                                </text>
                            </Marker>
                        </>
                    )}
                </ComposableMap>

                {/* ==========================================
                    TOOLTIP
                ========================================== */}
                {tooltip && (
                    <div className="energy-map-tooltip">
                        <strong>{tooltip.name}</strong>
                        <span>
                            Energy:{" "}
                            {Number(tooltip.energy || 0).toFixed(2)} kWh
                        </span>
                    </div>
                )}
            </div>

            {/* ==========================================
                BREADCRUMB
            ========================================== */}
            <div className="energy-map-breadcrumb">
                <span>India</span>

                {selectedZone && (
                    <>
                        <b>›</b>
                        <span>{selectedZone}</span>
                    </>
                )}

                {selectedState && (
                    <>
                        <b>›</b>
                        <span>{selectedState}</span>
                    </>
                )}

                {selectedCircle && (
                    <>
                        <b>›</b>
                        <span>{selectedCircle}</span>
                    </>
                )}

                {selectedCity && (
                    <>
                        <b>›</b>
                        <span>{selectedCity}</span>
                    </>
                )}

                {selectedBranch && (
                    <>
                        <b>›</b>
                        <span>{selectedBranch}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default EnergyMap;