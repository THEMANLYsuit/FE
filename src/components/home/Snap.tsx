"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** 휠 한 번으로 친다 — 화면이 옮겨 가는 동안과, 그 뒤 휠이 잠잠해질 때까지는 더 넘기지 않는다(트랙패드 관성) */
const SETTLE_MS = 800;
const QUIET_MS = 180;

/**
 * 메인의 «한 번 스크롤에 한 화면» (2026-11-02 디자이너 "스크롤 한 번 하면 또르륵 떨어지는 인터렉션").
 * 메인에 있는 동안만 html 에 .snap-home 을 붙인다 — 다른 페이지는 보통 스크롤이다(globals.css).
 *
 * 터치는 브라우저의 붙는 스크롤(scroll-snap)에 맡긴다. 휠은 한 칸이 화면보다 훨씬 짧아 제자리로 되돌아가곤 해서,
 * 휠을 직접 받아 다음(이전) 표지로 부드럽게 옮긴다. 표지는 .snap-start(위에 붙음) · .snap-end(아래에 붙음) 요소다.
 * 한 화면보다 긴 구간(낮은 화면 · 폰 가로)은 건너뛰지 않고 한 화면 높이씩 내려 읽는다.
 * 메뉴가 열려 뒤 스크롤이 잠겨 있거나, 움직임 줄임 설정이면 손대지 않는다.
 */
export function SnapHome() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("snap-home");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => root.classList.remove("snap-home");
    }

    let busyUntil = 0;
    let lastWheel = 0;
    let lastTarget: number | null = null;
    let startedAt = 0;
    const points = () =>
      [...document.querySelectorAll<HTMLElement>(".snap-start, .snap-end")]
        .map((el) => {
          const r = el.getBoundingClientRect();
          return Math.round(el.classList.contains("snap-end") ? r.bottom + window.scrollY - window.innerHeight : r.top + window.scrollY);
        })
        .filter((y, i, all) => y >= 0 && all.indexOf(y) === i)
        .sort((a, b) => a - b);

    const onWheel = (e: WheelEvent) => {
      if (root.style.overflow === "hidden" || e.ctrlKey || Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      const now = performance.now();
      const quiet = now - lastWheel > QUIET_MS;
      lastWheel = now;
      if (now < busyUntil || !quiet) return;
      const list = points();
      // 앞 이동이 아직 덜 끝났으면(부드러운 스크롤 중) 지금 위치가 아니라 그 목표에서 센다 — 같은 화면으로 두 번 가지 않게
      const y = lastTarget !== null && now - startedAt < 1500 ? lastTarget : window.scrollY;
      const next = e.deltaY > 0 ? list.find((p) => p > y + 2) : [...list].reverse().find((p) => p < y - 2);
      if (next === undefined) return;
      // 다음 표지가 한 화면보다 멀면 — 지금 구간이 화면보다 길다. 아래(위) 내용을 건너뛰지 않게 한 화면만 옮긴다
      const h = window.innerHeight;
      const target = Math.abs(next - y) > h + 2 ? y + Math.sign(next - y) * h : next;
      busyUntil = now + SETTLE_MS;
      lastTarget = target;
      startedAt = now;
      window.scrollTo({ top: target, behavior: "smooth" });
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      root.classList.remove("snap-home");
    };
  }, []);
  return null;
}

/**
 * 한 화면짜리 구간. 절반 넘게 보이면 data-in="true" — 안의 .drop 들이 위에서 차례로 떨어진다(style={{"--i": n}} 순서).
 * 벗어나면 되돌려 두어 다시 들어올 때 또 떨어진다.
 */
export function DropSection({ id, label, className = "", children }: { id?: string; label: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} aria-label={label} data-drop data-in={inView} className={`min-h-[100dvh] snap-start ${className}`}>
      {children}
    </section>
  );
}
