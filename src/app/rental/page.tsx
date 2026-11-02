import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";

export const metadata: Metadata = { title: "렌탈", robots: { index: false, follow: false } };

/**
 * 렌탈 — 햄버거 메뉴의 둘째 칸. 서버는 준비됐다(V15 · /api/rental-items · /api/rentals).
 * TODO(디자인) 시안이 오면 대여 옷 목록 · 신청 화면으로 바꾼다. 그때까지 메뉴가 404 로 가지 않게 안내만 둔다.
 */
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="RENTAL" title="렌탈" description="대여 서비스를 준비하고 있습니다. 대여가 필요하시면 문의로 먼저 알려 주세요." />
        <div className="mx-auto max-w-[1320px] px-5 py-14 md:px-15 md:py-20">
          <Link
            href="/contact/"
            className="border-interactive text-primary hover:border-accent hover:text-accent ease-fluid inline-flex min-h-11 items-center rounded-full border px-6 text-sm transition-colors duration-300"
          >
            문의하기
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
