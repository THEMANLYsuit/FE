import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { ProcessScene } from "@/components/home/ProcessScene";
import { Scene } from "@/components/home/Scene";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SHOP } from "@/data/business";
import { getFabrics, won } from "@/lib/catalog";

/**
 * 메인 — 풀스크린 장면이 이어지는 한 편의 필름 (2026-10-14 "풀 히어로 · 풀스크롤 애니메이션").
 *
 *   1 히어로      화면 전체 사진(지금은 잉크 그라데이션 자리) · 큰 표제 · 상담 예약
 *   2 약속        왜 맞춤인가 — 세 문장이 차례로 떠오른다
 *   3 과정        붙잡힌 무대에서 여섯 단계가 스크롤에 따라 켜진다 (ProcessScene)
 *   4 원단        관리자가 등록한 원단이 가로로 흐르고, 카드가 나타난다 (빌드 때 API 에서)
 *   5 예약        마지막 한 화면 — 매장 · 시간 · 상담 예약 버튼
 * 장면 연출은 components/home/Scene + globals.css(.scene · [data-reveal] · .scene-bg).
 * 사진이 아직 없다 — 촬영본이 오면 각 장면의 .scene-bg 자리(그라데이션)에 넣는다. TODO(고객확인) 촬영본
 */
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

