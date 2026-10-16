"use client";

import { useEffect, useRef } from "react";

import { Scene } from "@/components/home/Scene";
import { FILM } from "@/data/story";
import { useReducedMotion, useScrollProgress } from "@/lib/useScroll";

/**
 * 스크롤 필름 — 긴 무대를 내려가는 동안 화면은 붙잡혀 있고, 영상이 스크롤에 맞춰 앞뒤로 재생된다(애플 제품 페이지 방식).
 * 문장은 구간마다 하나씩 바뀐다. 영상이 없으면 자리표시 무대에서 빛이 스크롤에 따라 돈다 — 구조와 리듬은 같다.
 * 움직임을 줄인 사용자에게는 무대를 붙잡지 않고 세 문장을 차례로 펼친다.
 */
export function ScrollFilm() {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(stage);
  const reduced = useReducedMotion();
  const frames = FILM.frames;
  const active = Math.min(frames.length - 1, Math.floor(progress * frames.length));

  // 영상 위치를 스크롤에 맞춘다. 프레임마다 한 번만 — 스크롤 이벤트마다 currentTime 을 바꾸면 디코더가 밀린다
  useEffect(() => {
    const v = video.current;
    if (!v || reduced || !Number.isFinite(v.duration) || v.duration === 0) return;
    const frame = requestAnimationFrame(() => {
      v.currentTime = progress * v.duration;
    });
    return () => cancelAnimationFrame(frame);
  }, [progress, reduced]);

  if (reduced) {
    return (
      <Scene id="film" label="재단" bare>
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
    <Scene id="film" label="재단" bare>
      <div ref={stage} style={{ height: `${frames.length * 90 + 100}svh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          {FILM.video ? (
            <video
              ref={video}
              src={FILM.video}
              poster={FILM.poster ?? undefined}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <FilmPlaceholder progress={progress} />
          )}
          <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,14,13,0.9) 0%, rgba(15,14,13,0.2) 45%, transparent 70%)" }} />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1320px] items-end px-5 pb-20 md:px-10 md:pb-24">
            <div key={active} className="film-caption max-w-[36rem]" aria-live="polite">
              <p className="text-accent tracking-label text-2xs">{frames[active].eyebrow}</p>
              <h2 className="font-display text-primary leading-hero tracking-hero mt-4 text-4xl break-keep md:text-6xl">{frames[active].title}</h2>
              <p className="text-secondary mt-5 text-base leading-relaxed md:text-lg">{frames[active].body}</p>
            </div>
          </div>

          {/* 진행 — 구간 수만큼의 짧은 선, 지금 구간이 차오른다 */}
          <div aria-hidden="true" className="absolute right-5 bottom-8 z-10 flex gap-2 md:right-10">
            {frames.map((f, i) => {
              const fill = Math.min(1, Math.max(0, progress * frames.length - i));
              return (
                <span key={f.eyebrow} className="bg-strong relative block h-px w-10 overflow-hidden">
                  <span className="bg-accent absolute inset-y-0 left-0 w-full origin-left" style={{ transform: `scaleX(${fill})` }} />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Scene>
  );
}

/** 영상이 오기 전 무대 — 빛 두 개가 스크롤에 따라 돌고, 가운데 둥근 테가 천천히 커진다. 무엇을 찍어 넣을지 작게 적는다. */
function FilmPlaceholder({ progress }: { progress: number }) {
  const turn = progress * 220;
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f0e0d 0%, #171411 60%, #0f0e0d 100%)" }}>
      <div
        className="absolute inset-[-20%]"
        style={{
          transform: `rotate(${turn}deg)`,
          background:
            "radial-gradient(ellipse 30% 40% at 30% 40%, rgba(201,168,106,0.18) 0%, transparent 70%), radial-gradient(ellipse 35% 30% at 72% 62%, rgba(201,168,106,0.10) 0%, transparent 70%)",
        }}
      />
      <div
        className="border-accent/25 absolute top-1/2 left-1/2 aspect-square rounded-full border"
        style={{ width: `${38 + progress * 30}vmin`, transform: "translate(-50%, -55%)" }}
      />
      <span className="text-muted/60 tracking-label absolute top-24 right-5 text-[0.6rem] md:right-10">VIDEO · {FILM.shotHint}</span>
    </div>
  );
}
