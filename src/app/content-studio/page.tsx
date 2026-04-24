"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContentStudioPage() {
  const [platform, setPlatform] = useState("instagram");
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="bg-surface text-on-surface overflow-hidden min-h-screen relative font-body-base">
      {/* Background Content (Blurred out) */}
      <div className={`fixed inset-0 z-0 flex transition-all duration-500 ${showModal ? "blur-sm opacity-40 pointer-events-none" : ""}`}>
        <aside className="fixed left-0 top-0 h-screen w-60 border-r border-slate-100 bg-white flex flex-col py-6">
          <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
            </div>
            <span className="text-lg font-bold text-slate-900 font-h2">MarketingOS</span>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 bg-primary-container/10 text-primary-container border-l-4 border-primary-container font-medium text-sm rounded-r-lg">
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </div>
          </nav>
        </aside>
        <main className="ml-60 flex-1 p-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
            <div className="h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
            <div className="h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
          </div>
          <div className="h-[600px] bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
            {!showModal && (
              <button 
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-primary-container text-white rounded-lg font-bold shadow-md hover:bg-primary transition-colors"
              >
                Open Content Studio
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[1000px] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-5 border-b border-outline-variant bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                </div>
                <div>
                  <h1 className="font-h2 text-xl text-on-surface">Create New Content</h1>
                  <p className="font-label-caps text-secondary uppercase">Campaign: Summer Launch 2026</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-secondary">close</span>
              </button>
            </header>

            {/* Content Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column (Form) */}
              <div className="w-1/2 overflow-y-auto p-8 bg-surface-container-lowest custom-scrollbar">
                <div className="space-y-8">
                  
                  {/* Content Type & AI Toggle */}
                  <div className="flex items-center justify-between bg-primary-container/5 p-4 rounded-xl border border-primary-container/10">
                    <div className="flex-1 pr-4">
                      <label className="font-label-caps text-secondary block mb-1">CONTENT TYPE</label>
                      <select className="w-full bg-transparent font-medium text-on-surface border-none focus:ring-0 appearance-none py-0 cursor-pointer">
                        <option>Social Media Post</option>
                        <option>Blog Article</option>
                        <option>Email Newsletter</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
                      <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
                      <div className="w-10 h-5 bg-primary-container rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Target Platform */}
                  <section>
                    <label className="font-label-caps text-secondary block mb-3">TARGET PLATFORM</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => setPlatform("instagram")}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${platform === 'instagram' ? 'border-primary-container bg-primary-container/5' : 'border-outline-variant bg-white hover:border-primary-container/50'}`}
                      >
                        <span className="material-symbols-outlined">photo_camera</span>
                        <span className="text-sm font-semibold">Instagram</span>
                      </button>
                      <button 
                        onClick={() => setPlatform("linkedin")}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${platform === 'linkedin' ? 'border-blue-600 bg-blue-50' : 'border-outline-variant bg-white hover:border-blue-500/50'}`}
                      >
                        <span className="material-symbols-outlined">business_center</span>
                        <span className="text-sm font-semibold">LinkedIn</span>
                      </button>
                      <button 
                        onClick={() => setPlatform("website")}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${platform === 'website' ? 'border-green-600 bg-green-50' : 'border-outline-variant bg-white hover:border-green-500/50'}`}
                      >
                        <span className="material-symbols-outlined">language</span>
                        <span className="text-sm font-semibold">Website</span>
                      </button>
                    </div>
                  </section>

                  {/* Context & Generate */}
                  <section>
                    <label className="font-label-caps text-secondary block mb-3">CONTEXT & REFERENCES</label>
                    <textarea 
                      className="w-full bg-white border border-outline-variant rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all" 
                      placeholder="Paste links, keywords, or creative direction..." 
                      rows={3}
                    ></textarea>
                    <button className="mt-3 w-full bg-primary-container text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary transition-all">
                      <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                      Generate Draft with AI
                    </button>
                  </section>

                  {/* Caption Editor */}
                  <section>
                    <div className="flex justify-between items-end mb-3">
                      <label className="font-label-caps text-secondary">CAPTION CONTENT</label>
                      <span className="text-[11px] font-medium text-secondary bg-slate-100 px-2 py-0.5 rounded">450 / 2200</span>
                    </div>
                    <div className="border border-outline-variant rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-container/20 focus-within:border-primary-container transition-all">
                      <div className="flex items-center gap-1 p-2 bg-surface-container-low border-b border-outline-variant">
                        <button className="p-1.5 hover:bg-white rounded transition-colors"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                        <button className="p-1.5 hover:bg-white rounded transition-colors"><span class="material-symbols-outlined text-[18px]">format_italic</span></button>
                        <button className="p-1.5 hover:bg-white rounded transition-colors"><span class="material-symbols-outlined text-[18px]">list</span></button>
                      </div>
                      <textarea className="w-full p-4 text-sm border-none focus:ring-0 resize-none outline-none" rows={5} defaultValue="✨ Exciting news! Our new AI features are finally here. Simplify your marketing workflow today. 🚀\n\nLink in bio!" />
                    </div>
                  </section>

                </div>
              </div>

              {/* Right Column (Live Preview) */}
              <div className="w-1/2 bg-slate-50 border-l border-outline-variant flex flex-col">
                <div className="p-6 border-b border-outline-variant bg-white flex items-center justify-center gap-6">
                  <span className={`font-bold text-sm pb-2 border-b-2 ${platform === 'instagram' ? 'text-primary-container border-primary-container' : 'text-slate-400 border-transparent'}`}>Instagram</span>
                  <span className={`font-bold text-sm pb-2 border-b-2 ${platform === 'linkedin' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent'}`}>LinkedIn</span>
                  <span className={`font-bold text-sm pb-2 border-b-2 ${platform === 'website' ? 'text-green-600 border-green-600' : 'text-slate-400 border-transparent'}`}>Website</span>
                </div>
                
                <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-y-auto">
                  {/* Mockup Frame */}
                  <div className="w-72 aspect-[9/19] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-xl z-20"></div>
                    
                    <div className="flex-1 flex flex-col bg-white">
                      <div className="p-3 flex items-center gap-2 mt-6">
                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold">flowpilot_ai</p>
                          <p className="text-[8px] text-slate-500">Sponsored</p>
                        </div>
                      </div>
                      <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-400">
                        [Image Preview]
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-3 mb-2 text-slate-700">
                          <span className="material-symbols-outlined text-[20px]">favorite</span>
                          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                          <span className="material-symbols-outlined text-[20px]">send</span>
                        </div>
                        <p className="text-[10px] leading-tight">
                          <span className="font-bold">flowpilot_ai</span> ✨ Exciting news! Our new AI features are finally here...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="px-8 py-5 border-t border-outline-variant bg-white flex items-center justify-between z-10">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl border border-outline-variant text-secondary font-semibold hover:bg-slate-50 transition-all text-sm">
                Save as Draft
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl text-secondary font-semibold hover:bg-slate-50 transition-all text-sm">
                  Cancel
                </button>
                <Link href="/approval" className="bg-primary-container text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-primary transition-all text-sm">
                  <span className="material-symbols-outlined text-sm">how_to_reg</span>
                  Submit for Approval
                </Link>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
