/**
 * 사업자 정보 — 푸터가 쓴다. 레오네페리토(같은 사업자)와 같은 값이다. 2026-10-01 고객 전달값.
 * PG 심사 · 법적 표기에 쓰이므로 사업자등록증과 한 글자도 다르면 안 된다 — 받은 그대로 옮긴다.
 */
export const BUSINESS = {
  brand: "THE MANLY",
  brandKo: "더맨리 맞춤정장",
  companyName: "레오네페리토 (LEONEFERITO)",
  representative: "조강현",
  registrationNumber: "881-15-02245",
  mailOrderNumber: "2024-수원영통-0059",
  address: "경기도 수원시 영통구 매영로 425번길 1 1층 더맨리",
  phone: "010-2434-7794",
  email: "sport0308@naver.com",
  privacyOfficer: "조강현 (대표)",
  hosting: "Amazon Web Services (서울)",
} as const;

export const KAKAO_CHANNEL = {
  name: "더맨리 (THE MANLY)",
  chat: "https://pf.kakao.com/_ZiAxiX/chat",
} as const;

/** 매장 안내 — 예약 규칙(BE app.booking)과 같은 값이어야 한다. 화 · 수 휴무. */
export const SHOP = {
  openDays: "월 · 목 · 금 · 토 · 일",
  closedDays: "화 · 수 휴무",
  hours: "10:00 – 20:00",
  mapQuery: "경기도 수원시 영통구 매영로425번길 1",
} as const;

/** 햄버거 메뉴의 «기성복» — 같은 회사의 기성복 몰(레오네페리토)로 새 창 */
export const READY_TO_WEAR_URL = "https://leoneferito.kr/";

export const SNS = {
  instagram: "https://www.instagram.com/leoneferito_/",
  youtube: "https://www.youtube.com/@THEMANLY_OFFICIAL",
} as const;
