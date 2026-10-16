"use client";

import { useRef } from "react";

import { Scene } from "@/components/home/Scene";
import { useReducedMotion, useScrollStep } from "@/lib/useScroll";

/**
 * 스크롤로 읽히는 선언문 — 긴 무대를 내려가는 동안 화면은 붙잡혀 있고, 낱말이 한 마디씩 밝아진다.
 * 스크롤을 멈추면 글도 멈춘다: 읽는 속도를 손님이 쥔다. 움직임을 줄인 사용자에게는 전부 밝게 보인다.
 *
 * words 는 공백으로 나눈다. 문장 끝(마침표)은 줄을 바꾼다 — 세 문장이면 세 줄.
 */
export function ScrubText({
  id,
  label,
  en,
  text,
}: {
  id: string;
  label: string;
  en: string;
  text: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const sentences = text.split(/(?<=\.)\s+/);
  const words = sentences.flatMap((s, si) =>
    s
      .split(" ")
      .map((w, wi, arr) => ({
        w,
        br: wi === arr.length - 1 && si < sentences.length - 1,
      })),
  );
  // 처음 10% 는 비워 두고(무대에 들어오는 동안), 마지막 15% 는 다 밝은 채로 머문다 — 다음 장으로 넘기기 전에 읽을 틈.
  // 밝힌 낱말 수(정수)가 바뀔 때만 다시 그린다
  const step = useScrollStep(stage, (p) =>
    Math.max(0, Math.floor(((p - 0.1) / 0.75) * (words.length + 1))),
  );
  const lit = reduced ? words.length : step;

  return (
    <Scene id={id} label={label} bare>
      <div ref={stage} style={{ height: reduced ? "auto" : "260svh" }}>
        <div
          className={`${reduced ? "py-28 md:py-44" : "sticky top-0 h-svh"} relative flex items-center overflow-hidden px-5 md:px-10`}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 30% 60%, #2a2219 0%, transparent 65%), linear-gradient(180deg, #0f0e0d 0%, #141210 100%)",
            }}
          />
          <div className="relative mx-auto w-full max-w-[1100px]">
            <p className="text-accent tracking-label text-2xs">{en}</p>
            <p
              className="font-display text-primary leading-display tracking-hero mt-8 text-3xl break-keep md:text-[3.4rem] md:leading-[1.25]"
              aria-label={text}
            >
              {words.map((x, i) => (
                <span key={i} aria-hidden="true">
                  <span
                    className="scrub-word"
                    data-lit={i < lit ? "true" : undefined}
                  >
                    {x.w}
                  </span>
                  {x.br ? <br /> : " "}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </Scene>
  );
}
