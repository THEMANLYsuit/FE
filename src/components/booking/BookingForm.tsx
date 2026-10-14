"use client";

import { Warning } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  APPOINTMENT_TYPE_LABEL,
  ApiError,
  availability,
  book,
  me,
  timeOf,
  when,
  type AppointmentType,
  type CurrentUser,
  type DayAvailability,
} from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";

/**
 * 상담 예약 — 2주치 빈 시간을 보여 주고(로그인 없이), 날짜 → 시간 → 목적 · 메모 순으로 고른다. 신청은 로그인해야 한다.
 * 서버가 규칙(휴무 · 24시간 뒤 · 60일 안 · 자리 겹침)을 다시 본다 — 화면은 available=false 인 자리를 누르지 못하게만 한다.
 */
const DAY = new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric", weekday: "short", timeZone: "Asia/Seoul" });
const TYPES: AppointmentType[] = ["CONSULTATION", "FITTING", "PICKUP", "OTHER"];

function ymd(d: Date) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(d);
}

export function BookingForm() {
  const [user, setUser] = useState<CurrentUser | null | undefined>(API_CONNECTED ? undefined : null);
  const [days, setDays] = useState<DayAvailability[] | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [type, setType] = useState<AppointmentType>("CONSULTATION");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const range = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() + 1);
    const to = new Date(from);
    to.setDate(to.getDate() + 13);
    return { from: ymd(from), to: ymd(to) };
  }, []);

  useEffect(() => {
    if (!API_CONNECTED) return;
    let alive = true;
    me().then((u) => alive && setUser(u)).catch(() => alive && setUser(null));
    availability(range.from, range.to)
      .then((d) => {
        if (!alive) return;
        setDays(d);
        setDate(d.find((x) => x.slots.some((s) => s.available))?.date ?? null);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "빈 시간을 불러오지 못했습니다."));
    return () => {
      alive = false;
    };
  }, [range]);

  const selectedDay = days?.find((d) => d.date === date) ?? null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return setError("시간을 골라 주세요.");
    setBusy(true);
    setError(null);
    try {
      const a = await book(type, slot, note.trim());
      setDone(when(a.startsAt));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "신청하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      // 그사이 자리가 찼으면 목록을 새로 받는다
      availability(range.from, range.to).then(setDays).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  if (!API_CONNECTED) {
    return <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">화면 확인 단계입니다. 예약 서버는 아직 연결되지 않았습니다.</p>;
  }
  if (done) {
    return (
      <div role="status" className="border-subtle bg-surface border p-8 text-center">
        <p className="font-display text-primary text-2xl">예약을 접수했습니다</p>
        <p className="text-secondary mt-3 text-sm leading-relaxed">
          {done} · {APPOINTMENT_TYPE_LABEL[type]}
          <br />
          확인한 뒤 확정 메일을 보내 드립니다. 내 예약에서 상태를 볼 수 있습니다.
        </p>
        <Link href="/mypage/" className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid mt-6 inline-flex min-h-12 items-center rounded-full px-6 text-sm transition-colors duration-300">
          내 예약
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-10">
      {/* 1 날짜 */}
      <fieldset>
        <legend className="text-primary text-sm font-medium">1. 날짜</legend>
        {days === null ? (
          <p aria-busy="true" className="text-muted mt-4 text-sm">빈 시간을 불러오는 중</p>
        ) : (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => {
              const open = d.slots.some((s) => s.available);
              const on = d.date === date;
              return (
                <button
                  key={d.date}
                  type="button"
                  disabled={!open}
                  aria-pressed={on}
                  onClick={() => {
                    setDate(d.date);
                    setSlot(null);
                  }}
                  className={`ease-fluid flex min-h-16 min-w-[4.5rem] shrink-0 flex-col items-center justify-center border px-3 text-sm transition-colors duration-300 ${
                    on ? "border-accent bg-accent-tint text-accent" : open ? "border-subtle text-primary hover:border-accent" : "border-subtle text-disabled cursor-not-allowed"
                  }`}
                >
                  <span className="tabular-nums">{DAY.format(new Date(`${d.date}T00:00:00+09:00`))}</span>
                  <span className="text-2xs mt-1">{d.closed ? "휴무" : open ? "가능" : "마감"}</span>
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* 2 시간 */}
      <fieldset>
        <legend className="text-primary text-sm font-medium">2. 시간</legend>
        {selectedDay ? (
          <div role="radiogroup" aria-label="시간" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {selectedDay.slots.map((s) => {
              const on = s.startsAt === slot;
              return (
                <button
                  key={s.startsAt}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!s.available}
                  onClick={() => setSlot(s.startsAt)}
                  className={`ease-fluid min-h-12 border text-sm tabular-nums transition-colors duration-300 ${
                    on ? "border-accent bg-accent-tint text-accent" : s.available ? "border-subtle text-primary hover:border-accent" : "border-subtle text-disabled cursor-not-allowed line-through"
                  }`}
                >
                  {timeOf(s.startsAt)}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-muted mt-4 text-sm">날짜를 먼저 골라 주세요.</p>
        )}
      </fieldset>

      {/* 3 목적 · 메모 */}
      <fieldset>
        <legend className="text-primary text-sm font-medium">3. 목적</legend>
        <div role="radiogroup" aria-label="목적" className="mt-4 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              onClick={() => setType(t)}
              className={`ease-fluid min-h-11 rounded-full border px-5 text-sm transition-colors duration-300 ${type === t ? "border-accent bg-accent-tint text-accent" : "border-subtle text-secondary hover:border-accent"}`}
            >
              {APPOINTMENT_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <label className="mt-6 flex flex-col gap-2">
          <span className="text-secondary text-2xs">메모 (선택) — 입을 자리, 원하는 품목, 궁금한 점</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={3}
            className="text-primary border-interactive focus-visible:border-accent placeholder:text-muted/60 ease-fluid w-full border bg-transparent px-4 py-3 text-sm transition-colors duration-300"
            placeholder="예: 11월 결혼식에 입을 네이비 수트"
          />
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="text-error flex gap-1.5 text-sm">
          <Warning size={15} weight="light" aria-hidden="true" className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {user === null ? (
        <div className="border-subtle bg-surface flex flex-col gap-4 border p-6 md:flex-row md:items-center md:justify-between">
          <p className="text-secondary text-sm">예약 신청은 로그인 뒤에 할 수 있습니다. 고른 시간은 로그인 후 다시 골라 주세요.</p>
          <div className="flex gap-3">
            <Link href="/login/?next=/booking/" className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid inline-flex min-h-12 items-center rounded-full px-6 text-sm transition-colors duration-300">
              로그인
            </Link>
            <Link href="/signup/" className="border-interactive text-primary hover:border-accent ease-fluid inline-flex min-h-12 items-center rounded-full border px-6 text-sm transition-colors duration-300">
              회원가입
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="submit"
          disabled={busy || !slot || user === undefined}
          className="bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid flex min-h-14 items-center justify-center rounded-full text-sm transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "신청하는 중" : slot ? `${when(slot)} 에 ${APPOINTMENT_TYPE_LABEL[type]} 신청` : "시간을 골라 주세요"}
        </button>
      )}
    </form>
  );
}
