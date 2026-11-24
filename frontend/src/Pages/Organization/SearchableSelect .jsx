// // import React, { useState, useEffect, useRef } from "react";

// // function SearchableSelect({ value, onChange, options = [], placeholder, required, disabled }) {
// //     const [isOpen, setIsOpen] = useState(false);
// //     const [search, setSearch] = useState("");
// //     const wrapperRef = useRef(null);

// //     // Find the currently selected option
// //     const selectedOption = options.find((opt) => String(opt.value) === String(value));

// //     // Sync input text with the selected value
// //     useEffect(() => {
// //         if (selectedOption) {
// //             setSearch(selectedOption.label);
// //         } else {
// //             setSearch("");
// //         }
// //     }, [selectedOption]);

// //     // Close dropdown when clicking outside
// //     useEffect(() => {
// //         const handleClickOutside = (event) => {
// //         if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
// //             setIsOpen(false);
// //             // Revert text to the selected option if they didn't pick anything new
// //             setSearch(selectedOption ? selectedOption.label : "");
// //         }
// //         };
// //         document.addEventListener("mousedown", handleClickOutside);
// //         return () => document.removeEventListener("mousedown", handleClickOutside);
// //     }, [selectedOption]);

// //     // Filter options as the user types
// //     const filteredOptions = options.filter((option) =>
// //         option.label.toLowerCase().includes(search.toLowerCase())
// //     );

// //     const handleFocus = (e) => {
// //         if (disabled) return;
// //         setIsOpen(true);
// //         // Highlight the text so they can instantly start typing to search
// //         e.target.select();
// //     };

// //     const handleChange = (e) => {
// //         setSearch(e.target.value);
// //         setIsOpen(true);
        
// //         // If they clear the text, clear the selection
// //         if (e.target.value === "") {
// //             onChange("");
// //         }
// //     };

// //     const handleOptionClick = (option) => {
// //         onChange(option.value);
// //         setSearch(option.label);
// //         setIsOpen(false);
// //     };

// //     return (
// //         <div className="searchable-select-wrapper" ref={wrapperRef}>
// //             {/* THIS IS THE SINGLE TEXT FIELD */}
// //             <div className="searchable-select-input-container">
// //                 <input
// //                     type="text"
// //                     className="searchable-select-input-main"
// //                     value={search}
// //                     onChange={handleChange}
// //                     onFocus={handleFocus}
// //                     placeholder={placeholder}
// //                     disabled={disabled}
// //                     required={required && !value}
// //                     autoComplete="off"
// //                 />
// //                 {/* <span className="searchable-select-arrow">▼</span> */}
// //             </div>

// //             {/* THE DROPDOWN OVERRIDES THE CONTENT BELOW */}
// //             {isOpen && (
// //                 <div 
// //                     className="searchable-select-dropdown"
// //                     onMouseDown={(e) => e.preventDefault()} // Prevents input from losing focus when clicking dropdown
// //                 >
// //                     <div className="searchable-select-options">
// //                         {filteredOptions.length === 0 ? (
// //                             <div className="searchable-select-no-results">No results found</div>
// //                         ) : (
// //                             filteredOptions.map((option) => (
// //                                 <div
// //                                     key={option.value}
// //                                     className={`searchable-select-option ${String(option.value) === String(value) ? "selected" : ""}`}
// //                                     onClick={() => handleOptionClick(option)}
// //                                 >
// //                                     {option.label}
// //                                 </div>
// //                             ))
// //                         )}
// //                     </div>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // }

// // export default SearchableSelect;


// import React, { useState, useEffect, useRef } from "react";

// function SearchableSelect({ value, onChange, options = [], placeholder, required, disabled }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const wrapperRef = useRef(null);

//   // Find the currently selected option
//   const selectedOption = options.find((opt) => String(opt.value) === String(value));

