"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";
import { 
  Rocket, Search, LayoutDashboard, Megaphone, 
  Workflow, Users, BarChart2, FileText, Settings 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("John Doe");
  const [userRole, setUserRole] = useState("Admin");

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUserName(u.name || "John Doe");
      setUserRole(u.role || "Admin");
    }
  }, []);

  const navItems = [
    { section: "GENERAL" },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Campaign", href: "/campaigns", icon: Megaphone },
    { name: "Workflow", href: "/workflows", icon: Workflow },
    { section: "DRIVE_AUDI" },
    { name: "Audience", href: "/audience", icon: Users },
    { section: "ANALYTICS" },
    { name: "Insights", href: "/insights", icon: BarChart2 },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#FCFDFD] flex font-body-base text-slate-900 selection:bg-primary-container selection:text-white">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
          </div>
          <span className="font-h1 font-black text-xl tracking-tight">FlowPilot AI</span>
        </div>

        {/* Search */}
        <div className="px-6 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={i} className="px-2 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {item.section}
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon!;

            return (
              <Link 
                key={i} 
                href={item.href!}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-[#FFF5F0] text-primary-container border-l-4 border-primary-container" 
                    : "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary-container" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Settings */}
        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
               {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate">{userName}</h4>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{userRole}</p>
            </div>
          </div>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all border-l-4 border-transparent">
            <Settings className="w-5 h-5 text-slate-400" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        {children}
      </main>
    </div>
  );
}
