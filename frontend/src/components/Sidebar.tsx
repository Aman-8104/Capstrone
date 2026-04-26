'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navItems: Record<string, { label: string; icon: string; href: string }[]> = {
  provider: [
    { label: 'Dashboard',            icon: '📊', href: '/dashboard/provider' },
    { label: 'Data Input',           icon: '📤', href: '/dashboard/provider/upload' },
    { label: 'AI Forecast',          icon: '🧠', href: '/dashboard/provider/predictions' },
    { label: 'Distance Calculator',  icon: '📏', href: '/dashboard/distance' },
    { label: 'Network Map',          icon: '🗺️', href: '/map' },
  ],
  ngo: [
    { label: 'Dashboard',            icon: '📊', href: '/dashboard/ngo' },
    { label: 'Matches',              icon: '🤝', href: '/dashboard/ngo/matches' },
    { label: 'Distance Calculator',  icon: '📏', href: '/dashboard/distance' },
    { label: 'Network Map',          icon: '🗺️', href: '/map' },
  ],
  admin: [
    { label: 'Dashboard',            icon: '📊', href: '/dashboard/admin' },
    { label: 'Users',                icon: '👥', href: '/dashboard/admin/users' },
    { label: 'Audit Logs',           icon: '📋', href: '/dashboard/admin/logs' },
    { label: 'Distance Calculator',  icon: '📏', href: '/dashboard/distance' },
    { label: 'Network Map',          icon: '🗺️', href: '/map' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role || 'provider';
  const items = navItems[role] || navItems.provider;

  return (
    <aside className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 border-r border-white/5 bg-[#131b2f]/80 backdrop-blur-xl ${collapsed ? 'w-20' : 'w-[280px]'}`}>
      <div className="flex items-center gap-4 px-6 py-8 border-b border-white/5">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 font-black text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          {!collapsed && <span className="font-bold text-lg tracking-tight text-white whitespace-nowrap overflow-hidden">SmartSurplus</span>}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-500 hover:text-white transition-colors">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
              <span className={`text-xl ${active ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</span>
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-slate-900/40">
        {!collapsed && user && (
          <div className="mb-4">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">{user.role}</p>
          </div>
        )}
        <button onClick={logout} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 transition-all">
          <span className="text-[16px]">🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
