"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Send, Loader2, ExternalLink, CheckCircle2,
  Image as ImageIcon, RefreshCw, Filter, ChevronRight, Zap, Clock, X
} from "lucide-react";

type Deliverable = {
  id: string;
  task_name: string;
  post_type?: string;
  platform: string;
  platform_target?: string;
  topic?: string;
  caption?: string;
  status: string;
  created_at: string;
  scheduled_time?: string;
  media_url?: string;
  client_id: string;
  clients?: { business_name: string };
};

const PLATFORM_CONFIG: Record<string, { label: string; color: string; badge: string; border: string }> = {
  instagram: { label: "Instagram", color: "text-pink-700", badge: "bg-pink-50 text-pink-700 border-pink-200", border: "border-l-pink-400" },
  linkedin:  { label: "LinkedIn",  color: "text-blue-700", badge: "bg-blue-50 text-blue-700 border-blue-200",  border: "border-l-blue-400"  },
  website:   { label: "Website",   color: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "border-l-emerald-400" },
};

function pKey(p?: string) { return (p || "instagram").toLowerCase(); }

function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ReadyToPostPage() {
  const [readyItems, setReadyItems]       = useState<Deliverable[]>([]);
  const [publishedItems, setPublishedItems] = useState<Deliverable[]>([]);
  const [scheduledItems, setScheduledItems] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [activeTab, setActiveTab]         = useState<"ready" | "scheduled" | "published">("ready");

  // Preview modal
  const [previewItem, setPreviewItem]     = useState<Deliverable | null>(null);
  const [isPublishing, setIsPublishing]   = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setIsLoading(true);
    const { data } = await supabase
      .from("content_deliverables")
      .select("*, clients(business_name)")
      .in("status", ["Ready for Publishing", "Scheduled", "Published"])
      .order("created_at", { ascending: false });

    const all = data || [];
    setReadyItems(all.filter(d => d.status === "Ready for Publishing"));
    setScheduledItems(all.filter(d => d.status === "Scheduled"));
    setPublishedItems(all.filter(d => d.status === "Published"));
    setIsLoading(false);
  }

  async function markPublished(item: Deliverable) {
    setIsPublishing(item.id);
    try {
      const { error } = await supabase
        .from("content_deliverables")
        .update({ status: "Published" })
        .eq("id", item.id);
      if (error) throw error;
      await fetchItems();
      setPreviewItem(null);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsPublishing(null);
    }
  }

  const tabItems = activeTab === "ready" ? readyItems : activeTab === "scheduled" ? scheduledItems : publishedItems;
  const filtered = tabItems.filter(d => platformFilter === "all" ? true : pKey(d.platform_target || d.platform) === platformFilter);

  const TABS = [
    { id: "ready",     label: "Ready to Post", count: readyItems.length,     color: "text-amber-600 border-amber-400" },
    { id: "scheduled", label: "Scheduled",     count: scheduledItems.length, color: "text-primary border-primary"     },
    { id: "published", label: "Published",     count: publishedItems.length, color: "text-emerald-600 border-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-h1 text-slate-900">Ready to Post</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {readyItems.length} item{readyItems.length !== 1 ? "s" : ""} awaiting publish
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchItems} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/dashboard/calendar"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-all shadow-sm"
          >
            <Clock className="w-4 h-4" /> Go to Calendar
          </Link>
        </div>
      </div>

      {/* Tabs + Platform Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 gap-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap
                ${activeTab === tab.id ? tab.color : "text-slate-400 border-transparent hover:text-slate-700"}`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black
                ${activeTab === tab.id ? "bg-current/10" : "bg-slate-100 text-slate-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-1 ml-auto bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
          {["all", "instagram", "linkedin", "website"].map(p => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-2.5 py-1 rounded text-xs font-bold capitalize transition-all
                ${platformFilter === p ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          {activeTab === "ready" ? (
            <>
              <Zap className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-lg font-bold text-slate-600">No content ready to publish</p>
              <p className="text-sm text-slate-400 mt-1">Content needs to complete the Design Approval stage first.</p>
            </>
          ) : activeTab === "scheduled" ? (
            <>
              <Clock className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-lg font-bold text-slate-600">No scheduled posts</p>
              <p className="text-sm text-slate-400 mt-1">Use the Calendar to schedule ready content.</p>
              <Link href="/dashboard/calendar" className="mt-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-all">
                Open Calendar
              </Link>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-lg font-bold text-slate-600">No published posts yet</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => {
            const pk  = pKey(item.platform_target || item.platform);
            const cfg = PLATFORM_CONFIG[pk] || PLATFORM_CONFIG.instagram;
            const mediaUrls = item.media_url?.split(",").filter(Boolean) || [];
            const firstMedia = mediaUrls[0];
            const isImg = firstMedia && !firstMedia.toLowerCase().includes("figma") && !firstMedia.toLowerCase().includes("canva") && !firstMedia.toLowerCase().includes(".pdf");

            return (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer group border-l-4 ${cfg.border}`}
              >
                {/* Media thumbnail or placeholder */}
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  {isImg ? (
                    <img src={firstMedia} alt={item.task_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : firstMedia ? (
                    <a
                      href={firstMedia}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <ExternalLink className="w-6 h-6 text-primary" />
                      <span className="text-xs font-bold text-primary">Open Design Link</span>
                    </a>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    </div>
                  )}

                  {/* Platform badge */}
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded border shadow-sm ${cfg.badge}`}>
                    {cfg.label}
                  </span>

                  {/* Carousel count */}
                  {mediaUrls.length > 1 && (
                    <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      1/{mediaUrls.length}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">{item.clients?.business_name}</p>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{item.task_name}</h3>
                  {item.topic && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.topic}</p>}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {item.scheduled_time && (
                        <span className="flex items-center gap-1 text-[10px] text-primary font-semibold">
                          <Clock className="w-3 h-3" />{formatTime(item.scheduled_time)}
                        </span>
                      )}
                      {!item.scheduled_time && (
                        <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Preview / Publish Modal ── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPublishing && setPreviewItem(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PLATFORM_CONFIG[pKey(previewItem.platform_target || previewItem.platform)]?.badge || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {(previewItem.platform_target || previewItem.platform || "").toUpperCase()}
                  </span>
                  {previewItem.post_type && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                      {previewItem.post_type}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">{previewItem.task_name}</h3>
                <p className="text-xs text-slate-400">{previewItem.clients?.business_name}</p>
              </div>
              {!isPublishing && (
                <button onClick={() => setPreviewItem(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors ml-4">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Media */}
              {previewItem.media_url && (() => {
                const urls = previewItem.media_url.split(",").filter(Boolean);
                const isImg = urls[0] && !urls[0].toLowerCase().includes("figma") && !urls[0].toLowerCase().includes("canva");
                return (
                  <div className="rounded-xl overflow-hidden border border-slate-100">
                    {isImg ? (
                      <img src={urls[0]} alt="" className="w-full max-h-60 object-contain bg-slate-50" />
                    ) : (
                      <a href={urls[0]} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-4 bg-slate-50 text-primary font-semibold text-sm hover:bg-slate-100 transition-colors">
                        <ExternalLink className="w-4 h-4" /> Open Design File
                      </a>
                    )}
                    {urls.length > 1 && (
                      <div className="p-2 bg-slate-50 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold">{urls.length} assets in this post</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Topic */}
              {previewItem.topic && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Content Brief</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                    {previewItem.topic}
                  </p>
                </div>
              )}

              {/* Scheduled time */}
              {previewItem.scheduled_time && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Scheduled for</p>
                    <p className="text-sm font-bold text-primary">{formatTime(previewItem.scheduled_time)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setPreviewItem(null)}
                disabled={!!isPublishing}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Close
              </button>
              {previewItem.status !== "Published" && (
                <button
                  onClick={() => markPublished(previewItem)}
                  disabled={!!isPublishing}
                  className="flex-1 bg-primary hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  {isPublishing === previewItem.id
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Marking…</>
                    : <><CheckCircle2 className="w-4 h-4" /> Mark as Published</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
