'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const riskColors: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
  const statusColors: Record<string, string> = { pending: '#f59e0b', accepted: '#3b82f6', delivered: '#10b981', rejected: '#ef4444' };
  const userColors: Record<string, string> = { provider: '#3b82f6', ngo: '#8b5cf6', admin: '#e879f9' };

  return (
    <div className="relative min-h-screen bg-[#0a0f1c] text-slate-50 overflow-x-hidden flex">
      {/* Background Ambience */}
      <div className="bg-glow-purple top-[5%] right-[20%] opacity-40" />
      <div className="bg-glow-blue bottom-[10%] left-[5%] opacity-30" />

      <Sidebar />
      <main className="relative z-10 flex-1 ml-20 md:ml-[280px] p-6 lg:p-10 transition-all">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">System Administration</h1>
            <p className="mt-2 text-slate-400 font-medium">Global platform overview and live redistribution node tracking.</p>
          </div>
          <button onClick={loadData} disabled={loading} className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-sm shadow-md">
            🔄 Refresh Protocol
          </button>
        </div>

        {loading || !stats ? (
          <div className="animate-pulse space-y-6">
            <div className="h-[600px] rounded-2xl bg-[#131b2f] border border-white/5" />
          </div>
        ) : (
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* System Overview */}
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Network Entities</h2>
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard icon="🏢" label="Provider Nodes" value={stats.total_providers} colorClass="from-blue-500 to-indigo-600" />
              <StatsCard icon="🤝" label="NGO Receiver Nodes" value={stats.total_ngos} colorClass="from-emerald-400 to-teal-500" />
              <StatsCard icon="📦" label="Global Food Entries" value={stats.total_food_entries} colorClass="from-violet-500 to-fuchsia-600" />
              <StatsCard icon="🧠" label="Total ML Predictions" value={stats.total_predictions} colorClass="from-amber-400 to-orange-500" />
            </div>

            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Real-time Impact Metrics</h2>
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard icon="🔄" label="Active Redistributions" value={stats.active_matches} trend="18%" trendUp colorClass="from-blue-500 to-indigo-600" />
              <StatsCard icon="✅" label="Completed Deliveries" value={stats.successful_deliveries} trend="22%" trendUp colorClass="from-emerald-400 to-teal-500" />
              <StatsCard icon="⚖️" label="Cumulative Waste Saved" value={`${stats.total_waste_saved_kg} kg`} trend="15%" trendUp colorClass="from-violet-500 to-fuchsia-600" />
              <StatsCard icon="🎯" label="System Prediction Accuracy" value={`${(stats.avg_prediction_accuracy * 100).toFixed(0)}%`} trend="4%" trendUp colorClass="from-blue-400 to-cyan-500" />
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* Top Generators Chart */}
              <div className="glass-card p-6 lg:p-8">
                <h3 className="mb-6 text-lg font-bold text-white tracking-tight">Top High-Risk Waste Generators</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.top_generators || [{provider_name: 'Taj Hotel', total_qty: 45}, {provider_name: 'City Bakery', total_qty: 25}, {provider_name: 'Event Inc', total_qty: 15}]} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="provider_name" type="category" stroke="#94a3b8" fontSize={12} width={100} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }} itemStyle={{ color: '#ef4444', fontWeight: 600 }} />
                      <Bar dataKey="total_qty" name="Waste Vol (kg)" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Chart */}
              <div className="glass-card p-6 lg:p-8">
                <h3 className="mb-6 text-lg font-bold text-white tracking-tight">Node Redistribution Status</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(stats.match_status_distribution || { pending: 15, accepted: 12, delivered: 41, rejected: 2 }).map(([name, value]) => ({ name, value }))} 
                        cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                        {Object.entries(stats.match_status_distribution || { pending: 15, accepted: 12, delivered: 41, rejected: 2 }).map(([name], i) => (
                          <Cell key={i} fill={statusColors[name] || '#334155'} style={{ filter: `drop-shadow(0 0 10px ${statusColors[name]}50)` }} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }} itemStyle={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', textTransform: 'capitalize' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
              <div className="border-b border-white/5 bg-[#131b2f]/50 p-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Recent Redistributions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#131b2f]/80 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Provider</th>
                      <th className="px-6 py-4">NGO Match</th>
                      <th className="px-6 py-4">Food Category</th>
                      <th className="px-6 py-4">Volume</th>
                      <th className="px-6 py-4">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { provider: 'Taj Hotel', ngo: 'Feed India', food: 'Rice & Curry', vol: '15kg', risk: 'high' },
                      { provider: 'City Bakery', ngo: 'Hope Shelter', food: 'Bread', vol: '8kg', risk: 'medium' },
                      { provider: 'Event Inc', ngo: 'Care Network', food: 'Mixed Meals', vol: '25kg', risk: 'high' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">{row.provider}</td>
                        <td className="px-6 py-4 text-blue-400">{row.ngo}</td>
                        <td className="px-6 py-4 capitalize">{row.food}</td>
                        <td className="px-6 py-4 font-bold text-slate-300">{row.vol}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider
                            ${row.risk === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${row.risk==='high'?'bg-red-500':'bg-amber-500'}`}></span>
                            {row.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
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
