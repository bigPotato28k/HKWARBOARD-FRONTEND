import type { EventItem, Registration, User } from "@/lib/types";

export function idOf(value: { _id?: string; id?: string } | string | undefined | null) { return typeof value === "string" ? value : value?._id || value?.id || ""; }
export function eventOf(registration: Registration) { return (registration.event || (typeof registration.eventId === "object" ? registration.eventId : undefined)) as EventItem | undefined; }
export function userName(user?: Partial<User> | null) { return user?.nickname || "Player"; }
export function formatDate(value?: string) { return value ? new Intl.DateTimeFormat("en-HK", { dateStyle:"medium", timeStyle:"short" }).format(new Date(value)) : "—"; }
export function toDateTimeLocal(value?: string) { return value ? new Date(new Date(value).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16) : ""; }
export function fromDateTimeLocal(value: string) { return new Date(value).toISOString(); }
export function readableCategory(value?: string) { return ({ light:"Light", heavy:"Heavy", tcg:"TCG" } as Record<string,string>)[value || ""] || value || "—"; }
export function queryString(values: Record<string, string | number | undefined | null>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") params.set(key, String(value)); });
  const text = params.toString(); return text ? `?${text}` : "";
}
export function listOf<T>(payload: T[] | { items?:T[]; data?:T[]; results?:T[]; events?:T[]; users?:T[]; notifications?:T[]; logs?:T[] } | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.data || payload?.results || payload?.events || payload?.users || payload?.notifications || payload?.logs || [];
}
export function pagesOf(payload: unknown): number { const value=payload as { totalPages?:number; pagination?:{totalPages?:number} }; return value?.totalPages || value?.pagination?.totalPages || 1; }
