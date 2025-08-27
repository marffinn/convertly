import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Jimp } from 'jimp'; // Import Jimp as a named export

function ConversionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { files, format } = location.state || { files: [], format: 'png' };
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  const convertFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => { // Made onload async
        const fileName = file.name.replace(/\.[^/.]+$/, `.${format}`);

        if (format === 'avif') {
          // Fallback to canvas for AVIF as Jimp doesn't support it
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              resolve({ name: fileName, blob });
            }, `image/${format}`);
          };
          img.onerror = reject;
          img.src = event.target.result;
        } else {
          try {
            const image = await Jimp.read(event.target.result); // Pass data URL to Jimp.read
            let mimeType;
            switch (format) {
              case 'jpeg':
                mimeType = Jimp.MIME_JPEG;
                break;
              case 'png':
                mimeType = Jimp.MIME_PNG;
                break;
              case 'webp':
                mimeType = Jimp.MIME_WEBP;
                break;
              case 'bmp':
                mimeType = Jimp.MIME_BMP;
                break;
              case 'gif':
                mimeType = Jimp.MIME_GIF;
                break;
              default:
                mimeType = Jimp.MIME_PNG; // Default to PNG
            }
            const outputBuffer = await image.getBufferAsync(mimeType);
            const blob = new Blob([outputBuffer], { type: mimeType });
            resolve({ name: fileName, blob });
          } catch (error) {
            reject(error);
          }
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file); // Read as DataURL for Jimp
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
        <div className="card-content">
          <span className="card-title">Converting Files...</span>
          {isConverting && progress < 100 && (
            <div className="progress">
              <div className="determinate" style={{ width: `${progress}%`, backgroundColor: '#646cff' }}></div>
            </div>
          )}
          {progress === 100 && (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '200px' }}> {/* Added flex styles */}
              <p>Conversion complete!</p>
              <ul className="collection" style={{ flexGrow: 1 }}> {/* Added flexGrow to push buttons down */}
                {convertedFiles.map((file, index) => (
                  <li key={index} className="collection-item">
                    <div>
                      {file.name}
                      <a href="#!" className="secondary-content" onClick={() => saveAs(file.blob, file.name)}>
                        <i className="material-icons">file_download</i>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}> {/* Pushes buttons to the bottom and adds spacing */}
                <button className="btn waves-effect waves-light" onClick={handleDownload} disabled={convertedFiles.length === 0} style={{ width: '100%' }}>
                  Download All as ZIP
                </button>
                <button className="btn waves-effect waves-light" onClick={() => navigate('/')} style={{ width: '100%' }}>
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
