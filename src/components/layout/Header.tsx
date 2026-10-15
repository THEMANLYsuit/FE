"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { me, type CurrentUser } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";
import { useScrolledPast } from "@/lib/useScroll";

/**
 * 전역 헤더 — 메인의 풀스크린 장면 위에 떠 있다가(투명), 첫 화면을 지나면 잉크 유리 바로 굳는다.
 * 내비는 넷뿐이다: 원단 · 과정 · 상담 예약 · 내 예약(로그인). 맞춤정장은 둘러볼 상품이 없다 — 상담으로 보내는 게 헤더의 일이다.
 */
const NAV = [
  { href: "/fabrics/", label: "FABRICS", ko: "원단" },
  { href: "/process/", label: "PROCESS", ko: "제작 과정" },
  { href: "/booking/", label: "BOOKING", ko: "상담 예약" },
];

/** film — 메인처럼 모든 장면이 풀스크린일 때. 끝까지 투명하고 메뉴를 열 때만 굳는다. overHero — 첫 화면만 투명. */
export function Header({ overHero = false, film = false }: { overHero?: boolean; film?: boolean }) {
  const scrolled = useScrolledPast(0.6);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!API_CONNECTED) return;
    let alive = true;
    me().then((u) => alive && setUser(u)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const solid = open || (!film && (!overHero || scrolled));
  return (
    <header
      className={`ease-fluid fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700 ${
        solid ? "border-subtle bg-base/85 border-b backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
        <Link href="/" className="font-display text-primary text-xl tracking-[0.22em] md:text-2xl" aria-label="THE MANLY 홈">
          THE MANLY
        </Link>

        <nav aria-label="주 메뉴" className="hidden items-center gap-10 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-secondary hover:text-accent tracking-label ease-fluid text-2xs transition-colors duration-300">
              {n.label}
            </Link>
          ))}
          <Link
            href={user ? "/mypage/" : "/login/"}
            className="border-interactive text-primary hover:border-accent hover:text-accent tracking-label ease-fluid inline-flex h-10 items-center rounded-full border px-5 text-2xs transition-colors duration-300"
          >
            {user ? `${user.name} 님` : "LOGIN"}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className="text-primary flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className={`ease-fluid block h-px w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`ease-fluid block h-px w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="모바일 메뉴" className="border-subtle border-t px-5 py-4 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-primary flex min-h-12 items-center justify-between text-sm">
              <span>{n.ko}</span>
              <span className="text-muted tracking-label text-2xs">{n.label}</span>
            </Link>
          ))}
          <Link href={user ? "/mypage/" : "/login/"} onClick={() => setOpen(false)} className="text-accent flex min-h-12 items-center text-sm">
            {user ? `${user.name} 님 · 내 예약` : "로그인"}
          </Link>
        </nav>
      )}
    </header>
  );
}
