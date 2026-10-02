// import React, { useEffect, useState } from "react";
// import "./Locations.css";

// const API_URL = "http://localhost:8000/api/v1/filters/locations/";

// const EMPTY_FORM = {
//     zone_id: "",
//     zone_name: "",
//     zone_code: "",

//     state_id: "",
//     state_name: "",
//     state_code: "",

//     circle_id: "",
//     circle_name: "",
//     circle_code: "",

//     city_id: "",
//     city_name: "",

//     branch_id: "",
//     branch_name: "",

//     floor_id: "",
//     floor_name: "",

//     room_id: "",
//     room_name: "",
// };

// const Locations = () => {
//     const [locations, setLocations] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [expanded, setExpanded] = useState({});

//     const [showModal, setShowModal] = useState(false);
//     const [locationType, setLocationType] = useState("zone");
//     const [saving, setSaving] = useState(false);
//     const [saveError, setSaveError] = useState("");
//     const [formData, setFormData] = useState(EMPTY_FORM);

//     const fetchLocations = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const response = await fetch(API_URL);

//             if (!response.ok) {
//                 throw new Error(`HTTP Error ${response.status}`);
//             }

//             const result = await response.json();

//             console.log("LOCATIONS API RESPONSE:", result);

//             if (result.success !== true) {
//                 throw new Error("Location API returned success=false");
//             }

//             setLocations(Array.isArray(result.data) ? result.data : []);
//         } catch (err) {
//             console.error("Location API Error:", err);
//             setError(err.message || "Unable to load locations");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchLocations();
//     }, []);

//     const toggleNode = (id) =>
//         setExpanded((previous) => ({ ...previous, [id]: !previous[id] }));

//     const getStateCount = (zone) => zone.states?.length || 0;
//     const getCircleCount = (state) => state.circles?.length || 0;
//     const getCityCount = (circle) => circle.cities?.length || 0;
//     const getBranchCount = (city) => city.branches?.length || 0;
//     const getFloorCount = (branch) => branch.floors?.length || 0;
//     const getRoomCount = (floor) => floor.rooms?.length || 0;
//     const getACCount = (room) => room.ac_devices?.length || 0;

//     const getTotalACs = () => {
//         let total = 0;

//         locations.forEach((zone) => {
//             zone.states?.forEach((state) => {
//                 state.circles?.forEach((circle) => {
//                     circle.cities?.forEach((city) => {
//                         city.branches?.forEach((branch) => {
//                             branch.floors?.forEach((floor) => {
//                                 floor.rooms?.forEach((room) => {
//                                     total += room.ac_devices?.length || 0;
//                                 });
//                             });
//                         });
//                     });
//                 });
//             });
//         });

//         return total;
//     };

//     const getTotalStates = () =>
//         locations.reduce(
//             (total, zone) => total + (zone.states?.length || 0),
//             0
//         );

//     const getTotalCircles = () => {
//         let total = 0;

//         locations.forEach((zone) => {
//             zone.states?.forEach((state) => {
//                 total += state.circles?.length || 0;
//             });
//         });

//         return total;
//     };

//     const resetForm = () => {
//         setFormData(EMPTY_FORM);
//         setLocationType("zone");
//         setSaveError("");
//     };

//     const openAddLocation = () => {
//         resetForm();
//         setShowModal(true);
//     };

//     const closeAddLocation = () => {
//         if (saving) return;
//         setShowModal(false);
//         resetForm();
//     };

//     const getStatesByZone = () => {
//         const zone = locations.find((z) => z.zone_id === formData.zone_id);
//         return zone?.states || [];
//     };

//     const getCirclesByState = () => {
//         for (const zone of locations) {
//             const state = zone.states?.find(
//                 (s) => s.state_id === formData.state_id
//             );
//             if (state) return state.circles || [];
//         }
//         return [];
//     };

//     const getCitiesByCircle = () => {
//         for (const zone of locations) {
//             for (const state of zone.states || []) {
//                 const circle = state.circles?.find(
//                     (c) => c.circle_id === formData.circle_id
//                 );
//                 if (circle) return circle.cities || [];
//             }
//         }
//         return [];
//     };

//     // const getBranchesByCity = () => {
//     //     for (const zone of locations) {
//     //         for (const state of zone.states || []) {
//     //             for (const circle of state.circles || []) {
//     //                 const city = circle.cities?.find(
//     //                     (c) => c.city_id === formData.city_id
//     //                 );
//     //                 if (city) return city.branches || [];
//     //             }
//     //         }
//     //     }
//     //     return [];
//     // };

//     // const getFloorsByBranch = () => {
//     //     for (const zone of locations) {
//     //         for (const state of zone.states || []) {
//     //             for (const circle of state.circles || []) {
//     //                 for (const city of circle.cities || []) {
//     //                     const branch = city.branches?.find(
//     //                         (b) => b.branch_id === formData.branch_id
//     //                     );
//     //                     if (branch) return branch.floors || [];
//     //                 }
//     //             }
//     //         }
//     //     }
//     //     return [];
//     // };

//     const allBranches = () =>
//         locations
//             .flatMap((z) => z.states || [])
//             .flatMap((s) => s.circles || [])
//             .flatMap((c) => c.cities || [])
//             .flatMap((c) => c.branches || []);

//     const allFloors = () =>
//         allBranches().flatMap((b) => b.floors || []);

//     if (loading) {
//         return (
//             <div className="locations-page">
//                 <div className="locations-loading">
//                     <div className="loading-spinner"></div>
//                     <p>Loading Sites...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="locations-page">
//                 <div className="locations-header">
//                     <div>
//                         <h1>Sites</h1>
//                         <p>Sites hierarchy</p>
//                     </div>

//                     <button className="refresh-btn" onClick={fetchLocations}>
//                         ↻ Refresh
//                     </button>
//                 </div>

//                 <div className="location-error">
//                     <h3>Failed to load locations</h3>
//                     <p>{error}</p>
//                     <button onClick={fetchLocations}>Try Again</button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="locations-page">
//             <div className="locations-header">
//                 <div>
//                     <h1>Sites</h1>
//                     <p>Manage and view your complete site hierarchy</p>
//                 </div>

//                 <div className="header-actions">
//                     <button className="refresh-btn" onClick={fetchLocations}>
//                         ↻ Refresh
//                     </button>

//                     <button
//                         className="add-location-btn"
//                         onClick={openAddLocation}
//                     >
//                         <span>+</span>
//                         Add Location
//                     </button>
//                 </div>
//             </div>

//             <div className="location-summary">
//                 <div className="summary-card">
//                     <div className="summary-icon zone-icon">Z</div>
//                     <div>
//                         <span>Zones</span>
//                         <strong>{locations.length}</strong>
//                     </div>
//                 </div>

//                 <div className="summary-card">
//                     <div className="summary-icon state-icon">S</div>
//                     <div>
//                         <span>States</span>
//                         <strong>{getTotalStates()}</strong>
//                     </div>
//                 </div>

//                 <div className="summary-card">
//                     <div className="summary-icon circle-icon">C</div>
//                     <div>
//                         <span>Circles</span>
//                         <strong>{getTotalCircles()}</strong>
//                     </div>
//                 </div>

//                 <div className="summary-card">
//                     <div className="summary-icon ac-icon">AC</div>
//                     <div>
//                         <span>AC Units</span>
//                         <strong>{getTotalACs()}</strong>
//                     </div>
//                 </div>
//             </div>

//             {locations.length === 0 ? (
//                 <div className="empty-location">
//                     <h3>No locations found</h3>
//                     <p>The API returned an empty location list.</p>
//                 </div>
//             ) : (
//                 <div className="location-tree">
//                     {locations.map((zone, zoneIndex) => {
//                         const zoneKey = `zone-${zone.zone_id || zoneIndex}`;
//                         const zoneExpanded = expanded[zoneKey];

//                         return (
//                             <div className="tree-zone" key={zoneKey}>
//                                 {/* ZONE */}

//                                 <div
//                                     className="tree-row zone-row"
//                                     onClick={() => toggleNode(zoneKey)}
//                                 >
//                                     <button className="expand-btn">
//                                         {zoneExpanded ? "−" : "+"}
//                                     </button>

//                                     <div className="location-symbol zone-symbol">
//                                         Z
//                                     </div>

//                                     <div className="location-info">
//                                         <strong>{zone.zone_name}</strong>
//                                         <span>{zone.zone_id}</span>
//                                     </div>

//                                     <div className="location-count">
//                                         {getStateCount(zone)} States
//                                     </div>
//                                 </div>

//                                 {/* STATES */}

//                                 {zoneExpanded && (
//                                     <div className="tree-children">
//                                         {zone.states?.map((state, stateIndex) => {
//                                             const stateKey = `state-${state.state_id || stateIndex}`;
//                                             const stateExpanded = expanded[stateKey];

//                                             return (
//                                                 <div key={stateKey}>
//                                                     {/* STATE */}

//                                                     <div
//                                                         className="tree-row state-row"
//                                                         onClick={() => toggleNode(stateKey)}
//                                                     >
//                                                         <button className="expand-btn">
//                                                             {stateExpanded ? "−" : "+"}
//                                                         </button>

//                                                         <div className="location-symbol state-symbol">
//                                                             S
//                                                         </div>

//                                                         <div className="location-info">
//                                                             <strong>{state.state_name}</strong>
//                                                             <span>{state.state_id}</span>
//                                                         </div>

//                                                         <div className="location-count">
//                                                             {getCircleCount(state)} Circles
//                                                         </div>
//                                                     </div>

//                                                     {/* CIRCLES */}

//                                                     {stateExpanded && (
//                                                         <div className="nested-level">
//                                                             {state.circles?.map((circle, circleIndex) => {
//                                                                 const circleKey = `circle-${circle.circle_id || circleIndex}`;
//                                                                 const circleExpanded = expanded[circleKey];

//                                                                 return (
//                                                                     <div key={circleKey}>
//                                                                         {/* CIRCLE */}

//                                                                         <div
//                                                                             className="tree-row circle-row"
//                                                                             onClick={() => toggleNode(circleKey)}
//                                                                         >
//                                                                             <button className="expand-btn">
//                                                                                 {circleExpanded ? "−" : "+"}
//                                                                             </button>

//                                                                             <div className="location-symbol circle-symbol">
//                                                                                 C
//                                                                             </div>