//   // Sync input text with the selected value when closed
//   useEffect(() => {
//     if (!isOpen) {
//       setSearch(selectedOption ? selectedOption.label : "");
//     }
//   }, [selectedOption, isOpen]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
//         setIsOpen(false);
//         // Revert text to selected option if they clicked away without picking
//         setSearch(selectedOption ? selectedOption.label : "");
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [selectedOption]);

//   // Filter options as the user types
//   const filteredOptions = options.filter((option) =>
//     option.label.toLowerCase().includes(search.toLowerCase())
//   );

//   const handleFocus = (e) => {
//     if (disabled) return;
//     setIsOpen(true);
//     // Highlight the text so they can instantly start typing to search
//     e.target.select(); 
//   };

//   const handleChange = (e) => {
//     setSearch(e.target.value);
//     setIsOpen(true);
    
//     // If they clear the input, clear the selection
//     if (e.target.value === "") {
//       onChange("");
//     }
//   };

//   const handleOptionClick = (option) => {
//     onChange(option.value);
//     setSearch(option.label);
//     setIsOpen(false);
//   };

//   return (
//     <div className="searchable-select-wrapper" ref={wrapperRef}>
//       {/* Unified Input Container */}
//       <div className={`searchable-select-input-container ${isOpen ? "is-open" : ""}`}>
//         <input
//           type="text"
//           className="searchable-select-input-main"
//           value={search}
//           onChange={handleChange}
//           onFocus={handleFocus}
//           placeholder={placeholder}
//           disabled={disabled}
//           required={required && !value}
//           autoComplete="off"
//         />
//         {/* <span className="searchable-select-arrow">▼</span> */}
//       </div>

//       {/* Floating Dropdown (Overrides UI below) */}
//       {isOpen && (
//         <div 
//           className="searchable-select-dropdown"
//           onMouseDown={(e) => e.preventDefault()} // Prevents input from losing focus
//         >
//           <div className="searchable-select-options">
//             {filteredOptions.length === 0 ? (
//               <div className="searchable-select-no-results">No results found</div>
//             ) : (
//               filteredOptions.map((option) => (
//                 <div
//                   key={option.value}
//                   className={`searchable-select-option ${String(option.value) === String(value) ? "selected" : ""}`}
//                   onClick={() => handleOptionClick(option)}
//                 >
//                   {option.label}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default SearchableSelect;


import React, { useState, useEffect, useRef } from "react";

function SearchableSelect({ value, onChange, options = [], placeholder, required, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Sync input text with the selected value when closed
  useEffect(() => {
    if (!isOpen) {
      setSearch(selectedOption ? selectedOption.label : "");
    }
  }, [selectedOption, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch(selectedOption ? selectedOption.label : "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  // Reset active index when search changes
  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Scroll active item into view when navigating with keyboard
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex, isOpen]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleFocus = (e) => {
    if (disabled) return;
    setIsOpen(true);
    e.target.select();
  };

  const handleChange = (e) => {
    setSearch(e.target.value);
    setIsOpen(true);
    if (e.target.value === "") {
      onChange("");
    }
  };

  const handleOptionClick = (option) => {
    onChange(option.value);
    setSearch(option.label);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        handleOptionClick(filteredOptions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearch(selectedOption ? selectedOption.label : "");
    }
  };

  return (
    <div className="searchable-select-wrapper" ref={wrapperRef}>
      <div className={`searchable-select-input-container ${isOpen ? "is-open" : ""}`}>
        <input
          type="text"
          className="searchable-select-input-main"
          value={search}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !value}
          autoComplete="off"
        />
        {/* <span className="searchable-select-arrow">▼</span> */}
      </div>

      {isOpen && (
        <div 
          className="searchable-select-dropdown"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="searchable-select-options" ref={listRef}>
            {filteredOptions.length === 0 ? (
              <div className="searchable-select-no-results">No results found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`searchable-select-option ${String(option.value) === String(value) ? "selected" : ""} ${index === activeIndex ? "active" : ""}`}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;