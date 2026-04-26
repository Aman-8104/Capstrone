'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [food, p] = await Promise.all([api.getFoodData(), api.getPredictions()]);
      
      // Calculate stats locally since there's no provider stats API
      const total_surplus = p.reduce((sum: number, pred: any) => sum + pred.predicted_surplus_kg, 0);
      const avg_conf = p.length > 0 ? p.reduce((sum: number, pred: any) => sum + pred.confidence, 0) / p.length : 0;
      
      setStats({
        total_entries: food.length,
        total_predictions: p.length,
        total_predicted_surplus_kg: Math.round(total_surplus * 10) / 10,
        avg_confidence: avg_conf
      });
      setPredictions(p);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePredict = async () => {
    setTriggering(true);
    try {
      await api.runPrediction();
      await loadData();
    } catch (err) { console.error(err); }
    finally { setTriggering(false); }
  };

  const qtyData = predictions.slice(-7).map(p => ({
    name: p.food_type,
    actual: p.actual_quantity_kg,
    predicted: p.predicted_surplus_kg,
  }));

  const riskData = predictions.reduce((acc: any[], p: any) => {
    const existing = acc.find(a => a.name === p.waste_risk);
    if (existing) existing.value++;
    else acc.push({ name: p.waste_risk, value: 1 });
    return acc;
  }, []);

  const riskColors: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

  return (
    <div className="relative min-h-screen bg-[#0a0f1c] text-slate-50 overflow-x-hidden flex">
      {/* Background Ambience */}
      <div className="bg-glow-blue top-[10%] right-[10%] opacity-40" />
      <div className="bg-glow-purple bottom-[10%] left-[20%] opacity-30" />

      <Sidebar />
      <main className="relative z-10 flex-1 ml-20 md:ml-[280px] p-6 lg:p-10 transition-all">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Platform Dashboard</h1>
            <p className="mt-2 text-slate-400 font-medium">Welcome back, <span className="text-white">{user?.name || 'Provider'}</span>. Here's your surplus analysis.</p>
          </div>
          <button onClick={handlePredict} disabled={triggering} className="btn-primary flex items-center gap-3">
            <span className="text-lg leading-none">🧠</span>
            {triggering ? 'Running Neural Net...' : 'Run AI Prediction'}
          </button>
        </div>

        {loading || !stats ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-2xl bg-[#131b2f] border border-white/5" />
            <div className="h-[400px] rounded-2xl bg-[#131b2f] border border-white/5" />
          </div>
        ) : (
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Stats */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard icon="📦" label="Total Entries" value={stats.total_entries} trend="5%" trendUp colorClass="from-blue-500 to-indigo-600" />
              <StatsCard icon="🧠" label="AI Predictions" value={stats.total_predictions} trend="2%" trendUp colorClass="from-violet-500 to-fuchsia-600" />
              <StatsCard icon="🍱" label="Surplus Projected" value={`${stats.total_predicted_surplus_kg}kg`} colorClass="from-amber-400 to-orange-500" />
              <StatsCard icon="🎯" label="Model Confidence" value={`${(stats.avg_confidence * 100).toFixed(0)}%`} colorClass="from-emerald-400 to-teal-500" />
            </div>

            {/* Charts */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="glass-card p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">Predicted vs Actual Input (kg)</h3>
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-400 text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span> Predicted</div>
                    <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> Actual</div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qtyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }} />
                      <Bar dataKey="predicted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 lg:p-8">
                <h3 className="mb-6 text-lg font-bold text-white tracking-tight">AI Waste Risk Analysis</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                        {riskData.map((entry: any, i: number) => (
                          <Cell key={i} fill={riskColors[entry.name] || '#334155'} style={{ filter: `drop-shadow(0 0 10px ${riskColors[entry.name]}50)` }} />
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
                <h3 className="text-lg font-bold text-white tracking-tight">Recent Prediction Matrix</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#131b2f]/80 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Food Category</th>
                      <th className="px-6 py-4">Input Volume</th>
                      <th className="px-6 py-4 text-blue-400">Forecast Surplus</th>
                      <th className="px-6 py-4">Risk Level</th>
                      <th className="px-6 py-4">Model Confidence</th>
                      <th className="px-6 py-4">System Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {predictions.slice().reverse().map((p, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-semibold text-white capitalize">{p.food_type}</td>
                        <td className="px-6 py-4 text-slate-300">{p.actual_quantity_kg} kg</td>
                        <td className="px-6 py-4 font-bold text-blue-400">{p.predicted_surplus_kg} kg</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider
                            ${p.waste_risk === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                              p.waste_risk === 'medium' ? 'bg-amber-400/10 text-amber-500 border border-amber-400/20' :
                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${p.waste_risk==='high'?'bg-red-500':p.waste_risk==='medium'?'bg-amber-500':'bg-emerald-500'}`}></span>
                            {p.waste_risk}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-300">{(p.confidence_score * 100).toFixed(0)}%</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                              <div className="h-full rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${p.confidence_score * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-400">{p.recommendations[0] || 'Awaiting Routing'}</td>
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
