'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Calendar, Bell, Shield, ArrowRight, ChevronDown, HelpCircle, LogIn } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: "How does the leave balance calculator work?",
    a: "The portal uses automatic calendar checking. When an employee inputs dates, it subtracts weekends, validates remaining credit balances, and warns them instantly if they run over their allocation."
  },
  {
    q: "Can administrators write notes during approvals?",
    a: "Yes. When approving or rejecting a leave request, administrators can write a reasoning note. This description displays directly in the employee's request log."
  },
  {
    q: "Are there real-time notifications for status updates?",
    a: "Absolutely. We have live alert sync: employees get a notification instantly when an admin approves or rejects their leave, visible right in their navigation bar."
  },
  {
    q: "Does this portal sync with external databases?",
    a: "The architecture provides simple webhook integrations. It utilizes PostgreSQL schema objects, making exports and database updates straightforward."
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            router.push('/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('Landing page auth check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm tracking-wide">Connecting to LMS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 relative overflow-hidden">
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
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#EDDE5D]/10 to-[#F09819]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#F09819]/10 to-[#EDDE5D]/10 blur-[150px] pointer-events-none" />

      {/* Landing Navbar */}
      <header className="px-6 py-5 max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EDDE5D] to-[#F09819] flex items-center justify-center shadow shadow-brand-orange/20">
            <CalendarDays className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent">
            LMS Portal
          </span>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="group px-4 py-2.5 bg-slate-900/60 hover:bg-gradient-to-r hover:from-[#EDDE5D] hover:to-[#F09819] hover:text-slate-950 border border-white/10 hover:border-transparent rounded-xl text-xs font-bold text-slate-200 transition-all duration-300 flex items-center gap-2 shadow hover:shadow-brand-orange/30 active:scale-95 cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-brand-yellow group-hover:text-slate-950 transition-colors" />
          <span>Sign In</span>
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center justify-center z-10 space-y-8">
        


        {/* Hero title */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-none text-white">
            Simplify Your Workspace{' '}
            <span className="bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent text-glow block mt-1 sm:inline">
              Leave Tracking
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Apply for leave, view approval history, and manage employee balances with a modern, glassmorphic database dashboard.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={() => router.push('/login')}
            className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 transition-all cursor-pointer group"
          >
            <span>Enter LMS Portal</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Highlight features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-16">
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/5 text-left space-y-2 hover:scale-[1.02] hover:shadow-brand-yellow/5 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Interactive Requests</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Employees can apply for leave using a live calendar calculator that updates balances automatically.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/5 text-left space-y-2 hover:scale-[1.02] hover:shadow-brand-orange/5 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Manager Overviews</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Administrators receive a full request directory with instant approve or reject decision parameters.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/5 text-left space-y-2 hover:scale-[1.02] hover:shadow-white/5 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white mb-2">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Live Notification Alerts</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Get immediate alerts whenever leave requests are submitted, approved, or rejected in real time.
            </p>
          </div>
        </div>

        {/* Stats Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-12">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center hover:border-brand-yellow/20 transition-all duration-300">
            <h4 className="text-2xl font-black bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent">99.9%</h4>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mt-1">Uptime SLA</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center hover:border-brand-orange/20 transition-all duration-300">
            <h4 className="text-2xl font-black bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent">&lt; 1s</h4>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mt-1">Response Time</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center hover:border-brand-yellow/20 transition-all duration-300">
            <h4 className="text-2xl font-black bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent">100%</h4>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mt-1">Data Integrity</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center hover:border-brand-orange/20 transition-all duration-300">
            <h4 className="text-2xl font-black bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent">Zero</h4>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mt-1">Math Errors</p>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="w-full max-w-4xl pt-16 text-left space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Streamlined Leave Lifecycle</h2>
            <p className="text-slate-400 text-xs max-w-md mx-auto">See how LMS Portal connects team requests with management tools seamlessly.</p>
          </div>

          <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-8 py-2">
            {/* Step 1 */}
            <div className="relative pl-8 md:pl-12 group">
              <div className="absolute left-[-9px] top-1 w-4.5 h-4.5 rounded-full bg-slate-950 border-2 border-brand-yellow flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-brand-yellow/20 transition-all duration-300">
                <h3 className="text-sm font-bold text-white mb-1">1. Submit Request</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Employees select their desired start and end dates. The system automatically computes the duration, checks type limits, and updates details immediately.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-8 md:pl-12 group">
              <div className="absolute left-[-9px] top-1 w-4.5 h-4.5 rounded-full bg-slate-950 border-2 border-brand-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-brand-orange/20 transition-all duration-300">
                <h3 className="text-sm font-bold text-white mb-1">2. Instant Notification</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The dashboard alerts admin staff with real-time websocket-like alerts, flagging new requests requiring review instantly.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-8 md:pl-12 group">
              <div className="absolute left-[-9px] top-1 w-4.5 h-4.5 rounded-full bg-slate-950 border-2 border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
                <h3 className="text-sm font-bold text-white mb-1">3. Decision & Audit Update</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Admin decides on requests with custom reasoning notes. Approved balances update, email logs populate, and notifications sync immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full max-w-4xl pt-16 text-left space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-xs max-w-md mx-auto">Get answers to the most common questions about the LMS portal system.</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-brand-orange shrink-0" />
                      {item.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-brand-orange transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-40 border-t border-white/5 opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <p className="text-slate-400 text-xs leading-relaxed">{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950/80 border-t border-white/5 backdrop-blur-md pt-16 pb-12 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#EDDE5D] to-[#F09819] flex items-center justify-center shadow shadow-brand-orange/20">
                <CalendarDays className="w-4.5 h-4.5 text-slate-950" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent">
                LMS Portal
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              A modern, glassmorphic Leave Management System to simplify workspace leave tracking, requests, approvals, and employee balances.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#features" className="hover:text-brand-yellow transition-colors">Features</a>
              </li>
              <li>
                <a href="#integrations" className="hover:text-brand-yellow transition-colors">Integrations</a>
              </li>
              <li>
                <a href="#enterprise" className="hover:text-brand-yellow transition-colors">Enterprise</a>
              </li>
              <li>
                <a href="#security" className="hover:text-brand-yellow transition-colors">Security Details</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#docs" className="hover:text-brand-yellow transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#help" className="hover:text-brand-yellow transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#status" className="hover:text-brand-yellow transition-colors">System Status</a>
              </li>
              <li>
                <a href="#changelog" className="hover:text-brand-yellow transition-colors">API Reference</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#privacy" className="hover:text-brand-yellow transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-brand-yellow transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#cookie-settings" className="hover:text-brand-yellow transition-colors">Cookie Preferences</a>
              </li>
              <li>
                <a href="#compliance" className="hover:text-brand-yellow transition-colors">GDPR & Compliance</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-4">
          <p>© 2026 LMS Portal. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#twitter" className="hover:text-slate-300 transition-colors">Twitter</a>
            <a href="#github" className="hover:text-slate-300 transition-colors">GitHub</a>
            <a href="#linkedin" className="hover:text-slate-300 transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
