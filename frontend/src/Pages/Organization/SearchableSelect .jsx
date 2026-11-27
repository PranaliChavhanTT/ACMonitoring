
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