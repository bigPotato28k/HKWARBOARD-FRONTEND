import { clearSession, getToken } from "@/lib/auth-store";
import type { AdminDashboard, AuditLog, AuthResponse, BoardgameCategory, EventItem, EventRoster, NotificationItem, Pagination, PendingRating, Registration, User } from "@/lib/types";
import { idOf, queryString } from "@/lib/utils";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://hkwarboard.onrender.com").replace(/\/$/, "");
type Method = "GET" | "POST" | "PATCH" | "DELETE";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); }
}

async function request<T>(path: string, method: Method = "GET", body?: unknown, auth = true): Promise<T> {
  const headers: HeadersInit = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Unable to reach the server. Render may be waking up, or the API address/CORS setting needs checking.");
  }
  const payload = await response.json().catch(() => null) as { code?: string; message?: string; details?: unknown } | T | null;
  if (!response.ok) {
    const error = payload as { code?: string; message?: string; details?: unknown } | null;
    if (response.status === 401) { clearSession(); window.dispatchEvent(new Event("hkboardwar:unauthorized")); }
    throw new ApiError(response.status, error?.code || "HTTP_ERROR", error?.message || `Request failed (${response.status})`, error?.details);
  }
  return payload as T;
}

export const apiBaseUrl = BASE_URL;
export const api = {
  register: (body: { email:string; nickname:string; password:string; age:number; gender:string }) => request<AuthResponse>("/api/auth/register", "POST", body, false),
  login: (body: { email:string; password:string }) => request<AuthResponse>("/api/auth/login", "POST", body, false),
  adminLogin: (body: { email:string; password:string }) => request<AuthResponse>("/api/auth/admin/login", "POST", body, false),
  forgotPassword: (email: string) => request<{ message?: string }>("/api/auth/forgot-password", "POST", { email }, false),
  resetPassword: (token: string, newPassword: string) => request<{ message?: string }>("/api/auth/reset-password", "POST", { token, newPassword }, false),
  me: () => request<User>("/api/auth/me"),
  updateMe: (body: Pick<User,"nickname"|"age"|"gender"|"intro">) => request<User>("/api/users/me", "PATCH", body),
  updateNotifications: (body: { notifySite:boolean; notifyEmail:boolean }) => request<User>("/api/users/me/notification-settings", "PATCH", body),
  updatePassword: (oldPassword:string,newPassword:string) => request<{ message?:string }>("/api/users/me/password", "PATCH", { oldPassword,newPassword }),
  level: () => request<{ level:number }>("/api/users/me/level"),
  events: (filters: { levelMin?:number; levelMax?:number; dateFrom?:string; dateTo?:string; category?:BoardgameCategory; keyword?:string; page?:number }) => request<Pagination<EventItem> | EventItem[]>(`/api/events${queryString(filters)}`),
  event: (id:string) => request<EventItem>(`/api/events/${id}`),
  hostedEvents: (month?: string) => request<{drafts:EventItem[];published:EventItem[]}>(`/api/events/mine/hosted${queryString({ month })}`),
  joinedEvents: () => request<{requested:Registration[];confirmed:Registration[];waiting:Registration[]}>("/api/events/mine/joined"),
  history: (filters:{ category?:BoardgameCategory; dateFrom?:string; dateTo?:string }) => request<Registration[]>(`/api/events/mine/history${queryString(filters)}`),
  createEvent: (body: EventPayload) => request<EventItem>("/api/events", "POST", body),
  updateEvent: (id:string,body:EventPayload) => request<EventItem>(`/api/events/${id}`, "PATCH", body),
  publishEvent: (id:string) => request<EventItem>(`/api/events/${id}/publish`, "POST"),
  deleteEvent: (id:string) => request<{ message?:string }>(`/api/events/${id}`, "DELETE"),
  cancelEvent: (id:string) => request<EventItem>(`/api/events/${id}/cancel`, "POST"),
  joinEvent: (eventId:string,userNote?:string) => request<Registration>(`/api/registrations/events/${eventId}/join`, "POST", userNote ? { userNote } : {}),
  cancelRegistration: (id:string,userCancelReason?:string) => request<Registration>(`/api/registrations/${id}/cancel`, "POST", userCancelReason ? { userCancelReason } : {}),
  leaveWaiting: (id:string) => request<Registration>(`/api/registrations/${id}/leave-waiting`, "POST"),
  roster: (eventId:string) => request<EventRoster>(`/api/host/events/${eventId}/registrations`),
  approve: (id:string) => request<{registrationId:string;resultStatus:string}>(`/api/host/registrations/${id}/approve`, "POST"),
  waiting: (id:string) => request<{registrationId:string;resultStatus:string}>(`/api/host/registrations/${id}/to-waiting`, "POST"),
  promote: (eventId:string,registrationId:string) => request<{registrationId:string;resultStatus:string}>(`/api/host/events/${eventId}/promote`, "POST", { registrationId }),
  closeRating: (id:string) => request<{registrationId:string;ratingClosed:boolean}>(`/api/host/registrations/${id}/close-rating`, "POST"),
  pendingRatings: () => request<PendingRating[]>("/api/ratings/pending"),
  rate: (eventId:string,ratings:{rateeId:string;value:0|1}[]) => request<{ message?:string }>(`/api/ratings/events/${eventId}/rate`, "POST", { ratings }),
  notifications: (page=1,pageSize=20) => request<Pagination<NotificationItem> | NotificationItem[]>(`/api/notifications${queryString({ page,pageSize })}`),
  createSseToken: () => request<{ sseToken:string; expiresIn:string }>("/api/notifications/sse-token", "POST"),
  adminDashboard: () => request<AdminDashboard>("/api/admin/dashboard"),
  adminUsers: (filters:{ role?:"member"|"host";accStatus?:"active"|"suspended";level?:number;keyword?:string;page?:number }) => request<Pagination<User> | User[]>(`/api/admin/users${queryString(filters)}`),
  createHost: (body:{email:string;nickname:string;password:string;age:number;gender:string}) => request<{userId:string;email:string;role:"host"}>("/api/admin/users", "POST", body),
  promoteHost: (id:string) => request<User>(`/api/admin/users/${id}/promote-host`, "POST"),
  setUserLevel: (id:string,level:number) => request<User>(`/api/admin/users/${id}/level`, "PATCH", { level }),
  suspendUser: (id:string) => request<User>(`/api/admin/users/${id}/suspend`, "POST"),
  activateUser: (id:string) => request<User>(`/api/admin/users/${id}/activate`, "POST"),
  adminEvents: (filters:{eventStatus?:string;dateFrom?:string;dateTo?:string;page?:number}) => request<Pagination<EventItem> | EventItem[]>(`/api/admin/events${queryString(filters)}`),
  adminRoster: (eventId:string) => request<EventRoster>(`/api/admin/events/${eventId}/registrations`),
  adminRemoveEvent: (id:string) => request<EventItem>(`/api/admin/events/${id}/remove`, "POST"),
  auditLogs: (filters:{action?:string;actorId?:string;targetId?:string;dateFrom?:string;dateTo?:string;page?:number}) => request<Pagination<AuditLog> | AuditLog[]>(`/api/admin/audit-logs${queryString(filters)}`),
};

export interface EventPayload { eventTitle:string; boardgameName:string; boardgameCategory:BoardgameCategory; description:string; address:{district:string;street?:string;detail?:string};levelSetUp:{levelRangeMin:number;levelRangeMax:number};capacity:number;eventStartTime:string;eventEndTime:string; }
export async function downloadAuditCsv() {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/api/admin/audit-logs?format=csv`, { headers: token ? { Authorization:`Bearer ${token}` } : {} });
  if (!response.ok) throw new ApiError(response.status, "AUDIT_EXPORT_FAILED", "Could not export audit logs.");
  const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href=url; link.download="hkboardwar-audit-logs.csv"; link.click(); URL.revokeObjectURL(url);
}
export { idOf };
