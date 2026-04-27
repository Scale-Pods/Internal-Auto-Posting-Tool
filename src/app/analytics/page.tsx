"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";

type AnalyticsRow = {
  id: string;
  post_id?: string;
  platform: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
  recorded_at: string;
  task_name?: string;
  clients?: { business_name: string };
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

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "text-pink-400",
  linkedin: "text-blue-400",
  website: "text-emerald-400",
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "photo_camera",
  linkedin: "business_center",
  website: "language",
};

function platformKey(p?: string) {
  return (p || "instagram").toLowerCase();
}

export default function AnalyticsDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);

    // Fetch analytics rows if the table exists
    const { data: analyticsData } = await supabase
      .from("social_analytics")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(100);

    // Fetch published deliverables for the post performance table
    const { data: delData } = await supabase
      .from("content_deliverables")
      .select("*, clients(business_name)")
      .in("status", ["Published", "Scheduled", "Ready for Publishing"])
      .order("created_at", { ascending: false })
      .limit(20);

    setAnalytics(analyticsData || []);
    setDeliverables(delData || []);
    setIsLoading(false);
  }

  // Aggregate totals from analytics rows
  const filtered = analytics.filter((a) =>
    platformFilter === "all" ? true : platformKey(a.platform) === platformFilter
  );

  const totalImpressions = filtered.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalReach = filtered.reduce((sum, a) => sum + (a.reach || 0), 0);
  const avgEngagementRate = filtered.length > 0
    ? (filtered.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / filtered.length).toFixed(2)
    : "0.00";
  const totalLikes = filtered.reduce((sum, a) => sum + (a.likes || 0), 0);

  const hasAnalytics = analytics.length > 0;

  // Chart bars: last 12 analytics entries impressions, scaled to %
  const chartData = filtered.slice(0, 12).reverse();
  const maxImp = Math.max(...chartData.map((a) => a.impressions || 0), 1);

  return (
    <div className="min-h-screen bg-background text-on-background flex font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto md:ml-64">
        {/* TopNavBar */}
        <header className="sticky top-0 z-40 w-full h-16 bg-surface-container-low/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Step 9</p>
              <h1 className="text-xl font-[900] text-white">Analytics Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Platform Filter */}
            <div className="flex items-center gap-2">
              {["all", "instagram", "linkedin", "website"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                    platformFilter === p
                      ? "bg-sp-primary/10 border-sp-primary/30 text-sp-primary"
                      : "border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  {p === "all" ? "All" : p}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">

          {/* No Analytics Data Banner */}
          {!isLoading && !hasAnalytics && (
            <div className="bg-sp-primary/5 border border-sp-primary/20 rounded-2xl p-6 flex items-center gap-4">
              <span className="material-symbols-outlined text-sp-primary text-3xl">info</span>
              <div>
                <p className="font-bold text-white">No analytics data yet</p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Analytics will populate once data is inserted into the <code className="bg-white/10 px-1 rounded text-sp-primary">social_analytics</code> table. 
                  The post history below reflects your current Supabase deliverables.
                </p>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Impressions", value: hasAnalytics ? totalImpressions.toLocaleString() : "—", icon: "visibility", color: "text-sp-primary bg-sp-primary/10" },
              { title: "Total Reach", value: hasAnalytics ? totalReach.toLocaleString() : "—", icon: "group", color: "text-sp-secondary bg-sp-secondary/10" },
              { title: "Avg. Engagement Rate", value: hasAnalytics ? `${avgEngagementRate}%` : "—", icon: "touch_app", color: "text-sp-tertiary bg-sp-tertiary/10" },
              { title: "Total Likes", value: hasAnalytics ? totalLikes.toLocaleString() : "—", icon: "favorite", color: "text-pink-400 bg-pink-400/10" },
            ].map((metric, i) => (
              <div key={i} className="bg-surface-container-low border border-white/5 p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-200 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.color}`}>
                    <span className="material-symbols-outlined text-xl">{metric.icon}</span>
                  </div>
                  {hasAnalytics && (
                    <div className="text-sp-secondary text-xs font-bold flex items-center bg-sp-secondary/10 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                      Live
                    </div>
                  )}
                </div>
                <p className="text-on-surface-variant text-sm font-bold mb-1">{metric.title}</p>
                <h3 className="text-3xl font-[900] text-white">{isLoading ? "..." : metric.value}</h3>
              </div>
            ))}
          </div>

          {/* Main Dashboard Area */}
          <div className="grid grid-cols-12 gap-6">

            {/* Impressions Chart */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white">Impressions Over Time</h3>
                  <p className="text-sm text-on-surface-variant">
                    {hasAnalytics ? `Showing last ${chartData.length} data points` : "No data yet — awaiting social_analytics entries"}
                  </p>
                </div>
              </div>

              {hasAnalytics ? (
                <>
                  <div className="relative h-48 w-full flex items-end justify-between gap-2">
                    <div className="absolute inset-0 grid grid-rows-4 w-full pointer-events-none">
                      {[0,1,2,3].map((i) => (
                        <div key={i} className="border-t border-white/5 border-dashed" />
                      ))}
                    </div>
                    {chartData.map((a, i) => {
                      const heightPct = Math.max(((a.impressions || 0) / maxImp) * 100, 4);
                      const pKey = platformKey(a.platform);
                      const barColor = pKey === "instagram" ? "bg-pink-400" : pKey === "linkedin" ? "bg-blue-400" : "bg-sp-primary";
                      return (
                        <div
                          key={i}
                          className={`relative flex-1 rounded-t-lg transition-all hover:opacity-80 ${barColor}`}
                          style={{ height: `${heightPct}%` }}
                          title={`${a.impressions?.toLocaleString() || 0} impressions`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] text-on-surface-variant font-bold">
                    {chartData.slice(0, 5).map((a, i) => (
                      <span key={i}>{new Date(a.recorded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    ))}
                    {chartData.length > 5 && <span>…</span>}
                    {chartData.length > 0 && <span>{new Date(chartData[chartData.length - 1].recorded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-600 block mb-2">bar_chart</span>
                    <p className="text-sm text-on-surface-variant">Chart will appear here once analytics data is available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Performing Posts (from deliverables) */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6">Published Posts</h3>
              <div className="space-y-3 flex-1">
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[0,1,2].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl" />)}
                  </div>
                ) : deliverables.filter(d => d.status === "Published").length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-8">
                    <span className="material-symbols-outlined text-3xl text-gray-600 mb-2">article</span>
                    <p className="text-sm text-on-surface-variant text-center">No published posts yet</p>
                  </div>
                ) : (
                  deliverables.filter(d => d.status === "Published").slice(0, 5).map((item) => {
                    const pKey = platformKey(item.platform_target || item.platform);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 ${PLATFORM_COLOR[pKey]}`}>
                          <span className="material-symbols-outlined text-[18px]">{PLATFORM_ICON[pKey] || "public"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{item.task_name}</h4>
                          <p className="text-xs text-on-surface-variant">{item.clients?.business_name}</p>
                        </div>
                        <span className="text-[10px] font-bold text-sp-secondary bg-sp-secondary/10 px-2 py-0.5 rounded-full">Live</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Post Performance Table */}
            <div className="col-span-12 bg-surface-container-low border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Recent Post Activity</h3>
                <span className="text-xs text-on-surface-variant">{deliverables.length} items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left">
                      <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Post</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Client</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Platform</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="w-8 h-8 border-2 border-sp-primary/20 border-t-sp-primary rounded-full animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : deliverables.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-sm">No posts found.</td>
                      </tr>
                    ) : (
                      deliverables.map((row) => {
                        const pKey = platformKey(row.platform_target || row.platform);
                        const statusStyle =
                          row.status === "Published" ? "text-sp-secondary bg-sp-secondary/10 border-sp-secondary/20" :
                          row.status === "Scheduled" ? "text-sp-primary bg-sp-primary/10 border-sp-primary/20" :
                          "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                        return (
                          <tr key={row.id} className="hover:bg-white/3 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-white line-clamp-1">{row.task_name}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">{row.clients?.business_name || "—"}</td>
                            <td className="px-6 py-4">
                              <span className={`flex items-center gap-1 text-xs font-bold ${PLATFORM_COLOR[pKey]}`}>
                                <span className="material-symbols-outlined text-[12px]">{PLATFORM_ICON[pKey] || "public"}</span>
                                {pKey}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-on-surface-variant">
                              {new Date(row.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
