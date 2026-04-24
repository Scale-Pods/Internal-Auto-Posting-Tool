"use client";

import React from "react";
import Link from "next/link";

export default function StrategyReportPage() {
  return (
    <div className="bg-surface min-h-screen font-body-base text-on-surface antialiased">
      {/* Top AppBar Component */}
      <header className="bg-white shadow-sm border-b border-slate-200 w-full fixed top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-slate-900 font-h2">
              FlowPilot AI
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider bg-primary-container/10 px-3 py-1 rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              AI Strategy Generated
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-label-caps text-sm font-medium text-slate-500 hover:text-primary-container transition-colors">
              Skip to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mt-24 mb-32 w-full max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface mb-2">
              Your Marketing Strategy
            </h1>
            <p className="font-body-base text-secondary text-lg">
              We've analyzed your business and competitors. Here is your roadmap to success.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 border border-outline-variant rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>
              Download PDF
            </button>
            <button className="px-6 py-2 bg-primary-container text-white rounded-lg text-sm font-semibold hover:bg-primary-container/90 transition-colors flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-sm">edit</span>
              Refine Strategy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Insights (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Strategy Card */}
            <div className="bg-white p-8 rounded-xl shadow-soft border border-outline-variant/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-fixed/30 rounded-full flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                </div>
                <div>
                  <h3 className="font-h2 text-xl mb-1">Executive Summary</h3>
                  <p className="font-body-base text-on-surface-variant">
                    Based on our deep audit, your strongest growth opportunity lies in <strong>educational content on LinkedIn</strong> targeting mid-level managers in the B2B SaaS space. Your competitors are currently neglecting video content, giving you a clear opening.
                  </p>
                </div>
              </div>
            </div>

            {/* Target Audience Insights */}
            <div className="bg-white p-8 rounded-xl shadow-soft border border-outline-variant/30">
              <h3 className="font-h2 text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">group</span>
                Audience Personas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border border-outline-variant/50 rounded-lg bg-surface-container-lowest hover:border-primary-container/30 transition-colors">
                  <h4 className="font-bold text-lg mb-2">The Decision Maker</h4>
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> CEO / Founders</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Seeks ROI & Efficiency</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Active on LinkedIn</li>
                  </ul>
                </div>
                <div className="p-5 border border-outline-variant/50 rounded-lg bg-surface-container-lowest hover:border-primary-container/30 transition-colors">
                  <h4 className="font-bold text-lg mb-2">The End User</h4>
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Marketing Managers</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Seeks ease of use</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Active on Instagram/Twitter</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Content Pillars */}
            <div className="bg-white p-8 rounded-xl shadow-soft border border-outline-variant/30">
              <h3 className="font-h2 text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">view_kanban</span>
                Recommended Content Pillars
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-surface rounded-lg">
                  <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-md font-bold text-xs">40%</div>
                  <div>
                    <h5 className="font-bold text-on-surface">Educational / How-To Guides</h5>
                    <p className="text-sm text-on-surface-variant">Position your brand as an industry thought leader. Share actionable templates and strategies.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-surface rounded-lg">
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md font-bold text-xs">40%</div>
                  <div>
                    <h5 className="font-bold text-on-surface">Case Studies & Social Proof</h5>
                    <p className="text-sm text-on-surface-variant">Highlight customer success stories with hard metrics and ROI data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-surface rounded-lg">
                  <div className="bg-green-100 text-green-600 px-3 py-1 rounded-md font-bold text-xs">20%</div>
                  <div>
                    <h5 className="font-bold text-on-surface">Behind the Scenes / Culture</h5>
                    <p className="text-sm text-on-surface-variant">Humanize the brand. Show the team behind the product.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Side Panel (Right Column) */}
          <div className="space-y-6">
            {/* Competitor Analysis */}
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="font-h2 text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">radar</span>
                Competitor Intel
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-300">Competitor A</span>
                    <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Weakness</span>
                  </div>
                  <p className="text-xs text-slate-400">Inconsistent posting schedule, poor visual branding.</p>
                </div>
                <div className="h-px bg-slate-800 w-full"></div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-300">Competitor B</span>
                    <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Weakness</span>
                  </div>
                  <p className="text-xs text-slate-400">Highly corporate tone; lacks engagement with comments.</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <p className="text-xs font-semibold text-primary-fixed mb-1">AI Recommendation:</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Adopt a "Premium but Approachable" tone and post high-quality carousel graphics to outshine their feeds.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-soft border border-outline-variant/30">
              <h3 className="font-h2 text-lg mb-4">Ready to execute?</h3>
              <p className="text-sm text-secondary mb-6">Let's generate your first month of content based on this strategy.</p>
              <div className="space-y-3">
                <button className="w-full py-3 bg-primary-container text-white rounded-lg font-bold text-sm shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">magic_button</span>
                  Generate Content Calendar
                </button>
                <Link href="/dashboard" className="w-full py-3 bg-surface-container text-on-surface rounded-lg font-bold text-sm hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 block text-center">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
