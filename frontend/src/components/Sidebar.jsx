import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/studio', label: 'Batch Studio', icon: '⚡' },
    { path: '/results', label: 'Results', icon: '🎯' },
    { path: '/history', label: 'Processing History', icon: '📜' },
  ];

  return (
    <>
      {/* 🖥️ Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 p-6 flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
              P
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white">PixelFlow AI</h1>
              <p className="text-[10px] text-indigo-400 font-medium">AI Media Pipeline</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {  }
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-2 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate max-w-[70px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}