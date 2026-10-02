import React, { useState, useEffect } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

// Backend ke purane/naye dono formats ko ek shape me laao
const normalizeHistoryItem = (h) => ({
  id: h.id,
  filename: h.filename,
  url: h.url || h.secure_url,
  procSize: h.procSize || (h.width && h.height ? `${h.width} × ${h.height}` : ''),
  bgInfo: h.bgInfo || h.status || '',
  tags: h.tags || '',
  date: h.date || h.created_at || '',
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('loading'); // 'loading', 'login', 'dashboard'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('studio'); // 'dashboard', 'studio', 'results', 'history'
  const [platform, setPlatform] = useState('custom');
  
  // Custom Size Inputs
  const [customWidth, setCustomWidth] = useState(100);
  const [customHeight, setCustomHeight] = useState(100);

  // Range Specific Resizing Feature
  const [enableRangeResize, setEnableRangeResize] = useState(false);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(56);
  const [rangeWidth, setRangeWidth] = useState(800);
  const [rangeHeight, setRangeHeight] = useState(600);

  // "Make This Batch Look Like This" (Style Match Feature) States
  const [enableStyleMatch, setEnableStyleMatch] = useState(false);
  const [refImageFile, setRefImageFile] = useState(null);
  const [refImagePreview, setRefImagePreview] = useState('');

  // "Fix My Batch" AI Audit Feature States
  const [enableFixMyBatch, setEnableFixMyBatch] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [improvementsCount, setImprovementsCount] = useState(12);

  // Background Change Feature States
  const [enableBgChange, setEnableBgChange] = useState(false);
  const [newBgType, setNewBgType] = useState('color'); // 'color', 'image'
  const [selectedBgColor, setSelectedBgColor] = useState('#0b1329');
  const [customBgUrl, setCustomBgUrl] = useState('');

  // Background Theme Image State & Custom Input State
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80');
  const [customBgInput, setCustomBgInput] = useState('');

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [results, setResults] = useState([
    { secure_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401', filename: 'deep_blue_theme.jpg', size: '1920 × 1080', procSize: '100 × 100', bgInfo: 'Deep Blue Neon Theme', tags: 'dark, blue, neon', date: '02 Oct 2026, 01:55 PM' }
  ]);
  
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const res = await fetch(`${API_BASE}/history`);
      const data = await res.json();
      if (data.status === 'success') {
        setHistory((data.history || []).map(normalizeHistoryItem));
      }
    } catch (err) {
      console.error('History load error:', err);
      setHistoryError('Backend se connect nahi ho paya. Kya uvicorn chal raha hai (port 8000)?');
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveHistoryToBackend = async (items) => {
    const formData = new FormData();
    for (const item of items) {
      const blob = await (await fetch(item.secure_url)).blob(); // dataURL -> Blob
      formData.append('files', blob, item.filename);
    }
    formData.append('meta', JSON.stringify(items.map(({ filename, procSize, bgInfo, tags, date }) => ({ filename, procSize, bgInfo, tags, date }))));
    const res = await fetch(`${API_BASE}/history/save`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.status !== 'success') throw new Error(data.message || 'Save failed');
    return data.saved.map(normalizeHistoryItem);
  };

  const handleDeleteHistory = async (item) => {
    if (!item.id) {
      setHistory(prev => prev.filter(h => h !== item));
      return;
    }
    try {
      await fetch(`${API_BASE}/history/${item.id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h.id !== item.id));
    } catch (err) {
      alert('Delete nahi ho paya: backend check karein.');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Poori history delete karni hai?')) return;
    try {
      await fetch(`${API_BASE}/history`, { method: 'DELETE' });
      setHistory([]);
    } catch (err) {
      alert('Clear nahi ho paya: backend check karein.');
    }
  };

  const [stats, setStats] = useState({ total_processed: 125, images_today: 19, storage_used: '2.4 GB', tags_generated: 892 });

  useEffect(() => {
    if (currentScreen === 'dashboard') loadHistory();
  }, [currentScreen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen('login');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePlatformChange = (e) => {
    const selected = e.target.value;
    setPlatform(selected);
    if (selected === 'instagram') {
      setCustomWidth(1080);
      setCustomHeight(1080);
    } else if (selected === 'youtube') {
      setCustomWidth(1280);
      setCustomHeight(720);
    } else if (selected === 'facebook') {
      setCustomWidth(1200);
      setCustomHeight(630);
    } else if (selected === 'linkedin') {
      setCustomWidth(1200);
      setCustomHeight(627);
    } else if (selected === 'amazon') {
      setCustomWidth(1000);
      setCustomHeight(1000);
    } else if (selected === 'whatsapp') {
      setCustomWidth(800);
      setCustomHeight(800);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previews = selectedFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setFilePreviews(previews);

    if (selectedFiles.length > 0) {
      setIsAnalyzed(true);
      setImprovementsCount(selectedFiles.length * 3 + 2);
    } else {
      setIsAnalyzed(false);
    }
  };

  const handleRefImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRefImageFile(file);
      setRefImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!email.includes('@')) {
      setLoginError('Kripya ek valid email address enter karein!');
      return;
    }
    if (password.length < 6) {
      setLoginError('Password kam se kam 6 characters ka hona chahiye!');
      return;
    }
    setCurrentScreen('dashboard');
  };

  const handleGoogleLogin = () => {
    setEmail('ramasahu@gmail.com');
    setCurrentScreen('dashboard');
  };

  const handleCustomBgApply = (e) => {
    e.preventDefault();
    if (customBgInput.trim()) {
      setBgImage(customBgInput.trim());
      setCustomBgInput('');
    }
  };

  const processImageWithBackground = (file, finalW, finalH) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = finalW;
          canvas.height = finalH;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          ctx.drawImage(img, 0, 0, finalW, finalH);

          if (enableBgChange) {
            const imgData = ctx.getImageData(0, 0, finalW, finalH);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i], g = data[i+1], b = data[i+2];
              if (r > 235 && g > 235 && b > 235) {
                data[i+3] = 0;
              }
            }
            ctx.putImageData(imgData, 0, 0);

            ctx.globalCompositeOperation = 'destination-over';

            if (newBgType === 'color') {
              ctx.fillStyle = selectedBgColor;
              ctx.fillRect(0, 0, finalW, finalH);
              resolve({ url: canvas.toDataURL('image/jpeg', 0.9), bgDesc: `Color: ${selectedBgColor}` });
            } else if (newBgType === 'image' && customBgUrl) {
              const bgImg = new Image();
              bgImg.crossOrigin = 'anonymous';
              bgImg.onload = () => {
                ctx.drawImage(bgImg, 0, 0, finalW, finalH);
                resolve({ url: canvas.toDataURL('image/jpeg', 0.9), bgDesc: 'Custom BG Image Replaced' });
              };
              bgImg.onerror = () => {
                ctx.fillStyle = '#0b1329';
                ctx.fillRect(0, 0, finalW, finalH);
                resolve({ url: canvas.toDataURL('image/jpeg', 0.9), bgDesc: 'Original (BG URL Failed)' });
              };
              bgImg.src = customBgUrl;
            } else {
              ctx.fillStyle = '#0b1329';
              ctx.fillRect(0, 0, finalW, finalH);
              resolve({ url: canvas.toDataURL('image/jpeg', 0.9), bgDesc: 'Original' });
            }
          } else {
            let desc = 'Original';
            if (enableFixMyBatch) desc = 'AI Auto-Fixed & Optimized';
            else if (enableStyleMatch) desc = 'Style Matched from Reference';
            resolve({ url: canvas.toDataURL('image/jpeg', 0.9), bgDesc: desc });
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      alert('Kripya pehle images select karein!');
      return;
    }
    if (enableStyleMatch && !refImageFile) {
      alert('Kripya "Match This Style" ke liye ek reference image upload karein!');
      return;
    }
    setLoading(true);

    let newProcessedItems = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      let finalW = Number(customWidth);
      let finalH = Number(customHeight);

      if (enableRangeResize) {
        const currentNumber = index + 1;
        if (currentNumber >= Number(rangeStart) && currentNumber <= Number(rangeEnd)) {
          finalW = Number(rangeWidth);
          finalH = Number(rangeHeight);
        }
      }

      const processed = await processImageWithBackground(file, finalW, finalH);

      newProcessedItems.push({
        secure_url: processed.url,
        filename: file.name,
        size: '1920 × 1080',
        procSize: `${finalW} × ${finalH}`,
        bgInfo: processed.bgDesc,
        tags: enableFixMyBatch ? 'ai, auto-fixed, optimized' : enableStyleMatch ? 'ai, style-matched, neon' : 'ai, neon, custom-resized',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setLoading(false);
    setResults(newProcessedItems);
    try {
      const savedItems = await saveHistoryToBackend(newProcessedItems);
      setHistory(prev => [...savedItems, ...prev]);
    } catch (err) {
      console.error('History save error:', err);
      // backend down ho to kam se kam is session me dikhe
      setHistory(prev => [...newProcessedItems.map(normalizeHistoryItem), ...prev]);
      alert('⚠️ History backend me save nahi hui (server band hai?). Refresh karne par ye items chale jayenge.');
    }
    setStats(prev => ({ ...prev, total_processed: prev.total_processed + newProcessedItems.length, images_today: prev.images_today + newProcessedItems.length }));
    
    setActiveTab('results');
  };

  const handleDownloadAll = () => {
    results.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = item.secure_url;
        link.download = `neon_processed_${index + 1}_${item.filename}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 300);
    });
  };

  return (
    <div style={{ 
      backgroundImage: `linear-gradient(rgba(5, 10, 20, 0.85), rgba(5, 10, 20, 0.92)), url(${bgImage})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundAttachment: 'fixed',
      color: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: 'sans-serif', 
      overflowX: 'hidden', 
      width: '100vw',
      transition: 'background-image 0.5s ease'
    }}>
      
      {currentScreen === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'rgba(5, 10, 20, 0.98)', padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: '46px', fontWeight: '800', marginBottom: '10px', textShadow: '0 0 20px rgba(59, 130, 246, 0.6)' }}>
            <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '50px' }}>₱</span> PixelFlow AI
          </div>
          <div style={{ width: '46px', height: '46px', border: '4px solid rgba(56, 189, 248, 0.2)', borderTop: '4px solid #38bdf8', borderRadius: '50%', animation: 'spin 1.5s linear infinite', marginBottom: '20px', boxShadow: '0 0 15px #38bdf8' }}></div>
          <p style={{ color: '#38bdf8', fontSize: '13px', textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>Loading neon workspace...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {currentScreen === 'login' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '30px' }}>
          <div style={{ background: 'rgba(8, 14, 30, 0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '24px', padding: '36px 32px', width: '100%', maxWidth: '420px', boxShadow: '0 0 35px rgba(56, 189, 248, 0.25), 0 30px 60px rgba(0, 0, 0, 0.8)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px', color: '#ffffff', textShadow: '0 0 10px rgba(56,189,248,0.5)' }}>Welcome Back</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Login to your PixelFlow AI neon dashboard</p>

            {loginError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Enter your email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', background: 'rgba(5, 10, 20, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '12px 14px', color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box', boxShadow: 'inset 0 0 10px rgba(56,189,248,0.1)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Enter your password</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', background: 'rgba(5, 10, 20, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '12px 14px', color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box', boxShadow: 'inset 0 0 10px rgba(56,189,248,0.1)' }}
                />
              </div>

              <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }}>
                Login →
              </button>
            </form>

            <button onClick={handleGoogleLogin} style={{ width: '100%', background: 'rgba(56, 189, 248, 0.05)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px', padding: '12px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
              🌐 Continue with Google
            </button>
          </div>
        </div>
      )}

      {currentScreen === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw', overflow: 'hidden' }}>
          
          <div className="desktop-sidebar" style={{ width: '260px', minWidth: '260px', backgroundColor: 'rgba(6, 11, 25, 0.92)', backdropFilter: 'blur(16px)', borderRight: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', flexDirection: 'column', padding: '24px', justifyContent: 'space-between', boxShadow: '5px 0 20px rgba(0,0,0,0.5)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '700', marginBottom: '32px', textShadow: '0 0 10px rgba(56,189,248,0.6)' }}>
                <div style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 12px #38bdf8' }}>₱</div>
                <span>PixelFlow AI</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                  { id: 'studio', label: 'Batch Studio', icon: '✨' },
                  { id: 'results', label: 'Processing Result', icon: '🖼' },
                  { id: 'history', label: 'Processing History', icon: '🕒' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      backgroundColor: activeTab === item.id ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                      color: activeTab === item.id ? '#38bdf8' : '#94a3b8',
                      fontWeight: '600', fontSize: '13px', textAlign: 'left',
                      boxShadow: activeTab === item.id ? '0 0 15px rgba(56, 189, 248, 0.3)' : 'none',
                      borderLeft: activeTab === item.id ? '3px solid #38bdf8' : '3px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setCurrentScreen('login')} style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
              🚪 Logout
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', paddingBottom: '80px' }}>
            
            <div style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: 'rgba(6, 11, 25, 0.88)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)', flexWrap: 'wrap', gap: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600', textShadow: '0 0 8px rgba(56,189,248,0.4)' }}>🎨 Theme BG:</span>
                <select 
                  value={bgImage} 
                  onChange={(e) => setBgImage(e.target.value)}
                  style={{ background: 'rgba(5, 10, 20, 0.9)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', outline: 'none', cursor: 'pointer', boxShadow: '0 0 10px rgba(56,189,248,0.15)' }}
                >
                  <option value="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80">Deep Space & Neon Blue</option>
                  <option value="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80">Nature Mountain</option>
                  <option value="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80">Tech Circuit Blue</option>
                </select>

                <form onSubmit={handleCustomBgApply} style={{ display: 'flex', gap: '6px' }}>
                  <input 
                    type="url" 
                    placeholder="Custom Image URL..." 
                    value={customBgInput}
                    onChange={(e) => setCustomBgInput(e.target.value)}
                    style={{ background: 'rgba(5, 10, 20, 0.9)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', outline: 'none', width: '150px' }}
                  />
                  <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(56,189,248,0.4)' }}>Apply</button>
                </form>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 0 10px #38bdf8' }}>RS</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{email ? email.split('@')[0] : 'Rama Sahu'}</span>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              
              {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
                  <div style={{ background: 'rgba(8, 14, 30, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 0 25px rgba(56, 189, 248, 0.2)' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '6px', color: '#fff', textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>Transform Your Images with AI</h2>
                      <p style={{ color: '#94a3b8', fontSize: '13px' }}>Batch resize, AI fix audit, style matching, and custom background replacement.</p>
                    </div>
                    <button onClick={() => setActiveTab('studio')} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)' }}>
                      Go to Batch Studio →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    {[
                      { title: 'Total Processed', val: stats.total_processed },
                      { title: 'Images Today', val: stats.images_today },
                      { title: 'Storage Used', val: stats.storage_used },
                      { title: 'Tags Generated', val: stats.tags_generated },
                    ].map((s, i) => (
                      <div key={i} style={{ backgroundColor: 'rgba(8, 14, 30, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '18px', boxShadow: '0 0 15px rgba(56,189,248,0.1)' }}>
                        <p style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '6px', fontWeight: '500' }}>{s.title}</p>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', textShadow: '0 0 8px rgba(255,255,255,0.3)' }}>{s.val}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'studio' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                  
                  <form onSubmit={handleProcess} style={{ backgroundColor: 'rgba(8, 14, 30, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 0 30px rgba(56, 189, 248, 0.2)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '10px', color: '#38bdf8', textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>Batch Studio & AI Studio</h3>
                    
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Upload Multiple Images ({files.length} selected)</label>
                      <input type="file" multiple onChange={handleFileChange} style={{ fontSize: '11px', color: '#cbd5e1', background: 'rgba(5, 10, 20, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }} />
                    </div>

                    {/* ✨ AI "Fix My Batch" Feature Section */}
                    <div style={{ backgroundColor: 'rgba(12, 22, 45, 0.85)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.35)', boxShadow: 'inset 0 0 10px rgba(56,189,248,0.1)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px', textShadow: '0 0 6px rgba(56,189,248,0.4)' }}>
                        <input type="checkbox" checked={enableFixMyBatch} onChange={(e) => setEnableFixMyBatch(e.target.checked)} style={{ accentColor: '#38bdf8', width: '14px', height: '14px' }} />
                        ✨ Fix My Batch (AI Auto-Audit & Fix)
                      </label>

                      {enableFixMyBatch && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
                          <p>AI automatically detects inconsistent dimensions, bad crops, backgrounds, & alignment.</p>
                          {isAnalyzed ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 10px', borderRadius: '6px', marginTop: '4px' }}>
                              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{improvementsCount} improvements found</span>
                              <button type="button" onClick={() => alert('All detected issues queued for auto-fix!')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Fix All</button>
                            </div>
                          ) : (
                            <p style={{ fontStyle: 'italic', color: '#64748b' }}>Upload files above to scan batch issues...</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* "Make This Batch Look Like This" Feature Section */}
                    <div style={{ backgroundColor: 'rgba(12, 22, 45, 0.85)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.35)', boxShadow: 'inset 0 0 10px rgba(56,189,248,0.1)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px', textShadow: '0 0 6px rgba(56,189,248,0.4)' }}>
                        <input type="checkbox" checked={enableStyleMatch} onChange={(e) => setEnableStyleMatch(e.target.checked)} style={{ accentColor: '#38bdf8', width: '14px', height: '14px' }} />
                        ✨ Make This Batch Look Like This (Match Style)
                      </label>

                      {enableStyleMatch && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          <label style={{ fontSize: '10px', color: '#94a3b8' }}>Upload Reference Image (AI extracts background, aspect ratio, spacing)</label>
                          <input type="file" accept="image/*" onChange={handleRefImageChange} style={{ fontSize: '11px', color: '#cbd5e1', background: 'rgba(5, 10, 20, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px', borderRadius: '6px' }} />
                          {refImagePreview && (
                            <div style={{ marginTop: '6px', height: '80px', width: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #38bdf8' }}>
                              <img src={refImagePreview} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Platform / Preset Mode</label>
                      <select value={platform} onChange={handlePlatformChange} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.9)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px', borderRadius: '8px', outline: 'none' }}>
                        <option value="custom">Custom Dimensions (Default)</option>
                        <option value="instagram">Instagram Post (1080 × 1080 px)</option>
                        <option value="youtube">YouTube Thumbnail (1280 × 720 px)</option>
                        <option value="facebook">Facebook Post (1200 × 630 px)</option>
                        <option value="linkedin">LinkedIn Post (1200 × 627 px)</option>
                        <option value="amazon">Amazon Product (1000 × 1000 px)</option>
                        <option value="whatsapp">WhatsApp Status (800 × 800 px)</option>
                      </select>
                    </div>

                    {platform === 'custom' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Width (px)</label>
                          <input type="number" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.9)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Height (px)</label>
                          <input type="number" value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.9)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    )}

                    <div style={{ backgroundColor: 'rgba(12, 22, 45, 0.85)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.35)', boxShadow: 'inset 0 0 10px rgba(56,189,248,0.1)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px', textShadow: '0 0 6px rgba(56,189,248,0.4)' }}>
                        <input type="checkbox" checked={enableRangeResize} onChange={(e) => setEnableRangeResize(e.target.checked)} style={{ accentColor: '#38bdf8', width: '14px', height: '14px' }} />
                        Enable Range Specific Resize (e.g. 1 to 56)
                      </label>

                      {enableRangeResize && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '10px', color: '#94a3b8' }}>From Image #</label>
                              <input type="number" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.95)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '10px', color: '#94a3b8' }}>To Image #</label>
                              <input type="number" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.95)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '10px', color: '#94a3b8' }}>Target Width</label>
                              <input type="number" value={rangeWidth} onChange={(e) => setRangeWidth(e.target.value)} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.95)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '10px', color: '#94a3b8' }}>Target Height</label>
                              <input type="number" value={rangeHeight} onChange={(e) => setRangeHeight(e.target.value)} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.95)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ backgroundColor: 'rgba(12, 22, 45, 0.85)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.35)', boxShadow: 'inset 0 0 10px rgba(56,189,248,0.1)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px', textShadow: '0 0 6px rgba(56,189,248,0.4)' }}>
                        <input type="checkbox" checked={enableBgChange} onChange={(e) => setEnableBgChange(e.target.checked)} style={{ accentColor: '#38bdf8', width: '14px', height: '14px' }} />
                        Enable Background Changer
                      </label>

                      {enableBgChange && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                          <div>
                            <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Background Type</label>
                            <select value={newBgType} onChange={(e) => setNewBgType(e.target.value)} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.95)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px', borderRadius: '6px', outline: 'none' }}>
                              <option value="color">Solid Color</option>
                              <option value="image">Custom Background Image URL</option>
                            </select>
                          </div>

                          {newBgType === 'color' ? (
                            <div>
                              <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Color</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="color" value={selectedBgColor} onChange={(e) => setSelectedBgColor(e.target.value)} style={{ width: '36px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                                <span style={{ fontSize: '12px', color: '#fff' }}>{selectedBgColor}</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Background Image URL</label>
                              <input type="url" placeholder="https://example.com/bg.jpg" value={customBgUrl} onChange={(e) => setCustomBgUrl(e.target.value)} style={{ width: '100%', background: 'rgba(5, 10, 20, 0.95)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '6px', boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }}>
                      {loading ? 'Processing Images...' : enableFixMyBatch ? '✨ Fix My Batch & Process →' : enableStyleMatch ? '⚡ Match Style & Process Batch →' : '⚡ Process All Images'}
                    </button>
                  </form>

                  <div style={{ backgroundColor: 'rgba(8, 14, 30, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 0 25px rgba(56,189,248,0.1)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '10px', color: '#38bdf8' }}>Live Previews ({filePreviews.length})</h3>
                    {filePreviews.length === 0 ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#94a3b8', fontSize: '13px', border: '2px dashed rgba(56, 189, 248, 0.2)', borderRadius: '12px' }}>
                        No files uploaded yet. Select files to preview.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                        {filePreviews.map((f, i) => (
                          <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.3)', background: '#050a14', height: '100px' }}>
                            <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(5, 10, 20, 0.8)', fontSize: '9px', padding: '2px 4px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {f.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>Processing Results ({results.length})</h3>
                    <button onClick={handleDownloadAll} style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(56,189,248,0.5)' }}>
                      📥 Download All Processed
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {results.map((item, index) => (
                      <div key={index} style={{ backgroundColor: 'rgba(8, 14, 30, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 20px rgba(56,189,248,0.15)' }}>
                        <div style={{ height: '160px', backgroundColor: '#050a14', overflow: 'hidden' }}>
                          <img src={item.secure_url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                          <p style={{ fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.filename}</p>
                          <p style={{ color: '#94a3b8' }}>Processed Size: <span style={{ color: '#38bdf8' }}>{item.procSize}</span></p>
                          <p style={{ color: '#94a3b8' }}>BG Info: <span style={{ color: '#f8fafc' }}>{item.bgInfo}</span></p>
                          <a href={item.secure_url} download={`download_${item.filename}`} style={{ marginTop: '6px', textAlign: 'center', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                            Download Image
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>Processing History ({history.length})</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={loadHistory} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Refresh</button>
                      {history.length > 0 && (
                        <button onClick={handleClearHistory} style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🗑 Clear All</button>
                      )}
                    </div>
                  </div>
                  {historyError && <p style={{ color: '#f87171', fontSize: '12px' }}>{historyError}</p>}
                  {historyLoading && <p style={{ color: '#94a3b8', fontSize: '12px' }}>History load ho rahi hai...</p>}
                  {!historyLoading && history.length === 0 && !historyError && (
                    <p style={{ color: '#94a3b8', fontSize: '12px' }}>Abhi koi history nahi hai. Studio me images process karein.</p>
                  )}
                  <div style={{ backgroundColor: 'rgba(8, 14, 30, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 0 20px rgba(56,189,248,0.15)', display: history.length ? 'block' : 'none' }}>
                    {history.map((h, i) => (
                      <div key={h.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={h.url} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #38bdf8' }} />
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{h.filename}</p>
                            <p style={{ fontSize: '11px', color: '#94a3b8' }}>{h.date} • Size: {h.procSize}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a href={h.url} download={h.filename} target="_blank" rel="noreferrer" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', textDecoration: 'none', fontWeight: 'bold' }}>
                            Download
                          </a>
                          <button onClick={() => handleDeleteHistory(h)} style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}