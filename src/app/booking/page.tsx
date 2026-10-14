import type { Metadata } from "next";

import { BookingForm } from "@/components/booking/BookingForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";
import { SHOP } from "@/data/business";

export const metadata: Metadata = { title: "상담 예약", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="BOOKING" title="상담 · 가봉 예약" description={`수원 영통 매장 · ${SHOP.hours} · ${SHOP.closedDays}. 빈 시간을 골라 신청하시면 확인 뒤 메일로 확정해 드립니다.`} />
        <div className="mx-auto max-w-[800px] px-5 py-12 md:px-15 md:py-16">
          <BookingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
