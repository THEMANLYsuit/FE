import type { CSSProperties } from "react";

/** 떨어지는 순서(globals.css 의 .drop · --i) — style 에 그대로 넣는다. 서버 · 클라이언트 둘 다 부를 수 있게 일반 파일에 둔다 */
export const dropAt = (i: number) => ({ "--i": i }) as CSSProperties;
