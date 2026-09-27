"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventItem, RegistrationStatus } from "@/lib/types";
import { formatDate, idOf, readableCategory } from "@/lib/utils";

export function ErrorMessage({ error }: { error:unknown }) { return error ? <p className="error">{error instanceof Error ? error.message : "Something went wrong. Please try again."}</p> : null; }
export function Status({ value }: { value?:string }) { const current=(value||"draft").toLowerCase(); return <span className={`status ${current}`}>{current}</span>; }
export function EventCard({ event, action }: { event:EventItem; action?:React.ReactNode }) { const eventId=idOf(event); const joined=event.counters?.confirmed ?? event.joinedCount ?? 0; return <article className="card event-card"><div className={`event-visual ${event.boardgameCategory}`}><span>{readableCategory(event.boardgameCategory)}</span><strong>{event.boardgameName.slice(0,2).toUpperCase()}</strong></div><div className="card-body"><div className="event-meta"><Status value={event.eventStatus}/><span>Lv. {event.levelSetUp?.levelRangeMin ?? 2}–{event.levelSetUp?.levelRangeMax ?? 7}</span></div><h3>{event.eventTitle}</h3><p className="muted game-name">{event.boardgameName} · {event.address?.district || "Hong Kong"}</p><p className="event-time">{formatDate(event.eventStartTime)}</p><div className="event-bottom"><span>{joined}/{event.capacity} players</span>{action || <Link className="btn small secondary" href={`/events/${eventId}`}>View event</Link>}</div></div></article>; }
export function Pagination({ page=1,totalPages=1,basePath }: { page?:number;totalPages?:number;basePath:string }) { if(totalPages<2)return null; return <div className="pagination">{Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(n=>n===page?<span className="current" key={n}>{n}</span>:<Link key={n} href={`${basePath}${n===1?"":`/page/${n}`}`}>{n}</Link>)}</div>; }
export function ConfirmButton({ children, onConfirm, className="btn small danger", message="Are you sure?" }: {children:React.ReactNode;onConfirm:()=>void|Promise<void>;className?:string;message?:string}) { return <button className={className} onClick={()=>{if(window.confirm(message))void onConfirm();}}>{children}</button>; }
export function Notice({ children }: { children:React.ReactNode }) { return <p className="notice">{children}</p>; }
export function useAsyncAction() { const [loading,setLoading]=useState(false); const [error,setError]=useState<unknown>(null); const run=async(action:()=>Promise<void>)=>{setLoading(true);setError(null);try{await action();}catch(e){setError(e);}finally{setLoading(false);}};return{loading,error,setError,run}; }
export function useToast() { const [message,setMessage]=useState<string | null>(null); useEffect(()=>{if(!message)return;const timer=window.setTimeout(()=>setMessage(null),4000);return()=>window.clearTimeout(timer);},[message]); return { toast:message&&<div className="toast">{message}</div>, show:setMessage }; }
export const statuses: RegistrationStatus[]=["requested","confirmed","waiting","cancelled","left","rejected"];
