"use client";

import {
  ApiError,
  me,
  type CurrentUser,
  type InquiryStatus,
  type InquiryTopic,
  type OrderSummary,
} from "@/lib/api";
import { API_BASE, API_CONNECTED } from "@/lib/site";

/**
 * 관리자 화면 → 서버 (`/api/admin/**` = ADMIN). 규칙은 lib/api 와 같다 — 세션 쿠키 · 쓰기는 CSRF · 오류는 서버 code/message.
 * 관리자 화면은 신뢰 경계 안이라 서버가 필드별 오류(fieldErrors)도 준다.
 */

export { ApiError };

async function csrfHeader(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/api/auth/csrf`, {
    credentials: "include",
  });
  if (!res.ok)
    throw new ApiError("NETWORK", "서버에 연결하지 못했습니다.", res.status);
  const body: { headerName: string; token: string } = await res.json();
  return { [body.headerName]: body.token };
}

async function call<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  if (!API_CONNECTED)
    throw new ApiError("NOT_CONNECTED", "서버가 아직 연결되지 않았습니다.", 0);
  const headers: Record<string, string> =
    method === "GET"
      ? {}
      : { "Content-Type": "application/json", ...(await csrfHeader()) };
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("NETWORK", "서버에 연결하지 못했습니다.", 0);
  }
  if (!res.ok) {
    let code = "UNKNOWN";
    let message = "처리하지 못했습니다.";
    try {
      const err = await res.json();
      code = err.code ?? code;
      message = err.fieldErrors?.[0]?.message ?? err.message ?? message;
    } catch {
      if (res.status === 401) message = "로그인이 필요합니다.";
      if (res.status === 403) message = "권한이 없습니다.";
    }
    throw new ApiError(code, message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── 들어오기 ─────────────────────────────────────────────

export const isAdmin = (u: CurrentUser | null) =>
  !!u && u.roles.includes("ROLE_ADMIN");
export const isSuperAdmin = (u: CurrentUser | null) =>
  !!u && u.roles.includes("ROLE_SUPER_ADMIN");

/** 관리자 로그인 — 아이디(또는 이메일) + 비밀번호. 손님 로그인과 주소가 다르다(실패 제한 · 기록이 따로) */
export const adminLogin = (loginId: string, password: string) =>
  call<CurrentUser>("POST", "/api/auth/admin-login", { loginId, password });

/** 비밀번호 바꾸기 — 임시 비밀번호로 들어온 관리자는 이것부터 해야 다른 관리자 API 가 열린다(서버 AdminPasswordGate) */
export const changePassword = (currentPassword: string, newPassword: string) =>
  call<void>("POST", "/api/me/password", { currentPassword, newPassword });

export const adminLogout = () => call<void>("POST", "/api/auth/logout");

export { me };

// ── 대시보드 ─────────────────────────────────────────────

export type OrderStage =
  | "CONSULTATION"
  | "MEASUREMENT"
  | "FABRIC"
  | "FITTING"
  | "ADJUSTMENT"
  | "DELIVERY";

export interface BookingBrief {
  id: string;
  memberId: string;
  type: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  startsAt: string;
  orderId: string | null;
}

export interface Dashboard {
  todayAppointments: number;
  todayList: BookingBrief[];
  requestedAppointments: number;
  inProgressOrders: number;
  ordersByStage: Record<OrderStage, number>;
  dueThisWeek: OrderSummary[];
  openInquiries: number;
}

export const getDashboard = () =>
  call<Dashboard>("GET", "/api/admin/dashboard");

// ── 문의 ─────────────────────────────────────────────────

export interface AdminInquiry {
  id: string;
  memberId: string | null;
  name: string;
  email: string;
  phone: string | null;
  topic: InquiryTopic;
  topicLabel: string;
  message: string;
  status: InquiryStatus;
  statusLabel: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface AdminInquiryPage {
  items: AdminInquiry[];
  page: number;
  totalPages: number;
  total: number;
  /** 답 기다리는 문의 수 — 메뉴 배지 */
  openCount: number;
}

export const listInquiries = (status: InquiryStatus | null, page: number) =>
  call<AdminInquiryPage>(
    "GET",
    `/api/admin/inquiries?page=${page}${status ? `&status=${status}` : ""}`,
  );
export const answerInquiry = (id: string, answer: string) =>
  call<AdminInquiry>(
    "POST",
    `/api/admin/inquiries/${encodeURIComponent(id)}/answer`,
    { answer },
  );
export const closeInquiry = (id: string) =>
  call<AdminInquiry>(
    "POST",
    `/api/admin/inquiries/${encodeURIComponent(id)}/close`,
  );

// ── 메인 필름 (서버 V11) ─────────────────────────────────

export interface FilmSequence {
  id: string;
  frames: number;
  fps: number;
  base: string;
  pad: number;
  ext: string;
}

export interface AdminFilmView {
  id: string;
  frames: number;
  fps: number;
  originalFilename: string;
  byteSize: number;
  active: boolean;
  createdAt: string;
  sequence: FilmSequence;
}

export const getFilmAdmin = () =>
  call<{ current: AdminFilmView | null; recent: AdminFilmView[] }>(
    "GET",
    "/api/admin/film",
  );

/**
 * 영상 올리기 — 수십 MB 라 진행률이 필요해 fetch 대신 XHR. onProgress(0~1) 가 1 이 되면 서버가 사진으로 뽑는 중이다.
 */
export async function uploadFilm(
  file: File,
  onProgress: (ratio: number) => void,
): Promise<AdminFilmView> {
  if (!API_CONNECTED)
    throw new ApiError("NOT_CONNECTED", "서버가 아직 연결되지 않았습니다.", 0);
  const headers = await csrfHeader();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/admin/film`);
    xhr.withCredentials = true;
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let body: { code?: string; message?: string } & Partial<AdminFilmView> =
        {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // 본문 없음(413 등)
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body as AdminFilmView);
      else
        reject(
          new ApiError(
            body.code ?? "UNKNOWN",
            body.message ??
              (xhr.status === 413
                ? "영상이 너무 큽니다."
                : "올리지 못했습니다."),
            xhr.status,
          ),
        );
    };
    xhr.onerror = () =>
      reject(new ApiError("NETWORK", "서버에 연결하지 못했습니다.", 0));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
