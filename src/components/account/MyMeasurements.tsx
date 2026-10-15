"use client";

import { useEffect, useState } from "react";

import { dateOf, myMeasurements, type MeasurementPointView, type MeasurementRecord } from "@/lib/api";

/**
 * 마이페이지 · 치수 탭 — 가장 최근 치수를 묶음(체형 · 상의 · 하의)별로, 지난 기록은 접어서.
 * 치수는 매장에서 재고 적는다 — 손님이 고치는 화면은 없다(틀렸으면 매장에 말씀하시게).
 */
function Groups({ points }: { points: MeasurementPointView[] }) {
  const groups = points.reduce<Record<string, MeasurementPointView[]>>((acc, p) => {
    (acc[p.groupLabel] ??= []).push(p);
    return acc;
  }, {});
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Object.entries(groups).map(([label, list]) => (
        <section key={label} aria-label={label}>
          <p className="text-muted tracking-label text-2xs">{label}</p>
          <dl className="divide-subtle mt-2 divide-y">
            {list.map((p) => (
              <div key={p.point} className="flex items-baseline justify-between gap-3 py-2">
                <dt className="text-secondary text-sm">{p.label}</dt>
                <dd className="text-primary text-sm tabular-nums">
                  {p.value.toFixed(1)}
                  <span className="text-muted ml-0.5 text-xs">{p.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function MyMeasurements() {
  const [list, setList] = useState<MeasurementRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    myMeasurements()
      .then((l) => alive && setList(l))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "불러오지 못했습니다."));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <p role="alert" className="text-error text-sm">{error}</p>;
  if (list === null) return <p aria-busy="true" className="text-muted text-sm">불러오는 중</p>;
  if (list.length === 0) {
    return (
      <div className="border-subtle bg-surface border p-6 md:p-8">
        <p className="text-secondary text-sm leading-relaxed">
          아직 치수 기록이 없습니다. 첫 상담 때 스물네 곳을 재고, 그 기록이 이곳에 남습니다.
        </p>
      </div>
    );
  }
  const [latest, ...older] = list;
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="latest-measurement" className="border-subtle bg-surface border p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="latest-measurement" className="text-primary text-sm font-medium">지금 치수</h2>
          <p className="text-muted text-xs">{dateOf(latest.measuredOn)} 측정</p>
        </div>
        {latest.bodyNote && <p className="text-secondary border-accent mt-4 border-l-2 pl-3 text-sm leading-relaxed">{latest.bodyNote}</p>}
        <div className="mt-6">
          <Groups points={latest.points} />
        </div>
      </section>

      {older.length > 0 && (
        <section aria-labelledby="older-measurements">
          <h2 id="older-measurements" className="text-muted tracking-label text-2xs">지난 기록</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {older.map((m) => (
              <li key={m.id}>
                <details className="group border-subtle border">
                  <summary className="text-secondary hover:text-primary flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm">
                    <span>{dateOf(m.measuredOn)}</span>
                    <span className="text-muted text-xs group-open:hidden">펼치기</span>
                    <span className="text-muted hidden text-xs group-open:inline">접기</span>
                  </summary>
                  <div className="border-subtle border-t p-5">
                    {m.bodyNote && <p className="text-secondary mb-4 text-sm">{m.bodyNote}</p>}
                    <Groups points={m.points} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="text-muted text-xs">치수가 달라졌다고 느끼시면 다음 방문 때 다시 재 드립니다.</p>
    </div>
  );
}
