import React, { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/history')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setHistoryItems(data.history);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("History fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '24px', color: '#ffffff', backgroundColor: '#111827', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Processing History</h2>

      {loading ? (
        <p style={{ color: '#9ca3af' }}>Loading history...</p>
      ) : historyItems.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No processing history found yet. Process a batch to see results here!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {historyItems.map((item, index) => (
            <div key={index} style={{ background: '#1f2937', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
              <img src={item.secure_url} alt="History Item" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#f3f4f6', wordBreak: 'break-all' }}>{item.filename}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Resolution: {item.width} x {item.height}</p>
              <p style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>Status: {item.status}</p>
              <a href={item.secure_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#a78bfa', display: 'block', marginTop: '8px', textDecoration: 'none' }}>
                View Link ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}