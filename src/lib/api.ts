"use client";

import { API_BASE, API_CONNECTED } from "@/lib/site";

/**
 * 브라우저에서 API 로 가는 길 — 로그인 · 가입 · 내 정보 · 예약. 레오네페리토 lib/auth.ts 와 같은 규칙:
 *   · 토큰을 localStorage 에 두지 않는다. BE 가 HttpOnly 세션 쿠키(TMSESSION)로 내려 주고 브라우저가 알아서 싣는다.
 *   · 그래서 credentials: "include" 가 필요하고, 쓰기 요청은 CSRF 토큰(X-XSRF-TOKEN)을 먼저 받아 싣는다.
 *   · 오류는 서버가 준 code 로 구분한다. 메시지는 서버 문구를 그대로 쓴다 — 손님에게 보여도 되는 문장만 내려온다(BE DomainRuleException).
 */

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function csrfHeader(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/api/auth/csrf`, { credentials: "include" });
  if (!res.ok) throw new ApiError("NETWORK", "서버에 연결하지 못했습니다.", res.status);
  const body: { headerName: string; token: string } = await res.json();
  return { [body.headerName]: body.token };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!API_CONNECTED) throw new ApiError("NOT_CONNECTED", "서버가 아직 연결되지 않았습니다.", 0);
  const headers: Record<string, string> = method === "GET" ? {} : { "Content-Type": "application/json", ...(await csrfHeader()) };
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, credentials: "include", headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError("NETWORK", "연결에 실패했습니다. 잠시 후 다시 시도해 주세요.", 0);
  }
  if (!res.ok) {
    let code = "UNKNOWN";
    let message = "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    try {
      const err = await res.json();
      code = err.code ?? code;
      message = err.message ?? message;
    } catch {
      // 본문이 없을 수 있다
    }
    throw new ApiError(code, message, res.status);
  }
  if (res.status === 204 || res.status === 202) return undefined as T;
  return (await res.json()) as T;
}

// ── 인증 ─────────────────────────────────────────────────

export interface CurrentUser {
  email: string;
  name: string;
  roles: string[];
  mustChangePassword: boolean;
}

export const me = async (): Promise<CurrentUser | null> => {
  if (!API_CONNECTED) return null;
  const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new ApiError("UNKNOWN", "내 정보를 불러오지 못했습니다.", res.status);
  return (await res.json()) as CurrentUser;
};
export const login = (email: string, password: string) => request<CurrentUser>("POST", "/api/auth/login", { email, password });
export const signup = (input: { email: string; password: string; name: string; phone?: string; agreeTerms: boolean; over14: boolean }) =>
  request<void>("POST", "/api/auth/signup", { ...input, phone: input.phone || null });
export const logout = () => request<void>("POST", "/api/auth/logout");
export const requestPasswordReset = (email: string) => request<void>("POST", "/api/auth/password-reset/request", { email });
export const confirmPasswordReset = (token: string, newPassword: string) =>
  request<void>("POST", "/api/auth/password-reset/confirm", { token, newPassword });

// ── 예약 ─────────────────────────────────────────────────

export type AppointmentType = "CONSULTATION" | "FITTING" | "PICKUP" | "OTHER";
export const APPOINTMENT_TYPE_LABEL: Record<AppointmentType, string> = {
  CONSULTATION: "첫 상담",
  FITTING: "가봉",
  PICKUP: "수령",
  OTHER: "기타",
};

export interface Slot {
  startsAt: string;
  available: boolean;
}
export interface DayAvailability {
  date: string;
  closed: boolean;
  slots: Slot[];
}
export interface Appointment {
  id: string;
  type: AppointmentType;
  typeLabel: string;
  status: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  statusLabel: string;
  startsAt: string;
  durationMinutes: number;
  note: string;
  cancelReason: string | null;
  createdAt: string;
}

/** 빈 시간 — 로그인 없이. from · to 는 yyyy-MM-dd */
export const availability = async (from: string, to: string): Promise<DayAvailability[]> => {
  if (!API_CONNECTED) return [];
  const res = await fetch(`${API_BASE}/api/bookings/availability?from=${from}&to=${to}`);
  if (!res.ok) throw new ApiError("UNKNOWN", "빈 시간을 불러오지 못했습니다.", res.status);
  return (await res.json()) as DayAvailability[];
};
export const book = (type: AppointmentType, startsAt: string, note: string) =>
  request<Appointment>("POST", "/api/bookings", { type, startsAt, note });
export const myAppointments = () => request<Appointment[]>("GET", "/api/bookings/mine");
export const cancelAppointment = (id: string) => request<Appointment>("POST", `/api/bookings/${encodeURIComponent(id)}/cancel`);

// ── 표시 ─────────────────────────────────────────────────

const WHEN = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" });
export const when = (iso: string) => WHEN.format(new Date(iso));
const TIME = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" });
export const timeOf = (iso: string) => TIME.format(new Date(iso));
