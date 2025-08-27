import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import './CustomDropdown.css'; // Import custom dropdown styles

function HomePage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState('png');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // New state for image previews
  const fileInputRef = useRef(null); // Added fileInputRef
  const navigate = useNavigate();

  // New state for custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOptionClick = (formatOption) => {
    setOutputFormat(formatOption);
    setIsDropdownOpen(false);
  };

  const readAndPreview = (files) => {
    const previews = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target.result);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileChange = (event) => {
    const files = [...event.target.files];
    setSelectedFiles(files);
    readAndPreview(files);
  };

  

  const handleConvert = () => {
    if (selectedFiles.length > 0) {
      navigate('/convert', { state: { files: selectedFiles, format: outputFormat } });
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = [...event.dataTransfer.files];
    setSelectedFiles(files);
    readAndPreview(files);
  };

  const handleDropAreaClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container narrow-container">
      <div className="card">
        <div className="card-content">
          <span className="card-title" style={{ display: 'block', textAlign: 'center' }}>Image Converter</span>
          <div
            className={`drop-area ${isDragOver ? 'drag-over' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropAreaClick} // Added onClick handler
          >
            <p>Drag and drop images here</p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }} // Hide the input
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="image-previews" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
              {imagePreviews.map((src, index) => (
                <img key={index} src={src} alt={`preview-${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ccc', borderRadius: '5px' }} />
              ))}
            </div>
          )}

          <div className="custom-dropdown-wrapper">
            <div className="custom-dropdown-selected" onClick={toggleDropdown}>
              {outputFormat.toUpperCase()}
            </div>
            {isDropdownOpen && (
              <ul className="custom-dropdown-list">
                {['png', 'jpeg', 'webp', 'avif', 'bmp', 'gif'].map((formatOption) => (
                  <li key={formatOption} onClick={() => handleOptionClick(formatOption)}>
                    {formatOption.toUpperCase()}
                  </li>
                ))}
              </ul>
            )}
            <label className="custom-dropdown-label">Output Format</label>
          </div>
          <button className="btn waves-effect waves-light" style={{ width: '100%', display: 'block' }} onClick={handleConvert} disabled={selectedFiles.length === 0}>
            Convert
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;