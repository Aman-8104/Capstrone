'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const ngos = [
  { id: 'platform', name: 'SmartSurplus Platform', desc: 'Support our mission to eliminate food waste through AI-powered redistribution technology.', icon: '🌐', color: 'blue' },
  { id: 'feedindia', name: 'Feed India Foundation', desc: 'Fighting hunger across India by connecting surplus food with communities in need.', icon: '🍛', color: 'emerald' },
  { id: 'robinhood', name: 'Robin Hood Army - Mumbai', desc: 'Volunteer-driven initiative serving excess food to the less fortunate.', icon: '🏹', color: 'amber' },
  { id: 'annadan', name: 'Annadan Trust', desc: 'Providing nutritious meals to underprivileged children and families in Mumbai.', icon: '🙏', color: 'rose' },
  { id: 'rotibank', name: 'Roti Bank Mumbai', desc: 'Collecting surplus rotis and bread to distribute to shelters and street communities.', icon: '🫓', color: 'orange' },
  { id: 'akshayapatra', name: 'Akshaya Patra Foundation', desc: 'Serving mid-day meals to school children to support education and nutrition.', icon: '🏫', color: 'violet' },
  { id: 'mealsonwheels', name: 'Meals on Wheels India', desc: 'Delivering hot meals to homebound elderly and disabled individuals.', icon: '🚗', color: 'cyan' },
  { id: 'hopeforhungry', name: 'Hope for the Hungry', desc: 'Emergency food relief and long-term food security programs in urban areas.', icon: '💚', color: 'lime' },
  { id: 'foodforall', name: 'Food For All Society', desc: 'Working towards zero hunger through community kitchens and food banks.', icon: '🤲', color: 'teal' },
  { id: 'karunafund', name: 'Karuna Food Relief', desc: 'Rapid response food relief during disasters and for daily hunger relief operations.', icon: '❤️', color: 'pink' },
];

const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; ring: string }> = {
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',  ring: 'ring-blue-500/30' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',  ring: 'ring-emerald-500/30' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',  ring: 'ring-amber-500/30' },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    text: 'text-rose-400',    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',   ring: 'ring-rose-500/30' },
  orange:  { bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'text-orange-400',  glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',  ring: 'ring-orange-500/30' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  text: 'text-violet-400',  glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',  ring: 'ring-violet-500/30' },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    text: 'text-cyan-400',    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',   ring: 'ring-cyan-500/30' },
  lime:    { bg: 'bg-lime-500/10',    border: 'border-lime-500/30',    text: 'text-lime-400',    glow: 'shadow-[0_0_20px_rgba(132,204,22,0.2)]',  ring: 'ring-lime-500/30' },
  teal:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/30',    text: 'text-teal-400',    glow: 'shadow-[0_0_20px_rgba(20,184,166,0.2)]',  ring: 'ring-teal-500/30' },
  pink:    { bg: 'bg-pink-500/10',    border: 'border-pink-500/30',    text: 'text-pink-400',    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',  ring: 'ring-pink-500/30' },
};

