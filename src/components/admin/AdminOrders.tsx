"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import {
  cancelOrder,
  completeOrder,
  getOrder,
  listOrders,
  moveOrder,
  noteOrder,
  ORDER_STAGE_LABEL,
  type AdminOrderDetail,
  type AdminOrderRow,
  type OrderStage,
  type Paged,
} from "@/lib/admin";
import {
  dateOf,
  ORDER_STAGES,
  when,
  won,
  type OrderStatus,
} from "@/lib/api";

import { statusTone } from "./AdminBookings";
import { OrderForm } from "./OrderForm";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  Chips,
  Empty,
  errText,
  Field,
  inputCls,
  Loading,
  Messages,
  Pager,
  panelCls,
  PickHint,
  useAction,
  useQueryParam,
} from "./ui";

/**
 * 맞춤 주문 — 왼쪽 목록(주문번호 · 주문 이름 · 손님 이름으로 찾기, 상태 · 단계로 거르기), 오른쪽 고른 주문.
 * 단계 옮기기 · 안내 남기기 · 수령 완료 · 취소는 손님에게 메일이 가고 마이페이지 진행 기록에 남는다(서버 OrderNotifier).
 * 새 주문은 회원 화면에서 연다(누구의 주문인지 먼저 정해야 하므로).
 */
const STATUS: [OrderStatus | null, string][] = [
  ["IN_PROGRESS", "진행 중"],
  ["COMPLETED", "수령 완료"],
  ["CANCELLED", "취소"],
  [null, "전체"],
];

