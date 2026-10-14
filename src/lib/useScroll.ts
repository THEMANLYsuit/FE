"use client";

import { useSyncExternalStore, type RefObject } from "react";

/**
 * 스크롤 · 환경 상태를 useSyncExternalStore 로 읽는다.
 * effect 안에서 setState 를 부르면 React 19 린트(set-state-in-effect)가 막고, 첫 렌더 값이 한 프레임 늦는다 —
 * 외부 저장소로 읽으면 서버 스냅샷(false · 0)으로 그리고 클라이언트에서 바로 맞춘다.
 */

const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  window.addEventListener("resize", cb);
  // 새로고침으로 중간에 열렸을 때 첫 스크롤 전에도 한 번 맞춘다
  const frame = requestAnimationFrame(cb);
  return () => {
    window.removeEventListener("scroll", cb);
    window.removeEventListener("resize", cb);
    cancelAnimationFrame(frame);
  };
};

/** 화면 높이의 fraction 배만큼 내려갔는가 — 투명 헤더가 굳는 시점 */
export function useScrolledPast(fraction: number): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > window.innerHeight * fraction,
    () => false,
  );
}

/** 긴 무대(ref)를 지나는 동안 0 → 1. 무대 높이에서 화면 높이를 뺀 만큼이 구간이다. 소수 셋째 자리까지만 — 매 픽셀 다시 그리지 않게 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  return useSyncExternalStore(
    subscribeScroll,
    () => {
      const el = ref.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      if (range <= 0) return 0;
      return Math.round(Math.min(1, Math.max(0, -rect.top / range)) * 1000) / 1000;
    },
    () => 0,
  );
}

const REDUCED = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const media = window.matchMedia(REDUCED);
      media.addEventListener("change", cb);
      return () => media.removeEventListener("change", cb);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}
