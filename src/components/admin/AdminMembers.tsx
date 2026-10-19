"use client";

import { LockSimpleOpen, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  changeMemberRole,
  createBooking,
  deleteMeasurement,
  isSuperAdmin,
  listMembers,
  me,
  MEMBER_ROLE_LABEL,
  MEMBER_STATUS_LABEL,
  measurementPoints,
  memberMeasurements,
  memberOverview,
  reactivateMember,
  suspendMember,
  unlockMember,
  type AdminMeasurement,
  type AdminMember,
  type MemberOverview,
  type MemberStatus,
  type Paged,
  type PointSpec,
} from "@/lib/admin";
import {
  APPOINTMENT_TYPE_LABEL,
  dateOf,
  when,
  type AppointmentType,
  type CurrentUser,
} from "@/lib/api";

import { MeasurementForm, MeasurementTable } from "./MeasurementForm";
import { OrderForm } from "./OrderForm";
import { SlotPicker } from "./SlotPicker";
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
  todayKst,
  useAction,
  useQueryParam,
} from "./ui";

/**
 * 회원 · 치수 — 이름 · 이메일 · 전화번호로 찾고, 고르면 오른쪽에 그 손님의 모든 것: 정보 · 치수 기록 · 주문 · 다가오는 예약.
 * 여기서 치수를 적고, 맞춤 주문을 열고, 상담 예약을 잡는다(관리자가 잡는 예약은 바로 확정).
 * 정지 · 잠금 해제는 관리자, 권한(회원 ↔ 관리자)은 최고 관리자만. 서버가 다시 확인한다.
 */
const STATUS: [MemberStatus | null, string][] = [
  ["ACTIVE", "이용 중"],
  ["SUSPENDED", "정지"],
  ["WITHDRAWN", "탈퇴"],
  [null, "전체"],
];

