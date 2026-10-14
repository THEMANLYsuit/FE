"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 메인의 장면 하나. 화면에 충분히 들어오면 data-active="true" 가 붙고 [data-reveal] 자식이 순서대로 나타난다
 * (globals.css [data-scene]). 한 번 켜지면 다시 숨기지 않는다 — 위로 올라갔다 내려와도 깜빡이지 않게.
 * 스크롤 구동 배경(.scene-bg)은 CSS 가 맡는다. 이 컴포넌트는 "언제 켤지" 만 안다.
 *
 * bare: 한 화면 크기 · 스냅 · overflow 숨김(.scene)을 붙이지 않는다 — 제작 과정처럼 화면보다 긴 무대를 sticky 로 쓰는 장면용
 * (overflow:hidden 인 조상 안에서는 sticky 가 멈춘다).
 */
export function Scene({ id, className = "", children, label, bare = false }: { id?: string; className?: string; children: ReactNode; label?: string; bare?: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.dataset.motion !== "on") return;
    // 기준은 "화면의 40%". 장면이 화면보다 훨씬 길면 장면 기준 40% 는 영영 못 채우므로 화면 기준으로 환산한다
    const threshold = Math.min(0.4, (window.innerHeight * 0.4) / Math.max(1, el.offsetHeight));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.active = "true";
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} aria-label={label} data-scene="" className={`${bare ? "relative" : "scene"} ${className}`}>
      {children}
    </section>
  );
}
