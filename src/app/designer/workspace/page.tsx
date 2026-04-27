"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DesignerWorkspacePage() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPlatform, setExportPlatform] = useState("");

  const handleExportClick = (platform: string) => {
    setExportPlatform(platform);
    setShowExportModal(true);
  };

  return (
    <div className="bg-background min-h-screen text-on-background font-body-base flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-[240px] h-screen flex-shrink-0 border-r border-slate-200 bg-white z-50 flex flex-col py-6">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div>
              <div className="bg-primary p-2.5 rounded-lg flex items-center justify-center shadow-md">
                <img src="/logo-light.png" alt="ScalePods" className="h-6 object-contain" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">DesignOps Engine</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 py-2.5 px-6 text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-sm">
            <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
          </Link>
          <div className="flex items-center gap-3 bg-primary-container/10 text-primary-container border-l-4 border-primary-container py-2.5 px-6 font-semibold text-sm">
            <span className="material-symbols-outlined text-[20px]">folder_copy</span> Projects
          </div>
          <Link href="/designer/tasks" className="flex items-center gap-3 py-2.5 px-6 text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-sm">
            <span className="material-symbols-outlined text-[20px]">assignment</span> Tasks
          </Link>
        </nav>
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 border-b border-slate-200 bg-white h-16 flex justify-between items-center px-6 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-label-caps text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">#FP-2026-88</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="font-bold text-slate-900 text-sm">Acme Corp</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-lg">event_upcoming</span>
              <span className="text-sm font-medium text-slate-600">Tomorrow 5PM <span className="text-error font-bold">(Urgent)</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-container/10 border border-primary-container/20 rounded-full text-primary-container text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              In Progress
            </div>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-slate-200 border border-white text-xs font-bold text-slate-600 flex items-center justify-center">JD</button>
            </div>
          </div>
        </header>

        {/* Workspace Content (3 Columns) */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* Left: AI Content Brief (30%) */}
          <section className="w-[30%] flex-shrink-0 border-r border-slate-200 bg-surface-container overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="font-h2 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">psychology</span>
                AI Content Brief
              </h3>
            </div>
            
            <div className="space-y-3">
              <p className="font-label-caps text-[11px] text-secondary tracking-wider uppercase">Selected Platforms</p>
              <div className="flex gap-2">
                <div className="flex-1 py-2 bg-white rounded-lg border-2 border-primary-container shadow-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-sm">photo_library</span>
                  <span className="text-sm font-semibold">Instagram</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex justify-between mb-2">
                  <p className="font-label-caps text-[10px] text-slate-400">Generated Caption</p>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  Transform your DesignOps with ScalePods. Automate the mundane, amplify the creative. 🚀
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary-fixed/30 text-primary-container border border-primary-container/20 rounded text-[10px] font-bold">#AI_DESIGN</span>
                <span className="px-2 py-1 bg-primary-fixed/30 text-primary-container border border-primary-container/20 rounded text-[10px] font-bold">#SAAS_TOOLS</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-label-caps text-[11px] text-secondary tracking-wider uppercase">Brand Identity</p>
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-outline-variant">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-container border-2 border-white shadow-sm"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-sm"></div>
                  <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-white shadow-sm"></div>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <p className="text-xs font-semibold text-slate-600">Autoflow Modernist v2.1</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-label-caps text-[11px] text-secondary tracking-wider uppercase">Compliance Checklist</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600 bg-white p-2 rounded-lg border border-outline-variant">
                  <span className="material-symbols-outlined text-green-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Brand logo visibility
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 bg-white p-2 rounded-lg border border-outline-variant">
                  <span className="material-symbols-outlined text-green-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  WCAG Color contrast ratio
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-400 bg-surface p-2 rounded-lg border border-outline-variant/50 border-dashed">
                  <span className="material-symbols-outlined text-slate-300 text-lg">radio_button_unchecked</span>
                  Secondary CTA padding
                </li>
              </ul>
            </div>
          </section>

          {/* Middle: Interactive Design Canvas (50%) */}
          <section className="flex-1 flex flex-col bg-white relative">
            {/* Toolbar */}
            <div className="h-14 flex-shrink-0 border-b border-slate-200 flex items-center justify-between px-4 bg-white z-10">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors"><span className="material-symbols-outlined text-[20px]">highlight_text_cursor</span></button>
                <button className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors"><span className="material-symbols-outlined text-[20px]">crop_square</span></button>
                <button className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors"><span className="material-symbols-outlined text-[20px]">text_fields</span></button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container/10 text-primary-container rounded-lg text-xs font-bold hover:bg-primary-container/20 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">magic_button</span> Auto-layout
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleExportClick("Canva")} className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-sm">open_in_new</span> Canva
                </button>
                <button onClick={() => handleExportClick("Figma")} className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-sm">design_services</span> Figma
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-slate-50 flex items-center justify-center p-12 overflow-hidden relative" style={{ backgroundImage: "radial-gradient(#e4beb4 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
              <div className="relative group">
                {/* Simulated Canvas Node */}
                <div className="w-[320px] aspect-[4/5] bg-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant relative">
                  <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">
                    [Graphic Placeholder]
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <h4 className="text-white font-h2 text-xl leading-tight drop-shadow-md">Elevate your automation workflow.</h4>
                    <div className="mt-4 w-12 h-1 bg-primary-container"></div>
                  </div>
                </div>

                <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <button className="w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:text-primary-container transition-colors">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:text-primary-container transition-colors">
                    <span className="material-symbols-outlined">zoom_out</span>
                  </button>
                </div>
              </div>

              {/* Slide Management */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200">
                <div className="w-16 h-20 bg-slate-200 rounded-lg border-2 border-primary-container overflow-hidden shadow-sm">
                   <div className="w-full h-full bg-slate-300"></div>
                </div>
                <div className="w-16 h-20 bg-surface rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center hover:border-primary-container transition-colors cursor-pointer text-secondary">
                  <span className="material-symbols-outlined">add</span>
                </div>
              </div>
              
              {/* AI Assistant Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-center">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
                  <span className="text-xs font-semibold">ScalePods suggests a "Multi-platform resize"</span>
                  <button className="px-4 py-1.5 bg-primary-container rounded-full text-xs font-bold hover:bg-primary transition-colors shadow-sm">Apply Resize</button>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Workflow & Intelligence (20%) */}
          <section className="w-[20%] flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
              <div className="text-center space-y-4">
                <p className="font-label-caps text-[11px] tracking-wider uppercase text-secondary">Readiness Score</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle className="text-slate-100" cx="48" cy="48" fill="transparent" r="40" strokeWidth="8" stroke="currentColor"></circle>
                    <circle className="text-primary-container" cx="48" cy="48" fill="transparent" r="40" strokeWidth="8" stroke="currentColor" strokeDasharray="251" strokeDashoffset="37"></circle>
                  </svg>
                  <span className="absolute font-h2 text-xl text-slate-900">85%</span>
                </div>
                <p className="text-[11px] text-slate-500 italic">"Highly consistent with brand guidelines."</p>
              </div>

              <div className="space-y-4">
                <p className="font-label-caps text-[11px] tracking-wider uppercase text-secondary">Versions</p>
                <div className="space-y-4 border-l-2 border-slate-100 ml-2 pl-4">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-primary-container ring-4 ring-white"></div>
                    <p className="text-xs font-bold text-slate-900">Layout Optimization</p>
                    <p className="text-[10px] text-slate-400">Today, 2:14 PM • AI Assist</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white"></div>
                    <p className="text-xs font-semibold text-slate-500">Brand Kit Applied</p>
                    <p className="text-[10px] text-slate-400">Yesterday • You</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom Action Bar */}
        <footer className="flex-shrink-0 h-16 bg-white border-t border-slate-200 flex justify-between items-center px-8 z-50">
          <div className="flex items-center gap-8">
            <button className="flex flex-col items-center text-slate-500 hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-lg">save</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Save Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/designer/tasks" className="px-6 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Close
            </Link>
            <button className="px-8 py-2.5 rounded-lg bg-primary-container text-white text-sm font-bold shadow-md hover:bg-primary transition-colors flex items-center gap-2">
              Submit for Approval
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Export Modal Placeholder */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h2 text-xl text-slate-900">Export to {exportPlatform}</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Syncing this design will push the latest layout and assets to your linked {exportPlatform} account.
            </p>
            <div className="bg-surface p-4 rounded-lg border border-outline-variant mb-6 text-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                <span className="font-semibold text-slate-800">Connection active</span>
              </div>
              <p className="text-xs text-slate-500 ml-8">Workspace: ScalePods Marketing Team</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowExportModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowExportModal(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-black transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">sync</span> Sync Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
