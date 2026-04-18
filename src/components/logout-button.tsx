"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <button
      onClick={handleLogout}
      title="Logout"
      className="h-8 w-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-all"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    </button>
  );
}
