"use client";

import { useRef } from "react";

import { BODY_STORY } from "@/data/story";
import { useReducedMotion, useScrollStep } from "@/lib/useScroll";

/**
 * 체형 → 맞춤 (2026-11-02 디자이너 시안). 화면이 붙잡힌 채 스크롤하면 네 장면이 차례로 바뀐다:
 *
 *   0  Various Body Types — 세 체형
 *   1  같은 사진 위에 빨간 화살표(어깨 넓이 · 허리 · 배)
 *   2  Custom Fit — 같은 세 사람이 맞춤 수트를 입은 사진
 *   3  사진이 어두워지며 설명 글
 *
 * 무대는 장면 수 × 화면 높이만큼 길고, 안쪽 한 화면이 sticky 로 붙어 있다. 장면 번호(정수)가 바뀔 때만 다시 그린다(useScrollStep).
 * 움직임 줄임 설정이면 바뀌는 것은 같고 옅어지는 연출만 뺀다.
 * 장면마다 붙는 표지(snap-start)가 있어 휠 한 번에 한 장면씩 넘어간다(메인의 SnapHome).
 * 2026-11-18 고객 요청 "사람들이 너무 작다": 원본(10614 × 5970)에서 세 사람만 남기고 잘라(x 850~9650 · y 870~5140, 무릎 위까지)
 * 2560 × 1242 로 내보낸다. 두 장을 같은 자리로 잘라 바뀔 때 사람이 튀지 않는다. 화살표는 이 사진과 같은 비율(1100 × 534)의 SVG.
 * 바탕은 사진 배경색(#090909)과 같게 — 화면 비율이 달라 사진 둘레가 남아도 경계가 보이지 않는다.
 */

const SCENES = 4;

export function BodyStory() {
  const stage = useRef<HTMLElement>(null);
  const step = useScrollStep(stage, (p) => Math.min(SCENES - 1, Math.floor(p * SCENES)));
  const reduced = useReducedMotion();
  const fade = reduced ? "" : "ease-fluid transition-opacity duration-700";

  const fit = step >= 2;
  return (
    <section ref={stage} id="body-story" aria-label="체형과 맞춤" className="relative" style={{ height: `${SCENES * 100}dvh` }}>
      {/* 장면마다 한 화면 높이 간격의 붙는 표지 — 휠 한 번에 한 장면 */}
      {Array.from({ length: SCENES }, (_, i) => (
        <span key={i} aria-hidden="true" className="absolute inset-x-0 h-px snap-start" style={{ top: `${i * 100}dvh` }} />
      ))}
      <div className="sticky top-0 flex h-[100dvh] flex-col items-center overflow-hidden bg-[#090909]">
        {/* 제목 — 두 장씩 같은 제목. 바뀔 때 겹쳐 옅어진다 */}
        <div className="relative z-10 mt-24 h-10 w-full text-center md:mt-28">
          <h2 className={`font-display text-primary absolute inset-x-0 text-2xl md:text-3xl ${fade} ${fit ? "opacity-0" : "opacity-100"}`}>
            {BODY_STORY.bodiesTitle}
          </h2>
          <h2 aria-hidden={!fit} className={`font-display text-primary absolute inset-x-0 text-2xl md:text-3xl ${fade} ${fit ? "opacity-100" : "opacity-0"}`}>
            {BODY_STORY.fitTitle}
          </h2>
        </div>

        {/* 사진 두 장(체형 · 수트)이 같은 자리에 겹쳐 있다 */}
        {/* 사진은 이미 세 사람만 남게 잘려 있어 폰에서도 화면 폭 그대로. PC 는 화면 높이를 채우도록 넓게 둔다 */}
        <div className="relative mt-6 w-full max-w-[1600px] flex-1">
          <Photo src={BODY_STORY.bodies.image} alt={BODY_STORY.bodies.alt} hint="세 체형 사진 (상의 탈의, 가로 한 장)" className={`${fade} ${fit ? "opacity-0" : "opacity-100"}`} />
          <Arrows center={!BODY_STORY.centerBodyPending} className={`${fade} ${step === 1 ? "opacity-100" : "opacity-0"}`} />
          <Arrows center={!BODY_STORY.centerBodyPending} mobile className={`${fade} ${step === 1 ? "opacity-100" : "opacity-0"}`} />
          <Photo
            src={BODY_STORY.suits.image}
            alt={BODY_STORY.suits.alt}
            hint="같은 세 사람의 맞춤 수트 사진 (가로 한 장)"
            className={`${fade} ${step === 2 ? "opacity-100" : step === 3 ? "opacity-25" : "opacity-0"}`}
          />
        </div>

        {/* ④ 설명 글 — 어두워진 사진 위 가운데 */}
        <div
          aria-hidden={step !== 3}
          className={`absolute inset-x-0 top-1/2 z-10 mx-auto max-w-[620px] -translate-y-1/2 px-6 text-center ${fade} ${step === 3 ? "opacity-100" : "opacity-0"}`}
        >
          <p className="text-secondary text-sm leading-[1.9] break-keep md:text-base">{BODY_STORY.fitBody}</p>
        </div>
      </div>
    </section>
  );
}

