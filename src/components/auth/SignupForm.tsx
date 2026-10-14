"use client";

import Link from "next/link";
import { useState } from "react";

import { Field } from "@/components/ui/Field";
import { ApiError, signup } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";

/** 회원가입. 약관 동의 · 만 14세 확인은 서버가 다시 본다. 가입 뒤 자동 로그인하지 않는다. */
export function SignupForm() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "", name: "", phone: "", agreeTerms: false, over14: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  /** 글자 입력칸 묶기 — value · onChange 를 한 번에 */
  const bind = (key: "email" | "password" | "confirm" | "name" | "phone") => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set({ [key]: e.target.value }),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = "이메일 주소를 확인해 주세요.";
    if (form.password.length < 10) next.password = "10자 이상이어야 합니다.";
    if (form.password !== form.confirm) next.confirm = "비밀번호가 서로 다릅니다.";
    if (!form.name.trim()) next.name = "이름을 입력해 주세요.";
    if (form.phone.trim() && !/^[0-9-]{9,20}$/.test(form.phone.trim())) next.phone = "숫자와 하이픈만 입력해 주세요.";
    if (!form.agreeTerms) next.agreeTerms = "이용약관에 동의해 주세요.";
    if (!form.over14) next.over14 = "만 14세 이상만 가입할 수 있습니다.";
    setErrors(next);
    setError(null);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await signup({ email: form.email.trim(), password: form.password, name: form.name.trim(), phone: form.phone.trim() || undefined, agreeTerms: true, over14: true });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "가입하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!API_CONNECTED) {
    return <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">화면 확인 단계입니다. 회원 서버는 아직 연결되지 않았습니다.</p>;
  }
  if (done) {
    return (
      <div role="status" className="border-subtle bg-surface border p-8 text-center">
        <p className="font-display text-primary text-2xl">가입이 완료되었습니다</p>
        <Link href="/login/" className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid mt-6 inline-flex min-h-12 items-center rounded-full px-6 text-sm transition-colors duration-300">
          로그인하러 가기
        </Link>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field label="이름" name="name" autoComplete="name" {...bind("name")} error={errors.name} />
      <Field label="이메일" name="email" type="email" autoComplete="username" {...bind("email")} error={errors.email} hint="예약 확정 안내와 비밀번호 재설정에 사용됩니다." />
      <Field label="비밀번호" name="password" type="password" autoComplete="new-password" {...bind("password")} error={errors.password} hint="10자 이상. 이메일 주소는 포함할 수 없습니다." />
      <Field label="비밀번호 확인" name="confirm" type="password" autoComplete="new-password" {...bind("confirm")} error={errors.confirm} />
      <Field label="휴대폰 번호 (선택)" name="phone" type="tel" inputMode="tel" autoComplete="tel" {...bind("phone")} error={errors.phone} hint="예약 당일 연락에 사용됩니다." />
      <div className="flex flex-col gap-3">
        <label className="text-secondary flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={form.agreeTerms} onChange={(e) => set({ agreeTerms: e.target.checked })} className="accent-accent h-4 w-4" />
          <span>
            <Link href="/terms/" className="text-accent underline underline-offset-4">이용약관</Link>에 동의합니다. (필수)
          </span>
        </label>
        {errors.agreeTerms && <p role="alert" className="text-error text-2xs">{errors.agreeTerms}</p>}
        <label className="text-secondary flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={form.over14} onChange={(e) => set({ over14: e.target.checked })} className="accent-accent h-4 w-4" />
          <span>만 14세 이상입니다. (필수)</span>
        </label>
        {errors.over14 && <p role="alert" className="text-error text-2xs">{errors.over14}</p>}
      </div>
      <p className="text-muted text-2xs leading-relaxed">
        가입 · 예약에 필요한 이름 · 이메일 · 연락처는 <Link href="/privacy/" className="text-accent underline underline-offset-4">개인정보처리방침</Link>에 따라 처리되며, 탈퇴하면 바로 지웁니다.
      </p>
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid mt-2 flex min-h-14 items-center justify-center rounded-full text-sm transition-colors duration-300 disabled:opacity-60">
        {busy ? "가입하는 중" : "가입하기"}
      </button>
      <p className="text-muted text-center text-xs">
        이미 회원이신가요? <Link href="/login/" className="text-accent underline underline-offset-4">로그인</Link>
      </p>
    </form>
  );
}
