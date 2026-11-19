/**
 * 렌탈 일정 달력의 규칙 (2026-11-19 고객 전달).
 *
 *   1. 오늘부터 VISIT_LEAD_DAYS(5)일 뒤부터 날짜가 열린다 — 오늘 7/15 면 7/20 부터.
 *   2. 손님이 수트가 필요한 날(착용 · 픽업일, D)을 고르면
 *        방문 가능일   = 열리는 첫날 ~ D − 6        (흰 글자, 고를 수 있음 — 이날 매장에 와서 채촌 · 기장 수정)
 *        수선 기간     = D − 5 ~ D − 1              (회색 + «렌탈 제품 수선 기간» 띠)
 *        반납일        = D + 1                      (회색 + «반납일»)
 *        그 밖의 날     = 회색, 고를 수 없음
 *      예) 오늘 8일 · 25일 고름 → 13~19일 방문 가능, 20~24일 수선 기간, 26일 반납일.
 *
 * 이 달력은 일정을 가늠해 보는 도구다 — 예약은 네이버 예약(NAVER_BOOKING.rental)에서 방문 날짜로 한다.
 * 휴무일(화 · 수)은 여기서 막지 않는다. 네이버 예약이 휴무일을 받지 않는다.
 */

export const VISIT_LEAD_DAYS = 5;
export const REPAIR_DAYS = 5;

/** 시각을 버린 그 날 자정(브라우저 시간대 — 손님은 한국에 있다) */
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();

export type DayKind =
  /** 아직 아무것도 안 골랐고 열린 날 — 착용일로 고를 수 있다 */
  | "open"
  /** 고를 수 없는 날 (열리기 전 · 고른 일정 밖) */
  | "locked"
  /** 방문 가능일 */
  | "visit"
  | "repair"
  | "wear"
  | "return";

export interface Schedule {
  /** 날짜가 열리는 첫날 = 오늘 + 5 */
  firstOpen: Date;
  /** 고른 착용일. 없으면 null */
  wear: Date | null;
  /** 방문 가능 기간. 착용일이 너무 가까워 방문할 날이 없으면 null */
  visit: { from: Date; to: Date } | null;
  repair: { from: Date; to: Date } | null;
  returnDay: Date | null;
}

export function scheduleOf(today: Date, wear: Date | null): Schedule {
  const firstOpen = addDays(startOfDay(today), VISIT_LEAD_DAYS);
  if (!wear) return { firstOpen, wear: null, visit: null, repair: null, returnDay: null };
  const lastVisit = addDays(wear, -(REPAIR_DAYS + 1));
  return {
    firstOpen,
    wear,
    visit: lastVisit.getTime() >= firstOpen.getTime() ? { from: firstOpen, to: lastVisit } : null,
    repair: { from: addDays(wear, -REPAIR_DAYS), to: addDays(wear, -1) },
    returnDay: addDays(wear, 1),
  };
}

const within = (d: Date, r: { from: Date; to: Date } | null) =>
  !!r && d.getTime() >= r.from.getTime() && d.getTime() <= r.to.getTime();

export function dayKind(day: Date, s: Schedule): DayKind {
  if (!s.wear) return day.getTime() >= s.firstOpen.getTime() ? "open" : "locked";
  if (sameDay(day, s.wear)) return "wear";
  if (s.returnDay && sameDay(day, s.returnDay)) return "return";
  if (within(day, s.repair)) return "repair";
  if (within(day, s.visit)) return "visit";
  return "locked";
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
/** "7/25(금)" */
export const shortDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY[d.getDay()]})`;
/** "7월 25일 금요일" — 읽기 보조용 */
export const longDate = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAY[d.getDay()]}요일`;

/** 그 달의 주 단위 칸 — 일요일 시작, 앞뒤 빈칸은 null */
export function monthWeeks(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
