"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import { AuthGuard } from "./auth-guard";
import { useState, useEffect } from "react";

/**
 * AppShell — wraps all pages.
 * Shows sidebar on every page EXCEPT /login.
 * Applies AuthGuard for role-based route protection.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isAuthPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-surface">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="md:hidden h-24 flex items-center justify-between px-8 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-3xl sticky top-0 z-[100]">
            <div className="flex items-center">
              <img 
                src="/logo-light.png" 
                alt="ScalePods" 
                className="h-10 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const isDark = document.documentElement.classList.contains("dark");
                  const next = !isDark;
                  document.documentElement.classList.toggle("dark", next);
                  document.documentElement.classList.toggle("light", !next);
                  localStorage.setItem("sp_theme", next ? "dark" : "light");
                  // Force a re-render if needed, but CSS variables will update instantly
                }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-gray-300 hover:text-white transition-all active:scale-90"
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined text-[24px]">dark_mode</span>
              </button>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-gray-300 hover:text-white transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-[28px]">menu</span>
              </button>
            </div>
          </header>

          <main className="flex-1 min-h-screen bg-surface overflow-y-auto custom-scrollbar md:ml-64 transition-all">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
