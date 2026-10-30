import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageBand } from "@/components/ui/PageBand";
import { cookiesOf } from "@/data/legal";
import { getBusiness } from "@/lib/business";

export const metadata: Metadata = { title: "쿠키 정책", robots: { index: false, follow: false } };

/** 쿠키 정책. 필수 쿠키 두 개(TMSESSION · XSRF-TOKEN)만 쓰므로 동의 창은 띄우지 않는다. */
export default async function Page() {
  const doc = cookiesOf(await getBusiness());
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="LEGAL" title="쿠키 정책" description={`시행일 ${doc.effectiveDate}`} />
        <LegalDocument doc={doc} />
      </main>
      <Footer />
    </>
  );
}