function Photo({ src, alt, hint, className }: { src: string | null; alt: string; hint: string; className: string }) {
  if (src) {
    // 정적 내보내기라 next/image 최적화가 없다. 세 사람이 바닥에 서 있으니 아래에 붙인다
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-contain object-center md:object-bottom ${className}`} />;
  }
  return (
    <div role="img" aria-label={alt} className={`absolute inset-x-5 inset-y-0 flex items-center justify-center rounded-t-[24px] border border-dashed border-white/15 bg-white/[0.03] ${className}`}>
      <p className="text-muted text-xs">{hint}</p>
    </div>
  );
}

/**
 * 빨간 화살표 (2026-11-18 고객 요청) — 왼쪽 사람 팔통, 가운데 사람 어깨 끝선 · 허리, 오른쪽 사람 배 라인을 따라 아래로.
 * 좌표는 잘라 낸 사진과 같은 1100 × 534 기준. 선은 화면 크기와 상관없이 1.5px(non-scaling-stroke)로 얇게, 화살촉도 작게.
 */
function Arrows({ className, center, mobile = false }: { className: string; center: boolean; mobile?: boolean }) {
  // 사진과 같은 자리 — PC 는 아래에 붙고(xMidYMax), 폰은 가운데(xMidYMid). preserveAspectRatio 는 CSS 로 못 바꿔 둘을 그리고 하나만 보인다
  const id = mobile ? "body-arrow-m" : "body-arrow";
  const line = { markerStart: `url(#${id})`, markerEnd: `url(#${id})` };
  return (
    <svg
      viewBox="0 0 1100 534"
      preserveAspectRatio={mobile ? "xMidYMid meet" : "xMidYMax meet"}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${mobile ? "md:hidden" : "max-md:hidden"} ${className}`}
    >
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="7" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9" fill="none" stroke="#C83A3A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <g fill="none" stroke="#C83A3A" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke">
        {/* 왼쪽 — 팔통(위팔) 둘레 */}
        <path d="M26 336 C38 360 70 360 82 336" vectorEffect="non-scaling-stroke" {...line} />
        {center && (
          <>
            {/* 가운데 — 어깨 끝선에서 끝선까지 */}
            <path d="M424 214 Q558 184 694 214" vectorEffect="non-scaling-stroke" {...line} />
            {/* 가운데 — 허리 */}
            <path d="M494 378 C526 404 600 404 632 378" vectorEffect="non-scaling-stroke" {...line} />
          </>
        )}
        {/* 오른쪽 — 배 라인을 따라 아래로 */}
        <path d="M896 264 C866 314 862 392 880 440" vectorEffect="non-scaling-stroke" markerEnd={`url(#${id})`} />
      </g>
    </svg>
  );
}
