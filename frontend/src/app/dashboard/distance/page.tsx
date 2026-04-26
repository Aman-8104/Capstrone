'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

const DEMO_PROVIDER = { provider_id: 'demo-01', name: 'Demo Provider', latitude: 19.076, longitude: 72.8777, food_quantity: 45, expiry_hours: 3.5 };
const DEMO_NGOS = [
  { ngo_id: 'NGO-001', name: 'Annapurna Foundation', latitude: 19.0896, longitude: 72.8656, capacity: 100 },
  { ngo_id: 'NGO-002', name: 'Roti Bank Mumbai',     latitude: 19.0544, longitude: 72.8322, capacity: 200 },
  { ngo_id: 'NGO-003', name: 'Robin Hood Army',      latitude: 19.1136, longitude: 72.8697, capacity: 30  },
  { ngo_id: 'NGO-004', name: 'Feeding India',        latitude: 19.2183, longitude: 72.9781, capacity: 500 },
  { ngo_id: 'NGO-005', name: 'No Waste Mumbai',      latitude: 19.0633, longitude: 72.8621, capacity: 150 },
];

type NGOEntry = { ngo_id: string; name: string; latitude: string; longitude: string; capacity: string };
type MatchResult = {
  ngo_id: string; ngo_name: string; distance_km: number; urgency_score: number;
  ml_score: number; priority_score: number; recommendation: string;
  auto_accepted: boolean; explanation: string;
};

