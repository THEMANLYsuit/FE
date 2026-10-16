"use client";

import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { Scene } from "@/components/home/Scene";
import { Shot } from "@/components/home/Shot";
import { CLOSER } from "@/data/story";

/**
 * 가까이 보기 (애플 "Take a closer look") — 왼쪽 알약 목록을 고르면 설명이 펼쳐지고 오른쪽 큰 사진이 바뀐다.
 * 하나만 펼친다. 사진은 겹쳐 두고 투명도로 바꾼다 — 바꿀 때 자리가 출렁이지 않게. 폰에서는 사진이 위, 목록이 아래.
 */
export function CloserLook() {
  const [active, setActive] = useState(CLOSER[0].key);

  return (
    <Scene id="closer" label="가까이" bare className="bg-band">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-36">
        <h2 data-reveal className="font-display text-primary leading-display text-3xl md:text-5xl">
          가까이 보기
        </h2>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:items-center md:gap-14">
          <ul className="order-2 flex flex-col gap-3 md:order-1">
            {CLOSER.map((c) => {
              const on = c.key === active;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`closer-${c.key}`}
                    onClick={() => setActive(c.key)}
                    className={`ease-fluid w-full rounded-3xl text-left transition-colors duration-500 ${on ? "bg-surface px-6 py-5" : "hover:bg-surface/60 px-5 py-3"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${on ? "border-accent text-accent" : "border-strong text-secondary"}`}>
                        {on ? <Minus size={11} weight="bold" /> : <Plus size={11} weight="bold" />}
                      </span>
                      <span className={`text-sm ${on ? "text-primary font-medium" : "text-secondary"}`}>{c.label}</span>
                    </span>
                    <span id={`closer-${c.key}`} hidden={!on} className="text-secondary mt-3 block pl-9 text-sm leading-relaxed">
                      {c.body}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative order-1 aspect-[4/5] overflow-hidden md:order-2 md:aspect-[16/11]" aria-live="polite">
            {CLOSER.map((c, i) => (
              <div
                key={c.key}
                aria-hidden={c.key !== active}
                className={`ease-fluid absolute inset-0 transition-[opacity,transform] duration-700 ${c.key === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
              >
                <Shot src={c.image} alt={`${c.label} 가까이`} hint={c.shotHint} tone={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