export function AdminMembers() {
  const [selectedId, setSelectedId] = useQueryParam("id");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MemberStatus | null>("ACTIVE");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Paged<AdminMember> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<CurrentUser | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    me()
      .then((u) => alive && setViewer(u))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    listMembers(query, status, page)
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError(errText(e, "불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [query, status, page, reload]);

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
        <label htmlFor="member-q" className="sr-only">
          회원 찾기
        </label>
        <input
          id="member-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름 · 이메일 · 전화번호"
          className={inputCls}
        />
        <button type="submit" className={`${btnGhost} shrink-0`}>
          <MagnifyingGlass size={15} aria-hidden="true" />
          찾기
        </button>
      </form>

      <Chips<MemberStatus | null>
        label="상태로 거르기"
        options={STATUS}
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(0);
        }}
      />

      <Messages error={error} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          {!data && !error ? (
            <Loading />
          ) : data && data.items.length === 0 ? (
            <Empty>{query ? `"${query}" 에 맞는 회원이 없습니다.` : "회원이 없습니다."}</Empty>
          ) : (
            data && (
              <>
                <p className="text-muted text-2xs mb-2 tabular-nums">{data.total}명</p>
                <ul className="border-subtle divide-subtle divide-y border-y">
                  {data.items.map((m) => {
                    const on = selectedId === m.id;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          aria-current={on ? "true" : undefined}
                          onClick={() => setSelectedId(m.id)}
                          className={`ease-fluid w-full px-3 py-3.5 text-left transition-colors duration-300 ${on ? "bg-surface" : "hover:bg-surface/60"}`}
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="text-primary truncate text-sm">{m.name}</span>
                            <span className="text-2xs shrink-0">
                              {m.role !== "MEMBER" && (
                                <span className="text-accent mr-2">{MEMBER_ROLE_LABEL[m.role]}</span>
                              )}
                              {m.locked && <span className="text-error mr-2">잠김</span>}
                              {m.status !== "ACTIVE" && (
                                <span className="text-muted">{MEMBER_STATUS_LABEL[m.status]}</span>
                              )}
                            </span>
                          </span>
                          <span className="text-muted text-2xs mt-0.5 block truncate tabular-nums">
                            {m.phone ?? "전화 없음"} · {m.email}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />
              </>
            )
          )}
        </div>

        {selectedId ? (
          <MemberPanel
            key={selectedId}
            memberId={selectedId}
            viewer={viewer}
            onChanged={() => setReload((n) => n + 1)}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <PickHint>왼쪽에서 회원을 고르세요.</PickHint>
        )}
      </div>
    </div>
  );
}

type Mode = "none" | "measure" | "order" | "booking";

function MemberPanel({
  memberId,
  viewer,
  onChanged,
  onClose,
}: {
  memberId: string;
  viewer: CurrentUser | null;
  onChanged: () => void;
  onClose: () => void;
}) {
  const [o, setO] = useState<MemberOverview | null>(null);
  const [records, setRecords] = useState<AdminMeasurement[] | null>(null);
  const [specs, setSpecs] = useState<PointSpec[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("none");
  const [editing, setEditing] = useState<AdminMeasurement | null>(null);
  const [openRecord, setOpenRecord] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const { busy, error, notice, run, reset } = useAction();
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    Promise.all([memberOverview(memberId), memberMeasurements(memberId), measurementPoints()])
      .then(([ov, ms, sp]) => {
        if (!alive) return;
        setO(ov);
        setRecords(ms);
        setSpecs(sp);
        setOpenRecord((cur) => cur ?? ms[0]?.id ?? null);
      })
      .catch((e) => alive && setLoadError(errText(e, "회원 정보를 불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [memberId, reload]);

  if (loadError)
    return (
      <section className={panelCls}>
        <Messages error={loadError} />
      </section>
    );
  if (!o || !records || !specs)
    return (
      <section className={panelCls}>
        <Loading />
      </section>
    );

  const m = o.member;
  const active = m.status === "ACTIVE";
  const self = viewer?.email.toLowerCase() === m.email.toLowerCase();
  const canRole = isSuperAdmin(viewer) && !self && active && m.role !== "SUPER_ADMIN";
  const inProgress = o.orders.filter((x) => x.status === "IN_PROGRESS");

  function open(next: Mode) {
    reset();
    setEditing(null);
    setMode(mode === next ? "none" : next);
  }

  async function act(fn: () => Promise<void>, done: string) {
    const ok = await run(async () => {
      await fn();
      return true;
    }, done);
    if (ok) {
      setReload((n) => n + 1);
      onChanged();
    }
  }

  return (
    <section aria-label="회원 정보" className={panelCls}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted text-2xs">
            {MEMBER_ROLE_LABEL[m.role]} · {MEMBER_STATUS_LABEL[m.status]} · {dateOf(m.createdAt)} 가입
            {m.lastLoginAt && ` · 마지막 로그인 ${when(m.lastLoginAt)}`}
          </p>
          <h2 className="text-primary mt-2 text-lg">{m.name}</h2>
          <p className="text-secondary mt-1 text-xs">
            <a href={`mailto:${m.email}`} className="hover:text-accent">
              {m.email}
            </a>
            {m.phone && (
              <>
                {" · "}
                <a href={`tel:${m.phone.replace(/[^0-9]/g, "")}`} className="hover:text-accent">
                  {m.phone}
                </a>
              </>
            )}
            {m.loginId && ` · 아이디 ${m.loginId}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-primary min-h-11 shrink-0 px-2 text-xs lg:hidden"
        >
          닫기
        </button>
      </div>

      {m.locked && (
        <div className="bg-band flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
          <p className="text-error text-sm">비밀번호를 여러 번 틀려 잠긴 계정입니다.</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => act(() => unlockMember(m.id), "잠금을 풀었습니다.")}
            className={btnGhost}
          >
            <LockSimpleOpen size={15} aria-hidden="true" />
            잠금 풀기
          </button>
        </div>
      )}

      {active && (
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-expanded={mode === "measure"} onClick={() => open("measure")} className={btnPrimary}>
            새 치수 적기
          </button>
          <button type="button" aria-expanded={mode === "order"} onClick={() => open("order")} className={btnGhost}>
            맞춤 주문 시작
          </button>
          <button type="button" aria-expanded={mode === "booking"} onClick={() => open("booking")} className={btnGhost}>
            예약 잡기
          </button>
        </div>
      )}

      {mode === "measure" && (
        <Box title={editing ? `${dateOf(editing.measuredOn)} 치수 고치기` : "새 치수"}>
          <MeasurementForm
            key={editing?.id ?? "new"}
            memberId={m.id}
            specs={specs}
            initial={editing}
            seed={records[0] ?? null}
            onSaved={(saved) => {
              setMode("none");
              setEditing(null);
              setOpenRecord(saved.id);
              setReload((n) => n + 1);
            }}
            onCancel={() => {
              setMode("none");
              setEditing(null);
            }}
          />
        </Box>
      )}

      {mode === "order" && (
        <Box title="맞춤 주문 시작">
          <OrderForm
            memberId={m.id}
            initial={null}
            onSaved={(d) => {
              router.push(`/admin/orders/?no=${encodeURIComponent(d.order.summary.orderNumber)}`);
            }}
            onCancel={() => setMode("none")}
          />
        </Box>
      )}

      {mode === "booking" && (
        <Box title="예약 잡기 (바로 확정)">
          <BookingCreate
            memberId={m.id}
            orders={inProgress.map((x) => [x.orderNumber, x.title])}
            onDone={() => {
              setMode("none");
              setReload((n) => n + 1);
            }}
            onCancel={() => setMode("none")}
          />
        </Box>
      )}

      <Messages error={error} notice={notice} />

      <div>
        <h3 className="text-primary text-sm font-medium">
          치수 기록 <span className="text-muted text-2xs tabular-nums">{records.length}</span>
        </h3>
        {records.length === 0 ? (
          <p className="text-muted mt-2 text-sm">아직 치수 기록이 없습니다.</p>
        ) : (
          <ul className="border-subtle divide-subtle mt-3 divide-y border-y">
            {records.map((r, i) => {
              const shown = openRecord === r.id;
              return (
                <li key={r.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      aria-expanded={shown}
                      onClick={() => setOpenRecord(shown ? null : r.id)}
                      className="text-primary hover:text-accent min-h-11 text-left text-sm"
                    >
                      {dateOf(r.measuredOn)} 측정
                      <span className="text-muted text-2xs ml-2">
                        {r.points.length}곳{i === 0 ? " · 최근" : ""}
                      </span>
                    </button>
                    {active && (
                      <span className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            reset();
                            setEditing(r);
                            setMode("measure");
                          }}
                          className="text-secondary hover:text-accent min-h-11 px-2 text-xs"
                        >
                          고치기
                        </button>
                        <DeleteButton
                          disabled={busy}
                          onConfirm={() =>
                            act(() => deleteMeasurement(r.id), "치수 기록을 지웠습니다.")
                          }
                        />
                      </span>
                    )}
                  </div>
                  {shown && (
                    <div className="mt-3 flex flex-col gap-3">
                      <MeasurementTable points={r.points} />
                      {r.bodyNote && <p className="text-secondary text-xs">체형 메모 — {r.bodyNote}</p>}
                      {r.adminNote && <p className="text-muted text-xs">매장 메모 — {r.adminNote}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-primary text-sm font-medium">맞춤 주문</h3>
          {o.orders.length === 0 ? (
            <p className="text-muted mt-2 text-sm">주문이 없습니다.</p>
          ) : (
            <ul className="border-subtle divide-subtle mt-3 divide-y border-y text-sm">
              {o.orders.map((x) => (
                <li key={x.orderNumber}>
                  <Link
                    href={`/admin/orders/?no=${encodeURIComponent(x.orderNumber)}`}
                    className="hover:bg-band/60 flex items-baseline justify-between gap-3 px-2 py-2.5"
                  >
                    <span className="text-primary truncate">{x.title}</span>
                    <span
                      className={`text-2xs shrink-0 ${x.status === "IN_PROGRESS" ? "text-accent" : "text-muted"}`}
                    >
                      {x.status === "IN_PROGRESS" ? x.stageLabel : x.statusLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="text-primary text-sm font-medium">다가오는 예약</h3>
          {o.upcoming.length === 0 ? (
            <p className="text-muted mt-2 text-sm">다가오는 예약이 없습니다.</p>
          ) : (
            <ul className="border-subtle divide-subtle mt-3 divide-y border-y text-sm">
              {o.upcoming.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/?id=${b.id}`}
                    className="hover:bg-band/60 flex items-baseline justify-between gap-3 px-2 py-2.5"
                  >
                    <span className="text-primary tabular-nums">{when(b.startsAt)}</span>
                    <span className="text-secondary text-2xs">
                      {b.typeLabel} · {b.statusLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!self && m.status !== "WITHDRAWN" && (
        <div className="border-subtle flex flex-col gap-3 border-t pt-5">
          <h3 className="text-muted text-2xs">계정 관리</h3>
          <div className="flex flex-wrap items-center gap-2">
            {m.status === "ACTIVE" ? (
              <ConfirmButton
                label="이용 정지"
                confirmLabel="정말 정지 (로그인 못 함)"
                disabled={busy}
                onConfirm={() => act(() => suspendMember(m.id), "이용을 정지했습니다.")}
              />
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => act(() => reactivateMember(m.id), "다시 이용할 수 있게 했습니다.")}
                className={btnGhost}
              >
                정지 풀기
              </button>
            )}
            {canRole && (
              <ConfirmButton
                label={m.role === "ADMIN" ? "관리자 권한 빼기" : "관리자로 바꾸기"}
                confirmLabel={m.role === "ADMIN" ? "정말 권한 빼기" : "정말 관리자로"}
                disabled={busy}
                tone="ghost"
                onConfirm={() =>
                  act(
                    () => changeMemberRole(m.id, m.role === "ADMIN" ? "MEMBER" : "ADMIN"),
                    "권한을 바꿨습니다.",
                  )
                }
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function BookingCreate({
  memberId,
  orders,
  onDone,
  onCancel,
}: {
  memberId: string;
  orders: [string, string][];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<AppointmentType>("CONSULTATION");
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [note, setNote] = useState("");
  const { busy, error, run } = useAction();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="목적" htmlFor="b-type">
          <select
            id="b-type"
            value={type}
            onChange={(e) => setType(e.target.value as AppointmentType)}
            className={inputCls}
          >
            {(Object.keys(APPOINTMENT_TYPE_LABEL) as AppointmentType[]).map((t) => (
              <option key={t} value={t}>
                {APPOINTMENT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="묶을 주문 (가봉 · 수령이면)" htmlFor="b-order">
          <select
            id="b-order"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className={inputCls}
          >
            <option value="">묶지 않음</option>
            {orders.map(([no, title]) => (
              <option key={no} value={no}>
                {title} · {no}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <SlotPicker initialDate={todayKst()} value={startsAt} onChange={setStartsAt} />
      <Field label="매장 메모 (손님에게 보이지 않습니다)" htmlFor="b-note">
        <input
          id="b-note"
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputCls}
        />
      </Field>
      <Messages error={error} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !startsAt}
          onClick={async () => {
            const r = await run(() =>
              createBooking(memberId, {
                type,
                startsAt: startsAt!,
                adminNote: note.trim(),
                orderNumber: orderNumber || null,
              }),
            );
            if (r) onDone();
          }}
          className={btnPrimary}
        >
          {startsAt ? `${when(startsAt)} 예약 잡기` : "시간을 고르세요"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          그만두기
        </button>
      </div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-subtle flex flex-col gap-4 rounded-xl border p-4 md:p-5">
      <h3 className="text-primary text-sm font-medium">{title}</h3>
      {children}
    </div>
  );
}

/** 한 번 더 눌러야 실행되는 단추 — 되돌리기 어려운 일(정지 · 권한 · 지우기) */
function ConfirmButton({
  label,
  confirmLabel,
  disabled,
  onConfirm,
  tone = "danger",
}: {
  label: string;
  confirmLabel: string;
  disabled?: boolean;
  onConfirm: () => void;
  tone?: "danger" | "ghost";
}) {
  const [armed, setArmed] = useState(false);
  return (
    <span className="inline-flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (armed) {
            setArmed(false);
            onConfirm();
          } else setArmed(true);
        }}
        className={tone === "danger" || armed ? btnDanger : btnGhost}
      >
        {armed ? confirmLabel : label}
      </button>
      {armed && (
        <button type="button" onClick={() => setArmed(false)} className="text-muted hover:text-primary min-h-11 px-2 text-xs">
          아니요
        </button>
      )}
    </span>
  );
}

function DeleteButton({ disabled, onConfirm }: { disabled?: boolean; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
      className={`min-h-11 px-2 text-xs ${armed ? "text-error font-medium" : "text-muted hover:text-error"}`}
    >
      {armed ? "정말 지우기" : "지우기"}
    </button>
  );
}
