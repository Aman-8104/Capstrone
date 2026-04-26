'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api, getUser } from '@/lib/api';
import { useRouter } from 'next/navigation';

type MatchResult = {
  ngo_id: string; ngo_name: string; distance_km: number; urgency_score: number;
  ml_score: number; priority_score: number; recommendation: string;
  auto_accepted: boolean; explanation: string;
  contact_email?: string; contact_phone?: string;
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

export default function UploadFoodPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    food_type: 'rice', 
    quantity_prepared: 50, 
    day_of_week: new Date().getDay(), 
    meal_type: 'lunch', 
    event_nearby: false, 
    weather: 'clear', 
    historical_avg_consumption: 40, 
    price_per_unit: 30, 
    shelf_life_hours: 8 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try { 
      await api.uploadFoodData(form); 
      setSuccess(true); 
      
      const user = getUser();
      if (user) {
        try {
          const matchData = await api.matchWithDb({
            provider_id: user.id,
            food_type: form.food_type,
            food_quantity: form.quantity_prepared,
            expiry_hours: form.shelf_life_hours,
            max_distance_km: 20,
            top_n: 5
          });
          setMatches(matchData);
        } catch (err: any) {
          console.error("Failed to find matches:", err);
          setMatches([]);
        }
      }
    }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-white/20 appearance-none";
  const labelClass = "block text-sm font-bold tracking-wide text-slate-400 mb-2 uppercase";
  const distColor = (km: number) => km <= 5 ? '#10b981' : km <= 12 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative min-h-screen bg-[#0a0f1c] text-white overflow-x-hidden flex">
      <div className="bg-glow-blue top-[10%] right-[30%] opacity-30" />
      <div className="bg-glow-purple bottom-[10%] left-[20%] opacity-20" />
      
      <Sidebar />
      <main className="relative z-10 flex-1 ml-20 md:ml-[280px] p-6 lg:p-10 transition-all">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-gradient">Data Input</h1>
          <p className="mt-2 text-slate-400 font-medium tracking-wide">Enter the food preparation details. Our Neural Network will instantly forecast surplus probability.</p>
        </div>

        {success ? (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="glass-card p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] border border-emerald-500/20">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-black mb-2 text-white tracking-tight">Data Synchronized</h2>
              <p className="text-slate-400 font-medium">Your preparation logs have been securely uploaded to the predictive network.</p>
            </div>

            {matches.length > 0 ? (
              <div className="glass-card p-8 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-2xl">🎯</span> AI Recommended Targets
                </h3>
                <div className="space-y-4">
                  {matches.map((r, i) => {
                    const rc = recColor[r.recommendation] || recColor.LOW;
                    const maxKm = 20;
                    return (
                      <div key={i}
                        className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${rc.border}`}
                        style={{ background: `${rc.glow}08`, boxShadow: `0 0 20px ${rc.glow}10` }}>

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
                        </div>

                        <div className="space-y-2.5 mb-4">
                          <ScoreBar label="🧠 ML Suitability Score" value={r.ml_score} color="#8b5cf6" />
                          <ScoreBar label="⚡ Hybrid Priority Score" value={r.priority_score} color="#3b82f6" />
                        </div>

                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-3">
                          <p className="text-[11px] text-slate-400 leading-relaxed">{r.explanation}</p>
                        </div>

                        {(r.contact_email || r.contact_phone) && (
                          <div className="flex gap-2">
                            {r.contact_email && (
                              <a href={`mailto:${r.contact_email}`} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold py-2 rounded-lg transition-colors border border-white/10">
                                <span>✉️</span> Email
                              </a>
                            )}
                            {r.contact_phone && (
                              <a href={`tel:${r.contact_phone}`} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold py-2 rounded-lg transition-colors border border-white/10">
                                <span>📞</span> Call
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 shadow-2xl text-center border-amber-500/20">
                <div className="text-4xl mb-4">📡</div>
                <h3 className="text-xl font-bold text-amber-400 mb-2">No Match Found (Yet)</h3>
                <p className="text-slate-400 font-medium">We successfully logged your food data, but right now no NGOs within a 20 km radius have the capacity to accept this donation.</p>
                <p className="text-sm text-slate-500 mt-4">The AI will continuously re-scan and notify you if a match becomes available.</p>
              </div>
            )}
            
            <div className="text-center">
               <button onClick={() => { setSuccess(false); setForm({...form}); setMatches([]); }} className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">← Submit Another Entry</button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 lg:p-10 max-w-3xl animate-fade-in shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Food Category</label>
                  <div className="relative">
                    <select value={form.food_type} onChange={e => update('food_type', e.target.value)} className={inputClass}>
                      {['rice', 'dal', 'roti', 'curry', 'biryani', 'paneer', 'salad', 'dessert', 'snacks', 'bread'].map(f => (
                        <option key={f} value={f} className="bg-slate-900 text-white">{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Volume Prepared (kg)</label>
                  <input type="number" value={form.quantity_prepared} onChange={e => update('quantity_prepared', +e.target.value)} className={inputClass} min={1} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Target Meal Phase</label>
                  <div className="relative">
                    <select value={form.meal_type} onChange={e => update('meal_type', e.target.value)} className={inputClass}>
                      <option value="breakfast" className="bg-slate-900">Breakfast (Morning)</option>
                      <option value="lunch" className="bg-slate-900">Lunch (Midday)</option>
                      <option value="dinner" className="bg-slate-900">Dinner (Evening)</option>
                      <option value="snacks" className="bg-slate-900">Snacks (Intermittent)</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Atmospheric Conditions</label>
                  <div className="relative">
                    <select value={form.weather} onChange={e => update('weather', e.target.value)} className={inputClass}>
                      <option value="clear" className="bg-slate-900">Clear Skies</option>
                      <option value="rain" className="bg-slate-900">Heavy Rainfall</option>
                      <option value="hot" className="bg-slate-900">Extreme Heat</option>
                      <option value="cold" className="bg-slate-900">Extreme Cold</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                <div>
                  <label className={labelClass}>Avg Consumption (kg)</label>
                  <input type="number" value={form.historical_avg_consumption} onChange={e => update('historical_avg_consumption', +e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cost Basis (₹/Unit)</label>
                  <input type="number" value={form.price_per_unit} onChange={e => update('price_per_unit', +e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Shelf Life (hrs)</label>
                  <input type="number" value={form.shelf_life_hours} onChange={e => update('shelf_life_hours', +e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 px-5 bg-blue-500/5 border border-blue-500/10 rounded-xl hover:bg-blue-500/10 transition-colors cursor-pointer" onClick={() => update('event_nearby', !form.event_nearby)}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${form.event_nearby ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-slate-500 bg-black/20'}`}>
                  {form.event_nearby && <span className="text-white text-sm font-bold leading-none">✓</span>}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white tracking-wide">Anomalous Local Event Detection</h4>
                  <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5">Check if there is a festival, protest, or major event nearby modifying foot traffic.</p>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-6 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 text-white border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] py-4 rounded-xl text-lg font-bold tracking-widest uppercase transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Running Prediction & AI Match...
                  </>
                ) : (
                  <>
                    <span className="text-2xl mt-[-2px]">📤</span> Transmit Logistics Data
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