export default async function Home() {
  const fabrics = await getFabrics();
  const names = fabrics.map((f) => f.name);
  return (
    <>
      <Header overHero />
      <main id="main" className="film flex-1">
        {/* ── 1 히어로 ─────────────────────────────────────── */}
        <Scene label="THE MANLY 맞춤정장" className="flex items-end">
          <div
            aria-hidden="true"
            className="hero-bg absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 65% 35%, #3a2f22 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, #1f1a15 0%, transparent 60%), linear-gradient(180deg, #0f0e0d 0%, #171411 55%, #0f0e0d 100%)",
            }}
          />
          <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,14,13,0.92) 0%, rgba(15,14,13,0.35) 45%, transparent 70%)" }} />

          <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-20 md:px-10 md:pb-28">
            <p data-reveal className="text-accent tracking-label text-2xs">BESPOKE TAILORING · SUWON</p>
            <h1 data-reveal style={delay(150)} className="font-display text-primary leading-hero tracking-hero mt-5 text-hero break-keep">
              당신의 몸에 맞춰
              <br />
              <em className="text-accent-deep not-italic">짓는</em> 한 벌
            </h1>
            <p data-reveal style={delay(300)} className="text-secondary mt-7 max-w-[44ch] text-base leading-relaxed md:text-lg">
              기성복이 맞지 않는 어깨와 허벅지를 위해, 상담에서 수령까지 여섯 번을 만납니다. 치수는 기록으로 남아 다음 한 벌이 더 쉬워집니다.
            </p>
            <div data-reveal style={delay(450)} className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/booking/"
                className="group bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-2 text-sm transition-all duration-500 hover:-translate-y-px active:scale-[0.98] md:h-14 md:pl-7"
              >
                상담 예약
                <span className="bg-on-accent/12 flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 group-hover:translate-x-1">
                  <ArrowUpRight size={13} weight="light" aria-hidden="true" />
                </span>
              </Link>
              <Link href="/process/" className="text-secondary hover:text-primary tracking-button ease-fluid inline-flex h-12 items-center text-sm underline underline-offset-8 transition-colors duration-300">
                제작 과정 보기
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="scroll-cue text-muted tracking-label absolute right-5 bottom-8 hidden flex-col items-center text-[0.65rem] md:right-10 md:flex">
            SCROLL
            <ArrowDown size={10} weight="light" className="mt-1" />
          </div>
        </Scene>

        {/* ── 2 약속 ───────────────────────────────────────── */}
        <Scene label="약속" className="bg-band flex items-center">
          <div aria-hidden="true" className="scene-bg absolute inset-0 opacity-70" style={{ background: "radial-gradient(ellipse 50% 70% at 80% 50%, #2a2219 0%, transparent 65%)" }} />
          <div className="relative mx-auto grid w-full max-w-[1320px] gap-12 px-5 py-24 md:grid-cols-3 md:gap-10 md:px-10">
            {[
              ["01", "치수로 시작합니다", "사진이 아니라 스물네 곳의 치수와 체형 메모에서 한 벌이 시작됩니다. 운동으로 바뀐 몸도 그대로 담습니다."],
              ["02", "가봉에서 고칩니다", "가봉 상태로 입어 보고, 서고 앉고 팔을 들며 맞지 않는 곳을 표시합니다. 완성 뒤에 후회하지 않도록."],
              ["03", "기록이 남습니다", "치수와 선택은 회원 기록으로 남습니다. 두 번째 한 벌은 상담 한 번으로 시작합니다."],
            ].map(([n, t, b], i) => (
              <div key={n} data-reveal style={delay(i * 180)} className="border-subtle border-t pt-6">
                <p className="font-display text-accent text-xl">{n}</p>
                <h2 className="font-display text-primary leading-display mt-4 text-2xl md:text-3xl">{t}</h2>
                <p className="text-secondary mt-4 text-sm leading-relaxed md:text-base">{b}</p>
              </div>
            ))}
          </div>
        </Scene>

        {/* ── 3 과정 ───────────────────────────────────────── */}
        <ProcessScene />

        {/* ── 4 원단 ───────────────────────────────────────── */}
        <Scene id="fabrics" label="원단" className="flex items-center">
          <div aria-hidden="true" className="scene-bg absolute inset-0" style={{ background: "linear-gradient(160deg, #141210 0%, #1d1813 50%, #0f0e0d 100%)" }} />
          <div className="relative w-full py-24">
            <div className="mx-auto max-w-[1320px] px-5 md:px-10">
              <p data-reveal className="text-accent tracking-label text-2xs">FABRICS</p>
              <h2 data-reveal style={delay(120)} className="font-display text-primary leading-display mt-3 text-3xl md:text-4xl">
                손으로 만져 보고 고르는 원단
              </h2>
            </div>
            {names.length > 0 && (
              <div aria-hidden="true" className="mt-10 overflow-hidden">
                <div className="marquee font-display text-muted/60 text-3xl whitespace-nowrap md:text-5xl">
                  {[...names, ...names].map((n, i) => (
                    <span key={i}>{n}</span>
                  ))}
                </div>
              </div>
            )}
            <ul className="mx-auto mt-10 grid max-w-[1320px] gap-px px-5 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
              {fabrics.slice(0, 4).map((f, i) => (
                <li key={f.code} data-reveal style={delay(200 + i * 120)} className="bg-surface/70 border-subtle border p-6">
                  <div className="bg-band aspect-[4/3] w-full" style={f.imageUrl ? { backgroundImage: `url(${f.imageUrl})`, backgroundSize: "cover" } : undefined} />
                  <p className="text-muted tracking-label text-2xs mt-5">{f.mill}</p>
                  <h3 className="font-display text-primary mt-1 text-xl">{f.name}</h3>
                  <p className="text-secondary mt-1 text-xs">{f.composition}{f.weightGsm ? ` · ${f.weightGsm}g` : ""}</p>
                  <p className="text-accent mt-3 text-sm tabular-nums">{f.soldOut ? "품절" : won(f.priceFromKrw)}</p>
                </li>
              ))}
            </ul>
            <div className="mx-auto mt-8 max-w-[1320px] px-5 md:px-10">
              <Link href="/fabrics/" className="text-secondary hover:text-accent tracking-button ease-fluid inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-8 transition-colors duration-300">
                원단 전체 보기 <ArrowUpRight size={13} weight="light" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Scene>

        {/* ── 5 예약 ───────────────────────────────────────── */}
        <Scene label="상담 예약" className="flex items-center">
          <div aria-hidden="true" className="scene-bg absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 55% at 50% 45%, #3a2f22 0%, #0f0e0d 70%)" }} />
          <div className="relative mx-auto w-full max-w-[1320px] px-5 py-24 text-center md:px-10">
            <p data-reveal className="text-accent tracking-label text-2xs">BOOKING</p>
            <h2 data-reveal style={delay(120)} className="font-display text-primary leading-display mt-4 text-4xl md:text-hero md:leading-hero">
              첫 상담은 한 시간이면 충분합니다
            </h2>
            <p data-reveal style={delay(240)} className="text-secondary mx-auto mt-6 max-w-[40ch] text-sm leading-relaxed md:text-base">
              수원 영통 매장 · {SHOP.hours} · {SHOP.closedDays}. 빈 시간을 골라 신청하시면 확인 뒤 메일로 확정해 드립니다.
            </p>
            <div data-reveal style={delay(360)} className="mt-10">
              <Link
                href="/booking/"
                className="group bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid inline-flex h-14 items-center gap-3 rounded-full pl-8 pr-2 text-sm transition-all duration-500 hover:-translate-y-px active:scale-[0.98]"
              >
                빈 시간 보기
                <span className="bg-on-accent/12 flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-500 group-hover:translate-x-1">
                  <ArrowUpRight size={13} weight="light" aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>
        </Scene>
      </main>
      <Footer />
    </>
  );
}
