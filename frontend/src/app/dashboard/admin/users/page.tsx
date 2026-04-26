'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.getAllUsers().then(setUsers).catch(console.error).finally(() => setLoading(false)); }, []);

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  const roleColors: Record<string, string> = { provider: '#6e9bff', ngo: '#3fff8b', admin: '#e966ff' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="ml-[260px] p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight">User Management</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>{users.length} registered users</p>
          </div>
          <div className="flex gap-2">
            {['all', 'provider', 'ngo', 'admin'].map(r => (
              <button key={r} onClick={() => setFilter(r)}
                className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  background: filter === r ? 'rgba(110, 155, 255, 0.12)' : 'var(--surface-container)',
                  color: filter === r ? 'var(--secondary)' : 'var(--on-surface-variant)',
                  border: `1px solid ${filter === r ? 'rgba(110, 155, 255, 0.25)' : 'rgba(68, 71, 86, 0.15)'}`,
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 loading-shimmer" />)}</div>
        ) : (
          <div className="glass-card-static overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['Name', 'Username', 'Email', 'Role', 'Address', 'Type'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors" style={{ borderTop: '1px solid rgba(68, 71, 86, 0.1)' }}>
                    <td className="py-3 px-4 font-medium">{u.name}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--on-surface-variant)' }}>@{u.username}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--on-surface-variant)' }}>{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
                        style={{ background: `${roleColors[u.role]}12`, color: roleColors[u.role], border: `1px solid ${roleColors[u.role]}25` }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs max-w-[150px] truncate" style={{ color: 'var(--on-surface-variant)' }}>{u.address || '-'}</td>
                    <td className="py-3 px-4 text-xs capitalize" style={{ color: 'var(--on-surface-variant)' }}>{u.provider_type || (u.capacity ? `Cap: ${u.capacity}` : '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
