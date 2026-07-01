'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useInventory } from '../context/InventoryContext';
import { KeyRound, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginGateway() {
  const { setIsAuthenticated } = useInventory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Clock runner on client side (prevents SSR hydration warnings)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
      setDateStr(now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    // Simulate loading for 1.5s then trigger smooth exit transition
    setTimeout(() => {
      setLoading(false);
      setExiting(true);
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 500); // Wait for scale-out animation to complete
    }, 1500);
  };

  return (
    <div className={`flex h-screen w-screen bg-slate-100 overflow-hidden font-sans select-none ${exiting ? 'animate-scale-out' : ''}`}>
      
      {/* ── LEFT-SIDE BRAND PANEL (50% on md+) ── */}
      <section className="hidden md:flex md:w-1/2 bg-[#2D6A24] relative flex-col justify-between p-12 text-white animate-slide-in-left">
        
        {/* Top Branding decoration */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#aee2a4]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#c2e4bb]">
            Secure Gateway Access
          </span>
        </div>

        {/* Center Logo & Branding */}
        <div className="flex flex-col items-center text-center justify-center flex-1 space-y-6">
          {/* Logo container */}
          <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-2 border border-emerald-300/20 animate-fade-in">
            <Image
              src="/logo.png"
              alt="AmbatуGrow Logo"
              width={96}
              height={96}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-widest text-white leading-tight">
              AMBATUGROW
            </h1>
            <p className="text-xs text-emerald-200/80 font-bold tracking-wider mt-1 uppercase">
              ERP System Ecosystem
            </p>
          </div>
        </div>

        {/* Bottom Status & Live Clock */}
        <div className="flex justify-between items-end border-t border-emerald-800/60 pt-4">
          <div className="text-[10px] font-bold text-emerald-300/80">
            Node: Gateway-US-West
          </div>
          
          <div className="text-right">
            <div className="font-mono text-sm font-black tracking-widest text-white leading-none">
              {timeStr || '00:00:00'}
            </div>
            <div className="text-[9px] font-bold text-emerald-200/80 uppercase mt-1 tracking-wider">
              {dateStr || 'Loading Date...'}
            </div>
          </div>
        </div>

      </section>

      {/* ── RIGHT-SIDE CREDENTIALS PORTAL (100% on mobile, 50% on md+) ── */}
      <section className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 relative animate-slide-in-right">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center z-50 transition-all">
            <Loader2 className="w-10 h-10 text-[#2D6A24] animate-spin" />
            <span className="text-xs font-black text-slate-700 mt-3 uppercase tracking-widest">
              Connecting to Node...
            </span>
          </div>
        )}

        <div className="w-full max-w-sm space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-center md:text-left">
            {/* Small mobile branding header */}
            <div className="md:hidden flex items-center justify-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-white rounded-lg shadow border border-slate-200 p-1 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-slate-800">
                AMBATUGROW
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Welcome to Terminal
            </h2>
            <p className="text-xs text-slate-400 font-bold leading-tight">
              Enter your credentials to access the central ecosystem directories.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email/ID Input */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Employee ID or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ambatugrow.com"
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A24]/20 focus:border-[#2D6A24] focus:bg-white transition-all text-slate-700"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A24]/20 focus:border-[#2D6A24] focus:bg-white transition-all text-slate-700"
                />
              </div>
            </div>

            {/* Subtext info */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded text-[#2D6A24] focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                <span>Remember session</span>
              </label>
              <a href="#" className="hover:text-slate-600 transition-colors">Forgot Password?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all hover:scale-[1.01] hover:shadow cursor-pointer flex items-center justify-center gap-2"
            >
              Sign In to Terminal
            </button>

          </form>

          {/* Quick Demo Assist */}
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
            <span className="text-[8px] font-extrabold text-slate-400 block uppercase tracking-wider">
              Simulation Sandbox
            </span>
            <span className="text-[10px] font-bold text-slate-600 mt-1 block">
              Enter any credentials to login to the central bento directory.
            </span>
          </div>

        </div>

      </section>

    </div>
  );
}
