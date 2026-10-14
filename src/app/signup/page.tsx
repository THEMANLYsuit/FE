import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/SignupForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";

export const metadata: Metadata = { title: "회원가입", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="ACCOUNT" title="회원가입" description="예약 · 치수 · 주문 진행 상황이 계정에 남습니다." />
        <div className="mx-auto max-w-[480px] px-5 py-12 md:py-16">
          <SignupForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
