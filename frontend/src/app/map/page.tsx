'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/Map'), {
  ssr: false
});

const GoogleMap = dynamic(() => import('@/components/GoogleMapWrapper'), {
  ssr: false
});

const MUMBAI_CENTER = { lat: 19.076, lng: 72.8777 };

export default function MapPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [showProviders, setShowProviders] = useState(true);
  const [showNgos, setShowNgos] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if API key is valid (not empty string)
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const useGoogleMaps = googleMapsKey && googleMapsKey.trim().length > 0;

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, n, h] = await Promise.all([
        api.getProviderMarkers(), api.getNgoMarkers(), api.getHotspots()
      ]);
      setProviders(p); setNgos(n); setHotspots(h);
    } catch (err) { 
      console.error(err); 
      setError('Failed to fetch geospatial data from the neural network.');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0f1c] text-white flex overflow-x-hidden">
      {/* Background Ambience */}
      <div className="bg-glow-purple top-[5%] right-[20%] opacity-40" />
      <div className="bg-glow-blue bottom-[10%] left-[5%] opacity-30" />

      <Sidebar />
      <main className="relative z-10 flex-1 ml-20 md:ml-[280px] p-6 lg:p-10 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-gradient">Live Network Map</h1>
            <p className="mt-2 text-slate-400 font-medium">Real-time geospatial tracking of providers, NGOs, and waste hotspots.</p>
          </div>

          {/* Layer toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setShowProviders(!showProviders)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${showProviders ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
              <span className={showProviders ? '' : 'grayscale opacity-50'}>🍽️</span> Providers
            </button>
            <button onClick={() => setShowNgos(!showNgos)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${showNgos ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
              <span className={showNgos ? '' : 'grayscale opacity-50'}>🏢</span> NGOs
            </button>
            <button onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${showHeatmap ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
              <span className={showHeatmap ? '' : 'grayscale opacity-50'}>🔥</span> Hotspots
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Map */}
          <div className="glass-card overflow-hidden h-[600px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 relative">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1c]/50">
                <span className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Satellite Data...</p>
              </div>
            ) : error ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/5 p-8 text-center">
                <span className="text-4xl mb-4">⚠️</span>
                <h3 className="text-lg font-bold text-white mb-2">Network Connection Interrupted</h3>
                <p className="text-slate-400 text-sm max-w-xs">{error}</p>
                <button onClick={loadMapData} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all">Retry Connection</button>
              </div>
            ) : useGoogleMaps ? (
              <GoogleMap
                center={MUMBAI_CENTER}
                zoom={12}
                providers={providers}
                ngos={ngos}
                hotspots={hotspots}
                showProviders={showProviders}
                showNgos={showNgos}
                showHeatmap={showHeatmap}
                onMarkerClick={(marker) => setSelectedMarker(marker)}
              />
            ) : (
              <LeafletMap
                center={MUMBAI_CENTER}
                zoom={12}
                providers={providers}
                ngos={ngos}
                hotspots={hotspots}
                showProviders={showProviders}
                showNgos={showNgos}
                showHeatmap={showHeatmap}
                onMarkerClick={(marker) => setSelectedMarker(marker)}
              />
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            {/* Legend & Engine Status */}
            <div className="glass-card p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold tracking-widest text-slate-300 uppercase">Map Status</h3>
                <div className={`h-2 w-2 rounded-full ${googleMapsKey ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 mb-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  <span>Engine</span>
                  <span className="text-blue-400">{googleMapsKey ? 'Google Vector' : 'OpenSource Leaflet'}</span>
                </div>
                {!googleMapsKey && (
                  <p className="text-[10px] text-slate-500 leading-tight">Google API Key missing in .env.local. Falling back to open engine.</p>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">Food Providers</p>
                    <p className="text-xs text-blue-400 font-medium">{providers.length} Verified Nodes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">NGOs & Shelters</p>
                    <p className="text-xs text-emerald-400 font-medium">{ngos.length} Verified Nodes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-red-500/50 bg-gradient-to-br from-red-500/40 to-orange-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                    <span className="text-sm">🔥</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">Waste Hotspots</p>
                    <p className="text-xs text-red-400 font-medium">Critical Overproduction</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Hotspots */}
            <div className="glass-card p-6 border border-white/5">
              <h3 className="text-sm font-bold tracking-widest text-slate-300 uppercase mb-4">Critical Hotspots</h3>
              <div className="space-y-4">
                {hotspots.slice(0, 5).map((h, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-white">{h.provider_name}</p>
                      <span className={`text-xs font-black ${h.intensity > 0.6 ? 'text-red-400' : 'text-amber-400'}`}>
                        {h.avg_waste_kg} kg
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#131b2f] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all group-hover:brightness-125" style={{
                        width: `${h.intensity * 100}%`,
                        background: h.intensity > 0.6 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #f59e0b)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
