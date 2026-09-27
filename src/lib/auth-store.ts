import type { AuthResponse, User } from "@/lib/types";

export type SessionScope = "member" | "admin";

const KEYS: Record<SessionScope, { token:string; user:string }> = {
  member: { token:"hkboardwar.token", user:"hkboardwar.user" },
  admin: { token:"hkboardwar.admin.token", user:"hkboardwar.admin.user" },
};

export function sessionScope(pathname?: string): SessionScope {
  const path = pathname ?? (typeof window === "undefined" ? "" : window.location.pathname);
  return path.startsWith("/admin") ? "admin" : "member";
}

export function getToken(scope:SessionScope=sessionScope()) { return typeof window === "undefined" ? null : localStorage.getItem(KEYS[scope].token); }
export function getStoredUser(scope:SessionScope=sessionScope()): User | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEYS[scope].user) || "null") as User | null; } catch { return null; }
}
export function saveSession(session: AuthResponse, scope:SessionScope=sessionScope()) {
  localStorage.setItem(KEYS[scope].token, session.token);
  localStorage.setItem(KEYS[scope].user, JSON.stringify(session.user));
}
export function saveUser(user: User, scope:SessionScope=sessionScope()) { localStorage.setItem(KEYS[scope].user, JSON.stringify(user)); }
export function clearSession(scope:SessionScope=sessionScope()) { localStorage.removeItem(KEYS[scope].token); localStorage.removeItem(KEYS[scope].user); }
