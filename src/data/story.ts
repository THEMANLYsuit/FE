/**
 * 메인 스토리텔링 장치의 내용 (2026-10-16 "더맨리 영상처럼" — 애플 제품 페이지식 스크롤 연출).
 *
 * 사진 · 영상 자리는 image / video 에 공개 경로(public/ 아래)나 업로드 주소를 넣으면 바로 바뀐다.
 * 비어 있으면 자리표시(그라데이션 + 무엇을 찍어 넣을지 한 줄)가 보인다. TODO(고객확인) 촬영본
 */

/** 1 · 스크롤 필름 — 화면은 붙잡혀 있고 스크롤하면 영상이 앞뒤로 재생된다. 문장은 구간마다 바뀐다. */
export const FILM = {
  /** 모델이 제자리에서 천천히 한 바퀴 도는 10~15초 영상(mp4). 비우면 자리표시. 예: "/brand/film-turn.mp4" */
  video: null as string | null,
  /** 영상 대신 쓸 정지 사진(영상이 없거나 움직임 줄임 설정일 때) */
  poster: null as string | null,
  shotHint: "모델이 수트를 입고 제자리에서 한 바퀴 도는 영상 10~15초",
  frames: [
    { eyebrow: "THE CUT", title: "어깨에서 시작되는 선", body: "어깨가 맞으면 나머지가 따라옵니다. 기울기와 폭부터 잽니다." },
    { eyebrow: "THE BACK", title: "등을 따라 떨어지는 재킷", body: "등의 둥글기를 재서 뒤에서 들뜨지 않게 짓습니다." },
    { eyebrow: "THE MOVE", title: "앉고 팔을 들어도", body: "가봉에서 움직여 보고, 당기는 곳을 그 자리에서 고칩니다." },
  ],
};

/** 2 · 하이라이트 — 가로로 넘기는 카드. 점을 누르거나 밀어서 넘긴다. 자동으로 넘어가고, 일시정지할 수 있다. */
export interface Highlight {
  title: string;
  body: string;
  image: string | null;
  shotHint: string;
}

export const HIGHLIGHTS: Highlight[] = [
  { title: "스물네 곳을 잽니다", body: "어깨 기울기 · 등의 둥글기처럼 숫자 밖의 것도 기록합니다.", image: null, shotHint: "줄자로 어깨를 재는 손 클로즈업" },
  { title: "원단은 손으로 고릅니다", body: "이탈리아 · 영국 밀의 원단 견본을 직접 만져 봅니다.", image: null, shotHint: "원단 견본 책을 넘기는 장면" },
  { title: "가봉에서 한 번 더", body: "입어 보고, 서고 앉으며 맞지 않는 곳을 표시합니다.", image: null, shotHint: "가봉 중 초크로 표시하는 장면" },
  { title: "단추 하나까지 고릅니다", body: "라펠 · 벤트 · 단추 · 안감 — 한 벌의 모든 선택을 함께 합니다.", image: null, shotHint: "단추 · 안감 견본 클로즈업" },
  { title: "다음 한 벌은 더 쉽게", body: "치수와 선택이 기록으로 남아 두 번째는 상담 한 번이면 됩니다.", image: null, shotHint: "완성된 수트를 건네는 장면" },
];

/** 3 · 가까이 보기 — 왼쪽 목록을 고르면 오른쪽 큰 사진이 바뀐다 (애플 "Take a closer look"). */
export interface CloserItem {
  key: string;
  label: string;
  body: string;
  image: string | null;
  shotHint: string;
}

export const CLOSER: CloserItem[] = [
  { key: "lapel", label: "라펠", body: "노치 · 피크 · 숄. 얼굴형과 입을 자리에 맞춰 폭과 모양을 고릅니다.", image: null, shotHint: "라펠 클로즈업" },
  { key: "shoulder", label: "어깨", body: "패드의 두께와 어깨선의 각도를 체형에 맞춰 정합니다.", image: null, shotHint: "어깨선 측면 클로즈업" },
  { key: "buttons", label: "단추", body: "뿔 · 자개 · 메탈. 소매 단추는 실제로 열리는 리얼 버튼홀로 만들 수 있습니다.", image: null, shotHint: "소매 단추 클로즈업" },
  { key: "lining", label: "안감", body: "계절과 취향에 따라 전체 · 반 안감, 색과 무늬를 고릅니다.", image: null, shotHint: "재킷 안감이 보이게 연 장면" },
  { key: "fabric", label: "원단", body: "울 · 플란넬 · 리넨. 무게와 짜임으로 계절과 자리를 맞춥니다.", image: null, shotHint: "원단 짜임 매크로" },
];
