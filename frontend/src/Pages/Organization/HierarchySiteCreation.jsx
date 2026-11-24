import React, { useState, useEffect, useRef } from "react";

function SearchableSelect({ value, onChange, options = [], placeholder, required, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef(null);

  // Find the currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Keep the input text in sync with the selected value
  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue("");
    }
  }, [selectedOption]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // Revert to the selected label if they click away
        if (selectedOption) {
          setInputValue(selectedOption.label);
        } else {
          setInputValue("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  // Filter options based on what the user types
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleFocus = (e) => {
    if (disabled) return;
    setIsOpen(true);
    // This highlights the text so the user can immediately start typing to search
    e.target.select();
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    
    // If the user completely clears the text, clear the selected value
    if (e.target.value === "") {
      onChange("");
    }
  };

  const handleOptionClick = (option) => {
    onChange(option.value);
    setInputValue(option.label);
    setIsOpen(false);
  };

  return (
    <div className="searchable-select-wrapper" ref={wrapperRef}>
      <div className="searchable-select-input-container">
        <input
          type="text"
          className="searchable-select-input-main"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !value}
          autoComplete="off"
        />
        <span className="searchable-select-arrow">▼</span>
      </div>

      {isOpen && (
        <div 
          className="searchable-select-dropdown"
          // Prevents the input from losing focus when clicking inside the dropdown
          onMouseDown={(e) => e.preventDefault()} 
        >
          <div className="searchable-select-options">
            {filteredOptions.length === 0 ? (
              <div className="searchable-select-no-results">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`searchable-select-option ${String(option.value) === String(value) ? "selected" : ""}`}
                  onClick={() => handleOptionClick(option)}
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