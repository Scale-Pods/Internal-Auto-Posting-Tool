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
          <header className="md:hidden h-20 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl sticky top-0 z-[100]">
            <div className="flex items-center">
              <img 
                src="/logo-light.png" 
                alt="ScalePods" 
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  console.error("Logo failed to load");
                }}
              />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
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
