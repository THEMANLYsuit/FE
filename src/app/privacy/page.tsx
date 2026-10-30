import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageBand } from "@/components/ui/PageBand";
import { privacyOf } from "@/data/legal";
import { getBusiness } from "@/lib/business";

export const metadata: Metadata = { title: "개인정보처리방침", robots: { index: false, follow: false } };

/** 개인정보처리방침. 본문은 data/legal.ts — 사이트가 실제로 수집하는 것만 적었다. */
export default async function Page() {
  const doc = privacyOf(await getBusiness());
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="LEGAL" title="개인정보처리방침" description={`시행일 ${doc.effectiveDate}`} />
        <LegalDocument doc={doc} />
      </main>
      <Footer />
    </>
  );
}
