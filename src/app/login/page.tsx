import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";

export const metadata: Metadata = { title: "로그인", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="ACCOUNT" title="로그인" description="예약과 치수 기록을 이어서 보실 수 있습니다." />
        <div className="mx-auto max-w-[480px] px-5 py-12 md:py-16">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
