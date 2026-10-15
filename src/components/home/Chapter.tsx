import type { ReactNode } from "react";

import { Line } from "@/components/home/Line";
import { Scene } from "@/components/home/Scene";

/**
 * 이야기의 장(章) — 빅 히어로 다음에 이어지는 스크롤 스토리텔링의 한 단락 (2026-10-15 "빅히어로 + 스크롤 스토리텔링").
 *
 * 왼쪽은 장 번호 · 표제가 화면에 붙잡혀 있고(sticky), 오른쪽 내용이 그 옆을 흘러 지나간다.
 * 풀스크린 한 장면이 아니라 읽는 길이만큼 길어진다 — 그래서 bare Scene(스냅 · 한 화면 고정 없음).
 * 오른쪽 항목은 .scrub-in 을 달면 스크롤에 따라 하나씩 밝아진다(globals.css).
 */
export function Chapter({
  id,
  n,
  en,
  label,
  title,
  children,
  className = "",
}: {
  id: string;
  /** "01" 처럼 두 자리 */
  n: string;
  en: string;
  /** 장면 점 · 챕터 표시에 쓰는 짧은 이름 */
  label: string;
  /** 표제 줄들 — 줄마다 <Line> 으로 감싼다 */
  title: ReactNode[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <Scene id={id} label={label} bare className={`chapter ${className}`}>
      <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-5 py-28 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-20 md:px-10 md:py-44">
        <header className="md:sticky md:top-32 md:self-start">
          <p data-reveal className="text-accent tracking-label text-2xs">
            <span className="font-display text-lg tabular-nums">{n}</span>
            <span
              className="mx-3 inline-block h-px w-8 translate-y-[-0.25em] bg-current opacity-60"
              aria-hidden="true"
            />
            {en}
          </p>
          <h2 className="font-display text-primary leading-hero tracking-hero mt-6 text-4xl break-keep md:text-hero">
            {title.map((t, i) => (
              <Line key={i} i={i}>
                {t}
              </Line>
            ))}
          </h2>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </Scene>
  );
}
