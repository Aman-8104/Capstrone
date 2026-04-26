'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (u?: string, p?: string) => {
    setLoading(true); setError('');
    try {
      const user = await login(u || username, p || password);
      router.push(`/dashboard/${user.role === 'ngo' ? 'ngo' : user.role}`);
    } catch (err: any) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const demoLogin = (role: string) => {
    const creds: Record<string, [string, string]> = {
      provider: ['tajhotel', 'pass123'],
      ngo: ['feedindia', 'pass123'],
      admin: ['admin', 'admin123'],
    };
    setUsername(creds[role][0]);
    setPassword(creds[role][1]);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#0a0f1c] text-white overflow-x-hidden">
      <div className="bg-glow-blue top-0 left-[-10%]" />
      <div className="bg-glow-purple bottom-0 right-[10%] opacity-60" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity cursor-pointer">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 font-extrabold text-3xl shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-6">
              S
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your SmartSurplus dashboard</p>
        </div>

        <div className="glass-card p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">{error}</div>}
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} 
                className="input-premium" placeholder="Enter username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} 
                className="input-premium" placeholder="••••••••" />
            </div>
            <button onClick={() => handleLogin()} disabled={loading}
              className="btn-primary w-full py-4 mt-2">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
          
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <span className="relative bg-[#131b2f] px-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Quick Demo</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => demoLogin('provider')} className="btn-secondary py-2.5 text-xs text-blue-300 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40">Provider</button>
            <button onClick={() => demoLogin('ngo')} className="btn-secondary py-2.5 text-xs text-emerald-300 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40">NGO</button>
            <button onClick={() => demoLogin('admin')} className="btn-secondary py-2.5 text-xs text-violet-300 border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/40">Admin</button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account? <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">Create one here</Link>
        </p>
      </div>
    </div>
  );
}
