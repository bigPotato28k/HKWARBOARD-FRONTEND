"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";

const publicLinks=[{href:"/#events",label:"Events"},{href:"/#categories",label:"Categories"},{href:"/#how-it-works",label:"How it works"}];
export function Header() {
  const {user,signOut}=useAuth(); const [open,setOpen]=useState(false); const router=useRouter(); const pathname=usePathname();
  const gate=(href:string)=>{ setOpen(false); if (!user) router.push(`/login?redirect=${encodeURIComponent(href.startsWith("/")?href:"/")}`); else router.push(href); };
  const memberLinks=[
    {href:"/",label:"Homepage"},
    {href:"/events",label:"Event"},
    {href:"/my/notifications",label:"Notification"},
    {href:"/my/history",label:"History"},
    {href:"/my/profile",label:"Setting"},
  ];
  return <header className="site-header"><div className="shell nav"><Link href="/" className="brand"><span>✦</span> HKBOARDWAR</Link><button aria-label="Toggle navigation" className="menu-toggle" onClick={()=>setOpen(!open)}>☰</button><nav className={open?"open":""}>{user?memberLinks.map(link=><Link key={link.label} href={link.href} onClick={()=>setOpen(false)} className="nav-link">{link.label}</Link>):publicLinks.map(link=><button key={link.label} onClick={()=>gate(link.href)} className="nav-link">{link.label}</button>)}{user?.role==="host"&&<Link className="btn small ghost" href="/events/create" onClick={()=>setOpen(false)}>Create event</Link>}{user?<button className="btn small ghost" onClick={()=>{setOpen(false);signOut();router.push("/");}}>Sign out</button>:<button className="btn small" onClick={()=>router.push(`/login?redirect=${encodeURIComponent(pathname)}`)}>Join now</button>}</nav></div></header>;
}
