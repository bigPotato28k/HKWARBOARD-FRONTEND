"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, getStoredUser, getToken, saveSession, saveUser } from "@/lib/auth-store";
import type { AuthResponse, User } from "@/lib/types";

type AuthContextValue = { user: User | null; ready:boolean; signIn:(session:AuthResponse)=>void; signOut:()=>void; refresh:()=>Promise<User | null>; };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  const [user,setUser] = useState<User | null>(null); const [ready,setReady] = useState(false);
  const signOut = useCallback(() => { clearSession(); setUser(null); }, []);
  const refresh = useCallback(async () => { if (!getToken()) return null; try { const profile=await api.me(); saveUser(profile); setUser(profile); return profile; } catch { signOut(); return null; } }, [signOut]);
  useEffect(() => { setUser(getStoredUser()); refresh().finally(() => setReady(true)); }, [refresh]);
  useEffect(() => { const listener=()=>{ signOut(); router.push(`/login?redirect=${encodeURIComponent(pathname)}`); }; window.addEventListener("hkboardwar:unauthorized",listener); return()=>window.removeEventListener("hkboardwar:unauthorized",listener); },[pathname,router,signOut]);
  const value=useMemo(() => ({ user,ready,signIn:(session:AuthResponse)=>{saveSession(session);setUser(session.user);},signOut,refresh }),[user,ready,signOut,refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context=useContext(AuthContext); if (!context) throw new Error("useAuth must be inside AuthProvider"); return context; }
