"use client";

import {
  ArrowDown,
  ArrowUp,
  ImageSquare,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";

import {
  createFabric,
  createStyle,
  FABRIC_STATUS_LABEL,
  listFabrics,
  listStyles,
  mediaSrc,
  reorderFabrics,
  reorderStyles,
  SEASON_LABEL,
  setFabricStatus,
  STYLE_CATEGORIES,
  updateFabric,
  updateStyle,
  uploadMedia,
  type AdminFabric,
  type AdminStyle,
  type FabricInput,
  type FabricStatus,
  type Season,
  type StyleCategory,
  type StyleInput,
} from "@/lib/admin";
import { won } from "@/lib/api";

import {
  btnGhost,
  btnPrimary,
  Chips,
  Empty,
  errText,
  Field,
  inputCls,
  Loading,
  Messages,
  numOrNull,
  panelCls,
  useAction,
} from "./ui";

/**
 * 원단 · 스타일 — 손님 화면의 원단 목록과 맞춤 주문의 스타일 선택지를 여기서 만든다.
 * 원단: 준비 중(관리자만) → 공개 → 품절(보이지만 못 고름). 순서는 위아래 화살표로, 손님 화면 순서 그대로.
 * 스타일: 묶음(라펠 · 단추 …)마다 선택지, 기본으로 고를 것 하나, 숨김. 사진은 올리면 주소가 자동으로 들어간다.
 */
type Tab = "fabrics" | "styles";

export function AdminCatalog() {
  const [tab, setTab] = useState<Tab>("fabrics");
  return (
    <div className="flex flex-col gap-6">
      <Chips<Tab>
        label="고르기"
        options={[
          ["fabrics", "원단"],
          ["styles", "스타일 선택지"],
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "fabrics" ? <Fabrics /> : <Styles />}
    </div>
  );
}

const FABRIC_STATUS: FabricStatus[] = ["DRAFT", "PUBLISHED", "SOLD_OUT"];
const statusTone = (s: FabricStatus) =>
  s === "PUBLISHED" ? "text-success" : s === "SOLD_OUT" ? "text-error" : "text-muted";

/** 목록에서 한 칸 위 · 아래로 바꾼 새 순서 */
function swap<T>(list: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// ── 원단 ─────────────────────────────────────────────────

function Fabrics() {
  const [list, setList] = useState<AdminFabric[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminFabric | "new" | null>(null);
  const { busy, error: actError, notice, run } = useAction();

  useEffect(() => {
    let alive = true;
    listFabrics()
      .then((d) => alive && setList(d))
      .catch((e) => alive && setError(errText(e, "불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, []);

  async function move(i: number, dir: -1 | 1) {
    if (!list) return;
    const next = swap(list, i, dir);
    const before = list;
    setList(next);
    const ok = await run(async () => {
      await reorderFabrics(next.map((f) => f.id));
      return true;
    });
    if (!ok) setList(before);
  }

  async function status(f: AdminFabric, s: FabricStatus) {
    const r = await run(() => setFabricStatus(f.id, s), `${f.name} — ${FABRIC_STATUS_LABEL[s]}`);
    if (r) setList((l) => l && l.map((x) => (x.id === r.id ? r : x)));
  }

  if (error) return <Messages error={error} />;
  if (!list) return <Loading />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted text-2xs">
          {list.length}개 · 공개 {list.filter((f) => f.status === "PUBLISHED").length}개. 손님 화면에는 이 순서대로 보입니다.
        </p>
        <button type="button" onClick={() => setEditing("new")} className={btnPrimary}>
          <Plus size={14} aria-hidden="true" />새 원단
        </button>
      </div>

      {editing === "new" && (
        <section className={panelCls} aria-label="새 원단">
          <FabricForm
            initial={null}
            onSaved={(f) => {
              setList((l) => [...(l ?? []), f]);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </section>
      )}

      <Messages error={actError} notice={notice} />

      {list.length === 0 ? (
        <Empty>원단이 아직 없습니다. 새 원단을 만들어 주세요.</Empty>
      ) : (
        <ul className="border-subtle divide-subtle divide-y border-y">
          {list.map((f, i) => (
            <li key={f.id} className="py-4">
              {editing !== "new" && editing?.id === f.id ? (
                <FabricForm
                  initial={f}
                  onSaved={(saved) => {
                    setList((l) => l && l.map((x) => (x.id === saved.id ? saved : x)));
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto]">
                  <Thumb url={f.imageUrl} alt={f.name} />
                  <div className="min-w-0">
                    <p className="text-primary text-sm">
                      {f.name} <span className="text-muted text-2xs tabular-nums">{f.code}</span>
                    </p>
                    <p className="text-muted text-2xs mt-1">
                      {[f.mill, f.composition, f.weightGsm ? `${f.weightGsm}g` : null, f.season ? SEASON_LABEL[f.season] : null, f.priceFromKrw ? `${won(f.priceFromKrw)}부터` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <label className="sr-only" htmlFor={`fs-${f.id}`}>
                        {f.name} 상태
                      </label>
                      <select
                        id={`fs-${f.id}`}
                        value={f.status}
                        disabled={busy}
                        onChange={(e) => status(f, e.target.value as FabricStatus)}
                        className={`border-interactive min-h-11 rounded-full border bg-transparent px-3 text-xs ${statusTone(f.status)}`}
                      >
                        {FABRIC_STATUS.map((s) => (
                          <option key={s} value={s}>
                            {FABRIC_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setEditing(f)}
                        className="text-secondary hover:text-accent min-h-11 text-xs"
                      >
                        고치기
                      </button>
                    </div>
                  </div>
                  <Order
                    label={f.name}
                    first={i === 0}
                    last={i === list.length - 1}
                    disabled={busy}
                    onMove={(dir) => move(i, dir)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FabricForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: AdminFabric | null;
  onSaved: (f: AdminFabric) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    mill: initial?.mill ?? "",
    composition: initial?.composition ?? "",
    weightGsm: initial?.weightGsm?.toString() ?? "",
    color: initial?.color ?? "",
    pattern: initial?.pattern ?? "",
    season: (initial?.season ?? "") as Season | "",
    priceFromKrw: initial?.priceFromKrw?.toString() ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
  });
  const { busy, error, run, setError } = useAction();
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) =>
    setV((x) => ({ ...x, [k]: e.target.value }));
  const p = initial ? `f-${initial.id}` : "f-new";

  async function save() {
    if (!/^[A-Za-z0-9-]{2,40}$/.test(v.code.trim())) {
      setError("원단 번호는 영문 · 숫자 · 하이픈 2~40자입니다.");
      return;
    }
    if (!v.name.trim()) {
      setError("원단 이름을 적어 주세요.");
      return;
    }
    const gsm = numOrNull(v.weightGsm);
    if (gsm !== null && (gsm < 100 || gsm > 800)) {
      setError("무게는 100~800g 사이로 적어 주세요.");
      return;
    }
    const body: FabricInput = {
      code: v.code.trim(),
      name: v.name.trim(),
      mill: v.mill.trim(),
      composition: v.composition.trim(),
      weightGsm: gsm,
      color: v.color.trim(),
      pattern: v.pattern.trim(),
      season: v.season || null,
      priceFromKrw: numOrNull(v.priceFromKrw),
      description: v.description.trim(),
      imageUrl: v.imageUrl.trim(),
    };
    const saved = await run(() => (initial ? updateFabric(initial.id, body) : createFabric(body)));
    if (saved) onSaved(saved);
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
        <ImageInput id={`${p}-img`} url={v.imageUrl} onChange={(url) => setV((x) => ({ ...x, imageUrl: url }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="원단 번호" htmlFor={`${p}-code`} hint={initial ? "번호는 바꿀 수 없습니다(손님 화면 주소)." : "예: VBC-1021"}>
            <input id={`${p}-code`} value={v.code} disabled={!!initial} onChange={set("code")} className={inputCls} />
          </Field>
          <Field label="이름" htmlFor={`${p}-name`}>
            <input id={`${p}-name`} maxLength={80} value={v.name} onChange={set("name")} placeholder="네이비 트로피컬" className={inputCls} />
          </Field>
          <Field label="원단사" htmlFor={`${p}-mill`}>
            <input id={`${p}-mill`} maxLength={80} value={v.mill} onChange={set("mill")} placeholder="Vitale Barberis Canonico" className={inputCls} />
          </Field>
          <Field label="혼용률" htmlFor={`${p}-comp`}>
            <input id={`${p}-comp`} maxLength={120} value={v.composition} onChange={set("composition")} placeholder="울 100%" className={inputCls} />
          </Field>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Field label="무게 (g)" htmlFor={`${p}-gsm`}>
          <input id={`${p}-gsm`} inputMode="numeric" value={v.weightGsm} onChange={set("weightGsm")} placeholder="260" className={`${inputCls} tabular-nums`} />
        </Field>
        <Field label="색" htmlFor={`${p}-color`}>
          <input id={`${p}-color`} maxLength={40} value={v.color} onChange={set("color")} placeholder="네이비" className={inputCls} />
        </Field>
        <Field label="무늬" htmlFor={`${p}-pattern`}>
          <input id={`${p}-pattern`} maxLength={40} value={v.pattern} onChange={set("pattern")} placeholder="솔리드" className={inputCls} />
        </Field>
        <Field label="계절" htmlFor={`${p}-season`}>
          <select id={`${p}-season`} value={v.season} onChange={set("season")} className={inputCls}>
            <option value="">정하지 않음</option>
            {(Object.keys(SEASON_LABEL) as Season[]).map((s) => (
              <option key={s} value={s}>
                {SEASON_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="시작가 (원)" htmlFor={`${p}-price`}>
          <input id={`${p}-price`} inputMode="numeric" value={v.priceFromKrw} onChange={set("priceFromKrw")} placeholder="1,200,000" className={`${inputCls} tabular-nums`} />
        </Field>
      </div>
      <Field label="설명 (손님 화면에 보입니다)" htmlFor={`${p}-desc`}>
        <textarea id={`${p}-desc`} rows={3} maxLength={2000} value={v.description} onChange={set("description")} className={`${inputCls} leading-relaxed`} />
      </Field>
      {!initial && <p className="text-muted text-[0.65rem]">새 원단은 &lsquo;준비 중&rsquo; 으로 만들어집니다. 다 채운 뒤 목록에서 &lsquo;공개&rsquo; 로 바꿔 주세요.</p>}
      <Messages error={error} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "저장하는 중" : initial ? "고친 내용 저장" : "원단 만들기"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          그만두기
        </button>
      </div>
    </form>
  );
}

// ── 스타일 선택지 ─────────────────────────────────────────

function Styles() {
  const [list, setList] = useState<AdminStyle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<StyleCategory>("JACKET_BUTTONS");
  const [editing, setEditing] = useState<AdminStyle | "new" | null>(null);
  const [reload, setReload] = useState(0);
  const { busy, error: actError, run } = useAction();

  useEffect(() => {
    let alive = true;
    listStyles()
      .then((d) => alive && setList(d))
      .catch((e) => alive && setError(errText(e, "불러오지 못했습니다.")));
    return () => {
      alive = false;
    };
  }, [reload]);

  if (error) return <Messages error={error} />;
  if (!list) return <Loading />;

  const inCat = list
    .filter((s) => s.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  async function move(i: number, dir: -1 | 1) {
    const next = swap(inCat, i, dir);
    const ok = await run(async () => {
      await reorderStyles(category, next.map((s) => s.id));
      return true;
    });
    if (ok) setReload((n) => n + 1);
  }

  /** 저장 뒤 — 기본 선택지가 바뀌면 같은 묶음의 다른 것도 서버에서 바뀌므로 목록을 다시 받는다 */
  function saved() {
    setEditing(null);
    setReload((n) => n + 1);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="묶음">
        {STYLE_CATEGORIES.map(([c, label]) => {
          const on = c === category;
          const n = list.filter((s) => s.category === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setCategory(c);
                setEditing(null);
              }}
              className={`ease-fluid min-h-11 rounded-xl px-3.5 text-sm transition-colors duration-300 ${on ? "bg-surface text-primary" : "text-secondary hover:bg-surface/60"}`}
            >
              {label} <span className="text-muted text-2xs tabular-nums">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted text-2xs">맞춤 주문에서 이 순서대로 보입니다. 기본은 주문을 열 때 미리 골라 둡니다.</p>
        <button type="button" onClick={() => setEditing("new")} className={btnPrimary}>
          <Plus size={14} aria-hidden="true" />새 선택지
        </button>
      </div>

      {editing === "new" && (
        <section className={panelCls} aria-label="새 선택지">
          <StyleForm category={category} initial={null} onSaved={saved} onCancel={() => setEditing(null)} />
        </section>
      )}

      <Messages error={actError} />

      {inCat.length === 0 ? (
        <Empty>이 묶음에는 선택지가 없습니다.</Empty>
      ) : (
        <ul className="border-subtle divide-subtle divide-y border-y">
          {inCat.map((s, i) => (
            <li key={s.id} className="py-4">
              {editing !== "new" && editing?.id === s.id ? (
                <StyleForm category={category} initial={s} onSaved={saved} onCancel={() => setEditing(null)} />
              ) : (
                <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-start gap-4">
                  <Thumb url={s.imageUrl} alt={s.name} />
                  <div className="min-w-0">
                    <p className={`text-sm ${s.enabled ? "text-primary" : "text-muted line-through"}`}>
                      {s.name} <span className="text-muted text-2xs no-underline">{s.code}</span>
                    </p>
                    <p className="text-2xs mt-1">
                      {s.isDefault && <span className="text-accent mr-2">기본</span>}
                      {!s.enabled && <span className="text-muted mr-2">숨김</span>}
                      {s.description && <span className="text-muted">{s.description}</span>}
                    </p>
                    <button type="button" onClick={() => setEditing(s)} className="text-secondary hover:text-accent mt-1 min-h-11 text-xs">
                      고치기
                    </button>
                  </div>
                  <Order label={s.name} first={i === 0} last={i === inCat.length - 1} disabled={busy} onMove={(dir) => move(i, dir)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StyleForm({
  category,
  initial,
  onSaved,
  onCancel,
}: {
  category: StyleCategory;
  initial: AdminStyle | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    isDefault: initial?.isDefault ?? false,
    enabled: initial?.enabled ?? true,
  });
  const { busy, error, run, setError } = useAction();
  const p = initial ? `s-${initial.id}` : "s-new";

  async function save() {
    if (!/^[A-Za-z0-9-]{2,40}$/.test(v.code.trim())) {
      setError("코드는 영문 · 숫자 · 하이픈 2~40자입니다.");
      return;
    }
    if (!v.name.trim()) {
      setError("이름을 적어 주세요.");
      return;
    }
    const body: StyleInput = {
      category,
      code: v.code.trim(),
      name: v.name.trim(),
      description: v.description.trim(),
      imageUrl: v.imageUrl.trim(),
      isDefault: v.isDefault,
      enabled: v.enabled,
    };
    const r = await run(() => (initial ? updateStyle(initial.id, body) : createStyle(body)));
    if (r) onSaved();
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
        <ImageInput id={`${p}-img`} url={v.imageUrl} onChange={(url) => setV((x) => ({ ...x, imageUrl: url }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="코드" htmlFor={`${p}-code`} hint={initial ? "코드는 바꿀 수 없습니다(주문에 남는 값)." : "예: peak"}>
            <input id={`${p}-code`} value={v.code} disabled={!!initial} onChange={(e) => setV((x) => ({ ...x, code: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="이름" htmlFor={`${p}-name`}>
            <input id={`${p}-name`} maxLength={60} value={v.name} onChange={(e) => setV((x) => ({ ...x, name: e.target.value }))} placeholder="피크 라펠" className={inputCls} />
          </Field>
          <Field label="설명" htmlFor={`${p}-desc`} className="sm:col-span-2">
            <input id={`${p}-desc`} maxLength={500} value={v.description} onChange={(e) => setV((x) => ({ ...x, description: e.target.value }))} className={inputCls} />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="text-secondary flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={v.isDefault} onChange={(e) => setV((x) => ({ ...x, isDefault: e.target.checked }))} className="accent-[var(--accent-base)] h-4 w-4" />
          기본으로 고르기
        </label>
        <label className="text-secondary flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={v.enabled} onChange={(e) => setV((x) => ({ ...x, enabled: e.target.checked }))} className="accent-[var(--accent-base)] h-4 w-4" />
          보이기 (끄면 새 주문에서 못 고름)
        </label>
      </div>
      <Messages error={error} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "저장하는 중" : initial ? "고친 내용 저장" : "선택지 만들기"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          그만두기
        </button>
      </div>
    </form>
  );
}

// ── 작은 부품 ─────────────────────────────────────────────

function Thumb({ url, alt }: { url: string | null; alt: string }) {
  const src = mediaSrc(url);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- 서버가 올린 사진을 그대로
    <img src={src} alt={alt} className="bg-band aspect-square w-[4.5rem] rounded-lg object-cover" />
  ) : (
    <span className="bg-band text-muted flex aspect-square w-[4.5rem] items-center justify-center rounded-lg" aria-hidden="true">
      <ImageSquare size={20} weight="light" />
    </span>
  );
}

function Order({
  label,
  first,
  last,
  disabled,
  onMove,
}: {
  label: string;
  first: boolean;
  last: boolean;
  disabled: boolean;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <span className="col-start-2 flex gap-1 sm:col-start-auto sm:flex-col">
      <button
        type="button"
        aria-label={`${label} 위로`}
        disabled={first || disabled}
        onClick={() => onMove(-1)}
        className="text-secondary hover:text-accent flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30"
      >
        <ArrowUp size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`${label} 아래로`}
        disabled={last || disabled}
        onClick={() => onMove(1)}
        className="text-secondary hover:text-accent flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30"
      >
        <ArrowDown size={15} aria-hidden="true" />
      </button>
    </span>
  );
}

/** 사진 칸 — 고르면 바로 서버에 올리고 받은 주소를 넣는다. 지우기도 된다. */
function ImageInput({ id, url, onChange }: { id: string; url: string; onChange: (url: string) => void }) {
  const picker = useRef<HTMLInputElement>(null);
  const { busy, error, run } = useAction();
  const src = mediaSrc(url);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-secondary text-2xs">사진</span>
      <button
        type="button"
        onClick={() => picker.current?.click()}
        disabled={busy}
        className="border-interactive hover:border-accent bg-band/50 text-muted relative flex aspect-square w-36 items-center justify-center overflow-hidden rounded-xl border border-dashed text-xs"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- 미리보기
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : busy ? (
          "올리는 중"
        ) : (
          <span className="flex flex-col items-center gap-1">
            <ImageSquare size={22} weight="light" aria-hidden="true" />
            사진 고르기
          </span>
        )}
      </button>
      <input
        ref={picker}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const r = await run(() => uploadMedia(f));
          if (r) onChange(r.url);
        }}
      />
      {url && (
        <button type="button" onClick={() => onChange("")} className="text-muted hover:text-error w-fit text-xs">
          사진 빼기
        </button>
      )}
      {error && (
        <p role="alert" className="text-error max-w-36 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
