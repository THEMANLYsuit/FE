import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Line } from "@/components/home/Line";
import { ProcessScene } from "@/components/home/ProcessScene";
import { Scene } from "@/components/home/Scene";
import { SceneDots } from "@/components/home/SceneDots";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SHOP } from "@/data/business";
import { getFabrics, won } from "@/lib/catalog";

/**
 * 메인 — 장면 전부가 풀 히어로다 (2026-10-15 "페이지 전체를 풀 히어로로").
 *
 * 다섯 장면이 한 화면씩, 화면 끝까지 사진(지금은 그라데이션 자리) 위에 큰 표제 하나와 짧은 글 — 카드 · 표 없이.
 * 글자 자리를 장면마다 옮겨 같은 모양이 반복되지 않게 한다: 왼쪽 아래 → 오른쪽 위 → 붙잡힌 무대 → 가운데 목록 → 가운데.
 *
 *   1 히어로   왼쪽 아래 · 큰 표제 · 상담 예약
 *   2 약속     오른쪽 위 표제, 왼쪽 아래 세 줄 — 왜 맞춤인가
 *   3 과정     붙잡힌 무대 — 여섯 단계가 스크롤에 따라 켜진다 (ProcessScene)
 *   4 원단     원단 이름이 화면을 채우는 큰 목록 (빌드 때 API 에서)
 *   5 예약     마지막 한 화면 — 매장 · 시간 · 상담 예약
 *
 * 헤더는 끝까지 투명하고(film), 장면 위쪽 그라데이션(.scene::before)이 글자를 받친다.
 * 연출은 components/home/Scene + globals.css(.scene · [data-reveal] · .scene-bg). TODO(고객확인) 촬영본
 */
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

const PROMISES = [
  ["01", "치수로 시작합니다", "스물네 곳의 치수와 체형 메모에서 한 벌이 시작됩니다."],
  ["02", "가봉에서 고칩니다", "입어 보고, 서고 앉으며 맞지 않는 곳을 표시합니다."],
  ["03", "기록이 남습니다", "두 번째 한 벌은 상담 한 번으로 시작합니다."],
] as const;

const cta =
  "group bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-2 text-sm transition-all duration-500 hover:-translate-y-px active:scale-[0.98] md:h-14 md:pl-7";
const ctaIcon = "bg-on-accent/12 flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 group-hover:translate-x-1";

