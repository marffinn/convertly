import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';



const tgaPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNCAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOGwxLTZ6Ii8+PHBhdGggZD0iTTE0IDJWMjZoMmwxLTYiLz48L3N2Zz4=';

const shortenFilename = (name, maxLength = 20) => {
  if (name.length <= maxLength) {
    return name;
  }
  const start = name.substring(0, maxLength / 2 - 1);
  const end = name.substring(name.length - maxLength / 2 + 2);
  return `${start}...${end}`;
};

function ConversionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { files, format } = location.state || { files: [], format: 'png' };
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('auto');
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    if (progress === 100 && convertedFiles.length > 0) {
      convertedFiles.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => [...prev, index]);
        }, index * 100); // Stagger by 100ms
      });
    } else if (progress < 100) {
      setVisibleItems([]); // Reset when not complete
    }
  }, [progress, convertedFiles]);

  useEffect(() => {
    if (progress === 100 && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight + 'px');
    } else if (progress < 100) {
      setContentHeight('auto'); // Reset height when not complete
    }
  }, [progress]);

  const encodeTga = (imageData) => {
    const { width, height, data } = imageData;
    const header = new Uint8Array(18);
    header[2] = 2; // Uncompressed true-color
    header[12] = width & 0xFF;
    header[13] = (width >> 8) & 0xFF;
    header[14] = height & 0xFF;
    header[15] = (height >> 8) & 0xFF;
    header[16] = 32; // 32 bits per pixel
    header[17] = 40; // 8 bits of alpha and top-left origin

    const pixelData = new Uint8Array(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      pixelData[i] = data[i + 2]; // Blue
      pixelData[i + 1] = data[i + 1]; // Green
      pixelData[i + 2] = data[i]; // Red
      pixelData[i + 3] = data[i + 3]; // Alpha
    }

    const tgaData = new Uint8Array(header.length + pixelData.length);
    tgaData.set(header, 0);
    tgaData.set(pixelData, header.length);

    return tgaData;
  };

  const convertFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          if (format === 'tga') {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const tgaData = encodeTga(imageData);
            const blob = new Blob([tgaData], { type: 'image/tga' });
            resolve({
              name: file.name.replace(/\.[^/.]+$/, '.tga'),
              blob: blob,
              thumbnail: tgaPlaceholder,
            });
          } else {
            canvas.toBlob((blob) => {
              const isUnsupportedFormat = format === 'gif' || format === 'avif';
              const newBlob = isUnsupportedFormat
                ? new Blob([blob], { type: 'application/octet-stream' })
                : blob;
              
              const thumbnailUrl = URL.createObjectURL(newBlob);

              resolve({
                name: file.name.replace(/\.[^/.]+$/, `.${format}`),
                blob: newBlob,
                thumbnail: thumbnailUrl,
              });
            }, `image/${format}`);
          }
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, [format]);

  const convertFiles = useCallback(async () => {
    const newConvertedFiles = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const convertedFile = await convertFile(files[i]);
        newConvertedFiles.push(convertedFile);
        setProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error(`Error converting ${files[i].name}:`, error);
      }
    }
    setConvertedFiles(newConvertedFiles);
  }, [files, convertFile]);

  useEffect(() => {
    if (files.length > 0 && !isConverting) {
      setIsConverting(true);
      convertFiles();
    }

    // Cleanup function to revoke object URLs
    return () => {
      convertedFiles.forEach(file => {
        if (file.thumbnail !== tgaPlaceholder) {
          URL.revokeObjectURL(file.thumbnail);
        }
      });
    };
  }, [files, isConverting, convertFiles]);

  const handleDownload = async () => {
    const zip = new JSZip();
    convertedFiles.forEach((file) => {
      zip.file(file.name, file.blob);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'converted_images.zip');
  };

  return (
    <div className="container narrow-container">
      <div className="card">
        <div className={`card-content ${progress === 100 ? 'show-complete' : ''}`}>
          <span className="card-title">Converting Files...</span>
          {isConverting && progress < 100 && (
            <div className="conversion-progress">
              <div className="progress">
                <div className="determinate" style={{ width: `${progress}%`, backgroundColor: '#646cff' }}></div>
              </div>
              <span style={{ textAlign: 'center', display: 'block' }}>{`${Math.round(progress)}%`}</span>
              
            </div>
          )}
          {progress === 100 && (
            <div ref={contentRef} className="conversion-complete" style={{ display: 'flex', flexDirection: 'column', maxHeight: contentHeight }}> {/* Added ref and dynamic maxHeight */}
              <p>Conversion complete!</p>
              <ul className="collection" style={{ flexGrow: 1 }}> {/* Added flexGrow to push buttons down */}
                {convertedFiles.map((file, index) => (
                  <li key={index} className={`collection-item ${visibleItems.includes(index) ? 'fade-in' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '50px', height: '50px', marginRight: '10px', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={file.thumbnail} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      {shortenFilename(file.name)}
                      <a href="#!" className="secondary-content" onClick={() => saveAs(file.blob, file.name)}>
                        <i className="material-icons">file_download</i>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}> {/* Pushes buttons to the bottom and adds spacing */}
                <button className="btn waves-effect waves-light" onClick={handleDownload} disabled={convertedFiles.length === 0} style={{ width: '100%', backgroundColor: '#2196F3' }}>
                  Download All as ZIP
                </button>
                <button className="btn waves-effect waves-light" onClick={() => navigate('/')} style={{ width: '100%', paddingTop: '30px', paddingBottom: '30px' }}>
                  Convert More Files
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversionPage;