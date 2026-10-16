import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";
import { BUSINESS, KAKAO_CHANNEL, SHOP } from "@/data/business";

export const metadata: Metadata = { title: "문의하기", robots: { index: false, follow: false } };

/** 문의하기 — 왼쪽은 글로 보내는 문의, 오른쪽은 바로 닿는 길(전화 · 카카오톡 · 매장). */
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="CONTACT" title="문의하기" description="원단 · 일정 · 진행 중인 주문 무엇이든 적어 주세요. 확인한 뒤 메일로 답해 드립니다." />
        <div className="mx-auto grid max-w-[1100px] gap-14 px-5 py-12 md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] md:gap-16 md:px-15 md:py-16">
          <ContactForm />
          <aside aria-labelledby="direct-heading" className="border-subtle flex flex-col gap-6 border-t pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-10">
            <h2 id="direct-heading" className="text-accent tracking-label text-2xs">
              바로 연락하기
            </h2>
            <dl className="flex flex-col gap-5 text-sm">
              <div>
                <dt className="text-muted text-2xs">전화</dt>
                <dd className="text-primary mt-1">
                  <a href={`tel:${BUSINESS.phone.replace(/[^0-9]/g, "")}`} className="hover:text-accent underline-offset-4 hover:underline">
                    {BUSINESS.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted text-2xs">카카오톡</dt>
                <dd className="text-primary mt-1">
                  <a href={KAKAO_CHANNEL.chat} target="_blank" rel="noopener noreferrer" className="hover:text-accent underline-offset-4 hover:underline">
                    {KAKAO_CHANNEL.name} 채팅
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted text-2xs">매장</dt>
                <dd className="text-primary mt-1 leading-relaxed">
                  {BUSINESS.address}
                  <br />
                  <span className="text-secondary text-xs">
                    {SHOP.hours} · {SHOP.closedDays}
                  </span>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
