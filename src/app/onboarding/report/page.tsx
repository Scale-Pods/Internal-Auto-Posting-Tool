"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Safe Lazy Initializer
let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (typeof window === "undefined") return null; // Never run on server
  
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      return null; // Return null instead of crashing
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("id");
    
    if (!clientId) { 
      setError("No client ID found in URL. Please start from onboarding."); 
      setLoading(false); 
      return; 
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase connection failed. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel.");
      setLoading(false);
      return;
    }

    let pollTimer: ReturnType<typeof setTimeout>;

    const pollForStrategy = async (attempt = 0) => {
      // Max 60 attempts × 5s = 5 minutes timeout
      if (attempt > 60) {
        setError("AI Strategy generation is taking longer than expected. Please check your n8n workflow or try again later.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .single();

        if (dbError || !data) {
          setError("Could not find your business data. Please try onboarding again.");
          setLoading(false);
          return;
        }

        setClient(data);

        // Check if strategy is ready and not just a placeholder
        if (data.strategy_json && data.strategy_json !== "=" && data.strategy_json !== "" && data.strategy_json !== "null") {
          const rawStrategy = data.strategy_json;
          let parsed: StrategyJson;
          
          try {
            // Handle single OR double encoded JSON from n8n
            // n8n sometimes double-stringifies: JSON.stringify(JSON.stringify(obj))
            let value: unknown = typeof rawStrategy === "string" ? JSON.parse(rawStrategy) : rawStrategy;
            
            // Unwrap up to 2 more times if still a string (double/triple encoding)
            if (typeof value === "string") value = JSON.parse(value);
            if (typeof value === "string") value = JSON.parse(value);
            
            parsed = value as StrategyJson;
            
            // If it's an error object from n8n
            if (parsed.error) {
              setError(`AI Error: ${parsed.error}. Please check n8n logs.`);
              setLoading(false);
              return;
            }

            // Verify it has actual strategy content before showing
            if (!parsed.executive_summary) {
              // Not a valid strategy yet, keep polling
              pollTimer = setTimeout(() => pollForStrategy(attempt + 1), 5000);
              return;
            }

            setStrategy(parsed);
            setLoading(false);
          } catch (e) {
            console.error("JSON Parse Error:", e);
            // Don't error out yet, maybe it's still being written
            pollTimer = setTimeout(() => pollForStrategy(attempt + 1), 5000);
          }
        } else {
          // Not ready — poll again
          pollTimer = setTimeout(() => pollForStrategy(attempt + 1), 5000);
        }
      } catch (e) {
        console.error("Polling error:", e);
        pollTimer = setTimeout(() => pollForStrategy(attempt + 1), 5000);
      }
    };

    pollForStrategy();
    return () => clearTimeout(pollTimer);
  }, []);

  // Prevent SSR issues
  if (!isClient) return null;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!strategy) return <ErrorState message="Strategy data is being prepared..." />;

  const competitors = strategy?.competitor_analysis?.competitors ?? [];
  const contentPillars = strategy?.content_strategy?.content_pillars ?? [];
  const platforms = strategy?.content_strategy?.platforms ?? [];
  const kpis = strategy?.kpis ?? [];
  const growthTactics = strategy?.growth_tactics ?? [];
  const differentiators = strategy?.brand_positioning?.key_differentiators ?? [];

  const pillarColors = ["bg-orange-100 text-orange-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700"];

  return (
    <div className="bg-[#f8f7f5] min-h-screen font-sans antialiased text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-slate-900">FlowPilot AI</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Analysis Complete
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
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">Deep Audit Strategy Report</p>
            <h1 className="text-4xl font-black text-slate-900 mb-2">{client?.business_name}</h1>
            <p className="text-slate-500 text-lg">Your customized marketing roadmap generated by AI.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <SectionTitle icon="description" label="Executive Summary" />
              <p className="text-slate-700 leading-relaxed text-lg">{strategy.executive_summary}</p>
            </Card>

            <Card>
              <SectionTitle icon="stars" label="Brand Positioning" />
              <div className="space-y-6">
                <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                  <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Unique Value Proposition</h4>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{strategy.brand_positioning?.unique_value_proposition}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Brand Voice</h4>
                    <p className="text-slate-700">{strategy.brand_positioning?.brand_voice}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Differentiators</h4>
                    <div className="flex flex-wrap gap-2">
                      {differentiators.map((d, i) => (
                        <span key={i} className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm font-medium">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle icon="groups" label="Target Audience" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AudienceBox title="Primary" data={strategy.target_audience?.primary} />
                <AudienceBox title="Secondary" data={strategy.target_audience?.secondary} />
              </div>
            </Card>

            <Card>
              <SectionTitle icon="account_tree" label="Content Strategy" />
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Content Pillars</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {contentPillars.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${pillarColors[i % pillarColors.length]}`}>
                          {p.percentage}%
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.pillar}</p>
                          <p className="text-sm text-slate-500">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-200">
              <SectionTitle icon="monitoring" label="Competitor Analysis" isDark />
              <div className="space-y-6">
                {competitors.map((c, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      {c.name}
                    </p>
                    <div className="pl-4 border-l border-slate-700 space-y-2">
                      <p className="text-xs text-slate-400"><span className="text-red-400 font-bold">Weakness:</span> {c.weaknesses?.[0]}</p>
                      <p className="text-xs text-slate-400"><span className="text-emerald-400 font-bold">Opportunity:</span> {c.opportunities?.[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <SectionTitle icon="ads_click" label="Growth Tactics" />
              <div className="space-y-4">
                {growthTactics.map((t, i) => (
                  <div key={i} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <span className="text-orange-500 font-bold">0{i+1}</span>
                    {t}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">{children}</div>;
}

function SectionTitle({ icon, label, isDark = false }: { icon: string; label: string; isDark?: boolean }) {
  return (
    <h3 className={`flex items-center gap-3 font-black text-xl mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <span className="material-symbols-outlined text-orange-500">{icon}</span>
      {label}
    </h3>
  );
}

function AudienceBox({ title, data }: { title: string; data: any }) {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
      <h4 className="font-bold text-slate-900 mb-3">{title} Audience</h4>
      <p className="text-sm text-slate-600 mb-4">{data?.description}</p>
      <div className="space-y-2">
        {data?.pain_points?.slice(0, 3).map((pp: string, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
            {pp}
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-6 text-center">
      <div className="max-w-sm">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 animate-bounce">
          <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">cyclone</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">AI Deep Audit in progress...</h2>
        <p className="text-slate-500 mb-8">Our agents are analyzing your website, competitors, and market data. This takes about 30 seconds.</p>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div className="bg-orange-500 h-full animate-[progress_10s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Configuration Needed</h2>
        <p className="text-slate-600 mb-8 leading-relaxed font-medium">{message}</p>
        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            Check Again
          </button>
          <Link href="/onboarding" className="block w-full py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Restart Onboarding
          </Link>
        </div>
      </div>
    </div>
  );
}
