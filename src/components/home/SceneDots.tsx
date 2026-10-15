"use client";

import { useEffect, useState } from "react";

/**
 * 장(章) 점 — 오른쪽 가운데에 세로로. 화면 한가운데 선을 지나는 장이 켜진다(긴 무대도 같은 규칙).
 * 누르면 그 장으로 부드럽게 간다. 왼쪽 아래에는 지금 장의 번호 · 이름이 떠 있다("02 / 06 — 과정").
 * 폰에서는 둘 다 숨긴다 — 엄지 자리와 겹친다.
 */
export function SceneDots() {
  const [scenes, setScenes] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = [
      ...document.querySelectorAll<HTMLElement>("main [data-scene]"),
    ];
    els.forEach((el, i) => {
      if (!el.id) el.id = `scene-${i + 1}`;
    });
    // 장면 목록은 다음 프레임에 — effect 안에서 바로 setState 하지 않는다(React 19 린트)
    const frame = requestAnimationFrame(() =>
      setScenes(
        els.map((el) => ({
          id: el.id,
          label: el.getAttribute("aria-label") ?? "",
        })),
      ),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement));
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, []);

  if (scenes.length === 0) return null;
  // 첫 장면(히어로)은 장이 아니다 — 표시는 그 다음부터 "01 / 05 — 몸". 히어로에는 목차가 있어 겹치지 않게 숨긴다
  const current = scenes[active];
  const chapters = scenes.length - 1;
  return (
    <>
      {active > 0 && (
        <p
          aria-live="polite"
          className="text-muted tracking-label fixed bottom-9 left-24 z-40 hidden items-baseline gap-3 text-[0.65rem] md:flex"
        >
          <span className="font-display text-accent text-base tabular-nums">
            {String(active).padStart(2, "0")}
          </span>
          <span className="opacity-60">
            / {String(chapters).padStart(2, "0")}
          </span>
          <span
            className="bg-strong mx-1 inline-block h-px w-6 translate-y-[-0.3em]"
            aria-hidden="true"
          />
          <span key={current.id} className="step-numeral">
            {current.label}
          </span>
        </p>
      )}
      <nav
        aria-label="장"
        className="fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex"
      >
        {scenes.map((s, i) => {
          const on = i === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={on ? "true" : undefined}
              aria-label={`${i + 1}. ${s.label}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group flex min-h-6 items-center gap-3"
            >
              <span
                className={`text-[0.6rem] tracking-label transition-opacity duration-500 ${on ? "text-accent opacity-100" : "text-muted opacity-0 group-hover:opacity-100"}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`scene-dot block h-px ${on ? "bg-accent w-8" : "bg-strong w-4 group-hover:bg-muted"}`}
              />
            </a>
          );
        })}
      </nav>
    </>
  );
}
