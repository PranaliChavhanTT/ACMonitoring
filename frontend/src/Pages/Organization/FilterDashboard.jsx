// // // // import React, { useState, useEffect } from 'react';

// // // // const FilterDashboard = () => {
// // // //     // 1. Store the full dataset from the API
// // // //     const [data, setData] = useState([]);
    
// // // //     // 2. Store the currently selected IDs
// // // //     const [selectedState, setSelectedState] = useState('');
// // // //     const [selectedCity, setSelectedCity] = useState('');
// // // //     const [selectedBranch, setSelectedBranch] = useState('');
// // // //     const [selectedFloor, setSelectedFloor] = useState('');

// // // //     // 3. Fetch data on component mount
// // // //     useEffect(() => {
// // // //         fetch('http://localhost:5000/api/v1/filters/locations')
// // // //         .then(res => res.json())
// // // //         .then(result => {
// // // //             if (result.success) setData(result.data);
// // // //         })
// // // //         .catch(err => console.error("Error fetching filters:", err));
// // // //     }, []);

// // // //     // --- CASCADING LOGIC ---

// // // //     // Derive Cities based on selected State
// // // //     const getCities = () => {
// // // //         if (!selectedState) return [];
// // // //         const stateObj = data.find(s => s.state_id === selectedState);
// // // //         return stateObj ? stateObj.cities : [];
// // // //     };

// // // //     // Derive Branches based on selected State and City
// // // //     const getBranches = () => {
// // // //         if (!selectedCity) return [];
// // // //         const cities = getCities();
// // // //         const cityObj = cities.find(c => c.city_id === selectedCity);
// // // //         return cityObj ? cityObj.branches : [];
// // // //     };

// // // //     // Derive Floors based on selected State, City, and Branch
// // // //     const getFloors = () => {
// // // //         if (!selectedBranch) return [];
// // // //         const branches = getBranches();
// // // //         const branchObj = branches.find(b => b.branch_id === selectedBranch);
// // // //         return branchObj ? branchObj.floors : [];
// // // //     };

// // // //     // --- EVENT HANDLERS (Reset children when parent changes) ---

// // // //     const handleStateChange = (e) => {
// // // //         setSelectedState(e.target.value);
// // // //         setSelectedCity('');   // Reset City
// // // //         setSelectedBranch(''); // Reset Branch
// // // //         setSelectedFloor('');  // Reset Floor
// // // //     };

// // // //     const handleCityChange = (e) => {
// // // //         setSelectedCity(e.target.value);
// // // //         setSelectedBranch(''); // Reset Branch
// // // //         setSelectedFloor('');  // Reset Floor
// // // //     };

// // // //     const handleBranchChange = (e) => {
// // // //         setSelectedBranch(e.target.value);
// // // //         setSelectedFloor('');  // Reset Floor
// // // //     };

// // // //     const handleFloorChange = (e) => {
// // // //         setSelectedFloor(e.target.value);
// // // //     };

// // // //     // --- RENDER ---
// // // //     return (
// // // //         <div style={{ display: 'flex', gap: '15px', padding: '20px', backgroundColor: '#f4f7fc' }}>
        
// // // //         {/* STATE DROPDOWN */}
// // // //         <select value={selectedState} onChange={handleStateChange} className="filter-dropdown">
// // // //             <option value="">Select State</option>
// // // //             {data.map(state => (
// // // //             <option key={state.state_id} value={state.state_id}>
// // // //                 {state.state_name}
// // // //             </option>
// // // //             ))}
// // // //         </select>

// // // //         {/* CITY DROPDOWN (Disabled if no state is selected) */}
// // // //         <select 
// // // //             value={selectedCity} 
// // // //             onChange={handleCityChange} 
// // // //             disabled={!selectedState}
// // // //             className="filter-dropdown"
// // // //         >
// // // //             <option value="">Select City</option>
// // // //             {getCities().map(city => (
// // // //             <option key={city.city_id} value={city.city_id}>
// // // //                 {city.city_name}
// // // //             </option>
// // // //             ))}
// // // //         </select>

// // // //         {/* BRANCH DROPDOWN (Disabled if no city is selected) */}
// // // //         <select 
// // // //             value={selectedBranch} 
// // // //             onChange={handleBranchChange} 
// // // //             disabled={!selectedCity}
// // // //             className="filter-dropdown"
// // // //         >
// // // //             <option value="">Select Branch</option>
// // // //             {getBranches().map(branch => (
// // // //             <option key={branch.branch_id} value={branch.branch_id}>
// // // //                 {branch.branch_name}
// // // //             </option>
// // // //             ))}
// // // //         </select>

// // // //         {/* FLOOR DROPDOWN (Disabled if no branch is selected) */}
// // // //         <select 
// // // //             value={selectedFloor} 
// // // //             onChange={handleFloorChange} 
// // // //             disabled={!selectedBranch}
// // // //             className="filter-dropdown"
// // // //         >
// // // //             <option value="">Select Floor</option>
// // // //             {getFloors().map(floor => (
// // // //             <option key={floor.floor_id} value={floor.floor_id}>
// // // //                 {floor.floor_name}
// // // //             </option>
// // // //             ))}
// // // //         </select>

// // // //         </div>
// // // //     );
// // // // };

// // // // export default FilterDashboard;


// // // import React, { useEffect, useMemo, useState } from "react";

// // // const API_URL = "http://localhost:8000/api/ac-data/";

// // // // ------------------------------------------------------
// // // // Get token from localStorage
// // // // Supports the common keys used by your login code.
// // // // ------------------------------------------------------
// // // const getToken = () => {
// // //   return (
// // //     localStorage.getItem("token") ||
// // //     localStorage.getItem("authToken") ||
// // //     localStorage.getItem("access_token") ||
// // //     localStorage.getItem("accessToken") ||
// // //     ""
// // //   );
// // // };

// // // const FilterDashboard = ({ onFilterChange }) => {
// // //   const [data, setData] = useState([]);

// // //   const [selectedState, setSelectedState] = useState("");
// // //   const [selectedCity, setSelectedCity] = useState("");
// // //   const [selectedBranch, setSelectedBranch] = useState("");
// // //   const [selectedFloor, setSelectedFloor] = useState("");

// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState("");

// // //   // =====================================================
// // //   // FETCH AC DATA FROM DJANGO
// // //   // =====================================================

// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       try {
// // //         const token = getToken();

// // //         console.log(
// // //           "Token available:",
// // //           token ? "YES" : "NO"
// // //         );

// // //         const response = await fetch(
// // //           `${API_URL}?t=${Date.now()}`,
// // //           {
// // //             method: "GET",
// // //             cache: "no-store",
// // //             headers: {
// // //               "Content-Type": "application/json",
// // //               ...(token
// // //                 ? {
// // //                     Authorization: `Token ${token}`,
// // //                   }
// // //                 : {}),
// // //             },
// // //           }
// // //         );

// // //         if (response.status === 401) {
// // //           throw new Error(
// // //             "401 Unauthorized - Please login again."
// // //           );
// // //         }

// // //         if (!response.ok) {
// // //           throw new Error(
// // //             `HTTP ${response.status}`
// // //           );
// // //         }

// // //         const result = await response.json();

// // //         console.log(
// // //           "FILTER API DATA:",
// // //           result
// // //         );

// // //         const records = Array.isArray(result)
// // //           ? result
// // //           : Array.isArray(result.data)
// // //           ? result.data
// // //           : [];

// // //         setData(records);
// // //         setError("");

// // //       } catch (err) {
// // //         console.error(
// // //           "Error fetching filter data:",
// // //           err
// // //         );

// // //         setError(err.message);

// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchData();
// // //   }, []);

// // //   // =====================================================
// // //   // UNIQUE VALUES HELPER
// // //   // =====================================================

// // //   const uniqueValues = (items, getter) => {
// // //     return [
// // //       ...new Set(
// // //         items
// // //           .map(getter)
// // //           .filter(
// // //             (value) =>
// // //               value !== undefined &&
// // //               value !== null &&
// // //               String(value).trim() !== ""
// // //           )
// // //       ),
// // //     ];
// // //   };

// // //   // =====================================================
// // //   // STATES
// // //   // =====================================================

// // //   const states = useMemo(() => {
// // //     return uniqueValues(
// // //       data,
// // //       (item) =>
// // //         item.state ??
// // //         item.state_name ??
// // //         item.region_state
// // //     );
// // //   }, [data]);

// // //   // =====================================================
// // //   // CITIES
// // //   // =====================================================

// // //   const filteredByState = useMemo(() => {
// // //     if (!selectedState) {
// // //       return data;
// // //     }

// // //     return data.filter((item) => {
// // //       const state =
// // //         item.state ??
// // //         item.state_name ??
// // //         item.region_state;

// // //       return String(state) === String(selectedState);
// // //     });
// // //   }, [data, selectedState]);

// // //   const cities = useMemo(() => {
// // //     return uniqueValues(
// // //       filteredByState,
// // //       (item) =>
// // //         item.city ??
// // //         item.city_name ??
// // //         item.region
// // //     );
// // //   }, [filteredByState]);

// // //   // =====================================================
// // //   // BRANCHES
// // //   // =====================================================

// // //   const filteredByCity = useMemo(() => {
// // //     if (!selectedCity) {
// // //       return filteredByState;
// // //     }

// // //     return filteredByState.filter((item) => {
// // //       const city =
// // //         item.city ??
// // //         item.city_name ??
// // //         item.region;

// // //       return String(city) === String(selectedCity);
// // //     });
// // //   }, [
// // //     filteredByState,
// // //     selectedCity,
// // //   ]);

// // //   const branches = useMemo(() => {
// // //     return uniqueValues(
// // //       filteredByCity,
// // //       (item) =>
// // //         item.branch ??
// // //         item.branch_name
// // //     );
// // //   }, [filteredByCity]);

// // //   // =====================================================
// // //   // FLOORS
// // //   // =====================================================

// // //   const filteredByBranch = useMemo(() => {
// // //     if (!selectedBranch) {
// // //       return filteredByCity;
// // //     }

// // //     return filteredByCity.filter((item) => {
// // //       const branch =
// // //         item.branch ??
// // //         item.branch_name;

// // //       return (
// // //         String(branch) ===
// // //         String(selectedBranch)
// // //       );
// // //     });
// // //   }, [
// // //     filteredByCity,
// // //     selectedBranch,
// // //   ]);

// // //   const floors = useMemo(() => {
// // //     return uniqueValues(
// // //       filteredByBranch,
// // //       (item) =>
// // //         item.floor ??
// // //         item.floor_name
// // //     );
// // //   }, [filteredByBranch]);

// // //   // =====================================================
// // //   // SEND FILTER SELECTION TO PARENT
// // //   // =====================================================

// // //   useEffect(() => {
// // //     if (onFilterChange) {
// // //       onFilterChange({
// // //         state: selectedState,
// // //         city: selectedCity,
// // //         branch: selectedBranch,
// // //         floor: selectedFloor,
// // //       });
// // //     }
// // //   }, [
// // //     selectedState,
// // //     selectedCity,
// // //     selectedBranch,
// // //     selectedFloor,
// // //     onFilterChange,
// // //   ]);

// // //   // =====================================================
// // //   // STATE CHANGE
// // //   // =====================================================

// // //   const handleStateChange = (e) => {
// // //     const value = e.target.value;

// // //     setSelectedState(value);
// // //     setSelectedCity("");
// // //     setSelectedBranch("");
// // //     setSelectedFloor("");
// // //   };

// // //   // =====================================================
// // //   // CITY CHANGE
// // //   // =====================================================

// // //   const handleCityChange = (e) => {
// // //     const value = e.target.value;

// // //     setSelectedCity(value);
// // //     setSelectedBranch("");
// // //     setSelectedFloor("");
// // //   };

// // //   // =====================================================
// // //   // BRANCH CHANGE
// // //   // =====================================================

// // //   const handleBranchChange = (e) => {
// // //     const value = e.target.value;

// // //     setSelectedBranch(value);
// // //     setSelectedFloor("");
// // //   };

// // //   // =====================================================
// // //   // FLOOR CHANGE
// // //   // =====================================================

// // //   const handleFloorChange = (e) => {
// // //     setSelectedFloor(
// // //       e.target.value
// // //     );
// // //   };

// // //   // =====================================================
// // //   // RESET
// // //   // =====================================================

