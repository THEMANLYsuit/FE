"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Field } from "@/components/ui/Field";
import { ApiError, changePassword } from "@/lib/admin";

/**
 * 관리자 비밀번호 바꾸기 — 임시 비밀번호로 처음 들어오면 여기로 온다. 바꾸기 전에는 다른 관리자 API 가 막혀 있다(서버 AdminPasswordGate).
 * 규칙(10자 이상 등)은 서버가 정하고 문구로 알려 준다 — 화면은 확인 칸이 같은지만 먼저 본다.
 */
export function AdminPasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!current || !next)
      return setError("지금 비밀번호와 새 비밀번호를 입력해 주세요.");
    if (next !== confirm) return setError("새 비밀번호와 확인이 다릅니다.");
    setBusy(true);
    try {
      await changePassword(current, next);
      router.replace("/admin/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "바꾸지 못했습니다.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex max-w-md flex-col gap-5">
      <Field
        label="지금 비밀번호 (임시 비밀번호)"
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <Field
        label="새 비밀번호"
        type="password"
        autoComplete="new-password"
        hint="10자 이상. 길게 쓸수록 안전합니다."
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />
      <Field
        label="새 비밀번호 확인"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid inline-flex min-h-12 w-fit items-center rounded-full px-6 text-sm transition-colors duration-300 disabled:opacity-60"
      >
        {busy ? "바꾸는 중" : "비밀번호 바꾸기"}
      </button>
    </form>
  );
}
