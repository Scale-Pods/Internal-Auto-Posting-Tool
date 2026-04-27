"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Clock, Loader2, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

type Deliverable = {
  id: string;
  task_name: string;
  post_type?: string;
  platform: string;
  platform_target?: string;
  topic?: string;
  status: string;
  created_at: string;
  assigned_designer?: string;
  rework_comments?: string;
  clients?: { business_name: string };
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; section: string }> = {
  "Pending Content Approval": { label: "Pending Content Approval", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200", section: "⏳ Awaiting Content Approval" },
  "Pending Design":           { label: "Pending Design",           color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",  section: "🎨 In Design" },
  "Rework Needed":            { label: "Rework Needed",            color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",   section: "🔁 Rework Required" },
  "Awaiting Review":          { label: "Awaiting Review",          color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200",section: "🔍 In Design Review" },
  "Ready for Publishing":     { label: "Ready to Publish",         color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",section: "✅ Ready to Publish" },
};

const SECTIONS = [
  "Pending Content Approval",
  "Pending Design",
  "Rework Needed",
  "Awaiting Review",
  "Ready for Publishing",
];

export default function WorkStatusPage() {
  const [items, setItems]       = useState<Deliverable[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase
      .from("content_deliverables")
      .select("*, clients(business_name)")
      .in("status", SECTIONS)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  const grouped = SECTIONS.reduce((acc, s) => {
    acc[s] = items.filter(i => i.status === s);
    return acc;
  }, {} as Record<string, Deliverable[]>);

  const totalActive = items.length;

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-h1 text-slate-900">Ongoing Work</h1>
            <p className="text-slate-500 text-sm mt-0.5">{totalActive} tasks in progress across all stages</p>
          </div>
        </div>
        <button onClick={fetchItems} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Pipeline progress summary */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pipeline Overview</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SECTIONS.map(s => {
            const cfg   = STATUS_CONFIG[s];
            const count = grouped[s]?.length || 0;
            return (
              <div key={s} className={`rounded-lg border p-3 flex flex-col gap-1 ${cfg.bg} ${cfg.border}`}>
                <span className={`text-2xl font-black ${cfg.color}`}>{count}</span>
                <span className={`text-[10px] font-bold leading-tight ${cfg.color} opacity-80`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-300 mb-4" />
          <p className="text-lg font-bold text-slate-600">Nothing in progress</p>
          <p className="text-sm text-slate-400 mt-1">All tasks are either complete or not started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {SECTIONS.map(s => {
            const sectionItems = grouped[s] || [];
            if (sectionItems.length === 0) return null;
            const cfg = STATUS_CONFIG[s];
            return (
              <section key={s}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-black uppercase tracking-widest ${cfg.color}`}>{cfg.section}</span>
                  <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {sectionItems.length}
                  </span>
                  <div className={`flex-1 h-px ${cfg.bg}`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sectionItems.map(item => (
                    <TaskCard key={item.id} item={item} cfg={cfg} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskCard({ item, cfg }: { item: Deliverable; cfg: any }) {
  const initials = (item.clients?.business_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const pk = (item.platform_target || item.platform || "instagram").toLowerCase();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-orange-300 flex items-center justify-center text-white font-black text-xs shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 line-clamp-2">{item.task_name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.clients?.business_name}</p>
        </div>
      </div>

      {item.rework_comments && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700 line-clamp-2">
          {item.rework_comments}
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{pk}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{item.post_type || "Post"}</span>
        <span className="text-[10px] text-slate-400 ml-auto">
          {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}
