"use client";

import { useEffect, useState } from "react";

import {
  answerInquiry,
  ApiError,
  closeInquiry,
  listInquiries,
  type AdminInquiry,
  type AdminInquiryPage,
} from "@/lib/admin";
import { dateOf, timeOf, type InquiryStatus } from "@/lib/api";

/**
 * 문의 답변 — 왼쪽 목록(답 기다리는 것부터), 오른쪽 고른 문의와 답 쓰는 칸. 답하면 손님에게 메일이 가고(서버 InquiryNotifier)
 * 회원이면 마이페이지 문의 탭에도 보인다. 답을 고쳐 다시 보낼 수 있고, 끝난 문의는 닫는다(닫으면 더 답하지 못한다).
 */
const FILTERS: [InquiryStatus | null, string][] = [
  ["OPEN", "답 기다림"],
  ["ANSWERED", "답함"],
  ["CLOSED", "닫음"],
  [null, "전체"],
];

export function AdminInquiries() {
  const [status, setStatus] = useState<InquiryStatus | null>("OPEN");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminInquiryPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminInquiry | null>(null);

  useEffect(() => {
    let alive = true;
    listInquiries(status, page)
      .then((d) => alive && setData(d))
      .catch(
        (e) =>
          alive &&
          setError(e instanceof ApiError ? e.message : "불러오지 못했습니다."),
      );
    return () => {
      alive = false;
    };
  }, [status, page]);

  /** 답하거나 닫은 뒤 — 목록의 그 줄과 오른쪽을 서버가 준 값으로 바꾼다(목록을 다시 받지 않는다) */
  function replace(updated: AdminInquiry) {
    setSelected(updated);
    setData((d) =>
      d
        ? {
            ...d,
            items: d.items.map((i) => (i.id === updated.id ? updated : i)),
          }
        : d,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="group"
        aria-label="상태로 거르기"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map(([key, label]) => {
          const on = status === key;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setStatus(key);
                setPage(0);
                setSelected(null);
              }}
              className={`ease-fluid inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm transition-colors duration-300 ${
                on
                  ? "border-accent bg-accent text-on-accent"
                  : "border-interactive text-secondary hover:border-accent hover:text-primary"
              }`}
            >
              {label}
              {key === "OPEN" && data ? (
                <span className="tabular-nums opacity-80">
                  {data.openCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      {!data && !error && (
        <p aria-busy="true" className="text-muted text-sm">
          불러오는 중
        </p>
      )}

      {data && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            {data.items.length === 0 ? (
              <p className="border-subtle bg-surface text-muted rounded-2xl border px-5 py-10 text-center text-sm">
                문의가 없습니다.
              </p>
            ) : (
              <ul className="border-subtle divide-subtle divide-y border-y">
                {data.items.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      aria-current={selected?.id === q.id ? "true" : undefined}
                      onClick={() => setSelected(q)}
                      className={`ease-fluid w-full px-3 py-4 text-left transition-colors duration-300 ${selected?.id === q.id ? "bg-surface" : "hover:bg-surface/60"}`}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-primary text-sm">
                          {q.name}{" "}
                          <span className="text-muted text-2xs">
                            · {q.topicLabel}
                          </span>
                        </span>
                        <span
                          className={`text-2xs ${q.status === "OPEN" ? "text-accent" : q.status === "ANSWERED" ? "text-success" : "text-muted"}`}
                        >
                          {q.statusLabel}
                        </span>
                      </span>
                      <span className="text-secondary mt-1 line-clamp-2 block text-xs leading-relaxed">
                        {q.message}
                      </span>
                      <span className="text-muted mt-1 block text-[0.65rem] tabular-nums">
                        {dateOf(q.createdAt)} {timeOf(q.createdAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {data.totalPages > 1 && (
              <nav
                aria-label="쪽 이동"
                className="mt-4 flex items-center justify-center gap-4 text-sm"
              >
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="text-secondary min-h-11 disabled:opacity-40"
                >
                  이전
                </button>
                <span className="text-muted text-2xs tabular-nums">
                  {page + 1} / {data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="text-secondary min-h-11 disabled:opacity-40"
                >
                  다음
                </button>
              </nav>
            )}
          </div>

          {selected ? (
            <Detail key={selected.id} inquiry={selected} onChange={replace} />
          ) : (
            <p className="border-subtle text-muted hidden rounded-2xl border border-dashed px-5 py-16 text-center text-sm lg:block">
              왼쪽에서 문의를 고르세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({
  inquiry: q,
  onChange,
}: {
  inquiry: AdminInquiry;
  onChange: (q: AdminInquiry) => void;
}) {
  const [answer, setAnswer] = useState(q.answer ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const closed = q.status === "CLOSED";

  async function run(action: () => Promise<AdminInquiry>, done: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      onChange(await action());
      setNotice(done);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="문의 내용"
      className="border-subtle bg-surface flex flex-col gap-5 rounded-2xl border p-5 md:p-7"
    >
      <div>
        <p className="text-muted text-2xs">
          {q.topicLabel} · {dateOf(q.createdAt)} {timeOf(q.createdAt)} ·{" "}
          {q.memberId ? "회원" : "비회원"}
        </p>
        <p className="text-primary mt-2 text-base">{q.name}</p>
        <p className="text-secondary mt-1 text-xs">
          <a
            href={`mailto:${q.email}`}
            className="hover:text-accent underline-offset-4 hover:underline"
          >
            {q.email}
          </a>
          {q.phone && (
            <>
              {" · "}
              <a
                href={`tel:${q.phone.replace(/[^0-9]/g, "")}`}
                className="hover:text-accent underline-offset-4 hover:underline"
              >
                {q.phone}
              </a>
            </>
          )}
        </p>
      </div>
      <p className="text-primary border-subtle border-l-2 pl-4 text-sm leading-relaxed break-words whitespace-pre-line">
        {q.message}
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="answer" className="text-secondary text-2xs">
          {q.answer
            ? `답변 (${q.answeredAt ? dateOf(q.answeredAt) : ""} 보냄 — 고쳐서 다시 보낼 수 있습니다)`
            : "답변"}
        </label>
        <textarea
          id="answer"
          rows={7}
          maxLength={3000}
          disabled={closed}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="손님에게 메일로 그대로 갑니다."
          className="text-primary placeholder:text-muted/60 border-interactive focus-visible:border-accent w-full rounded-xl border bg-transparent px-4 py-3 text-sm leading-relaxed disabled:opacity-50"
        />
      </div>

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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || closed || !answer.trim()}
          onClick={() =>
            run(
              () => answerInquiry(q.id, answer.trim()),
              "답을 보냈습니다. 손님에게 메일이 갑니다.",
            )
          }
          className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid inline-flex min-h-11 items-center rounded-full px-6 text-sm transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "보내는 중" : q.answer ? "고쳐서 다시 보내기" : "답 보내기"}
        </button>
        {!closed && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => closeInquiry(q.id), "문의를 닫았습니다.")}
            className="border-interactive text-secondary hover:border-accent hover:text-primary ease-fluid inline-flex min-h-11 items-center rounded-full border px-5 text-sm transition-colors duration-300 disabled:opacity-50"
          >
            닫기
          </button>
        )}
      </div>
    </section>
  );
}
