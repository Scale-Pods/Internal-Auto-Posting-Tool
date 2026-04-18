// Simple client-side auth utility
// Handles login, logout, role checking

export type UserRole = "user" | "designer";

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
}

const CREDENTIALS: Record<string, { password: string; role: UserRole; name: string }> = {
  "user@123": { password: "123", role: "user", name: "Client User" },
  "design@123": { password: "123", role: "designer", name: "Designer" },
};

export function login(email: string, password: string): AuthUser | null {
  const cred = CREDENTIALS[email.trim().toLowerCase()];
  if (!cred || cred.password !== password) return null;
  const user: AuthUser = { email, role: cred.role, name: cred.name };
  if (typeof window !== "undefined") {
    localStorage.setItem("sp_auth", JSON.stringify(user));
  }
  return user;
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
