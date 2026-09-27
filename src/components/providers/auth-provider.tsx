"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, getStoredUser, getToken, saveSession, saveUser, sessionScope } from "@/lib/auth-store";
import type { AuthResponse, User } from "@/lib/types";

type AuthContextValue = { user: User | null; ready:boolean; signIn:(session:AuthResponse)=>void; signOut:()=>void; refresh:()=>Promise<User | null>; };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  const scope=sessionScope(pathname);
  const [user,setUser] = useState<User | null>(null); const [ready,setReady] = useState(false);
  const signOut = useCallback(() => { clearSession(scope); setUser(null); }, [scope]);
  const refresh = useCallback(async () => { if (!getToken(scope)) return null; try { const profile=await api.me(); saveUser(profile,scope); setUser(profile); return profile; } catch { signOut(); return null; } }, [scope,signOut]);
  useEffect(() => { setReady(false); setUser(getStoredUser(scope)); refresh().finally(() => setReady(true)); }, [scope,refresh]);
  useEffect(() => { const listener=()=>{ signOut(); const loginPath=scope==="admin"?"/admin/login":"/login"; router.push(`${loginPath}?redirect=${encodeURIComponent(pathname)}`); }; window.addEventListener("hkboardwar:unauthorized",listener); return()=>window.removeEventListener("hkboardwar:unauthorized",listener); },[pathname,router,scope,signOut]);
  const value=useMemo(() => ({ user,ready,signIn:(session:AuthResponse)=>{saveSession(session,scope);setUser(session.user);},signOut,refresh }),[user,ready,scope,signOut,refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context=useContext(AuthContext); if (!context) throw new Error("useAuth must be inside AuthProvider"); return context; }
