import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Chapter } from "@/components/home/Chapter";
import { CloserLook } from "@/components/home/CloserLook";
import { Highlights } from "@/components/home/Highlights";
import { Line } from "@/components/home/Line";
import { ProcessScene } from "@/components/home/ProcessScene";
import { Scene } from "@/components/home/Scene";
import { SceneDots } from "@/components/home/SceneDots";
import { ScrollFilm } from "@/components/home/ScrollFilm";
import { ScrubText } from "@/components/home/ScrubText";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SHOP } from "@/data/business";
import { getFabrics, won } from "@/lib/catalog";

/**
 * 메인 — 빅 히어로 하나 + 스크롤 스토리텔링 (2026-10-15 "빅히어로 타입 + 스크롤 스토리텔링 형식으로").
 * 2026-10-16 "더맨리 영상처럼" — 애플 제품 페이지식 장치 셋을 더했다: 스크롤 필름(ScrollFilm) · 하이라이트 카드(Highlights) ·
 * 가까이 보기(CloserLook). 사진 · 영상 자리는 data/story.ts 에 주소만 넣으면 바뀐다.
 *
 * 첫 화면만 풀스크린 히어로다. 그 다음은 슬라이드처럼 한 장씩 넘기는 게 아니라, 한 편의 글을 내려 읽듯
 * 다섯 장(章)이 이어진다 — 스냅 없이, 읽는 길이만큼. 장마다 연출이 다르다:
 *
 *   히어로     큰 표제 · 켄 번스 배경 · 아래에 목차(다섯 장)
 *   01 몸      표제가 왼쪽에 붙잡혀 있고, 세 가지 약속이 스크롤에 따라 하나씩 밝아진다 (Chapter + .scrub-in)
 *   02 과정    붙잡힌 무대 — 여섯 단계가 스크롤에 따라 켜진다 (ProcessScene)
 *   03 기록    선언문 — 낱말이 스크롤에 따라 한 마디씩 읽힌다 (ScrubText)
 *   04 원단    원단 이름이 큰 글자로 흘러 지나간다
 *   05 만남    마지막 한 화면 — 상담 예약
 *
 * 헤더는 히어로 위에서만 투명하고(overHero) 내려가면 잉크 유리로 굳는다. 오른쪽 점은 장 번호 · 이름을 보여 준다(SceneDots).
 * TODO(고객확인) 촬영본 — 지금 배경은 그라데이션 자리
 */
const delay = (ms: number) =>
  ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

const CHAPTERS = [
  ["01", "몸", "#body"],
  ["02", "한눈에", "#highlights"],
  ["03", "과정", "#process"],
  ["04", "가까이", "#closer"],
  ["05", "기록", "#record"],
  ["06", "원단", "#fabrics"],
  ["07", "만남", "#booking"],
] as const;

const PROMISES = [
  [
    "01",
    "치수로 시작합니다",
    "스물네 곳의 치수와 체형 메모에서 한 벌이 시작됩니다. 어깨의 기울기, 등의 둥글기처럼 숫자 밖의 것도 적습니다.",
  ],
  [
    "02",
    "가봉에서 고칩니다",
    "입어 보고, 서고 앉으며 맞지 않는 곳을 표시합니다. 사진이 아니라 몸으로 확인합니다.",
  ],
  [
    "03",
    "기록이 남습니다",
    "치수와 선택은 기록으로 남습니다. 두 번째 한 벌은 상담 한 번으로 시작합니다.",
  ],
] as const;

const MANIFESTO =
  "기성복은 평균을 위해 만들어집니다. 당신의 어깨는 평균이 아닙니다. 그래서 우리는 치수를 재고, 가봉에서 고치고, 기록을 남깁니다.";

const cta =
  "group bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-2 text-sm transition-all duration-500 hover:-translate-y-px active:scale-[0.98] md:h-14 md:pl-7";
const ctaIcon =
  "bg-on-accent/12 flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 group-hover:translate-x-1";

