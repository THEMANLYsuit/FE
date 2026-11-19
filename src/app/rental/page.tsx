import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RentalBookButton, RentalCalendar } from "@/components/rental/RentalCalendar";
import { RENTAL_ITEMS, RENTAL_STEPS } from "@/data/rental";

export const metadata: Metadata = { title: "수트 렌탈", robots: { index: false, follow: false } };

/**
 * 수트 렌탈 — 2026-11-19 시안(Suit Rental).
 *   1. 수트 렌탈 안내   2. 수트 선택 옵션(사진)   3. 렌탈 순서(왼쪽) · 일정 달력(오른쪽)   «예약하기» → 네이버 예약
 *
 * 예약은 네이버 예약으로 받는다(고객 결정) — 사이트의 렌탈 신청 서버(V15)는 쓰지 않고 남겨 둔다.
 * 달력은 일정을 가늠해 보는 도구다(lib/rentalSchedule).
 */
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1 pt-16 md:pt-20">
        <div className="mx-auto max-w-[1100px] px-5 pb-20 md:px-10 md:pb-28">
          {/* 제목 — 엠블럼 + Suit Rental */}
          <header className="flex items-center justify-center gap-5 py-16 md:gap-8 md:py-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo/emblem-gold.webp" alt="" width={240} height={250} className="h-16 w-auto md:h-24" />
            <h1 className="font-display text-accent text-4xl font-medium md:text-6xl">Suit Rental</h1>
          </header>

          {/* 1. 안내 */}
          <section aria-labelledby="rental-guide" className="md:px-4">
            <h2 id="rental-guide" className="text-primary text-xl font-bold md:text-2xl">
              1. 수트 렌탈 안내
            </h2>
            <div className="text-secondary mt-6 flex flex-col gap-5 text-sm leading-relaxed">
              <p>
                <b className="text-primary font-bold">렌탈 제품 픽업 최소 5일 이전에 반드시 매장에 방문</b>하셔서, 채촌 후 렌탈 제품의 기장 수정과 렌탈 제품
                확인을 진행하세요.
              </p>
              <p>
                <b className="text-primary font-bold">렌탈 제품 픽업 및 반납 방식</b>은 3가지입니다.
                <br />
                매장 방문 픽업 / 택배 수령 및 택배 반납 / 퀵 수령 및 퀵 반납
              </p>
              <p>
                <b className="text-primary font-bold">렌탈 제품은 픽업일 익일까지 진행</b>되며, <b className="text-primary font-bold">1일 연장시 1만원 추가비용</b>이
                발생합니다.
                <br />
                <span className="text-muted">
                  (EX : 토요일 픽업 ~ 일요일 반납 → 추가 비용 없음 / 토요일 픽업 ~ 월요일 반납 → 추가비용 1만원 발생)
                </span>
              </p>
              <p>이 점 참고하여 렌탈 일정을 확정하시길 권장드립니다.</p>
            </div>
          </section>

          {/* 2. 수트 선택 옵션 */}
          <section aria-labelledby="rental-options" className="mt-20 md:mt-24 md:px-4">
            <h2 id="rental-options" className="text-primary text-xl font-bold md:text-2xl">
              2. 수트 선택 옵션
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {RENTAL_ITEMS.map((item) => (
                <li key={item.key} className="min-w-0">
                  <div className="bg-surface relative aspect-[3/4] overflow-hidden">
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.image} alt={item.name ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_center,#5a1a1a_0%,#2a0d0d_70%)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/brand/logo/emblem-gold.webp" alt="" className="h-12 w-auto opacity-60" />
                        <span className="text-muted text-xs">사진 준비 중</span>
                      </div>
                    )}
                  </div>
                  {item.name && <p className="text-primary mt-3 text-sm font-medium">{item.name}</p>}
                  {item.note && <p className="text-muted mt-1 text-xs">{item.note}</p>}
                </li>
              ))}
            </ul>
          </section>

          {/* 3. 렌탈 순서 · 일정 확인 */}
          <section aria-labelledby="rental-steps" className="mt-20 md:mt-24 md:px-4">
            <h2 id="rental-steps" className="text-primary text-xl font-bold md:text-2xl">
              3. 렌탈 순서 및 일정 확인
            </h2>
            <div className="mt-8 grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-0">
              {/* 왼쪽 — 순서 */}
              <div className="md:border-r md:border-dashed md:border-[#46413b] md:pr-12">
                <h3 className="text-primary text-sm font-bold">더맨리의 렌탈 수트 순서</h3>
                <ol className="mt-8 flex flex-col items-center">
                  {RENTAL_STEPS.map((step, i) => (
                    <li key={step.title} className="flex flex-col items-center text-center">
                      {i > 0 && <span aria-hidden="true" className="h-6 w-px bg-[#5b5853]" />}
                      <span className="rounded-full bg-[#3b342a] px-6 py-2 text-[13px] leading-snug font-bold whitespace-pre-line text-[#efe3c8]">
                        {step.title}
                      </span>
                      {step.body && <p className="text-muted mt-2 max-w-[26ch] text-[11px] leading-relaxed">{step.body}</p>}
                    </li>
                  ))}
                </ol>
              </div>

              {/* 오른쪽 — 달력 */}
              <div className="md:pl-12">
                <h3 className="text-primary text-sm font-bold">수트가 필요한 날짜를 선택하고, 일정을 확인해 보세요.</h3>
                <div className="mt-6">
                  <RentalCalendar />
                </div>
              </div>
            </div>
          </section>

          {/* 예약 — 네이버 예약 */}
          <div className="mt-16 flex flex-col items-center gap-5 text-center md:mt-20">
            <p className="text-secondary text-sm">반드시 수트 픽업일이 아닌, 매장 방문 날짜를 선택해서 예약해주세요.</p>
            <RentalBookButton />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
