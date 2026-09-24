import type { AuthResponse, User } from "@/lib/types";

const TOKEN = "hkboardwar.token";
const USER = "hkboardwar.user";

export function getToken() { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN); }
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(USER) || "null") as User | null; } catch { return null; }
}
export function saveSession(session: AuthResponse) {
  localStorage.setItem(TOKEN, session.token);
  localStorage.setItem(USER, JSON.stringify(session.user));
}
export function saveUser(user: User) { localStorage.setItem(USER, JSON.stringify(user)); }
export function clearSession() { localStorage.removeItem(TOKEN); localStorage.removeItem(USER); }