export function AdminOrders() {
  const [selectedNo, setSelectedNo] = useQueryParam("no");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | null>("IN_PROGRESS");
  const [stage, setStage] = useState<OrderStage | null>(null);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Paged<AdminOrderRow> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listOrders(query, status, stage, page)
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError(errText(e, "불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [query, status, stage, page]);

  /** 고친 뒤 — 목록의 그 줄도 서버 값으로 */
  function refreshRow(d: AdminOrderDetail) {
    setData(
      (p) =>
        p && {
          ...p,
          items: p.items.map((r) =>
            r.summary.orderNumber === d.order.summary.orderNumber
              ? {
                  ...r,
                  summary: d.order.summary,
                  priceKrw: d.order.priceKrw,
                  depositKrw: d.order.depositKrw,
                }
              : r,
          ),
        },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(q);
          setPage(0);
        }}
        className="flex max-w-xl gap-2"
      >
        <label htmlFor="order-q" className="sr-only">
          주문 찾기
        </label>
        <input
          id="order-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="주문번호 · 주문 이름 · 손님 이름"
          className={inputCls}
        />
        <button type="submit" className={`${btnGhost} shrink-0`}>
          <MagnifyingGlass size={15} aria-hidden="true" />
          찾기
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <Chips<OrderStatus | null>
          label="상태로 거르기"
          options={STATUS}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setStage(null);
            setPage(0);
          }}
        />
        {status === "IN_PROGRESS" && (
          <Chips<OrderStage | null>
            label="단계로 거르기"
            options={[
              [null, "모든 단계"],
              ...ORDER_STAGES.map(
                (s) => [s, ORDER_STAGE_LABEL[s]] as [OrderStage, string],
              ),
            ]}
            value={stage}
            onChange={(v) => {
              setStage(v);
              setPage(0);
            }}
          />
        )}
      </div>

      <Messages error={error} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          {!data && !error ? (
            <Loading />
          ) : data && data.items.length === 0 ? (
            <Empty>
              {query ? `"${query}" 에 맞는 주문이 없습니다.` : "주문이 없습니다."}
            </Empty>
          ) : (
            data && (
              <>
                <p className="text-muted text-2xs mb-2 tabular-nums">
                  {data.total}건
                </p>
                <ul className="border-subtle divide-subtle divide-y border-y">
                  {data.items.map((r) => {
                    const on = selectedNo === r.summary.orderNumber;
                    return (
                      <li key={r.summary.orderNumber}>
                        <button
                          type="button"
                          aria-current={on ? "true" : undefined}
                          onClick={() => setSelectedNo(r.summary.orderNumber)}
                          className={`ease-fluid w-full px-3 py-4 text-left transition-colors duration-300 ${on ? "bg-surface" : "hover:bg-surface/60"}`}
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="text-primary min-w-0 truncate text-sm">
                              {r.summary.title}
                            </span>
                            <span
                              className={`text-2xs shrink-0 ${r.summary.status === "IN_PROGRESS" ? "text-accent" : r.summary.status === "COMPLETED" ? "text-success" : "text-muted"}`}
                            >
                              {r.summary.status === "IN_PROGRESS"
                                ? r.summary.stageLabel
                                : r.summary.statusLabel}
                            </span>
                          </span>
                          <span className="text-muted text-2xs mt-1 flex flex-wrap gap-x-3 tabular-nums">
                            <span>{r.summary.orderNumber}</span>
                            <span>{r.customer?.name ?? "탈퇴 회원"}</span>
                            <span>{r.summary.garmentLabel}</span>
                            {r.summary.dueOn && (
                              <span>수령 {dateOf(r.summary.dueOn)}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <Pager
                  page={data.page}
                  totalPages={data.totalPages}
                  onChange={setPage}
                />
              </>
            )
          )}
        </div>

        {selectedNo ? (
          <OrderPanel
            key={selectedNo}
            orderNumber={selectedNo}
            onChange={refreshRow}
            onClose={() => setSelectedNo(null)}
          />
        ) : (
          <PickHint>
            왼쪽에서 주문을 고르세요. 새 주문은 회원 · 치수 화면에서 엽니다.
          </PickHint>
        )}
      </div>
    </div>
  );
}

type Mode = "none" | "stage" | "note" | "complete" | "cancel" | "edit";

function OrderPanel({
  orderNumber,
  onChange,
  onClose,
}: {
  orderNumber: string;
  onChange: (d: AdminOrderDetail) => void;
  onClose: () => void;
}) {
  const [d, setD] = useState<AdminOrderDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("none");
  const [stage, setStage] = useState<OrderStage>("CONSULTATION");
  const [message, setMessage] = useState("");
  const { busy, error, notice, run, reset } = useAction();

  useEffect(() => {
    let alive = true;
    getOrder(orderNumber)
      .then((x) => alive && setD(x))
      .catch((e) => alive && setLoadError(errText(e, "주문을 불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [orderNumber]);

  if (loadError)
    return (
      <section className={panelCls}>
        <Messages error={loadError} />
      </section>
    );
  if (!d)
    return (
      <section className={panelCls}>
        <Loading />
      </section>
    );

  const o = d.order;
  const s = o.summary;
  const live = s.status === "IN_PROGRESS";

  function open(m: Mode) {
    reset();
    setMessage("");
    if (m === "stage") {
      const next = ORDER_STAGES[Math.min(ORDER_STAGES.indexOf(s.stage) + 1, ORDER_STAGES.length - 1)];
      setStage(next === s.stage ? s.stage : next);
    }
    setMode(mode === m ? "none" : m);
  }

  async function act(fn: () => Promise<AdminOrderDetail>, done: string) {
    const r = await run(fn, done);
    if (r) {
      setD(r);
      onChange(r);
      setMode("none");
      setMessage("");
    }
  }

  return (
    <section aria-label="주문 내용" className={panelCls}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted text-2xs tabular-nums">
            {s.orderNumber} · {s.garmentLabel} ·{" "}
            <span
              className={
                live ? "text-accent" : s.status === "COMPLETED" ? "text-success" : "text-muted"
              }
            >
              {s.statusLabel}
            </span>
          </p>
          <h2 className="text-primary mt-2 text-lg">{s.title}</h2>
          {d.customer ? (
            <Link
              href={`/admin/members/?id=${d.customer.id}`}
              className="text-secondary hover:text-accent mt-1 inline-block text-sm underline-offset-4 hover:underline"
            >
              {d.customer.name} · {d.customer.phone ?? d.customer.email}
            </Link>
          ) : (
            <p className="text-muted mt-1 text-sm">탈퇴한 회원</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-primary min-h-11 shrink-0 px-2 text-xs lg:hidden"
        >
          닫기
        </button>
      </div>

      <ol aria-label="진행 단계" className="grid grid-cols-6 gap-1">
        {o.steps.map((st) => (
          <li key={st.stage} className="flex flex-col gap-1.5">
            <span
              className={`h-1.5 rounded-full ${st.done ? "bg-accent" : st.current ? "bg-accent/50" : "bg-band"}`}
            />
            <span
              className={`text-[0.6rem] leading-tight ${st.current ? "text-accent" : st.done ? "text-secondary" : "text-muted"}`}
            >
              {st.label}
            </span>
          </li>
        ))}
      </ol>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <Info label="총액" value={o.priceKrw === null ? "미정" : won(o.priceKrw)} />
        <Info label="계약금" value={won(o.depositKrw)} />
        <Info label="잔금" value={o.balanceKrw === null ? "—" : won(o.balanceKrw)} />
        <Info label="수령 예정" value={s.dueOn ? dateOf(s.dueOn) : "미정"} />
        <Info label="치수" value={o.measuredOn ? `${dateOf(o.measuredOn)} 측정` : "없음"} />
        <Info
          label="원단"
          value={o.fabric ? `${o.fabric.name} · ${o.fabric.code}` : o.fabricNote || "미정"}
        />
      </dl>
      {o.fabric && o.fabricNote && (
        <p className="text-muted -mt-2 text-xs">원단 메모 — {o.fabricNote}</p>
      )}
      {o.styles.length > 0 && (
        <p className="text-secondary text-xs leading-relaxed">
          {o.styles.map((x) => `${x.categoryLabel} ${x.name}`).join(" · ")}
        </p>
      )}
      {d.adminNote && (
        <p className="text-secondary bg-band rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line">
          <span className="text-muted">매장 메모 · </span>
          {d.adminNote}
        </p>
      )}
      {o.cancelReason && (
        <p className="text-muted text-xs">취소 사유 — {o.cancelReason}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {live && (
          <button type="button" aria-expanded={mode === "stage"} onClick={() => open("stage")} className={btnPrimary}>
            단계 옮기기
          </button>
        )}
        {s.status !== "CANCELLED" && (
          <>
            <button type="button" aria-expanded={mode === "note"} onClick={() => open("note")} className={btnGhost}>
              안내 남기기
            </button>
            <button type="button" aria-expanded={mode === "edit"} onClick={() => open("edit")} className={btnGhost}>
              내용 고치기
            </button>
          </>
        )}
        {live && s.stage === "DELIVERY" && (
          <button type="button" aria-expanded={mode === "complete"} onClick={() => open("complete")} className={btnGhost}>
            수령 완료
          </button>
        )}
        {live && (
          <button type="button" aria-expanded={mode === "cancel"} onClick={() => open("cancel")} className={btnDanger}>
            주문 취소
          </button>
        )}
      </div>

      {mode === "stage" && (
        <Box>
          <Field label="옮길 단계" htmlFor="stage-to">
            <select
              id="stage-to"
              value={stage}
              onChange={(e) => setStage(e.target.value as OrderStage)}
              className={`${inputCls} w-fit`}
            >
              {ORDER_STAGES.map((x) => (
                <option key={x} value={x} disabled={x === s.stage}>
                  {ORDER_STAGE_LABEL[x]}
                  {x === s.stage ? " (지금)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <MessageBox
            id="stage-msg"
            label="손님에게 함께 보낼 말 (선택)"
            value={message}
            onChange={setMessage}
          />
          <button
            type="button"
            disabled={busy || stage === s.stage}
            onClick={() =>
              act(
                () => moveOrder(s.orderNumber, stage, message.trim()),
                `${ORDER_STAGE_LABEL[stage]} 단계로 옮겼습니다. 손님에게 메일이 갑니다.`,
              )
            }
            className={`${btnPrimary} w-fit`}
          >
            {ORDER_STAGE_LABEL[stage]} 단계로 옮기기
          </button>
        </Box>
      )}

      {mode === "note" && (
        <Box>
          <MessageBox
            id="note-msg"
            label="손님에게 보낼 안내"
            value={message}
            onChange={setMessage}
            placeholder="가봉 날짜를 잡아 주세요. 예약 화면에서 고르시면 됩니다."
          />
          <button
            type="button"
            disabled={busy || !message.trim()}
            onClick={() =>
              act(
                () => noteOrder(s.orderNumber, message.trim()),
                "안내를 남겼습니다. 손님에게 메일이 갑니다.",
              )
            }
            className={`${btnPrimary} w-fit`}
          >
            안내 보내기
          </button>
        </Box>
      )}

      {mode === "complete" && (
        <Box>
          <MessageBox
            id="done-msg"
            label="마지막 인사 (선택)"
            value={message}
            onChange={setMessage}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              act(
                () => completeOrder(s.orderNumber, message.trim()),
                "수령 완료로 바꿨습니다.",
              )
            }
            className={`${btnPrimary} w-fit`}
          >
            수령 완료로 바꾸기
          </button>
        </Box>
      )}

      {mode === "cancel" && (
        <Box>
          <Field label="취소 사유 (손님 메일에 들어갑니다 · 선택)" htmlFor="order-cancel">
            <input
              id="order-cancel"
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputCls}
            />
          </Field>
          <p className="text-muted text-[0.65rem]">
            취소한 주문은 되돌릴 수 없습니다. 계약금 환불은 따로 처리해 주세요.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              act(() => cancelOrder(s.orderNumber, message.trim()), "주문을 취소했습니다.")
            }
            className={`${btnDanger} w-fit`}
          >
            주문 취소하기
          </button>
        </Box>
      )}

      {mode === "edit" && (
        <Box>
          <OrderForm
            memberId={d.customer?.id ?? null}
            initial={d}
            onSaved={(x) => {
              setD(x);
              onChange(x);
              setMode("none");
            }}
            onCancel={() => setMode("none")}
          />
        </Box>
      )}

      <Messages error={error} notice={notice} />

      {d.bookings.length > 0 && (
        <div>
          <h3 className="text-muted text-2xs">묶인 예약</h3>
          <ul className="border-subtle divide-subtle mt-2 divide-y border-y text-sm">
            {d.bookings.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/bookings/?id=${b.id}`}
                  className="hover:bg-band/60 flex justify-between gap-3 px-2 py-2.5"
                >
                  <span className="text-primary tabular-nums">{when(b.startsAt)}</span>
                  <span className="text-secondary">{b.typeLabel}</span>
                  <span className={`text-2xs ${statusTone(b.status)}`}>{b.statusLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-muted text-2xs">진행 기록 (손님 마이페이지에도 보입니다)</h3>
        <ol className="mt-3 flex flex-col gap-3">
          {o.timeline.map((t, i) => (
            <li key={i} className="border-subtle border-l-2 pl-4">
              <p className="text-muted text-[0.65rem] tabular-nums">
                {when(t.at)} · {t.kind === "NOTE" ? "안내" : t.kind === "CANCELLED" ? "취소" : t.kind === "COMPLETED" ? "수령 완료" : t.kind === "CREATED" ? "주문 시작" : `${t.stageLabel} 단계`}
              </p>
              {t.message && (
                <p className="text-primary mt-1 text-sm leading-relaxed whitespace-pre-line">
                  {t.message}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-2xs">{label}</dt>
      <dd className="text-primary mt-0.5 truncate tabular-nums">{value}</dd>
    </div>
  );
}

function Box({ children }: { children: ReactNode }) {
  return (
    <div className="border-subtle flex flex-col gap-3 rounded-xl border p-4">
      {children}
    </div>
  );
}

function MessageBox({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <textarea
        id={id}
        rows={3}
        maxLength={1000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} leading-relaxed`}
      />
    </Field>
  );
}
