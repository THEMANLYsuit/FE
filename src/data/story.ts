/**
 * 메인 스토리텔링 장치의 내용 (2026-10-16 "더맨리 영상처럼" — 애플 제품 페이지식 스크롤 연출).
 *
 * 사진 · 영상 자리는 image / video 에 공개 경로(public/ 아래)나 업로드 주소를 넣으면 바로 바뀐다.
 * 비어 있으면 자리표시(그라데이션 + 무엇을 찍어 넣을지 한 줄)가 보인다. TODO(고객확인) 촬영본
 */

/** 1 · 스크롤 필름 — 화면은 붙잡혀 있고 스크롤하면 영상이 앞뒤로 재생된다. 문장은 구간마다 바뀐다. */
export const FILM = {
  /**
   * 스크롤로 넘기는 사진 묶음(2026-10-16 — 영상을 스크롤로 되감으면 끊겨서 사진 묶음으로 바꿨다). 비우면(null) 자리표시.
   * 영상에서 뽑는 법(1초에 12장, 가로 1280, WebP):
   *   ffmpeg -i 원본.mp4 -vf "fps=12,scale=1280:-2" -c:v libwebp -quality 62 public/brand/film/f%03d.webp
   * 장 수(count)는 뽑힌 파일 수와 같아야 한다. 10초 영상이면 120장 · 약 3MB.
   * 2026-10-16 지금 것은 화면 맞춤용 AI 생성 영상(Gemini, 오른쪽 아래 표시) — 오픈 전 실제 촬영본으로 바꾼다. TODO(고객확인)
   */
  sequence: { base: "/brand/film/f", pad: 3, ext: ".webp", count: 120 } as {
    base: string;
    pad: number;
    ext: string;
    count: number;
  } | null,
  /** 첫 장 — 사진 묶음이 오기 전 무대에 먼저 보인다 */
  poster: "/brand/film/f001.webp" as string | null,
  /** 움직임 줄임 설정일 때 히어로 뒤에 보이는 정지 사진 — 영상의 마지막 장면(완성된 재킷) */
  still: "/brand/film-tailor-poster.jpg" as string | null,
  shotHint: "패턴을 그리는 손에서 완성된 재킷까지 이어지는 영상 10초",
  // 영상의 세 구간과 맞춘다: 패턴 그리기 → 선이 재킷으로 지어짐 → 마네킹 위 완성
  frames: [
    {
      eyebrow: "THE PATTERN",
      title: "선 하나에서 시작합니다",
      body: "스물네 곳의 치수로 당신만의 패턴을 종이 위에 그립니다.",
    },
    {
      eyebrow: "THE MAKING",
      title: "몸에 맞춰 지어 갑니다",
      body: "재단하고, 입혀 보고, 맞지 않는 곳을 고치며 한 벌이 됩니다.",
    },
    {
      eyebrow: "THE SUIT",
      title: "당신의 이름이 붙은 한 벌",
      body: "같은 옷이 세상에 하나뿐입니다. 치수는 기록으로 남습니다.",
    },
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
  {
    title: "스물네 곳을 잽니다",
    body: "어깨 기울기 · 등의 둥글기처럼 숫자 밖의 것도 기록합니다.",
    image: null,
    shotHint: "줄자로 어깨를 재는 손 클로즈업",
  },
  {
    title: "원단은 손으로 고릅니다",
    body: "이탈리아 · 영국 밀의 원단 견본을 직접 만져 봅니다.",
    image: null,
    shotHint: "원단 견본 책을 넘기는 장면",
  },
  {
    title: "가봉에서 한 번 더",
    body: "입어 보고, 서고 앉으며 맞지 않는 곳을 표시합니다.",
    image: null,
    shotHint: "가봉 중 초크로 표시하는 장면",
  },
  {
    title: "단추 하나까지 고릅니다",
    body: "라펠 · 벤트 · 단추 · 안감 — 한 벌의 모든 선택을 함께 합니다.",
    image: null,
    shotHint: "단추 · 안감 견본 클로즈업",
  },
  {
    title: "다음 한 벌은 더 쉽게",
    body: "치수와 선택이 기록으로 남아 두 번째는 상담 한 번이면 됩니다.",
    image: null,
    shotHint: "완성된 수트를 건네는 장면",
  },
];

/**
 * 3 · 가까이 보기 — 왼쪽 목록을 고르면 오른쪽 큰 사진이 바뀐다 (애플 "Take a closer look").
 * 2026-10-16 사진은 화면 맞춤용 AI 생성(Gemini, 오른쪽 아래 표시) — 오픈 전 실제 촬영본으로 바꾼다. TODO(고객확인)
 */
export interface CloserItem {
  key: string;
  label: string;
  body: string;
  image: string | null;
  shotHint: string;
}

export const CLOSER: CloserItem[] = [
  {
    key: "lapel",
    label: "라펠",
    body: "노치 · 피크 · 숄. 얼굴형과 입을 자리에 맞춰 폭과 모양을 고릅니다.",
    image: "/brand/closer/lapel.webp",
    shotHint: "라펠 클로즈업",
  },
  {
    key: "shoulder",
    label: "어깨",
    body: "패드의 두께와 어깨선의 각도를 체형에 맞춰 정합니다.",
    image: "/brand/closer/shoulder.webp",
    shotHint: "어깨선 측면 클로즈업",
  },
  {
    key: "buttons",
    label: "단추",
    body: "뿔 · 자개 · 메탈. 소매 단추는 실제로 열리는 리얼 버튼홀로 만들 수 있습니다.",
    image: "/brand/closer/buttons.webp",
    shotHint: "소매 단추 클로즈업",
  },
  {
    key: "lining",
    label: "안감",
    body: "계절과 취향에 따라 전체 · 반 안감, 색과 무늬를 고릅니다.",
    image: "/brand/closer/lining.webp",
    shotHint: "재킷 안감이 보이게 연 장면",
  },
  {
    key: "fabric",
    label: "원단",
    body: "울 · 플란넬 · 리넨. 무게와 짜임으로 계절과 자리를 맞춥니다.",
    image: "/brand/closer/fabric.webp",
    shotHint: "원단 짜임 매크로",
  },
];

/**
 * 메인 — 2026-11-02 디자이너 시안(뎁스 얇은 더맨리).
 *
 *   히어로       풀스크린 영상 하나(영상 삽입 예정) + 아래 가운데 스크롤 안내
 *   체형 → 맞춤  화면이 붙잡힌 채 스크롤하면 네 장면이 차례로 바뀐다(BodyStory):
 *                ① Various Body Types — 세 체형(상의 탈의)  ② 같은 사진 위에 빨간 화살표(어깨 · 허리 · 배)
 *                ③ Custom Fit — 같은 세 사람이 맞춤 수트를 입은 사진  ④ 사진이 어두워지며 설명 글
 *
 * 사진 · 영상은 public/ 아래 경로나 업로드 주소를 넣으면 바로 바뀐다. 비어 있으면(null) 자리표시가 보인다.
 * TODO(고객확인) 영상 · 사진 두 장(세 사람이 한 장에 나란히, 가로 사진) · 설명 글
 */
export const MAIN_HERO = {
  /** 히어로 영상(mp4). 소리 없이 반복 재생 */
  video: null as string | null,
  /** 영상이 뜨기 전 · 움직임 줄임 설정일 때 보이는 정지 사진 */
  poster: null as string | null,
};

export const BODY_STORY = {
  /** ①② 세 체형 — 마른 체형(옆) · 운동 체형(앞) · 넉넉한 체형(옆) 을 한 장에 */
  bodies: { image: null as string | null, alt: "마른 체형, 운동으로 상체가 커진 체형, 배가 나온 체형의 세 남성이 나란히 서 있다" },
  /** ③④ 같은 세 사람이 맞춤 수트를 입은 사진 */
  suits: { image: null as string | null, alt: "같은 세 남성이 각자의 체형에 맞춘 수트를 입고 서 있다" },
  bodiesTitle: "Various Body Types",
  fitTitle: "Custom Fit",
  /** ④ 설명 글. TODO(고객확인) 디자이너 문구가 오면 바꾼다 */
  fitBody:
    "몸은 사람마다 다릅니다. 같은 키, 같은 몸무게라도 어깨의 넓이와 가슴의 두께, 허리와 배의 선이 모두 다릅니다. " +
    "더맨리는 스물네 곳의 치수와 체형 메모로 패턴을 새로 그리고, 가봉에서 몸에 맞춰 고칩니다. " +
    "마른 몸도, 운동으로 커진 몸도, 넉넉한 몸도 — 그 몸에 맞는 한 벌을 짓습니다.",
};
