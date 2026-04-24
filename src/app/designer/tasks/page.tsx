"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DesignerTaskQueuePage() {
  const [viewMode, setViewMode] = useState("list");

  return (
    <div className="bg-surface min-h-screen font-body-base text-on-surface flex">
      {/* Sidebar Navigation */}
      <aside className="w-[240px] h-screen fixed left-0 top-0 border-r border-slate-200 bg-white flex flex-col py-6 z-50">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight font-h1 leading-none">FlowPilot AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">DesignOps Engine</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm">
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#FFF3E0] text-[#FF5722] border-l-4 border-[#FF5722] font-semibold text-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span> Tasks
          </div>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm">
            <span className="material-symbols-outlined">library_books</span> Library
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm">
            <span className="material-symbols-outlined">auto_awesome</span> Automation
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm">
            <span className="material-symbols-outlined">insights</span> Analytics
          </Link>
        </nav>
        <div className="mt-auto px-4 space-y-1 pt-6 border-t border-slate-100">
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm">
            <span className="material-symbols-outlined">settings</span> Settings
          </Link>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-[12px] font-bold text-slate-800 mb-2">Campaign Limit</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full w-[75%]"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">15/20 Active Campaigns</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[240px] flex-1 flex flex-col min-h-screen">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-600">Tasks</span>
            </nav>
            <h2 className="font-h2 text-xl text-slate-900">Design Tasks</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-primary-container" : "text-slate-500 hover:text-slate-700"}`}
              >
                <span className="material-symbols-outlined text-sm">format_list_bulleted</span> List
              </button>
              <button 
                onClick={() => setViewMode("board")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === "board" ? "bg-white shadow-sm text-primary-container" : "text-slate-500 hover:text-slate-700"}`}
              >
                <span className="material-symbols-outlined text-sm">grid_view</span> Board
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container border-2 border-white rounded-full"></span>
              </button>
              <button className="bg-primary-container text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[20px]">add</span> New Task
              </button>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <section className="bg-white border-b border-slate-200 px-8 py-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm font-medium text-slate-600 hover:border-primary-container/30 transition-colors">
              Status <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm font-medium text-slate-600 hover:border-primary-container/30 transition-colors">
              Client <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm font-medium text-slate-600 hover:border-primary-container/30 transition-colors">
              Due Date <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </button>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Priority:</span>
              <button className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider border border-red-100 hover:bg-red-100 transition-colors">High</button>
              <button className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold uppercase tracking-wider border border-amber-100 hover:bg-amber-100 transition-colors">Medium</button>
              <button className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider border border-blue-100 hover:bg-blue-100 transition-colors">Low</button>
            </div>
            <div className="ml-auto relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm w-[280px] focus:ring-2 focus:ring-primary-container/20 focus:outline-none transition-all"
              />
            </div>
          </div>
          {/* Active Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Active Filters:</span>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-fixed/20 text-primary-container text-xs font-semibold rounded-md border border-primary-container/20">
                Status: In Progress <button className="material-symbols-outlined text-[14px]">close</button>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-fixed/20 text-primary-container text-xs font-semibold rounded-md border border-primary-container/20">
                Priority: High <button className="material-symbols-outlined text-[14px]">close</button>
              </span>
              <button className="text-xs font-bold text-primary hover:underline ml-2">Clear All</button>
            </div>
          </div>
        </section>

        {/* Task List */}
        <section className="p-8 flex-1 w-full max-w-7xl mx-auto">
          {/* Bulk Action Bar */}
          <div className="mb-6 flex items-center justify-between bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-6 h-6 bg-primary-container rounded-full text-[12px] font-bold">1</span>
              <span className="text-sm font-medium">Task selected</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">drive_file_move</span> Move
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">edit</span> Change Priority
              </button>
              <div className="w-px h-4 bg-white/20 mx-2"></div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">delete</span> Delete
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Task Card 1 */}
            <div className="bg-white rounded-xl shadow-soft border border-outline-variant/30 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden group">
              <div className="flex p-6">
                <div className="pt-1 pr-4">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-primary-container focus:ring-primary-container cursor-pointer" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-slate-500 border border-outline-variant">
                        <span className="material-symbols-outlined">image</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-base">Q4 Product Launch - Instagram Carousel</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded border border-red-100">High</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[12px] text-slate-500 font-medium">
                            <span className="material-symbols-outlined text-[14px]">person</span> Lumina Tech
                          </span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="flex items-center gap-1 text-[12px] text-red-500 font-bold">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> Due Today, 5:00 PM
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> In Progress
                      </span>
                      <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary-container text-[18px]">photo_camera</span>
                      <span className="text-xs font-bold text-slate-600 uppercase">Content Preview</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      "Ready to revolutionize your workspace? The new Lumina X1 is here to redefine productivity with AI-driven task management..."
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container px-6 py-3 flex items-center justify-between border-t border-outline-variant">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div className="w-7 h-7 rounded-full bg-slate-400 border-2 border-white"></div>
                  <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+3</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-1.5 text-slate-600 text-sm font-semibold hover:bg-white rounded-lg transition-colors border border-transparent hover:border-outline-variant">View Details</button>
                  <Link href="/designer/workspace" className="px-4 py-1.5 bg-primary-container text-white text-sm font-bold rounded-lg hover:bg-primary transition-colors shadow-sm">Continue Design</Link>
                </div>
              </div>
            </div>

          </div>

          {/* Pagination */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">Showing <span className="text-slate-800 font-bold">1-1</span> of <span class="text-slate-800 font-bold">12</span> tasks</p>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-container text-white font-bold text-sm shadow-sm">1</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
