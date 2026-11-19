import { ArrowRight, ChatCircle, Plus } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  KAKAO_CHANNEL,
  NAVER_BOOKING,
  READY_TO_WEAR_URL,
} from "@/data/business";
import { FAQ } from "@/data/faq";

export const metadata: Metadata = {
  title: "상담 & 문의",
  robots: { index: false, follow: false },
};

/**
 * 상담 & 문의 — 2026-11-19 시안.
 *   제목 · 카드 셋(네이버 상담 예약 / 카카오톡 채널 / 기성복은 레오네페리토) · 자주 묻는 질문(질문을 누르면 답이 펼쳐진다)
 *
 * 예전 글 문의 양식(components/contact/ContactForm)은 시안에서 빠졌다 — 문의는 카카오톡 채널로 받는다.
 * 양식 컴포넌트와 서버 문의 API 는 지우지 않고 남겨 둔다.
 */
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1 pt-16 md:pt-20">
        <div className="mx-auto max-w-[920px] px-5 pt-14 pb-20 md:px-10 md:pt-20 md:pb-28">
          {/* 제목 */}
          <header>
            <h1 className="text-primary text-3xl font-bold md:text-4xl">
              상담 &amp; 문의
            </h1>
            <p className="text-secondary mt-3 text-sm break-keep">
              여기서 답을 못 찾으시면 카카오톡 채널로 물어보실 수 있습니다.
            </p>
            {/* 양 끝에 점이 달린 가는 선 */}
            <div aria-hidden="true" className="mt-8 flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7c7771]" />
              <span className="h-px flex-1 bg-[#5b5853]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#7c7771]" />
            </div>
          </header>

          {/* 카드 셋 */}
          <ul className="mt-10 grid gap-4 break-keep md:grid-cols-3 md:gap-5">
            {/* 1. 네이버 상담 예약 */}
            <li className="min-w-0">
              <a
                href={NAVER_BOOKING.consultation}
                target="_blank"
                rel="noopener noreferrer"
                className="group ease-fluid flex h-full min-h-[176px] flex-col items-center justify-center gap-4 rounded-[14px] border border-[#c9a86a] bg-[#141210] px-6 py-8 text-center shadow-[inset_0_0_0_3px_#0f0e0d,inset_0_0_0_4px_rgba(201,168,106,0.35)] transition-colors duration-300 hover:bg-[#1c1915]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo/emblem-gold.webp"
                  alt=""
                  width={240}
                  height={250}
                  className="h-14 w-auto"
                />
                <span className="text-primary inline-flex items-center gap-1.5 text-sm font-bold">
                  바로 상담 및 예약하기
                  <ArrowRight
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                    className="ease-fluid text-accent transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
                <span className="sr-only">(네이버 예약, 새 창)</span>
              </a>
            </li>

            {/* 2. 카카오톡 채널 */}
            <li className="flex min-h-[176px] min-w-0 flex-col items-center justify-center gap-4 rounded-[14px] border border-[#46413b] bg-[#141210] px-6 py-8 text-center">
              <p className="text-secondary text-xs leading-relaxed">
                카카오톡 채널 1:1 채팅으로 바로 문의하실 수 있습니다.
              </p>
              <a
                href={KAKAO_CHANNEL.chat}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full max-w-[240px] items-center justify-center gap-2 rounded-[10px] bg-[#FEE500] px-5 text-sm font-bold text-[#191919] transition-[filter] duration-200 hover:brightness-95"
              >
                <ChatCircle size={16} weight="fill" aria-hidden="true" />
                카카오톡으로 문의하기
              </a>
              <a
                href={KAKAO_CHANNEL.friend}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-accent text-xs underline-offset-4 hover:underline"
              >
                채널 추가하고 소식 받기
              </a>
            </li>

            {/* 3. 기성복 — 레오네페리토 */}
            <li className="min-w-0">
              <a
                href={READY_TO_WEAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ease-fluid flex h-full min-h-[176px] flex-col items-center justify-center gap-4 rounded-[14px] border border-[#46413b] bg-[#141210] px-6 py-8 text-center transition-colors duration-300 hover:border-[#c9a86a]/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo/leoneferito-monogram.webp"
                  alt=""
                  width={376}
                  height={424}
                  className="h-12 w-auto"
                />
                <span className="text-secondary text-xs leading-relaxed">
                  맞춤 정장이 아닌, 기성 정장을 원하시면
                  <br />
                  <b className="text-primary font-bold">레오네페리토</b>로
                  안내해 드립니다.
                </span>
                <span className="sr-only">(새 창)</span>
              </a>
            </li>
          </ul>

          {/* 자주 묻는 질문 */}
          {FAQ.map((group, gi) => (
            <section
              key={group.title}
              aria-labelledby={`faq-${gi}`}
              className="mt-16 md:mt-20"
            >
              <h2
                id={`faq-${gi}`}
                className="text-primary text-lg font-bold md:text-xl"
              >
                {gi + 1}. {group.title}
              </h2>
              <div className="mt-5 flex flex-col gap-3 break-keep">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    name="faq"
                    className="group ease-fluid rounded-[22px] border border-[#46413b] bg-gradient-to-b from-[#24221f] to-[#1a1816] transition-colors duration-300 open:border-[#5b5853] open:from-[#2a2724] open:to-[#1d1b18]"
                  >
                    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 px-4 py-2.5 md:px-5 [&::-webkit-details-marker]:hidden">
                      <span
                        aria-hidden="true"
                        className="font-display text-primary text-lg leading-none font-semibold"
                      >
                        Q
                      </span>
                      <span className="text-primary flex-1 text-sm font-medium">
                        {item.q}
                      </span>
                      <Plus
                        size={14}
                        weight="bold"
                        aria-hidden="true"
                        className="ease-fluid text-muted shrink-0 transition-transform duration-300 group-open:rotate-45"
                      />
                    </summary>
                    <p className="text-accent px-4 pt-1 pb-5 pl-[2.6rem] text-[13px] leading-relaxed md:px-5 md:pl-[2.85rem]">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
