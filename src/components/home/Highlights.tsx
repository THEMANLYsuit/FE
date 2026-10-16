"use client";

import { CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";

import { Scene } from "@/components/home/Scene";
import { Shot } from "@/components/home/Shot";
import { HIGHLIGHTS } from "@/data/story";
import { useReducedMotion } from "@/lib/useScroll";

/**
 * 하이라이트 — 가로로 넘기는 큰 카드(애플 "Get the highlights"). 손가락 · 트랙패드로 밀거나, 점 · 화살표를 누른다.
 * 6초마다 다음 카드로 넘어가고 일시정지 버튼이 있다(WCAG 2.2.2 — 움직이는 것은 멈출 수 있어야 한다).
 * 손님이 직접 넘기거나 카드 위에 있으면 자동 넘김을 멈춘다. 움직임을 줄인 사용자는 처음부터 멈춰 있다.
 */
const INTERVAL = 6000;

export function Highlights() {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  // 화면에 보일 때만 자동으로 넘긴다 — 안 보이는 데서 넘어가 있으면 내려왔을 때 3번째 카드부터 보인다
  const playing = !paused && !hovering && !reduced && visible;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** 카드 i 의 왼쪽이 제목 줄과 맞는 스크롤 위치 — 줄의 왼쪽 여백(padding)만큼 덜 민다 */
  function leftOf(el: HTMLElement, i: number) {
    const card = el.children[i] as HTMLElement | undefined;
    if (!card) return 0;
    return card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft);
  }

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: leftOf(el, i), behavior: reduced ? "auto" : "smooth" });
  }

  // 자동 넘김 — 마지막 다음은 처음으로
  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => go((active + 1) % HIGHLIGHTS.length), INTERVAL);
    return () => window.clearTimeout(t);
    // go 는 렌더마다 새로 만들어지지만 ref 만 읽는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, playing]);

  function onScroll() {
    const el = track.current;
    if (!el) return;
    let best = 0;
    for (let i = 1; i < el.children.length; i++) {
      if (Math.abs(leftOf(el, i) - el.scrollLeft) < Math.abs(leftOf(el, best) - el.scrollLeft)) best = i;
    }
    if (best !== active) setActive(best);
  }

  return (
    <Scene id="highlights" label="한눈에" bare>
      <div className="py-24 md:py-36">
        <div className="mx-auto flex max-w-[1320px] items-end justify-between gap-6 px-5 md:px-10">
          <div>
            <p data-reveal className="text-accent tracking-label text-2xs">HIGHLIGHTS</p>
            <h2 data-reveal className="font-display text-primary leading-display mt-3 text-3xl md:text-5xl">
              한 벌이 지어지는 동안
            </h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button type="button" aria-label="이전 카드" onClick={() => go(Math.max(0, active - 1))} disabled={active === 0} className="border-interactive text-secondary hover:border-accent hover:text-primary ease-fluid flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 disabled:opacity-30">
              <CaretLeft size={16} weight="light" />
            </button>
            <button type="button" aria-label="다음 카드" onClick={() => go(Math.min(HIGHLIGHTS.length - 1, active + 1))} disabled={active === HIGHLIGHTS.length - 1} className="border-interactive text-secondary hover:border-accent hover:text-primary ease-fluid flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 disabled:opacity-30">
              <CaretRight size={16} weight="light" />
            </button>
          </div>
        </div>

        <div
          ref={track}
          onScroll={onScroll}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={() => setHovering(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label="하이라이트"
          className="highlights-track mt-10 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto scroll-smooth px-5 pb-2 md:mt-14 md:scroll-pl-[max(2.5rem,calc((100vw-1320px)/2+2.5rem))] md:gap-6 md:px-[max(2.5rem,calc((100vw-1320px)/2+2.5rem))]"
        >
          {HIGHLIGHTS.map((h, i) => (
            <article
              key={h.title}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${HIGHLIGHTS.length}`}
              className="bg-surface relative aspect-[4/5] w-[82vw] shrink-0 snap-start overflow-hidden md:aspect-[16/10] md:w-[min(64vw,980px)]"
            >
              <Shot src={h.image} alt={h.title} hint={h.shotHint} tone={i} />
              <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,14,13,0.75) 0%, transparent 45%)" }} />
              <div className="absolute top-0 left-0 max-w-[30rem] p-6 md:p-10">
                <h3 className="font-display text-primary text-2xl leading-snug md:text-4xl">{h.title}</h3>
                <p className="text-secondary mt-3 text-sm leading-relaxed md:text-base">{h.body}</p>
              </div>
            </article>
          ))}
        </div>

        {/* 점 + 일시정지 — 애플처럼 아래 가운데 알약 하나 */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="bg-surface border-subtle flex h-11 items-center gap-2 rounded-full border px-4">
            {HIGHLIGHTS.map((h, i) => (
              <button
                key={h.title}
                type="button"
                aria-label={`${i + 1}번 카드 — ${h.title}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => {
                  setPaused(true);
                  go(i);
                }}
                className="flex h-8 items-center"
              >
                <span className={`ease-fluid block h-1.5 rounded-full transition-all duration-500 ${i === active ? "bg-primary w-6" : "bg-strong hover:bg-muted w-1.5"}`} />
              </button>
            ))}
          </div>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "자동 넘김 다시 시작" : "자동 넘김 멈춤"}
              className="bg-surface border-subtle text-secondary hover:text-primary ease-fluid flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300"
            >
              {paused ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}
            </button>
          )}
        </div>
      </div>
    </Scene>
  );
}
