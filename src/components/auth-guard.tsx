"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

// Pages only the "user" (client manager) role can access
const USER_ONLY_PATHS = [
  "/clients",
  "/onboarding",
  "/calendar",
  "/review",
  "/analytics",
];

// Pages only the "designer" role can access
const DESIGNER_ONLY_PATHS = ["/designer"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = getUser();
    const isPublic = PUBLIC_PATHS.includes(pathname);

    // Not logged in → always redirect to login
    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }

    // Already logged in → redirect away from login
    if (user && pathname === "/login") {
      router.replace(user.role === "designer" ? "/designer" : "/");
      return;
    }

    if (!user) return;

    // Designer trying to access a user-only page → kick to designer home
    const isUserOnly = USER_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (user.role === "designer" && isUserOnly) {
      router.replace("/designer");
      return;
    }

    // User (client manager) trying to access a designer-only page → kick to home
    const isDesignerOnly = DESIGNER_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (user.role === "user" && isDesignerOnly) {
      router.replace("/");
      return;
    }
  }, [pathname, router]);

  return <>{children}</>;
}
