"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import type { Role } from "@/lib/types";

export function RequireAuth({ children, roles }: { children:React.ReactNode; roles?:Role[] }) {
  const { user,ready }=useAuth(); const router=useRouter(); const pathname=usePathname();
  useEffect(()=>{ if (!ready) return; if (!user) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`); else if (roles && !roles.includes(user.role)) router.replace("/403"); },[ready,user,roles,router,pathname]);
  if (!ready || !user || (roles && !roles.includes(user.role))) return <main className="page shell"><div className="empty">Checking your access…</div></main>;
  return <>{children}</>;
}
