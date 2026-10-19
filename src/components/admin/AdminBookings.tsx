"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  getBooking,
  listBookings,
  noShowBooking,
  noteBooking,
  rescheduleBooking,
  type AdminBooking,
  type BookingStatus,
} from "@/lib/admin";
import { timeOf, when } from "@/lib/api";

import {
  addDays,
  btnDanger,
  btnGhost,
  btnPrimary,
  Chips,
  Empty,
  errText,
  Field,
  inputCls,
  kstDate,
  Loading,
  Messages,
  mondayOf,
  panelCls,
  PickHint,
  shortDate,
  todayKst,
  useAction,
  useQueryParam,
} from "./ui";
import { SlotPicker } from "./SlotPicker";

/**
 * 예약 — 두 가지 보기. "확인 기다림" 은 손님이 신청하고 아직 확정하지 않은 것 전부(앞으로 석 달),
 * "주간" 은 한 주씩 넘기며 날짜별로 본다. 하나를 고르면 오른쪽에서 확정 · 시간 옮기기 · 완료 · 불참 · 취소와 메모.
 * 확정 · 시간 변경 · 관리자 취소는 손님에게 메일이 간다(서버 BookingNotifier).
 */
type View = "pending" | "week";

const STATUS: [BookingStatus | null, string][] = [
  [null, "전체"],
  ["REQUESTED", "신청"],
  ["CONFIRMED", "확정"],
  ["COMPLETED", "완료"],
  ["CANCELLED", "취소"],
  ["NO_SHOW", "불참"],
];

export const statusTone = (s: BookingStatus) =>
  s === "REQUESTED"
    ? "text-accent"
    : s === "CONFIRMED"
      ? "text-success"
      : s === "NO_SHOW"
        ? "text-error"
        : "text-muted";

