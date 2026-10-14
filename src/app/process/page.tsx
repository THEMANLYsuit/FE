import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";
import { PROCESS } from "@/data/process";

export const metadata: Metadata = { title: "제작 과정" };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="PROCESS" title="한 벌이 되기까지" description="상담에서 수령까지 여섯 번을 만납니다. 보통 5~6주가 걸립니다." />
        <div className="mx-auto max-w-[900px] px-5 py-12 md:px-15 md:py-16">
          <ol className="flex flex-col">
            {PROCESS.map((s, i) => (
              <li key={s.key} className="border-subtle grid gap-4 border-t py-8 md:grid-cols-[6rem_minmax(0,1fr)_8rem] md:gap-8">
                <span className="font-display text-accent text-2xl tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="font-display text-primary text-2xl">
                    {s.title} <span className="text-muted tracking-label ml-2 text-2xs">{s.en}</span>
                  </h2>
                  <p className="text-secondary mt-3 text-sm leading-relaxed md:text-base">{s.body}</p>
                </div>
                <span className="text-muted text-sm md:text-right">{s.duration}</span>
              </li>
            ))}
          </ol>
          <div className="border-subtle mt-4 border-t pt-10 text-center">
            <Link href="/booking/" className="bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid inline-flex min-h-14 items-center rounded-full px-8 text-sm transition-colors duration-300">
              첫 상담 예약하기
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