// // //   const handleReset = () => {
// // //     setSelectedState("");
// // //     setSelectedCity("");
// // //     setSelectedBranch("");
// // //     setSelectedFloor("");
// // //   };

// // //   // =====================================================
// // //   // UI
// // //   // =====================================================

// // //   return (
// // //     <div
// // //       style={{
// // //         display: "flex",
// // //         alignItems: "center",
// // //         gap: "10px",
// // //         padding: "12px 15px",
// // //         background: "#ffffff",
// // //         border: "1px solid #e1e8f0",
// // //         borderRadius: "8px",
// // //         flexWrap: "wrap",
// // //       }}
// // //     >

// // //       {/* STATE */}

// // //       <select
// // //         value={selectedState}
// // //         onChange={handleStateChange}
// // //         className="filter-dropdown"
// // //       >
// // //         <option value="">
// // //           Select State
// // //         </option>

// // //         {states.map(
// // //           (state) => (
// // //             <option
// // //               key={state}
// // //               value={state}
// // //             >
// // //               {state}
// // //             </option>
// // //           )
// // //         )}
// // //       </select>


// // //       {/* CITY */}

// // //       <select
// // //         value={selectedCity}
// // //         onChange={handleCityChange}
// // //         disabled={!selectedState}
// // //         className="filter-dropdown"
// // //       >
// // //         <option value="">
// // //           Select City
// // //         </option>

// // //         {cities.map(
// // //           (city) => (
// // //             <option
// // //               key={city}
// // //               value={city}
// // //             >
// // //               {city}
// // //             </option>
// // //           )
// // //         )}
// // //       </select>


// // //       {/* BRANCH */}

// // //       <select
// // //         value={selectedBranch}
// // //         onChange={handleBranchChange}
// // //         disabled={!selectedCity}
// // //         className="filter-dropdown"
// // //       >
// // //         <option value="">
// // //           Select Branch
// // //         </option>

// // //         {branches.map(
// // //           (branch) => (
// // //             <option
// // //               key={branch}
// // //               value={branch}
// // //             >
// // //               {branch}
// // //             </option>
// // //           )
// // //         )}
// // //       </select>


// // //       {/* FLOOR */}

// // //       <select
// // //         value={selectedFloor}
// // //         onChange={handleFloorChange}
// // //         disabled={!selectedBranch}
// // //         className="filter-dropdown"
// // //       >
// // //         <option value="">
// // //           Select Floor
// // //         </option>

// // //         {floors.map(
// // //           (floor) => (
// // //             <option
// // //               key={floor}
// // //               value={floor}
// // //             >
// // //               {floor}
// // //             </option>
// // //           )
// // //         )}
// // //       </select>


// // //       {/* RESET */}

// // //       <button
// // //         type="button"
// // //         onClick={handleReset}
// // //         style={{
// // //           height: "35px",
// // //           padding: "0 14px",
// // //           border: "1px solid #d1d5db",
// // //           borderRadius: "5px",
// // //           background: "#ffffff",
// // //           cursor: "pointer",
// // //           fontSize: "12px",
// // //         }}
// // //       >
// // //         Reset
// // //       </button>


// // //       {/* STATUS */}

// // //       {loading && (
// // //         <span
// // //           style={{
// // //             fontSize: "11px",
// // //             color: "#64748b",
// // //           }}
// // //         >
// // //           Loading filters...
// // //         </span>
// // //       )}

// // //       {error && (
// // //         <span
// // //           style={{
// // //             fontSize: "11px",
// // //             color: "#dc2626",
// // //           }}
// // //         >
// // //           {error}
// // //         </span>
// // //       )}

// // //     </div>
// // //   );
// // // };

// // // export default FilterDashboard;


// // import React, {
// //   useEffect,
// //   useMemo,
// //   useState,
// // } from "react";

// // const API =
// //   "http://192.168.1.8:8000/api/v1/filters/locations/";

// // const FilterDashboard = ({
// //   data = [],
// //   value = {},
// //   onFilterChange,
// //   onReset,
// // }) => {
// //   const [locationTree, setLocationTree] = useState([]);
// //   const [locationsError, setLocationsError] = useState("");
// //   const [locationsLoading, setLocationsLoading] = useState(true);

// //   useEffect(() => {
// //     let cancelled = false;
// //     const fetchLocations = async () => {
// //       try {
// //         setLocationsLoading(true);
// //         const response = await fetch(API, {
// //           method: "GET",
// //           cache: "no-store",
// //         });

// //         if (!response.ok) {
// //           throw new Error(`HTTP ${response.status}`);
// //         }

// //         const result = await response.json();
// //         const tree = Array.isArray(result?.data) ? result.data : [];

// //         if (!cancelled) {
// //           setLocationTree(tree);
// //           setLocationsError("");
// //         }
// //       } catch (err) {
// //         console.error("LOCATIONS API ERROR:", err);
// //         if (!cancelled) {
// //           setLocationsError(
// //             err.message || "Unable to fetch filter locations."
// //           );
// //           setLocationTree([]);
// //         }
// //       } finally {
// //         if (!cancelled) setLocationsLoading(false);
// //       }
// //     };

// //     fetchLocations();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, []);

// //   const [selectedState, setSelectedState] = useState(value.state || "");
// //   const [selectedCity, setSelectedCity] = useState(value.city || "");
// //   const [selectedBranch, setSelectedBranch] = useState(value.branch || "");
// //   const [selectedFloor, setSelectedFloor] = useState(value.floor || "");
// //   useEffect(() => {
// //     setSelectedState( value.state || "" );
// //     setSelectedCity( value.city || "" );
// //     setSelectedBranch( value.branch || "" );
// //     setSelectedFloor( value.floor || "" );
// //   }, [
// //     value.state,
// //     value.city,
// //     value.branch,
// //     value.floor,
// //   ]);

// //   const states = useMemo(() => {
// //     return locationTree .map((s) => s.state_name) .filter(Boolean);
// //   }, [locationTree]);

// //   const selectedStateObj = useMemo(() => {
// //     return locationTree.find(
// //       (s) => s.state_name === selectedState
// //     );
// //   }, [locationTree, selectedState]);

// //   const cities = useMemo(() => {
// //     if (!selectedStateObj) return [];
// //     return (selectedStateObj.cities || [])
// //       .map((c) => c.city_name)
// //       .filter(Boolean);
// //   }, [selectedStateObj]);

