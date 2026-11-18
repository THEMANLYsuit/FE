"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { READY_TO_WEAR_URL } from "@/data/business";
import { useScrolledPast } from "@/lib/useScroll";

/**
 * 전역 헤더 — 2026-11-02 디자이너 시안: 왼쪽 위 엠블럼, 오른쪽 위 햄버거 하나.
 *
 * 더맨리는 레오네페리토보다 뎁스가 얇다. 메뉴는 셋뿐이다 — 상담 & 문의 · 렌탈 · 기성복(레오네페리토로 나감).
 * 햄버거를 누르면 화면이 검게 덮이고 가운데에 그 셋이 글자로만 뜬다(2026-11-18 시안 — 상담 & 문의만 골드, 나머지는 회색 ·
 * 올리면 골드). Esc · 빈 곳 · 햄버거로 닫는다. 오른쪽 아래 «?» 는 메뉴가 열려도 그대로 둔다(시안).
 *
 * 헤더 띠는 메인처럼 첫 화면이 풀스크린이면 투명하고(overHero · film), 그 밖의 페이지는 잉크 유리로 굳는다.
 */
const MENU = [
  { href: "/contact/", label: "상담 & 문의", primary: true },
  { href: "/rental/", label: "렌탈" },
  { href: READY_TO_WEAR_URL, label: "기성복", external: true },
] as const;

/** film — 메인처럼 모든 장면이 풀스크린일 때 끝까지 투명. overHero — 첫 화면만 투명. */
export function Header({ overHero = false, film = false }: { overHero?: boolean; film?: boolean }) {
  const scrolled = useScrolledPast(0.6);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

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

      {/* 검은 화면 + 가운데 메뉴 셋. 닫혀 있을 때는 inert — 보이지 않는 링크에 Tab 이 들어가지 않게 */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        inert={!open}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className={`ease-fluid fixed inset-0 z-[55] flex items-center justify-center bg-[#000000] px-6 transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav aria-label="주 메뉴">
          <ul className="flex flex-col items-center gap-4 md:gap-5">
            {MENU.map((m, i) => {
              const external = "external" in m && m.external;
              const cls = `ease-fluid inline-flex min-h-11 items-center px-4 text-lg font-medium tracking-[-0.01em] transition-colors duration-300 hover:text-accent focus-visible:text-accent md:text-xl ${
                "primary" in m && m.primary ? "text-accent" : "text-muted"
              }`;
              return (
                <li
                  key={m.href}
                  style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
                  className={`ease-fluid transition-[opacity,transform] duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                >
                  {external ? (
                    <a href={m.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={cls}>
                      {m.label}
                      <span className="sr-only">(새 창 · 레오네페리토)</span>
                    </a>
                  ) : (
                    <Link href={m.href} ref={i === 0 ? firstLinkRef : undefined} onClick={() => setOpen(false)} className={cls}>
                      {m.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* 오른쪽 아래 «?» — 어느 화면에서든 상담 · 문의로 (시안). 메뉴가 열려도 보인다 */}
      <Link
        href="/contact/"
        onClick={() => setOpen(false)}
        aria-label="상담 · 문의"
        className="text-primary hover:border-accent hover:text-accent ease-fluid fixed right-5 bottom-5 z-[56] flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-black/40 text-lg backdrop-blur-sm transition-[color,border-color] duration-300 md:right-8 md:bottom-8"
      >
        ?
      </Link>
    </>
  );
}

/**
 * 엠블럼 — 고객 로고 파일(자료 모음집 › 더 멘리 로고, 골드)을 웹용으로 줄인 것(public/brand/logo).
 * 링크 이름(aria-label)이 따로 있어 사진은 꾸밈(alt="")이다.
 */
function Emblem() {
  // 정적 내보내기라 next/image 최적화가 없다
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/logo/emblem-gold.webp" alt="" width={240} height={250} className="h-10 w-auto md:h-12" />;
}
