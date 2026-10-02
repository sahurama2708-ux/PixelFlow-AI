import React from 'react';

export default function Header() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
        AI Media Pipeline Workspace
      </div>
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
          RS
        </div>
        <span className="text-xs font-medium text-slate-200 hidden sm:inline">Rama Sahu</span>
      </div>
    </header>
  );
}