"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, CheckSquare, Loader2, AlertCircle, RefreshCw,
  Edit3, Save, X, ShieldCheck, Check, RotateCcw
} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type Client = {
  id: string;
  business_name: string;
  status: string;
  content_json: any;
  client_feedback: string | null;
  content_reviewer_notes?: string | null;
  content_approved_by?: string | null;
};

export default function ContentReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(null);

  const [reviewerNotes, setReviewerNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [activePlatform, setActivePlatform] = useState<string>("");

  useEffect(() => {
    if (clientId) loadClient();
  }, [clientId]);

  // Polling logic to synchronize with backend n8n generation
  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval>;
    
    // Only poll if we know it's currently generating
    if (client?.status === "Generating Content") {
      pollTimer = setInterval(async () => {
        const { data, error } = await supabase
          .from("clients")
          .select("status, content_json")
          .eq("id", clientId)
          .single();
          
        if (!error && data) {
          // If the status has changed, n8n is done
          if (data.status !== "Generating Content") {
            setClient((c) => c ? { ...c, status: data.status, content_json: data.content_json } : c);
            clearInterval(pollTimer);
          }
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => clearInterval(pollTimer);
  }, [client?.status, clientId]);

  const loadClient = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("id, business_name, status, content_json, client_feedback, content_reviewer_notes, content_approved_by")
      .eq("id", clientId)
      .single();
    if (error) {
      // Fallback without new columns if they don't exist yet
      const { data: fallback } = await supabase
        .from("clients")
        .select("id, business_name, status, content_json, client_feedback")
        .eq("id", clientId)
        .single();
      if (fallback) {
        setClient({ ...fallback, content_reviewer_notes: null, content_approved_by: null });
        setReviewerNotes("");
        try {
          const parsed = typeof fallback.content_json === "string" ? JSON.parse(fallback.content_json) : fallback.content_json;
          const platforms = Object.keys(parsed ?? {});
          if (platforms.length > 0) setActivePlatform(platforms[0]);
        } catch {}
      }
    } else if (data) {
      setClient(data);
      setReviewerNotes(data.content_reviewer_notes ?? "");
      try {
        const parsed = typeof data.content_json === "string" ? JSON.parse(data.content_json) : data.content_json;
        const platforms = Object.keys(parsed ?? {});
        if (platforms.length > 0) setActivePlatform(platforms[0]);
      } catch {}
    }
    setLoading(false);
  };

  /* Edit mode helpers */
  const enterEdit = () => {
    try {
      const raw = typeof client!.content_json === "string" ? JSON.parse(client!.content_json) : client!.content_json;
      setEditedContent(JSON.parse(JSON.stringify(raw)));
      setEditMode(true);
    } catch { alert("Cannot parse content for editing."); }
  };

  const setSlideText = (platform: string, pi: number, si: number, val: string) =>
    setEditedContent((prev: any) => {
      const n = JSON.parse(JSON.stringify(prev));
      n[platform][pi].slides[si].text_on_image = val;
      return n;
    });

  const setCaption = (platform: string, pi: number, val: string) =>
    setEditedContent((prev: any) => {
      const n = JSON.parse(JSON.stringify(prev));
      n[platform][pi].caption = val;
      return n;
    });

  const saveEdits = async () => {
    if (!client || !editedContent) return;
    setProcessing(true);
    await supabase.from("clients").update({ content_json: editedContent }).eq("id", client.id);
    setClient(c => c ? { ...c, content_json: editedContent } : c);
    setEditMode(false);
    setEditedContent(null);
    setProcessing(false);
  };

  /* Approval actions */
  const markReviewed = async () => {
    if (!reviewerNotes.trim()) { alert("Please add reviewer notes first."); return; }
    setProcessing(true);
    await supabase.from("clients").update({ content_reviewer_notes: reviewerNotes }).eq("id", client!.id);
    setClient(c => c ? { ...c, content_reviewer_notes: reviewerNotes } : c);
    setProcessing(false);
  };

  const finalApprove = async () => {
    setProcessing(true);
    await supabase.from("clients").update({ status: "Content Approved", content_approved_by: "Admin" }).eq("id", client!.id);
    setClient(c => c ? { ...c, status: "Content Approved", content_approved_by: "Admin" } : c);
    setProcessing(false);
  };

  const regenerate = async () => {
    if (!feedback.trim()) { alert("Provide feedback for the AI."); return; }
    setProcessing(true);
    await supabase.from("clients").update({
      status: "Generating Content",
      client_feedback: feedback,
      content_reviewer_notes: null,
    }).eq("id", client!.id);
    const wh = process.env.NEXT_PUBLIC_N8N_CONTENT_WEBHOOK;
    if (wh) fetch(wh, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: client!.id, feedback }) }).catch(console.error);
    setClient(c => c ? { ...c, status: "Generating Content", content_reviewer_notes: null } : c);
    setFeedback("");
    setProcessing(false);
  };

  /* ── Parsed content ── */
  const parsedContent = (() => {
    if (!client?.content_json) return null;
    try { return typeof client.content_json === "string" ? JSON.parse(client.content_json) : client.content_json; }
    catch { return null; }
  })();

  const contentSource = editMode && editedContent ? editedContent : parsedContent;
  const platforms = Object.keys(contentSource ?? {});
  const currentPlatform = activePlatform || platforms[0] || "";
  const posts: any[] = contentSource?.[currentPlatform] ?? [];

  const isReviewed = !!client?.content_reviewer_notes;
  const isApproved = client?.status === "Content Approved";
  const isGenerating = client?.status === "Generating Content";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <p className="text-slate-500">Client not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">

      {/* ── Top bar ── */}
      <header className="shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/approval")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="w-px h-6 bg-slate-200" />

        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-black text-xs shadow">
            {client.business_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-h2 text-slate-900 leading-none">{client.business_name}</h1>
          </div>

          {/* Status chip */}
          <div className="ml-4">
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                <Check className="w-3 h-3" /> Approved by {client.content_approved_by}
              </span>
            ) : isReviewed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="w-3 h-3" /> Stage 1 Reviewed
              </span>
            ) : isGenerating ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Loader2 className="w-3 h-3 animate-spin" /> Generating
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3 h-3" /> Needs Review
              </span>
            )}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          {!isApproved && !isGenerating && !editMode && (
            <button onClick={enterEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
              <Edit3 className="w-3.5 h-3.5" /> Edit Content
            </button>
          )}
          {editMode && (
            <>
              <button onClick={() => { setEditMode(false); setEditedContent(null); }} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={saveEdits} disabled={processing} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-orange-600 rounded-lg shadow transition-all">
                {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Edits
              </button>
            </>
          )}
          {!isApproved && isReviewed && !editMode && (
            <button onClick={finalApprove} disabled={processing} className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow transition-all">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Final Approve
            </button>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Content ── */}
        <div className="flex-1 overflow-y-auto">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-full max-w-[600px] aspect-[4/3] mb-5 mx-auto">
                <DotLottieReact
                  src="https://assets-v2.lottiefiles.com/a/a6902b54-1166-11ee-a844-e371b5c232c6/Qmr9NpC4MP.lottie"
                  loop
                  autoplay
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xl font-h2 text-slate-800">AI is crafting the content…</p>
              <p className="text-sm text-slate-500 mt-2">Usually takes 1–2 minutes. Page auto-refreshes.</p>
              <button
                onClick={async () => {
                  if (window.confirm("Reset to 'Strategy Approved'?")) {
                    await supabase.from("clients").update({ status: "Strategy Approved" }).eq("id", client.id);
                    router.push("/dashboard/approval");
                  }
                }}
                className="mt-8 flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
              >
                <AlertCircle className="w-4 h-4" /> Reset if stuck
              </button>
            </div>
          ) : !parsedContent ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>No content generated yet.</p>
            </div>
          ) : (
            <div className="p-6 max-w-4xl">
              {/* Platform tabs */}
              {platforms.length > 1 && (
                <div className="flex gap-2 mb-6">
                  {platforms.map(p => (
                    <button
                      key={p}
                      onClick={() => setActivePlatform(p)}
                      className={`px-4 py-2 text-sm font-bold rounded-lg capitalize transition-all ${currentPlatform === p ? "bg-primary text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                    >
                      {p === "instagram" ? "📸 Instagram" : p === "linkedin" ? "💼 LinkedIn" : p}
                    </button>
                  ))}
                </div>
              )}

              {/* Platform label */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl">{currentPlatform === "instagram" ? "📸" : currentPlatform === "linkedin" ? "💼" : "🌐"}</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-widest">{currentPlatform}</h2>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Posts */}
              {posts.map((post: any, pi: number) => (
                <div key={pi} className="mb-8 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                  {/* Post header */}
                  <div className="bg-secondary px-5 py-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{post.format || "Post"}</span>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">Post #{pi + 1}</span>
                  </div>

                  {/* Slides */}
                  {post.slides?.map((slide: any, si: number) => (
                    <div key={si} className="border-b border-slate-100 last:border-0">
                      {/* Slide label */}
                      <div className="bg-primary/90 px-5 py-2.5">
                        <span className="text-xs font-black text-white uppercase tracking-widest">
                          Slide {slide.slide_number ?? si + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 divide-x divide-slate-100">
                        {/* Visual concept */}
                        <div className="p-5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">🎨 Visual Concept</p>
                          <p className="text-sm text-slate-800 leading-relaxed">{slide.visual_description}</p>
                        </div>

                        {/* Text on image */}
                        <div className="p-5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">✏️ Text on Image</p>
                          {editMode ? (
                            <textarea
                              value={slide.text_on_image}
                              onChange={e => setSlideText(currentPlatform, pi, si, e.target.value)}
                              rows={3}
                              className="w-full text-sm font-semibold text-slate-900 bg-primary/5 border-2 border-primary/40 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                          ) : (
                            <div className="bg-slate-900 rounded-xl p-3">
                              <p className="text-sm font-bold text-white leading-snug">{slide.text_on_image}</p>
                            </div>
                          )}
                        </div>

                        {/* Designer notes */}
                        <div className="p-5 bg-amber-50">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">📐 Designer Notes</p>
                          <p className="text-sm text-amber-900 italic leading-relaxed">{slide.designer_notes || "—"}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Caption */}
                  <div className="p-5 bg-slate-50 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">💬 Caption</p>
                    {editMode ? (
                      <textarea
                        value={post.caption}
                        onChange={e => setCaption(currentPlatform, pi, e.target.value)}
                        rows={5}
                        className="w-full text-sm text-slate-900 leading-relaxed bg-white border-2 border-primary/40 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    ) : (
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                    )}
                    {post.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.hashtags.map((tag: string, ti: number) => (
                          <span key={ti} className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR: Review Controls ── */}
        {!isGenerating && (
          <aside className="w-80 shrink-0 border-l border-slate-200 bg-white overflow-y-auto flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckSquare className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black text-slate-900">Review Controls</h3>
              </div>
              <p className="text-xs text-slate-400">Maker-Checker approval workflow</p>
            </div>

            <div className="flex-1 p-5 space-y-5">

              {/* ── Stage 1 ── */}
              <div className={`rounded-xl border p-4 ${isReviewed ? "bg-primary/5 border-primary/20" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${isReviewed ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Reviewer Notes</p>
                  {isReviewed && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                </div>

                {isReviewed ? (
                  <div>
                    <p className="text-sm text-slate-900 leading-relaxed bg-white rounded-lg p-3 border border-primary/10">
                      {client.content_reviewer_notes}
                    </p>
                    <button
                      onClick={() => setClient(c => c ? { ...c, content_reviewer_notes: null } : c)}
                      className="mt-2 text-xs text-primary hover:text-orange-600 font-semibold"
                    >
                      Edit notes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={reviewerNotes}
                      onChange={e => setReviewerNotes(e.target.value)}
                      placeholder="e.g. Content aligns with brand tone, captions are strong…"
                      rows={4}
                      className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                    <button
                      onClick={markReviewed}
                      disabled={processing || !reviewerNotes.trim() || isApproved}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-all"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Mark as Reviewed
                    </button>
                  </div>
                )}
              </div>

              {/* ── Stage 2 ── */}
              <div className={`rounded-xl border p-4 ${isApproved ? "bg-green-50 border-green-200" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${isApproved ? "bg-green-600 text-white" : isReviewed ? "bg-secondary text-white" : "bg-slate-200 text-slate-400"}`}>2</span>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Final Approval</p>
                  {isApproved && <Check className="w-3.5 h-3.5 text-green-600 ml-auto" />}
                </div>

                {isApproved ? (
                  <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-green-100">
                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-sm font-bold text-green-800">Approved by {client.content_approved_by}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {!isReviewed && (
                      <p className="text-xs text-slate-400 italic bg-slate-50 rounded-lg p-3 border border-slate-100">
                        Complete Stage 1 first before final approval.
                      </p>
                    )}
                    <button
                      onClick={finalApprove}
                      disabled={processing || !isReviewed || isApproved}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow transition-all"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Final Approve
                    </button>
                  </div>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* ── Regenerate ── */}
              {!isApproved && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <p className="text-xs font-black text-rose-700 uppercase tracking-wider">AI Regenerate</p>
                  </div>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Give feedback to the AI (e.g. 'Make tone more casual, shorten captions')…"
                    rows={3}
                    className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-rose-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
                  />
                  <button
                    onClick={regenerate}
                    disabled={processing || !feedback.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-all"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Regenerate with AI
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
