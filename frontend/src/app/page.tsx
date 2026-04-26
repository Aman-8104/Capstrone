'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const features = [
    { icon: '🧠', title: 'Surplus Prediction', desc: 'Forecast daily surplus volume with smart ML models before the food becomes waste.' },
    { icon: '📍', title: 'Hotspot Detection', desc: 'Identify critical zones of need and optimize your delivery routes automatically.' },
    { icon: '🤝', title: 'Smart Matching', desc: 'Connect providers seamlessly with nearby NGOs needing precise food quantities.' },
    { icon: '📊', title: 'Impact Analytics', desc: 'Track your ESG metrics, total waste saved, and community impact in real-time.' },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-50 selection:bg-blue-500/30">
      {/* Background Ambience */}
      <div className="bg-glow-blue top-[-20%] left-[-10%]" />
      <div className="bg-glow-purple bottom-[-20%] right-[-10%]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 font-black text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SmartSurplus</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Platform</a>
          <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          <a href="#network" className="hover:text-white transition-colors">Network</a>
          <Link href="/donate" className="hover:text-emerald-400 transition-colors flex items-center gap-1">💝 Donate</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/donate" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 px-4 py-2 rounded-xl">
            💝 Donate
          </Link>
          <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24 text-center">
        {mounted && (
          <div className="animate-fade-in">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-sm font-medium text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              AI-Powered Food Redistribution
            </div>
            
            <h1 className="mb-6 text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
              Turn Food <span className="text-gradient">Surplus</span> <br/>
              Into Community <span className="text-gradient-accent">Impact</span>
            </h1>
            
            <p className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed">
              Predict overproduction, optimize routing, and instantly connect food providers with NGOs. Transform waste into immediate value for the community.
            </p>
            
            <div className="flex flex-wrap justify-center gap-5 mb-16">
              <Link href="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                Start Redistributing <span className="text-xl leading-none">→</span>
              </Link>
              <Link href="/map" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
                Explore The Map <span className="text-xl leading-none">🗺️</span>
              </Link>
              <Link href="/donate" className="btn-secondary text-base px-8 py-4 flex items-center gap-2 text-emerald-300 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40">
                Support a Cause <span className="text-xl leading-none">💝</span>
              </Link>
            </div>

            {/* Glowing Hero Image */}
            <div className="relative mx-auto max-w-4xl rounded-2xl overflow-hidden glass-card shadow-[0_20px_60px_-15px_rgba(59,130,246,0.6)]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c]/80 to-transparent z-10" />
              <img 
                src="/dashboard_mockup.png" 
                alt="SmartSurplus Platform Dashboard" 
                className="w-full h-[500px] object-cover object-top opacity-90 transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        )}
      </section>

      {/* Data Bar */}
      <section className="relative z-10 border-y border-white/5 bg-slate-900/30 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4 md:gap-12 text-center">
          {[
            { value: '2,500+', label: 'Kg Food Saved' },
            { value: '450+', label: 'Active Partners' },
            { value: '92%', label: 'Prediction Accuracy' },
            { value: '150+', label: 'NGO Deliveries' }
          ].map((stat, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-4xl font-black text-white tracking-tight mb-2">{stat.value}</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-32">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl text-white">Engineered For Scale</h2>
          <p className="text-slate-400">Advanced logistics and forecasting for maximum impact.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-8 animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-2xl shadow-inner border border-white/5">
                {f.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Layer */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-32">
        <div className="glass-card relative overflow-hidden p-12 text-center shadow-[0_0_50px_rgba(59,130,246,0.1)] md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-violet-600/10" />
          <div className="relative z-10">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl tracking-tight text-white">Join the <span className="text-gradient">Redistribution</span> Network</h2>
            <p className="mx-auto mb-10 max-w-xl text-slate-400 text-lg">
              Start reducing waste and meeting your ESG goals today. Setup takes less than 5 minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-5">
              <Link href="/register" className="btn-primary inline-flex px-10 py-5 text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                Create Free Account
              </Link>
              <Link href="/donate" className="btn-secondary inline-flex px-10 py-5 text-lg text-emerald-300 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                💝 Make a Donation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-900/50 py-8 text-center text-sm text-slate-500 backdrop-blur-lg">
        <p>© 2024 SmartSurplus AI. Engineering Global Impact.</p>
      </footer>
    </div>
  );
}
