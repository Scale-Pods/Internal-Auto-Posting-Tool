"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart3, Loader2, RefreshCw, TrendingUp, Eye, Heart,
  Users, MessageSquare, Share2, Bookmark, MousePointerClick,
  Globe, Activity, ArrowUpRight
} from "lucide-react";

type AnalyticsRow = {
  id: string;
  platform: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  new_followers: number;
  skip_rate: number;
  clicks: number;
  followers: number;
  sessions: number;
  bounce_rate: number;
  avg_time_on_page: number;
  conversions: number;
  new_visitors: number;
  engagement_rate: number;
  data_source: string;
  recorded_at: string;
};

type Deliverable = {
  id: string;
  task_name: string;
  platform: string;
  platform_target?: string;
  status: string;
  created_at: string;
  clients?: { business_name: string };
};

const PLATFORM_BADGE: Record<string, string> = {
  instagram: "bg-pink-50 text-pink-700 border-pink-200",
  linkedin:  "bg-blue-50 text-blue-700 border-blue-200",
  website:   "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PLATFORM_BAR: Record<string, string> = {
  instagram: "bg-gradient-to-t from-pink-400 to-pink-300",
  linkedin:  "bg-gradient-to-t from-blue-500 to-blue-400",
  website:   "bg-gradient-to-t from-emerald-500 to-emerald-400",
};

