import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function ConversionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { files, format } = location.state || { files: [], format: 'png' };
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  const convertFile = (file) => {
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
          canvas.toBlob((blob) => {
            resolve({
              name: file.name.replace(/\.[^/.]+$/, `.${format}`),
              blob,
            });
          }, `image/${format}`);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
  }, [files]);

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
              <div className="determinate" style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {progress === 100 && (
            <div>
              <p>Conversion complete!</p>
              <button className="btn waves-effect waves-light" onClick={handleDownload} disabled={convertedFiles.length === 0}>
                Download All as ZIP
              </button>
              <button className="btn waves-effect waves-light" style={{ marginLeft: '10px' }} onClick={() => navigate('/')}>
                Convert More Files
              </button>
              <ul className="collection">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversionPage;
