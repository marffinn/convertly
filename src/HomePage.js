import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeTga } from '@lunapaint/tga-codec';

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

    files.forEach(file => {
      const id = Date.now() + Math.random();
      if (file.name.endsWith('.tga') || file.type === 'image/tga') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const decoded = await decodeTga(new Uint8Array(e.target.result));
            const canvas = document.createElement('canvas');
            canvas.width = decoded.image.width;
            canvas.height = decoded.image.height;
            const ctx = canvas.getContext('2d');
            const imageData = new ImageData(new Uint8ClampedArray(decoded.image.data), decoded.image.width, decoded.image.height);
            ctx.putImageData(imageData, 0, 0);
            newPreviews.push({ id, src: canvas.toDataURL() });
            newFiles.push({ id, file: new File([await (await fetch(canvas.toDataURL())).blob()], file.name, {type: 'image/png'}) });
            if (newPreviews.length === files.length) {
              setImagePreviews(prev => [...prev, ...newPreviews]);
              setSelectedFiles(prev => [...prev, ...newFiles]);
            }
          } catch (error) {
            console.error('Error decoding TGA:', error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({ id, src: e.target.result });
          newFiles.push({ id, file });
          if (newPreviews.length === files.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setSelectedFiles(prev => [...prev, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // handle non-image files if needed
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

  const formats = ['png', 'jpeg', 'webp', 'avif', 'bmp', 'gif', 'tga'];

  return (
    <div className="container narrow-container">
      <div className="card">
        <div className="card-content">
          
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
              accept="image/*,.tga"
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
            Convert
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;