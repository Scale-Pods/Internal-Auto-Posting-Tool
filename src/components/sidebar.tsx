"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";
import { useState, useEffect } from "react";

// --- Navigation items per role ---
const USER_NAV = [
  { href: "/",           icon: "dashboard",   label: "Dashboard" },
  { href: "/clients",    icon: "groups",      label: "Clients" },
  { href: "/calendar",   icon: "campaign",    label: "Calendar" },
  { href: "/review",     icon: "rate_review", label: "Review" },
  { href: "/analytics",  icon: "leaderboard", label: "Analytics" },
];

const DESIGNER_NAV = [
  { href: "/designer",          icon: "palette",       label: "Workspace" },
  { href: "/designer/canvas",   icon: "draw",          label: "Canvas" },
  { href: "/designer/assets",   icon: "perm_media",    label: "Assets" },
  { href: "/designer/templates",icon: "auto_awesome",  label: "Templates" },
  { href: "/designer/review",   icon: "rate_review",   label: "Review" },
];

// --- Minimal dark/light toggle (no external lib needed) ---
function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Read saved preference or default to dark
    const saved = localStorage.getItem("sp_theme");
    const dark = saved ? saved === "dark" : true;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("sp_theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm 
                 text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200 group"
    >
      <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
      <span className="font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
      {/* Toggle pill */}
      <span className="ml-auto flex items-center">
        <span
          className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-300 ${
            isDark ? "bg-surface-container-high" : "bg-primary/30"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform duration-300 shadow-md ${
              isDark
                ? "translate-x-0.5 bg-gray-500"
                : "translate-x-4 bg-primary"
            }`}
          />
        </span>
      </span>
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const isDesigner = user?.role === "designer";
  const navItems = isDesigner ? DESIGNER_NAV : USER_NAV;
  const accentColor = isDesigner ? "text-sp-tertiary" : "text-primary";
  const activeBg = isDesigner ? "bg-sp-tertiary/10" : "bg-[#1c1b1b]";

  return (
    <aside className="flex flex-col h-screen p-6 w-64 border-r border-white/5 bg-[#0e0e0e] fixed left-0 top-0 z-50 shadow-2xl shadow-indigo-500/5">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDesigner ? "bg-sp-tertiary" : "bg-primary"}`}>
          <span
            className="material-symbols-outlined text-on-primary text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isDesigner ? "brush" : "polymer"}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-[900] tracking-tighter text-white">ScalePods</h1>
          <p className={`text-[10px] uppercase tracking-widest font-bold ${isDesigner ? "text-sp-tertiary/60" : "text-primary/60"}`}>
            {isDesigner ? "Designer Portal" : "Marketing Automation"}
          </p>
        </div>
      </div>

      {/* Role Badge */}
      <div className={`mb-6 px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
        isDesigner
          ? "bg-sp-tertiary/10 border-sp-tertiary/20 text-sp-tertiary"
          : "bg-primary/10 border-primary/20 text-primary"
      }`}>
        <span className="material-symbols-outlined text-sm">
          {isDesigner ? "palette" : "manage_accounts"}
        </span>
        {isDesigner ? "Designer" : "Client Manager"}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/"
            : item.href === "/designer" ? pathname === "/designer"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                isActive
                  ? `${accentColor} ${activeBg} font-semibold`
                  : "text-gray-500 hover:text-white hover:bg-[#1c1b1b] hover:scale-[1.01]"
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Settings section — only for users */}
        {!isDesigner && (
          <>
            <div className="pt-4 pb-2 px-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                Settings
              </span>
            </div>
            <Link
              href="/onboarding"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                pathname === "/onboarding"
                  ? `${accentColor} ${activeBg} font-semibold`
                  : "text-gray-500 hover:text-white hover:bg-[#1c1b1b] hover:scale-[1.01]"
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={pathname === "/onboarding" ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                person_add
              </span>
              <span className="font-medium">Onboarding</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-[#1c1b1b] hover:scale-[1.01] transition-all duration-200">
              <span className="material-symbols-outlined text-xl">settings</span>
              <span className="font-medium">Settings</span>
            </button>
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* New Campaign / New Asset CTA */}
        {!isDesigner ? (
          <Link
            href="/onboarding"
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Campaign
          </Link>
        ) : (
          <button className="w-full bg-sp-tertiary/20 text-sp-tertiary border border-sp-tertiary/30 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-sp-tertiary/30 hover:scale-[1.02] active:scale-95">
            <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
            Upload Asset
          </button>
        )}

        {/* User Profile + Logout */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
            isDesigner
              ? "bg-sp-tertiary/10 text-sp-tertiary border-sp-tertiary/20"
              : "bg-surface-container-high text-primary border-white/10"
          }`}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">
              {user?.name || "Guest"}
            </p>
            <p className="text-[10px] text-gray-500 truncate capitalize">
              {isDesigner ? "Designer" : "Client Manager"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
            title="Logout"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
