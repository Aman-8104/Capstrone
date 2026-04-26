'use client';
import React from 'react';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  colorClass?: string;
  trend?: string;
  trendUp?: boolean;
}

export default function StatsCard({ icon, label, value, colorClass = "from-blue-500 to-violet-600", trend, trendUp }: StatsCardProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass} text-2xl shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold leading-none shadow-inner
            ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-red-500/10'}`}>
            <span>{trendUp ? '↑' : '↓'}</span> {trend}
          </span>
        )}
      </div>
      <div>
        <p className="mb-1 text-3xl font-black tracking-tight text-white">{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      </div>
    </div>
  );
}
