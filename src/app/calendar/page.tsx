"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CalendarPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-background font-body-base text-on-background min-h-screen flex">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-screen w-60 border-r border-slate-200 bg-white z-50 flex flex-col py-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">FlowPilot AI</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Enterprise Plan</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className="text-slate-500 flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-h2 text-[14px]">Dashboard</span>
          </Link>
          <div className="bg-primary-container/10 text-primary-container border-l-4 border-primary-container font-semibold flex items-center gap-3 px-6 py-3 transition-colors">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span className="font-h2 text-[14px]">Calendar</span>
          </div>
          <Link href="#" className="text-slate-500 flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">auto_fix</span>
            <span className="font-h2 text-[14px]">Automations</span>
          </Link>
          <Link href="#" className="text-slate-500 flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">group</span>
            <span className="font-h2 text-[14px]">Audiences</span>
          </Link>
          <Link href="/analytics" className="text-slate-500 flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
            <span className="font-h2 text-[14px]">Reports</span>
          </Link>
        </nav>
        <div className="px-6 mt-auto space-y-4">
          <button className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
            Upgrade Plan
          </button>
          <div className="pt-4 border-t border-slate-100">
            <Link href="#" className="text-slate-500 flex items-center gap-3 py-2 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="text-[14px] font-semibold">Help Center</span>
            </Link>
            <Link href="#" className="text-slate-500 flex items-center gap-3 py-2 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-[14px] font-semibold">Log Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-8">
            <span className="text-lg font-black tracking-tight text-slate-900">MarketFlow</span>
            <nav className="flex items-center gap-6">
              <Link href="/analytics" className="text-slate-500 hover:text-slate-900 font-semibold text-sm">Analytics</Link>
              <span className="text-primary-container border-b-2 border-primary-container pb-1 font-semibold text-sm">Campaigns</span>
              <Link href="#" className="text-slate-500 hover:text-slate-900 font-semibold text-sm">Assets</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              Schedule Post
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">JD</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {/* Calendar Header Tools */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-h1 text-3xl font-bold text-slate-900 mb-1">April 2026</h1>
              <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                14 Scheduled posts this month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
                <button className="px-4 py-1.5 text-sm font-bold bg-slate-100 text-slate-900 rounded-lg">Month</button>
                <button className="px-4 py-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Week</button>
                <button className="px-4 py-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Day</button>
                <button className="px-4 py-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">List</button>
              </div>
              <button className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filters
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="py-3 px-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
              ))}
            </div>

            {/* Days Grid - simplified for component */}
            <div className="grid grid-cols-7 auto-rows-[minmax(140px,1fr)]">
              {/* Empty slots */}
              <div className="border-r border-b border-slate-100 bg-slate-50/30 p-2"></div>
              <div className="border-r border-b border-slate-100 bg-slate-50/30 p-2"></div>
              
              {/* Day 1 */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer">
                <span className="text-sm font-bold text-slate-400">1</span>
              </div>
              
              {/* Day 2 */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors">
                <span className="text-sm font-bold text-slate-400">2</span>
                <div className="mt-2 bg-white rounded-lg border border-slate-200 shadow-sm p-2 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Posted</span>
                    <span className="material-symbols-outlined text-slate-300 text-[16px]">share</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 line-clamp-1">AI Trends 2026 Intro</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex -space-x-1">
                      <span className="material-symbols-outlined text-blue-600 text-[14px]">business_center</span>
                      <span className="material-symbols-outlined text-pink-600 text-[14px]">photo_camera</span>
                    </div>
                    <span className="text-[9px] font-medium text-slate-400">09:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Day 3, 4, 5 */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-400">3</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-400">4</span></div>
              <div className="border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-400">5</span></div>

              {/* Day 6 */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors">
                <span className="text-sm font-bold text-slate-900">6</span>
                <div className="mt-2 bg-white rounded-lg border-l-4 border-l-primary-container border-y border-r border-slate-200 shadow-sm p-2 cursor-grab hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-primary-fixed/30 text-primary-container text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Scheduled</span>
                  </div>
                  <div className="w-full h-12 bg-slate-100 rounded mb-2 flex items-center justify-center text-slate-400 border border-slate-200 text-[10px]">[Image]</div>
                  <p className="text-[10px] font-bold text-slate-700 line-clamp-1">Automation 101 Guide</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="material-symbols-outlined text-pink-600 text-[14px]">photo_camera</span>
                    <span className="text-[9px] font-medium text-slate-400">02:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Day 7, 8 */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">7</span></div>
              <div className="border-r border-b border-slate-100 p-3 bg-surface-container-low">
                <span className="text-sm font-bold text-slate-900">8</span>
                <div className="mt-2 bg-white rounded-lg border border-red-200 shadow-sm p-2 cursor-grab hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Failed</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 line-clamp-1">Webinar Recap Video</p>
                  <span className="text-[9px] font-medium text-red-500 mt-1 block">API Error: Invalid Token</span>
                </div>
              </div>

              {/* Day 9, 10, 11, 12 */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">9</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">10</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">11</span></div>
              <div className="border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-400">12</span></div>

              {/* Remaining placeholders */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">13</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">14</span></div>
              
              {/* Day 15 (Active/Today) */}
              <div className="border-r border-b border-slate-100 p-3 ring-2 ring-primary-container ring-inset rounded-lg z-10 bg-primary-container/5">
                <span className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center text-sm font-bold">15</span>
                <div className="mt-2 bg-white rounded-lg border-l-4 border-l-primary-container border-y border-r border-slate-200 shadow-sm p-2 cursor-grab hover:-translate-y-0.5 transition-transform">
                  <p className="text-[10px] font-bold text-slate-700">5 Ways to Automate...</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="material-symbols-outlined text-blue-800 text-[14px]">language</span>
                    <span className="text-[9px] font-medium text-slate-400">11:15 AM</span>
                  </div>
                </div>
              </div>

              {/* More placeholders */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">16</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">17</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">18</span></div>
              <div className="border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-400">19</span></div>

              {/* Week 4 */}
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">20</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">21</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">22</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">23</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">24</span></div>
              <div className="border-r border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-900">25</span></div>
              <div className="border-b border-slate-100 p-3 hover:bg-surface transition-colors cursor-pointer"><span className="text-sm font-bold text-slate-400">26</span></div>
            </div>
          </div>
        </main>
      </div>

      {/* Schedule Post Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-h2 text-xl text-slate-900 font-bold">Schedule New Post</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Stepper */}
            <div className="flex items-center px-8 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-container text-white text-[10px] flex items-center justify-center font-bold">1</div>
                <span className="text-sm font-bold text-slate-900">Content</span>
              </div>
              <div className="h-px w-8 bg-slate-300 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold">2</div>
                <span className="text-sm font-semibold text-slate-500">Scheduling</span>
              </div>
              <div className="h-px w-8 bg-slate-300 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold">3</div>
                <span className="text-sm font-semibold text-slate-500">Platforms</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">Select Approved Content</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button className="flex items-start gap-4 p-4 rounded-xl border-2 border-primary-container bg-primary-fixed/10 text-left transition-all">
                      <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">5 ways to automate your content flow</h4>
                        <p className="text-sm text-slate-600 mt-1">Generated by FlowPilot AI • Approved by Sarah</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-white border border-primary-container/20 rounded-md text-[10px] font-bold text-primary-container uppercase">Article</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </button>
                    <button className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-left transition-all">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-bold text-slate-700">Weekly ROI Performance Report</h4>
                        <p className="text-sm text-slate-500 mt-1">Ready for review • Drafted 2h ago</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-container">lightbulb</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">AI Recommended Posting Time</p>
                      <p className="text-xs text-slate-600 font-medium">Based on your Instagram audience activity</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary-container">Tomorrow, 10:45 AM</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 transition-colors">Save as Draft</button>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowModal(false)} className="text-sm font-bold text-slate-700 px-6 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors">Cancel</button>
                <button className="text-sm font-bold text-white px-8 py-2.5 rounded-lg bg-primary-container shadow-md hover:bg-primary transition-all">Next Step</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Visual (Floating context) */}
      <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined">drag_indicator</span>
        </div>
        <div>
          <p className="text-sm font-bold">New: Drag &amp; Drop</p>
          <p className="text-[11px] text-slate-400">Rearrange your calendar by dragging cards</p>
        </div>
        <button className="text-white/40 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
