'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function NgoMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNgoMatches()
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    pending:   '#f59e0b',
    accepted:  '#6e9bff',
    picked_up: '#e966ff',
    delivered: '#3fff8b',
    rejected:  '#ff716c',
  };

  const distColor = (km: number) =>
    km <= 5 ? '#10b981' : km <= 12 ? '#f59e0b' : '#ef4444';

  const recBadge: Record<string, string> = {
    HIGH:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    LOW:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1c' }}>
      <Sidebar />
      <main className="ml-20 md:ml-[280px] p-6 lg:p-10 transition-all">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">All Matches</h1>
          <p className="text-sm text-slate-400">Complete history of all surplus-to-NGO matches with AI distance scores.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-500 font-medium">No matches recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m, i) => {
              const sc = statusColors[m.status] || '#94a3b8';
              const dc = distColor(m.distance_km);
              return (
                <div key={i}
                  className="rounded-2xl border border-white/8 bg-[#131b2f]/60 backdrop-blur p-5 hover:bg-[#131b2f]/90 transition-all animate-slide-up"
                  style={{ animationDelay: `${i * 0.03}s` }}>

                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: identity */}
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${sc}15` }}>
                        {m.status === 'delivered' ? '✅' : m.status === 'accepted' ? '📦' : m.status === 'rejected' ? '✖️' : '📬'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{m.provider_name}</p>
                        <p className="text-xs text-slate-500 capitalize">{m.food_type} · {m.quantity_kg} kg</p>
                      </div>
                    </div>

                    {/* Right: status + recommendation */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {m.recommendation && recBadge[m.recommendation] && (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border ${recBadge[m.recommendation]}`}>
                          {m.recommendation} PRIORITY
                        </span>
                      )}
                      {m.auto_accepted && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✅ AUTO
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold capitalize border"
                        style={{ background: `${sc}12`, color: sc, borderColor: `${sc}25` }}>
                        {m.status}
                      </span>
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Distance */}
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">📍 Distance</p>
                      <p className="text-lg font-black" style={{ color: dc }}>{m.distance_km} km</p>
                      <div className="h-1 w-full bg-black/40 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min((m.distance_km / 20) * 100, 100)}%`,
                          background: dc,
                          boxShadow: `0 0 6px ${dc}`,
                        }} />
                      </div>
                    </div>

                    {/* Urgency */}
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">🔥 Urgency</p>
                      <p className={`text-lg font-black ${m.urgency_score > 0.5 ? 'text-red-400' : 'text-amber-400'}`}>
                        {((m.urgency_score || 0) * 10).toFixed(1)}<span className="text-xs text-slate-600">/10</span>
                      </p>
                      <div className="h-1 w-full bg-black/40 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${(m.urgency_score || 0) * 100}%`,
                          background: m.urgency_score > 0.5 ? '#ef4444' : '#f59e0b',
                        }} />
                      </div>
                    </div>

                    {/* ML Score */}
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">🧠 ML Score</p>
                      <p className="text-lg font-black text-violet-400">
                        {m.ml_score !== undefined ? `${((m.ml_score) * 100).toFixed(0)}%` : '—'}
                      </p>
                      {m.ml_score !== undefined && (
                        <div className="h-1 w-full bg-black/40 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full rounded-full bg-violet-500" style={{ width: `${m.ml_score * 100}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">⚡ Priority</p>
                      <p className="text-lg font-black text-blue-400">
                        {m.priority_score !== undefined ? `${((m.priority_score) * 100).toFixed(0)}%` : '—'}
                      </p>
                      {m.priority_score !== undefined && (
                        <div className="h-1 w-full bg-black/40 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${m.priority_score * 100}%` }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Explanation */}
                  {m.explanation && (
                    <div className="mt-3 px-3 py-2 rounded-xl bg-black/20 border border-white/5">
                      <p className="text-[11px] text-slate-500 leading-relaxed">{m.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
