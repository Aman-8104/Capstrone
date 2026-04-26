'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'provider', address: '', phone: '', latitude: 19.076, longitude: 72.8777, provider_type: 'restaurant', cuisine_type: 'Indian', capacity: 100 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await register(form);
      router.push(`/dashboard/${data.role === 'ngo' ? 'ngo' : data.role}`);
    } catch (err: any) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-white/20";
  const labelClass = "block text-xs font-bold tracking-wide text-slate-400 mb-2 uppercase";

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#0a0f1c] text-white overflow-x-hidden">
      {/* Background Ambience */}
      <div className="bg-glow-blue top-0 left-[-10%]" />
      <div className="bg-glow-purple bottom-0 right-[-10%] opacity-60" />

      <div className="relative z-10 w-full max-w-xl animate-fade-in py-12">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity cursor-pointer">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 font-extrabold text-3xl shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-6">
              S
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
          <p className="text-slate-400">Join the SmartSurplus network</p>
        </div>

        <div className="glass-card p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
          {/* Decorative blur inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">{error}</div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="John Doe" required />
              </div>
              <div>
                <label className={labelClass}>Username</label>
                <input type="text" value={form.username} onChange={e => update('username', e.target.value)} className={inputClass} placeholder="johndoe" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} placeholder="john@example.com" required />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className={inputClass} placeholder="••••••••" required />
              </div>
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <label className={labelClass}>Platform Role</label>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => update('role', 'provider')}
                  className={`py-3.5 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                    form.role === 'provider' 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'bg-[#131b2f] text-slate-400 border-white/5 hover:bg-white/5'
                  }`}>
                  <span className={form.role !== 'provider' ? 'grayscale opacity-50' : 'text-xl'}>🍽️</span> 
                  Provider
                </button>
                <button type="button" onClick={() => update('role', 'ngo')}
                  className={`py-3.5 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                    form.role === 'ngo' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-[#131b2f] text-slate-400 border-white/5 hover:bg-white/5'
                  }`}>
                  <span className={form.role !== 'ngo' ? 'grayscale opacity-50' : 'text-xl'}>🏢</span> 
                  NGO
                </button>
                <button type="button" onClick={() => update('role', 'admin')}
                  className={`py-3.5 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                    form.role === 'admin' 
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                      : 'bg-[#131b2f] text-slate-400 border-white/5 hover:bg-white/5'
                  }`}>
                  <span className={form.role !== 'admin' ? 'grayscale opacity-50' : 'text-xl'}>⚙️</span> 
                  Admin
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/5">
              <div>
                <label className={labelClass}>HQ Address</label>
                <input type="text" value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} placeholder="Mumbai Region" />
              </div>
              <div>
                <label className={labelClass}>Emergency Phone</label>
                <input type="text" value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} placeholder="+91..." />
              </div>
            </div>

            {form.role === 'provider' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-slide-up">
                <div>
                  <label className={labelClass}>Provider Category</label>
                  <div className="relative">
                    <select value={form.provider_type} onChange={e => update('provider_type', e.target.value)} className={`${inputClass} appearance-none`}>
                      <option value="restaurant" className="bg-slate-900 text-white">Restaurant</option>
                      <option value="hostel" className="bg-slate-900 text-white">Hostel/Canteen</option>
                      <option value="cloud_kitchen" className="bg-slate-900 text-white">Cloud Kitchen</option>
                      <option value="event_organizer" className="bg-slate-900 text-white">Event Organizer</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Primary Cuisine</label>
                  <input type="text" value={form.cuisine_type} onChange={e => update('cuisine_type', e.target.value)} className={inputClass} placeholder="e.g. Indian, Continental" />
                </div>
              </div>
            )}

            {form.role === 'ngo' && (
              <div className="animate-slide-up">
                <label className={labelClass}>Feeding Capacity (People/Day)</label>
                <input type="number" value={form.capacity} onChange={e => update('capacity', +e.target.value)} className={inputClass} placeholder="e.g. 500" />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full mt-6 py-4 rounded-xl text-lg font-bold tracking-widest uppercase transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 text-white border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Initializing...
                </>
              ) : (
                'Create Network Node'
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400 font-medium">
          Already part of the network? <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">Sign In Here</Link>
        </p>
      </div>
    </div>
  );
}
