"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // Call the new async database-backed login
    const user = await loginAsync(email, password);
    
    if (!user) {
      setError("Invalid credentials. Please contact administration.");
      setLoading(false);
      return;
    }
    
    router.push(user.role === "designer" ? "/designer" : "/");
  }

  function quickLogin(type: "user" | "designer") {
    setEmail(type === "user" ? "user@123" : "design@123");
    setPassword("123");
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 soft-gradient-bg relative text-left">
      {/* Decorative corners */}
      <div className="fixed top-12 left-12 w-32 h-32 opacity-10 pointer-events-none">
        <div className="absolute inset-0 border-t border-l border-green-800"></div>
        <div className="absolute top-4 left-4 w-full h-full border-t border-l border-green-800"></div>
      </div>
      <div className="fixed bottom-12 right-12 w-32 h-32 opacity-10 pointer-events-none">
        <div className="absolute inset-0 border-b border-r border-green-800"></div>
        <div className="absolute bottom-4 right-4 w-full h-full border-b border-r border-green-800"></div>
      </div>

      <main className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-12 text-center">
          <h1 className="font-[900] text-4xl tracking-tighter text-gray-800 mb-2">ScalePods</h1>
          <p className="font-[900] text-xs uppercase tracking-widest text-green-800/60">Enterprise Portal</p>
        </div>

        {/* Login Card */}
        <div className="login-glass border border-white/40 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-green-600/10 p-6 md:p-10">
          <div className="mb-6 md:mb-8">
            <h2 className="font-[900] text-xl md:text-2xl text-gray-800 mb-1">Welcome back</h2>
            <p className="text-green-800/70 text-xs md:text-sm">Access your enterprise workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="font-[900] text-[10px] uppercase tracking-wider text-green-800/60 ml-1">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-green-800/40 text-lg">alternate_email</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/40 border-0 ring-1 ring-green-600/20 focus:ring-2 focus:ring-green-600 text-gray-800 rounded-xl py-3.5 pl-11 pr-4 transition-all placeholder:text-green-800/30 text-sm"
                  placeholder="user@123"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="font-[900] text-[10px] uppercase tracking-wider text-green-800/60">Password</label>
                <a className="text-[10px] font-[900] uppercase text-green-800 hover:text-gray-800 transition-colors cursor-pointer">Forgot?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-green-800/40 text-lg">lock</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/40 border-0 ring-1 ring-green-600/20 focus:ring-2 focus:ring-green-600 text-gray-800 rounded-xl py-3.5 pl-11 pr-4 transition-all placeholder:text-green-800/30 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-green-600/30 text-green-600 focus:ring-green-600 bg-white/50" />
              <label htmlFor="remember" className="ml-3 text-xs font-medium text-green-800/70">Keep me logged in for 30 days</label>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-br from-green-600 to-green-500 text-white font-[900] uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-green-600/20 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-200 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Sign In to Portal"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-green-600/10"></div>
              <span className="flex-shrink mx-4 text-[10px] font-[900] uppercase text-green-800/40 tracking-widest">quick access</span>
              <div className="flex-grow border-t border-green-600/10"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => quickLogin("designer")}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-white/40 border border-white/60 rounded-xl hover:bg-white/60 transition-all"
              >
                <span className="material-symbols-outlined text-green-800 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
                <span className="text-xs font-bold text-green-800">Designer</span>
              </button>
              <button
                onClick={() => quickLogin("user")}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-white/40 border border-white/60 rounded-xl hover:bg-white/60 transition-all"
              >
                <span className="material-symbols-outlined text-green-800 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                <span className="text-xs font-bold text-green-800">Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex justify-center gap-8">
          <span className="text-[10px] font-[900] uppercase text-green-800/50 tracking-widest">Privacy Policy</span>
          <span className="text-[10px] font-[900] uppercase text-green-800/50 tracking-widest">Terms of Service</span>
          <span className="text-[10px] font-[900] uppercase text-green-800/50 tracking-widest">Support</span>
        </div>
      </main>
    </div>
  );
}