//                                                                             <div className="location-info">
//                                                                                 <strong>{circle.circle_name}</strong>
//                                                                                 <span>{circle.circle_id}</span>
//                                                                             </div>

//                                                                             <div className="location-count">
//                                                                                 {getCityCount(circle)} Cities
//                                                                             </div>
//                                                                         </div>

//                                                                         {/* CITIES */}

//                                                                         {circleExpanded && (
//                                                                             <div className="nested-level">
//                                                                                 {circle.cities?.map((city, cityIndex) => {
//                                                                                     const cityKey = `city-${city.city_id || cityIndex}`;
//                                                                                     const cityExpanded = expanded[cityKey];

//                                                                                     return (
//                                                                                         <div key={cityKey}>
//                                                                                             {/* CITY */}

//                                                                                             <div
//                                                                                                 className="tree-row city-row"
//                                                                                                 onClick={() => toggleNode(cityKey)}
//                                                                                             >
//                                                                                                 <button className="expand-btn">
//                                                                                                     {cityExpanded ? "−" : "+"}
//                                                                                                 </button>

//                                                                                                 <div className="location-symbol city-symbol">
//                                                                                                     C
//                                                                                                 </div>

//                                                                                                 <div className="location-info">
//                                                                                                     <strong>{city.city_name}</strong>
//                                                                                                     <span>{city.city_id}</span>
//                                                                                                 </div>

//                                                                                                 <div className="location-count">
//                                                                                                     {getBranchCount(city)} Branches
//                                                                                                 </div>
//                                                                                             </div>

//                                                                                             {/* BRANCHES */}

//                                                                                             {cityExpanded && (
//                                                                                                 <div className="nested-level">
//                                                                                                     {city.branches?.map((branch, branchIndex) => {
//                                                                                                         const branchKey = `branch-${branch.branch_id || branchIndex}`;
//                                                                                                         const branchExpanded = expanded[branchKey];

//                                                                                                         return (
//                                                                                                             <div key={branchKey}>
//                                                                                                                 {/* BRANCH */}

//                                                                                                                 <div
//                                                                                                                     className="tree-row branch-row"
//                                                                                                                     onClick={() => toggleNode(branchKey)}
//                                                                                                                 >
//                                                                                                                     <button className="expand-btn">
//                                                                                                                         {branchExpanded ? "−" : "+"}
//                                                                                                                     </button>

//                                                                                                                     <div className="location-symbol branch-symbol">
//                                                                                                                         B
//                                                                                                                     </div>

//                                                                                                                     <div className="location-info">
//                                                                                                                         <strong>{branch.branch_name}</strong>
//                                                                                                                         <span>{branch.branch_id}</span>
//                                                                                                                     </div>

//                                                                                                                     <div className="location-count">
//                                                                                                                         {getFloorCount(branch)} Floors
//                                                                                                                     </div>
//                                                                                                                 </div>

//                                                                                                                 {/* FLOORS */}

//                                                                                                                 {branchExpanded && (
//                                                                                                                     <div className="nested-level">
//                                                                                                                         {branch.floors?.map((floor, floorIndex) => {
//                                                                                                                             const floorKey = `floor-${floor.floor_id || floorIndex}`;
//                                                                                                                             const floorExpanded = expanded[floorKey];

//                                                                                                                             return (
//                                                                                                                                 <div key={floorKey}>
//                                                                                                                                     {/* FLOOR */}

//                                                                                                                                     <div
//                                                                                                                                         className="tree-row floor-row"
//                                                                                                                                         onClick={() => toggleNode(floorKey)}
//                                                                                                                                     >
//                                                                                                                                         <button className="expand-btn">
//                                                                                                                                             {floorExpanded ? "−" : "+"}
//                                                                                                                                         </button>

//                                                                                                                                         <div className="location-symbol floor-symbol">
//                                                                                                                                             F
//                                                                                                                                         </div>

//                                                                                                                                         <div className="location-info">
//                                                                                                                                             <strong>{floor.floor_name}</strong>
//                                                                                                                                             <span>{floor.floor_id}</span>
//                                                                                                                                         </div>

//                                                                                                                                         <div className="location-count">
//                                                                                                                                             {getRoomCount(floor)} Rooms
//                                                                                                                                         </div>
//                                                                                                                                     </div>

//                                                                                                                                     {/* ROOMS */}

//                                                                                                                                     {floorExpanded && (
//                                                                                                                                         <div className="nested-level">
//                                                                                                                                             {floor.rooms?.map((room, roomIndex) => {
//                                                                                                                                                 const roomKey = `room-${room.room_id || roomIndex}`;
//                                                                                                                                                 const roomExpanded = expanded[roomKey];

//                                                                                                                                                 return (
//                                                                                                                                                     <div key={roomKey}>
//                                                                                                                                                         {/* ROOM */}

//                                                                                                                                                         <div
//                                                                                                                                                             className="tree-row room-row"
//                                                                                                                                                             onClick={() => toggleNode(roomKey)}
//                                                                                                                                                         >
//                                                                                                                                                             <button className="expand-btn">
//                                                                                                                                                                 {roomExpanded ? "−" : "+"}
//                                                                                                                                                             </button>

//                                                                                                                                                             <div className="location-symbol room-symbol">
//                                                                                                                                                                 R
//                                                                                                                                                             </div>

//                                                                                                                                                             <div className="location-info">
//                                                                                                                                                                 <strong>{room.room_name}</strong>
//                                                                                                                                                                 <span>{room.room_id}</span>
//                                                                                                                                                             </div>

//                                                                                                                                                             <div className="location-count">
//                                                                                                                                                                 {getACCount(room)} ACs
//                                                                                                                                                             </div>
//                                                                                                                                                         </div>

//                                                                                                                                                         {/* AC DEVICES */}

//                                                                                                                                                         {roomExpanded && (
//                                                                                                                                                             <div className="ac-list">
//                                                                                                                                                                 {room.ac_devices?.map((ac, acIndex) => (
//                                                                                                                                                                     <div
//                                                                                                                                                                         className="ac-item"
//                                                                                                                                                                         key={ac.ac_id || acIndex}
//                                                                                                                                                                     >
//                                                                                                                                                                         <div className="ac-dot"></div>

//                                                                                                                                                                         <div className="ac-info">
//                                                                                                                                                                             <strong>{ac.ac_id}</strong>
//                                                                                                                                                                             <span>{ac.device_name}</span>
//                                                                                                                                                                         </div>

//                                                                                                                                                                         <span
//                                                                                                                                                                             className={
//                                                                                                                                                                                 ac.status === "ON"
//                                                                                                                                                                                     ? "ac-status on"
//                                                                                                                                                                                     : "ac-status off"
//                                                                                                                                                                             }
//                                                                                                                                                                         >
//                                                                                                                                                                             {ac.status}
//                                                                                                                                                                         </span>
//                                                                                                                                                                     </div>
//                                                                                                                                                                 ))}
//                                                                                                                                                             </div>
//                                                                                                                                                         )}
//                                                                                                                                                     </div>
//                                                                                                                                                 );
//                                                                                                                                             })}
//                                                                                                                                         </div>
//                                                                                                                                     )}
//                                                                                                                                 </div>
//                                                                                                                             );
//                                                                                                                         })}
//                                                                                                                     </div>
//                                                                                                                 )}
//                                                                                                             </div>
//                                                                                                         );
//                                                                                                     })}
//                                                                                                 </div>
//                                                                                             )}
//                                                                                         </div>
//                                                                                     );
//                                                                                 })}
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 );
//                                                             })}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//             {showModal && (
//                 <div className="modal-overlay" onClick={closeAddLocation}>
//                     <div
//                         className="location-modal"
//                         onClick={(event) => event.stopPropagation()}
//                     >
//                         {/* MODAL HEADER */}

//                         <div className="modal-header">
//                             <div>
//                                 <h2>
//                                     Add{" "}
//                                     {locationType.charAt(0).toUpperCase() +
//                                         locationType.slice(1)}
//                                 </h2>

//                                 <p>Add a new location to the hierarchy</p>
//                             </div>

//                             <button
//                                 className="close-btn"
//                                 onClick={closeAddLocation}
//                                 disabled={saving}
//                             >
//                                 ×
//                             </button>
//                         </div>

//                         {/* FORM */}

//                         <form
//                             onSubmit={(event) => {
//                                 event.preventDefault();
//                                 console.log("Location to create:", formData);
//                                 // POST API will be connected here.
//                             }}
//                         >
//                             <div className="form-group">
//                                 <label>Location Type</label>

//                                 <select
//                                     value={locationType}
//                                     onChange={(event) => {
//                                         setLocationType(event.target.value);
//                                         setSaveError("");
//                                     }}
//                                 >
//                                     <option value="zone">Zone</option>
//                                     <option value="state">State</option>
//                                     <option value="circle">Circle</option>
//                                     <option value="city">City</option>
//                                     <option value="branch">Branch</option>
//                                     <option value="floor">Floor</option>
//                                     <option value="room">Room</option>
//                                 </select>
//                             </div>

//                             {locationType === "zone" && (
//                                 <>
//                                     <div className="form-group">
//                                         <label>Zone Code</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: ZN-W"
//                                             value={formData.zone_code}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     zone_code: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Zone Name</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: Western"
//                                             value={formData.zone_name}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     zone_name: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {locationType === "state" && (
//                                 <>
//                                     <div className="form-group">
//                                         <label>Zone</label>
//                                         <select
//                                             value={formData.zone_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     zone_id: e.target.value,
//                                                     state_id: "",
//                                                     circle_id: "",
//                                                     city_id: "",
//                                                     branch_id: "",
//                                                     floor_id: "",
//                                                 })
//                                             }
//                                             required
//                                         >
//                                             <option value="">Select Zone</option>
//                                             {locations.map((zone) => (
//                                                 <option
//                                                     key={zone.zone_id}
//                                                     value={zone.zone_id}
//                                                 >
//                                                     {zone.zone_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>State Code</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: MH"
//                                             value={formData.state_code}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     state_code: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>State Name</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: Maharashtra"
//                                             value={formData.state_name}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     state_name: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {/* CIRCLE FORM */}

