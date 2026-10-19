"use client";

import { useState } from "react";

import {
  recordMeasurement,
  updateMeasurement,
  type AdminMeasurement,
  type PointSpec,
} from "@/lib/admin";
import type { MeasurementPointView } from "@/lib/api";

import {
  btnGhost,
  btnPrimary,
  Field,
  inputCls,
  Messages,
  todayKst,
  useAction,
} from "./ui";

/**
 * 치수 적기 · 고치기 — 서버가 정한 측정 부위(체형 · 상의 · 하의)를 묶음별 칸으로. 빈 칸은 재지 않은 것.
 * 새로 적을 때는 지난 기록을 밑값으로 깔아 둔다(바뀐 곳만 고치면 되게). 범위를 벗어나면 저장 전에 알려 준다.
 */
export function MeasurementForm({
  memberId,
  specs,
  initial,
  seed,
  onSaved,
  onCancel,
}: {
  memberId: string;
  specs: PointSpec[];
  /** 고칠 기록 — 없으면 새 기록 */
  initial: AdminMeasurement | null;
  /** 새 기록의 밑값(지난 기록) */
  seed: AdminMeasurement | null;
  onSaved: (m: AdminMeasurement) => void;
  onCancel: () => void;
}) {
  const base = initial ?? seed;
  const [measuredOn, setMeasuredOn] = useState(
    initial?.measuredOn ?? todayKst(),
  );
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (base?.points ?? []).map((p) => [p.point, String(p.value)]),
    ),
  );
  const [bodyNote, setBodyNote] = useState(base?.bodyNote ?? "");
  const [adminNote, setAdminNote] = useState(initial?.adminNote ?? "");
  const { busy, error, run, setError } = useAction();

  const groups = groupSpecs(specs);

  async function save() {
    const points: Record<string, number> = {};
    for (const s of specs) {
      const raw = (values[s.point] ?? "").trim();
      if (!raw) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < s.min || n > s.max) {
        setError(`${s.label} 은 ${s.min}~${s.max}${s.unit} 사이여야 합니다.`);
        return;
      }
      points[s.point] = n;
    }
    if (Object.keys(points).length === 0) {
      setError("한 곳 이상 적어 주세요.");
      return;
    }
    if (measuredOn > todayKst()) {
      setError("측정일은 오늘이나 지난 날이어야 합니다.");
      return;
    }
    const body = {
      measuredOn,
      points,
      bodyNote: bodyNote.trim(),
      adminNote: adminNote.trim(),
    };
    const saved = await run(() =>
      initial
        ? updateMeasurement(initial.id, body)
        : recordMeasurement(memberId, body),
    );
    if (saved) onSaved(saved);
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-5"
    >
      <Field label="측정일" htmlFor="m-date" className="w-fit">
        <input
          id="m-date"
          type="date"
          max={todayKst()}
          value={measuredOn}
          onChange={(e) => setMeasuredOn(e.target.value)}
          className={inputCls}
        />
      </Field>

      {groups.map(([groupLabel, list]) => (
        <fieldset key={groupLabel} className="flex flex-col gap-3">
          <legend className="text-primary mb-1 text-sm font-medium">
            {groupLabel}
          </legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((s) => (
              <Field
                key={s.point}
                label={`${s.label} (${s.unit})`}
                htmlFor={`m-${s.point}`}
              >
                <input
                  id={`m-${s.point}`}
                  inputMode="decimal"
                  value={values[s.point] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [s.point]: e.target.value }))
                  }
                  placeholder={`${s.min}~${s.max}`}
                  className={`${inputCls} tabular-nums`}
                />
              </Field>
            ))}
          </div>
        </fieldset>
      ))}

      <Field
        label="체형 메모 (손님 마이페이지에 보입니다)"
        htmlFor="m-body"
      >
        <textarea
          id="m-body"
          rows={2}
          maxLength={1000}
          value={bodyNote}
          onChange={(e) => setBodyNote(e.target.value)}
          placeholder="예: 오른쪽 어깨가 1cm 낮음"
          className={`${inputCls} leading-relaxed`}
        />
      </Field>
      <Field label="매장 메모 (손님에게 보이지 않습니다)" htmlFor="m-admin">
        <textarea
          id="m-admin"
          rows={2}
          maxLength={1000}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          className={`${inputCls} leading-relaxed`}
        />
      </Field>

      <Messages error={error} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "저장하는 중" : initial ? "고친 치수 저장" : "치수 저장"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          그만두기
        </button>
      </div>
    </form>
  );
}

/** 체형 · 상의 · 하의 순서 그대로 묶는다 */
export function groupSpecs(specs: PointSpec[]) {
  const map = new Map<string, PointSpec[]>();
  specs.forEach((s) => map.set(s.groupLabel, [...(map.get(s.groupLabel) ?? []), s]));
  return [...map.entries()];
}

/** 기록 하나를 묶음별 표로 — 읽기 전용 */
export function MeasurementTable({ points }: { points: MeasurementPointView[] }) {
  const map = new Map<string, MeasurementPointView[]>();
  points.forEach((p) => map.set(p.groupLabel, [...(map.get(p.groupLabel) ?? []), p]));
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[...map.entries()].map(([group, list]) => (
        <dl key={group} className="text-sm">
          <dt className="text-muted text-2xs mb-1.5">{group}</dt>
          {list.map((p) => (
            <dd
              key={p.point}
              className="border-subtle flex justify-between gap-3 border-b py-1.5"
            >
              <span className="text-secondary">{p.label}</span>
              <span className="text-primary tabular-nums">
                {p.value}
                <span className="text-muted ml-0.5 text-[0.65rem]">{p.unit}</span>
              </span>
            </dd>
          ))}
        </dl>
      ))}
    </div>
  );
}
