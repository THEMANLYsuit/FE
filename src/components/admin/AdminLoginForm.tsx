"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Field } from "@/components/ui/Field";
import { adminLogin, ApiError, isAdmin } from "@/lib/admin";
import { API_CONNECTED } from "@/lib/site";

/**
 * 관리자 로그인 — 아이디(또는 이메일) + 비밀번호. 실패 문구는 서버 것 그대로(없는 아이디 / 틀린 비밀번호를 나누지 않는다).
 * 임시 비밀번호면 비밀번호 바꾸기로, 아니면 원래 가려던 관리자 화면(next)으로.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!loginId.trim() || !password)
      return setError("아이디와 비밀번호를 입력해 주세요.");
    setBusy(true);
    try {
      const u = await adminLogin(loginId.trim(), password);
      if (!isAdmin(u)) {
        setError("관리자 계정이 아닙니다.");
        setBusy(false);
        return;
      }
      if (u.mustChangePassword) {
        router.replace("/admin/password/");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(
        next && next.startsWith("/admin") && !next.startsWith("//")
          ? next
          : "/admin/",
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "로그인하지 못했습니다.",
      );
      setBusy(false);
    }
  }

  if (!API_CONNECTED) {
    return (
      <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">
        화면 확인 단계입니다. 관리자 서버는 아직 연결되지 않았습니다.
      </p>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field
        label="아이디"
        name="username"
        autoComplete="username"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
      />
      <Field
        label="비밀번호"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid mt-2 inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm transition-colors duration-300 disabled:opacity-60"
      >
        {busy ? "확인하는 중" : "로그인"}
      </button>
    </form>
  );
}