//                             {locationType === "circle" && (
//                                 <>
//                                     <div className="form-group">
//                                         <label>Zone</label>
//                                         <select
//                                             value={formData.zone_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     zone_id: e.target.value,
//                                                     state_id: "",
//                                                     circle_id: "",
//                                                 })
//                                             }
//                                             required
//                                         >
//                                             <option value="">Select Zone</option>
//                                             {locations.map((zone) => (
//                                                 <option
//                                                     key={zone.zone_id}
//                                                     value={zone.zone_id}
//                                                 >
//                                                     {zone.zone_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>State</label>
//                                         <select
//                                             value={formData.state_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     state_id: e.target.value,
//                                                     circle_id: "",
//                                                 })
//                                             }
//                                             disabled={!formData.zone_id}
//                                             required
//                                         >
//                                             <option value="">Select State</option>
//                                             {getStatesByZone().map((state) => (
//                                                 <option
//                                                     key={state.state_id}
//                                                     value={state.state_id}
//                                                 >
//                                                     {state.state_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Circle Code</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: MH-C01"
//                                             value={formData.circle_code}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     circle_code: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Circle Name</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: Pune Circle"
//                                             value={formData.circle_name}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     circle_name: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {/* CITY FORM */}

//                             {locationType === "city" && (
//                                 <>
//                                     <div className="form-group">
//                                         <label>Zone</label>
//                                         <select
//                                             value={formData.zone_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     zone_id: e.target.value,
//                                                     state_id: "",
//                                                     circle_id: "",
//                                                 })
//                                             }
//                                             required
//                                         >
//                                             <option value="">Select Zone</option>
//                                             {locations.map((zone) => (
//                                                 <option
//                                                     key={zone.zone_id}
//                                                     value={zone.zone_id}
//                                                 >
//                                                     {zone.zone_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>State</label>
//                                         <select
//                                             value={formData.state_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     state_id: e.target.value,
//                                                     circle_id: "",
//                                                 })
//                                             }
//                                             disabled={!formData.zone_id}
//                                             required
//                                         >
//                                             <option value="">Select State</option>
//                                             {getStatesByZone().map((state) => (
//                                                 <option
//                                                     key={state.state_id}
//                                                     value={state.state_id}
//                                                 >
//                                                     {state.state_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Circle</label>
//                                         <select
//                                             value={formData.circle_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     circle_id: e.target.value,
//                                                 })
//                                             }
//                                             disabled={!formData.state_id}
//                                             required
//                                         >
//                                             <option value="">Select Circle</option>
//                                             {getCirclesByState().map((circle) => (
//                                                 <option
//                                                     key={circle.circle_id}
//                                                     value={circle.circle_id}
//                                                 >
//                                                     {circle.circle_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>City Name</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: Pune"
//                                             value={formData.city_name}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     city_name: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {/* BRANCH FORM */}

//                             {locationType === "branch" && (
//                                 <>
//                                     <div className="form-group">
//                                         <label>Zone</label>
//                                         <select
//                                             value={formData.zone_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     zone_id: e.target.value,
//                                                     state_id: "",
//                                                     circle_id: "",
//                                                     city_id: "",
//                                                 })
//                                             }
//                                             required
//                                         >
//                                             <option value="">Select Zone</option>
//                                             {locations.map((zone) => (
//                                                 <option
//                                                     key={zone.zone_id}
//                                                     value={zone.zone_id}
//                                                 >
//                                                     {zone.zone_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>State</label>
//                                         <select
//                                             value={formData.state_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     state_id: e.target.value,
//                                                     circle_id: "",
//                                                     city_id: "",
//                                                 })
//                                             }
//                                             disabled={!formData.zone_id}
//                                             required
//                                         >
//                                             <option value="">Select State</option>
//                                             {getStatesByZone().map((state) => (
//                                                 <option
//                                                     key={state.state_id}
//                                                     value={state.state_id}
//                                                 >
//                                                     {state.state_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Circle</label>
//                                         <select
//                                             value={formData.circle_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     circle_id: e.target.value,
//                                                     city_id: "",
//                                                 })
//                                             }
//                                             disabled={!formData.state_id}
//                                             required
//                                         >
//                                             <option value="">Select Circle</option>
//                                             {getCirclesByState().map((circle) => (
//                                                 <option
//                                                     key={circle.circle_id}
//                                                     value={circle.circle_id}
//                                                 >
//                                                     {circle.circle_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>City</label>
//                                         <select
//                                             value={formData.city_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     city_id: e.target.value,
//                                                 })
//                                             }
//                                             disabled={!formData.circle_id}
//                                             required
//                                         >
//                                             <option value="">Select City</option>
//                                             {getCitiesByCircle().map((city) => (
//                                                 <option
//                                                     key={city.city_id}
//                                                     value={city.city_id}
//                                                 >
//                                                     {city.city_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Branch Code</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: MH-PUN-B05"
//                                             value={formData.branch_id}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     branch_id: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Branch Name</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: Pune Branch 05"
//                                             value={formData.branch_name}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     branch_name: e.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {/* FLOOR FORM */}

//                             {locationType === "floor" && (
//                                 <>
//                                     <div className="form-group">
//                                         <label>Branch</label>
//                                         <select
//                                             value={formData.branch_id}
//                                             onChange={(event) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     branch_id: event.target.value,
//                                                 })
//                                             }
//                                             required
//                                         >
//                                             <option value="">Select Branch</option>
//                                             {allBranches().map((branch) => (
//                                                 <option
//                                                     key={branch.branch_id}
//                                                     value={branch.branch_id}
//                                                 >
//                                                     {branch.branch_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Floor Name</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: Floor-05"
//                                             value={formData.floor_name}
//                                             onChange={(event) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     floor_name: event.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {/* ROOM FORM */}

//                             {locationType === "room" && (
//                                 <>
//                                     <div className="form-group">
//                                         <label>Floor</label>
//                                         <select
//                                             value={formData.floor_id}
//                                             onChange={(event) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     floor_id: event.target.value,
//                                                 })
//                                             }
//                                             required
//                                         >
//                                             <option value="">Select Floor</option>
//                                             {allFloors().map((floor) => (
//                                                 <option
//                                                     key={floor.floor_id}
//                                                     value={floor.floor_id}
//                                                 >
//                                                     {floor.floor_name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Room Name</label>
//                                         <input
//                                             type="text"
//                                             placeholder="Example: Room-05"
//                                             value={formData.room_name}
//                                             onChange={(event) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     room_name: event.target.value,
//                                                 })
//                                             }
//                                             required
//                                         />
//                                     </div>
//                                 </>
//                             )}

//                             {/* ERROR */}

//                             {saveError && (
//                                 <div className="location-error">{saveError}</div>
//                             )}

//                             {/* ACTIONS */}

//                             <div className="modal-actions">
//                                 <button
//                                     type="button"
//                                     className="cancel-btn"
//                                     onClick={closeAddLocation}
//                                     disabled={saving}
//                                 >
//                                     Cancel
//                                 </button>

//                                 <button
//                                     type="submit"
//                                     className="save-btn"
//                                     disabled={saving}
//                                 >
//                                     {saving ? "Saving..." : "Add Location"}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Locations;



import React, { useContext, useEffect, useMemo, useState } from "react";
import "./Locations.css";
import { useAuth } from "../Layout/AuthContext";
import SiteOwnerModal, { SiteActionsContext, authHeaders } from "./SiteOwnerModal";

const API_URL = "http://localhost:8000/api/v1/filters/locations/";

const EMPTY_FORM = {
    zone_id: "",
    zone_name: "",
    zone_code: "",

    state_id: "",
    state_name: "",
    state_code: "",

    district_id: "",
    district_name: "",
    district_code: "",

    taluka_id: "",
    taluka_name: "",
    taluka_code: "",

    circle_id: "",
    circle_name: "",
    circle_code: "",

    region_id: "",
    region_name: "",
    region_code: "",

    division_id: "",
    division_name: "",
    division_code: "",

    city_id: "",
    city_name: "",
    city_code: "",

    branch_id: "",
    branch_name: "",
    branch_code: "",

    floor_id: "",
    floor_name: "",

    room_id: "",
    room_name: "",
};

