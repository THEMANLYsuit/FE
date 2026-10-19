"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { ApiError } from "@/lib/admin";

/**
 * 관리자 화면들이 같이 쓰는 작은 부품 — 칸 · 단추 모양, 거르기 알약, 쪽 이동, 알림 줄, 한국 날짜 계산, 주소의 ?값.
 * 화면마다 모양이 조금씩 달라지지 않게 여기 한곳에 둔다.
 */

export const inputCls =
  "text-primary placeholder:text-muted/60 border-interactive focus-visible:border-accent min-h-11 w-full rounded-xl border bg-transparent px-4 py-2.5 text-base md:text-sm disabled:opacity-50";
export const labelCls = "text-secondary text-2xs";
export const btnPrimary =
  "bg-accent text-on-accent hover:bg-accent-hover ease-fluid inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost =
  "border-interactive text-secondary hover:border-accent hover:text-primary ease-fluid inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50";
export const btnDanger =
  "border-error/60 text-error hover:bg-error/10 ease-fluid inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50";
export const panelCls =
  "border-subtle bg-surface flex flex-col gap-5 rounded-2xl border p-5 md:p-7";

export const errText = (e: unknown, fallback = "처리하지 못했습니다.") =>
  e instanceof ApiError ? e.message : fallback;

/** 칸 하나 — 이름 위, 칸 아래. 도움말은 칸 밑에 작게. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
      {hint && <p className="text-muted text-[0.65rem]">{hint}</p>}
    </div>
  );
}

/** 상태로 거르기 — 고른 것은 채워진 알약 */
export function Chips<T>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(([key, text]) => {
        const on = value === key;
        return (
          <button
            key={text}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(key)}
            className={`ease-fluid inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm transition-colors duration-300 ${
              on
                ? "border-accent bg-accent text-on-accent"
                : "border-interactive text-secondary hover:border-accent hover:text-primary"
            }`}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="쪽 이동"
      className="mt-4 flex items-center justify-center gap-4 text-sm"
    >
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="text-secondary hover:text-accent min-h-11 px-2 disabled:opacity-40"
      >
        이전
      </button>
      <span className="text-muted text-2xs tabular-nums">
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page + 1 >= totalPages}
        onClick={() => onChange(page + 1)}
        className="text-secondary hover:text-accent min-h-11 px-2 disabled:opacity-40"
      >
        다음
      </button>
    </nav>
  );
}

export function Loading() {
  return (
    <p aria-busy="true" className="text-muted text-sm">
      불러오는 중
    </p>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="border-subtle bg-surface text-muted rounded-2xl border px-5 py-10 text-center text-sm">
      {children}
    </p>
  );
}

export function Messages({
  error,
  notice,
}: {
  error: string | null;
  notice?: string | null;
}) {
  return (
    <>
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-success text-sm">
          {notice}
        </p>
      )}
    </>
  );
}

/** 오른쪽 상세가 비었을 때(넓은 화면만) */
export function PickHint({ children }: { children: ReactNode }) {
  return (
    <p className="border-subtle text-muted hidden rounded-2xl border border-dashed px-5 py-16 text-center text-sm lg:block">
      {children}
    </p>
  );
}

/**
 * 단추 하나를 눌러 서버를 부를 때 — 도는 동안 막고, 실패하면 서버 문구, 성공하면 안내 한 줄.
 * run 은 성공하면 결과를, 실패하면 undefined 를 돌려준다.
 */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const run = useCallback(
    async <T,>(action: () => Promise<T>, done?: string) => {
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        const result = await action();
        if (done) setNotice(done);
        return result;
      } catch (e) {
        setError(errText(e));
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  const reset = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);
  return { busy, error, notice, run, reset, setError };
}

/**
 * 주소의 ?값 하나 — 상세를 고르면 주소에도 남겨(새로고침 · 링크 공유) 다시 열 때 그대로 연다.
 * 정적 내보내기라 useSearchParams 대신 첫 그림 뒤에 직접 읽는다.
 */
export function useQueryParam(name: string) {
  const [state, setState] = useState<{ value: string | null; ready: boolean }>(
    { value: null, ready: false },
  );
  useEffect(() => {
    // 첫 그림 뒤에 한 번 — 정적 그림과 어긋나지 않게
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ value: new URLSearchParams(window.location.search).get(name), ready: true });
  }, [name]);
  const set = useCallback(
    (v: string | null) => {
      setState({ value: v, ready: true });
      const url = new URL(window.location.href);
      if (v) url.searchParams.set(name, v);
      else url.searchParams.delete(name);
      window.history.replaceState(null, "", url);
    },
    [name],
  );
  return [state.value, set, state.ready] as const;
}

// ── 한국 날짜 (yyyy-MM-dd) ──────────────────────────────────

const YMD = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
/** ISO 시각 → 그 시각의 한국 날짜 */
export const kstDate = (iso: string | Date) =>
  YMD.format(typeof iso === "string" ? new Date(iso) : iso);
export const todayKst = () => kstDate(new Date());
export const addDays = (ymd: string, n: number) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
/** 그 주 월요일 */
export const mondayOf = (ymd: string) => {
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay(); // 0 = 일
  return addDays(ymd, dow === 0 ? -6 : 1 - dow);
};
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
export const weekdayOf = (ymd: string) =>
  WEEKDAY[new Date(`${ymd}T00:00:00Z`).getUTCDay()];
/** 10월 14일 (화) */
export const shortDate = (ymd: string) =>
  `${Number(ymd.slice(5, 7))}월 ${Number(ymd.slice(8, 10))}일 (${weekdayOf(ymd)})`;

/** 숫자 칸 → 숫자 또는 null (쉼표 · 원 허용) */
export const numOrNull = (v: string) => {
  const t = v.replace(/[,\s원]/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
