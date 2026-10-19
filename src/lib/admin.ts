"use client";

import {
  ApiError,
  me,
  type AppointmentType,
  type CurrentUser,
  type InquiryStatus,
  type InquiryTopic,
  type MeasurementPointView,
  type OrderDetail,
  type OrderStatus,
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

// ── 공통 ─────────────────────────────────────────────────

/** 서버가 주는 손님 정보(예약 · 주문에 붙어 온다). 탈퇴 회원이면 null 일 수 있다. */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface Paged<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}

const qs = (params: Record<string, string | number | null | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};
const id = (v: string) => encodeURIComponent(v);

/** 서버가 준 사진 주소 — 로컬처럼 /media/… 로 오면 API 주소를 붙인다(운영은 처음부터 https://api…). */
export const mediaSrc = (url: string | null | undefined) =>
  !url ? null : url.startsWith("/media/") ? `${API_BASE}${url}` : url;

// ── 예약 ─────────────────────────────────────────────────

export type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  REQUESTED: "신청",
  CONFIRMED: "확정",
  CANCELLED: "취소",
  COMPLETED: "완료",
  NO_SHOW: "불참",
};

export interface AdminBooking {
  id: string;
  type: AppointmentType;
  typeLabel: string;
  status: BookingStatus;
  statusLabel: string;
  startsAt: string;
  durationMinutes: number;
  customerNote: string | null;
  adminNote: string | null;
  cancelledBy: "CUSTOMER" | "ADMIN" | null;
  cancelReason: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  customer: Customer | null;
  orderNumber: string | null;
}

/** from · to 는 한국 날짜 yyyy-MM-dd (둘 다 포함, 3개월 이내) */
export const listBookings = (
  from: string,
  to: string,
  status: BookingStatus | null,
) =>
  call<AdminBooking[]>(
    "GET",
    `/api/admin/bookings${qs({ from, to, status })}`,
  );
export const getBooking = (bookingId: string) =>
  call<AdminBooking>("GET", `/api/admin/bookings/${id(bookingId)}`);
export const confirmBooking = (bookingId: string) =>
  call<AdminBooking>("POST", `/api/admin/bookings/${id(bookingId)}/confirm`);
export const cancelBooking = (bookingId: string, reason: string) =>
  call<AdminBooking>("POST", `/api/admin/bookings/${id(bookingId)}/cancel`, {
    reason,
  });
export const completeBooking = (bookingId: string) =>
  call<AdminBooking>("POST", `/api/admin/bookings/${id(bookingId)}/complete`);
export const noShowBooking = (bookingId: string) =>
  call<AdminBooking>("POST", `/api/admin/bookings/${id(bookingId)}/no-show`);
export const rescheduleBooking = (bookingId: string, startsAt: string) =>
  call<AdminBooking>("PUT", `/api/admin/bookings/${id(bookingId)}/schedule`, {
    startsAt,
  });
export const noteBooking = (bookingId: string, adminNote: string) =>
  call<AdminBooking>("PUT", `/api/admin/bookings/${id(bookingId)}/note`, {
    adminNote,
  });
/** 상담 중에 관리자가 잡는 예약 — 바로 확정. orderNumber 로 그 손님의 진행 중 주문에 묶는다. */
export const createBooking = (
  memberId: string,
  body: {
    type: AppointmentType;
    startsAt: string;
    adminNote: string;
    orderNumber: string | null;
  },
) =>
  call<AdminBooking>("POST", `/api/admin/members/${id(memberId)}/bookings`, body);

// ── 맞춤 주문 ─────────────────────────────────────────────

export type Garment =
  | "SUIT_2PC"
  | "SUIT_3PC"
  | "JACKET"
  | "TROUSERS"
  | "VEST"
  | "COAT"
  | "SHIRT"
  | "OTHER";

export const GARMENTS: [Garment, string][] = [
  ["SUIT_2PC", "투피스 수트"],
  ["SUIT_3PC", "쓰리피스 수트"],
  ["JACKET", "재킷"],
  ["TROUSERS", "바지"],
  ["VEST", "베스트"],
  ["COAT", "코트"],
  ["SHIRT", "셔츠"],
  ["OTHER", "기타"],
];