// //   const selectedCityObj = useMemo(() => {
// //     if (!selectedStateObj) return null;
// //     return (selectedStateObj.cities || []).find(
// //       (c) => c.city_name === selectedCity
// //     );
// //   }, [selectedStateObj, selectedCity]);

// //   const branches = useMemo(() => {
// //     if (!selectedCityObj) return [];
// //     return (selectedCityObj.branches || [])
// //       .map((b) => b.branch_name)
// //       .filter(Boolean);
// //   }, [selectedCityObj]);

// //   const selectedBranchObj = useMemo(() => {
// //     if (!selectedCityObj) return null;
// //     return (selectedCityObj.branches || []).find(
// //       (b) => b.branch_name === selectedBranch
// //     );
// //   }, [selectedCityObj, selectedBranch]);

// //   const floors = useMemo(() => {
// //     if (!selectedBranchObj) return [];
// //     return (selectedBranchObj.floors || [])
// //       .map((f) => f.floor_name)
// //       .filter(Boolean);
// //   }, [selectedBranchObj]);

// //   useEffect(() => {
// //     if ( typeof onFilterChange === "function" ) {
// //       onFilterChange({
// //         state : selectedState,
// //         city : selectedCity,
// //         branch : selectedBranch,
// //         floor : selectedFloor,
// //       });
// //     }
// //   }, [
// //     selectedState,
// //     selectedCity,
// //     selectedBranch,
// //     selectedFloor,
// //     onFilterChange,
// //   ]);

// //   const handleStateChange = ( event ) => {
// //     const state =
// //       event.target.value;

// //     setSelectedState(state);
// //     setSelectedCity("");
// //     setSelectedBranch("");
// //     setSelectedFloor("");
// //   };

// //   const handleCityChange = ( event ) => {
// //     const city = event.target.value;
// //     setSelectedCity(city);
// //     setSelectedBranch("");
// //     setSelectedFloor("");
// //   };

// //   const handleBranchChange = ( event ) => {
// //     const branch = event.target.value;
// //     setSelectedBranch(branch);
// //     setSelectedFloor("");
// //   };

// //   const handleFloorChange = ( event ) => {
// //     const floor = event.target.value;
// //     setSelectedFloor(floor);
// //   };

// //   const handleReset = () => {
// //     setSelectedState("");
// //     setSelectedCity("");
// //     setSelectedBranch("");
// //     setSelectedFloor("");
// //     if ( typeof onReset === "function" ) {
// //       onReset();
// //     }
// //   };

// //   return (
// //     <div
// //       className="filter-dashboard"
// //       style={{
// //         display: "flex",
// //         alignItems: "center",
// //         gap: "10px",
// //         padding: "12px 15px",
// //         background: "#ffffff",
// //         border: "1px solid #e1e8f0",
// //         borderRadius: "8px",
// //         flexWrap: "wrap",
// //       }}
// //     >
// //       <select
// //         value={selectedState}
// //         onChange={ handleStateChange }
// //         disabled={locationsLoading}
// //         className="filter-dropdown"
// //       >
// //         <option value="">
// //           {locationsLoading
// //             ? "Loading states..."
// //             : "Select State"}
// //         </option>

// //         {states.map( (state) => (
// //             <option
// //               key={state}
// //               value={state}
// //             >
// //               {state}
// //             </option>
// //           )
// //         )}
// //       </select>

// //       <select
// //         value={selectedCity}
// //         onChange={ handleCityChange }
// //         disabled={ !selectedState }
// //         className="filter-dropdown"
// //       >
// //         <option value=""> Select City </option>
// //         {cities.map( (city) => (
// //             <option
// //               key={city}
// //               value={city}
// //             >
// //               {city}
// //             </option>
// //           )
// //         )}
// //       </select>

// //       <select
// //         value={selectedBranch}
// //         onChange={ handleBranchChange }
// //         disabled={ !selectedCity }
// //         className="filter-dropdown"
// //       >
// //         <option value=""> Select Branch </option>
// //         {branches.map( (branch) => (
// //             <option
// //               key={branch}
// //               value={branch}
// //             >
// //               {branch}
// //             </option>
// //           )
// //         )}
// //       </select>

// //       <select
// //         value={selectedFloor}
// //         onChange={ handleFloorChange }
// //         disabled={ !selectedBranch }
// //         className="filter-dropdown"
// //       >
// //         <option value=""> Select Floor </option>
// //         {floors.map( (floor) => (
// //             <option
// //               key={floor}
// //               value={floor}
// //             >
// //               {floor}
// //             </option>
// //           )
// //         )}
// //       </select>

// //       <button
// //         type="button"
// //         onClick={handleReset}
// //         style={{
// //           height: "35px",
// //           padding: "0 14px",
// //           border:"1px solid #d1d5db",
// //           borderRadius: "5px",
// //           background: "#ffffff",
// //           cursor: "pointer",
// //           fontSize: "12px",
// //         }}
// //       >
// //         Reset
// //       </button>

// //       {locationsError && (
// //         <span
// //           style={{
// //             color: "#c0392b",
// //             fontSize: "12px",
// //           }}
// //         >
// //           {locationsError}
// //         </span>
// //       )}
// //     </div>
// //   );
// // };

// // export default FilterDashboard;


// // // import React, { useState, useEffect } from 'react';

// // // const FilterDashboard = () => {
// // //     // 1. Store the full dataset from the API
// // //     const [data, setData] = useState([]);
    
// // //     // 2. Store the currently selected IDs
// // //     const [selectedState, setSelectedState] = useState('');
// // //     const [selectedCity, setSelectedCity] = useState('');
// // //     const [selectedBranch, setSelectedBranch] = useState('');
// // //     const [selectedFloor, setSelectedFloor] = useState('');

// // //     // 3. Fetch data on component mount
// // //     useEffect(() => {
// // //         fetch('http://localhost:5000/api/v1/filters/locations')
// // //         .then(res => res.json())
// // //         .then(result => {
// // //             if (result.success) setData(result.data);
// // //         })
// // //         .catch(err => console.error("Error fetching filters:", err));
// // //     }, []);

// // //     // --- CASCADING LOGIC ---