const Locations = () => {
    const { user } = useAuth();
    const canAssign = user?.role === "ORG_SUPER_ADMIN" || user?.role === "CUSTOMER";
    const [assignTarget, setAssignTarget] = useState(null);

    const [locations, setLocations] = useState({
        GEOGRAPHICAL: [],
        ZONAL: [],
    });

    const [hierarchyType, setHierarchyType] = useState("GEOGRAPHICAL");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState({});

    const [showModal, setShowModal] = useState(false);
    const [locationType, setLocationType] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [formData, setFormData] = useState(EMPTY_FORM);

    const currentLocations =
        locations[hierarchyType] || [];

    const fetchLocations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL, {
                method: "GET",
                headers: authHeaders(),
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}`);
            }

            const result = await response.json();

            console.log("LOCATIONS API RESPONSE:", result);

            if (result.success !== true) {
                throw new Error(
                    "Location API returned success=false"
                );
            }

            /*
            * Actual API response:
            *
            * {
            *   success: true,
            *
            *   geographical: {
            *      hierarchy_type: "GEOGRAPHICAL",
            *      data: [...]
            *   },
            *
            *   zonal: {
            *      hierarchy_type: "ZONAL",
            *      data: [...]
            *   }
            * }
            */

            setLocations({
                GEOGRAPHICAL:
                    Array.isArray(result.geographical?.data)
                        ? result.geographical.data
                        : [],

                ZONAL:
                    Array.isArray(result.zonal?.data)
                        ? result.zonal.data
                        : [],
            });

        } catch (err) {
            console.error(
                "Location API Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load locations"
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const changeHierarchy = (type) => {
        setHierarchyType(type);
        setExpanded({});
        setShowModal(false);
        setSaveError("");
    };

    const toggleNode = (id) => {
        setExpanded((previous) => ({
            ...previous,
            [id]: !previous[id],
        }));
    };

    const getStateCount = (item) =>
        item.states?.length || 0;

    const getDistrictCount = (state) =>
        state.districts?.length || 0;

    const getTalukaCount = (district) =>
        district.talukas?.length || 0;

    const getCityCount = (item) =>
        item.cities?.length || 0;

    const getBranchCount = (item) =>
        item.branches?.length || 0;

    const getCircleCount = (zone) =>
        zone.circles?.length || 0;

    const getRegionCount = (circle) =>
        circle.regions?.length || 0;

    const getDivisionCount = (region) =>
        region.divisions?.length || 0;

    const getFloorCount = (branch) =>
        branch.floors?.length || 0;

    const getDirectACCount = (branch) =>
        branch.ac_devices?.length || 0;

    const getRoomCount = (floor) =>
        floor.rooms?.length || 0;

    const getACCount = (room) =>
        room.ac_devices?.length || 0;

    const getTotalACs = () => {
        let total = 0;

        if (hierarchyType === "GEOGRAPHICAL") {
            currentLocations.forEach((state) => {
                state.districts?.forEach((district) => {
                    district.talukas?.forEach((taluka) => {
                        taluka.cities?.forEach((city) => {
                            city.branches?.forEach((branch) => {
                                total +=
                                    branch.ac_devices?.length || 0;

                                branch.floors?.forEach((floor) => {
                                    floor.rooms?.forEach((room) => {
                                        total +=
                                            room.ac_devices?.length || 0;
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            currentLocations.forEach((zone) => {
                zone.circles?.forEach((circle) => {
                    circle.regions?.forEach((region) => {
                        region.divisions?.forEach((division) => {
                            division.branches?.forEach((branch) => {
                                total +=
                                    branch.ac_devices?.length || 0;

                                branch.floors?.forEach((floor) => {
                                    floor.rooms?.forEach((room) => {
                                        total +=
                                            room.ac_devices?.length || 0;
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }

        return total;
    };

    const getTotalStates = () => {
        if (hierarchyType === "GEOGRAPHICAL") {
            return currentLocations.length;
        }

        return currentLocations.reduce(
            (total, zone) =>
                total + (zone.states?.length || 0),
            0
        );
    };

    const getTotalDistricts = () => {
        if (hierarchyType !== "GEOGRAPHICAL") {
            return 0;
        }

        return currentLocations.reduce(
            (total, state) =>
                total +
                (state.districts?.length || 0),
            0
        );
    };

    const getTotalZones = () => {
        if (hierarchyType === "ZONAL") {
            return currentLocations.length;
        }

        return 0;
    };

    const getTotalCircles = () => {
        if (hierarchyType !== "ZONAL") {
            return 0;
        }

        return currentLocations.reduce(
            (total, zone) =>
                total +
                (zone.circles?.length || 0),
            0
        );
    };

    const getTotalBranches = () => {
        let total = 0;

        if (hierarchyType === "GEOGRAPHICAL") {
            currentLocations.forEach((state) => {
                state.districts?.forEach((district) => {
                    district.talukas?.forEach((taluka) => {
                        taluka.cities?.forEach((city) => {
                            total +=
                                city.branches?.length || 0;
                        });
                    });
                });
            });
        } else {
            currentLocations.forEach((zone) => {
                zone.circles?.forEach((circle) => {
                    circle.regions?.forEach((region) => {
                        region.divisions?.forEach((division) => {
                            total +=
                                division.branches?.length || 0;
                        });
                    });
                });
            });
        }

        return total;
    };

    /* =========================================================
       FORM HELPERS
    ========================================================= */

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setLocationType("");
        setSaveError("");
    };

    const openAddLocation = () => {
        resetForm();

        /*
         * Default location according to hierarchy.
         */
        if (hierarchyType === "GEOGRAPHICAL") {
            setLocationType("state");
        } else {
            setLocationType("zone");
        }

        setShowModal(true);
    };

    const closeAddLocation = () => {
        if (saving) return;

        setShowModal(false);
        resetForm();
    };

    const handleFieldChange = (
        field,
        value
    ) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    /* =========================================================
       GEOGRAPHICAL LOOKUPS
    ========================================================= */

    const getDistrictsByState = () => {
        const state = currentLocations.find(
            (item) =>
                item.state_id ===
                formData.state_id
        );

        return state?.districts || [];
    };

    const getTalukasByDistrict = () => {
        for (const state of currentLocations) {
            const district =
                state.districts?.find(
                    (item) =>
                        item.district_id ===
                        formData.district_id
                );

            if (district) {
                return district.talukas || [];
            }
        }

        return [];
    };

    const getCitiesByTaluka = () => {
        for (const state of currentLocations) {
            for (const district of state.districts || []) {
                const taluka =
                    district.talukas?.find(
                        (item) =>
                            item.taluka_id ===
                            formData.taluka_id
                    );

                if (taluka) {
                    return taluka.cities || [];
                }
            }
        }

        return [];
    };

    /* =========================================================
       ZONAL LOOKUPS
    ========================================================= */

    const getStatesByZone = () => {
        const zone = currentLocations.find(
            (item) =>
                item.zone_id ===
                formData.zone_id
        );

        return zone?.states || [];
    };

    const getCirclesByZone = () => {
        const zone = currentLocations.find(
            (item) =>
                item.zone_id ===
                formData.zone_id
        );

        return zone?.circles || [];
    };

    const getRegionsByCircle = () => {
        for (const zone of currentLocations) {
            const circle =
                zone.circles?.find(
                    (item) =>
                        item.circle_id ===
                        formData.circle_id
                );

            if (circle) {
                return circle.regions || [];
            }
        }

        return [];
    };

    const getDivisionsByRegion = () => {
        for (const zone of currentLocations) {
            for (const circle of zone.circles || []) {
                const region =
                    circle.regions?.find(
                        (item) =>
                            item.region_id ===
                            formData.region_id
                    );

                if (region) {
                    return region.divisions || [];
                }
            }
        }

        return [];
    };

    /* =========================================================
       ALL BRANCHES
    ========================================================= */

    const allBranches = () => {
        if (hierarchyType === "GEOGRAPHICAL") {
            return currentLocations
                .flatMap(
                    (state) =>
                        state.districts || []
                )
                .flatMap(
                    (district) =>
                        district.talukas || []
                )
                .flatMap(
                    (taluka) =>
                        taluka.cities || []
                )
                .flatMap(
                    (city) =>
                        city.branches || []
                );
        }

        return currentLocations
            .flatMap(
                (zone) =>
                    zone.circles || []
            )
            .flatMap(
                (circle) =>
                    circle.regions || []
            )
            .flatMap(
                (region) =>
                    region.divisions || []
            )
            .flatMap(
                (division) =>
                    division.branches || []
            );
    };

    const allFloors = () =>
        allBranches().flatMap(
            (branch) =>
                branch.floors || []
        );

    /* =========================================================
       LOCATION TYPE OPTIONS
    ========================================================= */

    const locationTypeOptions =
        hierarchyType === "GEOGRAPHICAL"
            ? [
                  {
                      value: "state",
                      label: "State",
                  },
                  {
                      value: "district",
                      label: "District",
                  },
                  {
                      value: "taluka",
                      label: "Taluka",
                  },
                  {
                      value: "city",
                      label: "City",
                  },
                  {
                      value: "branch",
                      label: "Branch",
                  },
                  {
                      value: "floor",
                      label: "Floor",
                  },
                  {
                      value: "room",
                      label: "Room",
                  },
              ]
            : [
                  {
                      value: "zone",
                      label: "Zone",
                  },
                  {
                      value: "circle",
                      label: "Circle",
                  },
                  {
                      value: "region",
                      label: "Region",
                  },
                  {
                      value: "division",
                      label: "Division",
                  },
                  {
                      value: "branch",
                      label: "Branch",
                  },
                  {
                      value: "floor",
                      label: "Floor",
                  },
                  {
                      value: "room",
                      label: "Room",
                  },
              ];

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="locations-page">
                <div className="locations-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading Sites...</p>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <div className="locations-page">
                <div className="locations-header">
                    <div>
                        <h1>Sites</h1>
                        <p>Sites hierarchy</p>
                    </div>

                    <button
                        className="refresh-btn"
                        onClick={fetchLocations}
                    >
                        ↻ Refresh
                    </button>
                </div>

                <div className="location-error">
                    <h3>
                        Failed to load locations
                    </h3>

                    <p>{error}</p>

                    <button
                        onClick={fetchLocations}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <SiteActionsContext.Provider
            value={{
                canAssign,
                openAssign: (branch) => setAssignTarget({ branch, hierarchyType }),
            }}
        >
        <div className="locations-page">

            {assignTarget && (
                <SiteOwnerModal
                    branch={assignTarget.branch}
                    hierarchyType={assignTarget.hierarchyType}
                    role={user?.role}
                    onClose={() => setAssignTarget(null)}
                    onSaved={fetchLocations}
                />
            )}

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="locations-header">
                <div>
                    <h1>Sites</h1>

                    <p>
                        Manage and view your
                        complete site hierarchy
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        className="refresh-btn"
                        onClick={fetchLocations}
                    >
                        ↻ Refresh
                    </button>

                    {canAssign && (
                    <button
                        className="add-location-btn"
                        onClick={
                            openAddLocation
                        }
                    >
                        <span>+</span>
                        Add Location
                    </button>
                    )}
                </div>
            </div>

            {/* =================================================
                HIERARCHY SWITCH
            ================================================= */}

            <div
                className="hierarchy-switch"
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        changeHierarchy(
                            "GEOGRAPHICAL"
                        )
                    }
                    className={
                        hierarchyType ===
                        "GEOGRAPHICAL"
                            ? "hierarchy-tab active"
                            : "hierarchy-tab"
                    }
                >
                    Geographical
                </button>

                <button
                    type="button"
                    onClick={() =>
                        changeHierarchy(
                            "ZONAL"
                        )
                    }
                    className={
                        hierarchyType ===
                        "ZONAL"
                            ? "hierarchy-tab active"
                            : "hierarchy-tab"
                    }
                >
                    Zonal
                </button>
            </div>

            {/* =================================================
                CURRENT HIERARCHY INFORMATION
            ================================================= */}

            <div
                className="hierarchy-description"
                style={{
                    marginBottom: "20px",
                }}
            >
                <strong>
                    {hierarchyType ===
                    "GEOGRAPHICAL"
                        ? "Geographical Hierarchy"
                        : "Zonal Hierarchy"}
                </strong>

                <span>
                    {hierarchyType ===
                    "GEOGRAPHICAL"
                        ? "India → State → District → Taluka → City → Branch"
                        : "India → Zone → Circle → Region → Division → Branch"}
                </span>
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="location-summary">

                <div className="summary-card">
                    <div className="summary-icon zone-icon">
                        {hierarchyType ===
                        "GEOGRAPHICAL"
                            ? "S"
                            : "Z"}
                    </div>

                    <div>
                        <span>
                            {hierarchyType ===
                            "GEOGRAPHICAL"
                                ? "States"
                                : "Zones"}
                        </span>

                        <strong>
                            {hierarchyType ===
                            "GEOGRAPHICAL"
                                ? getTotalStates()
                                : getTotalZones()}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon state-icon">
                        {hierarchyType ===
                        "GEOGRAPHICAL"
                            ? "D"
                            : "C"}
                    </div>

                    <div>
                        <span>
                            {hierarchyType ===
                            "GEOGRAPHICAL"
                                ? "Districts"
                                : "Circles"}
                        </span>

                        <strong>
                            {hierarchyType ===
                            "GEOGRAPHICAL"
                                ? getTotalDistricts()
                                : getTotalCircles()}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon circle-icon">
                        B
                    </div>

                    <div>
                        <span>
                            Branches
                        </span>

                        <strong>
                            {getTotalBranches()}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon ac-icon">
                        AC
                    </div>

                    <div>
                        <span>
                            AC Units
                        </span>

                        <strong>
                            {getTotalACs()}
                        </strong>
                    </div>
                </div>

            </div>

            {/* =================================================
                EMPTY
            ================================================= */}

            {currentLocations.length === 0 ? (
                <div className="empty-location">
                    <h3>
                        No{" "}
                        {hierarchyType ===
                        "GEOGRAPHICAL"
                            ? "geographical"
                            : "zonal"}{" "}
                        locations found
                    </h3>

                    <p>
                        No locations are
                        currently available
                        for this hierarchy.
                    </p>
                </div>
            ) : (
                <>
                    {/* =================================================
                        GEOGRAPHICAL TREE
                    ================================================= */}

                    {hierarchyType ===
                        "GEOGRAPHICAL" && (
                        <div className="location-tree">

                            {currentLocations.map(
                                (
                                    state,
                                    stateIndex
                                ) => {
                                    const stateKey =
                                        `geo-state-${
                                            state.state_id ||
                                            stateIndex
                                        }`;

                                    const stateExpanded =
                                        expanded[
                                            stateKey
                                        ];

                                    return (
                                        <div
                                            className="tree-zone"
                                            key={
                                                stateKey
                                            }
                                        >

                                            {/* STATE */}

                                            <div
                                                className="tree-row zone-row"
                                                onClick={() =>
                                                    toggleNode(
                                                        stateKey
                                                    )
                                                }
                                            >
                                                <button className="expand-btn">
                                                    {stateExpanded
                                                        ? "−"
                                                        : "+"}
                                                </button>

                                                <div className="location-symbol zone-symbol">
                                                    S
                                                </div>

                                                <div className="location-info">
                                                    <strong>
                                                        {
                                                            state.state_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            state.state_id
                                                        }
                                                    </span>
                                                </div>

                                                <div className="location-count">
                                                    {
                                                        getDistrictCount(
                                                            state
                                                        )
                                                    }{" "}
                                                    Districts
                                                </div>
                                            </div>

                                            {/* DISTRICTS */}

                                            {stateExpanded && (
                                                <div className="tree-children">

                                                    {state.districts?.map(
                                                        (
                                                            district,
                                                            districtIndex
                                                        ) => {
                                                            const districtKey =
                                                                `geo-district-${
                                                                    district.district_id ||
                                                                    districtIndex
                                                                }`;

                                                            const districtExpanded =
                                                                expanded[
                                                                    districtKey
                                                                ];

                                                            return (
                                                                <div
                                                                    key={
                                                                        districtKey
                                                                    }
                                                                >

                                                                    <div
                                                                        className="tree-row state-row"
                                                                        onClick={() =>
                                                                            toggleNode(
                                                                                districtKey
                                                                            )
                                                                        }
                                                                    >
                                                                        <button className="expand-btn">
                                                                            {districtExpanded
                                                                                ? "−"
                                                                                : "+"}
                                                                        </button>

                                                                        <div className="location-symbol state-symbol">
                                                                            D
                                                                        </div>

                                                                        <div className="location-info">
                                                                            <strong>
                                                                                {
                                                                                    district.district_name
                                                                                }
                                                                            </strong>

                                                                            <span>
                                                                                {
                                                                                    district.district_id
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div className="location-count">
                                                                            {
                                                                                getTalukaCount(
                                                                                    district
                                                                                )
                                                                            }{" "}
                                                                            Talukas
                                                                        </div>
                                                                    </div>

                                                                    {/* TALUKAS */}

                                                                    {districtExpanded && (
                                                                        <div className="nested-level">

                                                                            {district.talukas?.map(
                                                                                (
                                                                                    taluka,
                                                                                    talukaIndex
                                                                                ) => {
                                                                                    const talukaKey =
                                                                                        `geo-taluka-${
                                                                                            taluka.taluka_id ||
                                                                                            talukaIndex
                                                                                        }`;

                                                                                    const talukaExpanded =
                                                                                        expanded[
                                                                                            talukaKey
                                                                                        ];

                                                                                    return (
                                                                                        <div
                                                                                            key={
                                                                                                talukaKey
                                                                                            }
                                                                                        >

                                                                                            <div
                                                                                                className="tree-row circle-row"
                                                                                                onClick={() =>
                                                                                                    toggleNode(
                                                                                                        talukaKey
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <button className="expand-btn">
                                                                                                    {talukaExpanded
                                                                                                        ? "−"
                                                                                                        : "+"}
                                                                                                </button>

                                                                                                <div className="location-symbol circle-symbol">
                                                                                                    T
                                                                                                </div>

                                                                                                <div className="location-info">
                                                                                                    <strong>
                                                                                                        {
                                                                                                            taluka.taluka_name
                                                                                                        }
                                                                                                    </strong>

                                                                                                    <span>
                                                                                                        {
                                                                                                            taluka.taluka_id
                                                                                                        }
                                                                                                    </span>
                                                                                                </div>

                                                                                                <div className="location-count">
                                                                                                    {
                                                                                                        getCityCount(
                                                                                                            taluka
                                                                                                        )
                                                                                                    }{" "}
                                                                                                    Cities
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* CITIES */}

                                                                                            {talukaExpanded && (
                                                                                                <div className="nested-level">

                                                                                                    {taluka.cities?.map(
                                                                                                        (
                                                                                                            city,
                                                                                                            cityIndex
                                                                                                        ) => {
                                                                                                            const cityKey =
                                                                                                                `geo-city-${
                                                                                                                    city.city_id ||
                                                                                                                    cityIndex
                                                                                                                }`;

                                                                                                            const cityExpanded =
                                                                                                                expanded[
                                                                                                                    cityKey
                                                                                                                ];

                                                                                                            return (
                                                                                                                <div
                                                                                                                    key={
                                                                                                                        cityKey
                                                                                                                    }
                                                                                                                >

                                                                                                                    <div
                                                                                                                        className="tree-row city-row"
                                                                                                                        onClick={() =>
                                                                                                                            toggleNode(
                                                                                                                                cityKey
                                                                                                                            )
                                                                                                                        }
                                                                                                                    >
                                                                                                                        <button className="expand-btn">
                                                                                                                            {cityExpanded
                                                                                                                                ? "−"
                                                                                                                                : "+"}
                                                                                                                        </button>

                                                                                                                        <div className="location-symbol city-symbol">
                                                                                                                            C
                                                                                                                        </div>

                                                                                                                        <div className="location-info">
                                                                                                                            <strong>
                                                                                                                                {
                                                                                                                                    city.city_name
                                                                                                                                }
                                                                                                                            </strong>

                                                                                                                            <span>
                                                                                                                                {
                                                                                                                                    city.city_id
                                                                                                                                }
                                                                                                                            </span>
                                                                                                                        </div>

                                                                                                                        <div className="location-count">
                                                                                                                            {
                                                                                                                                getBranchCount(
                                                                                                                                    city
                                                                                                                                )
                                                                                                                            }{" "}
                                                                                                                            Branches
                                                                                                                        </div>
                                                                                                                    </div>

                                                                                                                    {/* BRANCHES */}

                                                                                                                    {cityExpanded && (
                                                                                                                        <div className="nested-level">

                                                                                                                            {city.branches?.map(
                                                                                                                                (
                                                                                                                                    branch,
                                                                                                                                    branchIndex
                                                                                                                                ) => (
                                                                                                                                    <BranchTree
                                                                                                                                        key={
                                                                                                                                            branch.branch_id ||
                                                                                                                                            branchIndex
                                                                                                                                        }
                                                                                                                                        branch={
                                                                                                                                            branch
                                                                                                                                        }
                                                                                                                                        expanded={
                                                                                                                                            expanded
                                                                                                                                        }
                                                                                                                                        toggleNode={
                                                                                                                                            toggleNode
                                                                                                                                        }
                                                                                                                                    />
                                                                                                                                )
                                                                                                                            )}

                                                                                                                        </div>
                                                                                                                    )}

                                                                                                                </div>
                                                                                                            );
                                                                                                        }
                                                                                                    )}

                                                                                                </div>
                                                                                            )}

                                                                                        </div>
                                                                                    );
                                                                                }
                                                                            )}

                                                                        </div>
                                                                    )}

                                                                </div>
                                                            );
                                                        }
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                    {/* =================================================
                        ZONAL TREE
                    ================================================= */}

                    {hierarchyType ===
                        "ZONAL" && (
                        <div className="location-tree">

                            {currentLocations.map(
                                (
                                    zone,
                                    zoneIndex
                                ) => {
                                    const zoneKey =
                                        `zonal-zone-${
                                            zone.zone_id ||
                                            zoneIndex
                                        }`;

                                    const zoneExpanded =
                                        expanded[
                                            zoneKey
                                        ];

                                    return (
                                        <div
                                            className="tree-zone"
                                            key={
                                                zoneKey
                                            }
                                        >

                                            {/* ZONE */}

                                            <div
                                                className="tree-row zone-row"
                                                onClick={() =>
                                                    toggleNode(
                                                        zoneKey
                                                    )
                                                }
                                            >
                                                <button className="expand-btn">
                                                    {zoneExpanded
                                                        ? "−"
                                                        : "+"}
                                                </button>

                                                <div className="location-symbol zone-symbol">
                                                    Z
                                                </div>

                                                <div className="location-info">
                                                    <strong>
                                                        {
                                                            zone.zone_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            zone.zone_id
                                                        }
                                                    </span>
                                                </div>

                                                <div className="location-count">
                                                    {
                                                        getCircleCount(
                                                            zone
                                                        )
                                                    }{" "}
                                                    Circles
                                                </div>
                                            </div>

                                            {/* CIRCLES */}

                                            {zoneExpanded && (
                                                <div className="tree-children">

                                                    {zone.circles?.map(
                                                        (
                                                            circle,
                                                            circleIndex
                                                        ) => {
                                                            const circleKey =
                                                                `zonal-circle-${
                                                                    circle.circle_id ||
                                                                    circleIndex
                                                                }`;

                                                            const circleExpanded =
                                                                expanded[
                                                                    circleKey
                                                                ];

                                                            return (
                                                                <div
                                                                    key={
                                                                        circleKey
                                                                    }
                                                                >

                                                                    <div
                                                                        className="tree-row state-row"
                                                                        onClick={() =>
                                                                            toggleNode(
                                                                                circleKey
                                                                            )
                                                                        }
                                                                    >
                                                                        <button className="expand-btn">
                                                                            {circleExpanded
                                                                                ? "−"
                                                                                : "+"}
                                                                        </button>

                                                                        <div className="location-symbol state-symbol">
                                                                            C
                                                                        </div>

                                                                        <div className="location-info">
                                                                            <strong>
                                                                                {
                                                                                    circle.circle_name
                                                                                }
                                                                            </strong>

                                                                            <span>
                                                                                {
                                                                                    circle.circle_id
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div className="location-count">
                                                                            {
                                                                                getRegionCount(
                                                                                    circle
                                                                                )
                                                                            }{" "}
                                                                            Regions
                                                                        </div>
                                                                    </div>

                                                                    {/* REGIONS */}

                                                                    {circleExpanded && (
                                                                        <div className="nested-level">

                                                                            {circle.regions?.map(
                                                                                (
                                                                                    region,
                                                                                    regionIndex
                                                                                ) => {
                                                                                    const regionKey =
                                                                                        `zonal-region-${
                                                                                            region.region_id ||
                                                                                            regionIndex
                                                                                        }`;

                                                                                    const regionExpanded =
                                                                                        expanded[
                                                                                            regionKey
                                                                                        ];

                                                                                    return (
                                                                                        <div
                                                                                            key={
                                                                                                regionKey
                                                                                            }
                                                                                        >

                                                                                            <div
                                                                                                className="tree-row circle-row"
                                                                                                onClick={() =>
                                                                                                    toggleNode(
                                                                                                        regionKey
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <button className="expand-btn">
                                                                                                    {regionExpanded
                                                                                                        ? "−"
                                                                                                        : "+"}
                                                                                                </button>

                                                                                                <div className="location-symbol circle-symbol">
                                                                                                    R
                                                                                                </div>

                                                                                                <div className="location-info">
                                                                                                    <strong>
                                                                                                        {
                                                                                                            region.region_name
                                                                                                        }
                                                                                                    </strong>

                                                                                                    <span>
                                                                                                        {
                                                                                                            region.region_id
                                                                                                        }
                                                                                                    </span>
                                                                                                </div>

                                                                                                <div className="location-count">
                                                                                                    {
                                                                                                        getDivisionCount(
                                                                                                            region
                                                                                                        )
                                                                                                    }{" "}
                                                                                                    Divisions
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* DIVISIONS */}

                                                                                            {regionExpanded && (
                                                                                                <div className="nested-level">

                                                                                                    {region.divisions?.map(
                                                                                                        (
                                                                                                            division,
                                                                                                            divisionIndex
                                                                                                        ) => {
                                                                                                            const divisionKey =
                                                                                                                `zonal-division-${
                                                                                                                    division.division_id ||
                                                                                                                    divisionIndex
                                                                                                                }`;

                                                                                                            const divisionExpanded =
                                                                                                                expanded[
                                                                                                                    divisionKey
                                                                                                                ];

                                                                                                            return (
                                                                                                                <div
                                                                                                                    key={
                                                                                                                        divisionKey
                                                                                                                    }
                                                                                                                >

                                                                                                                    <div
                                                                                                                        className="tree-row city-row"
                                                                                                                        onClick={() =>
                                                                                                                            toggleNode(
                                                                                                                                divisionKey
                                                                                                                            )
                                                                                                                        }
                                                                                                                    >
                                                                                                                        <button className="expand-btn">
                                                                                                                            {divisionExpanded
                                                                                                                                ? "−"
                                                                                                                                : "+"}
                                                                                                                        </button>

                                                                                                                        <div className="location-symbol city-symbol">
                                                                                                                            D
                                                                                                                        </div>

                                                                                                                        <div className="location-info">
                                                                                                                            <strong>
                                                                                                                                {
                                                                                                                                    division.division_name
                                                                                                                                }
                                                                                                                            </strong>

                                                                                                                            <span>
                                                                                                                                {
                                                                                                                                    division.division_id
                                                                                                                                }
                                                                                                                            </span>
                                                                                                                        </div>

                                                                                                                        <div className="location-count">
                                                                                                                            {
                                                                                                                                getBranchCount(
                                                                                                                                    division
                                                                                                                                )
                                                                                                                            }{" "}
                                                                                                                            Branches
                                                                                                                        </div>
                                                                                                                    </div>

                                                                                                                    {/* BRANCHES */}

                                                                                                                    {divisionExpanded && (
                                                                                                                        <div className="nested-level">

                                                                                                                            {division.branches?.map(
                                                                                                                                (
                                                                                                                                    branch,
                                                                                                                                    branchIndex
                                                                                                                                ) => (
                                                                                                                                    <BranchTree
                                                                                                                                        key={
                                                                                                                                            branch.branch_id ||
                                                                                                                                            branchIndex
                                                                                                                                        }
                                                                                                                                        branch={
                                                                                                                                            branch
                                                                                                                                        }
                                                                                                                                        expanded={
                                                                                                                                            expanded
                                                                                                                                        }
                                                                                                                                        toggleNode={
                                                                                                                                            toggleNode
                                                                                                                                        }
                                                                                                                                    />
                                                                                                                                )
                                                                                                                            )}

                                                                                                                        </div>
                                                                                                                    )}

                                                                                                                </div>
                                                                                                            );
                                                                                                        }
                                                                                                    )}

                                                                                                </div>
                                                                                            )}

                                                                                        </div>
                                                                                    );
                                                                                }
                                                                            )}

                                                                        </div>
                                                                    )}

                                                                </div>
                                                            );
                                                        }
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}
                </>
            )}

            {/* =================================================
                ADD LOCATION MODAL
            ================================================= */}

            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={closeAddLocation}
                >
                    <div
                        className="location-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="modal-header">
                            <div>
                                <h2>
                                    Add{" "}
                                    {
                                        locationTypeOptions.find(
                                            (item) =>
                                                item.value ===
                                                locationType
                                        )?.label
                                    }
                                </h2>

                                <p>
                                    Add a new location to the{" "}
                                    {hierarchyType ===
                                    "GEOGRAPHICAL"
                                        ? "geographical"
                                        : "zonal"}{" "}
                                    hierarchy.
                                </p>
                            </div>

                            <button
                                className="close-btn"
                                onClick={
                                    closeAddLocation
                                }
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();

                                console.log(
                                    "Location to create:",
                                    {
                                        hierarchyType,
                                        locationType,
                                        formData,
                                    }
                                );

                                /*
                                 * Connect POST API here.
                                 */
                            }}
                        >

                            {/* LOCATION TYPE */}

                            <div className="form-group">
                                <label>
                                    Location Type
                                </label>

                                <select
                                    value={
                                        locationType
                                    }
                                    onChange={(event) => {
                                        setLocationType(
                                            event.target.value
                                        );
                                        setSaveError("");
                                        setFormData(
                                            EMPTY_FORM
                                        );
                                    }}
                                >
                                    {locationTypeOptions.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* =================================================
                                GEOGRAPHICAL FORM
                            ================================================= */}

                            {hierarchyType ===
                                "GEOGRAPHICAL" && (
                                <>
                                    {/* STATE */}

                                    {locationType ===
                                        "state" && (
                                        <>
                                            <div className="form-group">
                                                <label>
                                                    State Code
                                                </label>

                                                <input
                                                    type="text"
                                                    placeholder="Example: MH"
                                                    value={
                                                        formData.state_code
                                                    }
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            "state_code",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    State Name
                                                </label>

                                                <input
                                                    type="text"
                                                    placeholder="Example: Maharashtra"
                                                    value={
                                                        formData.state_name
                                                    }
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            "state_name",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* DISTRICT */}

                                    {locationType ===
                                        "district" && (
                                        <>
                                            <div className="form-group">
                                                <label>
                                                    State
                                                </label>

                                                <select
                                                    value={
                                                        formData.state_id
                                                    }
                                                    onChange={(e) =>
                                                        setFormData(
                                                            {
                                                                ...formData,
                                                                state_id:
                                                                    e.target
                                                                        .value,
                                                                district_id:
                                                                    "",
                                                                taluka_id:
                                                                    "",
                                                                city_id:
                                                                    "",
                                                            }
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Select State
                                                    </option>

                                                    {currentLocations.map(
                                                        (
                                                            state
                                                        ) => (
                                                            <option
                                                                key={
                                                                    state.state_id
                                                                }
                                                                value={
                                                                    state.state_id
                                                                }
                                                            >
                                                                {
                                                                    state.state_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <LocationTextField
                                                label="District Code"
                                                placeholder="Example: MH-PUN"
                                                value={
                                                    formData.district_code
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "district_code",
                                                        value
                                                    )
                                                }
                                            />

                                            <LocationTextField
                                                label="District Name"
                                                placeholder="Example: Pune"
                                                value={
                                                    formData.district_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "district_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* TALUKA */}

                                    {locationType ===
                                        "taluka" && (
                                        <>
                                            <SelectField
                                                label="State"
                                                value={
                                                    formData.state_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            state_id:
                                                                value,
                                                            district_id:
                                                                "",
                                                            taluka_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={currentLocations}
                                                valueKey="state_id"
                                                labelKey="state_name"
                                            />

                                            <SelectField
                                                label="District"
                                                value={
                                                    formData.district_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            district_id:
                                                                value,
                                                            taluka_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getDistrictsByState()}
                                                valueKey="district_id"
                                                labelKey="district_name"
                                                disabled={
                                                    !formData.state_id
                                                }
                                            />

                                            <LocationTextField
                                                label="Taluka Code"
                                                placeholder="Example: HAV"
                                                value={
                                                    formData.taluka_code
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "taluka_code",
                                                        value
                                                    )
                                                }
                                            />

                                            <LocationTextField
                                                label="Taluka Name"
                                                placeholder="Example: Haveli"
                                                value={
                                                    formData.taluka_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "taluka_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* CITY */}

                                    {locationType ===
                                        "city" && (
                                        <>
                                            <SelectField
                                                label="State"
                                                value={
                                                    formData.state_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            state_id:
                                                                value,
                                                            district_id:
                                                                "",
                                                            taluka_id:
                                                                "",
                                                            city_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={currentLocations}
                                                valueKey="state_id"
                                                labelKey="state_name"
                                            />

                                            <SelectField
                                                label="District"
                                                value={
                                                    formData.district_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            district_id:
                                                                value,
                                                            taluka_id:
                                                                "",
                                                            city_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getDistrictsByState()}
                                                valueKey="district_id"
                                                labelKey="district_name"
                                                disabled={
                                                    !formData.state_id
                                                }
                                            />

                                            <SelectField
                                                label="Taluka"
                                                value={
                                                    formData.taluka_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            taluka_id:
                                                                value,
                                                            city_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getTalukasByDistrict()}
                                                valueKey="taluka_id"
                                                labelKey="taluka_name"
                                                disabled={
                                                    !formData.district_id
                                                }
                                            />

                                            <LocationTextField
                                                label="City Name"
                                                placeholder="Example: Pune"
                                                value={
                                                    formData.city_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "city_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* BRANCH */}

                                    {locationType ===
                                        "branch" && (
                                        <>
                                            <SelectField
                                                label="State"
                                                value={
                                                    formData.state_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            state_id:
                                                                value,
                                                            district_id:
                                                                "",
                                                            taluka_id:
                                                                "",
                                                            city_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={currentLocations}
                                                valueKey="state_id"
                                                labelKey="state_name"
                                            />

                                            <SelectField
                                                label="District"
                                                value={
                                                    formData.district_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            district_id:
                                                                value,
                                                            taluka_id:
                                                                "",
                                                            city_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getDistrictsByState()}
                                                valueKey="district_id"
                                                labelKey="district_name"
                                                disabled={
                                                    !formData.state_id
                                                }
                                            />

                                            <SelectField
                                                label="Taluka"
                                                value={
                                                    formData.taluka_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            taluka_id:
                                                                value,
                                                            city_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getTalukasByDistrict()}
                                                valueKey="taluka_id"
                                                labelKey="taluka_name"
                                                disabled={
                                                    !formData.district_id
                                                }
                                            />

                                            <SelectField
                                                label="City"
                                                value={
                                                    formData.city_id
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "city_id",
                                                        value
                                                    )
                                                }
                                                options={getCitiesByTaluka()}
                                                valueKey="city_id"
                                                labelKey="city_name"
                                                disabled={
                                                    !formData.taluka_id
                                                }
                                            />

                                            <LocationTextField
                                                label="Branch Code"
                                                placeholder="Example: PUN-B01"
                                                value={
                                                    formData.branch_code
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "branch_code",
                                                        value
                                                    )
                                                }
                                            />

                                            <LocationTextField
                                                label="Branch Name"
                                                placeholder="Example: Pune Branch 01"
                                                value={
                                                    formData.branch_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "branch_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* FLOOR */}

                                    {locationType ===
                                        "floor" && (
                                        <>
                                            <div className="form-group">
                                                <label>
                                                    Branch
                                                </label>

                                                <select
                                                    value={
                                                        formData.branch_id
                                                    }
                                                    onChange={(event) =>
                                                        handleFieldChange(
                                                            "branch_id",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Select Branch
                                                    </option>

                                                    {allBranches().map(
                                                        (
                                                            branch
                                                        ) => (
                                                            <option
                                                                key={
                                                                    branch.branch_id
                                                                }
                                                                value={
                                                                    branch.branch_id
                                                                }
                                                            >
                                                                {
                                                                    branch.branch_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <LocationTextField
                                                label="Floor Name"
                                                placeholder="Example: Floor-01"
                                                value={
                                                    formData.floor_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "floor_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* ROOM */}

                                    {locationType ===
                                        "room" && (
                                        <>
                                            <div className="form-group">
                                                <label>
                                                    Floor
                                                </label>

                                                <select
                                                    value={
                                                        formData.floor_id
                                                    }
                                                    onChange={(event) =>
                                                        handleFieldChange(
                                                            "floor_id",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Select Floor
                                                    </option>

                                                    {allFloors().map(
                                                        (
                                                            floor
                                                        ) => (
                                                            <option
                                                                key={
                                                                    floor.floor_id
                                                                }
                                                                value={
                                                                    floor.floor_id
                                                                }
                                                            >
                                                                {
                                                                    floor.floor_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <LocationTextField
                                                label="Room Name"
                                                placeholder="Example: Room-01"
                                                value={
                                                    formData.room_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "room_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {/* =================================================
                                ZONAL FORM
                            ================================================= */}

                            {hierarchyType ===
                                "ZONAL" && (
                                <>
                                    {/* ZONE */}

                                    {locationType ===
                                        "zone" && (
                                        <>
                                            <LocationTextField
                                                label="Zone Code"
                                                placeholder="Example: WEST"
                                                value={
                                                    formData.zone_code
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "zone_code",
                                                        value
                                                    )
                                                }
                                            />

                                            <LocationTextField
                                                label="Zone Name"
                                                placeholder="Example: West Zone"
                                                value={
                                                    formData.zone_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "zone_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* CIRCLE */}

                                    {locationType ===
                                        "circle" && (
                                        <>
                                            <SelectField
                                                label="Zone"
                                                value={
                                                    formData.zone_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            zone_id:
                                                                value,
                                                            circle_id:
                                                                "",
                                                            region_id:
                                                                "",
                                                            division_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={currentLocations}
                                                valueKey="zone_id"
                                                labelKey="zone_name"
                                            />

                                            <LocationTextField
                                                label="Circle Code"
                                                placeholder="Example: MH-C01"
                                                value={
                                                    formData.circle_code
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "circle_code",
                                                        value
                                                    )
                                                }
                                            />

                                            <LocationTextField
                                                label="Circle Name"
                                                placeholder="Example: Maharashtra Circle"
                                                value={
                                                    formData.circle_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "circle_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* REGION */}

                                    {locationType ===
                                        "region" && (
                                        <>
                                            <SelectField
                                                label="Zone"
                                                value={
                                                    formData.zone_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            zone_id:
                                                                value,
                                                            circle_id:
                                                                "",
                                                            region_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={currentLocations}
                                                valueKey="zone_id"
                                                labelKey="zone_name"
                                            />

                                            <SelectField
                                                label="Circle"
                                                value={
                                                    formData.circle_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            circle_id:
                                                                value,
                                                            region_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getCirclesByZone()}
                                                valueKey="circle_id"
                                                labelKey="circle_name"
                                                disabled={
                                                    !formData.zone_id
                                                }
                                            />

                                            <LocationTextField
                                                label="Region Code"
                                                placeholder="Example: PUN-R01"
                                                value={
                                                    formData.region_code
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "region_code",
                                                        value
                                                    )
                                                }
                                            />

                                            <LocationTextField
                                                label="Region Name"
                                                placeholder="Example: Pune Region"
                                                value={
                                                    formData.region_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "region_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* DIVISION */}

                                    {locationType ===
                                        "division" && (
                                        <>
                                            <SelectField
                                                label="Zone"
                                                value={
                                                    formData.zone_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            zone_id:
                                                                value,
                                                            circle_id:
                                                                "",
                                                            region_id:
                                                                "",
                                                            division_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={currentLocations}
                                                valueKey="zone_id"
                                                labelKey="zone_name"
                                            />

                                            <SelectField
                                                label="Circle"
                                                value={
                                                    formData.circle_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            circle_id:
                                                                value,
                                                            region_id:
                                                                "",
                                                            division_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getCirclesByZone()}
                                                valueKey="circle_id"
                                                labelKey="circle_name"
                                                disabled={
                                                    !formData.zone_id
                                                }
                                            />

                                            <SelectField
                                                label="Region"
                                                value={
                                                    formData.region_id
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "region_id",
                                                        value
                                                    )
                                                }
                                                options={getRegionsByCircle()}
                                                valueKey="region_id"
                                                labelKey="region_name"
                                                disabled={
                                                    !formData.circle_id
                                                }
                                            />

                                            <LocationTextField
                                                label="Division Code"
                                                placeholder="Example: PUN-D01"
                                                value={
                                                    formData.division_code
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "division_code",
                                                        value
                                                    )
                                                }
                                            />

                                            <LocationTextField
                                                label="Division Name"
                                                placeholder="Example: Pune Division"
                                                value={
                                                    formData.division_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "division_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* BRANCH */}

                                    {locationType ===
                                        "branch" && (
                                        <>
                                            <SelectField
                                                label="Zone"
                                                value={
                                                    formData.zone_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            zone_id:
                                                                value,
                                                            circle_id:
                                                                "",
                                                            region_id:
                                                                "",
                                                            division_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={currentLocations}
                                                valueKey="zone_id"
                                                labelKey="zone_name"
                                            />

                                            <SelectField
                                                label="Circle"
                                                value={
                                                    formData.circle_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            circle_id:
                                                                value,
                                                            region_id:
                                                                "",
                                                            division_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getCirclesByZone()}
                                                valueKey="circle_id"
                                                labelKey="circle_name"
                                                disabled={
                                                    !formData.zone_id
                                                }
                                            />

                                            <SelectField
                                                label="Region"
                                                value={
                                                    formData.region_id
                                                }
                                                onChange={(value) =>
                                                    setFormData(
                                                        {
                                                            ...formData,
                                                            region_id:
                                                                value,
                                                            division_id:
                                                                "",
                                                        }
                                                    )
                                                }
                                                options={getRegionsByCircle()}
                                                valueKey="region_id"
                                                labelKey="region_name"
                                                disabled={
                                                    !formData.circle_id
                                                }
                                            />

                                            <SelectField
                                                label="Division"
                                                value={
                                                    formData.division_id
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "division_id",
                                                        value
                                                    )
                                                }
                                                options={getDivisionsByRegion()}
                                                valueKey="division_id"
                                                labelKey="division_name"
                                                disabled={
                                                    !formData.region_id
                                                }
                                            />

                                            <LocationTextField
                                                label="Branch Code"
                                                placeholder="Example: PUN-B01"
                                                value={
                                                    formData.branch_code
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "branch_code",
                                                        value
                                                    )
                                                }
                                            />

                                            <LocationTextField
                                                label="Branch Name"
                                                placeholder="Example: Pune Branch 01"
                                                value={
                                                    formData.branch_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "branch_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* FLOOR */}

                                    {locationType ===
                                        "floor" && (
                                        <>
                                            <div className="form-group">
                                                <label>
                                                    Branch
                                                </label>

                                                <select
                                                    value={
                                                        formData.branch_id
                                                    }
                                                    onChange={(event) =>
                                                        handleFieldChange(
                                                            "branch_id",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Select Branch
                                                    </option>

                                                    {allBranches().map(
                                                        (
                                                            branch
                                                        ) => (
                                                            <option
                                                                key={
                                                                    branch.branch_id
                                                                }
                                                                value={
                                                                    branch.branch_id
                                                                }
                                                            >
                                                                {
                                                                    branch.branch_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <LocationTextField
                                                label="Floor Name"
                                                placeholder="Example: Floor-01"
                                                value={
                                                    formData.floor_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "floor_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {/* ROOM */}

                                    {locationType ===
                                        "room" && (
                                        <>
                                            <div className="form-group">
                                                <label>
                                                    Floor
                                                </label>

                                                <select
                                                    value={
                                                        formData.floor_id
                                                    }
                                                    onChange={(event) =>
                                                        handleFieldChange(
                                                            "floor_id",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Select Floor
                                                    </option>

                                                    {allFloors().map(
                                                        (
                                                            floor
                                                        ) => (
                                                            <option
                                                                key={
                                                                    floor.floor_id
                                                                }
                                                                value={
                                                                    floor.floor_id
                                                                }
                                                            >
                                                                {
                                                                    floor.floor_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <LocationTextField
                                                label="Room Name"
                                                placeholder="Example: Room-01"
                                                value={
                                                    formData.room_name
                                                }
                                                onChange={(value) =>
                                                    handleFieldChange(
                                                        "room_name",
                                                        value
                                                    )
                                                }
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {/* ERROR */}

                            {saveError && (
                                <div className="location-error">
                                    {saveError}
                                </div>
                            )}

                            {/* ACTIONS */}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        closeAddLocation
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Add Location"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </SiteActionsContext.Provider>
    );
};

/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

const LocationTextField = ({
    label,
    placeholder,
    value,
    onChange,
}) => (
    <div className="form-group">
        <label>{label}</label>

        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(event) =>
                onChange(event.target.value)
            }
            required
        />
    </div>
);

const SelectField = ({
    label,
    value,
    onChange,
    options = [],
    valueKey,
    labelKey,
    disabled = false,
}) => (
    <div className="form-group">
        <label>{label}</label>

        <select
            value={value}
            onChange={(event) =>
                onChange(event.target.value)
            }
            disabled={disabled}
            required
        >
            <option value="">
                Select {label}
            </option>

            {options.map((item, index) => (
                <option
                    key={
                        item[valueKey] ||
                        index
                    }
                    value={
                        item[valueKey]
                    }
                >
                    {item[labelKey]}
                </option>
            ))}
        </select>
    </div>
);

/* =========================================================
   BRANCH TREE
========================================================= */

const BranchTree = ({
    branch,
    expanded,
    toggleNode,
}) => {
    const branchKey =
        `branch-${branch.branch_id}`;

    const branchExpanded =
        expanded[branchKey];

    const { canAssign, openAssign } = useContext(SiteActionsContext);

    const floorCount =
        branch.floors?.length || 0;

    // ACs placed straight under the branch: new `sites` list + legacy `ac_devices`
    const directACs = [
        ...(branch.sites || []),
        ...(branch.ac_devices || []),
    ];
    const directACCount = directACs.length;

    const customerLabel = branch.customer?.company;
    const adminLabel = (branch.admins || []).map((a) => a.name).join(", ");

    return (
        <div>

            {/* BRANCH */}

            <div
                className="tree-row branch-row"
                onClick={() =>
                    toggleNode(branchKey)
                }
            >
                <button className="expand-btn">
                    {branchExpanded
                        ? "−"
                        : "+"}
                </button>

                <div className="location-symbol branch-symbol">
                    B
                </div>

                <div className="location-info">
                    <strong>
                        {
                            branch.branch_name
                        }
                    </strong>

                    <span>
                        {
                            branch.branch_id
                        }
                    </span>

                    <span style={{ display: "block", fontSize: 12, marginTop: 2 }}>
                        {customerLabel ? (
                            <>
                                <b>{customerLabel}</b>
                                {adminLabel ? ` · Admin: ${adminLabel}` : " · no admin assigned"}
                            </>
                        ) : (
                            <em style={{ color: "#b45309" }}>Not assigned to a customer</em>
                        )}
                    </span>
                </div>

                <div className="location-count">
                    {floorCount} Floors
                    {directACCount > 0 &&
                        ` • ${directACCount} Direct ACs`}
                </div>

                {canAssign && (
                    <button
                        type="button"
                        className="refresh-btn"
                        style={{ marginLeft: 12, whiteSpace: "nowrap" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            openAssign(branch);
                        }}
                    >
                        {customerLabel ? "Edit owners" : "Assign"}
                    </button>
                )}
            </div>

            {/* BRANCH CONTENT */}

            {branchExpanded && (
                <div className="nested-level">

                    {/* DIRECT ACs */}

                    {directACs
                        .length > 0 && (
                        <div className="ac-list">
                            {directACs.map(
                                (
                                    ac,
                                    index
                                ) => (
                                    <div
                                        className="ac-item"
                                        key={
                                            ac.ac_id || ac.site_id ||
                                            index
                                        }
                                    >
                                        <div className="ac-dot"></div>

                                        <div className="ac-info">
                                            <strong>
                                                {
                                                    ac.ac_id || ac.site_id
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    ac.device_name
                                                }
                                            </span>
                                        </div>

                                        <span
                                            className={
                                                ac.status ===
                                                "ON"
                                                    ? "ac-status on"
                                                    : "ac-status off"
                                            }
                                        >
                                            {
                                                ac.status
                                            }
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* FLOORS */}

                    {branch.floors?.map(
                        (
                            floor,
                            floorIndex
                        ) => {
                            const floorKey =
                                `floor-${floor.floor_id || floorIndex}`;

                            const floorExpanded =
                                expanded[
                                    floorKey
                                ];

                            return (
                                <div
                                    key={
                                        floorKey
                                    }
                                >
                                    <div
                                        className="tree-row floor-row"
                                        onClick={() =>
                                            toggleNode(
                                                floorKey
                                            )
                                        }
                                    >
                                        <button className="expand-btn">
                                            {floorExpanded
                                                ? "−"
                                                : "+"}
                                        </button>

                                        <div className="location-symbol floor-symbol">
                                            F
                                        </div>

                                        <div className="location-info">
                                            <strong>
                                                {
                                                    floor.floor_name
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    floor.floor_id
                                                }
                                            </span>
                                        </div>

                                        <div className="location-count">
                                            {(floor.rooms?.length || 0) > 0
                                                ? `${floor.rooms.length} Rooms`
                                                : `${floor.sites?.length || 0} ACs`}
                                        </div>
                                    </div>

                                    {/* ROOMS */}

                                    {floorExpanded && (
                                        <div className="nested-level">
                                            {floor.sites?.length > 0 && (
                                                <div className="ac-list">
                                                    {floor.sites.map((ac, acIndex) => (
                                                        <div className="ac-item" key={ac.site_id || ac.ac_id || acIndex}>
                                                            <div className="ac-dot"></div>
                                                            <div className="ac-info">
                                                                <strong>{ac.site_id || ac.ac_id}</strong>
                                                                <span>{ac.device_name}</span>
                                                            </div>
                                                            <span className={ac.status === "ON" ? "ac-status on" : "ac-status off"}>
                                                                {ac.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {floor.rooms?.map(
                                                (
                                                    room,
                                                    roomIndex
                                                ) => {
                                                    const roomKey =
                                                        `room-${room.room_id || roomIndex}`;

                                                    const roomExpanded =
                                                        expanded[
                                                            roomKey
                                                        ];

                                                    return (
                                                        <div
                                                            key={
                                                                roomKey
                                                            }
                                                        >
                                                            <div
                                                                className="tree-row room-row"
                                                                onClick={() =>
                                                                    toggleNode(
                                                                        roomKey
                                                                    )
                                                                }
                                                            >
                                                                <button className="expand-btn">
                                                                    {roomExpanded
                                                                        ? "−"
                                                                        : "+"}
                                                                </button>

                                                                <div className="location-symbol room-symbol">
                                                                    R
                                                                </div>

                                                                <div className="location-info">
                                                                    <strong>
                                                                        {
                                                                            room.room_name
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            room.room_id
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="location-count">
                                                                    {
                                                                        room
                                                                            .ac_devices
                                                                            ?.length ||
                                                                        0
                                                                    }{" "}
                                                                    ACs
                                                                </div>
                                                            </div>

                                                            {/* ACs */}

                                                            {roomExpanded &&
                                                                room.ac_devices
                                                                    ?.length >
                                                                    0 && (
                                                                    <div className="ac-list">
                                                                        {room.ac_devices.map(
                                                                            (
                                                                                ac,
                                                                                acIndex
                                                                            ) => (
                                                                                <div
                                                                                    className="ac-item"
                                                                                    key={
                                                                                        ac.ac_id ||
                                                                                        acIndex
                                                                                    }
                                                                                >
                                                                                    <div className="ac-dot"></div>

                                                                                    <div className="ac-info">
                                                                                        <strong>
                                                                                            {
                                                                                                ac.ac_id
                                                                                            }
                                                                                        </strong>

                                                                                        <span>
                                                                                            {
                                                                                                ac.device_name
                                                                                            }
                                                                                        </span>
                                                                                    </div>

                                                                                    <span
                                                                                        className={
                                                                                            ac.status ===
                                                                                            "ON"
                                                                                                ? "ac-status on"
                                                                                                : "ac-status off"
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            ac.status
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default Locations;