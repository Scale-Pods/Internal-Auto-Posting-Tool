"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Users, Building2, Clock, CheckCircle2, Zap, ArrowRight,
  TrendingUp, Calendar, Palette, Loader2, Plus, Globe
} from "lucide-react";
import { LoadingLottie } from "@/components/loading-lottie";

type Client = {
  id: string;
  business_name: string;
  industry_type: string;
  website_url: string;
  status: string;
  created_at: string;
};

type Stats = {
  total: number;
  ready: number;
  pending: number;
  generating: number;
};

function StatCard({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {loading ? (
        <div className="h-9 flex items-center">
          <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
        </div>
      ) : (
        <h3 className="text-4xl font-metric-lg text-slate-900">{value}</h3>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, ready: 0, pending: 0, generating: 0 });
  const [recent, setRecent] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("clients")
      .select("id, business_name, industry_type, website_url, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const all = data || [];
        setStats({
          total: all.length,
          ready: all.filter((c) => c.status === "Strategy Approved").length,
          pending: all.filter((c) => c.status === "Awaiting Strategy" || !c.status).length,
          generating: all.filter((c) => c.status === "Generating").length,
        });
        setRecent(all.slice(0, 5));
        setLoading(false);
      });
  }, []);

  const statCards = [
    {
      label: "Total Clients",
      value: stats.total,
      icon: <Users className="w-5 h-5 text-slate-600" />,
      color: "bg-slate-100",
    },
    {
      label: "Strategy Ready",
      value: stats.ready,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      color: "bg-emerald-50",
    },
    {
      label: "Awaiting Strategy",
      value: stats.pending,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      color: "bg-amber-50",
    },
    {
      label: "Generating Now",
      value: stats.generating,
      icon: <Zap className="w-5 h-5 text-primary" />,
      color: "bg-orange-50",
    },
  ];

  function getStatusBadge(status: string) {
    if (status === "Strategy Approved")
      return <span className="px-2 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Ready</span>;
    if (status === "Generating")
      return <span className="px-2 py-1 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">Generating</span>;
    return <span className="px-2 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
  }

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="text-4xl font-h1 text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">
            Welcome back, Admin. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-all shadow-sm shadow-orange-200 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Recent Clients */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
          <div>
            <h2 className="text-base font-h2 text-slate-900">Recent Clients</h2>
            <p className="text-sm text-slate-500 mt-0.5">Latest client accounts added</p>
          </div>
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingLottie message="Preparing your dashboard..." size={300} />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">No clients yet</p>
            <Link
              href="/dashboard/clients/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-orange-600 transition-all mt-1"
            >
              <Plus className="w-4 h-4" /> Add First Client
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="flex items-center gap-4 px-8 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-primary flex items-center justify-center font-black text-sm shrink-0">
                  {client.business_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors truncate">
                    {client.business_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {client.website_url && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Globe className="w-3 h-3" />
                        {client.website_url.replace(/^https?:\/\//, "").split("/")[0]}
                      </span>
                    )}
                    {client.industry_type && (
                      <span className="text-[11px] text-slate-400">· {client.industry_type}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {getStatusBadge(client.status)}
                  <span className="text-[11px] text-slate-400 hidden sm:block">
                    {new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {[
          {
            title: "View All Clients",
            desc: "Browse and manage all client accounts",
            href: "/dashboard/clients",
            icon: <Users className="w-5 h-5" />,
            color: "bg-slate-900 text-white hover:bg-slate-800",
          },
          {
            title: "Content Approval",
            desc: "Review and approve pending content",
            href: "/dashboard/approval",
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "bg-orange-500 text-white hover:bg-orange-600",
          },
          {
            title: "Ready to Post",
            desc: "Schedule and publish approved content",
            href: "/dashboard/ready-to-post",
            icon: <Zap className="w-5 h-5" />,
            color: "bg-emerald-500 text-white hover:bg-emerald-600",
          },
        ].map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`flex items-center gap-4 p-5 rounded-2xl font-semibold transition-all shadow-sm ${action.color}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {action.icon}
            </div>
            <div>
              <p className="font-bold text-sm">{action.title}</p>
              <p className="text-xs opacity-75 mt-0.5">{action.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
          </Link>
        ))}
      </div>
    </div>
  );
}
