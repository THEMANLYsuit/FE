"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { dateOf, myInquiries, type Inquiry } from "@/lib/api";

/** 마이페이지 · 문의 탭 — 내가 보낸 문의와 답변. 답변 메일의 "내 문의" 링크가 이 탭(#inquiries)을 연다. */
export function MyInquiries() {
  const [list, setList] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    myInquiries()
      .then((l) => alive && setList(l))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "불러오지 못했습니다."));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section aria-labelledby="inquiries-heading" className="border-subtle bg-surface border p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 id="inquiries-heading" className="text-primary text-sm font-medium">
          내 문의
        </h2>
        <Link href="/contact/" className="text-accent inline-flex min-h-11 items-center text-xs underline underline-offset-4">
          새로 문의
        </Link>
      </div>
      {error && (
        <p role="alert" className="text-error mt-3 text-sm">
          {error}
        </p>
      )}
      {list === null ? (
        !error && (
          <p aria-busy="true" className="text-muted mt-3 text-sm">
            불러오는 중
          </p>
        )
      ) : list.length === 0 ? (
        <p className="text-secondary mt-3 text-sm">
          아직 보낸 문의가 없습니다.{" "}
          <Link href="/contact/" className="text-accent underline underline-offset-4">
            문의하기
          </Link>
        </p>
      ) : (
        <ul className="divide-subtle mt-4 divide-y">
          {list.map((q) => (
            <li key={q.id} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-muted text-2xs">
                  {dateOf(q.createdAt)} · {q.topicLabel}
                </p>
                <span className={`text-2xs ${q.status === "ANSWERED" ? "text-success" : q.status === "CLOSED" ? "text-muted" : "text-accent"}`}>
                  {q.statusLabel}
                </span>
              </div>
              <p className="text-primary mt-2 text-sm leading-relaxed break-words whitespace-pre-line">{q.message}</p>
              {q.answer && (
                <div className="border-accent bg-band mt-4 border-l-2 px-4 py-3">
                  <p className="text-accent tracking-label text-[0.6rem]">
                    THE MANLY 답변{q.answeredAt ? ` · ${dateOf(q.answeredAt)}` : ""}
                  </p>
                  <p className="text-secondary mt-1.5 text-sm leading-relaxed break-words whitespace-pre-line">{q.answer}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
