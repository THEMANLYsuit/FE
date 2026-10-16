"use client";

import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, type ReactNode } from "react";

import { Scene } from "@/components/home/Scene";
import { FILM } from "@/data/story";
import { progressOf, useReducedMotion, useScrollStep } from "@/lib/useScroll";

/**
 * 스크롤 필름 = 메인의 첫 화면 (2026-10-16 "히어로부터 진행" — 애플 제품 페이지처럼 첫 화면이 곧 영상의 시작).
 *
 * 긴 무대를 내려가는 동안 화면은 붙잡혀 있고, 장면이 스크롤에 맞춰 앞뒤로 움직인다. 구간은 1 + 문장 수:
 *   첫 구간   히어로(hero) — 큰 표제 · 상담 예약 · 목차. 장면은 첫 장에 멈춰 있다가 내리면 움직이기 시작한다
 *   다음부터  문장 하나씩(FILM.frames)
 *
 * <b>영상이 아니라 사진 묶음을 캔버스에 그린다</b>(2026-10-16 "너무 렉"). 영상의 currentTime 을 스크롤마다 바꾸면 브라우저가
 * 매번 영상을 다시 풀어서 끊긴다 — 애플도 같은 이유로 사진 묶음을 쓴다. 사진은 미리 받아 두고, 스크롤 핸들러가 rAF 안에서
 * 캔버스에 바로 그린다. React 는 구간이 바뀔 때만 다시 그린다(useScrollStep) — 진행 막대도 ref 로 직접 칠한다.
 *
 * 히어로는 사라질 때 언마운트하지 않고 투명하게만 한다(다시 올라오면 그대로). 움직임을 줄인 사용자에게는 무대를 붙잡지 않고
 * 정지 사진 위에 히어로, 그 아래 문장들을 펼친다.
 */
