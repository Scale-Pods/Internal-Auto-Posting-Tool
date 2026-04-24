"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Page 1: Business Info
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Page 2: Marketing Strategy
  const [targetAudience, setTargetAudience] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("sales"); // default
  const [brandTones, setBrandTones] = useState<string[]>(["Premium", "Bold"]); // default selections
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(["Instagram", "Website"]); // default

  // Page 3: Competitor Analysis
  const [competitors, setCompetitors] = useState<string[]>([""]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // --- Helpers for Page 2 ---
  const toggleBrandTone = (tone: string) => {
    setBrandTones(prev => {
      if (prev.includes(tone)) {
        return prev.filter(t => t !== tone);
      } else {
        if (prev.length >= 3) return prev; // max 3
        return [...prev, tone];
      }
    });
  };

  const togglePlatform = (platform: string) => {
    setTargetPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  // --- Helpers for Page 3 ---
  const addCompetitor = () => {
    setCompetitors(prev => [...prev, ""]);
  };
  
  const updateCompetitor = (index: number, value: string) => {
    const newComps = [...competitors];
    newComps[index] = value;
    setCompetitors(newComps);
  };
  
  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  // --- Submission ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        business_name: businessName,
        industry_type: industry,
        business_description: description,
        website_url: websiteUrl,
        target_audience: targetAudience,
        primary_goal: primaryGoal,
        brand_tone: brandTones.join(", "),
        platforms: targetPlatforms.join(", "),
        competitors: competitors.filter(c => c.trim() !== "").join(", "),
        additional_notes: additionalNotes,
        status: "analyzing"
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Redirect to Analyzing step with the new client ID
      router.push(`/onboarding/analyzing?id=${data.id}`);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save client data. Make sure database columns are created.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col items-center font-body-base text-on-surface antialiased">
      {/* Top AppBar Component */}
      <header className="bg-white shadow-sm border-b border-slate-200 w-full fixed top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-slate-900 font-h2">
              FlowPilot AI
            </span>
            {/* Step Progress */}
            <nav className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step > 1 ? "bg-green-500 text-white" : "bg-primary-container text-white"
                  }`}
                >
                  {step > 1 ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className="text-xs font-bold">1</span>
                  )}
                </div>
                <span
                  className={`font-label-caps text-sm font-medium ${
                    step === 1 ? "text-primary-container border-b-2 border-primary-container pb-1" : "text-slate-500"
                  }`}
                >
                  Business Info
                </span>
              </div>
              <div className="w-8 h-px bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step > 2
                      ? "bg-green-500 text-white"
                      : step === 2
                      ? "bg-primary-container text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > 2 ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className="text-xs font-bold">2</span>
                  )}
                </div>
                <span
                  className={`font-label-caps text-sm font-medium ${
                    step === 2 ? "text-primary-container border-b-2 border-primary-container pb-1" : "text-slate-500"
                  }`}
                >
                  Marketing Strategy
                </span>
              </div>
              <div className="w-8 h-px bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step === 3 ? "bg-primary-container text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <span className="text-xs font-bold">3</span>
                </div>
                <span
                  className={`font-label-caps text-sm font-medium ${
                    step === 3 ? "text-primary-container border-b-2 border-primary-container pb-1" : "text-slate-500"
                  }`}
                >
                  Competitors
                </span>
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="font-label-caps text-sm font-medium text-slate-500 hover:text-primary-container transition-colors">
              Save & Exit
            </button>
            <span className="material-symbols-outlined text-slate-500 cursor-help">
              help_outline
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mt-28 mb-32 w-full max-w-[600px] px-4">
        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {errorMsg}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden border border-outline-variant/30">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-surface-container">
            <div
              className="h-full bg-primary-container transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          <div className="p-8 space-y-8">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-1">
                  <h1 className="font-h2 text-h2 text-on-surface">Tell us about your business</h1>
                  <p className="font-body-base text-body-sm text-secondary">
                    We'll use this to create a personalized marketing strategy for your brand.
                  </p>
                </div>
                <section className="space-y-5">
                  <div>
                    <label className="block font-label-caps text-[11px] text-on-surface mb-2 font-bold tracking-wider">BUSINESS NAME <span className="text-red-500">*</span></label>
                    <input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg font-body-base text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
                      placeholder="e.g., Acme Corporation"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[11px] text-on-surface mb-2 font-bold tracking-wider">INDUSTRY</label>
                    <select 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg font-body-base text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all appearance-none"
                    >
                      <option value="" disabled>Select your industry</option>
                      <option value="SaaS / Software">SaaS / Software</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Agency / Services">Agency / Services</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-label-caps text-[11px] text-on-surface font-bold tracking-wider">BUSINESS DESCRIPTION</label>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                        {description.length} / 500
                      </span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      className="w-full h-[120px] bg-white border border-slate-200 rounded-lg p-3 font-body-base text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all placeholder:text-slate-400 resize-none"
                      placeholder="Describe what your business does..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block font-label-caps text-[11px] text-on-surface mb-2 font-bold tracking-wider">WEBSITE URL</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">language</span>
                      <input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg font-body-base text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
                        placeholder="https://www.yourcompany.com"
                        type="url"
                      />
                    </div>
                    <p className="flex items-center gap-1 mt-2 text-[11px] text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      We'll analyze your website to understand your brand personality.
                    </p>
                  </div>
                </section>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-1">
                  <h1 className="font-h2 text-h2 text-on-surface">Marketing Strategy</h1>
                  <p className="font-body-base text-body-sm text-secondary">
                    Define your objectives and target audience to optimize the AI workflow.
                  </p>
                </div>

                {/* 1. Target Audience */}
                <section className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-label-caps text-[11px] text-on-surface font-bold tracking-wider flex items-center gap-1">
                      Target Audience
                      <span className="material-symbols-outlined text-sm text-slate-400 cursor-help" title="Describe who you want to reach">info</span>
                    </label>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                      {targetAudience.length} / 300
                    </span>
                  </div>
                  <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    maxLength={300}
                    className="w-full h-[100px] bg-slate-50 border border-slate-200 rounded-lg p-3 font-body-base text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all placeholder:text-slate-400 resize-none"
                    placeholder="Describe your ideal customer..."
                  ></textarea>
                </section>

                {/* 2. Primary Goal */}
                <section className="space-y-3">
                  <label className="font-label-caps text-[11px] text-on-surface font-bold tracking-wider">Primary Goal</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: "sales", icon: "attach_money", label: "Sales" },
                      { id: "awareness", icon: "campaign", label: "Awareness" },
                      { id: "lead_gen", icon: "nest_cam_magnet_mount", label: "Lead Gen" },
                      { id: "education", icon: "menu_book", label: "Education" },
                      { id: "community", icon: "groups", label: "Community" },
                      { id: "other", icon: "auto_awesome", label: "Other" },
                    ].map((goal) => {
                      const isActive = primaryGoal === goal.id;
                      return (
                        <div 
                          key={goal.id}
                          onClick={() => setPrimaryGoal(goal.id)}
                          className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                            isActive 
                              ? "border-primary-container bg-[#FFF3E0] text-primary-container" 
                              : "border-slate-200 hover:border-primary-container/50 bg-white text-slate-500"
                          }`}
                        >
                          <span className="material-symbols-outlined">{goal.icon}</span>
                          <span className="font-label-caps text-[10px] font-semibold text-slate-700">{goal.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 3. Brand Tone */}
                <section className="space-y-3">
                  <label className="font-label-caps text-[11px] text-on-surface font-bold tracking-wider">Brand Tone (Max 3)</label>
                  <div className="flex flex-wrap gap-2">
                    {["Premium", "Casual", "Bold", "Innovative", "Professional", "Aggressive"].map((tone) => {
                      const isActive = brandTones.includes(tone);
                      return (
                        <div 
                          key={tone}
                          onClick={() => toggleBrandTone(tone)}
                          className={`cursor-pointer px-4 py-2 rounded-full font-label-caps text-[11px] font-bold transition-colors shadow-sm ${
                            isActive
                              ? "bg-primary-container text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {tone}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-bold text-primary-container tracking-wide uppercase">
                    {brandTones.length} / 3 SELECTED
                  </p>
                </section>

                {/* 4. Target Platforms */}
                <section className="space-y-3">
                  <label className="font-label-caps text-[11px] text-on-surface font-bold tracking-wider">Target Platforms</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {[
                      { id: "Instagram", icon: "photo_camera" },
                      { id: "LinkedIn", icon: "work" },
                      { id: "Website", icon: "language" },
                    ].map((plat) => {
                      const isActive = targetPlatforms.includes(plat.id);
                      return (
                        <div 
                          key={plat.id}
                          onClick={() => togglePlatform(plat.id)}
                          className={`flex-1 relative p-4 border-2 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${
                            isActive
                              ? "border-primary-container bg-[#FFF3E0]"
                              : "border-slate-200 bg-white hover:border-primary-container/50"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute top-2 right-2 material-symbols-outlined text-[16px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          )}
                          <span className={`material-symbols-outlined ${isActive ? "text-primary-container" : "text-slate-400"}`}>
                            {plat.icon}
                          </span>
                          <span className="font-body-base text-sm font-semibold text-slate-800">
                            {plat.id}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-1">
                  <h1 className="font-h2 text-h2 text-on-surface">Competitor Analysis</h1>
                  <p className="font-body-base text-body-sm text-secondary">
                    List your top competitors so our AI can analyze their strategies.
                  </p>
                </div>
                
                <section className="space-y-4">
                  <label className="block font-label-caps text-[11px] text-on-surface font-bold tracking-wider">COMPETITOR URLs</label>
                  <div className="space-y-3">
                    {competitors.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">link</span>
                          <input
                            value={comp}
                            onChange={(e) => updateCompetitor(idx, e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg font-body-base text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
                            placeholder="e.g., https://competitor.com or @competitor"
                            type="text"
                          />
                        </div>
                        {competitors.length > 1 && (
                          <button 
                            onClick={() => removeCompetitor(idx)}
                            className="w-12 h-12 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={addCompetitor}
                    className="flex items-center gap-2 text-sm font-bold text-primary-container hover:bg-primary-container/10 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add URL option
                  </button>
                </section>

                <section className="space-y-2 pt-4">
                  <label className="block font-label-caps text-[11px] text-on-surface font-bold tracking-wider">ADDITIONAL NOTES (OPTIONAL)</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="w-full h-[120px] bg-white border border-slate-200 rounded-lg p-3 font-body-base text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all placeholder:text-slate-400 resize-none"
                    placeholder="Any specific instructions for the AI analyst? (e.g., 'Focus on their recent Q4 campaigns')"
                  ></textarea>
                </section>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Action Bar Component */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={step === 1 || isSubmitting}
            className={`text-slate-700 border border-slate-300 rounded-lg px-8 py-3 flex items-center gap-2 font-label-caps text-xs font-semibold uppercase tracking-wider transition-opacity duration-150 ${
              step === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 active:translate-y-0.5"
            }`}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
          
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200 rounded-lg px-6 py-3 font-label-caps text-xs font-semibold uppercase tracking-wider transition-all">
              Save Draft
            </button>
            {step < 3 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && (!businessName)} // basic validation
                className="bg-primary-container text-white rounded-lg px-8 py-3 flex items-center gap-2 font-label-caps text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-colors active:translate-y-0.5 duration-150 disabled:opacity-50"
              >
                Continue to Step {step + 1}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary-container text-white rounded-lg px-8 py-3 flex items-center gap-2 font-label-caps text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-colors active:translate-y-0.5 duration-150 disabled:opacity-70 min-w-[240px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Finish & Generate Strategy
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Import framer-motion here implicitly if needed or above */}
    </div>
  );
}
