export type Role = "member" | "host" | "admin";
export type BoardgameCategory = "light" | "heavy" | "tcg";

export interface User {
  _id: string;
  id?: string;
  email: string;
  nickname: string;
  role: Role;
  age?: number;
  gender?: string;
  intro?: string;
  accStatus?: "active" | "suspended";
  level?: number;
  notifySite?: boolean;
  notifyEmail?: boolean;
  createdAt?: string;
}

export interface AuthResponse { token: string; user: User; }
export interface Address { district: string; street?: string; detail?: string; }
export interface EventItem {
  _id: string;
  id?: string;
  eventTitle: string;
  boardgameName: string;
  boardgameCategory: BoardgameCategory;
  description: string;
  address: Address;
  levelSetUp: { levelRangeMin: number; levelRangeMax: number };
  capacity: number;
  eventStartTime: string;
  eventEndTime: string;
  eventStatus: "draft" | "published" | "cancelled" | "removed" | "finished";
  host?: Pick<User, "_id" | "nickname" | "level">;
  joinedCount?: number;
  registrationStatus?: RegistrationStatus;
  counters?: { requested:number; confirmed:number; waiting:number };
  spotsLeft?: number;
  joinState?: { state:string; reason?:string; reasonCode?:string; registrationId?:string; requestStatus?:string; detail?:{min:number;max:number;myLevel:number} };
  createdAt?: string;
}

export type RegistrationStatus = "requested" | "confirmed" | "waiting" | "cancelled" | "left" | "rejected";
export interface Registration {
  _id: string;
  id?: string;
  event?: EventItem;
  eventId?: string | EventItem;
  participant?: User;
  user?: User;
  status?: RegistrationStatus;
  requestStatus?: RegistrationStatus;
  registrationId?: string;
  canCancelOrLeave?: boolean;
  ratingStatus?: "pending" | "done";
  userNote?: string;
  userCancelReason?: string;
  createdAt?: string;
}

export interface NotificationItem {
  _id: string;
  id?: string;
  title?: string;
  content?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  createdAt: string;
}

export interface Pagination<T> { items?: T[]; data?: T[]; results?: T[]; page?: number; totalPages?: number; total?: number; }
export interface PendingRating { eventId: string; eventTitle: string; boardgameName: string; eventStartTime: string; targets: {userId:string;nickname:string}[]; }
export interface RosterPlayer { registrationId:string; userId:string; nickname:string; level:number; userNote?:string; appliedAt?:string; suspended?:boolean; ratingClosed?:boolean; }
export interface EventRoster { event: Pick<EventItem,"eventTitle"|"capacity"|"eventStatus"|"eventStartTime"|"eventEndTime"> & { id:string; counters?:EventItem["counters"] }; requested:RosterPlayer[]; confirmed:RosterPlayer[]; waiting:RosterPlayer[]; }
export interface AdminDashboard { memberCount?:number; hostCount?:number; activeEventCount?:number; pendingReviewCount?:number; suspendedCount?:number; recentMembers?:User[]; }
export interface AuditLog { _id: string; action?: string; operator?: User; target?: User; createdAt?: string; meta?: Record<string, unknown>; }
