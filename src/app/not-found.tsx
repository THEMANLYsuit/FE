import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 items-center justify-center px-5 pt-20 pb-24 text-center">
        <div>
          <p className="text-accent tracking-label text-2xs">404</p>
          <h1 className="font-display text-primary mt-3 text-3xl">찾을 수 없는 페이지입니다</h1>
          <Link href="/" className="text-accent mt-6 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
            메인으로
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