export function ScrollFilm({ hero }: { hero: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();
  const frames = FILM.frames;
  const phases = frames.length + 1;
  const phase = useScrollStep(stage, (p) => Math.min(phases - 1, Math.floor(p * phases)));
  const onHero = phase === 0;
  const active = phase - 1;
  const seq = FILM.sequence;

  useEffect(() => {
    if (reduced) return;
    const el = stage.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el) return;

    // 사진 묶음 — 첫 장은 바로, 나머지는 차례로 받는다. 아직 안 온 장은 가장 가까운 받은 장으로 그린다
    const images: (HTMLImageElement | null)[] = seq ? new Array(seq.count).fill(null) : [];
    let alive = true;
    let drawn = -1;
    let frame = 0;

    const src = (i: number) => `${seq!.base}${String(i + 1).padStart(seq!.pad, "0")}${seq!.ext}`;
    const nearestLoaded = (i: number) => {
      for (let d = 0; d < images.length; d++) {
        if (images[i - d]?.complete) return images[i - d]!;
        if (images[i + d]?.complete) return images[i + d]!;
      }
      return null;
    };

    function size() {
      if (!cv) return;
      // 레티나에서도 1.5배까지만 — 사진이 1280 이라 그 이상은 무게만 늘고 선명해지지 않는다
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      drawn = -1;
    }

    function draw(i: number) {
      if (!ctx || !cv) return;
      const img = images[i]?.complete ? images[i]! : nearestLoaded(i);
      if (!img || !img.naturalWidth) return;
      // object-fit: cover — 화면 비율에 맞게 가운데를 잘라 그린다(폰은 세로로 가운데)
      const scale = Math.max(cv.width / img.naturalWidth, cv.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
      drawn = i;
    }

    function update() {
      frame = 0;
      const p = progressOf(el);
      if (seq) {
        const i = Math.min(seq.count - 1, Math.round(p * (seq.count - 1)));
        if (i !== drawn) draw(i);
      }
      // 진행 막대 — 문장 구간(둘째 구간부터)만큼 차오른다. 렌더 없이 직접 칠한다
      bars.current.forEach((bar, k) => {
        if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p * phases - 1 - k))})`;
      });
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      size();
      update();
    };

    if (seq) {
      size();
      const load = (i: number) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = img.onerror = () => {
            images[i] = img;
            resolve();
          };
          img.src = src(i);
        });
      // 첫 장 → 그리기 → 나머지는 여섯 장씩 나눠 받는다(한 번에 120개를 걸면 첫 화면 사진 · 글꼴이 밀린다)
      load(0).then(async () => {
        if (!alive) return;
        update();
        for (let i = 1; i < seq.count && alive; i += 6) {
          await Promise.all(Array.from({ length: Math.min(6, seq.count - i) }, (_, k) => load(i + k)));
          if (alive && drawn !== -1) update();
        }
      });
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, seq, phases]);

  const shade = (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ background: "linear-gradient(to top, rgba(15,14,13,0.94) 0%, rgba(15,14,13,0.35) 50%, rgba(15,14,13,0.15) 75%, transparent 100%)" }}
    />
  );

  if (reduced) {
    return (
      <Scene id="film" label="THE MANLY 맞춤정장" bare>
        <div className="relative flex min-h-svh items-end overflow-hidden">
          <Backdrop src={FILM.still ?? FILM.poster} />
          {shade}
          <div className="relative z-10 w-full">{hero}</div>
        </div>
        <div className="mx-auto flex max-w-[1100px] flex-col gap-16 px-5 py-28 md:px-10 md:py-40">
          {frames.map((f) => (
            <div key={f.eyebrow}>
              <p className="text-accent tracking-label text-2xs">{f.eyebrow}</p>
              <h2 className="font-display text-primary leading-display mt-3 text-3xl md:text-5xl">{f.title}</h2>
              <p className="text-secondary mt-4 max-w-[46ch] text-base leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </Scene>
    );
  }

  return (
    <Scene id="film" label="THE MANLY 맞춤정장" bare>
      <div ref={stage} style={{ height: `${phases * 90 + 100}svh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* 첫 장이 그려지기 전에도 비어 보이지 않게 — 정지 사진(또는 잉크) 위에 캔버스를 얹는다 */}
          <Backdrop src={FILM.poster} />
          {seq && <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />}
          {shade}

          {/* 히어로 — 첫 구간에만 보인다. 사라져도 자리를 지킨다(투명 · 클릭 막음) */}
          <div
            aria-hidden={!onHero}
            inert={!onHero}
            className={`ease-fluid absolute inset-x-0 bottom-0 z-10 transition-[opacity,transform] duration-700 ${onHero ? "opacity-100" : "pointer-events-none -translate-y-6 opacity-0"}`}
          >
            {hero}
          </div>

          {/* 문장 — 둘째 구간부터. 구간이 바뀌면 key 가 바뀌어 다시 떠오른다 */}
          {!onHero && (
            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1320px] items-end px-5 pb-20 md:px-10 md:pb-24">
              <div key={active} className="film-caption max-w-[36rem]" aria-live="polite">
                <p className="text-accent tracking-label text-2xs">{frames[active].eyebrow}</p>
                <h2 className="font-display text-primary leading-hero tracking-hero mt-4 text-4xl break-keep md:text-6xl">{frames[active].title}</h2>
                <p className="text-secondary mt-5 text-base leading-relaxed md:text-lg">{frames[active].body}</p>
              </div>
            </div>
          )}

          {/* 히어로에서는 "내려 보세요", 그다음부터는 문장 수만큼의 진행 선 */}
          <div
            aria-hidden="true"
            className={`scroll-cue text-muted tracking-label absolute right-5 bottom-8 z-10 hidden flex-col items-center text-[0.65rem] md:right-10 ${onHero ? "md:flex" : ""}`}
          >
            SCROLL
            <ArrowDown size={10} weight="light" className="mt-1" />
          </div>
          <div aria-hidden="true" className={`absolute right-5 bottom-8 z-10 flex gap-2 md:right-10 ${onHero ? "invisible" : ""}`}>
            {frames.map((f, i) => (
              <span key={f.eyebrow} className="bg-strong relative block h-px w-10 overflow-hidden">
                <span
                  ref={(node) => {
                    bars.current[i] = node;
                  }}
                  className="bg-accent absolute inset-y-0 left-0 w-full origin-left"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}

/** 정지 사진(첫 장 전 · 움직임 줄임) — 있으면 사진, 없으면 잉크 그라데이션 + 무엇을 찍어 넣을지 */
function Backdrop({ src }: { src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- 정적 내보내기라 next/image 최적화가 없다
    return <img src={src} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 50% at 35% 40%, rgba(201,168,106,0.16) 0%, transparent 70%), linear-gradient(180deg, #0f0e0d 0%, #171411 60%, #0f0e0d 100%)" }}>
      <span className="text-muted/60 tracking-label absolute top-24 right-5 text-[0.6rem] md:right-10">VIDEO · {FILM.shotHint}</span>
    </div>
  );
}
