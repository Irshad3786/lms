'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Shield, Briefcase, ChevronRight, AlertCircle, Sparkles, CalendarDays } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // Tab states: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const payload = activeTab === 'login' 
      ? { email, password } 
      : { name, email, password, role };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(activeTab === 'login' ? 'Login successful! Redirecting...' : 'Signup successful! Logging you in...');
      
      // Delay redirection slightly for feedback
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);

    } catch (err) {
      setError((err as Error).message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20"
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/90 to-slate-950" />
      </div>

      {/* Decorative gradient glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#EDDE5D]/10 to-[#F09819]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#F09819]/10 to-[#EDDE5D]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Title / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EDDE5D] to-[#F09819] shadow-lg shadow-brand-orange/20 mb-4 transform hover:rotate-6 transition-transform">
            <CalendarDays className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent text-glow">
            LMS Portal
          </h1>
          <p className="mt-2 text-sm text-slate-400 text-center">
            Modern Leave Management System
          </p>
        </div>

        {/* Auth Glass Panel Card */}
        <div className="glass-panel rounded-3xl shadow-2xl p-8 border border-white/5 relative overflow-hidden">
          {/* Active Tab bar */}
          <div className="flex p-1 bg-slate-900/60 rounded-xl mb-8 border border-white/5">
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#EDDE5D] to-[#F09819] text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-[#EDDE5D] to-[#F09819] text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-950/40 border border-red-500/20 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-sm">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-orange/50 transition-colors text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-orange/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-orange/50 transition-colors text-sm"
                />
              </div>
            </div>

            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      role === 'employee'
                        ? 'border-brand-orange/40 bg-brand-orange/5 text-brand-orange'
                        : 'border-white/10 bg-slate-900/20 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      role === 'admin'
                        ? 'border-brand-orange/40 bg-brand-orange/5 text-brand-orange'
                        : 'border-white/10 bg-slate-900/20 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#EDDE5D] to-[#F09819] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>


      </div>
    </div>
  );
}