// // //     // Derive Cities based on selected State
// // //     const getCities = () => {
// // //         if (!selectedState) return [];
// // //         const stateObj = data.find(s => s.state_id === selectedState);
// // //         return stateObj ? stateObj.cities : [];
// // //     };

// // //     // Derive Branches based on selected State and City
// // //     const getBranches = () => {
// // //         if (!selectedCity) return [];
// // //         const cities = getCities();
// // //         const cityObj = cities.find(c => c.city_id === selectedCity);
// // //         return cityObj ? cityObj.branches : [];
// // //     };

// // //     // Derive Floors based on selected State, City, and Branch
// // //     const getFloors = () => {
// // //         if (!selectedBranch) return [];
// // //         const branches = getBranches();
// // //         const branchObj = branches.find(b => b.branch_id === selectedBranch);
// // //         return branchObj ? branchObj.floors : [];
// // //     };

// // //     // --- EVENT HANDLERS (Reset children when parent changes) ---

// // //     const handleStateChange = (e) => {
// // //         setSelectedState(e.target.value);
// // //         setSelectedCity('');   // Reset City
// // //         setSelectedBranch(''); // Reset Branch
// // //         setSelectedFloor('');  // Reset Floor
// // //     };

// // //     const handleCityChange = (e) => {
// // //         setSelectedCity(e.target.value);
// // //         setSelectedBranch(''); // Reset Branch
// // //         setSelectedFloor('');  // Reset Floor
// // //     };

// // //     const handleBranchChange = (e) => {
// // //         setSelectedBranch(e.target.value);
// // //         setSelectedFloor('');  // Reset Floor
// // //     };

// // //     const handleFloorChange = (e) => {
// // //         setSelectedFloor(e.target.value);
// // //     };

// // //     // --- RENDER ---
// // //     return (
// // //         <div style={{ display: 'flex', gap: '15px', padding: '20px', backgroundColor: '#f4f7fc' }}>
        
// // //         {/* STATE DROPDOWN */}
// // //         <select value={selectedState} onChange={handleStateChange} className="filter-dropdown">
// // //             <option value="">Select State</option>
// // //             {data.map(state => (
// // //             <option key={state.state_id} value={state.state_id}>
// // //                 {state.state_name}
// // //             </option>
// // //             ))}
// // //         </select>

// // //         {/* CITY DROPDOWN (Disabled if no state is selected) */}
// // //         <select 
// // //             value={selectedCity} 
// // //             onChange={handleCityChange} 
// // //             disabled={!selectedState}
// // //             className="filter-dropdown"
// // //         >
// // //             <option value="">Select City</option>
// // //             {getCities().map(city => (
// // //             <option key={city.city_id} value={city.city_id}>
// // //                 {city.city_name}
// // //             </option>
// // //             ))}
// // //         </select>

// // //         {/* BRANCH DROPDOWN (Disabled if no city is selected) */}
// // //         <select 
// // //             value={selectedBranch} 
// // //             onChange={handleBranchChange} 
// // //             disabled={!selectedCity}
// // //             className="filter-dropdown"
// // //         >
// // //             <option value="">Select Branch</option>
// // //             {getBranches().map(branch => (
// // //             <option key={branch.branch_id} value={branch.branch_id}>
// // //                 {branch.branch_name}
// // //             </option>
// // //             ))}
// // //         </select>

// // //         {/* FLOOR DROPDOWN (Disabled if no branch is selected) */}
// // //         <select 
// // //             value={selectedFloor} 
// // //             onChange={handleFloorChange} 
// // //             disabled={!selectedBranch}
// // //             className="filter-dropdown"
// // //         >
// // //             <option value="">Select Floor</option>
// // //             {getFloors().map(floor => (
// // //             <option key={floor.floor_id} value={floor.floor_id}>
// // //                 {floor.floor_name}
// // //             </option>
// // //             ))}
// // //         </select>

// // //         </div>
// // //     );
// // // };

// // // export default FilterDashboard;


// // import React, { useEffect, useMemo, useState } from "react";

// // const API_URL = "http://localhost:8000/api/ac-data/";

// // // ------------------------------------------------------
// // // Get token from localStorage
// // // Supports the common keys used by your login code.
// // // ------------------------------------------------------
// // const getToken = () => {
// //   return (
// //     localStorage.getItem("token") ||
// //     localStorage.getItem("authToken") ||
// //     localStorage.getItem("access_token") ||
// //     localStorage.getItem("accessToken") ||
// //     ""
// //   );
// // };

// // const FilterDashboard = ({ onFilterChange }) => {
// //   const [data, setData] = useState([]);

// //   const [selectedState, setSelectedState] = useState("");
// //   const [selectedCity, setSelectedCity] = useState("");
// //   const [selectedBranch, setSelectedBranch] = useState("");
// //   const [selectedFloor, setSelectedFloor] = useState("");

// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");

// //   // =====================================================
// //   // FETCH AC DATA FROM DJANGO
// //   // =====================================================

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const token = getToken();

// //         console.log(
// //           "Token available:",
// //           token ? "YES" : "NO"
// //         );

// //         const response = await fetch(
// //           `${API_URL}?t=${Date.now()}`,
// //           {
// //             method: "GET",
// //             cache: "no-store",
// //             headers: {
// //               "Content-Type": "application/json",
// //               ...(token
// //                 ? {
// //                     Authorization: `Token ${token}`,
// //                   }
// //                 : {}),
// //             },
// //           }
// //         );

// //         if (response.status === 401) {
// //           throw new Error(
// //             "401 Unauthorized - Please login again."
// //           );
// //         }

// //         if (!response.ok) {
// //           throw new Error(
// //             `HTTP ${response.status}`
// //           );
// //         }

// //         const result = await response.json();

// //         console.log(
// //           "FILTER API DATA:",
// //           result
// //         );

// //         const records = Array.isArray(result)
// //           ? result
// //           : Array.isArray(result.data)
// //           ? result.data
// //           : [];

// //         setData(records);
// //         setError("");

// //       } catch (err) {
// //         console.error(
// //           "Error fetching filter data:",
// //           err
// //         );

// //         setError(err.message);

// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchData();
// //   }, []);

// //   // =====================================================
// //   // UNIQUE VALUES HELPER
// //   // =====================================================