export default function DonatePage() {
  const [selectedNgo, setSelectedNgo] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
  const [processing, setProcessing] = useState(false);

  const selectedOrg = ngos.find(n => n.id === selectedNgo);
  const c = selectedOrg ? colorMap[selectedOrg.color] : colorMap.blue;
  const finalAmount = amount || (customAmount ? Number(customAmount) : 0);

  const handlePresetAmount = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmount = (val: string) => {
    setCustomAmount(val);
    setAmount('');
  };

  const handleProceed = () => {
    if (selectedNgo && finalAmount > 0) {
      setStep('payment');
    }
  };

  const handleDonate = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2500));
    setProcessing(false);
    setStep('success');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-50 selection:bg-blue-500/30">
      {/* Background Ambience */}
      <div className="bg-glow-blue top-[-10%] left-[-10%]" />
      <div className="bg-glow-purple bottom-[-10%] right-[-5%]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 font-black text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SmartSurplus</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Page Header */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-8 text-center">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="text-lg">💝</span>
            Make a Difference Today
          </div>
          <h1 className="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Support the <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Mission</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400 leading-relaxed">
            Your contribution helps us fight food waste and hunger. Donate to the SmartSurplus platform or directly to any of our partner NGOs.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        {step === 'select' && (
          <div className="animate-fade-in">
            {/* NGO Grid */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500"></span>
                Choose Where to Donate
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ngos.map((ngo, i) => {
                  const nc = colorMap[ngo.color];
                  const isSelected = selectedNgo === ngo.id;
                  return (
                    <button
                      key={ngo.id}
                      onClick={() => setSelectedNgo(ngo.id)}
                      className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 animate-fade-in ${
                        isSelected
                          ? `${nc.bg} ${nc.border} ${nc.glow} ring-2 ${nc.ring} scale-[1.02]`
                          : 'bg-[#131b2f]/60 border-white/5 hover:border-white/15 hover:bg-[#131b2f]/90'
                      }`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? `${nc.border} ${nc.bg}` : 'border-white/20'
                      }`}>
                        {isSelected && (
                          <div className={`w-2.5 h-2.5 rounded-full bg-current ${nc.text}`} />
                        )}
                      </div>

                      <div className={`text-2xl mb-3 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {ngo.icon}
                      </div>
                      <h3 className={`font-bold mb-1.5 transition-colors pr-6 ${isSelected ? nc.text : 'text-white'}`}>
                        {ngo.name}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {ngo.desc}
                      </p>
                      {ngo.id === 'platform' && (
                        <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                          Platform
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Selection */}
            {selectedNgo && (
              <div className="animate-slide-up">
                <div className="glass-card p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-3xl">{selectedOrg?.icon}</span>
                    <div>
                      <h3 className={`text-lg font-bold ${c.text}`}>Donating to {selectedOrg?.name}</h3>
                      <p className="text-sm text-slate-400">Select or enter your donation amount</p>
                    </div>
                  </div>

                  {/* Preset Amounts */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                    {presetAmounts.map(val => (
                      <button
                        key={val}
                        onClick={() => handlePresetAmount(val)}
                        className={`py-3.5 rounded-xl text-sm font-bold transition-all border ${
                          amount === val
                            ? `${c.bg} ${c.text} ${c.border} ${c.glow}`
                            : 'bg-[#131b2f] text-slate-300 border-white/5 hover:border-white/15 hover:bg-white/5'
                        }`}
                      >
                        ₹{val.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="mb-8">
                    <label className="block text-xs font-bold tracking-wide text-slate-400 mb-2 uppercase">
                      Or enter custom amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={customAmount}
                        onChange={e => handleCustomAmount(e.target.value)}
                        className="input-premium pl-10 text-lg"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-400 mb-2 uppercase">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input-premium"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-400 mb-2 uppercase">Email (for receipt)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input-premium"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-xs font-bold tracking-wide text-slate-400 mb-2 uppercase">Message (Optional)</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="input-premium resize-none h-20"
                      placeholder="Leave a kind message..."
                    />
                  </div>

                  {/* Proceed */}
                  <button
                    onClick={handleProceed}
                    disabled={!finalAmount || finalAmount <= 0}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                  >
                    {finalAmount > 0 ? (
                      <>
                        Proceed to Donate ₹{finalAmount.toLocaleString()}
                        <span className="text-xl">→</span>
                      </>
                    ) : (
                      'Select an Amount'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Step */}
        {step === 'payment' && selectedOrg && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <div className="glass-card p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

              <div className="relative z-10">
                <button onClick={() => setStep('select')} className="text-sm text-slate-400 hover:text-white transition-colors mb-6 flex items-center gap-1">
                  ← Change selection
                </button>

                {/* Summary */}
                <div className={`p-5 rounded-2xl border mb-8 ${c.bg} ${c.border}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{selectedOrg.icon}</span>
                    <div>
                      <p className={`font-bold ${c.text}`}>{selectedOrg.name}</p>
                      <p className="text-xs text-slate-400">Donation</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">₹{finalAmount.toLocaleString()}</span>
                    <span className="text-sm text-slate-400">INR</span>
                  </div>
                  {name && <p className="text-xs text-slate-500 mt-2">From: {name}</p>}
                </div>

                {/* Simulated Payment Methods */}
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Payment Method</h3>
                <div className="space-y-3 mb-8">
                  {[
                    { label: 'UPI / Google Pay / PhonePe', icon: '📱', tag: 'Instant' },
                    { label: 'Credit / Debit Card', icon: '💳', tag: 'Secure' },
                    { label: 'Net Banking', icon: '🏦', tag: 'All Banks' },
                  ].map((pm, i) => (
                    <label key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#131b2f]/60 hover:border-white/15 cursor-pointer transition-all group">
                      <input type="radio" name="payment" defaultChecked={i === 0} className="accent-blue-500 w-4 h-4" />
                      <span className="text-xl">{pm.icon}</span>
                      <span className="flex-1 font-medium text-sm text-white">{pm.label}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-2.5 py-1 rounded-full">{pm.tag}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleDonate}
                  disabled={processing}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      💝 Donate ₹{finalAmount.toLocaleString()} Now
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                  🔒 Secured with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && selectedOrg && (
          <div className="max-w-lg mx-auto animate-fade-in text-center">
            <div className="glass-card p-10 md:p-14 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/5" />

              <div className="relative z-10">
                {/* Animated checkmark */}
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <span className="text-5xl animate-bounce-slow">✅</span>
                </div>

                <h2 className="text-3xl font-extrabold text-white mb-3">Thank You!</h2>
                <p className="text-slate-400 mb-2">Your donation has been received successfully.</p>

                <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border mt-4 mb-8 ${c.bg} ${c.border}`}>
                  <span className="text-lg">{selectedOrg.icon}</span>
                  <span className={`font-bold ${c.text}`}>₹{finalAmount.toLocaleString()}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-sm text-slate-300">{selectedOrg.name}</span>
                </div>

                {name && (
                  <p className="text-sm text-slate-400 mb-6">
                    Dear <span className="text-white font-semibold">{name}</span>, your generosity helps us serve communities in need. A receipt has been sent to your email.
                  </p>
                )}

                <div className="p-5 rounded-xl bg-[#131b2f]/80 border border-white/5 mb-8 text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">What your donation achieves</p>
                  <div className="space-y-2.5">
                    {[
                      { emoji: '🍱', text: `Provides ~${Math.max(1, Math.floor(finalAmount / 50))} meals to those in need` },
                      { emoji: '🚚', text: 'Funds logistics for food pickup & delivery' },
                      { emoji: '📊', text: 'Powers AI models to predict and prevent waste' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <span>{item.emoji}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setStep('select'); setSelectedNgo(null); setAmount(''); setCustomAmount(''); setName(''); setEmail(''); setMessage(''); }}
                    className="btn-secondary flex-1 py-3 text-sm text-emerald-300 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40"
                  >
                    Donate Again
                  </button>
                  <Link href="/" className="btn-primary flex-1 py-3 text-sm text-center">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-900/50 py-8 text-center text-sm text-slate-500 backdrop-blur-lg">
        <p>© 2024 SmartSurplus AI. Every donation makes a difference. 💚</p>
      </footer>
    </div>
  );
}
