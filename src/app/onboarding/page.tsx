"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const PLATFORMS = [
  { id: "Instagram",  icon: "auto_awesome",  label: "Instagram" },
  { id: "WhatsApp",   icon: "chat",           label: "WhatsApp" },
  { id: "Website",    icon: "language",       label: "Website" },
  { id: "Facebook",   icon: "groups",         label: "Facebook" },
  { id: "LinkedIn",   icon: "work",           label: "LinkedIn" },
  { id: "YouTube",    icon: "play_circle",    label: "YouTube" },
  { id: "Twitter",    icon: "alternate_email",label: "Twitter" },
  { id: "TikTok",     icon: "music_video",    label: "TikTok" },
];

const GOALS = ["Sales", "Brand Awareness", "Lead Generation", "Customer Education", "Community Growth"];
const TONES = ["Premium", "Casual", "Bold", "Innovative", "Professional", "Aggressive"];

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry]         = useState("");
  const [description, setDescription]   = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [goal, setGoal]   = useState("");
  const [tone, setTone]   = useState("");

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: dbError } = await supabase.from("clients").insert([{
        business_name:        businessName,
        industry_type:        industry,
        business_description: description,
        target_audience:      targetAudience,
        platforms:            selectedPlatforms.join(", "),
        primary_goal:         goal,
        brand_tone:           tone,
      }]);
      if (dbError) throw new Error(dbError.message);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setSuccess(false); setBusinessName(""); setIndustry(""); setDescription("");
    setTargetAudience(""); setSelectedPlatforms([]); setGoal(""); setTone("");
  }

  /* ─── Success State ─────────────────────────────────── */
  if (success) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="text-center space-y-6 max-w-md px-8">
          <div className="w-20 h-20 rounded-full bg-sp-secondary/20 flex items-center justify-center mx-auto animate-in zoom-in-95">
            <span className="material-symbols-outlined text-sp-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-3xl font-[900] text-white">Client Onboarded!</h2>
          <p className="text-on-surface-variant">
            <span className="text-sp-primary font-bold">{businessName}</span> has been added to your automation pipeline and is ready for AI strategy generation.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={resetForm} className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-bold border border-white/5 hover:bg-surface-bright transition-all text-sm">
              + Add Another
            </button>
            <Link href="/clients" className="px-5 py-2.5 rounded-xl bg-sp-primary text-on-primary font-bold hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] transition-all text-sm flex items-center gap-2">
              View Clients <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main Onboarding Layout ─────────────────────────── */
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-surface">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sp-primary/10 border border-sp-primary/20 text-sp-primary text-[9px] font-bold uppercase tracking-widest">
            Onboarding Phase 01
          </div>
          <div>
            <h1 className="text-xl font-[900] text-white tracking-tight">
              Configure Your <span className="text-sp-primary">Marketing AI</span>
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">Provide business details to calibrate AI agents for optimal conversion.</p>
          </div>
        </div>
        {/* AI Potential badge */}
        <div className="hidden lg:flex items-center gap-3 bg-surface-container-low border border-sp-secondary/20 rounded-2xl px-5 py-3">
          <div className="w-9 h-9 rounded-xl bg-sp-secondary/10 flex items-center justify-center border border-sp-secondary/20">
            <span className="material-symbols-outlined text-sp-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">AI Automation Potential</p>
            <p className="text-sm font-[900] text-white">Up to <span className="text-sp-secondary">85%</span> of funnel automated in 30 days</p>
          </div>
          <div className="ml-4 h-8 w-24 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sp-primary to-sp-secondary rounded-full w-[85%] flex items-center justify-end pr-2">
              <span className="text-[9px] font-bold text-on-primary">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Body (2-panel) ──────────────────────── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-0">
        
        {/* LEFT: Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-5">

          {/* Row 1: Business Name + Industry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Business Name *</label>
              <input
                type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:border-sp-primary focus:ring-1 focus:ring-sp-primary outline-none transition-all"
                placeholder="e.g. Nova AI Systems"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Industry *</label>
              <input
                type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} required
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:border-sp-primary focus:ring-1 focus:ring-sp-primary outline-none transition-all"
                placeholder="e.g. B2B SaaS"
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Business Description *</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:border-sp-primary focus:ring-1 focus:ring-sp-primary outline-none transition-all resize-none"
              placeholder="What makes your brand unique? What problem do you solve?"
            />
          </div>

          {/* Row 3: Target Audience */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Target Audience *</label>
            <input
              type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:border-sp-primary focus:ring-1 focus:ring-sp-primary outline-none transition-all"
              placeholder="e.g. E-commerce founders scaling past $1M ARR"
            />
          </div>

          {/* Row 4: Goal + Tone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Primary Goal *</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} required
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-white text-sm focus:border-sp-primary outline-none transition-all appearance-none cursor-pointer">
                <option value="">Select a goal...</option>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Brand Tone *</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} required
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-white text-sm focus:border-sp-primary outline-none transition-all appearance-none cursor-pointer">
                <option value="">Select a tone...</option>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Row 5: Platforms */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Target Platforms</label>
            <div className="grid grid-cols-4 gap-2.5">
              {PLATFORMS.map((p) => {
                const active = selectedPlatforms.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all hover:scale-105 text-center ${
                      active
                        ? "border-sp-primary bg-sp-primary/10 shadow-[0_0_12px_rgba(192,193,255,0.15)]"
                        : "bg-surface-container-low border-outline-variant/20 hover:border-sp-primary/30 hover:bg-surface-container"
                    }`}>
                    <span className={`material-symbols-outlined text-lg mb-1 ${active ? "text-sp-primary" : "text-gray-500"}`}
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {p.icon}
                    </span>
                    <span className={`text-[10px] font-bold ${active ? "text-white" : "text-gray-400"}`}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-sp-error bg-error/5 border border-sp-error/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>{error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={isSubmitting}
              className="bg-sp-primary text-on-primary px-7 py-3 rounded-xl font-[900] text-sm uppercase tracking-widest flex items-center gap-2.5 transform hover:scale-[1.02] transition-all custom-glow disabled:opacity-70">
              {isSubmitting ? (
                <><div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" /> Saving...</>
              ) : (
                <>Save Client Profile <span className="material-symbols-outlined text-base">arrow_forward</span></>
              )}
            </button>
          </div>
        </form>

        {/* RIGHT: Info Panel */}
        <div className="lg:col-span-2 border-l border-white/5 bg-surface-container-lowest overflow-y-auto custom-scrollbar p-8 flex flex-col gap-5">
          
          {/* Step tracker */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Setup Checklist</p>
            <div className="space-y-2">
              {[
                { label: "Business Identity",  done: !!(businessName && industry) },
                { label: "Brand Description",  done: !!description },
                { label: "Audience Targeting", done: !!targetAudience },
                { label: "Goal & Tone",        done: !!(goal && tone) },
                { label: "Platform Selection", done: selectedPlatforms.length > 0 },
              ].map((step, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${step.done ? "bg-sp-secondary/10 border border-sp-secondary/20" : "bg-surface-container border border-white/5"}`}>
                  <span className={`material-symbols-outlined text-base ${step.done ? "text-sp-secondary" : "text-gray-600"}`}
                    style={step.done ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {step.done ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <span className={`text-sm font-medium ${step.done ? "text-white" : "text-gray-500"}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completion meter */}
          <div className="bg-surface-container border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Profile Completeness</p>
              <span className="text-sp-primary font-[900] text-sm">
                {Math.round(
                  ([businessName, industry, description, targetAudience, goal, tone].filter(Boolean).length / 6) * 100
                )}%
              </span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sp-primary to-sp-tertiary rounded-full transition-all duration-500"
                style={{ width: `${Math.round(([businessName, industry, description, targetAudience, goal, tone].filter(Boolean).length / 6) * 100)}%` }}
              />
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-surface-container border border-white/5 rounded-2xl p-5">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">What Happens Next?</p>
            <div className="space-y-3">
              {[
                { icon: "smart_toy",      color: "text-sp-primary",    label: "AI generates a full strategy" },
                { icon: "pending_actions",color: "text-sp-secondary",  label: "You review & approve the plan" },
                { icon: "palette",        color: "text-sp-tertiary",   label: "Designer creates the visual assets" },
                { icon: "rocket_launch",  color: "text-sp-primary",    label: "Content is auto-published" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined text-sm ${step.color}`}>{step.icon}</span>
                  </div>
                  <span className="text-sm text-on-surface-variant">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inspiration card */}
          <div className="bg-gradient-to-br from-primary-container/20 to-sp-tertiary/10 rounded-2xl p-5 border border-sp-primary/20 relative overflow-hidden group cursor-pointer hover:border-sp-primary/40 transition-all">
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-sp-primary mb-2 block">Pro Tip</span>
              <h4 className="text-white font-bold text-sm mb-1">Be Specific!</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">The more detail you add to your business description & audience, the better the AI strategy output will be.</p>
            </div>
            <div className="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-7xl text-sp-primary">lightbulb</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