// //   const uniqueValues = (items, getter) => {
// //     return [
// //       ...new Set(
// //         items
// //           .map(getter)
// //           .filter(
// //             (value) =>
// //               value !== undefined &&
// //               value !== null &&
// //               String(value).trim() !== ""
// //           )
// //       ),
// //     ];
// //   };

// //   // =====================================================
// //   // STATES
// //   // =====================================================

// //   const states = useMemo(() => {
// //     return uniqueValues(
// //       data,
// //       (item) =>
// //         item.state ??
// //         item.state_name ??
// //         item.region_state
// //     );
// //   }, [data]);

// //   // =====================================================
// //   // CITIES
// //   // =====================================================

// //   const filteredByState = useMemo(() => {
// //     if (!selectedState) {
// //       return data;
// //     }

// //     return data.filter((item) => {
// //       const state =
// //         item.state ??
// //         item.state_name ??
// //         item.region_state;

// //       return String(state) === String(selectedState);
// //     });
// //   }, [data, selectedState]);

// //   const cities = useMemo(() => {
// //     return uniqueValues(
// //       filteredByState,
// //       (item) =>
// //         item.city ??
// //         item.city_name ??
// //         item.region
// //     );
// //   }, [filteredByState]);

// //   // =====================================================
// //   // BRANCHES
// //   // =====================================================

// //   const filteredByCity = useMemo(() => {
// //     if (!selectedCity) {
// //       return filteredByState;
// //     }

// //     return filteredByState.filter((item) => {
// //       const city =
// //         item.city ??
// //         item.city_name ??
// //         item.region;

// //       return String(city) === String(selectedCity);
// //     });
// //   }, [
// //     filteredByState,
// //     selectedCity,
// //   ]);

// //   const branches = useMemo(() => {
// //     return uniqueValues(
// //       filteredByCity,
// //       (item) =>
// //         item.branch ??
// //         item.branch_name
// //     );
// //   }, [filteredByCity]);

// //   // =====================================================
// //   // FLOORS
// //   // =====================================================

// //   const filteredByBranch = useMemo(() => {
// //     if (!selectedBranch) {
// //       return filteredByCity;
// //     }

// //     return filteredByCity.filter((item) => {
// //       const branch =
// //         item.branch ??
// //         item.branch_name;

// //       return (
// //         String(branch) ===
// //         String(selectedBranch)
// //       );
// //     });
// //   }, [
// //     filteredByCity,
// //     selectedBranch,
// //   ]);

// //   const floors = useMemo(() => {
// //     return uniqueValues(
// //       filteredByBranch,
// //       (item) =>
// //         item.floor ??
// //         item.floor_name
// //     );
// //   }, [filteredByBranch]);

// //   // =====================================================
// //   // SEND FILTER SELECTION TO PARENT
// //   // =====================================================

// //   useEffect(() => {
// //     if (onFilterChange) {
// //       onFilterChange({
// //         state: selectedState,
// //         city: selectedCity,
// //         branch: selectedBranch,
// //         floor: selectedFloor,
// //       });
// //     }
// //   }, [
// //     selectedState,
// //     selectedCity,
// //     selectedBranch,
// //     selectedFloor,
// //     onFilterChange,
// //   ]);

// //   // =====================================================
// //   // STATE CHANGE
// //   // =====================================================

// //   const handleStateChange = (e) => {
// //     const value = e.target.value;

// //     setSelectedState(value);
// //     setSelectedCity("");
// //     setSelectedBranch("");
// //     setSelectedFloor("");
// //   };

// //   // =====================================================
// //   // CITY CHANGE
// //   // =====================================================

// //   const handleCityChange = (e) => {
// //     const value = e.target.value;

// //     setSelectedCity(value);
// //     setSelectedBranch("");
// //     setSelectedFloor("");
// //   };

// //   // =====================================================
// //   // BRANCH CHANGE
// //   // =====================================================

// //   const handleBranchChange = (e) => {
// //     const value = e.target.value;

// //     setSelectedBranch(value);
// //     setSelectedFloor("");
// //   };

// //   // =====================================================
// //   // FLOOR CHANGE
// //   // =====================================================

// //   const handleFloorChange = (e) => {
// //     setSelectedFloor(
// //       e.target.value
// //     );
// //   };

// //   // =====================================================
// //   // RESET
// //   // =====================================================

// //   const handleReset = () => {
// //     setSelectedState("");
// //     setSelectedCity("");
// //     setSelectedBranch("");
// //     setSelectedFloor("");
// //   };

// //   // =====================================================
// //   // UI
// //   // =====================================================

// //   return (
// //     <div
// //       style={{
// //         display: "flex",
// //         alignItems: "center",
// //         gap: "10px",
// //         padding: "12px 15px",
// //         background: "#ffffff",
// //         border: "1px solid #e1e8f0",
// //         borderRadius: "8px",
// //         flexWrap: "wrap",
// //       }}
// //     >

// //       {/* STATE */}

// //       <select
// //         value={selectedState}
// //         onChange={handleStateChange}
// //         className="filter-dropdown"
// //       >
// //         <option value="">
// //           Select State
// //         </option>

// //         {states.map(
// //           (state) => (
// //             <option
// //               key={state}
// //               value={state}
// //             >
// //               {state}
// //             </option>
// //           )
// //         )}
// //       </select>


// //       {/* CITY */}

// //       <select
// //         value={selectedCity}
// //         onChange={handleCityChange}
// //         disabled={!selectedState}
// //         className="filter-dropdown"
// //       >
// //         <option value="">
// //           Select City
// //         </option>

// //         {cities.map(
// //           (city) => (
// //             <option
// //               key={city}
// //               value={city}
// //             >
// //               {city}
// //             </option>
// //           )
// //         )}
// //       </select>


// //       {/* BRANCH */}

// //       <select
// //         value={selectedBranch}
// //         onChange={handleBranchChange}
// //         disabled={!selectedCity}
// //         className="filter-dropdown"
// //       >
// //         <option value="">
// //           Select Branch
// //         </option>

// //         {branches.map(
// //           (branch) => (
// //             <option
// //               key={branch}
// //               value={branch}
// //             >
// //               {branch}
// //             </option>
// //           )
// //         )}
// //       </select>


// //       {/* FLOOR */}

// //       <select
// //         value={selectedFloor}
// //         onChange={handleFloorChange}
// //         disabled={!selectedBranch}
// //         className="filter-dropdown"
// //       >
// //         <option value="">
// //           Select Floor
// //         </option>

