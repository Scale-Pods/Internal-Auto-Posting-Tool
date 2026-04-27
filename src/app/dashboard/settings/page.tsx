"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Settings, User, Shield, Mail, Calendar, Building2, Globe, CheckCircle2 } from "lucide-react";

type AdminProfile = {
  email: string;
  name: string;
  role: string;
  lastSignIn: string;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<AdminProfile>({
    email: "admin@scalepods.co",
    name: "Admin",
    role: "Super Admin",
    lastSignIn: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const u = data.user;
        const raw = u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "Admin";
        setProfile({
          email: u.email || "admin@scalepods.co",
          name: raw.charAt(0).toUpperCase() + raw.slice(1),
          role: "Super Admin",
          lastSignIn: u.last_sign_in_at || "",
        });
      }
      setIsLoading(false);
    });
  }, []);

  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const infoRows = [
    { icon: User,     label: "Display Name", value: profile.name },
    { icon: Mail,     label: "Email Address", value: profile.email },
    { icon: Shield,   label: "Role",          value: profile.role },
    { icon: Calendar, label: "Last Sign In",  value: profile.lastSignIn
        ? new Date(profile.lastSignIn).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "—" },
  ];

  const platformLinks = [
    { icon: Building2, label: "ScalePods Admin",  value: "scalepods.co/admin", href: "https://scalepods.co" },
    { icon: Globe,     label: "Agency Dashboard", value: "localhost:3000/dashboard", href: "/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-6 lg:p-10 space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-h1 text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your admin profile and workspace</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header banner */}
        <div className="h-24 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />

        {/* Avatar + name */}
        <div className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-10 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-300 flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white shrink-0">
              {isLoading ? "…" : initials}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-slate-900">{isLoading ? "Loading…" : profile.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {profile.role}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-0 divide-y divide-slate-50">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{isLoading ? "—" : value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace Links */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-1">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Workspace</h3>
        {platformLinks.map(({ icon: Icon, label, value, href }) => (
          <a
            key={label}
            href={href}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{label}</p>
              <p className="text-[11px] text-slate-400">{value}</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
          </a>
        ))}
      </div>

      {/* Platform Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-5">Platform Workflow</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Content Approval",  desc: "Maker-Checker review gate",        icon: "✍️",  href: "/dashboard/approval" },
            { label: "Design Review",     desc: "Design asset approval",            icon: "🎨",  href: "/dashboard/design-approval" },
            { label: "Publishing",        desc: "Schedule & mark as published",     icon: "📤",  href: "/dashboard/ready-to-post" },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-primary/30 hover:bg-orange-50/50 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{item.label}</p>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Version note */}
      <p className="text-center text-xs text-slate-300 font-medium">ScalePods — Agency OS v1.0 · Admin Panel</p>
    </div>
  );
}
