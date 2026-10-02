import React from 'react';
import { Link } from 'react-router-dom';

export default function ResultsPage({ results, setResults }) {
  const toggleSelect = (index) => {
    const updated = [...results];
    updated[index].selected = !updated[index].selected;
    setResults(updated);
  };

  const toggleSelectAll = (status) => {
    setResults(results.map(item => ({ ...item, selected: status })));
  };

  
  const handleSmartDownload = (onlySelected = false) => {
    const targetItems = onlySelected ? results.filter(r => r.selected) : results;
    if (targetItems.length === 0) {
      alert("Please select at least one image!");
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    targetItems.forEach((item, idx) => {
      const a = document.createElement('a');
      a.href = item.secure_url;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    if (isMobile) {
      alert(`${targetItems.length} The files have been saved directly to your mobile Gallery/Downloads!`);
    } else {
      alert(`${targetItems.length} The files have been downloaded successfully!`);
    }
  };

  return (
    <div className="space-y-6 mb-20 md:mb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Processing Results & Smart Download</h2>
          <p className="text-xs text-slate-400 mt-0.5">Download directly to your mobile gallery or lapt</p>
        </div>
        {results.length > 0 && (
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button onClick={() => handleSmartDownload(true)} className="flex-1 sm:flex-none px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold">
              📥 Download Selected ({results.filter(r => r.selected).length})
            </button>
            <button onClick={() => handleSmartDownload(false)} className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold">
              📦 Download All ({results.length})
            </button>
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-xs">
          Same result <Link to="/studio" className="text-indigo-400 underline">Batch Studio</Link> Now।
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-400">Quick Select:</span>
            <button onClick={() => toggleSelectAll(true)} className="text-indigo-400 hover:underline">Select All</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => toggleSelectAll(false)} className="text-slate-400 hover:underline">Deselect All</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item, index) => (
              <div key={index} className={`bg-slate-900 border rounded-xl overflow-hidden shadow-md flex flex-col transition ${item.selected ? 'border-indigo-500' : 'border-slate-800'}`}>
                <div className="p-2.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-300 flex justify-between items-center">
                  <div className="flex items-center space-x-2 truncate">
                    <input type="checkbox" checked={item.selected} onChange={() => toggleSelect(index)} className="rounded bg-slate-900 border-slate-700 text-indigo-600 cursor-pointer" />
                    <span className="truncate">{item.filename}</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 px-2 py-0.5 bg-slate-900 rounded">{item.width}x{item.height}</span>
                </div>
                <div className="h-40 flex items-center justify-center p-2 relative" style={{ backgroundColor: item.bgType === 'color' ? item.bgColor : 'transparent' }}>
                  <img src={item.secure_url} alt="" className="max-h-full max-w-full object-contain z-10" />
                </div>
                <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p>Tags: <span className="text-indigo-300">{item.tags.join(', ')}</span></p>
                  <p>BG Removed: <span className="text-emerald-400">{item.background_removed}</span></p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}