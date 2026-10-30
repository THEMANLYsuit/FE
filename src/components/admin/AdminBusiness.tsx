"use client";

import { useEffect, useState } from "react";

import { Field, Loading, Messages, btnPrimary, errText, inputCls, panelCls, useAction } from "@/components/admin/ui";
import { getSiteBusiness, saveSiteBusiness, type SiteBusiness } from "@/lib/admin";

/**
 * 푸터 사업자 정보 편집 (서버 V13) — 아홉 칸 한 번에 저장. 레오네페리토 관리자와 같은 화면.
 *
 * 전자상거래법 제10조 표기 항목이라 사업자등록증과 대조된다 — 칸마다 무엇을 적는지 밑에 적어 두고,
 * 오른쪽에 손님 화면 푸터에 나갈 모양을 그대로 보인다. 길이 · 형식은 서버(V13 CHECK · SiteBusinessController)와 같다.
 * 저장하면 서버가 손님 화면을 다시 만든다(1~2분).
 */

const FIELDS: { key: keyof SiteBusiness; label: string; hint: string; max: number; type?: string; wide?: boolean }[] = [
  { key: "companyName", label: "상호", hint: "사업자등록증의 상호 그대로", max: 100 },
  { key: "representative", label: "대표자", hint: "사업자등록증의 대표자 이름", max: 50 },
  { key: "registrationNumber", label: "사업자등록번호", hint: "000-00-00000 형식", max: 12 },
  { key: "mailOrderNumber", label: "통신판매업 신고번호", hint: "신고증의 번호 그대로 (예: 2024-수원영통-0059)", max: 50 },
  { key: "address", label: "사업장 주소", hint: "사업자등록증의 주소 그대로", max: 200, wide: true },
  { key: "phone", label: "대표 전화", hint: "문의 페이지의 «전화» 에도 이 번호가 나갑니다", max: 100 },
  { key: "email", label: "이메일", hint: "손님 문의를 받는 주소", max: 254, type: "email" },
  { key: "privacyOfficer", label: "개인정보 보호책임자", hint: "이름 (직함) — 따로 없으면 대표자", max: 100 },
  { key: "hosting", label: "호스팅 서비스 제공자", hint: "서버를 옮기지 않으면 그대로 둡니다", max: 100 },
];

export function AdminBusiness() {
  const [form, setForm] = useState<SiteBusiness | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const { busy, error, notice, run, setError } = useAction();

  useEffect(() => {
    let alive = true;
    getSiteBusiness()
      .then((v) => alive && setForm(v))
      .catch((e) => alive && setLoadError(errText(e, "불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, []);

  if (loadError) return <Messages error={loadError} />;
  if (!form) return <Loading />;

  const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, String(v).trim()])) as unknown as SiteBusiness;
  const problems: Partial<Record<keyof SiteBusiness, string>> = {};
  for (const f of FIELDS) if (!trimmed[f.key]) problems[f.key] = `${f.label}을(를) 적어 주세요.`;
  if (trimmed.registrationNumber && !/^[0-9]{3}-[0-9]{2}-[0-9]{5}$/.test(trimmed.registrationNumber)) {
    problems.registrationNumber = "000-00-00000 형식으로 적어 주세요.";
  }
  if (trimmed.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed.email)) problems.email = "이메일 주소 형식을 확인해 주세요.";
  const bad = Object.keys(problems).length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setChecked(true);
    if (bad) {
      setError("빨간 칸을 고쳐 주세요.");
      return;
    }
    const saved = await run(() => saveSiteBusiness(trimmed), "저장했습니다. 손님 화면은 1~2분 뒤에 바뀝니다.");
    if (saved) setForm(saved);
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <div className={panelCls}>
        <div className="grid gap-5 md:grid-cols-2">
          {FIELDS.map((f) => {
            const problem = checked ? problems[f.key] : undefined;
            return (
              <Field
                key={f.key}
                label={f.label}
                htmlFor={`biz-${f.key}`}
                hint={problem ? undefined : f.hint}
                className={f.wide ? "md:col-span-2" : ""}
              >
                <input
                  id={`biz-${f.key}`}
                  type={f.type ?? "text"}
                  value={form[f.key]}
                  maxLength={f.max}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, [f.key]: e.target.value } : prev))}
                  aria-invalid={problem ? true : undefined}
                  className={`${inputCls} ${problem ? "border-error" : ""}`}
                />
                {problem && <p className="text-error text-[0.65rem]">{problem}</p>}
              </Field>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? "저장하는 중" : "저장"}
          </button>
          <Messages error={error} notice={notice} />
        </div>
      </div>

      {/* 미리보기 — 손님 화면 푸터에 나갈 모양 그대로 */}
      <aside className="h-fit xl:sticky xl:top-24">
        <p className="text-muted text-2xs">미리보기 · 손님 화면 맨 아래</p>
        <dl className="bg-band border-subtle mt-3 flex flex-col gap-2.5 rounded-2xl border p-6">
          {FIELDS.map((f) => (
            <div key={f.key} className="text-2xs flex gap-2.5">
              <dt className="text-muted w-28 shrink-0">{f.label}</dt>
              <dd className={trimmed[f.key] ? "text-secondary" : "text-error"}>{trimmed[f.key] || "비어 있음"}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </form>
  );
}
