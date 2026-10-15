import type { Metadata } from "next";

import { MypagePanel } from "@/components/account/MypagePanel";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";

export const metadata: Metadata = { title: "마이페이지", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="MY" title="마이페이지" description="예약 · 치수 기록 · 주문 진행" />
        <div className="mx-auto max-w-[900px] px-5 py-12 md:px-15 md:py-16">
          <MypagePanel />
        </div>
      </main>
      <Footer />
    </>
  );
}
