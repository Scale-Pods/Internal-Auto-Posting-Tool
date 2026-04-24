"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only created in the browser, never at build time
let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase credentials missing. Please check your environment variables.");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

interface StrategyJson {
  executive_summary?: string;
  brand_positioning?: { unique_value_proposition?: string; brand_voice?: string; key_differentiators?: string[] };
  target_audience?: { primary?: { description?: string; pain_points?: string[] }; secondary?: { description?: string; pain_points?: string[] } };
  competitor_analysis?: { competitors?: { name?: string; website?: string; strengths?: string[]; weaknesses?: string[]; opportunities?: string[] }[] };
  content_strategy?: { platforms?: { platform?: string; content_types?: string[]; posting_frequency?: string; best_times?: string }[]; content_pillars?: { pillar?: string; percentage?: number; description?: string }[] };
  growth_tactics?: string[];
  kpis?: { metric?: string; target?: string }[];
  [key: string]: unknown;
}

interface ClientData {
  id: string;
  business_name: string;
  industry_type: string;
  website_url: string;
  strategy_json: StrategyJson | string | null;
  brand_tone: string;
  primary_goal: string;
  competitors: string;
}

export default function StrategyReportPage() {
  const [client, setClient] = useState<ClientData | null>(null);
  const [strategy, setStrategy] = useState<StrategyJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("id");
    if (!clientId) { setError("No client ID in URL."); setLoading(false); return; }

    const supabase = getSupabase();
    let pollTimer: ReturnType<typeof setTimeout>;

    const pollForStrategy = async (attempt = 0) => {
      // Max 36 attempts × 5s = 3 minutes timeout
      if (attempt > 36) {
        setError("Strategy generation timed out. Please go back and try again.");
        setLoading(false);
        return;
      }

      const { data, error: dbError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (dbError || !data) {
        setError("Could not load client data. Please try again.");
        setLoading(false);
        return;
      }

      setClient(data);

      if (data.strategy_json && data.strategy_json !== "=" && data.strategy_json !== "") {
        // Strategy is ready — parse and display
        try {
          const parsed = typeof data.strategy_json === "string"
            ? JSON.parse(data.strategy_json)
            : data.strategy_json;
          setStrategy(parsed);
          setLoading(false);
        } catch {
          setError("Strategy data format is invalid. Please regenerate.");
          setLoading(false);
        }
      } else {
        // Not ready yet — poll again in 5 seconds
        pollTimer = setTimeout(() => pollForStrategy(attempt + 1), 5000);
      }
    };

    pollForStrategy();

    return () => clearTimeout(pollTimer);
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!strategy) return <ErrorState message="No strategy data found." />;

  const competitors = strategy?.competitor_analysis?.competitors ?? [];
  const contentPillars = strategy?.content_strategy?.content_pillars ?? [];
  const platforms = strategy?.content_strategy?.platforms ?? [];
  const kpis = strategy?.kpis ?? [];
  const growthTactics = strategy?.growth_tactics ?? [];
  const differentiators = strategy?.brand_positioning?.key_differentiators ?? [];

  const pillarColors = ["bg-orange-100 text-orange-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700"];

  return (
    <div className="bg-[#f8f7f5] min-h-screen font-sans antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-slate-900">FlowPilot AI</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Strategy Ready
            </span>
          </div>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
            Skip to Dashboard →
          </Link>
        </div>
      </header>

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4">
        {/* Hero */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">AI Deep Audit Report</p>
            <h1 className="text-4xl font-black text-slate-900 mb-2">{client?.business_name} — Marketing Strategy</h1>
            <p className="text-slate-500 text-lg">Based on live web research of your site and competitors.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span> Download PDF
            </button>
            <Link href="/dashboard" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">dashboard</span> Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Executive Summary */}
            <Card>
              <SectionTitle icon="flag" label="Executive Summary" />
              <p className="text-slate-700 leading-relaxed text-base">{strategy.executive_summary ?? "No summary generated."}</p>
            </Card>

            {/* Brand Positioning */}
            {strategy.brand_positioning && (
              <Card>
                <SectionTitle icon="diamond" label="Brand Positioning" />
                <div className="space-y-4">
                  {strategy.brand_positioning.unique_value_proposition && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Unique Value Proposition</p>
                      <p className="text-slate-800 font-semibold leading-relaxed">{strategy.brand_positioning.unique_value_proposition}</p>
                    </div>
                  )}
                  {strategy.brand_positioning.brand_voice && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Brand Voice</p>
                      <p className="text-slate-800 leading-relaxed">{strategy.brand_positioning.brand_voice}</p>
                    </div>
                  )}
                  {differentiators.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Differentiators</p>
                      <div className="flex flex-wrap gap-2">
                        {differentiators.map((d, i) => (
                          <span key={i} className="bg-orange-50 text-orange-800 border border-orange-200 text-sm font-medium px-3 py-1 rounded-full">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Target Audience */}
            {strategy.target_audience && (
              <Card>
                <SectionTitle icon="group" label="Target Audience" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategy.target_audience.primary && (
                    <AudienceCard title="Primary Audience" data={strategy.target_audience.primary} color="orange" />
                  )}
                  {strategy.target_audience.secondary && (
                    <AudienceCard title="Secondary Audience" data={strategy.target_audience.secondary} color="blue" />
                  )}
                </div>
              </Card>
            )}

            {/* Content Pillars */}
            {contentPillars.length > 0 && (
              <Card>
                <SectionTitle icon="view_kanban" label="Content Pillars" />
                <div className="space-y-3">
                  {contentPillars.map((p, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className={`shrink-0 text-xs font-black px-2.5 py-1 rounded-lg ${pillarColors[i % pillarColors.length]}`}>
                        {p.percentage != null ? `${p.percentage}%` : "—"}
                      </span>
                      <div>
                        <h5 className="font-bold text-slate-900 mb-0.5">{p.pillar}</h5>
                        <p className="text-sm text-slate-500">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Platform Strategy */}
            {platforms.length > 0 && (
              <Card>
                <SectionTitle icon="devices" label="Platform Strategy" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms.map((p, i) => (
                    <div key={i} className="p-5 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                      <h5 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500 text-base">public</span>
                        {p.platform}
                      </h5>
                      {p.posting_frequency && <p className="text-xs text-slate-500 mb-2">📅 {p.posting_frequency}</p>}
                      {p.best_times && <p className="text-xs text-slate-500 mb-3">⏰ {p.best_times}</p>}
                      {(p.content_types ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(p.content_types ?? []).map((ct, j) => (
                            <span key={j} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{ct}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Growth Tactics */}
            {growthTactics.length > 0 && (
              <Card>
                <SectionTitle icon="trending_up" label="Growth Tactics" />
                <ul className="space-y-3">
                  {growthTactics.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <span className="mt-0.5 w-6 h-6 shrink-0 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-6">
            {/* Competitor Intel */}
            {competitors.length > 0 && (
              <div className="bg-slate-900 text-white p-6 rounded-2xl">
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-400">radar</span>
                  Competitor Intel
                </h3>
                <div className="space-y-5">
                  {competitors.map((c, i) => (
                    <div key={i}>
                      <p className="font-bold text-white text-sm mb-2">{c.name ?? `Competitor ${i + 1}`}</p>
                      {(c.weaknesses ?? []).length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">Weaknesses</p>
                          {(c.weaknesses ?? []).map((w, j) => (
                            <p key={j} className="text-xs text-slate-400 leading-relaxed">• {w}</p>
                          ))}
                        </div>
                      )}
                      {(c.opportunities ?? []).length > 0 && (
                        <div>
                          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Opportunities</p>
                          {(c.opportunities ?? []).map((o, j) => (
                            <p key={j} className="text-xs text-slate-400 leading-relaxed">• {o}</p>
                          ))}
                        </div>
                      )}
                      {i < competitors.length - 1 && <div className="mt-4 border-t border-slate-800" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs */}
            {kpis.length > 0 && (
              <Card>
                <SectionTitle icon="bar_chart" label="Target KPIs" />
                <div className="space-y-3">
                  {kpis.map((k, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-600">{k.metric}</span>
                      <span className="text-sm font-bold text-orange-600">{k.target}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* CTA */}
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl">
              <h3 className="font-bold text-slate-900 text-lg mb-2">Ready to execute?</h3>
              <p className="text-sm text-slate-600 mb-5">Generate your first month of content based on this strategy.</p>
              <div className="space-y-3">
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-md">
                  <span className="material-symbols-outlined text-sm">magic_button</span>
                  Generate Content Calendar
                </button>
                <Link href="/dashboard" className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 block text-center">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">{children}</div>;
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <h3 className="font-bold text-xl text-slate-900 mb-5 flex items-center gap-2.5">
      <span className="material-symbols-outlined text-orange-500">{icon}</span>
      {label}
    </h3>
  );
}

function AudienceCard({ title, data, color }: { title: string; data: { description?: string; pain_points?: string[] }; color: string }) {
  const colorMap: Record<string, string> = { orange: "bg-orange-50 border-orange-200", blue: "bg-blue-50 border-blue-200" };
  return (
    <div className={`p-5 rounded-xl border ${colorMap[color] ?? "bg-slate-50 border-slate-200"}`}>
      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
      {data.description && <p className="text-sm text-slate-600 mb-3">{data.description}</p>}
      {(data.pain_points ?? []).length > 0 && (
        <ul className="space-y-1.5">
          {(data.pain_points ?? []).map((pp, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
              {pp}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-3 bg-orange-50 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-500 text-2xl">smart_toy</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AI is working on your strategy...</h2>
        <p className="text-slate-500 mb-4">Our agent is scraping your website and competitors live. This usually takes 20–30 seconds.</p>
        <p className="text-xs text-slate-400 bg-slate-100 rounded-lg px-4 py-2 inline-block">This page will update automatically — no need to refresh.</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center px-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Analysis Error</h2>
        <p className="text-slate-600 text-base mb-8 leading-relaxed">{message}</p>
        <div className="flex flex-col gap-3">
          <Link 
            href="/onboarding" 
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Try Onboarding Again
          </Link>
          <Link 
            href="/dashboard" 
            className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
