/**
 * 렌탈 페이지 내용 — 2026-11-19 시안(Suit Rental).
 */

/** 3. 더맨리의 렌탈 수트 순서 — 시안의 다섯 단계 */
export const RENTAL_STEPS: { title: string; body: string | null }[] = [
  { title: "방문 예약 신청", body: "이 페이지에서 일정을 확인하고, 반드시 네이버로 방문 예약을 해주세요." },
  {
    title: "매장 방문후, 사이즈 체크 및\n수트 상태 체크",
    body: "매장에 방문해서 채촌 및 수트 상태를 확인하는 단계입니다. 매장에서 렌탈 제품 종류 변경도 가능합니다.",
  },
  { title: "제품 수령", body: "매장에서 직접 픽업하거나 택배 배송, 퀵 등 편한 방식으로 제품 수령이 가능합니다." },
  { title: "착용", body: null },
  { title: "반납", body: "매장에 직접 반납하시거나 택배 배송, 퀵 등 편한 방식으로 반납 가능합니다." },
];

/**
 * 2. 수트 선택 옵션 — 시안은 사진 세 장.
 * TODO(고객확인) 렌탈 수트 사진 · 이름(· 가격) — 사진을 받으면 public/brand/rental/ 에 넣고 image 를 채운다. 비어 있으면 «사진 준비 중».
 */
export const RENTAL_ITEMS: { key: string; image: string | null; name: string | null; note: string | null }[] = [
  { key: "1", image: null, name: null, note: null },
  { key: "2", image: null, name: null, note: null },
  { key: "3", image: null, name: null, note: null },
];