const SOURCE_BADGE: Record<string, { label: string; style: string }> = {
  meta_api:     { label: "Meta API",     style: "bg-pink-50 text-pink-600 border-pink-200" },
  linkedin_api: { label: "LinkedIn API", style: "bg-blue-50 text-blue-600 border-blue-200" },
  ga4_api:      { label: "GA4 API",      style: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  manual:       { label: "Manual",       style: "bg-slate-50 text-slate-500 border-slate-200" },
};

const STATUS_BADGE: Record<string, string> = {
  "Published":            "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Scheduled":            "bg-orange-50 text-primary border-orange-200",
  "Ready for Publishing": "bg-amber-50 text-amber-700 border-amber-200",
};

function pKey(p?: string) { return (p || "instagram").toLowerCase(); }
function fmt(n?: number | null) { return (n ?? 0).toLocaleString("en-IN"); }
function fmtPct(n?: number | null) { return `${(n ?? 0).toFixed(1)}%`; }
function fmtSec(n?: number | null) {
  const s = n ?? 0;
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

export default function AdminSocialAnalysisPage() {
  const [analytics, setAnalytics]         = useState<AnalyticsRow[]>([]);
  const [deliverables, setDeliverables]   = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [platformFilter, setPlatformFilter] = useState("all");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    const [{ data: aData }, { data: dData }] = await Promise.all([
      supabase.from("social_analytics").select("*").order("recorded_at", { ascending: false }).limit(100),
      supabase.from("content_deliverables").select("*, clients(business_name)")
        .in("status", ["Published", "Scheduled", "Ready for Publishing"])
        .order("created_at", { ascending: false }).limit(30),
    ]);
    setAnalytics(aData || []);
    setDeliverables(dData || []);
    setIsLoading(false);
  }

  const filtered   = analytics.filter(a => platformFilter === "all" ? true : pKey(a.platform) === platformFilter);
  const chartData  = filtered.slice(0, 12).reverse();
  const maxImp     = Math.max(...chartData.map(a => a.impressions || 0), 1);
  const hasData    = analytics.length > 0;

  // Aggregate totals
  const totalImpressions = filtered.reduce((s, a) => s + (a.impressions || 0), 0);
  const totalReach       = filtered.reduce((s, a) => s + (a.reach || 0), 0);
  const totalLikes       = filtered.reduce((s, a) => s + (a.likes || 0), 0);
  const totalComments    = filtered.reduce((s, a) => s + (a.comments || 0), 0);
  const totalShares      = filtered.reduce((s, a) => s + (a.shares || 0), 0);
  const totalSaves       = filtered.reduce((s, a) => s + (a.saves || 0), 0);
  const totalClicks      = filtered.reduce((s, a) => s + (a.clicks || 0), 0);
  const totalConversions = filtered.reduce((s, a) => s + (a.conversions || 0), 0);
  const avgEngagement    = filtered.length > 0
    ? (filtered.reduce((s, a) => s + (a.engagement_rate || 0), 0) / filtered.length).toFixed(2)
    : "0.00";

  // Platform-specific secondary metrics
  const platformMetrics = () => {
    if (platformFilter === "instagram") return [
      { icon: Bookmark,          label: "Total Saves",    value: fmt(totalSaves) },
      { icon: Eye,               label: "Profile Visits", value: fmt(filtered.reduce((s,a) => s+(a.profile_visits||0), 0)) },
      { icon: Users,             label: "New Followers",  value: fmt(filtered.reduce((s,a) => s+(a.new_followers||0), 0)) },
    ];
    if (platformFilter === "linkedin") return [
      { icon: MousePointerClick, label: "Total Clicks",   value: fmt(totalClicks) },
      { icon: Users,             label: "Followers Now",  value: fmt(filtered[0]?.followers || 0) },
      { icon: Share2,            label: "Total Shares",   value: fmt(totalShares) },
    ];
    if (platformFilter === "website") return [
      { icon: Activity,          label: "Sessions",       value: fmt(filtered.reduce((s,a) => s+(a.sessions||0), 0)) },
      { icon: Globe,             label: "Bounce Rate",    value: fmtPct(filtered[0]?.bounce_rate) },
      { icon: ArrowUpRight,      label: "Conversions",    value: fmt(totalConversions) },
    ];
    return [
      { icon: Bookmark,          label: "Total Saves",    value: fmt(totalSaves) },
      { icon: MousePointerClick, label: "Total Clicks",   value: fmt(totalClicks) },
      { icon: ArrowUpRight,      label: "Conversions",    value: fmt(totalConversions) },
    ];
  };

  const topStats = [
    { label: "Total Impressions", value: fmt(totalImpressions), icon: Eye,        color: "bg-blue-50 text-blue-600",     trend: "+12%" },
    { label: "Total Reach",       value: fmt(totalReach),       icon: Users,      color: "bg-purple-50 text-purple-600", trend: "+8%"  },
    { label: "Total Likes",       value: fmt(totalLikes),       icon: Heart,      color: "bg-pink-50 text-pink-600",     trend: "+15%" },
    { label: "Avg. Engagement",   value: `${avgEngagement}%`,   icon: TrendingUp, color: "bg-emerald-50 text-emerald-600", trend: "+3%" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-6 lg:p-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-h1 text-slate-900">Social Analysis</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Platform performance across Instagram, LinkedIn & Website
              {hasData && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">Dummy Data</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            {["all", "instagram", "linkedin", "website"].map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 rounded text-xs font-bold capitalize transition-all
                  ${platformFilter === p ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {p === "all" ? "All Platforms" : p}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {topStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5" />{s.trend}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{isLoading ? "…" : s.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Platform-specific secondary metrics */}
      {hasData && (
        <div className="grid grid-cols-3 gap-4">
          {platformMetrics().map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{isLoading ? "…" : m.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart + Right Panel */}
      <div className="grid grid-cols-12 gap-6">

        {/* Bar Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Impressions Over Time</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasData ? `${chartData.length} data points · Filtered: ${platformFilter}` : "No data yet"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
              {["instagram","linkedin","website"].map(p => (
                <span key={p} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${
                    p === "instagram" ? "bg-pink-400" : p === "linkedin" ? "bg-blue-500" : "bg-emerald-500"
                  }`} />
                  <span className="capitalize">{p}</span>
                </span>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
          ) : !hasData ? (
            <div className="h-48 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-300"><BarChart3 className="w-10 h-10 mx-auto mb-2" /><p className="text-xs">No data yet</p></div>
            </div>
          ) : (
            <>
              {/* Y-axis grid lines */}
              <div className="relative h-48 flex items-end gap-1.5 pt-4">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                    style={{ bottom: `${i * 25}%` }} />
                ))}
                {chartData.map((a, i) => {
                  const pct = Math.max(((a.impressions || 0) / maxImp) * 100, 4);
                  const pk  = pKey(a.platform);
                  const src = SOURCE_BADGE[a.data_source] || SOURCE_BADGE.manual;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                        <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                          <p>{(a.impressions||0).toLocaleString()} views</p>
                          <p className="text-slate-400 capitalize">{pk} · {new Date(a.recorded_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                        </div>
                        <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1" />
                      </div>
                      <div
                        className={`w-full rounded-t-lg transition-all ${PLATFORM_BAR[pk] || "bg-primary"}`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis dates */}
              <div className="mt-2 flex gap-1.5">
                {chartData.map((a, i) => (
                  <div key={i} className="flex-1 text-center">
                    <p className="text-[9px] text-slate-400 font-medium truncate">
                      {new Date(a.recorded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">Platform Breakdown</h3>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
          ) : (
            <div className="space-y-4">
              {["instagram", "linkedin", "website"].map(p => {
                const pRows = analytics.filter(a => pKey(a.platform) === p);
                const pImp  = pRows.reduce((s, a) => s + (a.impressions || 0), 0);
                const pEng  = pRows.length > 0
                  ? (pRows.reduce((s, a) => s + (a.engagement_rate || 0), 0) / pRows.length).toFixed(1)
                  : "0.0";
                const totalAll = analytics.reduce((s, a) => s + (a.impressions || 0), 0);
                const sharePct = totalAll > 0 ? Math.round((pImp / totalAll) * 100) : 0;
                const barColor = p === "instagram" ? "bg-pink-400" : p === "linkedin" ? "bg-blue-500" : "bg-emerald-500";
                const badge = PLATFORM_BADGE[p];

                return (
                  <div key={p}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${badge}`}>{p}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-bold text-slate-900">{fmt(pImp)}</span>
                        <span className="text-[10px]">{pEng}% eng</span>
                        <span className="text-[10px] text-slate-400">{sharePct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${sharePct}%` }} />
                    </div>
                  </div>
                );
              })}

              {/* Data source legend */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Data Sources</p>
                {Object.entries(SOURCE_BADGE).filter(([key]) =>
                  analytics.some(a => a.data_source === key)
                ).map(([key, cfg]) => (
                  <div key={key} className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.style}`}>{cfg.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {analytics.filter(a => a.data_source === key).length} entries
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Analytics Detail Table */}
        <div className="col-span-12 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Analytics Log</h3>
              <p className="text-xs text-slate-400 mt-0.5">{filtered.length} entries · {platformFilter === "all" ? "All platforms" : platformFilter}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  {["Platform","Date","Impressions","Reach","Likes","Comments","Shares","Eng. Rate","Source"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={9} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-400 text-sm">No analytics data for this platform.</td></tr>
                ) : filtered.map(row => {
                  const pk  = pKey(row.platform);
                  const src = SOURCE_BADGE[row.data_source] || SOURCE_BADGE.manual;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${PLATFORM_BADGE[pk] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{pk}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(row.recorded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">{fmt(row.impressions)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(row.reach)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(row.likes)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(row.comments)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmt(row.shares)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          (row.engagement_rate || 0) >= 8 ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : (row.engagement_rate || 0) >= 5 ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}>
                          {fmtPct(row.engagement_rate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${src.style}`}>{src.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Post Activity Table */}
        <div className="col-span-12 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Post Activity</h3>
            <span className="text-xs text-slate-400">{deliverables.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  {["Post","Client","Platform","Status","Date"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></td></tr>
                ) : deliverables.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">No posts found.</td></tr>
                ) : deliverables.map(row => {
                  const pk = pKey(row.platform_target || row.platform);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-900 max-w-xs truncate">{row.task_name}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">{row.clients?.business_name || "—"}</td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PLATFORM_BADGE[pk] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{pk}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[row.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{row.status}</span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-400">
                        {new Date(row.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
