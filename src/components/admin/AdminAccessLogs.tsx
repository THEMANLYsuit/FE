"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";

import { listAccessLogs, type AccessLogRow, type Paged } from "@/lib/admin";
import { dateOf, timeOf } from "@/lib/api";

import {
  addDays,
  btnGhost,
  Empty,
  errText,
  Field,
  inputCls,
  Loading,
  Messages,
  Pager,
  todayKst,
} from "./ui";

/**
 * 접속 기록 (최고 관리자만) — 관리자가 손님 정보를 언제 · 무엇을 열고 바꿨는지(서버 V10 admin_access_log).
 * 기간과 경로 글자로 찾는다: 주문번호나 회원 id 를 넣으면 "누가 이걸 봤나" 가 나온다. 사람 이메일을 누르면 그 사람 것만.
 * 50줄씩, 최근 것부터. 서버가 막은 요청(로그인 안 됨 · 권한 없음)은 여기 남지 않는다.
 */
const METHOD_LABEL: Record<string, string> = {
  GET: "열람",
  POST: "실행",
  PUT: "수정",
  PATCH: "수정",
  DELETE: "삭제",
};

export function AdminAccessLogs() {
  const today = todayKst();
  const [from, setFrom] = useState(addDays(today, -6));
  const [to, setTo] = useState(today);
  const [q, setQ] = useState("");
  const [actor, setActor] = useState<{ id: string; email: string } | null>(null);
  const [filter, setFilter] = useState({ from: addDays(today, -6), to: today, q: "" });
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Paged<AccessLogRow> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listAccessLogs({ ...filter, actorId: actor?.id ?? null, page })
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError(errText(e, "불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [filter, actor, page]);

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (from && to && from > to) {
            setError("시작일이 끝일보다 늦습니다.");
            return;
          }
          setFilter({ from, to, q });
          setPage(0);
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <Field label="부터" htmlFor="log-from">
          <input id="log-from" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={`${inputCls} w-fit`} />
        </Field>
        <Field label="까지" htmlFor="log-to">
          <input id="log-to" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={`${inputCls} w-fit`} />
        </Field>
        <Field label="경로에 든 글자 (주문번호 · 회원 id)" htmlFor="log-q" className="min-w-56 flex-1">
          <input id="log-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="TM20261016…" className={inputCls} />
        </Field>
        <button type="submit" className={btnGhost}>
          <MagnifyingGlass size={15} aria-hidden="true" />
          찾기
        </button>
      </form>

      {actor && (
        <p className="flex items-center gap-2 text-sm">
          <span className="text-muted text-2xs">사람</span>
          <span className="text-primary">{actor.email}</span>
          <button
            type="button"
            aria-label="사람 거르기 풀기"
            onClick={() => {
              setActor(null);
              setPage(0);
            }}
            className="text-muted hover:text-primary flex h-11 w-11 items-center justify-center"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </p>
      )}

      <Messages error={error} />

      {!data && !error ? (
        <Loading />
      ) : data && data.items.length === 0 ? (
        <Empty>이 기간에 남은 기록이 없습니다.</Empty>
      ) : (
        data && (
          <div>
            <p className="text-muted text-2xs mb-2 tabular-nums">{data.total}건</p>
            <div className="border-subtle overflow-x-auto border-y">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">관리자 접속 기록</caption>
                <thead className="text-muted text-2xs">
                  <tr className="border-subtle border-b">
                    <th scope="col" className="py-2.5 pr-4 font-normal">때</th>
                    <th scope="col" className="py-2.5 pr-4 font-normal">사람</th>
                    <th scope="col" className="py-2.5 pr-4 font-normal">한 일</th>
                    <th scope="col" className="py-2.5 pr-4 font-normal">경로</th>
                    <th scope="col" className="py-2.5 pr-4 font-normal">결과</th>
                    <th scope="col" className="py-2.5 font-normal">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-subtle divide-y">
                  {data.items.map((r) => (
                    <tr key={r.id}>
                      <td className="text-secondary py-2.5 pr-4 whitespace-nowrap tabular-nums">
                        {dateOf(r.createdAt).replace(/^\d+년 /, "")} {timeOf(r.createdAt)}
                      </td>
                      <td className="py-2.5 pr-4">
                        {r.actorId && r.actorEmail ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActor({ id: r.actorId!, email: r.actorEmail! });
                              setPage(0);
                            }}
                            className="text-primary hover:text-accent text-left underline-offset-4 hover:underline"
                          >
                            {r.actorEmail}
                          </button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className={`py-2.5 pr-4 whitespace-nowrap ${r.method === "GET" ? "text-secondary" : "text-accent"}`}>
                        {METHOD_LABEL[r.method] ?? r.method}
                      </td>
                      <td className="text-primary max-w-[26rem] py-2.5 pr-4 font-mono text-xs break-all">{r.path}</td>
                      <td className={`py-2.5 pr-4 tabular-nums ${r.status >= 400 ? "text-error" : "text-muted"}`}>{r.status}</td>
                      <td className="text-muted py-2.5 font-mono text-xs">{r.ip ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </div>
        )
      )}
    </div>
  );
}
