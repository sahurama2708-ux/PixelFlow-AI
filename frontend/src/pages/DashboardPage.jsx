import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage({ stats }) {
  return (
    <div className="space-y-6 mb-20 md:mb-0">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2">
          <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-3 py-1 rounded-full font-semibold border border-indigo-500/30">
            Welcome to PixelFlow AI
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Transform <span className="text-indigo-400">Your Images</span> with the Power of AI
          </h2>
          <p className="text-xs text-slate-400 max-w-lg">
            Resize, remove background, generate tags and much more — all in one place. Powered by Cloudinary & FastAPI.
          </p>
          <div className="pt-2">
            <Link to="/studio" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 inline-block">
              Go to Batch Studio →
            </Link>
          </div>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center shrink-0 w-full md:w-auto">
          <p className="text-[11px] text-slate-400">Fast • Smart • Secure</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-[11px] text-slate-400">Total Processed</p>
          <h3 className="text-xl font-bold text-white mt-1">{stats.total_processed}</h3>
          <p className="text-[10px] text-emerald-400 mt-1">+12% from last week</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-[11px] text-slate-400">Images Today</p>
          <h3 className="text-xl font-bold text-white mt-1">{stats.images_today}</h3>
          <p className="text-[10px] text-emerald-400 mt-1">+8% from yesterday</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-[11px] text-slate-400">Storage Used</p>
          <h3 className="text-xl font-bold text-white mt-1">{stats.storage_used}</h3>
          <p className="text-[10px] text-slate-400 mt-1">of 10 GB</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-[11px] text-slate-400">Tags Generated</p>
          <h3 className="text-xl font-bold text-white mt-1">{stats.tags_generated}</h3>
          <p className="text-[10px] text-emerald-400 mt-1">+15% from last week</p>
        </div>
      </div>
    </div>
  );
}