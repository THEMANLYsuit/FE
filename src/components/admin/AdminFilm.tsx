"use client";

import {
  FilmStrip,
  FolderOpen,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";

import {
  ApiError,
  getFilmAdmin,
  uploadFilm,
  type AdminFilmView,
} from "@/lib/admin";
import { dateOf, timeOf } from "@/lib/api";

/**
 * 메인 영상 (서버 V11) — 영상을 올리면 서버가 1초 12장씩 사진으로 뽑아(ffmpeg, AI 아님) 메인 첫 화면 필름으로 건다.
 * 올리는 동안 진행률을 보이고(영상은 수십 MB 라 몇 초 걸린다), 끝나면 첫 장 · 가운데 · 마지막 장을 미리 보여 준다.
 */
export function AdminFilm() {
  const picker = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<{
    current: AdminFilmView | null;
    recent: AdminFilmView[];
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getFilmAdmin()
      .then((d) => alive && setData(d))
      .catch(
        (e) =>
          alive &&
          setError(e instanceof ApiError ? e.message : "불러오지 못했습니다."),
      );
    return () => {
      alive = false;
    };
  }, []);

  function choose(f: File | undefined) {
    if (!f) return;
    setError(null);
    setDone(null);
    if (!/\.(mp4|mov|webm|m4v)$/i.test(f.name)) {
      setFile(null);
      setError("MP4 · MOV · WebM 영상만 올릴 수 있습니다.");
      return;
    }
    if (f.size > 60 * 1024 * 1024) {
      setFile(null);
      setError("영상이 너무 큽니다. 60MB 이하로 올려 주세요.");
      return;
    }
    setFile(f);
  }

  async function upload() {
    if (!file) return;
    setError(null);
    setDone(null);
    setProgress(0);
    try {
      const film = await uploadFilm(file, (ratio) => {
        setProgress(ratio);
        if (ratio >= 1) setConverting(true);
      });
      setData((d) => ({
        current: film,
        recent: [
          film,
          ...(d?.recent ?? []).map((r) => ({ ...r, active: false })),
        ].slice(0, 10),
      }));
      setDone(
        `사진 ${film.frames}장으로 만들어 메인에 걸었습니다. 손님 화면에는 바로 반영됩니다.`,
      );
      setFile(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "올리지 못했습니다.");
    } finally {
      setProgress(null);
      setConverting(false);
    }
  }

  const busy = progress !== null;
  const cur = data?.current;
  const frameUrl = (f: AdminFilmView, n: number) =>
    `${f.sequence.base}${String(n).padStart(f.sequence.pad, "0")}${f.sequence.ext}`;

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <section aria-labelledby="film-now" className="flex flex-col gap-4">
        <h2 id="film-now" className="text-primary text-sm font-medium">
          지금 메인에 걸린 필름
        </h2>
        {!data ? (
          <p aria-busy="true" className="text-muted text-sm">
            불러오는 중
          </p>
        ) : cur ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[1, Math.max(1, Math.round(cur.frames / 2)), cur.frames].map(
                (n) => (
                  // eslint-disable-next-line @next/next/no-img-element -- 서버가 만든 사진을 그대로 보인다
                  <img
                    key={n}
                    src={frameUrl(cur, n)}
                    alt={`${n}번째 장`}
                    className="bg-surface aspect-video w-full rounded-lg object-cover"
                  />
                ),
              )}
            </div>
            <p className="text-muted text-2xs">
              {cur.originalFilename} · 사진 {cur.frames}장 (
              {(cur.frames / cur.fps).toFixed(1)}초) · {dateOf(cur.createdAt)}{" "}
              {timeOf(cur.createdAt)} 등록
            </p>
          </>
        ) : (
          <p className="border-subtle bg-surface text-muted rounded-2xl border px-5 py-6 text-sm">
            아직 올린 영상이 없습니다. 지금은 사이트에 기본으로 든 필름이
            보입니다.
          </p>
        )}
      </section>

      <section aria-labelledby="film-new" className="flex flex-col gap-4">
        <h2 id="film-new" className="text-primary text-sm font-medium">
          새 영상 올리기
        </h2>
        <ul className="text-secondary flex list-disc flex-col gap-1 pl-5 text-xs leading-relaxed">
          <li>
            삼각대에 고정해 찍은 10~15초 영상이 가장 좋습니다. 앞 30초까지만
            씁니다.
          </li>
          <li>
            MP4 · MOV(아이폰) · WebM, 60MB 이하. 서버가 1초에 12장씩 사진으로
            뽑습니다(AI 아님).
          </li>
          <li>올리면 바로 메인에 걸립니다. 이전 영상은 목록에 남습니다.</li>
        </ul>

        <div
          role="button"
          tabIndex={0}
          onClick={() => !busy && picker.current?.click()}
          onKeyDown={(e) => {
            if (!busy && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              picker.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) choose(e.dataTransfer.files?.[0]);
          }}
          className={`ease-fluid flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-300 ${
            dragging
              ? "border-accent bg-accent-tint"
              : file
                ? "border-accent/60 bg-surface"
                : "border-interactive/60 hover:border-accent bg-surface/40"
          }`}
        >
          {file ? (
            <>
              <FilmStrip
                size={34}
                weight="light"
                aria-hidden="true"
                className="text-accent"
              />
              <p className="text-primary text-sm font-medium break-all">
                {file.name}
              </p>
              <p className="text-muted text-2xs">
                {(file.size / 1024 / 1024).toFixed(1)}MB
              </p>
            </>
          ) : (
            <>
              <FolderOpen
                size={34}
                weight="light"
                aria-hidden="true"
                className="text-secondary"
              />
              <p className="text-primary text-sm font-medium">
                영상을 여기로 끌어다 놓으세요
              </p>
              <p className="text-muted text-2xs">
                또는{" "}
                <span className="text-accent underline underline-offset-4">
                  파일 찾기
                </span>
              </p>
            </>
          )}
          <input
            ref={picker}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              choose(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {busy && (
          <div aria-live="polite" className="flex flex-col gap-2">
            <div className="bg-surface h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-accent h-full transition-[width] duration-300"
                style={{ width: `${Math.round((progress ?? 0) * 100)}%` }}
              />
            </div>
            <p className="text-muted text-2xs">
              {converting
                ? "사진으로 뽑는 중… (10~30초)"
                : `올리는 중 ${Math.round((progress ?? 0) * 100)}%`}
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="text-error text-sm">
            {error}
          </p>
        )}
        {done && (
          <p role="status" className="text-success text-sm">
            {done}
          </p>
        )}

        <button
          type="button"
          onClick={upload}
          disabled={!file || busy}
          className="bg-accent text-on-accent hover:bg-accent-hover ease-fluid inline-flex min-h-12 w-fit items-center gap-2 rounded-full px-6 text-sm transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadSimple size={16} weight="light" aria-hidden="true" />
          {busy ? "처리하는 중" : "올려서 메인에 걸기"}
        </button>
      </section>

      {data && data.recent.length > 1 && (
        <section aria-labelledby="film-history">
          <h2 id="film-history" className="text-primary text-sm font-medium">
            지난 영상
          </h2>
          <ul className="border-subtle divide-subtle mt-3 divide-y border-y text-sm">
            {data.recent.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <span className="text-secondary break-all">
                  {f.originalFilename}
                </span>
                <span className="text-muted text-2xs tabular-nums">
                  {f.frames}장 · {dateOf(f.createdAt)}
                  {f.active && (
                    <span className="text-accent ml-2">지금 걸림</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
