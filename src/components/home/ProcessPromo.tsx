import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { DropSection } from "@/components/home/Snap";
import { PROCESS_PROMO } from "@/data/story";
import { dropAt } from "@/lib/drop";

/**
 * 메인 셋째 화면 — 제작 순서 · 기간 (2026-11-02 디자이너 시안).
 * 왼쪽 세로 사진, 오른쪽 제목 · 순서 · 기간 · «예약하기», 그 아래 렌탈 안내 · «렌탈». 화면에 들어오면 위에서 차례로 떨어진다.
 * 버튼은 골드 알약(#E0C486) — 매장 화면의 «지도보기» 와 같은 색. 짙은 글자라 대비 10:1 이상.
 */
export const GOLD_PILL =
  "group ease-fluid inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#E0C486] px-7 text-sm leading-none text-[#1A1A1A] transition-[filter,transform] duration-300 hover:brightness-105 active:scale-[0.98]";

export function ProcessPromo() {
  const p = PROCESS_PROMO;
  return (
    <DropSection label="제작 순서와 기간" className="flex items-center bg-black">
      {/* PC: 사진 높이를 화면 높이에 맞춘다(헤더 · 위아래 여백을 뺀 만큼, 최대 640px) — 낮은 노트북 화면에서도 한 화면에 든다 */}
      <div className="mx-auto grid w-full max-w-[1100px] items-center gap-10 px-5 py-24 md:grid-cols-[auto_minmax(0,1fr)] md:gap-16 md:px-10 md:py-20">
        <div style={dropAt(0)} className="drop relative aspect-[4/5] w-full overflow-hidden md:h-[min(calc(100dvh-10rem),640px)] md:w-auto bg-[radial-gradient(ellipse_at_50%_40%,#6E1420_0%,#3A0A12_60%,#140608_100%)]">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.alt} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <p className="absolute inset-x-0 bottom-6 text-center text-xs text-white/60">세로 사진 자리 (4:5)</p>
          )}
        </div>

        <div className="flex flex-col">
          <h2 style={dropAt(1)} className="drop text-primary text-xl font-semibold leading-snug break-keep md:text-2xl">
            {p.title}
          </h2>
          <div className="text-secondary mt-6 flex flex-col gap-3 text-sm leading-relaxed">
            <p style={dropAt(2)} className="drop">{p.lead}</p>
            <p style={dropAt(3)} className="drop text-primary">
              {p.steps.map((s, i) => (
                <span key={s}>
                  {i > 0 && <span aria-hidden="true" className="text-[#E0C486]"> → </span>}
                  {i > 0 && <span className="sr-only">, 다음 </span>}
                  {s}
                </span>
              ))}
            </p>
            <p style={dropAt(4)} className="drop break-keep">{p.body}</p>
          </div>
          <div style={dropAt(5)} className="drop mt-8">
            <Link href="/booking/" className={GOLD_PILL}>
              예약하기
              <ArrowRight size={14} weight="regular" aria-hidden="true" className="ease-fluid transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <p style={dropAt(6)} className="drop text-secondary mt-14 text-sm">{p.rentalNote}</p>
          <div style={dropAt(7)} className="drop mt-4">
            <Link href="/rental/" className={GOLD_PILL}>
              렌탈
              <ArrowRight size={14} weight="regular" aria-hidden="true" className="ease-fluid transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </DropSection>
  );
}