export default async function Home() {
  const fabrics = await getFabrics();
  return (
    <>
      <Header overHero />
      <div aria-hidden="true" className="page-progress" />
      <SceneDots />
      <main id="main" className="story flex-1">
        {/* ── 히어로 = 스크롤 필름의 첫 화면 ─────────────────────────
            맨 위에서 내리기 시작하면 영상이 재생되고, 표제는 사라지며 문장이 하나씩 떠오른다 (ScrollFilm) */}
        <ScrollFilm
          hero={
            <div className="mx-auto w-full max-w-[1320px] px-5 pb-24 md:px-10 md:pb-14">
              <p data-reveal className="text-accent tracking-label text-2xs">
                BESPOKE TAILORING · SUWON
              </p>
              <h1 className="font-display text-primary leading-hero tracking-hero mt-5 text-hero break-keep">
                <Line>당신의 몸에 맞춰</Line>
                <Line i={1}>
                  <em className="text-accent-deep not-italic">짓는</em> 한 벌
                </Line>
              </h1>
              <p
                data-reveal
                style={delay(300)}
                className="text-secondary mt-7 max-w-[44ch] text-base leading-relaxed md:text-lg"
              >
                기성복이 맞지 않는 어깨와 허벅지를 위해, 상담에서 수령까지 여섯
                번을 만납니다.
              </p>
              <div
                data-reveal
                style={delay(450)}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link href="/booking/" className={cta}>
                  상담 예약
                  <span className={ctaIcon}>
                    <ArrowUpRight size={13} weight="light" aria-hidden="true" />
                  </span>
                </Link>
                <Link
                  href="/process/"
                  className="text-secondary hover:text-primary tracking-button ease-fluid inline-flex h-12 items-center text-sm underline underline-offset-8 transition-colors duration-300"
                >
                  제작 과정 보기
                </Link>
              </div>

              {/* 목차 — 이 아래로 이어지는 장들. 누르면 그 장으로 */}
              <nav
                aria-label="목차"
                data-reveal
                style={delay(700)}
                className="border-subtle mt-14 border-t pt-5 md:mt-20"
              >
                <ol className="flex flex-wrap gap-x-8 gap-y-2 md:gap-x-12">
                  {CHAPTERS.map(([n, name, href]) => (
                    <li key={n}>
                      <a
                        href={href}
                        className="group text-muted hover:text-accent ease-fluid inline-flex min-h-8 items-baseline gap-2 text-xs transition-colors duration-300"
                      >
                        <span className="font-display tabular-nums">{n}</span>
                        <span className="tracking-label text-2xs">{name}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          }
        />

        {/* ── 01 몸 — 표제는 붙잡히고, 약속이 하나씩 밝아진다 ───────── */}
        <Chapter
          id="body"
          n="01"
          en="THE BODY"
          label="몸"
          title={["사진이 아니라", "몸으로 고릅니다"]}
        >
          <ol className="flex flex-col">
            {PROMISES.map(([n, t, b]) => (
              <li
                key={n}
                className="scrub-in border-strong border-t py-10 first:border-t-0 first:pt-0 md:py-14 md:first:pt-0"
              >
                <p className="font-display text-accent text-lg tabular-nums">
                  {n}
                </p>
                <h3 className="font-display text-primary mt-3 text-2xl md:text-4xl">
                  {t}
                </h3>
                <p className="text-secondary mt-4 max-w-[48ch] text-base leading-relaxed md:text-lg">
                  {b}
                </p>
              </li>
            ))}
          </ol>
        </Chapter>

        {/* ── 02 한눈에 — 가로로 넘기는 하이라이트 카드 ──────────────── */}
        <Highlights />

        {/* ── 03 과정 — 붙잡힌 무대 ───────────────────────────── */}
        <ProcessScene />

        {/* ── 04 가까이 — 목록을 고르면 큰 사진이 바뀐다 ──────────────── */}
        <CloserLook />

        {/* ── 05 기록 — 선언문 ─────────────────────────────────── */}
        <ScrubText
          id="record"
          label="기록"
          en="05 — THE RECORD"
          text={MANIFESTO}
        />

        {/* ── 06 원단 — 이름이 흘러 지나간다 ─────────────────────── */}
        <Chapter
          id="fabrics"
          n="06"
          en="FABRICS"
          label="원단"
          title={["손으로 만져", "고르는 원단"]}
          className="relative"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-10 overflow-hidden opacity-15 md:top-16"
          >
            <div className="marquee font-display text-muted text-2xl whitespace-nowrap md:text-4xl">
              {[...fabrics, ...fabrics].map((f, i) => (
                <span key={i}>{f.mill}</span>
              ))}
            </div>
          </div>
          <ul className="relative flex flex-col">
            {fabrics.slice(0, 5).map((f) => (
              <li key={f.code} className="scrub-in w-full">
                <Link
                  href="/fabrics/"
                  className="group border-subtle hover:border-accent ease-fluid flex items-baseline justify-between gap-4 border-b py-5 transition-colors duration-500 md:py-7"
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
          <div className="scrub-in mt-10">
            <Link
              href="/fabrics/"
              className="text-secondary hover:text-accent tracking-button ease-fluid inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-8 transition-colors duration-300"
            >
              원단 전체 보기{" "}
              <ArrowUpRight size={13} weight="light" aria-hidden="true" />
            </Link>
          </div>
        </Chapter>

        {/* ── 07 만남 — 마지막 한 화면 ───────────────────────────── */}
        <Scene id="booking" label="만남" className="flex items-center">
          <div
            aria-hidden="true"
            className="scene-bg absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 55% at 50% 45%, #3a2f22 0%, #0f0e0d 70%)",
            }}
          />
          <div className="scene-text relative z-10 mx-auto w-full max-w-[1320px] px-5 py-24 text-center md:px-10">
            <p data-reveal className="text-accent tracking-label text-2xs">
              07 — BOOKING
            </p>
            <h2 className="font-display text-primary leading-hero tracking-hero mt-5 text-4xl break-keep md:text-hero">
              <Line>첫 상담은</Line>
              <Line i={1}>한 시간이면 충분합니다</Line>
            </h2>
            <p
              data-reveal
              style={delay(240)}
              className="text-secondary mx-auto mt-7 max-w-[40ch] text-sm leading-relaxed md:text-base"
            >
              수원 영통 매장 · {SHOP.hours} · {SHOP.closedDays}. 빈 시간을 골라
              신청하시면 확인 뒤 메일로 확정해 드립니다.
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
