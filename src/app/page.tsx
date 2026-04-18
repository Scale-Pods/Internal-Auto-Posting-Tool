"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Client");
  const [stats, setStats] = useState({ clients: 0, pendingReview: 0, approved: 0, readyToPost: 0 });

  useEffect(() => {
    const u = getUser();
    if (u) setUserName(u.name);

    async function fetchStats() {
      const [clientsRes, pendingRes, approvedRes, readyRes] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('content_deliverables').select('id', { count: 'exact', head: true }).eq('status', 'Awaiting Review'),
        supabase.from('content_deliverables').select('id', { count: 'exact', head: true }).eq('status', 'Strategy Approved'),
        supabase.from('content_deliverables').select('id', { count: 'exact', head: true }).eq('status', 'Ready for Publishing'),
      ]);
      setStats({
        clients: clientsRes.count || 0,
        pendingReview: pendingRes.count || 0,
        approved: approvedRes.count || 0,
        readyToPost: readyRes.count || 0,
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen p-10 bg-surface">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <p className="text-sp-primary font-medium tracking-widest text-xs uppercase mb-2">Agency OS</p>
          <h1 className="text-4xl font-[900] tracking-tight text-white mb-2">Welcome back, {userName}</h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-light leading-relaxed">
            Your Agency OS workflow is running. Review live statuses across all pipeline stages.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/review" className="px-6 py-3 rounded-xl bg-sp-secondary/10 text-sp-secondary font-bold border border-sp-secondary/20 hover:bg-sp-secondary/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">rate_review</span>
            Review Content
          </Link>
          <Link href="/onboarding" className="px-6 py-3 rounded-xl bg-sp-primary text-on-primary font-bold shadow-lg hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] transition-all">
            Add New Client
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">groups</span>
          </div>
          <p className="text-sm font-medium text-sp-primary mb-1 uppercase tracking-widest">Active Clients</p>
          <h3 className="text-4xl font-[900] text-white">{stats.clients}</h3>
          <div className="mt-4 flex items-center gap-1 text-on-surface-variant text-xs font-medium">
            <Link href="/clients" className="text-sp-primary hover:underline">View all clients →</Link>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">pending_actions</span>
          </div>
          <p className="text-sm font-medium text-sp-error mb-1 uppercase tracking-widest">Awaiting Review</p>
          <h3 className="text-4xl font-[900] text-white">{stats.pendingReview}</h3>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium">
            <Link href="/review" className="text-sp-error hover:underline">Review now →</Link>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">palette</span>
          </div>
          <p className="text-sm font-medium text-sp-tertiary mb-1 uppercase tracking-widest">In Design</p>
          <h3 className="text-4xl font-[900] text-white">{stats.approved}</h3>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium">
            <Link href="/designer" className="text-sp-tertiary hover:underline">Designer portal →</Link>
          </div>
        </div>

        <Link href="/publishing" className="bg-surface-container-low p-6 rounded-xl border border-white/5 relative overflow-hidden group block hover:border-sp-secondary/50 transition-all cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">rocket_launch</span>
          </div>
          <p className="text-sm font-medium text-sp-secondary mb-1 uppercase tracking-widest">Ready to Post</p>
          <h3 className="text-4xl font-[900] text-white">{stats.readyToPost}</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sp-secondary animate-pulse"></div>
            <span className="text-on-surface-variant text-xs group-hover:text-sp-secondary transition-colors font-medium">Click to publish →</span>
          </div>
        </Link>
      </section>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Steps */}
        <section className="lg:col-span-2">
          <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-white/5 shadow-xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1c1b1b]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-sp-primary">account_tree</span>
                Agency OS Pipeline
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { step: "01", icon: "person_add", color: "text-sp-primary", title: "Client Onboarding", desc: "Capture business details, goals & target audience", href: "/onboarding", action: "Onboard Client" },
                { step: "02", icon: "smart_toy", color: "text-sp-tertiary", title: "AI Strategy Generation", desc: "AI builds a tailored content strategy", href: "/clients", action: "View Clients" },
                { step: "03", icon: "rate_review", color: "text-sp-secondary", title: "Strategy Approval Loop", desc: "Client approves or requests changes via feedback", href: "/clients", action: "Review Strategies" },
                { step: "04", icon: "palette", color: "text-[#c0c1ff]", title: "Designer Assignment", desc: "Approved strategy splits into individual design tasks", href: "/designer", action: "Open Designer" },
                { step: "05", icon: "fact_check", color: "text-sp-error", title: "Client Content Approval", desc: "Client reviews uploaded media and approves for publishing", href: "/review", action: "Review Content" },
                { step: "06", icon: "rocket_launch", color: "text-sp-secondary", title: "Auto-Posting Engine", desc: "Publish approved and designed content to platforms", href: "/publishing", action: "Publish Now" },
              ].map((item) => (
                <div key={item.step} className="p-6 flex items-start gap-4 hover:bg-surface-container-high transition-colors">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 text-xs font-[900] text-gray-500">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <span className={`material-symbols-outlined text-base ${item.color}`}>{item.icon}</span>
                        {item.title}
                      </h4>
                      <Link href={item.href} className={`text-xs font-bold ${item.color} hover:underline`}>{item.action} →</Link>
                    </div>
                    <p className="text-on-surface-variant text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="space-y-6">
          <div className="bg-surface-container-high p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sp-primary/5 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/clients" className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-4 rounded-xl font-medium transition-all flex items-center gap-3">
                  <span className="material-symbols-outlined text-sp-primary text-sm">people</span>
                  Manage Clients
                </Link>
                <Link href="/designer" className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-4 rounded-xl font-medium transition-all flex items-center gap-3">
                  <span className="material-symbols-outlined text-sp-tertiary text-sm">brush</span>
                  Designer Portal
                </Link>
                <Link href="/review" className="w-full bg-sp-secondary/10 hover:bg-sp-secondary/20 text-sp-secondary border border-sp-secondary/20 py-3 px-4 rounded-xl font-bold transition-all flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">rate_review</span>
                  Review Pending Content
                </Link>
                <Link href="/calendar" className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-4 rounded-xl font-medium transition-all flex items-center gap-3">
                  <span className="material-symbols-outlined text-sp-primary text-sm">calendar_today</span>
                  Content Calendar
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-[#1c1b1b] p-8 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sp-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              </div>
              <h3 className="text-lg font-bold text-white">Agency Tip</h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              &quot;Clients who approve their strategy within <span className="text-white font-bold">24 hours</span> see 3x faster content time-to-market. Consider sending a reminder email after strategy generation.&quot;
            </p>
          </div>
        </section>
      </div>

      {/* Floating FAB */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="w-14 h-14 rounded-full bg-sp-primary text-on-primary shadow-2xl flex items-center justify-center hover:scale-110 transition-transform hover:shadow-[0_0_30px_rgba(192,193,255,0.4)]">
          <span className="material-symbols-outlined text-3xl">support_agent</span>
        </button>
      </div>
    </div>
  );
}
