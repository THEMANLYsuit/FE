"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { MyBookings } from "@/components/account/MyBookings";
import { MyMeasurements } from "@/components/account/MyMeasurements";
import { MyOrders } from "@/components/account/MyOrders";
import { logout, me, type CurrentUser } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";

/**
 * 마이페이지 — 탭 셋(예약 · 맞춤 주문 · 치수). 탭은 주소의 # 로 기억한다(#orders) — 새로고침 · 뒤로 가기 · 메일 속 링크가 같은 탭을 연다.
 * 로그인 확인은 여기서 한 번만 하고, 탭 안의 목록은 각자 불러온다.
 */
const TABS = [
  { id: "bookings", label: "예약", en: "BOOKINGS" },
  { id: "orders", label: "맞춤 주문", en: "ORDERS" },
  { id: "measurements", label: "치수", en: "MEASUREMENTS" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = (): TabId => {
  const h = window.location.hash.slice(1);
  return TABS.some((t) => t.id === h) ? (h as TabId) : "bookings";
};

export function MypagePanel() {
  const router = useRouter();
  const tab = useSyncExternalStore(subscribeHash, readHash, () => "bookings" as TabId);
  const [user, setUser] = useState<CurrentUser | null | undefined>(API_CONNECTED ? undefined : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_CONNECTED) return;
    let alive = true;
    me()
      .then((u) => alive && setUser(u))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "불러오지 못했습니다."));
    return () => {
      alive = false;
    };
  }, []);

  if (!API_CONNECTED) {
    return <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">화면 확인 단계입니다. 회원 서버는 아직 연결되지 않았습니다.</p>;
  }
  if (error) return <p role="alert" className="text-error text-sm">{error}</p>;
  if (user === undefined) return <p aria-busy="true" className="text-muted text-sm">불러오는 중</p>;
  if (user === null) {
    return (
      <div className="border-subtle bg-surface flex flex-col gap-4 border p-7 md:flex-row md:items-center md:justify-between">
        <p className="text-secondary text-sm">로그인하시면 예약 · 주문 진행 · 치수를 보실 수 있습니다.</p>
        <Link href="/login/?next=/mypage/" className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid inline-flex min-h-12 items-center rounded-full px-6 text-sm transition-colors duration-300">
          로그인
        </Link>
      </div>
    );
  }

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

      <div role="tablist" aria-label="마이페이지" className="border-subtle grid grid-cols-3 border-b">
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              onClick={() => {
                window.location.hash = t.id;
              }}
              className={`ease-fluid -mb-px flex min-h-14 flex-col items-center justify-center border-b-2 transition-colors duration-300 ${
                on ? "border-accent text-primary" : "text-muted hover:text-secondary border-transparent"
              }`}
            >
              <span className="text-sm">{t.label}</span>
              <span className="tracking-label text-[0.6rem]">{t.en}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "bookings" && <MyBookings />}
        {tab === "orders" && <MyOrders />}
        {tab === "measurements" && <MyMeasurements />}
      </div>
    </div>
  );
}
