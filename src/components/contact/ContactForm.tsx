"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { Field } from "@/components/ui/Field";
import { ApiError, INQUIRY_TOPIC_LABEL, me, submitInquiry, type CurrentUser, type InquiryTopic } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";

/**
 * 문의하기 — 로그인 없이도 보낸다(BE POST /api/inquiries).
 *   · 로그인했으면 이름 · 이메일 칸을 숨긴다. 서버가 가입 정보를 쓰고, 답은 마이페이지 문의 탭에서도 본다.
 *   · 비회원은 이름 · 이메일이 필요하고, 개인정보 수집에 동의해야 보낼 수 있다.
 *   · website 는 허니팟 — 화면에서 숨기고 비워 둔다. 봇이 채우면 서버가 받은 척만 한다.
 * 서버가 규칙(길이 · 형식)을 다시 본다 — 화면은 같은 규칙을 먼저 보여 줄 뿐이다.
 */
const TOPICS: InquiryTopic[] = ["GENERAL", "BOOKING", "ORDER", "FABRIC", "OTHER"];
const MIN = 10;
const MAX = 3000;

export function ContactForm() {
  const [user, setUser] = useState<CurrentUser | null | undefined>(API_CONNECTED ? undefined : null);
  const [topic, setTopic] = useState<InquiryTopic>("GENERAL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const messageId = useId();

  useEffect(() => {
    if (!API_CONNECTED) return;
    let alive = true;
    me()
      .then((u) => alive && setUser(u))
      .catch(() => alive && setUser(null));
    return () => {
      alive = false;
    };
  }, []);

  const guest = user === null;
  const length = message.trim().length;
  const ready = length >= MIN && length <= MAX && (!guest || (name.trim() && email.trim() && agree));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      await submitInquiry({
        ...(guest ? { name: name.trim(), email: email.trim() } : {}),
        phone: phone.trim() || undefined,
        topic,
        message: message.trim(),
        website,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (!API_CONNECTED) {
    return <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">화면 확인 단계입니다. 문의 서버는 아직 연결되지 않았습니다.</p>;
  }
  if (user === undefined) {
    return (
      <p aria-busy="true" className="text-muted text-sm">
        불러오는 중
      </p>
    );
  }

  if (done) {
    return (
      <div role="status" className="border-subtle bg-surface flex flex-col gap-4 border p-7">
        <p className="text-primary flex items-center gap-2 text-base">
          <CheckCircle size={18} weight="light" aria-hidden="true" className="text-success" />
          문의를 받았습니다.
        </p>
        <p className="text-secondary text-sm leading-relaxed">
          {guest ? "적어 주신 이메일로" : "가입하신 이메일로"} 접수 확인 메일을 보냈습니다. 확인한 뒤 같은 메일 주소로 답해 드립니다.
        </p>
        {!guest && (
          <Link href="/mypage/#inquiries" className="text-accent w-fit text-sm underline underline-offset-4">
            내 문의 보기
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-secondary text-2xs mb-3">무엇에 대한 문의인가요</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const on = t === topic;
            return (
              <label
                key={t}
                className={`ease-fluid inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 text-sm transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                  on ? "border-accent bg-accent-tint text-primary" : "border-interactive text-secondary hover:border-accent"
                }`}
              >
                <input type="radio" name="topic" value={t} checked={on} onChange={() => setTopic(t)} className="sr-only" />
                {INQUIRY_TOPIC_LABEL[t]}
              </label>
            );
          })}
        </div>
      </fieldset>

      {guest ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="이름" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} autoComplete="name" required />
          <Field
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            autoComplete="email"
            hint="답변을 이 주소로 보내 드립니다."
            required
          />
        </div>
      ) : (
        <p className="text-secondary border-subtle bg-surface border px-5 py-4 text-sm">
          {user.name} 님({user.email})으로 보냅니다. 답변은 메일과 마이페이지 문의 탭에서 보실 수 있습니다.
        </p>
      )}

      <Field
        label="연락처 (선택)"
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/[^0-9-]/g, ""))}
        maxLength={20}
        placeholder="010-1234-5678"
        autoComplete="tel"
        hint="전화로 답을 원하시면 적어 주세요."
      />

      <div className="flex flex-col gap-2">
        <label htmlFor={messageId} className="text-secondary text-2xs">
          문의 내용
        </label>
        <textarea
          id={messageId}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX}
          rows={8}
          required
          aria-describedby={`${messageId}-count`}
          placeholder="원하시는 날짜, 입으실 자리, 궁금한 원단 등을 적어 주세요."
          className="text-primary placeholder:text-muted/60 border-interactive focus-visible:border-accent ease-fluid w-full border bg-transparent px-4 py-3 text-sm leading-relaxed transition-colors duration-300"
        />
        <p id={`${messageId}-count`} className={`text-2xs text-right tabular-nums ${length > 0 && length < MIN ? "text-error" : "text-muted"}`}>
          {length > 0 && length < MIN ? `${MIN}자 이상 적어 주세요 · ` : ""}
          {length} / {MAX}
        </p>
      </div>

      {/* 허니팟 — 화면 밖에 두고 보조기기 · 탭 이동에서도 뺀다. 사람은 볼 일이 없다 */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          웹사이트
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {guest && (
        <label className="text-secondary flex cursor-pointer items-start gap-3 text-xs leading-relaxed">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-accent mt-0.5 h-4 w-4 shrink-0" />
          <span>
            문의 답변을 위해 이름 · 이메일 · 연락처(선택)를 수집 · 이용하는 데 동의합니다. 보관 기간 등은{" "}
            <Link href="/privacy/" className="text-accent underline underline-offset-4">
              개인정보처리방침
            </Link>
            을 따릅니다. (필수)
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!ready || busy}
          className="bg-accent text-on-accent hover:bg-accent-hover tracking-button ease-fluid inline-flex min-h-12 items-center rounded-full px-7 text-sm transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "보내는 중" : "문의 보내기"}
        </button>
        {guest && (
          <p className="text-muted text-xs">
            회원이시면{" "}
            <Link href="/login/?next=/contact/" className="text-accent underline underline-offset-4">
              로그인
            </Link>
            하고 보내시면 마이페이지에서 답을 모아 보실 수 있습니다.
          </p>
        )}
      </div>
    </form>
  );
}
