"use client";

import { useEffect, useState } from "react";

import {
  FABRIC_STATUS_LABEL,
  GARMENTS,
  listFabrics,
  listStyles,
  memberMeasurements,
  openOrder,
  STYLE_CATEGORIES,
  updateOrder,
  type AdminFabric,
  type AdminMeasurement,
  type AdminOrderDetail,
  type AdminStyle,
  type Garment,
  type OrderInput,
} from "@/lib/admin";
import { dateOf } from "@/lib/api";

import {
  btnGhost,
  btnPrimary,
  errText,
  Field,
  inputCls,
  Messages,
  numOrNull,
  useAction,
} from "./ui";

/**
 * 맞춤 주문 양식 — 새로 열기(회원 화면에서)와 고치기(주문 화면에서)가 같이 쓴다.
 * 원단은 원단 목록에서, 치수는 그 손님의 치수 기록에서, 스타일은 묶음마다 하나씩 고른다(서버가 다시 확인한다).
 * 새로 열 때는 가장 최근 치수와 각 묶음의 기본 선택지를 미리 골라 둔다.
 */
export function OrderForm({
  memberId,
  initial,
  onSaved,
  onCancel,
}: {
  memberId: string | null;
  initial: AdminOrderDetail | null;
  onSaved: (d: AdminOrderDetail) => void;
  onCancel: () => void;
}) {
  const o = initial?.order;
  const [garment, setGarment] = useState<Garment>(
    (o?.summary.garment as Garment) ?? "SUIT_2PC",
  );
  const [title, setTitle] = useState(o?.summary.title ?? "");
  const [fabricId, setFabricId] = useState(initial?.fabricId ?? "");
  const [fabricNote, setFabricNote] = useState(o?.fabricNote ?? "");
  const [measurementId, setMeasurementId] = useState(
    initial?.measurementId ?? "",
  );
  const [styles, setStyles] = useState<Record<string, string>>(
    initial?.styleCodes ?? {},
  );
  const [price, setPrice] = useState(o?.priceKrw?.toString() ?? "");
  const [deposit, setDeposit] = useState(
    o && o.depositKrw ? o.depositKrw.toString() : "",
  );
  const [dueOn, setDueOn] = useState(o?.summary.dueOn ?? "");
  const [adminNote, setAdminNote] = useState(initial?.adminNote ?? "");
  const [message, setMessage] = useState("");

  const [fabrics, setFabrics] = useState<AdminFabric[] | null>(null);
  const [options, setOptions] = useState<AdminStyle[] | null>(null);
  const [measurements, setMeasurements] = useState<AdminMeasurement[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const { busy, error, run, setError } = useAction();

  useEffect(() => {
    let alive = true;
    Promise.all([
      listFabrics(),
      listStyles(),
      memberId ? memberMeasurements(memberId) : Promise.resolve([]),
    ])
      .then(([f, s, m]) => {
        if (!alive) return;
        setFabrics(f);
        setOptions(s);
        setMeasurements(m);
        if (!initial) {
          // 새 주문 — 최근 치수와 묶음마다 기본 선택지를 미리 골라 둔다
          if (m[0]) setMeasurementId(m[0].id);
          const defaults: Record<string, string> = {};
          s.filter((x) => x.enabled && x.isDefault).forEach(
            (x) => (defaults[x.category] = x.code),
          );
          setStyles(defaults);
        }
      })
      .catch((e) => alive && setLoadError(errText(e, "목록을 불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [memberId, initial]);

  async function save() {
    if (!title.trim()) {
      setError("주문 이름을 적어 주세요.");
      return;
    }
    const p = numOrNull(price);
    const d = numOrNull(deposit);
    if (p !== null && d !== null && d > p) {
      setError("계약금이 총액보다 클 수 없습니다.");
      return;
    }
    const body: OrderInput = {
      garment,
      title: title.trim(),
      fabricId: fabricId || null,
      fabricNote: fabricNote.trim(),
      measurementId: measurementId || null,
      styles: Object.fromEntries(Object.entries(styles).filter(([, v]) => v)),
      priceKrw: p,
      depositKrw: d,
      dueOn: dueOn || null,
      adminNote: adminNote.trim(),
    };
    const saved = await run(() =>
      initial
        ? updateOrder(initial.order.summary.orderNumber, body)
        : openOrder(memberId!, { ...body, message: message.trim() }),
    );
    if (saved) onSaved(saved);
  }

  const byCategory = (cat: string) =>
    (options ?? []).filter(
      (x) => x.category === cat && (x.enabled || styles[cat] === x.code),
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Field label="옷" htmlFor="o-garment">
          <select
            id="o-garment"
            value={garment}
            onChange={(e) => setGarment(e.target.value as Garment)}
            className={inputCls}
          >
            {GARMENTS.map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="주문 이름 (손님에게 보입니다)" htmlFor="o-title">
          <input
            id="o-title"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 결혼식 네이비 투피스"
            className={inputCls}
          />
        </Field>
      </div>

      <Messages error={loadError} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="원단" htmlFor="o-fabric">
          <select
            id="o-fabric"
            value={fabricId}
            disabled={!fabrics}
            onChange={(e) => setFabricId(e.target.value)}
            className={inputCls}
          >
            <option value="">{fabrics ? "아직 고르지 않음" : "불러오는 중"}</option>
            {(fabrics ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} · {f.code}
                {f.status !== "PUBLISHED" ? ` (${FABRIC_STATUS_LABEL[f.status]})` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="원단 메모 (목록에 없는 원단 · 손님 원단 등)" htmlFor="o-fabric-note">
          <input
            id="o-fabric-note"
            maxLength={200}
            value={fabricNote}
            onChange={(e) => setFabricNote(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field
        label="치수 기록"
        htmlFor="o-measure"
        hint={memberId ? undefined : "탈퇴한 회원이라 치수 기록을 고를 수 없습니다."}
      >
        <select
          id="o-measure"
          value={measurementId}
          disabled={!measurements || !memberId}
          onChange={(e) => setMeasurementId(e.target.value)}
          className={inputCls}
        >
          <option value="">
            {measurements && measurements.length === 0
              ? "치수 기록 없음 — 회원 화면에서 먼저 적어 주세요"
              : "고르지 않음"}
          </option>
          {(measurements ?? []).map((m, i) => (
            <option key={m.id} value={m.id}>
              {dateOf(m.measuredOn)} 측정 · {m.points.length}곳
              {i === 0 ? " (최근)" : ""}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-secondary text-2xs">스타일</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STYLE_CATEGORIES.map(([cat, label]) => {
            const list = byCategory(cat);
            if (list.length === 0) return null;
            return (
              <Field key={cat} label={label} htmlFor={`o-style-${cat}`}>
                <select
                  id={`o-style-${cat}`}
                  value={styles[cat] ?? ""}
                  onChange={(e) =>
                    setStyles((s) => ({ ...s, [cat]: e.target.value }))
                  }
                  className={inputCls}
                >
                  <option value="">고르지 않음</option>
                  {list.map((x) => (
                    <option key={x.id} value={x.code}>
                      {x.name}
                      {x.enabled ? "" : " (숨김)"}
                    </option>
                  ))}
                </select>
              </Field>
            );
          })}
        </div>
        {options && options.length === 0 && (
          <p className="text-muted text-xs">
            스타일 선택지가 아직 없습니다. 원단 · 스타일 화면에서 먼저 만들어 주세요.
          </p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="총액 (원)" htmlFor="o-price" hint="정해지지 않았으면 비워 둡니다.">
          <input
            id="o-price"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1,800,000"
            className={`${inputCls} tabular-nums`}
          />
        </Field>
        <Field label="계약금 (원)" htmlFor="o-deposit">
          <input
            id="o-deposit"
            inputMode="numeric"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="0"
            className={`${inputCls} tabular-nums`}
          />
        </Field>
        <Field label="수령 예정일" htmlFor="o-due">
          <input
            id="o-due"
            type="date"
            value={dueOn}
            onChange={(e) => setDueOn(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="매장 메모 (손님에게 보이지 않습니다)" htmlFor="o-note">
        <textarea
          id="o-note"
          rows={3}
          maxLength={2000}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          className={`${inputCls} leading-relaxed`}
        />
      </Field>

      {!initial && (
        <Field
          label="손님에게 보낼 첫 안내 (선택)"
          htmlFor="o-message"
          hint="주문 시작 메일과 마이페이지 진행 기록에 들어갑니다."
        >
          <textarea
            id="o-message"
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="오늘 상담 감사합니다. 다음 주에 치수를 잡겠습니다."
            className={`${inputCls} leading-relaxed`}
          />
        </Field>
      )}

      <Messages error={error} />

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "저장하는 중" : initial ? "고친 내용 저장" : "주문 시작"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          그만두기
        </button>
      </div>
    </form>
  );
}
