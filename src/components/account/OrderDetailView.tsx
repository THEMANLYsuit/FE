"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { StageBar } from "@/components/account/StageBar";
import { ApiError, dateOf, myOrder, when, won, type OrderDetail } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";

/**
 * 맞춤 주문 상세 — 진행 막대, 무엇을 만드는가(품목 · 원단 · 스타일 · 치수), 금액, 진행 기록(최근 것부터).
 * 주문번호는 주소의 ?no= — 정적 내보내기라 동적 경로 대신 쿼리다(메일 속 링크가 이 모양).
 */
const subscribeNone = () => () => {};

const KIND: Record<OrderDetail["timeline"][number]["kind"], string> = {
  CREATED: "주문 시작",
  STAGE: "단계 변경",
  NOTE: "안내",
  COMPLETED: "수령 완료",
  CANCELLED: "취소",
};

export function OrderDetailView() {
  const no = useSyncExternalStore<string | null | undefined>(
    subscribeNone,
    () => new URLSearchParams(window.location.search).get("no"),
    () => undefined,
  );
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_CONNECTED || !no) return;
    let alive = true;
    myOrder(no)
      .then((o) => alive && setOrder(o))
      .catch((e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) {
          window.location.replace(`/login/?next=${encodeURIComponent(`/mypage/order/?no=${no}`)}`);
          return;
        }
        setError(e instanceof ApiError && e.status === 404 ? "주문을 찾을 수 없습니다." : e instanceof Error ? e.message : "불러오지 못했습니다.");
      });
    return () => {
      alive = false;
    };
  }, [no]);

  const back = (
    <Link href="/mypage/#orders" className="text-muted hover:text-accent ease-fluid inline-flex min-h-11 items-center gap-2 text-xs transition-colors duration-300">
      <ArrowLeft size={12} weight="light" aria-hidden="true" /> 맞춤 주문 목록
    </Link>
  );

  if (!API_CONNECTED) {
    return <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">화면 확인 단계입니다. 회원 서버는 아직 연결되지 않았습니다.</p>;
  }
  if (no === null) return <div>{back}<p className="text-secondary mt-4 text-sm">주문번호가 없습니다.</p></div>;
  if (error) return <div>{back}<p role="alert" className="text-error mt-4 text-sm">{error}</p></div>;
  if (!order) return <p aria-busy="true" className="text-muted text-sm">불러오는 중</p>;

  const s = order.summary;
  const facts: [string, string][] = [
    ["품목", s.garmentLabel],
    ["원단", order.fabric ? `${order.fabric.name} · ${order.fabric.mill}` : order.fabricNote || (s.status === "IN_PROGRESS" ? "상담에서 정합니다" : "—")],
    ...(order.fabric && order.fabricNote ? ([["원단 메모", order.fabricNote]] as [string, string][]) : []),
    ...order.styles.map((st) => [st.categoryLabel, st.name] as [string, string]),
    ["치수 기준", order.measuredOn ? `${dateOf(order.measuredOn)} 측정` : "치수 전"],
    ...(s.dueOn ? ([["수령 예정", dateOf(s.dueOn)]] as [string, string][]) : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      {back}

      <header>
        <p className="text-muted tracking-label text-2xs">{s.orderNumber}</p>
        <h2 className="font-display text-primary leading-display mt-2 text-3xl">{s.title}</h2>
        <p className={`mt-3 text-sm ${s.status === "IN_PROGRESS" ? "text-accent" : "text-secondary"}`}>
          {s.status === "IN_PROGRESS" ? `지금 ${s.stageLabel} 단계입니다` : s.statusLabel}
          {s.status === "CANCELLED" && order.cancelReason ? ` · ${order.cancelReason}` : ""}
        </p>
        <div className="mt-6">
          <StageBar stage={s.stage} status={s.status} labelled />
        </div>
      </header>

      <section aria-labelledby="order-what" className="border-subtle bg-surface border p-6 md:p-8">
        <h3 id="order-what" className="text-primary text-sm font-medium">무엇을 만드나요</h3>
        <dl className="divide-subtle mt-4 divide-y">
          {facts.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-3 text-sm">
              <dt className="text-muted">{k}</dt>
              <dd className="text-primary">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="order-money" className="border-subtle bg-surface border p-6 md:p-8">
        <h3 id="order-money" className="text-primary text-sm font-medium">금액</h3>
        {order.priceKrw === null ? (
          <p className="text-secondary mt-3 text-sm">상담에서 정한 뒤 안내드립니다.</p>
        ) : (
          <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-muted text-xs">총액</dt>
              <dd className="text-primary mt-1 tabular-nums">{won(order.priceKrw)}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">받은 계약금</dt>
              <dd className="text-primary mt-1 tabular-nums">{won(order.depositKrw)}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">남은 금액</dt>
              <dd className="text-accent mt-1 tabular-nums">{won(order.balanceKrw ?? 0)}</dd>
            </div>
          </dl>
        )}
        <p className="text-muted mt-4 text-xs">결제는 매장에서 받습니다.</p>
      </section>

      <section aria-labelledby="order-timeline">
        <h3 id="order-timeline" className="text-primary text-sm font-medium">진행 기록</h3>
        <ol className="border-strong mt-4 flex flex-col border-l">
          {order.timeline.map((t, i) => (
            <li key={`${t.at}-${i}`} className="relative pb-6 pl-6 last:pb-0">
              <span aria-hidden="true" className={`absolute top-1.5 -left-[4.5px] h-2 w-2 rounded-full ${i === 0 ? "bg-accent" : "bg-strong"}`} />
              <p className="text-muted text-xs">
                {when(t.at)} · {KIND[t.kind]}
                {t.kind === "STAGE" ? ` — ${t.stageLabel}` : ""}
              </p>
              {t.message && <p className="text-primary mt-1 text-sm leading-relaxed whitespace-pre-line">{t.message}</p>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