export const ORDER_STAGE_LABEL: Record<OrderStage, string> = {
  CONSULTATION: "상담",
  MEASUREMENT: "치수",
  FABRIC: "원단 · 스타일",
  FITTING: "가봉",
  ADJUSTMENT: "수정 · 완성",
  DELIVERY: "수령",
};

export interface AdminOrderRow {
  summary: OrderSummary;
  customer: Customer | null;
  priceKrw: number | null;
  depositKrw: number;
}

export interface AdminOrderDetail {
  order: OrderDetail;
  customer: Customer | null;
  fabricId: string | null;
  measurementId: string | null;
  styleCodes: Record<string, string> | null;
  adminNote: string | null;
  bookings: {
    id: string;
    type: AppointmentType;
    typeLabel: string;
    status: BookingStatus;
    statusLabel: string;
    startsAt: string;
  }[];
}

export interface OrderInput {
  garment: Garment;
  title: string;
  fabricId: string | null;
  fabricNote: string;
  measurementId: string | null;
  styles: Record<string, string>;
  priceKrw: number | null;
  depositKrw: number | null;
  dueOn: string | null;
  adminNote: string;
  /** 처음 열 때만 — 손님에게 가는 첫 안내 */
  message?: string;
}

export const listOrders = (
  q: string,
  status: OrderStatus | null,
  stage: OrderStage | null,
  page: number,
) =>
  call<Paged<AdminOrderRow>>(
    "GET",
    `/api/admin/orders${qs({ q: q.trim(), status, stage, page })}`,
  );
export const memberOrders = (memberId: string) =>
  call<AdminOrderRow[]>("GET", `/api/admin/members/${id(memberId)}/orders`);
export const getOrder = (orderNumber: string) =>
  call<AdminOrderDetail>("GET", `/api/admin/orders/${id(orderNumber)}`);
export const openOrder = (memberId: string, body: OrderInput) =>
  call<AdminOrderDetail>(
    "POST",
    `/api/admin/members/${id(memberId)}/orders`,
    body,
  );
export const updateOrder = (orderNumber: string, body: OrderInput) =>
  call<AdminOrderDetail>("PUT", `/api/admin/orders/${id(orderNumber)}`, body);
/** 단계 옮기기 — 손님에게 안내 메일이 간다(message 가 함께 간다) */
export const moveOrder = (
  orderNumber: string,
  stage: OrderStage,
  message: string,
) =>
  call<AdminOrderDetail>("POST", `/api/admin/orders/${id(orderNumber)}/stage`, {
    stage,
    message,
  });
export const noteOrder = (orderNumber: string, message: string) =>
  call<AdminOrderDetail>("POST", `/api/admin/orders/${id(orderNumber)}/notes`, {
    message,
  });
export const completeOrder = (orderNumber: string, message: string) =>
  call<AdminOrderDetail>(
    "POST",
    `/api/admin/orders/${id(orderNumber)}/complete`,
    { message },
  );
export const cancelOrder = (orderNumber: string, reason: string) =>
  call<AdminOrderDetail>(
    "POST",
    `/api/admin/orders/${id(orderNumber)}/cancel`,
    { reason },
  );

// ── 회원 ─────────────────────────────────────────────────

export type MemberStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN";
export type MemberRole = "MEMBER" | "ADMIN" | "SUPER_ADMIN";

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: "이용 중",
  SUSPENDED: "정지",
  WITHDRAWN: "탈퇴",
};
export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  MEMBER: "회원",
  ADMIN: "관리자",
  SUPER_ADMIN: "최고 관리자",
};

