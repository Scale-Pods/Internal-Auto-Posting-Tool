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
          <header className="md:hidden h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0e0e0e] sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-lg">polymer</span>
              </div>
              <h1 className="text-lg font-[900] tracking-tighter text-white">ScalePods</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </header>

          <main className="flex-1 min-h-screen bg-surface overflow-y-auto custom-scrollbar md:ml-64 transition-all">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
