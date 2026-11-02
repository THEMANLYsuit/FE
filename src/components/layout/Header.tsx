"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { READY_TO_WEAR_URL } from "@/data/business";
import { me, type CurrentUser } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";
import { useScrolledPast } from "@/lib/useScroll";

/**
 * 전역 헤더 — 2026-11-02 디자이너 시안: 왼쪽 위 엠블럼, 오른쪽 위 햄버거 하나.
 *
 * 더맨리는 레오네페리토보다 뎁스가 얇다. 메뉴는 셋뿐이다 — 상담 & 문의 · 렌탈 · 기성복(레오네페리토로 나감).
 * 햄버거를 누르면 화면이 어두워지며 그 셋이 뜬다. Esc · 어두운 바깥 · 닫기 버튼으로 닫는다.
 * 로그인 · 내 예약은 메뉴 아래 작은 줄로만 둔다(예약 · 대여를 확인할 길은 있어야 한다).
 *
 * 헤더 띠는 메인처럼 첫 화면이 풀스크린이면 투명하고(overHero · film), 그 밖의 페이지는 잉크 유리로 굳는다.
 */
const MENU = [
  {
    href: "/contact/",
    label: "상담 & 문의",
    en: "CONSULTATION",
    // 상담 예약과 글 문의는 따로 있다 — 큰 줄은 문의, 아래 작은 줄로 둘 다
    subs: [
      { href: "/booking/", label: "상담 예약" },
      { href: "/contact/", label: "문의하기" },
    ],
  },
  { href: "/rental/", label: "렌탈", en: "RENTAL" },
  { href: READY_TO_WEAR_URL, label: "기성복", en: "READY-TO-WEAR · LEONE FERITO", external: true },
] as const;

/** film — 메인처럼 모든 장면이 풀스크린일 때 끝까지 투명. overHero — 첫 화면만 투명. */
export function Header({ overHero = false, film = false }: { overHero?: boolean; film?: boolean }) {
  const scrolled = useScrolledPast(0.6);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!API_CONNECTED) return;
    let alive = true;
    me().then((u) => alive && setUser(u)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // 열려 있는 동안 뒤 페이지가 스크롤되지 않게, Esc 로 닫히게. 열면 첫 메뉴로, 닫으면 햄버거로 초점을 돌려준다
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      root.style.overflow = before;
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const solid = !open && !film && (!overHero || scrolled);
  return (
    <>
      <header
        className={`ease-fluid fixed inset-x-0 top-0 z-[60] transition-[background-color,border-color,backdrop-filter] duration-700 ${
          solid ? "border-subtle bg-page/85 border-b backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
          <Link href="/" onClick={() => setOpen(false)} className="text-primary flex h-11 items-center" aria-label="THE MANLY 홈">
            <Emblem />
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            className="text-primary -mr-2.5 flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
          >
            <span className={`ease-fluid block h-px w-5 bg-current transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`ease-fluid block h-px w-5 bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`ease-fluid block h-px w-5 bg-current transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {/* 어두워진 화면 + 메뉴 셋. 닫혀 있을 때는 inert — 보이지 않는 링크에 Tab 이 들어가지 않게 */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        inert={!open}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className={`ease-fluid fixed inset-0 z-[55] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav aria-label="주 메뉴" className="w-full max-w-[560px]">
          <ul className="flex flex-col">
            {MENU.map((m, i) => {
              const external = "external" in m && m.external;
              const body = (
                <>
                  <span className="flex flex-col gap-1.5">
                    <span className="text-primary text-2xl md:text-3xl">{m.label}</span>
                    <span className="text-muted tracking-label text-2xs">{m.en}</span>
                  </span>
                  <ArrowUpRight size={18} weight="light" aria-hidden="true" className="text-muted group-hover:text-accent ease-fluid shrink-0 transition-colors duration-300" />
                </>
              );
              const cls = "group flex min-h-20 items-center justify-between gap-6 py-5";
              return (
                <li
                  key={m.href}
                  style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
                  className={`border-subtle ease-fluid border-b transition-[opacity,transform] duration-500 first:border-t ${
                    open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                >
                  {external ? (
                    <a href={m.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={cls}>
                      {body}
                      <span className="sr-only">(새 창)</span>
                    </a>
                  ) : (
                    <Link href={m.href} ref={i === 0 ? firstLinkRef : undefined} onClick={() => setOpen(false)} className={cls}>
                      {body}
                    </Link>
                  )}
                  {"subs" in m && (
                    <p className="-mt-2 flex gap-5 pb-5">
                      {m.subs.map((s) => (
                        <Link key={s.href} href={s.href} onClick={() => setOpen(false)} className="text-secondary hover:text-accent ease-fluid inline-flex min-h-11 items-center text-xs transition-colors duration-300">
                          {s.label}
                        </Link>
                      ))}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <Link
            href={user ? "/mypage/" : "/login/"}
            onClick={() => setOpen(false)}
            className="text-muted hover:text-primary ease-fluid mt-8 inline-flex min-h-11 items-center text-xs transition-colors duration-300"
          >
            {user ? `${user.name} 님 · 내 예약` : "로그인 · 내 예약"}
          </Link>
        </nav>
      </div>

      {/* 오른쪽 아래 «?» — 어느 화면에서든 상담 · 문의로 (시안). 메뉴가 열리면 숨는다 */}
      <Link
        href="/contact/"
        aria-label="상담 · 문의"
        className={`text-primary hover:border-accent hover:text-accent ease-fluid fixed right-5 bottom-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-black/40 text-lg backdrop-blur-sm transition-[opacity,color,border-color] duration-300 md:right-8 md:bottom-8 ${
          open ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        ?
      </Link>
    </>
  );
}

/**
 * 엠블럼 자리. TODO(고객확인) 디자이너의 방패 엠블럼 파일(SVG)이 오면 이 자리를 그 파일로 바꾼다 —
 * 지금은 크기 · 위치를 맞추는 자리표시(방패 윤곽 + TM).
 */
function Emblem() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden="true" className="text-accent">
      <path d="M14 1.5 26 6v10.5c0 7-5.2 11.6-12 14-6.8-2.4-12-7-12-14V6L14 1.5Z" stroke="currentColor" strokeWidth="1.2" />
      <text x="14" y="19.5" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="serif" letterSpacing="0.5">
        TM
      </text>
    </svg>
  );
}
