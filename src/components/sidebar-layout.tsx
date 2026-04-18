"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, logout, type AuthUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

const NO_SIDEBAR_PATHS = ["/login", "/designer"];

const NAV_ITEMS = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/clients", icon: "groups", label: "Clients" },
  { href: "/onboarding", icon: "person_add", label: "Onboarding" },
  { href: "/calendar", icon: "campaign", label: "Campaigns" },
  { href: "/analytics", icon: "leaderboard", label: "Analytics" },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const hideSidebar = NO_SIDEBAR_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  if (hideSidebar) {
    return <>{children}</>;
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex flex-col h-full p-6 w-64 border-r border-white/5 bg-[#0e0e0e] font-['Inter'] font-medium antialiased fixed left-0 top-0 z-40 shadow-2xl shadow-indigo-500/5">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sp-primary to-primary-container flex items-center justify-center shadow-lg shadow-sp-primary/20">
            <span className="material-symbols-outlined text-on-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
          <div>
            <h1 className="text-2xl font-[900] tracking-tighter text-white">ScalePods</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline opacity-70">Marketing Automation</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-xl ${
                  isActive
                    ? "text-[#c0c1ff] bg-[#1c1b1b]"
                    : "text-gray-500 hover:text-white hover:bg-[#1c1b1b] hover:scale-[1.02]"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto">
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full bg-sp-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Campaign
          </button>
          <div className="mt-8 flex items-center gap-3 pt-6 border-t border-white/5">
            <div className="w-10 h-10 rounded-full bg-sp-primary/20 border border-sp-primary/30 flex items-center justify-center text-sp-primary font-bold text-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="text-sm font-bold text-white truncate">{user?.name || "User"}</span>
              <span className="text-[10px] text-gray-500 truncate">{user?.email || ""}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto custom-scrollbar bg-surface relative">
        {children}
      </main>
    </div>
  );
}
