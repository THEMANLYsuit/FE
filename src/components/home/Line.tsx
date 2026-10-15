import type { ReactNode } from "react";

/**
 * 표제 한 줄 — 장면이 켜질 때 아래에서 올라오며 나타난다(globals.css .line). 줄마다 index × 120ms 늦게.
 * 표제를 줄 단위로 쪼개 쓴다: <h1><Line>당신의 몸에 맞춰</Line><Line i={1}>짓는 한 벌</Line></h1>
 */
export function Line({ children, i = 0 }: { children: ReactNode; i?: number }) {
  return (
    <span className="line">
      <span className="line-inner" style={{ "--line-delay": `${i * 120}ms` } as React.CSSProperties}>
        {children}
      </span>
    </span>
  );
}
