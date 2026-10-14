"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiError, cancelAppointment, logout, me, myAppointments, when, type Appointment, type CurrentUser } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";

/** 마이페이지 — 내 예약 목록과 취소. 치수 · 주문 진행은 2단계에서 탭으로 붙는다. */
export function MyBookings() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null | undefined>(API_CONNECTED ? undefined : null);
  const [list, setList] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_CONNECTED) return;
    let alive = true;
    me()
      .then(async (u) => {
        if (!alive) return;
        setUser(u);
        if (u) setList(await myAppointments());
      })
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

  if (!API_CONNECTED) {
    return <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">화면 확인 단계입니다. 회원 서버는 아직 연결되지 않았습니다.</p>;
  }
  if (user === undefined) return <p aria-busy="true" className="text-muted text-sm">불러오는 중</p>;
  if (user === null) {
    return (
      <div className="border-subtle bg-surface flex flex-col gap-4 border p-7 md:flex-row md:items-center md:justify-between">
        <p className="text-secondary text-sm">로그인하시면 예약을 보실 수 있습니다.</p>
        <Link href="/login/?next=/mypage/" className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid inline-flex min-h-12 items-center rounded-full px-6 text-sm transition-colors duration-300">
          로그인
        </Link>
      </div>
    );
  }
  const live = (a: Appointment) => a.status === "REQUESTED" || a.status === "CONFIRMED";
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-primary text-2xl">{user.name} 님</p>
          <p className="text-muted mt-1 text-xs">{user.email}</p>
        </div>
        <button type="button" onClick={() => logout().then(() => router.push("/"))} className="text-muted hover:text-accent ease-fluid min-h-11 text-xs underline underline-offset-4 transition-colors duration-300">
          로그아웃
        </button>
      </div>

      <section aria-labelledby="bookings-heading" className="border-subtle bg-surface border p-6 md:p-8">
        <p className="text-accent tracking-label text-2xs">BOOKINGS</p>
        <h2 id="bookings-heading" className="text-primary mt-1 text-sm font-medium">내 예약</h2>
        {error && <p role="alert" className="text-error mt-3 text-sm">{error}</p>}
        {list === null ? (
          <p aria-busy="true" className="text-muted mt-3 text-sm">불러오는 중</p>
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
    </div>
  );
}
