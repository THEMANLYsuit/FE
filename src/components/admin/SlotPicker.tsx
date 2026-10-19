"use client";

import { useEffect, useState } from "react";

import { availability, timeOf, type DayAvailability } from "@/lib/api";

import { errText, Field, inputCls } from "./ui";

/**
 * 날짜를 고르면 그날의 자리(서버 예약 규칙의 눈금)를 단추로 보여 준다. 관리자는 손님 제한(24시간 전 · 60일 안)을 받지 않으므로
 * 손님에게 막힌 자리도 고를 수 있다 — 흐리게만 보인다. 이미 다른 예약이 있는 자리면 서버가 "그 시간은 이미…" 로 막는다.
 */
export function SlotPicker({
  initialDate,
  value,
  onChange,
  current,
}: {
  initialDate: string;
  value: string | null;
  onChange: (startsAt: string | null) => void;
  /** 지금 잡혀 있는 시각(옮길 때) — 표시만 */
  current?: string;
}) {
  const [date, setDate] = useState(initialDate);
  const [day, setDay] = useState<DayAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    let alive = true;
    availability(date, date)
      .then((d) => alive && (setDay(d[0] ?? null), setError(null)))
      .catch((e) => alive && setError(errText(e, "빈 시간을 불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [date]);

  return (
    <div className="flex flex-col gap-3">
      <Field label="날짜" htmlFor="slot-date">
        <input
          id="slot-date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setDay(null);
            onChange(null);
          }}
          className={`${inputCls} w-fit`}
        />
      </Field>
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      {day &&
        (day.closed || day.slots.length === 0 ? (
          <p className="text-muted text-sm">휴무일입니다.</p>
        ) : (
          <div role="group" aria-label="시간" className="flex flex-wrap gap-2">
            {day.slots.map((s) => {
              const on = value === s.startsAt;
              const now = current === s.startsAt;
              return (
                <button
                  key={s.startsAt}
                  type="button"
                  aria-pressed={on}
                  disabled={now}
                  title={
                    now
                      ? "지금 잡힌 시간"
                      : s.available
                        ? "비어 있음"
                        : "손님 화면에서는 막힌 시간(이미 예약 · 너무 가깝거나 먼 날)"
                  }
                  onClick={() => onChange(s.startsAt)}
                  className={`ease-fluid min-h-11 min-w-16 rounded-full border px-3 text-sm tabular-nums transition-colors duration-300 ${
                    on
                      ? "border-accent bg-accent text-on-accent"
                      : now
                        ? "border-accent/60 text-accent cursor-default"
                        : s.available
                          ? "border-interactive text-primary hover:border-accent"
                          : "border-subtle text-muted/70 hover:border-accent border-dashed"
                  }`}
                >
                  {timeOf(s.startsAt)}
                </button>
              );
            })}
          </div>
        ))}
    </div>
  );
}
