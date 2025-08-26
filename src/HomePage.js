import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import M from 'materialize-css';

function HomePage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState('png');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // New state for image previews
  const selectRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectRef.current) {
      M.FormSelect.init(selectRef.current);
    }
  }, []);

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

  const handleFormatChange = (event) => {
    setOutputFormat(event.target.value);
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

  return (
    <div className="container narrow-container">
      <div className="card">
        <div className="card-content">
          <span className="card-title">Image Converter</span>
          <div
            className={`drop-area ${isDragOver ? 'drag-over' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="file-field input-field">
              <div className="btn">
                <span>File</span>
                <input type="file" multiple onChange={handleFileChange} />
              </div>
              <div className="file-path-wrapper">
                <input className="file-path validate" type="text" placeholder="Select one or more files" />
              </div>
            </div>
            <p>or drag and drop images here</p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="image-previews" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
              {imagePreviews.map((src, index) => (
                <img key={index} src={src} alt={`preview-${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ccc', borderRadius: '5px' }} />
              ))}
            </div>
          )}

          <div className="input-field">
            <select ref={selectRef} value={outputFormat} onChange={handleFormatChange}>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="avif">AVIF</option>
            </select>
            <label>Output Format</label>
          </div>
          <button className="btn waves-effect waves-light" onClick={handleConvert} disabled={selectedFiles.length === 0}>
            Convert
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;