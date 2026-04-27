"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight, Save, Loader2, Globe, Building2, HelpCircle } from "lucide-react";

// Types
type FormState = {
  business_name: string;
  industry_type: string;
  business_description: string;
  website_url: string;
  target_audience: string;
  primary_goal: string;
  brand_tone: string;
  platforms: string;
  competitors: string[];
  additional_notes: string;
};

const INITIAL_FORM: FormState = {
  business_name: "",
  industry_type: "",
  business_description: "",
  website_url: "",
  target_audience: "",
  primary_goal: "",
  brand_tone: "",
  platforms: "",
  competitors: [""],
  additional_notes: "",
};

const INDUSTRIES = ["SaaS / Software", "E-commerce", "Real Estate", "Healthcare", "Finance", "Education", "Agency", "Other"];
const GOALS = ["Sales", "Awareness", "Lead Gen", "Education", "Community", "Other"];
const TONES = ["Premium", "Casual", "Bold", "Innovative", "Professional", "Aggressive", "Other"];
const PLATFORMS_LIST = ["Instagram", "LinkedIn", "Website", "Twitter/X", "YouTube", "TikTok"];

export default function AddClientWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingFinal, setSavingFinal] = useState(false);

  // Custom "Other" states
  const [customIndustry, setCustomIndustry] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [customTone, setCustomTone] = useState("");

  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Load Draft from LocalStorage + Supabase
  useEffect(() => {
    const loadDraft = async () => {
      const savedId = localStorage.getItem("clientDraftId");
      if (!savedId) return;

      const { data } = await supabase.from("clients").select("*").eq("id", savedId).single();
      if (data && data.status === "Draft") {
        setDraftId(data.id);
        setForm({
          business_name: data.business_name || "",
          industry_type: data.industry_type || "",
          business_description: data.business_description || "",
          website_url: data.website_url || "",
          target_audience: data.target_audience || "",
          primary_goal: data.primary_goal || "",
          brand_tone: data.brand_tone || "",
          platforms: data.platforms || "",
          competitors: data.competitors ? data.competitors.split(",").map((c: string) => c.trim()) : [""],
          additional_notes: data.additional_notes || "",
        });

        // Hydrate selections
        if (data.platforms) setSelectedPlatforms(data.platforms.split(",").map((p:string) => p.trim()));
        if (data.brand_tone) {
          const tones = data.brand_tone.split(",").map((t:string) => t.trim());
          setSelectedTones(tones);
          // Check if custom tone exists
          const custom = tones.find((t:string) => !TONES.includes(t));
          if (custom) setCustomTone(custom);
        }
        if (data.industry_type && !INDUSTRIES.includes(data.industry_type)) setCustomIndustry(data.industry_type);
        if (data.primary_goal && !GOALS.includes(data.primary_goal)) setCustomGoal(data.primary_goal);
      } else {
        localStorage.removeItem("clientDraftId");
      }
    };
    loadDraft();
  }, []);

  // Helpers
  const update = (field: keyof FormState, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleTone = (tone: string) => {
    setSelectedTones((prev) => {
      if (prev.includes(tone)) return prev.filter((t) => t !== tone);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, tone];
    });
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const updateCompetitor = (index: number, value: string) => {
    const newComp = [...form.competitors];
    newComp[index] = value;
    update("competitors", newComp);
  };

  const addCompetitor = () => update("competitors", [...form.competitors, ""]);
  const removeCompetitor = (index: number) => update("competitors", form.competitors.filter((_, i) => i !== index));

  // Save Logic
  const buildPayload = () => {
    const finalIndustry = form.industry_type === "Other" ? customIndustry : form.industry_type;
    const finalGoal = form.primary_goal === "Other" ? customGoal : form.primary_goal;
    
    // Replace "Other" in tones with customTone if selected
    let finalTones = [...selectedTones];
    if (finalTones.includes("Other") && customTone) {
      finalTones = finalTones.map(t => t === "Other" ? customTone : t);
    }

    return {
      business_name: form.business_name,
      industry_type: finalIndustry,
      business_description: form.business_description,
      website_url: form.website_url,
      target_audience: form.target_audience,
      primary_goal: finalGoal,
      brand_tone: finalTones.join(", "),
      platforms: selectedPlatforms.join(", "),
      competitors: form.competitors.filter(c => c.trim()).join(", "),
      additional_notes: form.additional_notes,
    };
  };

  const saveDraft = async () => {
    setSavingDraft(true);
    const payload = { ...buildPayload(), status: "Draft" };
    
    if (draftId) {
      await supabase.from("clients").update(payload).eq("id", draftId);
    } else {
      const { data } = await supabase.from("clients").insert([payload]).select("id").single();
      if (data) {
        setDraftId(data.id);
        localStorage.setItem("clientDraftId", data.id);
      }
    }
    setSavingDraft(false);
  };

  const handleFinalSave = async () => {
    setSavingFinal(true);
    const payload = { ...buildPayload(), status: "Awaiting Strategy" };
    
    let finalId = draftId;
    if (draftId) {
      await supabase.from("clients").update(payload).eq("id", draftId);
    } else {
      const { data } = await supabase.from("clients").insert([payload]).select("id").single();
      if (data) finalId = data.id;
    }
    
    localStorage.removeItem("clientDraftId");
    router.push(`/dashboard/clients/${finalId}`);
  };

  const validateStep1 = () => !!form.business_name;

  return (
    <div className="min-h-full bg-[#fffdfb] flex flex-col font-sans relative pb-24">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">

            ScalePods
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold relative">
            {/* Step Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -z-10 -translate-y-1/2"></div>
            
            <div className={`flex items-center gap-2 px-2 bg-white ${step >= 1 ? "text-orange-500" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? "bg-orange-500 text-white" : "bg-slate-100"}`}>1</span>
              Step 1: Account
            </div>
            <div className={`flex items-center gap-2 px-2 bg-white ${step >= 2 ? "text-orange-500" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? "bg-orange-500 text-white" : "bg-slate-100"}`}>2</span>
              Step 2: Profile
            </div>
            <div className={`flex items-center gap-2 px-2 bg-white ${step >= 3 ? "text-orange-500" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? "bg-orange-500 text-white" : "bg-slate-100"}`}>3</span>
              Step 3: Team
            </div>
          </div>

          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32 pt-10">
        <div className="max-w-2xl mx-auto px-4">
          
          {/* STEP 1: ACCOUNT */}
          {step === 1 && (
            <div className="bg-white border-t-4 border-t-orange-500 rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-12">
              <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Tell us about your business</h1>
              <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">We'll use this to create a personalized marketing strategy for your brand.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Business Name <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl p-3.5 text-[15px] focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none" placeholder="e.g., Acme Corporation" value={form.business_name} onChange={e => update("business_name", e.target.value)} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Industry</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select className="w-full border border-slate-200 rounded-xl p-3.5 pl-11 text-[15px] appearance-none focus:ring-2 focus:ring-orange-200 outline-none bg-white" value={form.industry_type} onChange={e => update("industry_type", e.target.value)}>
                      <option value="">Select your industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  {form.industry_type === "Other" && (
                    <input type="text" className="w-full border border-slate-200 rounded-xl p-3.5 text-[15px] mt-3 focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Type your industry..." value={customIndustry} onChange={e => setCustomIndustry(e.target.value)} />
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Business Description</label>
                    <span className="text-[11px] text-slate-400 font-medium">{form.business_description.length} / 500</span>
                  </div>
                  <textarea maxLength={500} rows={4} className="w-full border border-slate-200 rounded-xl p-3.5 text-[15px] resize-none focus:ring-2 focus:ring-orange-200 outline-none placeholder:text-slate-400" placeholder="Describe what your business does..." value={form.business_description} onChange={e => update("business_description", e.target.value)} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="url" className="w-full border border-slate-200 rounded-xl p-3.5 pl-11 text-[15px] focus:ring-2 focus:ring-orange-200 outline-none" placeholder="https://www.yourcompany.com" value={form.website_url} onChange={e => update("website_url", e.target.value)} />
                  </div>
                  <p className="text-[12px] text-slate-500 mt-2 flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">i</span> We'll analyze your website to understand your brand personality.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROFILE */}
          {step === 2 && (
            <div className="bg-white border-t-4 border-t-orange-500 rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-12 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Marketing Strategy</h1>
              <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">Define your objectives and target audience to optimize the AI workflow.</p>

              <div className="space-y-8">
                {/* Target Audience */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-widest">Target Audience <span className="w-3.5 h-3.5 rounded-full bg-slate-200 flex items-center justify-center text-[9px]">i</span></label>
                    <span className="text-[11px] text-slate-400 font-medium">{form.target_audience.length} / 300</span>
                  </div>
                  <textarea maxLength={300} rows={4} className="w-full bg-slate-50 border-none rounded-xl p-4 text-[15px] resize-none focus:ring-2 focus:ring-orange-200 outline-none placeholder:text-slate-400" placeholder="Describe your ideal customer..." value={form.target_audience} onChange={e => update("target_audience", e.target.value)} />
                </div>

                {/* Primary Goal */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-4">Primary Goal</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GOALS.map(goal => (
                      <button key={goal} onClick={() => update("primary_goal", goal)} className={`p-4 rounded-xl border text-center transition-all ${form.primary_goal === goal ? "bg-orange-50 border-orange-500 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                        <div className={`mb-2 text-xl ${form.primary_goal === goal ? "text-orange-500" : "text-slate-400"}`}>
                          {goal === "Sales" && "$"}
                          {goal === "Awareness" && "📢"}
                          {goal === "Lead Gen" && "🎯"}
                          {goal === "Education" && "📚"}
                          {goal === "Community" && "👥"}
                          {goal === "Other" && "✨"}
                        </div>
                        <p className={`text-xs font-bold ${form.primary_goal === goal ? "text-orange-900" : "text-slate-600"}`}>{goal}</p>
                      </button>
                    ))}
                  </div>
                  {form.primary_goal === "Other" && (
                     <input type="text" className="w-full border border-slate-200 rounded-xl p-3.5 text-[15px] mt-3 focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Type your primary goal..." value={customGoal} onChange={e => setCustomGoal(e.target.value)} />
                  )}
                </div>

                {/* Brand Tone */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                     <label className="block text-sm font-bold text-slate-900">Brand Tone (Max 3)</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map(tone => {
                      const active = selectedTones.includes(tone);
                      return (
                        <button key={tone} onClick={() => toggleTone(tone)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                          {tone}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTones.includes("Other") && (
                     <input type="text" className="w-full border border-slate-200 rounded-xl p-3.5 text-[15px] mt-3 focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Type your custom tone..." value={customTone} onChange={e => setCustomTone(e.target.value)} />
                  )}
                  <p className="text-[11px] font-bold text-orange-500 mt-3 uppercase tracking-widest">{selectedTones.length} / 3 SELECTED</p>
                </div>

                {/* Target Platforms */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-4">Target Platforms</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PLATFORMS_LIST.map(platform => {
                      const active = selectedPlatforms.includes(platform);
                      return (
                        <button key={platform} onClick={() => togglePlatform(platform)} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${active ? "bg-orange-50 border-orange-500 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {platform === "Instagram" && "📸"}
                            {platform === "LinkedIn" && "💼"}
                            {platform === "Website" && "🌐"}
                            {platform === "Twitter/X" && "🐦"}
                            {platform === "YouTube" && "▶️"}
                            {platform === "TikTok" && "📱"}
                          </div>
                          <span className={`text-sm font-bold ${active ? "text-orange-900" : "text-slate-700"}`}>{platform}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: TEAM / COMPETITORS */}
          {step === 3 && (
             <div className="bg-white border-t-4 border-t-orange-500 rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-12 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-center mb-8">
               <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 block">100% Complete — Ready to finalize</span>
               <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Who are your competitors?</h1>
               <p className="text-slate-500 text-[15px] leading-relaxed">Add competitor websites so we can analyze their marketing strategies.</p>
             </div>

             <div className="space-y-4">
               {form.competitors.map((comp, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="relative flex-1">
                     <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input type="url" value={comp} onChange={e => updateCompetitor(i, e.target.value)} className="w-full border border-slate-200 rounded-xl p-3.5 pl-10 text-[15px] focus:ring-2 focus:ring-orange-200 outline-none" placeholder="https://competitor.com" />
                   </div>
                   {form.competitors.length > 1 && (
                     <button onClick={() => removeCompetitor(i)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">✕</button>
                   )}
                 </div>
               ))}

               <button onClick={addCompetitor} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold text-sm hover:border-orange-300 hover:text-orange-600 transition-all flex items-center justify-center gap-2">
                 + Add Another Competitor
               </button>
               <p className="text-[12px] text-slate-400 italic">We'll analyze their content, messaging, and social presence.</p>
             </div>

             <div className="mt-8">
               <label className="block text-xs font-bold text-slate-700 mb-2">Additional Notes (Optional)</label>
               <textarea rows={4} className="w-full border border-slate-200 rounded-xl p-4 text-[15px] resize-none focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Any specific aspects you want us to focus on? (e.g., their LinkedIn strategy, blog quality...)" value={form.additional_notes} onChange={e => update("additional_notes", e.target.value)} />
             </div>

             <div className="mt-8 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl flex gap-3">
               <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">i</span>
               <p className="text-sm font-medium text-orange-900 leading-relaxed">Our AI will analyze your business and competitors across selected platforms. This typically takes 2-3 minutes when you generate the strategy.</p>
             </div>
           </div>
          )}

        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="sticky bottom-0 w-full bg-white border-t border-slate-200 p-4 z-40 mt-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link href="/dashboard/clients" className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-all">
                Cancel
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={saveDraft} disabled={savingDraft} className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors px-2">
              {savingDraft ? "Saving..." : "SAVE DRAFT"}
            </button>

            {step < 3 ? (
              <button 
                onClick={() => {
                  if (step === 1 && !validateStep1()) return alert("Business Name is required.");
                  setStep(step + 1);
                }} 
                className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-200"
              >
                Continue to Step {step + 1} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleFinalSave} 
                disabled={savingFinal}
                className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-200"
              >
                {savingFinal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingFinal ? "Saving..." : "Save Client Details"}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
