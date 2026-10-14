"use client";

import Link from "next/link";
import { useState } from "react";

import { Field } from "@/components/ui/Field";
import { ApiError, login } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";

/** 로그인. 실패 문구는 서버가 준 것을 그대로 — "없는 이메일 / 틀린 비밀번호" 를 나누지 않는다. */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return setError("이메일과 비밀번호를 입력해 주세요.");
    setBusy(true);
    try {
      await login(email.trim(), password);
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next && next.startsWith("/") && !next.startsWith("//") ? next : "/mypage/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인하지 못했습니다.");
      setBusy(false);
    }
  }

  if (!API_CONNECTED) {
    return <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">화면 확인 단계입니다. 회원 서버는 아직 연결되지 않았습니다.</p>;
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field label="이메일" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="비밀번호" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid mt-2 flex min-h-14 items-center justify-center rounded-full text-sm transition-colors duration-300 disabled:opacity-60">
        {busy ? "로그인 중" : "로그인"}
      </button>
      <p className="text-muted text-center text-xs">
        아직 회원이 아니신가요? <Link href="/signup/" className="text-accent underline underline-offset-4">회원가입</Link>
      </p>
    </form>
  );
}
