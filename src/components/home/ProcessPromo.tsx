import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { DropSection } from "@/components/home/Snap";
import { PROCESS_PROMO } from "@/data/story";
import { dropAt } from "@/lib/drop";

/**
 * 메인 셋째 화면 — 제작 순서 · 기간 (2026-11-06 확정 시안).
 * 가운데 제목 → 세로로 이어진 네 단계(채촌 · 가봉 · 점검 · 완성, 사이는 점선, 완성 앞은 화살표) → 설명 두 줄 → «예약하기».
 *
 * 2026-11-06 "순서가 마우스 휠 내리면서 또르륵 떨어지는 인터렉션": 휠로 이 화면에 붙으면 단계가 위에서부터 하나씩 떨어지고,
 * 떨어진 단계 아래로 점선이 그어진 뒤 다음 단계가 떨어진다(.drop · .drop-line, globals.css). 다시 들어오면 또 떨어진다.
 * 움직임 줄임 설정이면 처음부터 다 보인다.
 *
 * 버튼은 골드 알약(#E0C486) — 매장 화면의 «지도보기» 와 같은 색. 짙은 글자라 대비 10:1 이상.
 */
export const GOLD_PILL =
  "group ease-fluid inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#E0C486] px-7 text-sm leading-none text-[#1A1A1A] transition-[filter,transform] duration-300 hover:brightness-105 active:scale-[0.98]";

/** 단계 하나가 차지하는 떨어지는 순서 칸 — 단계 · 점선 · (쉼). 점선이 다 그어질 즈음 다음 단계가 떨어진다 */
const STEP_SLOTS = 3;

export function ProcessPromo() {
  const p = PROCESS_PROMO;
  const last = p.steps.length - 1;
  const after = 1 + last * STEP_SLOTS + 2; // 마지막 단계 다음
  return (
    <DropSection label="제작 순서와 기간" className="flex items-center bg-black">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center px-5 py-24 text-center md:py-16">
        <h2 style={dropAt(0)} className="drop text-primary text-xl font-semibold leading-snug break-keep md:text-[28px]">
          {p.title}
        </h2>

        <ol aria-label="제작 순서" className="mt-12 flex w-full flex-col items-center md:mt-20">
          {p.steps.map((s, k) => (
            <li key={s.name} className="relative flex w-full flex-col items-center">
              <span
                style={dropAt(1 + k * STEP_SLOTS)}
                className="drop relative z-10 flex h-10 w-40 items-center justify-center rounded-full bg-[#38342A] text-[15px] font-semibold text-[#F2EFE8] md:w-[10rem] md:text-base"
              >
                {k > 0 && <span className="sr-only">다음, </span>}
                {s.name}
              </span>
              {s.note && (
                <p style={dropAt(1 + k * STEP_SLOTS)} className="drop relative z-10 mt-2.5 text-xs text-[#D6D3CC] break-keep">
                  {s.note}
                </p>
              )}
              {/* 다음 단계까지 점선 — 단계 아래에서 시작해 작은 글 뒤를 지나 다음 단계 위에서 끝난다. 완성 앞은 화살표 */}
              {k < last && (
                <span
                  aria-hidden="true"
                  style={dropAt(2 + k * STEP_SLOTS)}
                  className="drop-line pointer-events-none absolute top-10 bottom-0 left-1/2 w-0 -translate-x-1/2 border-l border-dotted border-white/40"
                >
                  {k === last - 1 && (
                    <svg viewBox="0 0 10 8" className="absolute -bottom-1 left-1/2 h-2 w-2.5 -translate-x-1/2 fill-white/45">
                      <path d="M0 0h10L5 8z" />
                    </svg>
                  )}
                </span>
              )}
              {/* 단계 사이 간격 — 마지막 칸(완성 앞)은 화살표 자리만큼 조금 더 */}
              {k < last && <span aria-hidden="true" className={`block ${k === last - 1 ? "h-10" : "h-7"}`} />}
            </li>
          ))}
        </ol>

        <div className="text-primary mt-14 flex flex-col gap-3 text-[15px] leading-relaxed break-keep md:mt-24 md:gap-4 md:text-[17px]">
          <p style={dropAt(after)} className="drop">{p.body}</p>
          <p style={dropAt(after + 1)} className="drop">
            {p.period.before}
            <b className="font-bold">{p.period.strong}</b>
            {p.period.after}
          </p>
        </div>

        <div style={dropAt(after + 2)} className="drop mt-8 md:mt-10">
          {/* 시안의 큰 알약 — GOLD_PILL 과 색 · 움직임은 같고 크기만 크다(클래스를 덧붙이면 h-11 · h-12 가 부딪혀 따로 적는다) */}
          <Link
            href="/booking/"
            className="group ease-fluid inline-flex h-12 min-w-[13.5rem] items-center justify-center gap-3 rounded-full bg-[#E0C486] px-8 text-base font-semibold leading-none text-[#1A1A1A] transition-[filter,transform] duration-300 hover:brightness-105 active:scale-[0.98] "
          >
            예약하기
            <ArrowRight size={20} weight="regular" aria-hidden="true" className="ease-fluid transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </DropSection>
  );
}
