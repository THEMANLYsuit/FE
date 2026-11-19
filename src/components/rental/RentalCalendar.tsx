"use client";

import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState, useSyncExternalStore } from "react";

import { NAVER_BOOKING } from "@/data/business";
import {
  REPAIR_DAYS,
  addDays,
  dayKind,
  longDate,
  monthWeeks,
  sameDay,
  scheduleOf,
  shortDate,
  type DayKind,
} from "@/lib/rentalSchedule";

/**
 * 렌탈 일정 달력 — 시안(2026-11-19) «수트가 필요한 날짜를 선택하고, 일정을 확인해 보세요».
 * 규칙은 lib/rentalSchedule. 착용일을 고르면 방문 가능일 · 수선 기간 · 반납일이 그려지고, 방문 가능일 중 하루를 더 고를 수 있다.
 * 예약 자체는 네이버 예약에서 «방문 날짜» 로 한다 — 아래 «예약하기».
 *
 * 오늘은 브라우저에서 읽는다. 정적 빌드라 빌드한 날을 오늘로 쓰면 하루만 지나도 틀린다.
 */

const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEK_HEAD = ["S", "M", "T", "W", "T", "F", "S"];
/** 앞으로 넘겨 볼 수 있는 달 수 */
const MONTHS_AHEAD = 6;
/** 착용일 동그라미 — 메인 체형 화살표와 같은 빨강 */
const WEAR_RED = "#C83A3A";

