"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  Palette,
  CheckSquare,
  ShieldCheck,
  Clock,
  CalendarDays,
  Send,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navGroups = [
  {
    section: "MAIN",
    items: [
      { name: "Dashboard",    href: "/dashboard",               icon: LayoutDashboard },
      { name: "Clients",      href: "/dashboard/clients",       icon: Users },
    ],
  },
  {
    section: "CONTENT",
    items: [
      { name: "Designer",         href: "/dashboard/designer",        icon: Palette },
      { name: "Content Approval", href: "/dashboard/approval",        icon: CheckSquare },
      { name: "Design Approval",  href: "/dashboard/design-approval", icon: ShieldCheck },
      { name: "Ongoing Work",     href: "/dashboard/work-status",     icon: Clock },
    ],
  },
  {
    section: "PUBLISHING",
    items: [
      { name: "Calendar Schedule", href: "/dashboard/calendar",       icon: CalendarDays },
      { name: "Ready to Post",     href: "/dashboard/ready-to-post",  icon: Send },
      { name: "Social Analysis",   href: "/dashboard/social-analysis",icon: BarChart3 },
      { name: "Website Blogs",     href: "/dashboard/website-blogs",  icon: Globe },
    ],
  },
];

const SIDEBAR_FULL  = 256; // px  (w-64)
const SIDEBAR_RAIL  = 68;  // px  (icons only)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  // "pinned" = user manually pinned it open; "hovered" = auto-open on hover
  const [pinned,  setPinned]  = useState(true);
  const [hovered, setHovered] = useState(false);

  const [userName,  setUserName]  = useState("Admin");
  const [userEmail, setUserEmail] = useState("admin@scalepods.co");

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserEmail(data.user.email ?? "admin@scalepods.co");
        const raw  = data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0] ?? "Admin";
        setUserName(raw.charAt(0).toUpperCase() + raw.slice(1));
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Sidebar is visually expanded when pinned OR when hovering over it
  const expanded = pinned || hovered;

  const onMouseEnter = () => {
    if (pinned) return;                // already pinned — no-op
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(true);
  };

  const onMouseLeave = () => {
    if (pinned) return;
    // small delay so accidental mouse-leave doesn't flicker
    hoverTimer.current = setTimeout(() => setHovered(false), 150);
  };

  const currentWidth = expanded ? SIDEBAR_FULL : SIDEBAR_RAIL;

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#F8F7F5] flex font-sans text-foreground selection:bg-orange-200">

      {/* ─── Sidebar ─── */}
      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ width: currentWidth }}
        className="fixed left-0 top-0 h-full z-30 bg-background border-r border-border flex flex-col
                   transition-[width] duration-200 ease-in-out overflow-hidden shadow-sm"
      >
        {/* ── Logo row ── */}
        <div className="flex items-center gap-3 px-4 py-[18px] border-b border-border shrink-0">


          {/* Name — fades in when expanded */}
          <span
            className="font-black text-[15px] tracking-tight text-foreground whitespace-nowrap
                       transition-opacity duration-150"
            style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? "auto" : "none" }}
          >
          <div className="bg-primary p-2 rounded-lg flex items-center justify-center shadow-md">
            <img src="/logo-light.png" alt="ScalePods" className="h-6 object-contain" />
          </div>
          </span>

          {/* Pin / Unpin toggle — always accessible, pushed to the right */}
          <button
            onClick={() => {
              setPinned(p => !p);
              if (pinned) setHovered(false); // collapsing: also kill hover
            }}
            title={pinned ? "Collapse sidebar" : "Pin sidebar open"}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center
                       text-muted-foreground hover:text-slate-700 hover:bg-slate-100
                       transition-all shrink-0"
            style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? "auto" : "none" }}
          >
            {pinned
              ? <PanelLeftClose className="w-4 h-4" />
              : <PanelLeftOpen  className="w-4 h-4" />
            }
          </button>
        </div>

        {/* ── Search ── */}
        <div
          className="px-4 py-3 shrink-0 overflow-hidden transition-all duration-200"
          style={{ maxHeight: expanded ? 72 : 0, opacity: expanded ? 1 : 0 }}
        >
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-9 pr-4
                         text-[13px] text-slate-600 placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         transition-all"
            />
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {navGroups.map(group => (
            <div key={group.section}>
              {/* Section label */}
              <div
                className="overflow-hidden transition-all duration-150"
                style={{ maxHeight: expanded ? 40 : 0, opacity: expanded ? 1 : 0 }}
              >
                <p className="px-3 pt-5 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                  {group.section}
                </p>
              </div>
              {!expanded && <div className="mt-3" />}

              {group.items.map(item => {
                const isActive = item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!expanded ? item.name : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold
                      transition-all group relative border-l-4
                      ${isActive
                        ? "bg-[#FFF3E0] text-primary border-primary rounded-l-none"
                        : "text-slate-600 border-transparent hover:bg-slate-50 hover:text-foreground"}
                    `}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 transition-colors
                        ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-slate-600"}`}
                    />

                    {/* Nav label — slides out */}
                    <span
                      className="whitespace-nowrap truncate transition-opacity duration-150"
                      style={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
                    >
                      {item.name}
                    </span>

                    {/* Removed active dot in favor of left border */}

                    {/* Tooltip when rail-only */}
                    {!expanded && (
                      <span className="
                        absolute left-full top-1/2 -translate-y-1/2 ml-3
                        px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold
                        rounded-lg whitespace-nowrap shadow-lg
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity duration-150 z-50
                      ">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Bottom: Settings + User ── */}
        <div className="border-t border-border px-2 py-3 space-y-1 shrink-0">
          {/* Settings */}
          <Link
            href="/dashboard/settings"
            title={!expanded ? "Settings" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold border-l-4 border-transparent
                       text-slate-600 hover:bg-slate-50 hover:text-foreground transition-all group relative"
          >
            <Settings className="w-[18px] h-[18px] text-muted-foreground group-hover:text-slate-600 shrink-0" />
            <span
              className="whitespace-nowrap transition-opacity duration-150"
              style={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
            >
              Settings
            </span>
            {!expanded && (
              <span className="
                absolute left-full top-1/2 -translate-y-1/2 ml-3
                px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold
                rounded-lg whitespace-nowrap shadow-lg
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-opacity duration-150 z-50
              ">
                Settings
              </span>
            )}
          </Link>

          {/* User profile row */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50">
            {/* Avatar — always visible (circular as per design.md) */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-300
                            flex items-center justify-center text-white font-bold text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>

            {/* Name + email */}
            <div
              className="flex-1 min-w-0 overflow-hidden transition-all duration-150"
              style={{ maxWidth: expanded ? 160 : 0, opacity: expanded ? 1 : 0 }}
            >
              <p className="text-[13px] font-bold text-foreground truncate">{userName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-7 h-7 rounded-lg flex items-center justify-center
                         text-muted-foreground hover:bg-red-50 hover:text-red-500
                         transition-colors shrink-0"
              style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? "auto" : "none" }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Invisible hover zone — when rail is collapsed, lets mouse re-enter */}
      {!pinned && (
        <div
          onMouseEnter={onMouseEnter}
          style={{ width: SIDEBAR_RAIL, left: 0 }}
          className="fixed top-0 h-full z-20 pointer-events-none"
          aria-hidden
        />
      )}

      {/* ─── Main content — shifts right to match sidebar width ─── */}
      <main
        style={{ marginLeft: currentWidth }}
        className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-200 ease-in-out"
      >
        {children}
      </main>
    </div>
  );
}
