"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr";

import { MAIN_HERO } from "@/data/story";
import { useReducedMotion } from "@/lib/useScroll";

/**
 * 메인 첫 화면 — 풀스크린 영상 하나(2026-11-02 디자이너 시안 "영상 삽입 예정") + 아래 가운데 스크롤 안내.
 * 영상은 소리 없이 반복. 움직임 줄임 설정이면 영상 대신 정지 사진(poster). 둘 다 없으면 자리표시.
 */
export function MainHero() {
  const reduced = useReducedMotion();
  const { video, poster } = MAIN_HERO;
  return (
    <section aria-label="THE MANLY" className="relative flex h-[100dvh] items-center justify-center overflow-hidden bg-black">
      <h1 className="sr-only">THE MANLY 맞춤정장</h1>
      {video && !reduced ? (
        <video src={video} poster={poster ?? undefined} autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <p className="text-primary text-xl font-medium md:text-2xl">영상 삽입 예정</p>
      )}

      <a href="#body-story" className="text-secondary hover:text-primary ease-fluid absolute bottom-8 left-1/2 flex min-h-11 -translate-x-1/2 flex-col items-center gap-1 transition-colors duration-300">
        <span className="tracking-label text-2xs">SCROLL</span>
        <CaretDown size={16} weight="light" aria-hidden="true" className={reduced ? "" : "animate-bounce"} />
      </a>
    </section>
  );
}
