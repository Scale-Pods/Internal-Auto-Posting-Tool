// Simple client-side auth utility
// Handles login, logout, role checking

export type UserRole = "user" | "designer" | "admin";

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
}

export function login(email: string, password: string): AuthUser | null {
  // This is now handled by the API route to keep bcrypt keys on the server
  // This client function will be async in practice, but to maintain compat 
  // with current sync usage, we might need a wrapper or just change it to async.
  // Actually, LoginPage calls it async already.
  return null; 
}

export async function loginAsync(email: string, password: string): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return null;
    const user = await res.json();
    
    if (typeof window !== "undefined") {
      localStorage.setItem("sp_auth", JSON.stringify(user));
    }
    return user;
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("sp_auth");
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sp_auth");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export function isDesigner(): boolean {
  return getUser()?.role === "designer";
}

export function isClient(): boolean {
  return getUser()?.role === "user";
}
