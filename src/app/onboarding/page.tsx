"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

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
                    <span className="material-symbols-outlined text-sm">
                      check
                    </span>
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
                    <span className="material-symbols-outlined text-sm">
                      check
                    </span>
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
              <>
                <div className="space-y-1">
                  <h1 className="font-h2 text-h2 text-on-surface">
                    Business Profile
                  </h1>
                  <p className="font-body-base text-body-sm text-secondary">
                    Tell us about your business so our AI agent can analyze your industry.
                  </p>
                </div>
                <section className="space-y-4">
                  <div>
                    <label className="block font-label-caps text-on-surface mb-2">
                      Business Name
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg font-body-base focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
                      placeholder="e.g. Acme Corp"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface mb-2">
                      Industry
                    </label>
                    <select className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg font-body-base focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all">
                      <option value="" disabled selected>
                        Select Industry
                      </option>
                      <option value="saas">SaaS / Software</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="agency">Agency / Services</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-label-caps text-on-surface">
                        Business Description
                      </label>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                        0 / 500
                      </span>
                    </div>
                    <textarea
                      className="w-full h-[120px] bg-white border border-outline-variant rounded-lg p-3 font-body-base text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all placeholder:text-slate-400"
                      placeholder="What does your business do? What are your main products or services?"
                    ></textarea>
                  </div>
                </section>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-1">
                  <h1 className="font-h2 text-h2 text-on-surface">
                    Marketing Strategy
                  </h1>
                  <p className="font-body-base text-body-sm text-secondary">
                    Define your objectives and target audience to optimize the AI
                    workflow.
                  </p>
                </div>

                {/* 1. Target Audience */}
                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-label-caps text-on-surface flex items-center gap-1">
                      Target Audience
                      <span
                        className="material-symbols-outlined text-sm text-slate-400 cursor-help"
                        title="Describe who you want to reach"
                      >
                        info
                      </span>
                    </label>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                      0 / 300
                    </span>
                  </div>
                  <textarea
                    className="w-full h-[100px] bg-white border border-outline-variant rounded-lg p-3 font-body-base text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all placeholder:text-slate-400"
                    placeholder="Describe your ideal customer..."
                  ></textarea>
                </section>

                {/* 2. Primary Goal */}
                <section className="space-y-4">
                  <label className="font-label-caps text-on-surface">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <label className="relative group cursor-pointer border-2 border-outline-variant hover:border-primary-container/50 bg-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0]">
                      <input type="radio" name="goal" value="sales" className="hidden" defaultChecked />
                      <span className="material-symbols-outlined text-on-surface group-has-[:checked]:text-primary-container">
                        attach_money
                      </span>
                      <span className="font-label-caps text-[10px] text-on-surface">
                        Sales
                      </span>
                    </label>
                    <label className="relative group cursor-pointer border-2 border-outline-variant hover:border-primary-container/50 bg-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0]">
                      <input type="radio" name="goal" value="awareness" className="hidden" />
                      <span className="material-symbols-outlined text-on-surface group-has-[:checked]:text-primary-container">
                        campaign
                      </span>
                      <span className="font-label-caps text-[10px] text-on-surface">
                        Awareness
                      </span>
                    </label>
                    <label className="relative group cursor-pointer border-2 border-outline-variant hover:border-primary-container/50 bg-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0]">
                      <input type="radio" name="goal" value="lead_gen" className="hidden" />
                      <span className="material-symbols-outlined text-on-surface group-has-[:checked]:text-primary-container">
                        nest_cam_magnet_mount
                      </span>
                      <span className="font-label-caps text-[10px] text-on-surface">
                        Lead Gen
                      </span>
                    </label>
                    <label className="relative group cursor-pointer border-2 border-outline-variant hover:border-primary-container/50 bg-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0]">
                      <input type="radio" name="goal" value="education" className="hidden" />
                      <span className="material-symbols-outlined text-on-surface group-has-[:checked]:text-primary-container">
                        menu_book
                      </span>
                      <span className="font-label-caps text-[10px] text-on-surface">
                        Education
                      </span>
                    </label>
                    <label className="relative group cursor-pointer border-2 border-outline-variant hover:border-primary-container/50 bg-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0]">
                      <input type="radio" name="goal" value="community" className="hidden" />
                      <span className="material-symbols-outlined text-on-surface group-has-[:checked]:text-primary-container">
                        groups
                      </span>
                      <span className="font-label-caps text-[10px] text-on-surface">
                        Community
                      </span>
                    </label>
                    <label className="relative group cursor-pointer border-2 border-outline-variant hover:border-primary-container/50 bg-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0]">
                      <input type="radio" name="goal" value="other" className="hidden" />
                      <span className="material-symbols-outlined text-on-surface group-has-[:checked]:text-primary-container">
                        auto_awesome
                      </span>
                      <span className="font-label-caps text-[10px] text-on-surface">
                        Other
                      </span>
                    </label>
                  </div>
                </section>

                {/* 3. Brand Tone */}
                <section className="space-y-3">
                  <label className="font-label-caps text-on-surface">
                    Brand Tone (Max 3)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Premium", "Casual", "Bold", "Innovative", "Professional", "Aggressive"].map((tone, idx) => (
                      <label key={tone} className="cursor-pointer">
                        <input type="checkbox" className="hidden peer" defaultChecked={idx === 0 || idx === 2} />
                        <div className="px-4 py-2 rounded-full font-label-caps text-[11px] bg-surface-container text-on-surface-variant peer-checked:bg-primary-container peer-checked:text-white transition-colors shadow-sm hover:bg-surface-variant">
                          {tone}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] font-medium text-primary-container tracking-wide">
                    2 / 3 SELECTED
                  </p>
                </section>

                {/* 4. Target Platforms */}
                <section className="space-y-4">
                  <label className="font-label-caps text-on-surface">
                    Target Platforms
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex-1 relative p-4 border-2 border-outline-variant rounded-lg flex items-center gap-3 bg-white cursor-pointer transition-colors has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0] hover:border-primary-container/50">
                      <input type="checkbox" className="hidden peer" defaultChecked />
                      <span className="material-symbols-outlined text-slate-400 peer-checked:text-primary-container">
                        photo_camera
                      </span>
                      <span className="font-body-base text-body-sm font-semibold text-on-surface">
                        Instagram
                      </span>
                    </label>
                    <label className="flex-1 relative p-4 border-2 border-outline-variant rounded-lg flex items-center gap-3 bg-white cursor-pointer transition-colors has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0] hover:border-primary-container/50">
                      <input type="checkbox" className="hidden peer" />
                      <span className="material-symbols-outlined text-slate-400 peer-checked:text-primary-container">
                        work
                      </span>
                      <span className="font-body-base text-body-sm font-semibold text-on-surface">
                        LinkedIn
                      </span>
                    </label>
                    <label className="flex-1 relative p-4 border-2 border-outline-variant rounded-lg flex items-center gap-3 bg-white cursor-pointer transition-colors has-[:checked]:border-primary-container has-[:checked]:bg-[#FFF3E0] hover:border-primary-container/50">
                      <input type="checkbox" className="hidden peer" defaultChecked />
                      <span className="material-symbols-outlined text-slate-400 peer-checked:text-primary-container">
                        language
                      </span>
                      <span className="font-body-base text-body-sm font-semibold text-on-surface">
                        Website
                      </span>
                    </label>
                  </div>
                </section>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-1">
                  <h1 className="font-h2 text-h2 text-on-surface">
                    Competitor Analysis
                  </h1>
                  <p className="font-body-base text-body-sm text-secondary">
                    List your top competitors so our AI can analyze their strategies.
                  </p>
                </div>
                <section className="space-y-4">
                  <div>
                    <label className="block font-label-caps text-on-surface mb-2">
                      Competitor 1
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg font-body-base focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
                      placeholder="e.g. competitor.com or @competitor"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface mb-2">
                      Competitor 2 (Optional)
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg font-body-base focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
                      placeholder="e.g. competitor.com or @competitor"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface mb-2">
                      Competitor 3 (Optional)
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg font-body-base focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
                      placeholder="e.g. competitor.com or @competitor"
                      type="text"
                    />
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Action Bar Component */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`text-slate-700 border border-slate-300 rounded-lg px-8 py-3 flex items-center gap-2 font-label-caps text-xs font-semibold uppercase tracking-wider transition-opacity duration-150 ${
              step === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 active:translate-y-0.5"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Back
          </button>
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200 rounded-lg px-6 py-3 font-label-caps text-xs font-semibold uppercase tracking-wider transition-all">
              Save Draft
            </button>
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="bg-primary-container text-white rounded-lg px-8 py-3 flex items-center gap-2 font-label-caps text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:translate-y-0.5 duration-150"
              >
                Continue to Step {step + 1}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="bg-primary-container text-white rounded-lg px-8 py-3 flex items-center gap-2 font-label-caps text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:translate-y-0.5 duration-150"
              >
                Finish & Generate Strategy
                <span className="material-symbols-outlined text-sm">
                  check_circle
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
