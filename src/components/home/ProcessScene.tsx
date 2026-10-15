"use client";

import { useRef } from "react";

import { Scene } from "@/components/home/Scene";
import { PROCESS } from "@/data/process";
import { useReducedMotion, useScrollProgress } from "@/lib/useScroll";

/**
 * 제작 과정 장면 — 긴 무대(단계 수 × 60vh)를 스크롤하는 동안 화면은 붙잡혀 있고(sticky), 진행 막대가 차오르며
 * 단계가 하나씩 켜진다. 번호 · 제목이 왼쪽에 쌓이고, 지금 단계의 설명이 오른쪽에 바뀐다.
 * 움직임을 줄인 사용자에게는 여섯 단계를 한 번에 펼친다.
 */
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

export function ProcessScene() {
  const stage = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(stage);
  const reduced = useReducedMotion();
  const active = Math.min(PROCESS.length - 1, Math.floor(progress * PROCESS.length));
  const step = PROCESS[active];

  return (
    <Scene id="process" label="제작 과정" bare>
      <div ref={stage} style={{ height: reduced ? "auto" : `${PROCESS.length * 60 + 100}svh` }}>
        <div className={`${reduced ? "" : "sticky top-0 h-svh"} flex flex-col justify-center overflow-hidden px-5 py-16 md:px-10 md:py-24`}>
          <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 70% at 85% 30%, #2a2219 0%, transparent 60%), linear-gradient(180deg, #0f0e0d 0%, #16130f 100%)" }} />
          {!reduced && (
            <span key={step.key} aria-hidden="true" className="step-numeral font-display text-accent pointer-events-none absolute right-[-0.05em] bottom-[-0.1em] text-[38vw] leading-none opacity-[0.06] select-none md:text-[26rem]">
              {String(active + 1).padStart(2, "0")}
            </span>
          )}
          <div className="relative mx-auto w-full max-w-[1320px]">
            <p data-reveal className="text-accent tracking-label text-2xs">PROCESS</p>
            <h2 data-reveal style={delay(120)} className="font-display text-primary leading-display tracking-hero mt-3 text-3xl md:text-5xl">
              한 벌이 되기까지, 여섯 번의 만남
            </h2>

            <div data-reveal style={delay(240)} className="bg-strong relative mt-8 h-px w-full md:mt-10">
              <div className="process-track bg-accent absolute inset-y-0 left-0 w-full" style={{ "--progress": reduced ? 1 : progress } as React.CSSProperties} />
            </div>

            <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
              <ol className="flex flex-col gap-2 md:gap-3">
                {PROCESS.map((s, i) => {
                  const on = reduced || i <= active;
                  const now = !reduced && i === active;
                  return (
                    <li key={s.key} className={`ease-fluid flex items-baseline gap-4 transition-opacity duration-500 md:gap-5 ${on ? "opacity-100" : "opacity-30"}`}>
                      <span className={`font-display text-base tabular-nums md:text-xl ${now ? "text-accent" : "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                      <span className={`font-display ease-fluid transition-[font-size,color] duration-500 ${now ? "text-primary text-2xl md:text-4xl" : "text-secondary text-lg md:text-2xl"}`}>
                        {s.title}
                      </span>
                      <span className="text-muted tracking-label ml-auto hidden text-2xs md:block">{s.en}</span>
                    </li>
                  );
                })}
              </ol>

              {reduced ? (
                <dl className="flex flex-col gap-6">
                  {PROCESS.map((s) => (
                    <div key={s.key}>
                      <dt className="text-primary font-medium">
                        {s.title} · <span className="text-muted text-sm font-normal">{s.duration}</span>
                      </dt>
                      <dd className="text-secondary mt-1 text-sm">{s.body}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div key={step.key} className="border-subtle md:border-l md:pl-12">
                  <p className="text-muted tracking-label text-2xs">
                    {step.en} · {step.duration}
                  </p>
                  <p className="text-primary mt-3 text-base leading-relaxed md:mt-4 md:text-xl" aria-live="polite">
                    {step.body}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
