"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Search, Building2, Globe, ChevronRight, Loader2, AlertCircle, Zap, Clock, CheckCircle2 } from "lucide-react";
import { LoadingLottie } from "@/components/loading-lottie";

type Client = {
  id: string;
  business_name: string;
  industry_type: string;
  website_url: string;
  status: string;
  brand_tone: string;
  primary_goal: string;
  created_at: string;
  strategy_json: string | null;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  "Strategy Approved": {
    label: "Strategy Ready",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  "Awaiting Strategy": {
    label: "Awaiting Strategy",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  "Generating": {
    label: "Generating...",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Zap className="w-3.5 h-3.5" />,
  },
};

function getStatusConfig(status: string) {
  return statusConfig[status] || {
    label: status || "Pending",
    color: "bg-slate-50 text-slate-600 border-slate-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const bgColors = [
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase
      .from("clients")
      .select("id, business_name, industry_type, website_url, status, brand_tone, primary_goal, created_at, strategy_json")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else {
          setClients(data || []);
          setFiltered(data || []);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = clients;
    if (search.trim()) {
      result = result.filter(
        (c) =>
          c.business_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.industry_type?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === "ready") result = result.filter((c) => c.status === "Strategy Approved");
    if (filter === "pending") result = result.filter((c) => c.status !== "Strategy Approved");
    setFiltered(result);
  }, [search, filter, clients]);

  const totalClients = clients.length;
  const readyCount = clients.filter((c) => c.status === "Strategy Approved").length;
  const pendingCount = clients.filter((c) => c.status !== "Strategy Approved").length;

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Dashboard &rsaquo; Clients
          </p>
          <h1 className="text-3xl font-h2 text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all client accounts and their strategies.</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-all shadow-sm shadow-primary/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </Link>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Clients", value: totalClients, color: "text-slate-900" },
          { label: "Strategy Ready", value: readyCount, color: "text-emerald-600" },
          { label: "Awaiting Strategy", value: pendingCount, color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={`text-3xl font-metric-lg ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "ready", label: "Strategy Ready" },
            { key: "pending", label: "Pending" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                filter === f.key
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <LoadingLottie message="Fetching your clients..." size={350} />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold text-lg">No clients found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search or add a new client.</p>
          <Link
            href="/dashboard/clients/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-orange-600 transition-all mt-2"
          >
            <Plus className="w-4 h-4" /> Add First Client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((client, i) => {
            const sc = getStatusConfig(client.status);
            const colorClass = bgColors[i % bgColors.length];
            const date = new Date(client.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group block"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${colorClass}`}
                    >
                      {getInitials(client.business_name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px] leading-tight group-hover:text-orange-600 transition-colors">
                        {client.business_name}
                      </h3>
                      <p className="text-[12px] text-slate-500 mt-0.5">{client.industry_type}</p>
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold ${sc.color}`}
                  >
                    {sc.icon}
                    {sc.label}
                  </span>
                </div>

                {/* Website */}
                {client.website_url && (
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[12px] text-primary truncate">
                      {client.website_url.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {client.primary_goal && (
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold capitalize">
                      🎯 {client.primary_goal}
                    </span>
                  )}
                  {client.brand_tone && (
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold">
                      🎨 {client.brand_tone}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[11px] text-slate-400 font-medium">Added {date}</span>
                  <span className="flex items-center gap-1 text-[12px] font-bold text-primary group-hover:gap-2 transition-all">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
