"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  ArrowLeft,
  Globe,
  Target,
  Palette,
  Users,
  Building2,
  ExternalLink,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  RefreshCw,
  RotateCcw,
  Download,
  ChevronDown,
  FileType,
} from "lucide-react";
import { LoadingLottie } from "@/components/loading-lottie";
import { jsPDF } from "jspdf";

type Client = {
  id: string;
  business_name: string;
  industry_type: string;
  business_description: string;
  website_url: string;
  competitors: string;
  target_audience: string;
  primary_goal: string;
  brand_tone: string;
  platforms: string;
  additional_notes: string;
  status: string;
  strategy_json: string | null;
  content_json?: any;
  created_at: string;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "Strategy Approved")
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
        <CheckCircle2 className="w-3.5 h-3.5" /> Strategy Ready
      </span>
    );
  if (status === "Generating")
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
      <Clock className="w-3.5 h-3.5" /> Awaiting Strategy
    </span>
  );
}

function InfoBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[14px] text-slate-800 font-medium leading-relaxed">{value}</p>
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const getSupabase = () => supabase;

  useEffect(() => {
    if (!clientId) return;
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase not configured.");
      setLoading(false);
      return;
    }
    supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) setError("Client not found.");
        else setClient(data);
        setLoading(false);
      });
  }, [clientId]);

  const handleGenerateStrategy = async () => {
    if (!client) return;
    setGenerating(true);
    setGenerateError("");
    setGenerateSuccess(false);

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_STRATEGY_WEBHOOK;
    if (!webhookUrl) {
      setGenerateError("Webhook URL not configured in environment variables.");
      setGenerating(false);
      return;
    }

    try {
      // Update status to "Generating" in Supabase first
      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from("clients")
          .update({ status: "Generating" })
          .eq("id", client.id);
        setClient((prev) => prev ? { ...prev, status: "Generating" } : prev);
      }

      // Fire and forget — n8n takes 2-3 minutes
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: client.id }),
      }).catch((err) => console.error("Webhook error:", err));

      setGenerateSuccess(true);

      // Redirect to the report page to poll for the result
      setTimeout(() => {
        router.push(`/onboarding/report?id=${client.id}`);
      }, 2000);
    } catch (err) {
      setGenerateError("Failed to trigger strategy generation. Check n8n webhook URL.");
      setGenerating(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!client) return;
    setGeneratingContent(true);
    setGenerateError("");
    setGenerateSuccess(false);

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_CONTENT_WEBHOOK;
    if (!webhookUrl) {
      setGenerateError("Content Webhook URL not configured in environment variables. (NEXT_PUBLIC_N8N_CONTENT_WEBHOOK)");
      setGeneratingContent(false);
      return;
    }

    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from("clients")
          .update({ status: "Generating Content" })
          .eq("id", client.id);
        setClient((prev) => prev ? { ...prev, status: "Generating Content" } : prev);
      }

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: client.id }),
      }).catch((err) => console.error("Webhook error:", err));

      setGenerateSuccess(true);

      setTimeout(() => {
        router.push(`/dashboard/approval`);
      }, 2000);
    } catch (err) {
      setGenerateError("Failed to trigger content generation. Check n8n webhook URL.");
      setGeneratingContent(false);
    }
  };

  const handleResetStatus = async () => {
    if (!client) return;
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from("clients")
          .update({ status: "Awaiting Strategy" })
          .eq("id", client.id);
        setClient((prev) => prev ? { ...prev, status: "Awaiting Strategy" } : prev);
        setGenerating(false);
        setGeneratingContent(false);
        setGenerateError("");
        setGenerateSuccess(false);
      }
    } catch (err) {
      console.error("Failed to reset status:", err);
    }
  };

  const [exportOpen, setExportOpen] = useState(false);

  const exportToTxt = () => {
    if (!client) return;
    try {
      const strategy = client.strategy_json ? (typeof client.strategy_json === "string" ? JSON.parse(client.strategy_json) : client.strategy_json) : null;
      let text = `FULL BUSINESS REPORT: ${client.business_name.toUpperCase()}\n`;
      text += `Generated on: ${new Date().toLocaleDateString()}\n`;
      text += `================================================\n\n`;

      text += `1. BUSINESS PROFILE\n`;
      text += `-----------------\n`;
      text += `Business Name: ${client.business_name}\n`;
      text += `Industry: ${client.industry_type}\n`;
      text += `Website: ${client.website_url}\n`;
      text += `Primary Goal: ${client.primary_goal}\n`;
      text += `Brand Tone: ${client.brand_tone}\n`;
      text += `Platforms: ${client.platforms}\n`;
      text += `Competitors: ${client.competitors}\n\n`;

      if (client.business_description) {
        text += `DESCRIPTION\n-----------\n${client.business_description}\n\n`;
      }

      if (client.additional_notes) {
        text += `STRATEGIC NOTES\n---------------\n${client.additional_notes}\n\n`;
      }

      if (strategy && !strategy.error) {
        text += `2. AI GENERATED STRATEGY\n`;
        text += `----------------------\n`;
        if (strategy.executive_summary) {
          text += `EXECUTIVE SUMMARY\n${strategy.executive_summary}\n\n`;
        }
        if (strategy.brand_positioning) {
          text += `BRAND POSITIONING\n`;
          text += `UVP: ${strategy.brand_positioning.unique_value_proposition}\n`;
          text += `Voice: ${strategy.brand_positioning.brand_voice}\n\n`;
        }
      }

      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${client.business_name.replace(/\s+/g, "_")}_Full_Report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setExportOpen(false);
    } catch (e) {
      alert("Error exporting text: " + (e as Error).message);
    }
  };

  const exportToPdf = () => {
    if (!client?.strategy_json) return;
    try {
      const strategy = typeof client.strategy_json === "string" ? JSON.parse(client.strategy_json) : client.strategy_json;
      const doc = new jsPDF();
      let y = 20;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(249, 115, 22); // primary color
      doc.text("AI STRATEGY REPORT", 20, y);
      y += 10;
      
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(client.business_name, 20, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated by ScalePods AI · ${new Date().toLocaleDateString()}`, 20, y);
      y += 15;

      // Divider
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y, 190, y);
      y += 15;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("1. BUSINESS PROFILE", 20, y);
      y += 10;

      const infoFields = [
        ["Business Name", client.business_name],
        ["Industry", client.industry_type],
        ["Website", client.website_url],
        ["Primary Goal", client.primary_goal],
        ["Brand Tone", client.brand_tone],
        ["Target Audience", client.target_audience],
        ["Platforms", client.platforms],
        ["Competitors", client.competitors],
      ];

      doc.setFontSize(10);
      infoFields.forEach(([label, value]) => {
        if (!value) return;
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`${label.toUpperCase()}:`, 20, y);
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const valLines = doc.splitTextToSize(value, 130);
        doc.text(valLines, 60, y);
        y += (valLines.length * 5) + 2;
      });
      y += 5;

      // Description
      if (client.business_description) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("Business Description", 20, y);
        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const descLines = doc.splitTextToSize(client.business_description, 170);
        doc.text(descLines, 20, y);
        y += (descLines.length * 5) + 10;
      }

      // Strategic Notes
      if (client.additional_notes) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFillColor(249, 115, 22, 0.1); // light orange bg
        doc.rect(20, y, 170, 7, "F");
        doc.setFontSize(11);
        doc.setTextColor(249, 115, 22);
        doc.text("📌 Strategic Notes", 25, y + 5);
        y += 12;
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const noteLines = doc.splitTextToSize(client.additional_notes, 170);
        doc.text(noteLines, 20, y);
        y += (noteLines.length * 5) + 15;
      }

      // AI Strategy (if exists)
      if (strategy && !strategy.error) {
        doc.addPage(); y = 20;
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("2. AI GENERATED STRATEGY", 20, y);
        y += 12;

        if (strategy.executive_summary) {
          doc.setFontSize(12);
          doc.setTextColor(249, 115, 22);
          doc.text("Executive Summary", 20, y);
          y += 7;
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const lines = doc.splitTextToSize(strategy.executive_summary, 170);
          doc.text(lines, 20, y);
          y += (lines.length * 5) + 12;
        }

        if (strategy.brand_positioning) {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFontSize(12);
          doc.setTextColor(249, 115, 22);
          doc.text("Brand Positioning", 20, y);
          y += 7;
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          doc.text(`UVP: ${strategy.brand_positioning.unique_value_proposition}`, 20, y);
          y += 6;
          doc.text(`Voice: ${strategy.brand_positioning.brand_voice}`, 20, y);
          y += 12;
        }
      }

      doc.save(`${client.business_name.replace(/\s+/g, "_")}_Full_Report.pdf`);
      setExportOpen(false);
    } catch (e) {
      alert("Error exporting PDF: " + (e as Error).message);
    }
  };

  const competitors = client?.competitors
    ? client.competitors.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  const platforms = client?.platforms
    ? client.platforms.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  let hasStrategyError = false;
  if (client?.strategy_json) {
    try {
      let parsed = typeof client.strategy_json === "string" ? JSON.parse(client.strategy_json) : client.strategy_json;
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      if (parsed.error) hasStrategyError = true;
    } catch (e) {
      // Ignore parse errors here
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
        <LoadingLottie message="Loading client details..." size={550} />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-slate-700 font-bold text-lg">{error || "Client not found"}</p>
          <Link href="/dashboard/clients" className="text-orange-500 font-semibold text-sm hover:underline">
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm font-semibold transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
              {client.business_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-h2 text-slate-900">{client.business_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={client.status} />
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400 font-medium">
                  Added {new Date(client.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className="h-10 px-4 flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold text-[12px] rounded-lg hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
            >
              Edit
            </Link>

            {client.strategy_json && (
              <>
                <Link
                  href={`/onboarding/report?id=${client.id}`}
                  className="h-10 px-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[12px] rounded-lg hover:bg-emerald-100 transition-all shadow-sm whitespace-nowrap"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  AI Strategy Report
                </Link>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setExportOpen(!exportOpen)}
                    className="h-10 px-4 flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold text-[12px] rounded-lg hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    Export info as
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
                  </button>

                  {exportOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={exportToPdf}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <FileType className="w-4 h-4 text-red-500" />
                          Export as PDF
                        </button>
                        <button
                          onClick={exportToTxt}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-[12px] font-bold text-slate-700 hover:bg-slate-50 border-t border-slate-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          Export as TXT
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {client.content_json && (
              <Link
                href={`/dashboard/approval/${client.id}`}
                className="h-10 px-4 flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[12px] rounded-lg hover:bg-indigo-100 transition-all shadow-sm whitespace-nowrap"
              >
                <Palette className="w-4 h-4 shrink-0" />
                Content Report
              </Link>
            )}

            <button
              onClick={handleGenerateStrategy}
              disabled={generating || client.status === "Generating" || generatingContent}
              className="h-10 px-4 flex items-center gap-2 bg-primary hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[12px] rounded-lg transition-all shadow-sm shadow-primary/20 whitespace-nowrap"
            >
              {generating || client.status === "Generating" ? (
                <>
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 shrink-0" />
                  Generate Strategy
                </>
              )}
            </button>

            <button
              onClick={handleGenerateContent}
              disabled={generatingContent || client.status === "Generating Content" || generating}
              className="h-10 px-4 flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[12px] rounded-lg transition-all shadow-sm shadow-indigo-200 whitespace-nowrap"
            >
              {generatingContent || client.status === "Generating Content" ? (
                <>
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4 shrink-0" />
                  Send for Content Creation
                </>
              )}
            </button>

            {/* Reset button shown only when stuck */}
            {(client.status === "Generating" || client.status === "Generating Content") && (
              <button
                onClick={handleResetStatus}
                title="Reset stuck status"
                className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition-all border border-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status messages */}
        {generateSuccess && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">
              Strategy generation triggered! Redirecting to report page in 2 seconds...
            </p>
          </div>
        )}
        {generateError && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{generateError}</p>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Business Info Section */}
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Business Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoBlock label="Business Name" value={client.business_name} />
            <InfoBlock label="Industry" value={client.industry_type} />
          </div>

          {client.website_url && (
            <div className="mt-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Website URL</p>
              <a
                href={client.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:text-orange-600 font-semibold text-sm transition-colors"
              >
                <Globe className="w-4 h-4" />
                {client.website_url}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {client.business_description && (
            <div className="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{client.business_description}</p>
            </div>
          )}
        </div>

        {/* 3-Column Strategy Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-50 border-b border-slate-50">
          <div className="p-6 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Audience</p>
              <p className="text-sm text-slate-800 font-medium leading-relaxed">{client.target_audience || "—"}</p>
            </div>
          </div>
          <div className="p-6 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Goal</p>
              <p className="text-sm text-slate-800 font-semibold capitalize">{client.primary_goal || "—"}</p>
            </div>
          </div>
          <div className="p-6 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Brand Tone</p>
              <p className="text-sm text-slate-800 font-semibold">{client.brand_tone || "—"}</p>
            </div>
          </div>
        </div>

        {/* Competitors */}
        {competitors.length > 0 && (
          <div className="p-8 border-b border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Market Competitors</p>
            <div className="flex flex-wrap gap-2">
              {competitors.map((comp, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {comp.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="p-8 border-b border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Target Platforms</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-primary/5 border border-primary/20 text-primary rounded-lg text-xs font-bold"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {client.additional_notes && (
          <div className="p-8 border-b border-slate-50">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">📌 Strategic Notes</p>
              <p className="text-sm text-amber-900 leading-relaxed">{client.additional_notes}</p>
            </div>
          </div>
        )}

        {/* Strategy Status */}
        <div className="p-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Strategy Status</p>
          {client.status === "Strategy Approved" && !hasStrategyError ? (
            <div className="flex items-center justify-between p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-800 text-sm">Strategy Generated Successfully</p>
                  <p className="text-emerald-600 text-xs mt-0.5">AI strategy report is ready to view</p>
                </div>
              </div>
              <Link
                href={`/onboarding/report?id=${client.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white font-bold text-sm rounded-lg hover:bg-emerald-600 transition-all"
              >
                View Report <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : client.status === "Strategy Approved" && hasStrategyError ? (
            <div className="flex items-center justify-between p-5 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-bold text-red-800 text-sm">Strategy Generation Failed</p>
                  <p className="text-red-600 text-xs mt-0.5">The AI encountered an error (e.g. site blocked scraping).</p>
                </div>
              </div>
              <button
                onClick={handleGenerateStrategy}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 disabled:opacity-60 transition-all shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} /> 
                {generating ? "Retrying..." : "Regenerate Strategy"}
              </button>
            </div>
          ) : client.status === "Generating" ? (
            <div className="flex flex-col items-center justify-center p-8 bg-blue-50/50 border border-blue-100 rounded-xl text-center">
              <div className="w-full max-w-[400px] aspect-[16/9] mb-4">
                <DotLottieReact
                  src="https://assets-v2.lottiefiles.com/a/43136e14-118a-11ee-afa9-e3a75585f1a0/3RVQ4eVjUH.lottie"
                  loop
                  autoplay
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-h2 text-xl text-blue-900 mb-2">AI Strategy is Being Generated...</p>
              <p className="text-blue-600 text-sm max-w-md">Our AI is analyzing the business, target audience, and competitors. This usually takes 2–3 minutes. Check back soon.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Status
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-700 text-sm">No Strategy Generated Yet</p>
                  <p className="text-slate-500 text-xs mt-0.5">Click "Generate Strategy" to start AI analysis</p>
                </div>
              </div>
              <button
                onClick={handleGenerateStrategy}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-all"
              >
                <Zap className="w-4 h-4" /> Generate Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
