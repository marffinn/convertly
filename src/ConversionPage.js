import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const tgaPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJIMTUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTkgOUgxNSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNOSA2SDE1IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMy45OTk5IDE4LjVMMTcuNSAyMkwyMSAxOC41IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNy41IDE0VjIxLjUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2EtbGluZWNhcD0icm91bmQiIHN0cm9rZS1maW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTE3IDguNVYzSDRWMjFIMTEiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==';

function ConversionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { files, format } = location.state || { files: [], format: 'png' };
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

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
  }, [files, isConverting, convertFiles, convertedFiles]);

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
        <div className="card-content">
          <span className="card-title">Converting Files...</span>
          {isConverting && progress < 100 && (
            <div>
              <div className="progress">
                <div className="determinate" style={{ width: `${progress}%`, backgroundColor: '#646cff' }}></div>
              </div>
              <span style={{ textAlign: 'center', display: 'block' }}>{`${Math.round(progress)}%`}</span>
            </div>
          )}
          {progress === 100 && (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '200px' }}> {/* Added flex styles */}
              <p>Conversion complete!</p>
              <ul className="collection" style={{ flexGrow: 1 }}> {/* Added flexGrow to push buttons down */}
                {convertedFiles.map((file, index) => (
                  <li key={index} className="collection-item">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={file.thumbnail} alt={file.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                      {file.name}
                      <a href="#!" className="secondary-content" onClick={() => saveAs(file.blob, file.name)}>
                        <i className="material-icons">file_download</i>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}> {/* Pushes buttons to the bottom and adds spacing */}
                <button className="btn waves-effect waves-light" onClick={handleDownload} disabled={convertedFiles.length === 0} style={{ width: '100%', backgroundColor: '#2196F3' }}>
                  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTYgMGgtMTBsLTYgNnYxNmw2IDZoMTBsNi02di0xNmwtNi02em0tMiAyaDJ2MmgtMnYtMnptLTQgMmgydjJoLTJ2LTJ6bS00IDJoMnYyaC0ydi0yem0xMCAwaDJ2MmgtMnYtMnptLTIgMTZoLTggdi0yaDh2MnptNCAwaC0yem0wIDBoMnYtMmgtMnYyem0wLTJoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wIDBoLTJ6bS0xNC0xNGgtMnYtMmgydjJ6bS0yIDBoMnYtMmgtMnYyem0wIDJoMnYtMmgtMnYyem0wIDRoMnYtMmgtMnYyem0wIDRoMnYtMmgtMnYyem0wIDBoMnptMTYtMTBoLTJ2LTJoMnYyem0wIDRoLTJ2LTJoMnYyem0wIDRoLTJ2LTJoMnYyem0wIDRoLTJ2LTJoMnYyem0wIDBoLTJ6bS0xMi04aC0ydjJoMnYtMnptNCAwaC0ydjJoMnYtMnptNCAwaC0ydjJoMnYtMnoiLz48L3N2Zz4=" alt="zip icon" style={{ width: '24px', height: '24px', marginRight: '10px', fill: 'white' }} />
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