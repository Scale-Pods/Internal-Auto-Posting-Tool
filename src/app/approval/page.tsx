"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";

type Deliverable = {
  id: string;
  task_name: string;
  post_type: string;
  platform: string;
  topic: string;
  status: string;
  created_at: string;
  client_id: string;
  rework_comments?: string;
  clients?: { business_name: string };
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "photo_camera",
  linkedin: "business_center",
  website: "language",
};

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "text-pink-500 bg-pink-50 border-pink-200",
  linkedin: "text-blue-600 bg-blue-50 border-blue-200",
  website: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

export default function ApprovalPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Deliverable | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<"approve" | "revisions" | "reject" | null>(null);
  const [filterPlatform, setFilterPlatform] = useState("all");

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("content_deliverables")
      .select(`*, clients(business_name)`)
      .eq("status", "Pending Content Approval")
      .order("created_at", { ascending: false });

    if (!error) setDeliverables(data || []);
    setIsLoading(false);
  }

  async function handleApprove() {
    if (!selectedTask) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("content_deliverables")
        .update({ status: "Pending Design", rework_comments: null })
        .eq("id", selectedTask.id);

      if (error) throw error;
      setDeliverables((prev) => prev.filter((d) => d.id !== selectedTask.id));
      setSelectedTask(null);
      setFeedback("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRevisions() {
    if (!selectedTask || !feedback.trim()) {
      alert("Please provide revision feedback before submitting.");
      return;
    }
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("content_deliverables")
        .update({ status: "Pending Content Approval", rework_comments: feedback })
        .eq("id", selectedTask.id);

      if (error) throw error;
      // Update locally to show the comment
      setDeliverables((prev) =>
        prev.map((d) => d.id === selectedTask.id ? { ...d, rework_comments: feedback } : d)
      );
      setSelectedTask(null);
      setFeedback("");
      setActiveAction(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    if (!selectedTask || !feedback.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("content_deliverables")
        .update({ status: "Rejected", rework_comments: feedback })
        .eq("id", selectedTask.id);

      if (error) throw error;
      setDeliverables((prev) => prev.filter((d) => d.id !== selectedTask.id));
      setSelectedTask(null);
      setFeedback("");
      setActiveAction(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  const filtered = deliverables.filter((d) => {
    if (filterPlatform === "all") return true;
    return (d.platform || "").toLowerCase() === filterPlatform;
  });

  const platformKey = (platform: string) => (platform || "instagram").toLowerCase();

  return (
    <div className="min-h-screen bg-background text-on-background flex font-sans antialiased">
      <Sidebar />

      <main className="flex-1 overflow-y-auto md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface-container-low/80 backdrop-blur-xl border-b border-white/5 px-8 h-16 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Step 5</p>
            <h1 className="text-xl font-[900] text-white">Content Approval Queue</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">
              <span className="font-bold text-white">{filtered.length}</span> pending
            </span>
            <button
              onClick={fetchQueue}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              title="Refresh"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Workflow Stepper */}
          <div className="bg-surface-container-low border border-white/5 rounded-2xl p-5 flex items-center gap-4 overflow-x-auto">
            {[
              { label: "Strategy Approved", icon: "auto_awesome", done: true },
              { label: "Content Approval", icon: "how_to_reg", active: true },
              { label: "Designer", icon: "brush", done: false },
              { label: "Design Review", icon: "rate_review", done: false },
              { label: "Scheduled", icon: "calendar_month", done: false },
              { label: "Published", icon: "rocket_launch", done: false },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div className={`flex items-center gap-2 shrink-0 ${step.done ? "text-sp-secondary" : step.active ? "text-sp-primary" : "text-gray-600"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.done ? "border-sp-secondary bg-sp-secondary/10" : step.active ? "border-sp-primary bg-sp-primary/10" : "border-white/10 bg-white/5"}`}>
                    <span className="material-symbols-outlined text-[16px]">{step.done ? "check" : step.icon}</span>
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap ${step.active ? "text-white" : ""}`}>{step.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`h-px flex-1 min-w-6 ${step.done ? "bg-sp-secondary/40" : "bg-white/5"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-2">
            {["all", "instagram", "linkedin", "website"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                  filterPlatform === p
                    ? "bg-sp-primary/10 border-sp-primary/30 text-sp-primary"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {p === "all" ? "All Platforms" : p}
              </button>
            ))}
          </div>

          {/* Content Cards Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-sp-primary/20 border-t-sp-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/5 rounded-2xl">
              <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">check_circle</span>
              <h3 className="text-xl font-bold text-white">All caught up!</h3>
              <p className="text-on-surface-variant mt-2 text-sm">No content is pending approval right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((task) => {
                const pKey = platformKey(task.platform);
                const colorClass = PLATFORM_COLOR[pKey] || "text-gray-400 bg-white/5 border-white/10";
                return (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setActiveAction(null); setFeedback(""); }}
                    className="bg-surface-container-low border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/15 hover:bg-surface-container-high transition-all cursor-pointer group shadow-lg"
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                          {task.clients?.business_name || "Unknown Client"}
                        </p>
                        <h3 className="text-base font-bold text-white line-clamp-2">{task.task_name}</h3>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${colorClass}`}>
                        <span className="material-symbols-outlined text-[12px]">{PLATFORM_ICON[pKey] || "public"}</span>
                        {task.platform}
                      </span>
                    </div>

                    {/* Topic */}
                    {task.topic && (
                      <p className="text-sm text-on-surface-variant bg-surface-container-highest rounded-xl p-3 line-clamp-3 border border-white/5">
                        {task.topic}
                      </p>
                    )}

                    {/* Rework Comment Badge */}
                    {task.rework_comments && (
                      <div className="flex items-start gap-2 bg-sp-error/10 border border-sp-error/20 rounded-xl px-3 py-2">
                        <span className="material-symbols-outlined text-sp-error text-sm mt-0.5">feedback</span>
                        <p className="text-xs text-on-surface-variant line-clamp-2">{task.rework_comments}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <span className="text-[10px] text-gray-500">
                        {new Date(task.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-[10px] font-bold text-sp-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Review <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ─── Review Modal ─── */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isProcessing && setSelectedTask(null)} />
          <div className="relative z-10 bg-surface-container-low border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between bg-[#1c1b1b] shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${PLATFORM_COLOR[platformKey(selectedTask.platform)] || "text-gray-400 bg-white/5 border-white/10"}`}>
                    <span className="material-symbols-outlined text-[12px]">{PLATFORM_ICON[platformKey(selectedTask.platform)] || "public"}</span>
                    {selectedTask.platform}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">{selectedTask.post_type || "Post"}</span>
                </div>
                <h3 className="text-lg font-[900] text-white">{selectedTask.task_name}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{selectedTask.clients?.business_name}</p>
              </div>
              {!isProcessing && (
                <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Maker-Checker Stepper */}
              <div className="bg-surface-container-high border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sp-secondary/10 border-2 border-sp-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-sp-secondary text-[14px]">check</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Maker: AI Strategy Agent</p>
                  <p className="text-[10px] text-on-surface-variant">Generated from approved strategy</p>
                </div>
                <div className="h-px w-8 bg-white/10" />
                <div className="w-8 h-8 rounded-full bg-sp-primary/10 border-2 border-sp-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-sp-primary text-[14px]">pending</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Checker: You</p>
                  <p className="text-[10px] text-on-surface-variant">Pending review</p>
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-surface-container-high rounded-xl border border-white/5 p-4 space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Content Brief</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Platform</p>
                    <p className="text-white font-bold">{selectedTask.platform}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Post Type</p>
                    <p className="text-white font-bold">{selectedTask.post_type || "Post"}</p>
                  </div>
                </div>
                {selectedTask.topic && (
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Topic / Content Angle</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-highest rounded-lg p-3 border border-white/5">
                      {selectedTask.topic}
                    </p>
                  </div>
                )}
              </div>

              {/* Previous Feedback */}
              {selectedTask.rework_comments && (
                <div className="bg-sp-error/10 border border-sp-error/20 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-sp-error uppercase tracking-widest mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">history</span>
                    Previous Feedback
                  </p>
                  <p className="text-sm text-on-surface-variant">{selectedTask.rework_comments}</p>
                </div>
              )}

              {/* Action Buttons */}
              {activeAction === null && (
                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-sp-secondary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Approve — Pass to Designer
                  </button>
                  <button
                    onClick={() => setActiveAction("revisions")}
                    className="w-full py-3.5 bg-surface-container-high border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-sp-primary">edit_note</span>
                    Request Revisions
                  </button>
                  <button
                    onClick={() => setActiveAction("reject")}
                    className="w-full py-3.5 bg-sp-error/10 border border-sp-error/20 text-sp-error font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-sp-error/20 transition-all"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Reject Content
                  </button>
                </div>
              )}

              {/* Revision / Reject Feedback Form */}
              {(activeAction === "revisions" || activeAction === "reject") && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className={`rounded-xl border p-4 ${activeAction === "reject" ? "bg-sp-error/10 border-sp-error/30" : "bg-sp-primary/5 border-sp-primary/20"}`}>
                    <p className={`text-xs font-bold mb-1 ${activeAction === "reject" ? "text-sp-error" : "text-sp-primary"}`}>
                      {activeAction === "reject" ? "Rejection Reason" : "Revision Notes"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mb-3">
                      {activeAction === "reject"
                        ? "This content will be marked as rejected and removed from the queue."
                        : "The content will remain in queue with your notes for the AI/team to address."}
                    </p>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      placeholder={activeAction === "reject" ? "e.g., Content does not align with our brand tone..." : "e.g., Change the hook, make it more concise, add a CTA..."}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-sp-primary outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActiveAction(null); setFeedback(""); }}
                      className="flex-1 py-3 font-bold text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={activeAction === "reject" ? handleReject : handleRevisions}
                      disabled={isProcessing || !feedback.trim()}
                      className={`flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${activeAction === "reject" ? "bg-sp-error text-white hover:opacity-90" : "bg-sp-primary text-black hover:opacity-90"}`}
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                      ) : activeAction === "reject" ? "Confirm Rejection" : "Submit Revisions"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
