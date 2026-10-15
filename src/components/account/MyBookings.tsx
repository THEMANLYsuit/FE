"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError, cancelAppointment, myAppointments, when, type Appointment } from "@/lib/api";

/** 마이페이지 · 예약 탭 — 내 예약과 취소. 로그인 확인은 MypagePanel 이 한다. */
export function MyBookings() {
  const [list, setList] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    myAppointments()
      .then((l) => alive && setList(l))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "불러오지 못했습니다."));
    return () => {
      alive = false;
    };
  }, []);

  async function cancel(a: Appointment) {
    if (!window.confirm(`${when(a.startsAt)} ${a.typeLabel} 예약을 취소할까요?`)) return;
    try {
      const updated = await cancelAppointment(a.id);
      setList((l) => (l ?? []).map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "취소하지 못했습니다.");
    }
  }

  const live = (a: Appointment) => a.status === "REQUESTED" || a.status === "CONFIRMED";
  return (
    <section aria-labelledby="bookings-heading" className="border-subtle bg-surface border p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 id="bookings-heading" className="text-primary text-sm font-medium">내 예약</h2>
        <Link href="/booking/" className="text-accent inline-flex min-h-11 items-center text-xs underline underline-offset-4">
          새로 예약
        </Link>
      </div>
      {error && <p role="alert" className="text-error mt-3 text-sm">{error}</p>}
      {list === null ? (
        !error && <p aria-busy="true" className="text-muted mt-3 text-sm">불러오는 중</p>
      ) : list.length === 0 ? (
        <p className="text-secondary mt-3 text-sm">
          아직 예약이 없습니다. <Link href="/booking/" className="text-accent underline underline-offset-4">상담 예약하기</Link>
        </p>
      ) : (
        <ul className="divide-subtle mt-4 divide-y">
          {list.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-primary text-sm">
                  {when(a.startsAt)} · {a.typeLabel}
                </p>
                {a.note && <p className="text-muted mt-1 text-xs">{a.note}</p>}
                {a.cancelReason && <p className="text-muted mt-1 text-xs">취소 사유: {a.cancelReason}</p>}
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-2xs ${a.status === "CONFIRMED" ? "text-success" : a.status === "CANCELLED" || a.status === "NO_SHOW" ? "text-muted" : "text-accent"}`}>{a.statusLabel}</span>
                {live(a) && (
                  <button type="button" onClick={() => cancel(a)} className="text-muted hover:text-error ease-fluid min-h-11 text-xs underline underline-offset-4 transition-colors duration-300">
                    취소
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
