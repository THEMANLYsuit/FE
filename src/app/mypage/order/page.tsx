import type { Metadata } from "next";

import { OrderDetailView } from "@/components/account/OrderDetailView";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";

/** 맞춤 주문 상세. `?no=` 주문번호 — 정적 내보내기라 동적 경로 대신 쿼리다. */
export const metadata: Metadata = { title: "맞춤 주문", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="ORDER" title="맞춤 주문 진행" />
        <div className="mx-auto max-w-[900px] px-5 py-12 md:px-15 md:py-16">
          <OrderDetailView />
        </div>
      </main>
      <Footer />
    </>
  );
}