const recColor: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  HIGH:          { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: '#10b981' },
  MEDIUM:        { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30',    glow: '#3b82f6' },
  LOW:           { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30',   glow: '#f59e0b' },
  OUT_OF_RANGE:  { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/30',     glow: '#ef4444' },
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
        <span>{label}</span>
        <span style={{ color }}>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 100}%`, background: color, boxShadow: `0 0 8px ${color}80` }} />
      </div>
    </div>
  );
}

export default function DistanceCalculatorPage() {
  const [provider, setProvider] = useState({
    provider_id: '', name: '', latitude: '', longitude: '', food_quantity: '', expiry_hours: '',
  });
  const [ngos, setNgos] = useState<NGOEntry[]>([
    { ngo_id: '', name: '', latitude: '', longitude: '', capacity: '' },
  ]);
  const [maxDist, setMaxDist] = useState('20');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ran, setRan] = useState(false);

  // New states for auto-complete
  const [dbProviders, setDbProviders] = useState<any[]>([]);
  const [dbNgos, setDbNgos] = useState<any[]>([]);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showNgoDropdown, setShowNgoDropdown] = useState<number | null>(null);

  useEffect(() => {
    // Fetch data for autocomplete
    api.getProviderMarkers().then(setDbProviders).catch(console.error);
    api.getNgoMarkers().then(setDbNgos).catch(console.error);
  }, []);

  const loadDemo = () => {
    setProvider({ ...DEMO_PROVIDER, latitude: String(DEMO_PROVIDER.latitude), longitude: String(DEMO_PROVIDER.longitude), food_quantity: String(DEMO_PROVIDER.food_quantity), expiry_hours: String(DEMO_PROVIDER.expiry_hours) });
    setNgos(DEMO_NGOS.map(n => ({ ngo_id: n.ngo_id, name: n.name, latitude: String(n.latitude), longitude: String(n.longitude), capacity: String(n.capacity) })));
    setMaxDist('20');
    setResults([]); setError(''); setRan(false);
  };

  const addNgo = () => setNgos(prev => [...prev, { ngo_id: '', name: '', latitude: '', longitude: '', capacity: '' }]);
  const removeNgo = (i: number) => setNgos(prev => prev.filter((_, idx) => idx !== i));
  const updateNgo = (i: number, field: keyof NGOEntry, value: string) =>
    setNgos(prev => prev.map((n, idx) => idx === i ? { ...n, [field]: value } : n));

  const calculate = async () => {
    setError(''); setLoading(true);
    try {
      const payload = {
        provider: {
          provider_id: provider.provider_id || 'calc-provider',
          latitude: Number(provider.latitude) || 19.0760,
          longitude: Number(provider.longitude) || 72.8777,
          food_quantity: Number(provider.food_quantity) || 45,
          expiry_hours: Number(provider.expiry_hours) || 3.5,
        },
        ngos: ngos.filter(n => n.latitude && n.longitude).map((n, i) => ({
          ngo_id: n.ngo_id || `NGO-${i + 1}`,
          name: n.name || `NGO ${i + 1}`,
          latitude: Number(n.latitude),
          longitude: Number(n.longitude),
          capacity: Number(n.capacity) || 100,
        })),
        max_distance_km: Number(maxDist) || 20,
        top_n: 10,
      };
      const data = await api.getDistanceMatrix(payload);
      setResults(data);
      setRan(true);
    } catch (e: any) {
      setError(e.message || 'Calculation failed. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const distColor = (km: number) => km <= 5 ? '#10b981' : km <= 12 ? '#f59e0b' : '#ef4444';

  const selectDbProvider = (p: any) => {
    setProvider(prev => ({
      ...prev,
      provider_id: p.id,
      name: p.name,
      latitude: String(p.latitude),
      longitude: String(p.longitude),
    }));
    setShowProviderDropdown(false);
  };

  const selectDbNgo = (i: number, n: any) => {
    setNgos(prev => prev.map((ngo, idx) => idx === i ? {
      ...ngo,
      ngo_id: n.id,
      name: n.name,
      latitude: String(n.latitude),
      longitude: String(n.longitude),
      capacity: String(n.details?.capacity || 100)
    } : ngo));
    setShowNgoDropdown(null);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0f1c] text-white flex overflow-x-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed bottom-[-5%] right-[5%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />

      <Sidebar />
      <main className="relative z-10 flex-1 ml-20 md:ml-[280px] p-6 lg:p-10 transition-all">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
                  📏
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">AI Distance Calculator</h1>
              </div>
              <p className="text-slate-400 font-medium ml-13">
                Haversine-based distance engine with ML scoring — see exactly how far each NGO is and its AI priority rank.
              </p>
            </div>
            <button onClick={loadDemo}
              className="flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] whitespace-nowrap">
              🎯 Load Demo Data
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* ── LEFT: Input Form ── */}
          <div className="space-y-6">
            {/* Provider Card */}
            <div className="rounded-2xl border border-white/10 bg-[#131b2f]/80 backdrop-blur-xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs">🏢</span>
                Provider / Food Source
              </h2>
              
              <div className="mb-3 relative">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Provider Name (Search)</label>
                <input
                  type="text" placeholder="Type provider name to auto-fill..." value={provider.name}
                  onChange={e => {
                    setProvider(p => ({ ...p, name: e.target.value }));
                    setShowProviderDropdown(true);
                  }}
                  onFocus={() => setShowProviderDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProviderDropdown(false), 200)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all"
                />
                {showProviderDropdown && dbProviders.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-[#131b2f] border border-white/10 rounded-xl max-h-48 overflow-y-auto shadow-2xl">
                    {dbProviders.filter(p => p.name.toLowerCase().includes(provider.name.toLowerCase())).map((p, i) => (
                      <div key={i} onMouseDown={(e) => { e.preventDefault(); selectDbProvider(p); }}
                        className="px-4 py-2 hover:bg-blue-500/20 cursor-pointer transition-colors text-sm text-slate-300 hover:text-white border-b border-white/5 last:border-0">
                        <span className="font-bold">{p.name}</span> <span className="text-xs text-slate-500">({p.latitude}, {p.longitude})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Latitude', key: 'latitude', placeholder: '19.0760' },
                  { label: 'Longitude', key: 'longitude', placeholder: '72.8777' },
                  { label: 'Food Qty (kg)', key: 'food_quantity', placeholder: '45' },
                  { label: 'Expiry (hours)', key: 'expiry_hours', placeholder: '3.5' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                    <input
                      type="number" placeholder={placeholder} value={(provider as any)[key]}
                      onChange={e => setProvider(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Distance (km)</label>
                <input type="number" value={maxDist} onChange={e => setMaxDist(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
            </div>

            {/* NGO List */}
            <div className="rounded-2xl border border-white/10 bg-[#131b2f]/80 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs">🤝</span>
                  NGO Receivers
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (dbNgos.length > 0) {
                      setNgos(dbNgos.map(n => ({
                        ngo_id: n.id,
                        name: n.name,
                        latitude: String(n.latitude),
                        longitude: String(n.longitude),
                        capacity: String(n.details?.capacity || 100)
                      })));
                    }
                  }}
                    className="text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all">
                    + Add All DB NGOs
                  </button>
                  <button onClick={addNgo}
                    className="text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all">
                    + Add NGO
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {ngos.map((ngo, i) => (
                  <div key={i} className="bg-black/20 rounded-xl p-4 border border-white/5 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">NGO #{i + 1}</span>
                      {ngos.length > 1 && (
                        <button onClick={() => removeNgo(i)} className="text-red-400/60 hover:text-red-400 text-xs font-bold transition-colors">✕ Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 relative">
                      <div className="col-span-2 relative">
                        <input placeholder="NGO Name (Search)" value={ngo.name} 
                          onChange={e => {
                            updateNgo(i, 'name', e.target.value);
                            setShowNgoDropdown(i);
                          }}
                          onFocus={() => setShowNgoDropdown(i)}
                          onBlur={() => setTimeout(() => setShowNgoDropdown(null), 200)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 transition-all" />
                        
                        {showNgoDropdown === i && dbNgos.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-[#131b2f] border border-white/10 rounded-xl max-h-48 overflow-y-auto shadow-2xl">
                            {dbNgos.filter(n => n.name.toLowerCase().includes(ngo.name.toLowerCase())).map((n, idx) => (
                              <div key={idx} onMouseDown={(e) => { e.preventDefault(); selectDbNgo(i, n); }}
                                className="px-4 py-2 hover:bg-emerald-500/20 cursor-pointer transition-colors text-sm text-slate-300 hover:text-white border-b border-white/5 last:border-0">
                                <span className="font-bold">{n.name}</span> <span className="text-xs text-slate-500">({n.latitude}, {n.longitude}) - Cap: {n.details?.capacity || 100}kg</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {(['latitude', 'longitude'] as const).map(f => (
                        <input key={f} placeholder={f === 'latitude' ? 'Latitude' : 'Longitude'} type="number"
                          value={ngo[f]} onChange={e => updateNgo(i, f, e.target.value)}
                          className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 transition-all" />
                      ))}
                      <div className="col-span-2">
                        <input placeholder="Capacity (kg)" type="number" value={ngo.capacity} onChange={e => updateNgo(i, 'capacity', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <button onClick={calculate} disabled={loading || !provider.latitude || !provider.longitude}
              className="w-full py-4 rounded-2xl font-black text-lg tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(59,130,246,0.4)',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Running Haversine + AI Engine...
                </span>
              ) : '🚀 Calculate Distances & AI Scores'}
            </button>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 font-medium">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* ── RIGHT: Results Panel ── */}
          <div>
            {!ran && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-white/10">
                <div className="text-6xl mb-4">📡</div>
                <h3 className="text-lg font-bold text-white mb-2">Ready to Calculate</h3>
                <p className="text-slate-500 text-sm max-w-xs">Enter provider coordinates + NGO locations, then click Calculate — or load Demo Data for a quick Mumbai example.</p>
              </div>
            )}

            {ran && results.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-red-500/20">
                <div className="text-5xl mb-4">🚫</div>
                <p className="text-red-400 font-bold">No results returned. Check your coordinates.</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                    {results.length} NGO{results.length > 1 ? 's' : ''} Ranked by Distance
                  </h2>
                  <span className="text-xs text-slate-600 font-bold">Sorted: nearest → farthest</span>
                </div>

                {results.map((r, i) => {
                  const rc = recColor[r.recommendation] || recColor.LOW;
                  const maxKm = Number(maxDist) || 20;
                  return (
                    <div key={i}
                      className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${rc.border}`}
                      style={{ background: `${rc.glow}08`, boxShadow: `0 0 20px ${rc.glow}10` }}>

                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                            style={{ background: `${rc.glow}20`, color: rc.glow }}>
                            #{i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{r.ngo_name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{r.ngo_id}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border ${rc.bg} ${rc.text} ${rc.border}`}>
                            {r.recommendation}
                          </span>
                          {r.auto_accepted && (
                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              ✅ AUTO-ACCEPT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Distance row */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">📍 Distance</span>
                          <span className="font-black text-lg" style={{ color: distColor(r.distance_km) }}>
                            {r.distance_km} km
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min((r.distance_km / maxKm) * 100, 100)}%`,
                              background: distColor(r.distance_km),
                              boxShadow: `0 0 10px ${distColor(r.distance_km)}80`,
                            }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                          <span>0 km</span>
                          <span>{maxKm} km limit</span>
                        </div>
                      </div>

                      {/* Score bars */}
                      <div className="space-y-2.5 mb-4">
                        <ScoreBar label="🧠 ML Suitability Score" value={r.ml_score} color="#8b5cf6" />
                        <ScoreBar label="⚡ Hybrid Priority Score" value={r.priority_score} color="#3b82f6" />
                        <ScoreBar label="🔥 Urgency Score" value={r.urgency_score} color={r.urgency_score > 0.5 ? '#ef4444' : '#f59e0b'} />
                      </div>

                      {/* Explanation */}
                      <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                        <p className="text-[11px] text-slate-400 leading-relaxed">{r.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
