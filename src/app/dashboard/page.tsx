"use client";

import React from "react";
import Link from "next/link";
import { 
  Bell, Calendar, ChevronDown, Users, Mail, Target, Bot, 
  ArrowUpRight, ArrowDownRight, UserPlus
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
        <div className="text-sm font-medium text-slate-400">
          Pages <span className="mx-2">&gt;</span> <span className="text-primary-container font-bold">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          {/* New Onboarding Button */}
          <Link href="/onboarding" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Client Info
          </Link>

          <button className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white font-bold text-sm rounded-lg hover:bg-primary transition-colors shadow-sm shadow-primary-container/30">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Summary
          </button>
          
          <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-200 shadow-sm flex items-center justify-center text-white">
            <img src="https://ui-avatars.com/api/?name=John+Doe&background=1e293b&color=fff" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Title & Date Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-h1 font-black text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500 font-medium">A quick look at how your marketing is performing today.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          Today
          <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Total Leads */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center text-primary-container">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded font-bold text-xs">
              <ArrowUpRight className="w-3 h-3" /> 8.4%
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL LEADS</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1">12,480</h3>
            <p className="text-sm font-medium text-slate-400">vs. last 24 hours</p>
          </div>
        </div>

        {/* Card 2: Email Open Rate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center text-primary-container">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded font-bold text-xs">
              <ArrowUpRight className="w-3 h-3" /> 3.1%
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">EMAIL OPEN RATE</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1">42.2%</h3>
            <p className="text-sm font-medium text-slate-400">Global benchmark: 38%</p>
          </div>
        </div>

        {/* Card 3: Conversion Rate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center text-primary-container">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded font-bold text-xs">
              <ArrowDownRight className="w-3 h-3" /> 0.4%
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">CONVERSION RATE</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1">7.9%</h3>
            <p className="text-sm font-medium text-slate-400">Target goal: 10%</p>
          </div>
        </div>

        {/* Card 4: Active Automations */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center text-primary-container">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-xs">
              Stable
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">ACTIVE AUTOMATIONS</p>
            <h3 className="text-3xl font-black text-slate-900 mb-1">14</h3>
            <p className="text-sm font-medium text-slate-400">All systems healthy</p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
        {/* Bar Chart: Top Performing Channels */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Top Performing Channels</h3>
              <p className="text-slate-500 font-medium text-sm">Revenue attribution by lead source</p>
            </div>
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold text-xs">
              <ArrowUpRight className="w-3 h-3" /> +12% this week
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 lg:gap-6 pt-4 mt-auto">
            {[
              { label: "SOCIAL", height: "45%" },
              { label: "DIRECT", height: "70%" },
              { label: "PAID", height: "35%" },
              { label: "EMAIL", height: "85%" },
              { label: "REFERRAL", height: "25%" },
            ].map((col, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div className="w-full max-w-[80px] h-[200px] bg-slate-50 rounded-t-sm relative flex items-end">
                  <div 
                    className="w-full bg-primary-container rounded-t-sm transition-all duration-500 group-hover:bg-primary"
                    style={{ height: col.height }}
                  ></div>
                </div>
                <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase">{col.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart: Audience Growth */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 mb-1">Audience Growth</h3>
            <p className="text-slate-500 font-medium text-sm">New subscribers by segment</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* CSS Donut Chart Mock */}
            <div className="relative w-48 h-48 rounded-full mb-8" style={{ background: "conic-gradient(#FF6B35 0% 45%, #FFA781 45% 70%, #FFE1D3 70% 90%, #F1F5F9 90% 100%)" }}>
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <h2 className="text-3xl font-black text-slate-900">245</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GROWTH</p>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-container"></div>
                  <span className="text-sm font-semibold text-slate-600">Enterprise</span>
                </div>
                <span className="font-bold text-slate-900">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FFA781" }}></div>
                  <span className="text-sm font-semibold text-slate-600">SMB</span>
                </div>
                <span className="font-bold text-slate-900">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FFE1D3" }}></div>
                  <span className="text-sm font-semibold text-slate-600">Startups</span>
                </div>
                <span className="font-bold text-slate-900">20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pr-2">
        <Link href="/analytics" className="text-sm font-bold text-primary-container flex items-center gap-1 hover:underline">
          View Detailed Analytics <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

    </div>
  );
}