// //         {floors.map(
// //           (floor) => (
// //             <option
// //               key={floor}
// //               value={floor}
// //             >
// //               {floor}
// //             </option>
// //           )
// //         )}
// //       </select>


// //       {/* RESET */}

// //       <button
// //         type="button"
// //         onClick={handleReset}
// //         style={{
// //           height: "35px",
// //           padding: "0 14px",
// //           border: "1px solid #d1d5db",
// //           borderRadius: "5px",
// //           background: "#ffffff",
// //           cursor: "pointer",
// //           fontSize: "12px",
// //         }}
// //       >
// //         Reset
// //       </button>


// //       {/* STATUS */}

// //       {loading && (
// //         <span
// //           style={{
// //             fontSize: "11px",
// //             color: "#64748b",
// //           }}
// //         >
// //           Loading filters...
// //         </span>
// //       )}

// //       {error && (
// //         <span
// //           style={{
// //             fontSize: "11px",
// //             color: "#dc2626",
// //           }}
// //         >
// //           {error}
// //         </span>
// //       )}

// //     </div>
// //   );
// // };

// // export default FilterDashboard;


// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// // const API = "http://192.168.1.8:8000/api/v1/filters/locations/";
// const API = "http://192.168.1.8:8000/api/v1/filters/locations/";

// const FilterDashboard = ({
//   data = [],
//   value = {},
//   onFilterChange,
//   onReset,
// }) => {
//   const [locationTree, setLocationTree] = useState([]);
//   const [locationsError, setLocationsError] = useState("");
//   const [locationsLoading, setLocationsLoading] = useState(true);

