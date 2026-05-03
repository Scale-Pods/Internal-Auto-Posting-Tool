"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from "@/lib/supabase";
import { Rocket, Shield, Briefcase, Palette, CheckCircle2, Zap, Ban } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms of Service.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Sign up user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (authError) throw authError;

      // Redirect to the main dashboard hub
      window.location.href = "/dashboard";

    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  };

  return (
    <div suppressHydrationWarning className="min-h-screen flex font-body-base selection:bg-primary-container selection:text-white">
      {/* Left Panel - Visual/Brand */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-[#FFF5F0] p-12 xl:p-24 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-10 left-12 flex items-center gap-2"
        >

            <div className="bg-primary p-3 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/logo-light.png" alt="ScalePods" className="h-8 object-contain" />
            </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="z-10 mt-16"
        >
          {/* Lottie Animation Container */}
          <div className="mb-8 w-full max-w-[350px] xl:max-w-[450px] aspect-[4/3] mx-auto flex items-center justify-center relative">
            <div className="absolute inset-0 bg-teal-500/10 rounded-3xl -z-10 transform translate-x-4 translate-y-4"></div>
            <DotLottieReact
              src="https://assets-v2.lottiefiles.com/a/59ae3046-117b-11ee-88a7-ef3838e9662f/rNxvGjWbsn.lottie"
              loop
              autoplay
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-h1 leading-tight mb-4">
            Start automating<br/>today
          </h1>
          <p className="text-slate-600 font-medium text-lg mb-8 max-w-md">
            Join 10,000+ teams using ScalePods to supercharge their marketing workflows.
          </p>
          
          <div className="space-y-6">
            {[
              { icon: CheckCircle2, text: "Free 14-day trial, no credit card", color: "text-primary-container", bg: "bg-primary-container/10" },
              { icon: Zap, text: "Setup in under 5 minutes", color: "text-orange-500", bg: "bg-orange-100" },
              { icon: Ban, text: "Cancel anytime", color: "text-red-500", bg: "bg-red-100" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-slate-800 font-bold">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md py-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">

            <div className="bg-primary p-3 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/logo-light.png" alt="ScalePods" className="h-8 object-contain" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-black text-slate-900 font-h2 mb-2">Create your account</h2>
            <p className="text-slate-500 mb-8 font-medium">Get started with ScalePods</p>

            {/* Google Signup */}
            <button 
              onClick={handleGoogleSignup}
              className="w-full py-3.5 px-4 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors font-bold text-slate-700 shadow-sm mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
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

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Alex Johnson"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all text-slate-900 bg-white"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Work Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="alex@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all text-slate-900 bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all text-slate-900 bg-white pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Confirm</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all text-slate-900 bg-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-black text-slate-500 mb-3 uppercase tracking-wider">Select Your Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "Admin", icon: Shield, label: "Admin" },
                    { id: "Client", icon: Briefcase, label: "Client" },
                    { id: "Designer", icon: Palette, label: "Designer" }
                  ].map((r) => (
                    <label key={r.id} className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${role === r.id ? 'border-primary-container bg-primary-container/5' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value={r.id}
                        checked={role === r.id}
                        onChange={() => setRole(r.id)}
                        className="hidden"
                      />
                      <r.icon className={`w-6 h-6 ${role === r.id ? 'text-primary-container' : 'text-slate-400'}`} />
                      <span className={`text-[11px] font-black ${role === r.id ? 'text-primary-container' : 'text-slate-500'}`}>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="terms" className="text-sm text-slate-600 font-medium">
                  I agree to the <Link href="#" className="text-primary-container font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary-container font-bold hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-4 bg-[#f59e0b] text-white py-4 rounded-xl font-bold hover:bg-[#d97706] shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed text-base"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-600">
              Already have an account? <Link href="/login" className="text-primary-container font-bold hover:underline">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