// 오늘(자정) — 서버(정적 빌드)에서는 null. 날짜가 바뀌는 순간까지 따라갈 필요는 없다
const subscribeNever = () => () => {};
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export function RentalCalendar() {
  const key = useSyncExternalStore(subscribeNever, todayKey, () => "");
  const today = useMemo(() => {
    if (!key) return null;
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m, d);
  }, [key]);

  // 보는 달 — 처음에는 날짜가 열리는 첫날이 든 달(월말이면 다음 달로 넘어간다)
  const [shift, setShift] = useState(0);
  const [wear, setWear] = useState<Date | null>(null);
  const [visit, setVisit] = useState<Date | null>(null);

  if (!today) {
    // 정적 HTML · 첫 그림 — 칸 높이만 잡아 둔다(달력이 들어오며 아래가 밀리지 않게)
    return <CalendarShell aria-busy="true"><div className="h-[392px] md:h-[440px]" /></CalendarShell>;
  }

  const schedule = scheduleOf(today, wear);
  const base = schedule.firstOpen;
  const view = new Date(base.getFullYear(), base.getMonth() + shift, 1);
  const startShift = today.getMonth() === base.getMonth() && today.getFullYear() === base.getFullYear() ? 0 : -1;
  const weeks = monthWeeks(view.getFullYear(), view.getMonth());

  function pick(day: Date, kind: DayKind) {
    if (kind === "open") {
      setWear(day);
      setVisit(null);
    } else if (kind === "visit") {
      setVisit((v) => (v && sameDay(v, day) ? null : day));
    } else if (kind === "wear") {
      setWear(null);
      setVisit(null);
    }
  }

  // 수선 기간 띠 — 주마다 이어진 칸을 하나의 띠로 그리고, 글자는 가장 긴 띠에 한 번만
  const runs = weeks.map((week) => {
    const out: { start: number; length: number }[] = [];
    week.forEach((day, i) => {
      const on = !!day && dayKind(day, schedule) === "repair";
      const last = out[out.length - 1];
      if (on && last && last.start + last.length === i) last.length++;
      else if (on) out.push({ start: i, length: 1 });
    });
    return out;
  });
  const labelAt = runs
    .flatMap((rs, week) => rs.map((r) => ({ week, ...r })))
    .reduce<{ week: number; start: number; length: number } | null>((best, r) => (!best || r.length > best.length ? r : best), null);

  return (
    <div className="flex flex-col gap-5">
      <CalendarShell>
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setShift((s) => s - 1)}
            disabled={shift <= startShift}
            aria-label="이전 달"
            className="text-primary hover:text-accent flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:opacity-25"
          >
            <CaretLeft size={18} weight="bold" aria-hidden="true" />
          </button>
          <p className="font-display text-primary text-xl md:text-2xl" aria-live="polite">
            {MONTHS_EN[view.getMonth()]} {view.getFullYear()}
          </p>
          <button
            type="button"
            onClick={() => setShift((s) => s + 1)}
            disabled={shift >= MONTHS_AHEAD}
            aria-label="다음 달"
            className="text-primary hover:text-accent flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:opacity-25"
          >
            <CaretRight size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div role="grid" aria-label={`${view.getFullYear()}년 ${view.getMonth() + 1}월`} className="mt-4">
          <div role="row" className="grid grid-cols-7">
            {WEEK_HEAD.map((d, i) => (
              <span key={i} role="columnheader" className="text-primary py-2 text-center text-sm font-medium">
                {d}
              </span>
            ))}
          </div>
          {weeks.map((week, w) => (
            <div key={w} role="row" className="grid grid-cols-7">
              {week.map((day, i) => {
                if (!day) return <span key={i} role="gridcell" className="h-14 md:h-16" />;
                const kind = dayKind(day, schedule);
                const run = runs[w].find((r) => r.start === i);
                const isVisit = !!visit && sameDay(visit, day);
                const clickable = kind === "open" || kind === "visit" || kind === "wear";
                const label =
                  kind === "wear" ? "착용일 — 다시 누르면 고르기를 취소합니다"
                  : kind === "return" ? "반납일"
                  : kind === "repair" ? "렌탈 제품 수선 기간"
                  : kind === "visit" ? (isVisit ? "방문일로 고름" : "방문 가능일")
                  : kind === "open" ? "수트가 필요한 날로 고르기"
                  : "고를 수 없음";
                return (
                  <span key={i} role="gridcell" className="relative flex h-14 flex-col items-center pt-1.5 md:h-16">
                    {run && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 left-1 z-10 flex h-9 items-center justify-center overflow-hidden rounded-full bg-[#5b5853]/95"
                        style={{ width: `calc(${run.length * 100}% - 8px)` }}
                      >
                        {labelAt?.week === w && labelAt.start === i && (
                          <span className="text-primary truncate px-2 text-[11px] font-medium md:text-xs">렌탈 제품 수선 기간</span>
                        )}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => pick(day, kind)}
                      aria-label={`${longDate(day)}, ${label}`}
                      aria-pressed={kind === "wear" || isVisit ? true : undefined}
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full text-[15px] tabular-nums transition-colors ${
                        kind === "open" || kind === "visit" ? "text-primary hover:bg-white/10" : "text-[#7c7771]"
                      } ${isVisit ? "bg-accent text-on-accent hover:bg-accent" : ""} disabled:cursor-default`}
                      style={kind === "wear" ? { boxShadow: `inset 0 0 0 1.5px ${WEAR_RED}`, color: "var(--text-primary)" } : undefined}
                    >
                      {day.getDate()}
                    </button>
                    {kind === "return" && <span className="text-primary mt-0.5 text-[10px] leading-none md:text-[11px]">반납일</span>}
                    {kind === "wear" && <span className="mt-0.5 text-[10px] leading-none md:text-[11px]" style={{ color: WEAR_RED }}>착용일</span>}
                    {isVisit && <span className="text-accent mt-0.5 text-[10px] leading-none md:text-[11px]">방문일</span>}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </CalendarShell>

      {/* 고른 일정 요약 — 화면 읽기 프로그램에도 바뀔 때마다 읽힌다 */}
      <div aria-live="polite" className="text-secondary min-h-[4.5rem] text-sm leading-relaxed">
        {!wear ? (
          <p>
            수트가 필요한 날짜를 눌러 주세요. 날짜는 오늘부터 {shortDate(schedule.firstOpen)} 이후로 고를 수 있습니다.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-1">
              <li>
                <b className="text-primary font-medium">방문 가능일</b>{" "}
                {schedule.visit ? `${shortDate(schedule.visit.from)} ~ ${shortDate(schedule.visit.to)}` : "없음"}
                {visit && <span className="text-accent"> · 방문일 {shortDate(visit)}</span>}
              </li>
              <li>
                <b className="text-primary font-medium">수선 기간</b> {shortDate(addDays(wear, -REPAIR_DAYS))} ~ {shortDate(addDays(wear, -1))}
              </li>
              <li>
                <b className="text-primary font-medium">착용 · 픽업</b> {shortDate(wear)} <span className="text-muted">→</span>{" "}
                <b className="text-primary font-medium">반납</b> {shortDate(addDays(wear, 1))}
              </li>
            </ul>
            {!schedule.visit && (
              <p className="text-warning mt-2">
                수선 기간({REPAIR_DAYS}일) 전에 매장에 오실 수 있는 날이 없습니다. 더 뒤의 날짜를 고르시거나 카카오톡으로 문의해 주세요.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setWear(null);
                setVisit(null);
              }}
              className="text-muted hover:text-accent mt-2 text-xs underline underline-offset-4"
            >
              날짜 다시 고르기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CalendarShell({ children, ...rest }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className="rounded-[14px] bg-[#3a3835] px-3 py-4 md:px-6 md:py-6">
      {children}
    </div>
  );
}

/** 페이지 아래 «예약하기» — 네이버 예약 «렌탈 제품 예약 시스템» 으로 새 창 */
export function RentalBookButton() {
  return (
    <a
      href={NAVER_BOOKING.rental}
      target="_blank"
      rel="noopener noreferrer"
      className="group ease-fluid inline-flex min-h-12 items-center gap-3 rounded-full bg-[#d9c08f] px-9 text-sm font-medium text-[#141210] transition-colors duration-300 hover:bg-[#e6d0a4]"
    >
      예약하기
      <ArrowRight size={16} weight="bold" aria-hidden="true" className="ease-fluid transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}
