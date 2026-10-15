"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useState } from "react";

import { StageBar } from "@/components/account/StageBar";
import { dateOf, myOrders, type OrderSummary } from "@/lib/api";

/** 마이페이지 · 맞춤 주문 탭 — 주문마다 지금 단계와 진행 막대. 누르면 진행 기록이 있는 상세로. */
export function MyOrders() {
  const [list, setList] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    myOrders()
      // 진행 중인 주문을 위로 — 끝난 주문은 그 아래 최근 것부터(서버가 준 순서)
      .then((l) => alive && setList([...l].sort((a, b) => Number(b.status === "IN_PROGRESS") - Number(a.status === "IN_PROGRESS"))))
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
          진행 중인 맞춤 주문이 없습니다. 상담에서 주문이 정해지면 이곳에서 단계마다 진행을 보실 수 있습니다.
        </p>
        <Link href="/booking/" className="text-accent mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
          첫 상담 예약하기
        </Link>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {list.map((o) => (
        <li key={o.orderNumber}>
          <Link
            href={`/mypage/order/?no=${encodeURIComponent(o.orderNumber)}`}
            className="group border-subtle bg-surface hover:border-accent ease-fluid block border p-6 transition-colors duration-300 md:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-muted tracking-label text-2xs">{o.garmentLabel} · {o.orderNumber}</p>
                <p className="font-display text-primary mt-1 truncate text-xl">{o.title}</p>
              </div>
              <ArrowUpRight size={14} weight="light" aria-hidden="true" className="text-muted group-hover:text-accent mt-1 shrink-0 transition-colors duration-300" />
            </div>
            <div className="mt-5">
              <StageBar stage={o.stage} status={o.status} />
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className={o.status === "IN_PROGRESS" ? "text-accent" : "text-muted"}>
                {o.status === "IN_PROGRESS" ? `${o.stageLabel} 단계` : o.statusLabel}
              </span>
              {o.dueOn && o.status === "IN_PROGRESS" && <span className="text-secondary">수령 예정 {dateOf(o.dueOn)}</span>}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
