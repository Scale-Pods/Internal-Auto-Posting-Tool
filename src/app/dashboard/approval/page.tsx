"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  CheckSquare, Loader2, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles
} from "lucide-react";

type Client = {
  id: string;
  business_name: string;
  status: string;
  content_reviewer_notes: string | null;
  content_approved_by: string | null;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  "Generating Content":         { label: "Generating…",        color: "text-blue-700",   bg: "bg-blue-50 border-blue-200 rounded-md",   icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  "Content Ready for Approval": { label: "Needs Review",        color: "text-amber-700",  bg: "bg-amber-50 border-amber-200 rounded-md", icon: <Clock className="w-3.5 h-3.5" /> },
  "Content Approved":           { label: "Approved",            color: "text-green-700",  bg: "bg-green-50 border-green-200 rounded-md", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export default function ContentApprovalListPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
    const t = setInterval(() => fetchClients(true), 6000);
    return () => clearInterval(t);
  }, []);

  const fetchClients = async (silent = false) => {
    if (!silent) setLoading(true);
    // Fetch all clients — then filter in JS for those with content_json set
    const { data, error } = await supabase
      .from("clients")
      .select("id, business_name, status, content_reviewer_notes, content_approved_by, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      if (!silent) setLoading(false);
      return;
    }
    // Show only clients that have been through content pipeline
    const withContent = (data ?? []).filter(c =>
      c.status &&
      (
        c.status.toLowerCase().includes("content") ||
        c.status.toLowerCase().includes("generating") ||
        c.status.toLowerCase().includes("approved")
      )
    );
    setClients(withContent);
    if (!silent) setLoading(false);
  };


  const groups = {
    // Match any status that contains these keywords (case-insensitive)
    pending:    clients.filter(c => /ready.*approval|needs.*review|ready/i.test(c.status) && !/approved/i.test(c.status)),
    approved:   clients.filter(c => /content.*approved/i.test(c.status)),
    generating: clients.filter(c => /generating/i.test(c.status)),
    // Catch-all for any other statuses that have content
    other:      clients.filter(c =>
      !/ready.*approval|needs.*review|content.*approved|generating/i.test(c.status)
    ),
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow-md">
          <CheckSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-h2 text-slate-900 tracking-tight">Content Approval</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""} in the content pipeline
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading content queue…</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-600">No content in the pipeline yet</p>
          <p className="text-sm text-slate-400 mt-1">Generate content from a client profile to start the review process.</p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Needs Review Section */}
          {groups.pending.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Needs Review</span>
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-black flex items-center justify-center">{groups.pending.length}</span>
                <div className="flex-1 h-px bg-amber-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groups.pending.map(c => <ClientCard key={c.id} client={c} onClick={() => router.push(`/dashboard/approval/${c.id}`)} />)}
              </div>
            </section>
          )}

          {/* Generating Section */}
          {groups.generating.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Generating</span>
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center">{groups.generating.length}</span>
                <div className="flex-1 h-px bg-blue-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groups.generating.map(c => <ClientCard key={c.id} client={c} onClick={() => router.push(`/dashboard/approval/${c.id}`)} />)}
              </div>
            </section>
          )}

          {/* Approved Section */}
          {groups.approved.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-black text-green-600 uppercase tracking-widest">Approved</span>
                <span className="w-5 h-5 rounded-md bg-green-100 text-green-700 text-[10px] font-black flex items-center justify-center">{groups.approved.length}</span>
                <div className="flex-1 h-px bg-green-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groups.approved.map(c => <ClientCard key={c.id} client={c} onClick={() => router.push(`/dashboard/approval/${c.id}`)} />)}
              </div>
            </section>
          )}

          {/* Other statuses with content */}
          {groups.other.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">With Content</span>
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black flex items-center justify-center">{groups.other.length}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groups.other.map(c => <ClientCard key={c.id} client={c} onClick={() => router.push(`/dashboard/approval/${c.id}`)} />)}
              </div>
            </section>
          )}


        </div>
      )}
    </div>
  );
}

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  const st = STATUS_MAP[client.status] ?? { label: client.status, color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: null };
  const initials = client.business_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const isReviewed = !!client.content_reviewer_notes;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-xl border border-slate-200 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 flex flex-col gap-4"
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-black text-sm shrink-0 shadow">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight truncate group-hover:text-primary transition-colors">
            {client.business_name}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border ${st.bg} ${st.color}`}>
          {st.icon}{st.label}
        </span>
        {isReviewed && client.status !== "Content Approved" && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
            ✓ Stage 1
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          {client.created_at ? new Date(client.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          {client.status === "Content Approved" ? "View" : "Review"} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}