//   useEffect(() => {
//     let cancelled = false;
//     const fetchLocations = async () => {
//       try {
//         setLocationsLoading(true);
//         const response = await fetch(API, {
//           method: "GET",
//           cache: "no-store",
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP ${response.status}`);
//         }

//         const result = await response.json();
//         const tree = Array.isArray(result?.data) ? result.data : [];

//         if (!cancelled) {
//           setLocationTree(tree);
//           setLocationsError("");
//         }
//       } catch (err) {
//         console.error("LOCATIONS API ERROR:", err);
//         if (!cancelled) {
//           setLocationsError(
//             err.message || "Unable to fetch filter locations."
//           );
//           setLocationTree([]);
//         }
//       } finally {
//         if (!cancelled) setLocationsLoading(false);
//       }
//     };

//     fetchLocations();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const [selectedZone, setSelectedZone] = useState(value.zone || "");
//   const [selectedState, setSelectedState] = useState(value.state || "");
//   const [selectedCircle, setSelectedCircle] = useState(value.circle || "");
//   const [selectedCity, setSelectedCity] = useState(value.city || "");
//   const [selectedBranch, setSelectedBranch] = useState(value.branch || "");
//   const [selectedFloor, setSelectedFloor] = useState(value.floor || "");

//   useEffect(() => {
//     setSelectedZone(value.zone || "");
//     setSelectedState(value.state || "");
//     setSelectedCircle(value.circle || "");
//     setSelectedCity(value.city || "");
//     setSelectedBranch(value.branch || "");
//     setSelectedFloor(value.floor || "");
//   }, [
//     value.zone,
//     value.state,
//     value.circle,
//     value.city,
//     value.branch,
//     value.floor,
//   ]);

//   const zones = useMemo(() => {
//     return locationTree.map((z) => z.zone_name).filter(Boolean);
//   }, [locationTree]);

//   const selectedZoneObj = useMemo(() => {
//     return locationTree.find((z) => z.zone_name === selectedZone);
//   }, [locationTree, selectedZone]);

//   const states = useMemo(() => {
//     if (!selectedZoneObj) return [];
//     return (selectedZoneObj.states || [])
//       .map((s) => s.state_name)
//       .filter(Boolean);
//   }, [selectedZoneObj]);

//   const selectedStateObj = useMemo(() => {
//     if (!selectedZoneObj) return null;
//     return (selectedZoneObj.states || []).find(
//       (s) => s.state_name === selectedState
//     );
//   }, [selectedZoneObj, selectedState]);

//   const circles = useMemo(() => {
//     if (!selectedStateObj) return [];
//     return (selectedStateObj.circles || [])
//       .map((c) => c.circle_name)
//       .filter(Boolean);
//   }, [selectedStateObj]);

//   const selectedCircleObj = useMemo(() => {
//     if (!selectedStateObj) return null;
//     return (selectedStateObj.circles || []).find(
//       (c) => c.circle_name === selectedCircle
//     );
//   }, [selectedStateObj, selectedCircle]);

//   const cities = useMemo(() => {
//     if (!selectedCircleObj) return [];
//     return (selectedCircleObj.cities || [])
//       .map((c) => c.city_name)
//       .filter(Boolean);
//   }, [selectedCircleObj]);

//   const selectedCityObj = useMemo(() => {
//     if (!selectedCircleObj) return null;
//     return (selectedCircleObj.cities || []).find(
//       (c) => c.city_name === selectedCity
//     );
//   }, [selectedCircleObj, selectedCity]);

//   const branches = useMemo(() => {
//     if (!selectedCityObj) return [];
//     return (selectedCityObj.branches || [])
//       .map((b) => b.branch_name)
//       .filter(Boolean);
//   }, [selectedCityObj]);

//   const selectedBranchObj = useMemo(() => {
//     if (!selectedCityObj) return null;
//     return (selectedCityObj.branches || []).find(
//       (b) => b.branch_name === selectedBranch
//     );
//   }, [selectedCityObj, selectedBranch]);

//   const floors = useMemo(() => {
//     if (!selectedBranchObj) return [];
//     return (selectedBranchObj.floors || [])
//       .map((f) => f.floor_name)
//       .filter(Boolean);
//   }, [selectedBranchObj]);

//   useEffect(() => {
//     if (typeof onFilterChange === "function") {
//       onFilterChange({
//         zone: selectedZone,
//         state: selectedState,
//         circle: selectedCircle,
//         city: selectedCity,
//         branch: selectedBranch,
//         floor: selectedFloor,
//       });
//     }
//   }, [
//     selectedZone,
//     selectedState,
//     selectedCircle,
//     selectedCity,
//     selectedBranch,
//     selectedFloor,
//     onFilterChange,
//   ]);

//   const handleZoneChange = (event) => {
//     setSelectedZone(event.target.value);
//     setSelectedState("");
//     setSelectedCircle("");
//     setSelectedCity("");
//     setSelectedBranch("");
//     setSelectedFloor("");
//   };

//   const handleStateChange = (event) => {
//     setSelectedState(event.target.value);
//     setSelectedCircle("");
//     setSelectedCity("");
//     setSelectedBranch("");
//     setSelectedFloor("");
//   };

//   const handleCircleChange = (event) => {
//     setSelectedCircle(event.target.value);
//     setSelectedCity("");
//     setSelectedBranch("");
//     setSelectedFloor("");
//   };

//   const handleCityChange = (event) => {
//     setSelectedCity(event.target.value);
//     setSelectedBranch("");
//     setSelectedFloor("");
//   };

//   const handleBranchChange = (event) => {
//     setSelectedBranch(event.target.value);
//     setSelectedFloor("");
//   };

//   const handleFloorChange = (event) => {
//     setSelectedFloor(event.target.value);
//   };

//   const handleReset = () => {
//     setSelectedZone("");
//     setSelectedState("");
//     setSelectedCircle("");
//     setSelectedCity("");
//     setSelectedBranch("");
//     setSelectedFloor("");
//     if (typeof onReset === "function") {
//       onReset();
//     }
//   };

//   return (
//     <div
//       className="filter-dashboard"
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: "10px",
//         padding: "12px 15px",
//         background: "#ffffff",
//         border: "1px solid #e1e8f0",
//         borderRadius: "8px",
//         flexWrap: "wrap",
//       }}
//     >
//       {/* ZONE */}
//       <select
//         value={selectedZone}
//         onChange={handleZoneChange}
//         disabled={locationsLoading}
//         className="filter-dropdown"
//       >
//         <option value="">
//           {locationsLoading ? "Loading zones..." : "Select Zone"}
//         </option>
//         {zones.map((zone) => (
//           <option key={zone} value={zone}>
//             {zone}
//           </option>
//         ))}
//       </select>

//       {/* STATE */}
//       <select
//         value={selectedState}
//         onChange={handleStateChange}
//         disabled={!selectedZone}
//         className="filter-dropdown"
//       >
//         <option value=""> Select State </option>
//         {states.map((state) => (
//           <option key={state} value={state}>
//             {state}
//           </option>
//         ))}
//       </select>

//       {/* CIRCLE */}
//       <select
//         value={selectedCircle}
//         onChange={handleCircleChange}
//         disabled={!selectedState}
//         className="filter-dropdown"
//       >
//         <option value=""> Select Circle </option>
//         {circles.map((circle) => (
//           <option key={circle} value={circle}>
//             {circle}
//           </option>
//         ))}
//       </select>

//       {/* CITY */}
//       <select
//         value={selectedCity}
//         onChange={handleCityChange}
//         disabled={!selectedCircle}
//         className="filter-dropdown"
//       >
//         <option value=""> Select City </option>
//         {cities.map((city) => (
//           <option key={city} value={city}>
//             {city}
//           </option>
//         ))}
//       </select>

//       {/* BRANCH */}
//       <select
//         value={selectedBranch}
//         onChange={handleBranchChange}
//         disabled={!selectedCity}
//         className="filter-dropdown"
//       >
//         <option value=""> Select Branch </option>
//         {branches.map((branch) => (
//           <option key={branch} value={branch}>
//             {branch}
//           </option>
//         ))}
//       </select>

//       {/* FLOOR */}
//       {/* <select
//         value={selectedFloor}
//         onChange={handleFloorChange}
//         disabled={!selectedBranch}
//         className="filter-dropdown"
//       >
//         <option value=""> Select Floor </option>
//         {floors.map((floor) => (
//           <option key={floor} value={floor}>
//             {floor}
//           </option>
//         ))}
//       </select> */}

//       <button
//         type="button"
//         onClick={handleReset}
//         style={{
//           height: "35px",
//           padding: "0 14px",
//           border: "1px solid #d1d5db",
//           borderRadius: "5px",
//           background: "#ffffff",
//           cursor: "pointer",
//           fontSize: "12px",
//         }}
//       >
//         Reset
//       </button>

//       {locationsError && (
//         <span
//           style={{
//             color: "#c0392b",
//             fontSize: "12px",
//           }}
//         >
//           {locationsError}
//         </span>
//       )}
//     </div>
//   );
// };

// export default FilterDashboard;



import React, { useEffect, useMemo, useState } from "react";

// ------------------------------------------------------------
// API
// ------------------------------------------------------------
const API_BASE = "http://localhost:8000/api/v1/filters/locations/";

// ------------------------------------------------------------
// Hierarchy definition
//
// GEOGRAPHICAL : state -> district -> taluka -> city -> branch -> floor
// ZONAL        : zone  -> circle   -> region -> division -> branch -> floor
//
// Each level has:
//   name        : key used in `selected` state
//   label       : shown in the "Select X" placeholder
//   field       : property name on the JSON node
//   childrenKey : property holding the next level (null for leaf)
// ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Fetch the tree whenever the hierarchy changes
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Compute the available options for each level
  // (based on the selections made at the levels above)
  // ------------------------------------------------------------
  const optionsByLevel = useMemo(() => {
    const result = {};
    let current = tree;

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];

      // Unique values at this level
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

      // Stop descending if nothing was picked, or we hit a leaf
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

  // ------------------------------------------------------------
  // Notify parent whenever selection changes
  // Emits: { hierarchy, state, district, taluka, city, branch, floor }
  //     or { hierarchy, zone,  circle,   region, division, branch, floor }
  // ------------------------------------------------------------
  useEffect(() => {
    if (typeof onFilterChange === "function") {
      onFilterChange({ hierarchy, ...selected });
    }
  }, [hierarchy, selected, onFilterChange]);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleChange = (levelName, value) => {
    const idx = levels.findIndex((l) => l.name === levelName);

    setSelected((prev) => {
      const next = { ...prev, [levelName]: value };
      // Clear every descendant level
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

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
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
      {/* Hierarchy toggle */}
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

      {/* Cascading dropdowns */}
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

      {/* Reset */}
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