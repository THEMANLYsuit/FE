/**
 * 사업자 정보 — 푸터가 쓴다. 레오네페리토(같은 사업자)와 같은 값이다. 2026-10-01 고객 전달값.
 * PG 심사 · 법적 표기에 쓰이므로 사업자등록증과 한 글자도 다르면 안 된다 — 받은 그대로 옮긴다.
 */
export const BUSINESS = {
  brand: "THE MANLY",
  brandKo: "더맨리 맞춤정장",
  // 2026-11-19 나이스페이 심사: 사업자등록증 상호는 «스토익컴퍼니»(레오네페리토 · 더맨리는 브랜드 이름)
  companyName: "스토익컴퍼니",
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
  /** 채널 추가 — 상담 & 문의 «채널 추가하고 소식 받기» */
  friend: "https://pf.kakao.com/_ZiAxiX/friend",
} as const;

/** 매장 안내 — 예약 규칙(BE app.booking)과 같은 값이어야 한다. 화 · 수 휴무. */
export const SHOP = {
  openDays: "월 · 목 · 금 · 토 · 일",
  closedDays: "화 · 수 휴무",
  hours: "10:00 – 20:00",
  mapQuery: "경기도 수원시 영통구 매영로425번길 1",
  /** 네이버 지도 — 레오네페리토와 같은 매장(2026-10-20 고객 전달). 메인 «지도보기» 가 연다 */
  mapUrl: "https://naver.me/xJGvF38R",
} as const;

/**
 * 네이버 예약 — 매장(네이버 플레이스 더맨리)의 예약 상품 둘. 2026-11-19 고객 요청: 상담 · 렌탈 예약은 네이버로 받는다.
 * 주소는 플레이스에 걸린 예약 상품 그대로(사업장 1461811). 상품을 지우거나 새로 만들면 번호가 바뀌니 여기도 바꾼다.
 */
export const NAVER_BOOKING = {
  /** «더맨리 상담예약» — 방문상담 · 채촌 · 피팅. 상담 & 문의 «바로 상담 및 예약하기» */
  consultation: "https://booking.naver.com/booking/13/bizes/1461811/items/6925660",
  /** «렌탈 제품 예약 시스템» — 렌탈 페이지 «예약하기» */
  rental: "https://booking.naver.com/booking/13/bizes/1461811/items/7852716",
} as const;

/** 햄버거 메뉴의 «기성복» — 같은 회사의 기성복 몰(레오네페리토)로 새 창 */
export const READY_TO_WEAR_URL = "https://leoneferito.kr/";

export const SNS = {
  instagram: "https://www.instagram.com/leoneferito_/",
  youtube: "https://www.youtube.com/@THEMANLY_OFFICIAL",
} as const;
