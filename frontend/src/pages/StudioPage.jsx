import React, { useState } from 'react';

export default function StudioPage() {
  const [files, setFiles] = useState([]);
  const [fixMyBatchEnabled, setFixMyBatchEnabled] = useState(true);
  const [platform, setPlatform] = useState('Custom Dimensions (Default)');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [bgType, setBgType] = useState('Original');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [processedImages, setProcessedImages] = useState([]);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
    // Jaise hi files select hongi, audit summary message dynamically change ho jayega
  };

  const handleProcessBatch = async () => {
    if (files.length === 0) {
      alert('Pehle kuch files select karein!');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('platform', platform);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('bg_type', bgType);
    formData.append('bg_color', bgColor);

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/process-images-master/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setAuditResult(data.audit_summary);
        setProcessedImages(data.data);
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Backend se connect karne me error aayi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">PixelFlow AI - Batch Studio</h2>

      {/* Upload Box */}
      <div className="mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <label className="block text-sm font-medium mb-2">
          Upload Multiple Images ({files.length} selected)
        </label>
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
        />
      </div>

      {/* Fix My Batch AI Section */}
      <div className="mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-3 mb-2">
          <input 
            type="checkbox" 
            checked={fixMyBatchEnabled} 
            onChange={(e) => setFixMyBatchEnabled(e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded"
          />
          <span className="font-semibold text-violet-400">✨ Fix My Batch (AI Auto-Audit & Fix)</span>
        </div>
        <p className="text-sm text-gray-300">
          AI automatically detects inconsistent dimensions, bad crops, backgrounds, & alignment.
        </p>
        
        {/* Dynamic Status Text */}
        <div className="mt-3 text-sm font-medium text-yellow-400 bg-gray-900 p-3 rounded border border-gray-800">
          {files.length === 0 ? (
            "Upload files above to scan batch issues..."
          ) : auditResult ? (
            `✨ ${auditResult.total_improvements} improvements found & fixed successfully!`
          ) : (
            `📁 ${files.length} file(s) ready. Click process to run AI audit.`
          )}
        </div>
      </div>

      {/* Dimensions Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
          <input 
            type="number" 
            value={width} 
            onChange={(e) => setWidth(Number(e.target.value))} 
            className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
          <input 
            type="number" 
            value={height} 
            onChange={(e) => setHeight(Number(e.target.value))} 
            className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white"
          />
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleProcessBatch}
        disabled={loading}
        className="w-full py-3 bg-violet-600 hover:bg-violet-700 font-bold rounded-lg transition disabled:opacity-50">
        {loading ? 'AI Scanning & Processing...' : '✨ Run Fix My Batch & Process'}
      </button>

      {/* Processed Results Preview */}
      {processedImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Processed Cloudinary Results:</h3>
          <div className="grid grid-cols-3 gap-4">
            {processedImages.map((img, idx) => (
              <div key={idx} className="bg-gray-800 p-3 rounded border border-gray-700">
                <img src={img.secure_url} alt="Result" className="w-full h-32 object-cover rounded mb-2" />
                <p className="text-xs text-gray-300 truncate">{img.filename}</p>
                <a href={img.secure_url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:underline block mt-1">
                  View Cloud URL
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}