export default async function Home() {
  const fabrics = await getFabrics();
  return (
    <>
      <Header film />
      <div aria-hidden="true" className="page-progress" />
      <SceneDots />
      <main id="main" className="film flex-1">
        {/* ── 1 히어로 — 왼쪽 아래 ───────────────────────────── */}
        <Scene label="THE MANLY 맞춤정장" className="flex items-end">
          <div
            aria-hidden="true"
            className="hero-bg absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 65% 35%, #3a2f22 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, #1f1a15 0%, transparent 60%), linear-gradient(180deg, #0f0e0d 0%, #171411 55%, #0f0e0d 100%)",
            }}
          />
          <div aria-hidden="true" className="hero-glow absolute inset-0" style={{ background: "radial-gradient(ellipse 35% 40% at 70% 30%, rgba(201,168,106,0.16) 0%, transparent 70%)" }} />
          <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,14,13,0.92) 0%, rgba(15,14,13,0.35) 45%, transparent 70%)" }} />

          <div className="scene-text relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-20 md:px-10 md:pb-28">
            <p data-reveal className="text-accent tracking-label text-2xs">BESPOKE TAILORING · SUWON</p>
            <h1 className="font-display text-primary leading-hero tracking-hero mt-5 text-hero break-keep">
              <Line>당신의 몸에 맞춰</Line>
              <Line i={1}>
                <em className="text-accent-deep not-italic">짓는</em> 한 벌
              </Line>
            </h1>
            <p data-reveal style={delay(300)} className="text-secondary mt-7 max-w-[44ch] text-base leading-relaxed md:text-lg">
              기성복이 맞지 않는 어깨와 허벅지를 위해, 상담에서 수령까지 여섯 번을 만납니다.
            </p>
            <div data-reveal style={delay(450)} className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/booking/" className={cta}>
                상담 예약
                <span className={ctaIcon}>
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

        {/* ── 2 약속 — 표제는 오른쪽 위, 세 줄은 왼쪽 아래 ───────── */}
        <Scene label="약속" className="flex items-end">
          <div aria-hidden="true" className="scene-bg absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 65% at 25% 40%, #2d251b 0%, transparent 65%), linear-gradient(200deg, #171411 0%, #0f0e0d 100%)" }} />
          <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,14,13,0.85) 0%, transparent 55%)" }} />

          <div className="scene-text relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-20 md:px-10 md:pb-28">
            <div className="md:ml-auto md:max-w-[26ch] md:text-right">
              <p data-reveal className="text-accent tracking-label text-2xs">WHY BESPOKE</p>
              <h2 className="font-display text-primary leading-hero tracking-hero mt-5 text-4xl break-keep md:text-hero">
                <Line>사진이 아니라</Line>
                <Line i={1}>몸으로 고릅니다</Line>
              </h2>
            </div>
            <ol className="mt-12 grid gap-6 md:mt-20 md:max-w-[60%] md:grid-cols-3 md:gap-8">
              {PROMISES.map(([n, t, b], i) => (
                <li key={n} data-reveal style={delay(300 + i * 150)} className="border-strong border-t pt-4">
                  <p className="font-display text-accent text-lg">{n}</p>
                  <h3 className="font-display text-primary mt-2 text-xl md:text-2xl">{t}</h3>
                  <p className="text-secondary mt-2 text-sm leading-relaxed">{b}</p>
                </li>
              ))}
            </ol>
          </div>
        </Scene>

        {/* ── 3 과정 — 붙잡힌 무대 ───────────────────────────── */}
        <ProcessScene />

        {/* ── 4 원단 — 이름이 화면을 채운다 ─────────────────────── */}
        <Scene id="fabrics" label="원단" className="flex items-center">
          <div aria-hidden="true" className="scene-bg absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 100%, #2a2219 0%, transparent 60%), linear-gradient(180deg, #0f0e0d 0%, #1a1612 100%)" }} />
          <div aria-hidden="true" className="absolute inset-x-0 top-24 overflow-hidden opacity-20 md:top-28">
            <div className="marquee font-display text-muted text-2xl whitespace-nowrap md:text-4xl">
              {[...fabrics, ...fabrics].map((f, i) => (
                <span key={i}>{f.mill}</span>
              ))}
            </div>
          </div>
          <div className="scene-text relative z-10 mx-auto w-full max-w-[1320px] px-5 py-24 md:px-10">
            <p data-reveal className="text-accent tracking-label text-2xs text-center">FABRICS</p>
            <ul className="mt-8 flex flex-col items-center md:mt-10">
              {fabrics.slice(0, 5).map((f, i) => (
                <li key={f.code} data-reveal style={delay(120 + i * 110)} className="w-full">
                  <Link
                    href="/fabrics/"
                    className="group border-subtle hover:border-accent ease-fluid flex items-baseline justify-between gap-4 border-b py-4 transition-colors duration-500 md:py-5"
                  >
                    <span className="font-display text-primary group-hover:text-accent-deep ease-fluid text-3xl transition-[color,transform] duration-500 group-hover:translate-x-2 md:text-5xl">
                      {f.name}
                    </span>
                    <span className="text-muted shrink-0 text-right text-xs md:text-sm">
                      <span className="hidden md:inline">{f.mill} · </span>
                      {f.soldOut ? "품절" : won(f.priceFromKrw)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div data-reveal style={delay(700)} className="mt-8 text-center">
              <Link href="/fabrics/" className="text-secondary hover:text-accent tracking-button ease-fluid inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-8 transition-colors duration-300">
                원단 전체 보기 <ArrowUpRight size={13} weight="light" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Scene>

        {/* ── 5 예약 — 가운데 ────────────────────────────────── */}
        <Scene label="상담 예약" className="flex items-center">
          <div aria-hidden="true" className="scene-bg absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 55% at 50% 45%, #3a2f22 0%, #0f0e0d 70%)" }} />
          <div className="scene-text relative z-10 mx-auto w-full max-w-[1320px] px-5 py-24 text-center md:px-10">
            <p data-reveal className="text-accent tracking-label text-2xs">BOOKING</p>
            <h2 className="font-display text-primary leading-hero tracking-hero mt-5 text-4xl break-keep md:text-hero">
              <Line>첫 상담은</Line>
              <Line i={1}>한 시간이면 충분합니다</Line>
            </h2>
            <p data-reveal style={delay(240)} className="text-secondary mx-auto mt-7 max-w-[40ch] text-sm leading-relaxed md:text-base">
              수원 영통 매장 · {SHOP.hours} · {SHOP.closedDays}. 빈 시간을 골라 신청하시면 확인 뒤 메일로 확정해 드립니다.
            </p>
            <div data-reveal style={delay(360)} className="mt-10">
              <Link href="/booking/" className={cta}>
                빈 시간 보기
                <span className={ctaIcon}>
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
