import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as TrashIcon } from './trash-icon.svg';

function HomePage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState('png');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // New state for image previews
  const fileInputRef = useRef(null); // Added fileInputRef
  const navigate = useNavigate();

  const readAndPreview = (files) => {
    const newPreviews = [];
    const newFiles = [];
    let filesToProcess = files.length;

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const id = Date.now() + Math.random();
        reader.onload = (e) => {
          newPreviews.push({ id, src: e.target.result });
          newFiles.push({ id, file });
          if (newPreviews.length === filesToProcess) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setSelectedFiles(prev => [...prev, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        filesToProcess--;
      }
    });
  };

  const handleFileChange = (event) => {
    const files = [...event.target.files];
    readAndPreview(files);
  };

  const handleRemoveFile = (id) => {
    setImagePreviews(imagePreviews.filter(p => p.id !== id));
    setSelectedFiles(selectedFiles.filter(f => f.id !== id));
  };

  const handleConvert = () => {
    if (selectedFiles.length > 0) {
      navigate('/convert', { state: { files: selectedFiles.map(f => f.file), format: outputFormat } });
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
    readAndPreview(files);
  };

  const handleDropAreaClick = () => {
    fileInputRef.current.click();
  };

  const handleFormatSelect = (format) => {
    setOutputFormat(format);
  };

  const formats = ['png', 'jpeg', 'webp', 'avif', 'bmp', 'gif'];

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
            <div className="image-previews" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
              {imagePreviews.map((preview) => (
                <div key={preview.id} style={{ position: 'relative' }}>
                  <img src={preview.src} alt={`preview-${preview.id}`} style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px' }} />
                  <button onClick={() => handleRemoveFile(preview.id)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <TrashIcon style={{ width: '15px', height: '15px' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <p style={{ width: '100%', textAlign: 'center' }}>Select Output Format:</p>
            {formats.map((fmt) => (
              <button
                key={fmt}
                className={`btn ${outputFormat === fmt ? 'selected-format' : ''}`}
                onClick={() => handleFormatSelect(fmt)}
                style={{ margin: '5px' }}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="button" onClick={handleConvert} disabled={selectedFiles.length === 0}>
            <span className="button__text">Convert</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;