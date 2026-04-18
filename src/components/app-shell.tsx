"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import { AuthGuard } from "./auth-guard";

/**
 * AppShell — wraps all pages.
 * Shows sidebar on every page EXCEPT /login.
 * Applies AuthGuard for role-based route protection.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-64 flex-1 min-h-screen bg-surface overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