export interface AdminMember {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  status: MemberStatus;
  role: MemberRole;
  loginId: string | null;
  locked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface MemberOverview {
  member: AdminMember;
  latestMeasurement: AdminMeasurement | null;
  measurementCount: number;
  orders: OrderSummary[];
  upcoming: BookingBrief[];
}

/** q = 이름 · 이메일 · 전화번호 일부 */
export const listMembers = (q: string, status: MemberStatus | null, page: number) =>
  call<Paged<AdminMember>>(
    "GET",
    `/api/admin/members${qs({ q: q.trim(), status, page })}`,
  );
export const memberOverview = (memberId: string) =>
  call<MemberOverview>("GET", `/api/admin/members/${id(memberId)}/overview`);
export const unlockMember = (memberId: string) =>
  call<void>("POST", `/api/admin/members/${id(memberId)}/unlock`);
export const suspendMember = (memberId: string) =>
  call<void>("POST", `/api/admin/members/${id(memberId)}/suspend`);
export const reactivateMember = (memberId: string) =>
  call<void>("POST", `/api/admin/members/${id(memberId)}/reactivate`);
/** 최고 관리자만 — 회원 ↔ 관리자 */
export const changeMemberRole = (memberId: string, role: MemberRole) =>
  call<void>("PUT", `/api/admin/members/${id(memberId)}/role`, { role });

// ── 치수 ─────────────────────────────────────────────────

export interface PointSpec {
  point: string;
  label: string;
  group: "BODY" | "TOP" | "BOTTOM";
  groupLabel: string;
  unit: string;
  min: number;
  max: number;
}

export interface AdminMeasurement {
  id: string;
  memberId: string;
  measuredOn: string;
  bodyNote: string | null;
  adminNote: string | null;
  points: MeasurementPointView[];
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementInput {
  measuredOn: string;
  points: Record<string, number>;
  bodyNote: string;
  adminNote: string;
}

export const measurementPoints = () =>
  call<PointSpec[]>("GET", "/api/admin/measurement-points");
export const memberMeasurements = (memberId: string) =>
  call<AdminMeasurement[]>(
    "GET",
    `/api/admin/members/${id(memberId)}/measurements`,
  );
export const recordMeasurement = (memberId: string, body: MeasurementInput) =>
  call<AdminMeasurement>(
    "POST",
    `/api/admin/members/${id(memberId)}/measurements`,
    body,
  );
export const updateMeasurement = (measurementId: string, body: MeasurementInput) =>
  call<AdminMeasurement>(
    "PUT",
    `/api/admin/measurements/${id(measurementId)}`,
    body,
  );
export const deleteMeasurement = (measurementId: string) =>
  call<void>("DELETE", `/api/admin/measurements/${id(measurementId)}`);

// ── 원단 · 스타일 ─────────────────────────────────────────

export type FabricStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT";
export type Season = "ALL" | "SS" | "FW";

export const FABRIC_STATUS_LABEL: Record<FabricStatus, string> = {
  DRAFT: "준비 중",
  PUBLISHED: "공개",
  SOLD_OUT: "품절",
};
export const SEASON_LABEL: Record<Season, string> = {
  ALL: "사계절",
  SS: "봄 · 여름",
  FW: "가을 · 겨울",
};

export interface AdminFabric {
  id: string;
  code: string;
  name: string;
  mill: string | null;
  composition: string | null;
  weightGsm: number | null;
  color: string | null;
  pattern: string | null;
  season: Season | null;
  priceFromKrw: number | null;
  description: string | null;
  imageUrl: string | null;
  status: FabricStatus;
  sortOrder: number;
  updatedAt: string;
}

export interface FabricInput {
  code: string;
  name: string;
  mill: string;
  composition: string;
  weightGsm: number | null;
  color: string;
  pattern: string;
  season: Season | null;
  priceFromKrw: number | null;
  description: string;
  imageUrl: string;
}

export type StyleCategory =
  | "JACKET_BUTTONS"
  | "LAPEL"
  | "VENT"
  | "POCKET"
  | "LINING"
  | "TROUSER_PLEAT"
  | "TROUSER_HEM"
  | "WAIST"
  | "MONOGRAM";

export const STYLE_CATEGORIES: [StyleCategory, string][] = [
  ["JACKET_BUTTONS", "재킷 단추"],
  ["LAPEL", "라펠"],
  ["VENT", "벤트"],
  ["POCKET", "포켓"],
  ["LINING", "안감"],
  ["TROUSER_PLEAT", "바지 주름"],
  ["TROUSER_HEM", "바짓단"],
  ["WAIST", "허리"],
  ["MONOGRAM", "이니셜"],
];

export interface AdminStyle {
  id: string;
  category: StyleCategory;
  categoryLabel: string;
  code: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isDefault: boolean;
  enabled: boolean;
  sortOrder: number;
}

export interface StyleInput {
  category: StyleCategory;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  isDefault: boolean;
  enabled: boolean;
}

export const listFabrics = () => call<AdminFabric[]>("GET", "/api/admin/fabrics");
export const createFabric = (body: FabricInput) =>
  call<AdminFabric>("POST", "/api/admin/fabrics", body);
/** 원단 번호(code)는 바뀌지 않는다 — 손님 화면 주소의 일부 */
export const updateFabric = (fabricId: string, body: FabricInput) =>
  call<AdminFabric>("PUT", `/api/admin/fabrics/${id(fabricId)}`, body);
export const setFabricStatus = (fabricId: string, status: FabricStatus) =>
  call<AdminFabric>("PUT", `/api/admin/fabrics/${id(fabricId)}/status`, {
    status,
  });
export const reorderFabrics = (ids: string[]) =>
  call<void>("PUT", "/api/admin/fabrics/order", { ids });

export const listStyles = () =>
  call<AdminStyle[]>("GET", "/api/admin/style-options");
export const createStyle = (body: StyleInput) =>
  call<AdminStyle>("POST", "/api/admin/style-options", body);
export const updateStyle = (styleId: string, body: StyleInput) =>
  call<AdminStyle>("PUT", `/api/admin/style-options/${id(styleId)}`, body);
export const reorderStyles = (category: StyleCategory, ids: string[]) =>
  call<void>("PUT", "/api/admin/style-options/order", { category, ids });

export interface UploadedMedia {
  id: string;
  url: string;
  filename: string;
  byteSize: number;
  width: number | null;
  height: number | null;
}

/** 사진 올리기 (JPG · PNG · WebP, 10MB 이하). 돌려받은 url 을 원단 · 스타일의 imageUrl 에 넣는다. */
export async function uploadMedia(file: File): Promise<UploadedMedia> {
  if (!API_CONNECTED)
    throw new ApiError("NOT_CONNECTED", "서버가 아직 연결되지 않았습니다.", 0);
  const form = new FormData();
  form.append("file", file);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/admin/media`, {
      method: "POST",
      credentials: "include",
      headers: await csrfHeader(),
      body: form,
    });
  } catch {
    throw new ApiError("NETWORK", "서버에 연결하지 못했습니다.", 0);
  }
  if (!res.ok) {
    let code = "UNKNOWN";
    let message =
      res.status === 413 ? "사진이 너무 큽니다." : "올리지 못했습니다.";
    try {
      const err = await res.json();
      code = err.code ?? code;
      message = err.message ?? message;
    } catch {
      // 본문 없음
    }
    throw new ApiError(code, message, res.status);
  }
  return (await res.json()) as UploadedMedia;
}

// ── 접속 기록 (최고 관리자) ───────────────────────────────

export interface AccessLogRow {
  id: number;
  actorId: string | null;
  actorEmail: string | null;
  method: string;
  path: string;
  status: number;
  ip: string | null;
  createdAt: string;
}

/** 50줄씩. q = 경로에 든 글자(주문번호 · 회원 id 로 "누가 이걸 봤나") */
export const listAccessLogs = (filter: {
  actorId: string | null;
  from: string;
  to: string;
  q: string;
  page: number;
}) =>
  call<Paged<AccessLogRow>>(
    "GET",
    `/api/admin/access-logs${qs({ ...filter, q: filter.q.trim() })}`,
  );
