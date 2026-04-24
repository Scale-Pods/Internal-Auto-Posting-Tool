"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Simulate role-based redirect
      if (role === "Admin" || role === "Client") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/designer/tasks";
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  };

  return (
    <div className="min-h-screen flex font-body-base selection:bg-primary-container selection:text-white">
      {/* Left Panel - Visual/Brand */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-[#FFF5F0] p-12 xl:p-24 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-10 left-12 flex items-center gap-2"
        >
          <span className="text-primary-container material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          <span className="font-h1 font-black text-xl text-slate-900 tracking-tight">FlowPilot AI</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="z-10 mt-10"
        >
          {/* Mockup Container */}
          <div className="bg-white p-4 rounded-3xl shadow-2xl mb-12 transform -rotate-2 hover:rotate-0 transition-transform duration-500 max-w-lg">
            <div className="bg-[#1C2331] rounded-2xl p-6 aspect-[4/3] relative overflow-hidden flex flex-col">
               <h3 className="text-white font-h2 text-2xl mb-6">Dashboard</h3>
               <div className="flex-1 bg-[#151B26] rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                 {/* Mock UI Rows */}
                 <div className="flex justify-between items-center pb-2 border-b border-white/10">
                   <div className="w-1/3 h-2 bg-white/20 rounded-full"></div>
                   <div className="w-1/4 h-2 bg-blue-400/50 rounded-full"></div>
                 </div>
                 <div className="flex justify-between items-center py-1">
                   <div className="w-1/4 h-2 bg-white/10 rounded-full"></div>
                   <div className="w-1/2 h-2 bg-green-400/50 rounded-full"></div>
                 </div>
                 <div className="flex justify-between items-center py-1">
                   <div className="w-1/5 h-2 bg-white/10 rounded-full"></div>
                   <div className="w-2/5 h-2 bg-teal-400/50 rounded-full"></div>
                 </div>
                 {/* Graph Area */}
                 <div className="mt-auto pt-4 border-t border-white/5 flex items-end gap-1 h-16">
                   {[30, 45, 25, 60, 40, 70, 50, 85].map((h, i) => (
                     <div key={i} className="flex-1 bg-white/10 rounded-t-sm hover:bg-primary-container/80 transition-colors" style={{ height: `${h}%` }}></div>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#3A1F16] font-h1 leading-tight mb-4">
            Welcome back to<br/>FlowPilot
          </h1>
          <p className="text-[#6D4C41] font-medium text-lg mb-8 max-w-md">
            Automate smarter, grow faster with AI-powered marketing
          </p>
          
          <div className="space-y-4">
            {[
              "Real-time campaign analytics",
              "AI-powered content generation",
              "Automated workflow builder"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <span className="text-[#5D4037] font-bold">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <span className="text-primary-container material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            <span className="font-h1 font-black text-xl text-slate-900 tracking-tight">FlowPilot AI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-black text-slate-900 font-h2 mb-2">Sign in to your account</h2>
            <p className="text-slate-500 mb-8 font-medium">Enter your credentials to continue</p>

            {/* Google Login */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors font-bold text-slate-700 shadow-sm mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs font-bold text-slate-400">OR</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-bold flex items-start gap-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email address</label>
                <input 
                  type="email" 
                  required
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all text-slate-900 bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  <Link href="#" className="text-sm font-bold text-primary-container hover:underline">Forgot password?</Link>
                </div>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all text-slate-900 bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Sign in as</label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all appearance-none text-slate-900 bg-white font-medium"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Client">Client</option>
                    <option value="Designer">Designer</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-primary-container text-white py-3.5 rounded-xl font-bold hover:bg-primary shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-600">
              Don't have an account? <Link href="/signup" className="text-primary-container font-bold hover:underline">Sign up</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