export function AdminBookings() {
  const [selectedId, setSelectedId, ready] = useQueryParam("id");
  const [view, setView] = useState<View>("pending");
  const [week, setWeek] = useState(() => mondayOf(todayKst()));
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [list, setList] = useState<AdminBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminBooking | null>(null);

  const today = todayKst();
  const [from, to, filter] =
    view === "pending"
      ? [addDays(today, -7), addDays(today, 85), "REQUESTED" as BookingStatus]
      : [week, addDays(week, 6), status];

  useEffect(() => {
    let alive = true;
    listBookings(from, to, filter)
      .then((d) => alive && (setList(d), setError(null)))
      .catch((e) => alive && setError(errText(e, "불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [from, to, filter]);

  // 주소에 ?id= 가 있으면(대시보드 · 회원 화면에서 넘어옴) 그 예약을 연다 — 목록 기간 밖이어도
  useEffect(() => {
    if (!ready || !selectedId || selected?.id === selectedId) return;
    let alive = true;
    getBooking(selectedId)
      .then((b) => alive && setSelected(b))
      .catch(() => alive && setSelectedId(null));
    return () => {
      alive = false;
    };
  }, [ready, selectedId, selected?.id, setSelectedId]);

  const days = useMemo(() => {
    const byDay = new Map<string, AdminBooking[]>();
    (list ?? []).forEach((b) => {
      const d = kstDate(b.startsAt);
      byDay.set(d, [...(byDay.get(d) ?? []), b]);
    });
    return [...byDay.entries()];
  }, [list]);

  function pick(b: AdminBooking | null) {
    setSelected(b);
    setSelectedId(b?.id ?? null);
  }

  function replace(updated: AdminBooking) {
    setSelected(updated);
    setList((l) => l && l.map((b) => (b.id === updated.id ? updated : b)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Chips<View>
          label="보기"
          options={[
            ["pending", "확인 기다림"],
            ["week", "주간"],
          ]}
          value={view}
          onChange={(v) => {
            setView(v);
            setList(null);
          }}
        />
        {view === "week" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="지난 주"
                onClick={() => {
                  setWeek(addDays(week, -7));
                  setList(null);
                }}
                className={`${btnGhost} px-3`}
              >
                <CaretLeft size={14} aria-hidden="true" />
              </button>
              <span className="text-primary min-w-48 text-center text-sm tabular-nums">
                {shortDate(week)} ~ {shortDate(addDays(week, 6))}
              </span>
              <button
                type="button"
                aria-label="다음 주"
                onClick={() => {
                  setWeek(addDays(week, 7));
                  setList(null);
                }}
                className={`${btnGhost} px-3`}
              >
                <CaretRight size={14} aria-hidden="true" />
              </button>
              {week !== mondayOf(today) && (
                <button
                  type="button"
                  onClick={() => {
                    setWeek(mondayOf(today));
                    setList(null);
                  }}
                  className="text-secondary hover:text-accent min-h-11 px-2 text-sm"
                >
                  이번 주
                </button>
              )}
            </div>
            <Chips<BookingStatus | null>
              label="상태로 거르기"
              options={STATUS}
              value={status}
              onChange={(v) => {
                setStatus(v);
                setList(null);
              }}
            />
          </div>
        )}
      </div>

      <Messages error={error} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          {!list && !error ? (
            <Loading />
          ) : list && list.length === 0 ? (
            <Empty>
              {view === "pending"
                ? "확인 기다리는 예약이 없습니다."
                : "이 주에는 예약이 없습니다."}
            </Empty>
          ) : (
            <div className="flex flex-col gap-6">
              {days.map(([day, items]) => (
                <section key={day} aria-label={shortDate(day)}>
                  <h2
                    className={`text-2xs mb-2 tabular-nums ${day === today ? "text-accent" : "text-muted"}`}
                  >
                    {shortDate(day)}
                    {day === today && " · 오늘"}
                  </h2>
                  <ul className="border-subtle divide-subtle divide-y border-y">
                    {items.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          aria-current={
                            selected?.id === b.id ? "true" : undefined
                          }
                          onClick={() => pick(b)}
                          className={`ease-fluid grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-3 px-3 py-3.5 text-left text-sm transition-colors duration-300 ${
                            selected?.id === b.id
                              ? "bg-surface"
                              : "hover:bg-surface/60"
                          }`}
                        >
                          <span className="text-primary tabular-nums">
                            {timeOf(b.startsAt)}
                          </span>
                          <span className="min-w-0">
                            <span className="text-primary block truncate">
                              {b.customer?.name ?? "탈퇴 회원"}
                            </span>
                            <span className="text-muted text-2xs block">
                              {b.typeLabel}
                              {b.orderNumber && ` · ${b.orderNumber}`}
                            </span>
                          </span>
                          <span className={`text-2xs ${statusTone(b.status)}`}>
                            {b.statusLabel}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {selected ? (
          <BookingDetail
            key={selected.id}
            booking={selected}
            onChange={replace}
            onClose={() => pick(null)}
          />
        ) : (
          <PickHint>왼쪽에서 예약을 고르세요.</PickHint>
        )}
      </div>
    </div>
  );
}

function BookingDetail({
  booking: b,
  onChange,
  onClose,
}: {
  booking: AdminBooking;
  onChange: (b: AdminBooking) => void;
  onClose: () => void;
}) {
  const { busy, error, notice, run } = useAction();
  const [note, setNote] = useState(b.adminNote ?? "");
  const [mode, setMode] = useState<"none" | "move" | "cancel">("none");
  const [reason, setReason] = useState("");
  const [moveTo, setMoveTo] = useState<string | null>(null);
  const live = b.status === "REQUESTED" || b.status === "CONFIRMED";

  async function act(
    fn: () => Promise<AdminBooking>,
    done: string,
  ): Promise<void> {
    const r = await run(fn, done);
    if (r) {
      onChange(r);
      setMode("none");
    }
  }

  return (
    <section aria-label="예약 내용" className={panelCls}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted text-2xs">
            {b.typeLabel} · {b.durationMinutes}분 ·{" "}
            <span className={statusTone(b.status)}>{b.statusLabel}</span>
          </p>
          <p className="text-primary mt-2 text-lg tabular-nums">
            {when(b.startsAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-primary min-h-11 px-2 text-xs lg:hidden"
        >
          닫기
        </button>
      </div>

      {b.customer ? (
        <div className="text-sm">
          <Link
            href={`/admin/members/?id=${b.customer.id}`}
            className="text-primary hover:text-accent underline-offset-4 hover:underline"
          >
            {b.customer.name}
          </Link>
          <p className="text-secondary mt-1 text-xs">
            <a
              href={`mailto:${b.customer.email}`}
              className="hover:text-accent"
            >
              {b.customer.email}
            </a>
            {b.customer.phone && (
              <>
                {" · "}
                <a
                  href={`tel:${b.customer.phone.replace(/[^0-9]/g, "")}`}
                  className="hover:text-accent"
                >
                  {b.customer.phone}
                </a>
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="text-muted text-sm">탈퇴한 회원의 예약입니다.</p>
      )}

      {b.orderNumber && (
        <p className="text-sm">
          <span className="text-muted text-2xs">묶인 주문 </span>
          <Link
            href={`/admin/orders/?no=${encodeURIComponent(b.orderNumber)}`}
            className="text-accent tabular-nums underline-offset-4 hover:underline"
          >
            {b.orderNumber}
          </Link>
        </p>
      )}

      {b.customerNote && (
        <div>
          <p className="text-muted text-2xs">손님이 남긴 말</p>
          <p className="text-primary border-subtle mt-2 border-l-2 pl-4 text-sm leading-relaxed whitespace-pre-line">
            {b.customerNote}
          </p>
        </div>
      )}

      {b.status === "CANCELLED" && (
        <p className="text-muted text-xs">
          {b.cancelledBy === "ADMIN" ? "매장에서" : "손님이"} 취소 ·{" "}
          {b.cancelledAt && when(b.cancelledAt)}
          {b.cancelReason && ` — ${b.cancelReason}`}
        </p>
      )}

      {live && (
        <div className="flex flex-wrap gap-2">
          {b.status === "REQUESTED" && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                act(
                  () => confirmBooking(b.id),
                  "확정했습니다. 손님에게 메일이 갑니다.",
                )
              }
              className={btnPrimary}
            >
              확정
            </button>
          )}
          {b.status === "CONFIRMED" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  act(() => completeBooking(b.id), "완료로 바꿨습니다.")
                }
                className={btnPrimary}
              >
                다녀감 (완료)
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  act(() => noShowBooking(b.id), "불참으로 바꿨습니다.")
                }
                className={btnGhost}
              >
                오지 않음
              </button>
            </>
          )}
          <button
            type="button"
            aria-expanded={mode === "move"}
            onClick={() => setMode(mode === "move" ? "none" : "move")}
            className={btnGhost}
          >
            시간 옮기기
          </button>
          <button
            type="button"
            aria-expanded={mode === "cancel"}
            onClick={() => setMode(mode === "cancel" ? "none" : "cancel")}
            className={btnDanger}
          >
            취소
          </button>
        </div>
      )}

      {mode === "move" && (
        <div className="border-subtle flex flex-col gap-3 rounded-xl border p-4">
          <SlotPicker
            initialDate={kstDate(b.startsAt)}
            value={moveTo}
            onChange={setMoveTo}
            current={b.startsAt}
          />
          <p className="text-muted text-[0.65rem]">
            {b.status === "REQUESTED"
              ? "옮기면 확정도 함께 됩니다. "
              : ""}
            손님에게 바뀐 시간 메일이 갑니다.
          </p>
          <button
            type="button"
            disabled={busy || !moveTo || moveTo === b.startsAt}
            onClick={() =>
              moveTo &&
              act(
                () => rescheduleBooking(b.id, moveTo),
                "시간을 옮겼습니다. 손님에게 메일이 갑니다.",
              )
            }
            className={`${btnPrimary} w-fit`}
          >
            {moveTo ? `${when(moveTo)}로 옮기기` : "시간을 고르세요"}
          </button>
        </div>
      )}

      {mode === "cancel" && (
        <div className="border-subtle flex flex-col gap-3 rounded-xl border p-4">
          <Field label="취소 사유 (손님 메일에 들어갑니다 · 선택)" htmlFor="cancel-reason">
            <input
              id="cancel-reason"
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputCls}
            />
          </Field>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              act(
                () => cancelBooking(b.id, reason.trim()),
                "예약을 취소했습니다. 손님에게 메일이 갑니다.",
              )
            }
            className={`${btnDanger} w-fit`}
          >
            예약 취소하기
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Field label="매장 메모 (손님에게 보이지 않습니다)" htmlFor="booking-note">
          <textarea
            id="booking-note"
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${inputCls} leading-relaxed`}
          />
        </Field>
        <button
          type="button"
          disabled={busy || note === (b.adminNote ?? "")}
          onClick={() =>
            act(() => noteBooking(b.id, note.trim()), "메모를 저장했습니다.")
          }
          className={`${btnGhost} w-fit`}
        >
          메모 저장
        </button>
      </div>

      <Messages error={error} notice={notice} />
    </section>
  );
}
