import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageBand } from "@/components/ui/PageBand";
import { getFabrics, won } from "@/lib/catalog";

export const metadata: Metadata = { title: "원단" };

const SEASON: Record<string, string> = { ALL: "사계절", SS: "봄 · 여름", FW: "가을 · 겨울" };

export default async function Page() {
  const fabrics = await getFabrics();
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageBand eyebrow="FABRICS" title="원단" description="가격은 이 원단으로 만든 투피스 수트의 시작가입니다. 최종 금액은 품목과 선택에 따라 상담에서 정합니다." />
        <div className="mx-auto max-w-[1320px] px-5 py-12 md:px-15 md:py-16">
          {fabrics.length === 0 ? (
            <p className="text-muted text-sm">등록된 원단이 아직 없습니다.</p>
          ) : (
            <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
              {fabrics.map((f) => (
                <li key={f.code} className="bg-surface/70 border-subtle border p-6">
                  <div className="bg-band aspect-[4/3] w-full" style={f.imageUrl ? { backgroundImage: `url(${f.imageUrl})`, backgroundSize: "cover" } : undefined} />
                  <p className="text-muted tracking-label text-2xs mt-5">{f.mill} · {f.code}</p>
                  <h2 className="font-display text-primary mt-1 text-2xl">{f.name}</h2>
                  <p className="text-secondary mt-2 text-xs">
                    {f.composition}
                    {f.weightGsm ? ` · ${f.weightGsm}g` : ""} · {f.color} · {f.pattern} · {SEASON[f.season]}
                  </p>
                  {f.description && <p className="text-secondary mt-3 text-sm leading-relaxed">{f.description}</p>}
                  <p className={`mt-4 text-sm tabular-nums ${f.soldOut ? "text-disabled" : "text-accent"}`}>{f.soldOut ? "품절" : won(f.priceFromKrw)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
