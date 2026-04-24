"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState("Apr 1 - Apr 30, 2026");

  return (
    <div className="bg-surface font-body-base text-on-surface min-h-screen flex">
      {/* SideNavBar Component */}
      <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-slate-100 bg-white z-50 flex flex-col py-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-h2">FlowPilot AI</h2>
            <p className="text-xs text-slate-500 font-body-sm font-medium">Marketing Velocity</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-all duration-200 group rounded-lg font-medium">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary-container">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-all duration-200 group rounded-lg font-medium">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary-container">auto_awesome</span>
            <span>Automations</span>
          </Link>
          {/* Active State */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-container/10 text-primary-container border-l-4 border-primary-container transition-all duration-200 font-bold rounded-r-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            <span>Analytics</span>
          </div>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-all duration-200 group rounded-lg font-medium">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary-container">groups</span>
            <span>Audience</span>
          </Link>
          <Link href="/calendar" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-all duration-200 group rounded-lg font-medium">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary-container">calendar_month</span>
            <span>Calendar</span>
          </Link>
        </nav>
        <div className="px-4 mt-auto space-y-1">
          <button className="w-full mb-6 bg-primary-container text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary transition-all">
            <span className="material-symbols-outlined text-lg">add</span>
            New Workflow
          </button>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-all duration-200 group rounded-lg">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary-container">settings</span>
            <span className="font-semibold text-sm">Settings</span>
          </Link>
        </div>
      </aside>

      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">
        {/* TopNavBar Component */}
        <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-8 shadow-sm">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-h1">Marketing Analytics</h1>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
              <span className="text-sm font-bold text-slate-600">{dateRange}</span>
              <span className="text-xs text-slate-400 font-medium ml-2">vs Prev Month</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <select className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 cursor-pointer">
                <option>All Platforms</option>
                <option>Instagram</option>
                <option>LinkedIn</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-bold text-sm shadow-sm">
                <span className="material-symbols-outlined text-sm">download</span> Export
              </button>
              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-slate-100 shadow-sm flex items-center justify-center font-bold text-xs text-slate-600">
                JD
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Impressions", value: "124,830", icon: "visibility", trend: "+18.4%" },
              { title: "Total Reach", value: "89,420", icon: "group", trend: "+12.3%" },
              { title: "Engagement Rate", value: "7.2%", icon: "touch_app", trend: "+0.8%" },
              { title: "Follower Growth", value: "+1,245", icon: "person_add", trend: "+8.5%" }
            ].map((metric, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-soft border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined">{metric.icon}</span>
                  </div>
                  <div className="text-green-600 text-sm font-bold flex items-center bg-green-50 px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    {metric.trend}
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-bold mb-1">{metric.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 font-h2 mb-4">{metric.value}</h3>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Dashboard Area */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Impressions Over Time Chart (Bento Left) */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-soft border border-outline-variant/30 p-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-h2">Impressions Over Time</h3>
                  <p className="text-sm text-slate-500 font-medium">Tracking daily reach across all platforms</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 text-xs font-bold bg-primary-container text-white rounded-lg shadow-sm">Daily</button>
                  <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Weekly</button>
                </div>
              </div>
              
              {/* Mock Chart Visualization */}
              <div className="relative h-64 w-full flex items-end justify-between gap-3">
                <div className="absolute inset-0 grid grid-rows-4 w-full">
                  <div className="border-t border-slate-100 border-dashed"></div>
                  <div className="border-t border-slate-100 border-dashed"></div>
                  <div className="border-t border-slate-100 border-dashed"></div>
                  <div className="border-t border-slate-100 border-dashed"></div>
                </div>
                
                {[30, 45, 60, 40, 70, 85, 65, 100, 75, 50, 65, 45].map((height, i) => (
                  <div key={i} className={`relative flex-1 rounded-t-lg transition-all hover:opacity-80 ${height === 100 ? 'bg-primary-container' : height > 60 ? 'bg-primary-fixed' : 'bg-slate-200'}`} style={{ height: `${height}%` }}>
                    {height === 100 && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded shadow-xl font-bold whitespace-nowrap">Peak</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs text-slate-400 font-bold">
                <span>Apr 1</span>
                <span>Apr 8</span>
                <span>Apr 15</span>
                <span>Apr 22</span>
                <span>Apr 30</span>
              </div>
            </div>

            {/* Top Performing Content (Bento Right) */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-soft border border-outline-variant/30 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 font-h2 mb-6">Top Performing Content</h3>
              <div className="space-y-4 flex-1">
                {[
                  { title: "Q2 Growth Strategies", platform: "Instagram", stat: "14.2k likes", trend: "+12%" },
                  { title: "Data Flow Explainer", platform: "LinkedIn", stat: "8.9k shares", trend: "+5%" },
                  { title: "Productivity Hacks", platform: "Website", stat: "4.5k views", trend: "-2%", neg: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-14 h-14 rounded-lg bg-slate-200 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{item.platform} • {item.stat}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${item.neg ? 'text-error' : 'text-green-600'}`}>{item.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                View All Content
              </button>
            </div>

            {/* Engagement Table */}
            <div className="col-span-12 bg-white rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-surface/50">
                <h3 className="text-lg font-bold text-slate-900 font-h2">Recent Post Performance</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-full uppercase tracking-wider">Filter: High Engagement</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/80">
                    <tr className="text-left border-b border-slate-200">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Post Title</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Impressions</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Engagement</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { title: "Designing for SaaS Velocity", platform: "LinkedIn", imp: "18,245", eng: "1,402", date: "Apr 28, 2026", color: "blue" },
                      { title: "Automation Workflows 101", platform: "Instagram", imp: "32,910", eng: "4,120", date: "Apr 26, 2026", color: "pink" },
                      { title: "Why Data-Driven?", platform: "Website", imp: "12,400", eng: "890", date: "Apr 24, 2026", color: "orange" }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 bg-${row.color}-50 text-${row.color}-600 border border-${row.color}-100 text-[10px] font-bold rounded-md uppercase`}>{row.platform}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right font-medium">{row.imp}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{row.eng}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
