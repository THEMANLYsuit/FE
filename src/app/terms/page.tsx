import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageBand } from "@/components/ui/PageBand";
import { termsOf } from "@/data/legal";
import { getBusiness } from "@/lib/business";

export const metadata: Metadata = { title: "이용약관", robots: { index: false, follow: false } };

/** 이용약관. 본문은 data/legal.ts — 상호는 관리자 › 사업자 정보에서 받는다(빌드할 때). */
export default async function Page() {
  const doc = termsOf(await getBusiness());
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="LEGAL" title="이용약관" description={`시행일 ${doc.effectiveDate}`} />
        <LegalDocument doc={doc} />
      </main>
      <Footer />
    </>
  );
}
