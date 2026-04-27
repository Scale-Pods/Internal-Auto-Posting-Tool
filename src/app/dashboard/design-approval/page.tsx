"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck, Loader2, ChevronRight, Check, AlertCircle,
  RotateCcw, Image as ImageIcon, MessageSquare, Clock, ExternalLink
} from "lucide-react";

type Client = {
  id: string;
  business_name: string;
  status: string;
  content_json: any;
  design_urls: string[] | null;
  design_feedback: string | null;
  revision_history: any[] | null;
  design_submitted_by: string | null;
  figma_url: string | null;
  canva_url: string | null;
};

export default function DesignApprovalPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeDesignIdx, setActiveDesignIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"instagram" | "linkedin">("instagram");

  useEffect(() => {
    fetchClients();
    const id = setInterval(() => fetchClients(true), 8000);
    return () => clearInterval(id);
  }, []);

  const fetchClients = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("id, business_name, status, content_json, design_urls, design_feedback, revision_history, design_submitted_by, figma_url, canva_url")
      .in("status", ["Design Ready for Review", "Design Approved", "Design Revision Requested"]);
    if (data) setClients(data);
    if (!silent) setLoading(false);
  };

  const selectClient = (id: string) => {
    setSelectedClientId(id);
    setRevisionFeedback("");
    setActiveDesignIdx(0);
    setActiveTab("instagram");
  };

  const handleApprove = async () => {
    if (!selectedClient) return;
    setProcessing(true);

    const newRevision = {
      action: "Design Approved",
      by: "Admin",
      timestamp: new Date().toISOString(),
    };
    const history = [...(selectedClient.revision_history || []), newRevision];

    await supabase.from("clients").update({
      status: "Design Approved",
      revision_history: history,
    }).eq("id", selectedClient.id);

    setClients(prev => prev.map(c =>
      c.id === selectedClient.id ? { ...c, status: "Design Approved", revision_history: history } : c
    ));
    setProcessing(false);
  };

  const handleRequestChanges = async () => {
    if (!selectedClient || !revisionFeedback.trim()) {
      alert("Please describe the changes needed.");
      return;
    }
    setProcessing(true);

    const newRevision = {
      action: "Revision Requested",
      feedback: revisionFeedback,
      by: "Admin",
      timestamp: new Date().toISOString(),
    };
    const history = [...(selectedClient.revision_history || []), newRevision];

    await supabase.from("clients").update({
      status: "Design Revision Requested",
      design_feedback: revisionFeedback,
      revision_history: history,
    }).eq("id", selectedClient.id);

    setClients(prev => prev.map(c =>
      c.id === selectedClient.id ? { ...c, status: "Design Revision Requested", design_feedback: revisionFeedback, revision_history: history } : c
    ));
    setRevisionFeedback("");
    setProcessing(false);
  };

  const parsedContent = (() => {
    if (!selectedClient?.content_json) return null;
    try {
      return typeof selectedClient.content_json === "string"
        ? JSON.parse(selectedClient.content_json)
        : selectedClient.content_json;
    } catch { return null; }
  })();

  const platformData = parsedContent?.[activeTab];

  const statusBadge = (status: string) => {
    if (status === "Design Approved") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Approved</span>;
    if (status === "Design Revision Requested") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" /> Revision</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Pending</span>;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-h2 text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          Design Approval
        </h1>
        <p className="text-slate-500 mt-1">Review uploaded designs against AI content specs. Approve or request revisions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Client Queue */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm sticky top-6">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-sm">Design Queue</h2>
          </div>
          <div className="p-2 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No designs submitted for review yet.</div>
            ) : (
              clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${selectedClient?.id === client.id ? "bg-primary/5 border-primary/20 shadow-sm border" : "border border-transparent hover:bg-slate-50"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{client.business_name}</p>
                    <div className="mt-1">{statusBadge(client.status)}</div>
                    {client.design_submitted_by && (
                      <p className="text-[10px] text-slate-400 mt-1">By: {client.design_submitted_by}</p>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ml-2 ${selectedClient?.id === client.id ? "text-primary" : "text-slate-300"}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Review Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {!selectedClient ? (
            <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center p-16 shadow-sm text-center h-full">
              <div>
                <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="font-semibold text-slate-600">Select a client to review their design</p>
              </div>
            </div>
          ) : (
            <>
              {/* Top: Design Image(s) */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-slate-800 text-sm">Submitted Design — {selectedClient.business_name}</h3>
                    {selectedClient.status === "Design Approved" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Approved</span>
                    )}
                  </div>
                  {selectedClient.design_urls && selectedClient.design_urls.length > 1 && (
                    <div className="flex gap-1">
                      {selectedClient.design_urls.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveDesignIdx(i)}
                          className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${activeDesignIdx === i ? "bg-primary text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-100 flex items-center justify-center min-h-[280px]">
                  {!selectedClient.design_urls || selectedClient.design_urls.length === 0 ? (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      
                      {selectedClient.canva_url ? (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-600">Design submitted via Canva Link</p>
                            <a 
                              href={selectedClient.canva_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors shadow-md w-full max-w-xs mx-auto"
                            >
                              <ExternalLink className="w-5 h-5" /> Open Design in Canva
                            </a>
                            <p className="text-xs text-purple-600/70 truncate max-w-md mx-auto pt-2">{selectedClient.canva_url}</p>
                        </div>
                      ) : selectedClient.figma_url ? (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-600">Design submitted via Figma Link</p>
                          <a 
                            href={selectedClient.figma_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                            <ExternalLink className="w-4 h-4" /> Open Design in Figma
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm">No design uploaded yet.</p>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={selectedClient.design_urls[activeDesignIdx]}
                        alt="Design"
                        className="max-h-[400px] max-w-full object-contain rounded-xl shadow-lg"
                      />
                      <a
                        href={selectedClient.design_urls[activeDesignIdx]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-lg hover:bg-black/70 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Content Spec Reference */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-slate-800 text-sm">Original Content Brief</h3>
                  </div>
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                    {["instagram", "linkedin"].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab as any)}
                        className={`px-3 py-1.5 text-xs font-bold capitalize transition-all ${activeTab === tab ? "bg-primary text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                        {tab === "instagram" ? "📸 IG" : "💼 LI"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-5 space-y-5">
                  {!parsedContent ? (
                    <p className="text-slate-400 italic text-sm text-center py-6">No content spec.</p>
                  ) : !platformData ? (
                    <p className="text-slate-400 italic text-sm text-center py-6">No {activeTab} content.</p>
                  ) : (
                    platformData.map((post: any, idx: number) => (
                      <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                          <span className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> {post.format}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Post #{idx + 1}</span>
                        </div>
                        <div className="p-5 space-y-5">
                          {post.slides?.map((slide: any, si: number) => (
                            <div key={si} className="bg-slate-50/50 rounded-xl p-5 border border-slate-200 space-y-4">
                              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">SLIDE {slide.slide_number || si + 1}</p>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Visual</p>
                                <p className="text-base text-slate-800 leading-relaxed">{slide.visual_description}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Text on Image</p>
                                <p className="text-lg font-bold text-slate-900 bg-white px-4 py-3 rounded-lg border border-slate-200 leading-relaxed">{slide.text_on_image}</p>
                              </div>
                              {slide.designer_notes && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">Designer Notes</p>
                                  <p className="text-sm text-amber-900 font-medium leading-relaxed">{slide.designer_notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Caption</p>
                            <p className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{post.caption}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Revision History */}
              {selectedClient.revision_history && selectedClient.revision_history.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-slate-800 text-sm">Revision History</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {selectedClient.revision_history.map((r: any, i: number) => (
                      <div key={i} className={`flex gap-3 p-3 rounded-xl border text-sm ${r.action === "Design Approved" ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                        <span className="shrink-0 mt-0.5">{r.action === "Design Approved" ? "✅" : "🔄"}</span>
                        <div>
                          <p className="font-bold text-slate-800">{r.action} <span className="font-normal text-slate-400 text-xs">— {r.by}</span></p>
                          {r.feedback && <p className="text-slate-600 mt-1">{r.feedback}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(r.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Footer */}
              {selectedClient.status === "Design Ready for Review" && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Decision</p>
                  <div className="flex gap-3 items-start">
                    <textarea
                      value={revisionFeedback}
                      onChange={e => setRevisionFeedback(e.target.value)}
                      placeholder="Describe changes needed (required for requesting revisions)..."
                      rows={2}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleRequestChanges}
                      disabled={processing || !revisionFeedback.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-bold text-sm rounded-lg transition-all"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Request Revisions
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-sm rounded-lg transition-all"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve Design
                    </button>
                  </div>
                </div>
              )}

              {selectedClient.status === "Design Approved" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-800">Design Approved!</p>
                    <p className="text-sm text-emerald-700">This post is ready to be scheduled for publishing.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
