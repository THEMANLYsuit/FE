/** 사이트 정식 주소 (예: https://themanly.kr). 비어 있으면 metadataBase · sitemap 을 만들지 않는다. */
const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");

export const SITE_URL: string | null = /^https?:\/\/[^/\s]+$/.test(raw) ? raw : null;

/** API 주소. 비우면 "화면 확인 단계" — 임시 자료로 돌고 로그인 · 예약이 닫힌다. */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
export const API_CONNECTED = API_BASE.length > 0;
/** 빌드 때만 쓰는 주소 — 운영 빌더가 내부 주소를 준다. */
export const FETCH_BASE = process.env.API_BUILD_BASE || API_BASE;

export const BRAND_DESCRIPTION = "당신의 몸에 맞춰 짓는 한 벌. THE MANLY 맞춤정장 — 상담 · 치수 · 가봉 · 완성.";
