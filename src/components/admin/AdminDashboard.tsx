"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ApiError,
  getDashboard,
  type Dashboard,
  type OrderStage,
} from "@/lib/admin";
import { dateOf, timeOf } from "@/lib/api";

/** 대시보드 — 오늘 할 일. 숫자 넷(오늘 예약 · 확인 기다리는 예약 · 진행 중 주문 · 답 기다리는 문의) + 오늘 예약 목록 + 단계별 주문 + 이번 주 수령. */
const STAGES: [OrderStage, string][] = [
  ["CONSULTATION", "상담"],
  ["MEASUREMENT", "치수"],
  ["FABRIC", "원단 · 스타일"],
  ["FITTING", "가봉"],
  ["ADJUSTMENT", "수정 · 완성"],
  ["DELIVERY", "수령"],
];

export function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getDashboard()
      .then((d) => alive && setData(d))
      .catch(
        (e) =>
          alive &&
          setError(e instanceof ApiError ? e.message : "불러오지 못했습니다."),
      );
    return () => {
      alive = false;
    };
  }, []);

  if (error)
    return (
      <p role="alert" className="text-error text-sm">
        {error}
      </p>
    );
  if (!data)
    return (
      <p aria-busy="true" className="text-muted text-sm">
        불러오는 중
      </p>
    );

  const stats: [string, number, string | null][] = [
    ["오늘 예약", data.todayAppointments, null],
    ["확인 기다리는 예약", data.requestedAppointments, "/admin/bookings/"],
    ["진행 중 맞춤 주문", data.inProgressOrders, "/admin/orders/"],
    ["답 기다리는 문의", data.openInquiries, "/admin/inquiries/"],
  ];

  return (
    <div className="flex flex-col gap-10">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, n, href]) => {
          const body = (
            <>
              <dt className="text-muted text-2xs">{label}</dt>
              <dd
                className={`mt-2 text-3xl font-medium tabular-nums ${n > 0 && href ? "text-accent" : "text-primary"}`}
              >
                {n}
              </dd>
            </>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              className="border-subtle bg-surface hover:border-accent ease-fluid rounded-2xl border px-5 py-4 transition-colors duration-300"
            >
              {body}
            </Link>
          ) : (
            <div
              key={label}
              className="border-subtle bg-surface rounded-2xl border px-5 py-4"
            >
              {body}
            </div>
          );
        })}
      </dl>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="today-heading">
          <h2 id="today-heading" className="text-primary text-sm font-medium">
            오늘 예약
          </h2>
          {data.todayList.length === 0 ? (
            <p className="text-muted mt-3 text-sm">오늘 예약이 없습니다.</p>
          ) : (
            <ul className="border-subtle divide-subtle mt-3 divide-y border-y">
              {data.todayList.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/?id=${b.id}`}
                    className="hover:bg-surface/60 flex items-center justify-between gap-4 px-2 py-3 text-sm"
                  >
                    <span className="text-primary tabular-nums">
                      {timeOf(b.startsAt)}
                    </span>
                    <span className="text-secondary flex-1">{b.typeLabel}</span>
                    <span
                      className={`text-2xs ${b.status === "CONFIRMED" ? "text-success" : "text-accent"}`}
                    >
                      {b.statusLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="stage-heading">
          <h2 id="stage-heading" className="text-primary text-sm font-medium">
            진행 중 맞춤 주문 — 단계별
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {STAGES.map(([key, label]) => {
              const n = data.ordersByStage[key] ?? 0;
              const max = Math.max(1, ...Object.values(data.ordersByStage));
              return (
                <li
                  key={key}
                  className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm"
                >
                  <span className="text-secondary">{label}</span>
                  <span className="bg-surface block h-2 overflow-hidden rounded-full">
                    <span
                      className="bg-accent block h-full rounded-full"
                      style={{ width: `${(n / max) * 100}%` }}
                    />
                  </span>
                  <span className="text-primary text-right tabular-nums">
                    {n}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section aria-labelledby="due-heading">
        <h2 id="due-heading" className="text-primary text-sm font-medium">
          이번 주 수령 예정
        </h2>
        {data.dueThisWeek.length === 0 ? (
          <p className="text-muted mt-3 text-sm">
            이번 주 수령 예정인 주문이 없습니다.
          </p>
        ) : (
          <ul className="border-subtle divide-subtle mt-3 divide-y border-y">
            {data.dueThisWeek.map((o) => (
              <li key={o.orderNumber}>
                <Link
                  href={`/admin/orders/?no=${encodeURIComponent(o.orderNumber)}`}
                  className="hover:bg-surface/60 flex flex-wrap items-center justify-between gap-3 px-2 py-3 text-sm"
                >
                  <span className="text-primary">{o.title}</span>
                  <span className="text-muted text-2xs">
                    {o.orderNumber} · {o.stageLabel}
                  </span>
                  <span className="text-accent text-2xs tabular-nums">
                    {o.dueOn ? dateOf(o.dueOn) : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
