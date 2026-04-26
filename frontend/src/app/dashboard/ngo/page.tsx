'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    try { const data = await api.getNgoMatches(); setMatches(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAction = async (matchId: string, action: string) => {
    setActionLoading(matchId);
    try { await api.acceptMatch(matchId, action); await loadMatches(); }
    catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleConfirm = async (matchId: string, qty: number) => {
    setActionLoading(matchId);
    try { await api.confirmDelivery(matchId, qty); await loadMatches(); }
    catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const pending = matches.filter(m => m.status === 'pending');
  const accepted = matches.filter(m => m.status === 'accepted');
  const delivered = matches.filter(m => m.status === 'delivered');
  const totalSaved = delivered.reduce((sum, m) => sum + m.quantity_kg, 0);

  const statusColors: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    accepted: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    picked_up: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20',
    delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const distColor = (km: number) =>
    km <= 5 ? '#10b981' : km <= 12 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative min-h-screen bg-[#0a0f1c] text-white flex overflow-x-hidden">
      {/* Background Ambience */}
      <div className="bg-glow-emerald top-[-10%] left-[10%] opacity-20" />
      <div className="bg-glow-blue bottom-[20%] right-[-5%] opacity-30" />
      
      <Sidebar />
      <main className="relative z-10 flex-1 ml-20 md:ml-[280px] p-6 lg:p-10 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-gradient">NGO Dashboard</h1>
            <p className="mt-2 text-slate-400 font-medium">Welcome back, <span className="text-emerald-400">{user?.name || 'NGO'}</span> — manage your surplus pickups.</p>
          </div>
          <button onClick={loadMatches} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-300 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <span className={loading ? "animate-spin" : ""}>🔄</span> Refresh Network
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/10" />)}
          </div>
        ) : (
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatsCard icon="📬" label="Pending Pickups" value={pending.length?.toString() || "0"} color="#f59e0b" />
              <StatsCard icon="✅" label="Accepted" value={accepted.length?.toString() || "0"} color="#3b82f6" />
              <StatsCard icon="🚚" label="Delivered" value={delivered.length?.toString() || "0"} color="#10b981" />
              <StatsCard icon="🍱" label="Food Saved (kg)" value={totalSaved.toFixed(1)} color="#d946ef" />
            </div>

            {/* Pending notifications */}
            {pending.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-3 tracking-wide text-white uppercase">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  Critical Mission Alerts
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pending.map((m, i) => (
                    <div key={i} className="glass-card p-6 border border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all transform hover:-translate-y-1 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                      
                      <div className="flex items-start justify-between mb-5 relative z-10">
                        <div>
                          <h3 className="font-bold text-lg text-white leading-tight">{m.provider_name}</h3>
                          <p className="text-sm text-slate-400 capitalize font-medium">{m.food_type}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-3 py-1 rounded-md text-[10px] font-black tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                            NEW MATCH
                          </span>
                          {m.recommendation && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${
                              m.recommendation === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                              m.recommendation === 'MEDIUM' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                              'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                              {m.recommendation} PRIORITY
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4 bg-black/20 p-4 rounded-xl border border-white/5 relative z-10">
                        <div className="text-center">
                          <p className="text-xl font-black text-fuchsia-400">{m.quantity_kg}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">KG</p>
                        </div>
                        <div className="text-center border-x border-white/5">
                          <p className="text-xl font-black text-blue-400">{m.distance_km}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">KM</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xl font-black ${m.urgency_score > 0.5 ? 'text-red-400' : 'text-amber-400'}`}>{(m.urgency_score * 10).toFixed(1)}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Urgency /10</p>
                        </div>
                      </div>

                      {/* Distance bar */}
                      <div className="mb-4 relative z-10">
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                          <span>📍 DISTANCE</span>
                          <span>{m.distance_km} km / 20 km max</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min((m.distance_km / 20) * 100, 100)}%`,
                              background: m.distance_km <= 5 ? '#10b981' : m.distance_km <= 12 ? '#f59e0b' : '#ef4444',
                              boxShadow: m.distance_km <= 5 ? '0 0 8px #10b981' : m.distance_km <= 12 ? '0 0 8px #f59e0b' : '0 0 8px #ef4444',
                            }}
                          />
                        </div>
                      </div>

                      {/* AI scores */}
                      {(m.ml_score !== undefined || m.priority_score !== undefined) && (
                        <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                          <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">🧠 ML Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-black/30 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(m.ml_score || 0) * 100}%` }} />
                              </div>
                              <span className="text-xs font-black text-violet-400">{((m.ml_score || 0) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">⚡ Priority</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-black/30 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(m.priority_score || 0) * 100}%` }} />
                              </div>
                              <span className="text-xs font-black text-blue-400">{((m.priority_score || 0) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-3 relative z-10">
                        <button onClick={() => handleAction(m.id, 'accept')} disabled={actionLoading === m.id}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-95 text-sm disabled:opacity-50">
                          {actionLoading === m.id ? 'Processing...' : '✅ Accept'}
                        </button>
                        <button onClick={() => handleAction(m.id, 'reject')} disabled={actionLoading === m.id}
                          className="flex-1 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/50 font-bold py-2.5 rounded-xl transition-all active:scale-95 text-sm disabled:opacity-50">
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All matches table */}
            <div className="glass-card border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-lg font-bold tracking-wide text-white uppercase">Operational Logistics ({matches.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-black/20 text-slate-400 text-xs uppercase font-black tracking-widest border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Provider / Location</th>
                      <th className="px-6 py-4">Provisions</th>
                      <th className="px-6 py-4 text-center">Volume (KG)</th>
                      <th className="px-6 py-4 text-center">📍 Distance</th>
                      <th className="px-6 py-4 text-center">🧠 ML Score</th>
                      <th className="px-6 py-4 text-center">⚡ Priority</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {matches.length === 0 ? (
                       <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500 font-medium">No logistics operations tracked yet.</td></tr>
                    ) : (
                      matches.map((m, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{m.provider_name}</p>
                            <p className="text-xs text-slate-500">{m.urgency_score > 0.5 ? '🔴 High Urgency' : '🟡 Standard'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-300 capitalize">{m.food_type}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-black text-fuchsia-400">{m.quantity_kg}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="font-black text-base" style={{ color: distColor(m.distance_km) }}>{m.distance_km} km</span>
                              <div className="h-1 w-16 bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{
                                  width: `${Math.min((m.distance_km / 20) * 100, 100)}%`,
                                  background: distColor(m.distance_km),
                                  boxShadow: `0 0 6px ${distColor(m.distance_km)}`,
                                }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {m.ml_score !== undefined ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <span className="font-black text-violet-400 text-sm">{((m.ml_score) * 100).toFixed(0)}%</span>
                                <div className="h-1 w-12 bg-black/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${m.ml_score * 100}%` }} />
                                </div>
                              </div>
                            ) : <span className="text-slate-600 text-xs">—</span>}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {m.priority_score !== undefined ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <span className="font-black text-blue-400 text-sm">{((m.priority_score) * 100).toFixed(0)}%</span>
                                <div className="h-1 w-12 bg-black/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.priority_score * 100}%` }} />
                                </div>
                              </div>
                            ) : <span className="text-slate-600 text-xs">—</span>}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${statusColors[m.status] || 'text-slate-400 border-slate-400/20 bg-slate-400/10'}`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {m.status === 'pending' && (
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => handleAction(m.id, 'accept')} disabled={actionLoading === m.id}
                                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                                  Accept
                                </button>
                                <button onClick={() => handleAction(m.id, 'reject')} disabled={actionLoading === m.id}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                                  Reject
                                </button>
                              </div>
                            )}
                            {m.status === 'accepted' && (
                              <button onClick={() => handleConfirm(m.id, m.quantity_kg)}
                                disabled={actionLoading === m.id}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-white/10 rounded-lg text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50">
                                ✅ Mark Delivered
                              </button>
                            )}
                            {m.status === 'delivered' && (
                              <span className="text-slate-500 text-xs font-bold uppercase">Completed</span>
                            )}
                            {m.status === 'rejected' && (
                              <span className="text-slate-500 text-xs font-bold uppercase">Dismissed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
