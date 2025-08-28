import React, { useState, useRef, useEffect } from 'react';
import './FormatDropdown.css';

function FormatDropdown({ formats, selectedFormat, onSelectFormat }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (format) => {
    onSelectFormat(format);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button className="dropdown-toggle" onClick={handleToggle}>
        {selectedFormat.toUpperCase()}
        <span className="material-icons">{isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
      </button>
      <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
        {formats.map((format) => (
          <a key={format} href="#!" onClick={() => handleSelect(format)}>
            {format.toUpperCase()}
          </a>
        ))}
      </div>
    </div>
  );
}

export default FormatDropdown;