"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState("instagram");

  return (
    <div className="bg-surface min-h-screen font-body-base text-on-surface flex">
      {/* Side Navigation Shell */}
      <aside className="w-[240px] h-screen fixed left-0 top-0 border-r border-slate-100 bg-white flex flex-col z-50">
        <div className="p-6">
          <span className="text-2xl font-black text-primary-container tracking-tighter">
            AutoMarketer
          </span>
          <div className="mt-1 text-xs text-slate-400 font-medium">Enterprise Plan</div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 text-slate-500 px-4 py-3 hover:text-slate-900 transition-all rounded-lg">
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 bg-[#FFF3E0] text-primary-container border-l-4 border-primary-container px-4 py-3 rounded-r-lg font-medium">
            <span className="material-symbols-outlined">campaign</span> Campaigns
          </Link>
          <Link href="#" className="flex items-center gap-3 text-slate-500 px-4 py-3 hover:text-slate-900 transition-all rounded-lg">
            <span className="material-symbols-outlined">library_books</span> Content Library
          </Link>
          <Link href="#" className="flex items-center gap-3 text-slate-500 px-4 py-3 hover:text-slate-900 transition-all rounded-lg">
            <span className="material-symbols-outlined">monitoring</span> Analytics
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[240px] flex-1 flex flex-col min-h-screen">
        {/* Top AppBar */}
        <header className="flex justify-between items-center px-8 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary-container">Approval Queue</span>
            </nav>
            <h1 className="text-lg font-bold text-slate-900">Content Approval</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">John Doe</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Senior Reviewer</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Workflow Stepper */}
          <div className="mb-10 bg-white p-6 rounded-xl shadow-soft flex items-center justify-between border border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 border-2 border-green-200">
                <span className="material-symbols-outlined">check</span>
              </div>
              <div>
                <div className="text-sm font-bold text-green-700">Maker: Created</div>
                <div className="text-[11px] text-slate-400">Sarah Johnson • May 2, 2026</div>
              </div>
            </div>
            <div className="flex-1 h-px bg-slate-100 mx-6 relative">
              <div className="absolute inset-0 bg-primary-container w-1/2"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container border-2 border-primary-container">
                <span className="material-symbols-outlined">pending</span>
              </div>
              <div>
                <div className="text-sm font-bold text-primary-container">Checker: Pending Review</div>
                <div className="text-[11px] text-slate-400">Awaiting your approval</div>
              </div>
            </div>
            <div className="flex-1 h-px bg-slate-100 mx-6"></div>
            <div className="flex items-center gap-4 opacity-40">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border-2 border-slate-200">
                <span className="material-symbols-outlined">rocket_launch</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-600">Published</div>
                <div className="text-[11px] text-slate-400">End goal</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel: Preview (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-outline-variant/30">
                {/* Platform Tabs */}
                <div className="flex border-b border-slate-100">
                  <button
                    onClick={() => setActiveTab("instagram")}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      activeTab === "instagram" ? "text-primary-container border-b-2 border-primary-container bg-primary-container/5" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">photo_camera</span> Instagram
                  </button>
                  <button
                    onClick={() => setActiveTab("linkedin")}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      activeTab === "linkedin" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">business_center</span> LinkedIn
                  </button>
                </div>

                <div className="p-8 bg-surface-container-lowest flex justify-center min-h-[500px]">
                  {/* Phone Mockup Wrapper */}
                  <div className="w-[320px] bg-white rounded-[3rem] p-3 shadow-2xl border-[8px] border-slate-900 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-10"></div>
                    <div className="bg-white rounded-[2.2rem] h-full overflow-hidden border border-slate-100 flex flex-col">
                      <div className="px-3 pt-6 pb-3 flex items-center justify-between border-b border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                            <div className="w-full h-full rounded-full border-2 border-white bg-slate-200"></div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold">flowpilot_ai</p>
                            <p className="text-[8px] text-slate-500">Sponsored</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                      </div>
                      <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-400">
                        [Image Placeholder]
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="material-symbols-outlined text-[20px]">favorite</span>
                          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                          <span className="material-symbols-outlined text-[20px]">send</span>
                        </div>
                        <p className="text-[10px] leading-tight line-clamp-3">
                          <span className="font-bold">flowpilot_ai</span> Automate your marketing workflows with our new AI designer tool. 🚀
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Controls & Feedback */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-soft border border-outline-variant/30">
                <h3 className="font-h2 text-lg mb-4">Review Action</h3>
                <div className="space-y-4">
                  <button className="w-full py-3 bg-green-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-md">
                    <span className="material-symbols-outlined">check_circle</span> Approve & Schedule
                  </button>
                  <button className="w-full py-3 bg-white border border-outline-variant text-slate-700 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="material-symbols-outlined text-primary-container">edit</span> Request Revisions
                  </button>
                  <button className="w-full py-3 bg-white border border-error-container text-error rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-error-container/20 transition-colors">
                    <span className="material-symbols-outlined">cancel</span> Reject Content
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-soft border border-outline-variant/30">
                <h3 className="font-h2 text-lg mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">comment</span>
                  Feedback
                </h3>
                <textarea 
                  className="w-full h-32 p-3 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary-container/20 focus:outline-none transition-all"
                  placeholder="Leave comments for the Maker or Designer..."
                ></textarea>
                <button className="mt-3 w-full py-2 bg-surface-container-highest text-slate-700 font-semibold rounded-lg hover:bg-surface-variant transition-colors text-sm">
                  Add Comment
                </button>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-h2 text-lg mb-2">AI Analysis</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                    <div>
                      <p className="text-sm font-bold">Tone Match</p>
                      <p className="text-xs text-slate-400">95% match with "Professional & Bold" guidelines.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-yellow-400 text-sm mt-0.5">warning</span>
                    <div>
                      <p className="text-sm font-bold">Image Density</p>
                      <p className="text-xs text-slate-400">Text in image exceeds 20% limit for optimal reach.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
