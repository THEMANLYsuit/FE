"use client";

import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";

import { Scene } from "@/components/home/Scene";
import { Shot } from "@/components/home/Shot";
import { CLOSER } from "@/data/story";
import { progressOf, useReducedMotion, useScrollStep } from "@/lib/useScroll";

/**
 * 가까이 보기 (애플 "Take a closer look") — 2026-10-16 히어로처럼 화면에 고정하고 스크롤로 넘긴다.
 *
 * 섹션이 화면에 붙어 있는 동안 스크롤하면 라펠 → 어깨 → 단추 → 안감 → 원단 순으로 넘어가고, 사진은 그 구간 동안
 * 천천히 다가간다(확대). 왼쪽 항목을 누르면 그 장면 자리로 스크롤해 간다. 맨 끝까지 내리면 고정이 풀리고 다음 섹션으로.
 *
 * 가볍게: React 는 "지금 몇 번째" 가 바뀔 때만 다시 그린다(useScrollStep). 확대는 스크롤 때 CSS 변수 하나만 바꾼다.
 * 사진은 원래 받던 5장 그대로 — 더 받는 것이 없다. 실제 근접 영상이 생기면 히어로처럼 사진 묶음으로 바꿀 수 있다.
 * 움직임 줄이기를 켠 손님에게는 고정 없이 누르는 방식만 보인다.
 */
const N = CLOSER.length;
/** 한 장면이 차지하는 스크롤 길이(화면 높이의 %) */
const PER = 70;

export function CloserLook() {
  const reduced = useReducedMotion();
  return reduced ? <CloserStatic /> : <CloserPinned />;
}

function CloserPinned() {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const active = useScrollStep(stage, (p) => Math.min(N - 1, Math.floor(p * N)));

  // 확대 · 진행 막대 — 다시 그리지 않고 CSS 변수만 바꾼다
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const p = progressOf(stage.current) * N;
      const local = Math.min(1, Math.max(0, p - Math.min(N - 1, Math.floor(p))));
      frame.current?.style.setProperty("--closer-local", local.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /** 항목을 누르면 그 장면의 가운데 자리로 스크롤 */
  function go(i: number) {
    const el = stage.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * ((i + 0.5) / N), behavior: "smooth" });
  }

  return (
    <Scene id="closer" label="가까이" bare className="bg-band">
      <div ref={stage} style={{ height: `${N * PER + 100}svh` }}>
        <div
          ref={frame}
          className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden"
        >
          <div className="mx-auto w-full max-w-[1320px] px-5 md:px-10">
            <h2
              data-reveal
              className="font-display text-primary leading-display text-2xl md:text-5xl"
            >
              가까이 보기
            </h2>

            <div className="mt-5 grid gap-5 md:mt-12 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:items-center md:gap-14">
              {/* 폰: 위에 사진, 아래에 이름 줄 + 고른 것의 설명 / 넓은 화면: 왼쪽 목록, 오른쪽 사진 */}
              <ul className="order-2 flex flex-wrap gap-2 md:order-1 md:flex-col md:flex-nowrap md:gap-3">
                {CLOSER.map((c, i) => {
                  const on = i === active;
                  return (
                    <li key={c.key} className="md:w-full">
                      <button
                        type="button"
                        aria-current={on ? "step" : undefined}
                        onClick={() => go(i)}
                        className={`ease-fluid relative w-full overflow-hidden rounded-full text-left transition-colors duration-500 md:rounded-3xl ${
                          on
                            ? "bg-surface px-4 py-2 md:px-6 md:py-5"
                            : "hover:bg-surface/60 px-4 py-2 md:px-5 md:py-3"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border md:flex ${on ? "border-accent text-accent" : "border-strong text-secondary"}`}
                          >
                            {on ? <Minus size={11} weight="bold" /> : <Plus size={11} weight="bold" />}
                          </span>
                          <span className={`text-sm ${on ? "text-primary font-medium" : "text-secondary"}`}>
                            {c.label}
                          </span>
                        </span>
                        {on && (
                          <span className="text-secondary mt-3 hidden pl-9 text-sm leading-relaxed md:block">
                            {c.body}
                          </span>
                        )}
                        {/* 이 장면을 얼마나 지났는지 — 아래 가는 선 */}
                        {on && (
                          <span
                            aria-hidden="true"
                            className="bg-accent absolute right-4 bottom-0 left-4 h-px origin-left md:right-6 md:left-6"
                            style={{ transform: "scaleX(var(--closer-local, 0))" }}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p
                aria-live="polite"
                className="text-secondary order-3 min-h-[3.2em] text-sm leading-relaxed md:hidden"
              >
                {CLOSER[active].body}
              </p>

              <div className="relative order-1 aspect-[4/5] max-h-[52svh] w-full overflow-hidden rounded-2xl md:order-2 md:aspect-[16/11] md:max-h-[72svh] md:rounded-none">
                {CLOSER.map((c, i) => {
                  const on = i === active;
                  return (
                    <div
                      key={c.key}
                      aria-hidden={!on}
                      className={`ease-fluid absolute inset-0 transition-opacity duration-700 ${on ? "opacity-100" : "opacity-0"}`}
                    >
                      <div
                        className="h-full w-full will-change-transform"
                        style={{
                          transform: on
                            ? "scale(calc(1.02 + var(--closer-local, 0) * 0.08))"
                            : i < active
                              ? "scale(1.1)"
                              : "scale(1.02)",
                        }}
                      >
                        <Shot src={c.image} alt={`${c.label} 가까이`} hint={c.shotHint} tone={i} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

/** 움직임 줄이기 — 고정 없이, 누르면 바뀌는 원래 방식 */
function CloserStatic() {
  const [active, setActive] = useState(CLOSER[0].key);

  return (
    <Scene id="closer" label="가까이" bare className="bg-band">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-36">
        <h2 data-reveal className="font-display text-primary leading-display text-3xl md:text-5xl">
          가까이 보기
        </h2>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:items-center md:gap-14">
          <ul className="order-2 flex flex-col gap-3 md:order-1">
            {CLOSER.map((c) => {
              const on = c.key === active;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`closer-s-${c.key}`}
                    onClick={() => setActive(c.key)}
                    className={`ease-fluid w-full rounded-3xl text-left transition-colors duration-500 ${on ? "bg-surface px-6 py-5" : "hover:bg-surface/60 px-5 py-3"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${on ? "border-accent text-accent" : "border-strong text-secondary"}`}>
                        {on ? <Minus size={11} weight="bold" /> : <Plus size={11} weight="bold" />}
                      </span>
                      <span className={`text-sm ${on ? "text-primary font-medium" : "text-secondary"}`}>{c.label}</span>
                    </span>
                    <span id={`closer-s-${c.key}`} hidden={!on} className="text-secondary mt-3 block pl-9 text-sm leading-relaxed">
                      {c.body}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative order-1 aspect-[4/5] overflow-hidden md:order-2 md:aspect-[16/11]" aria-live="polite">
            {CLOSER.map((c, i) => (
              <div
                key={c.key}
                aria-hidden={c.key !== active}
                className={`absolute inset-0 ${c.key === active ? "opacity-100" : "opacity-0"}`}
              >
                <Shot src={c.image} alt={`${c.label} 가까이`} hint={c.shotHint} tone={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
