/**
 * 맞춤 제작 과정 — 메인 "과정" 장면과 /process 페이지가 쓴다.
 * 단계 이름은 BE 의 맞춤 주문 진행 단계(2단계에서 붙는 BespokeStage)와 같아야 한다 — 손님이 마이페이지에서 보는 이름이다.
 * TODO(고객확인) 기간(주) · 가봉 횟수 — 매장 기준으로 확정
 */
export interface ProcessStep {
  key: string;
  title: string;
  en: string;
  body: string;
  /** 평균 소요. 표시용 */
  duration: string;
}

export const PROCESS: ProcessStep[] = [
  {
    key: "CONSULTATION",
    title: "상담",
    en: "Consultation",
    body: "입을 자리와 취향을 듣고, 체형을 봅니다. 원단과 스타일의 방향을 함께 정합니다.",
    duration: "60분",
  },
  {
    key: "MEASUREMENT",
    title: "치수",
    en: "Measurement",
    body: "스물네 곳을 잽니다. 어깨의 기울기, 등의 둥글기처럼 숫자 밖의 것도 기록합니다.",
    duration: "같은 날",
  },
  {
    key: "FABRIC",
    title: "원단 · 스타일",
    en: "Fabric & Style",
    body: "원단을 손으로 만져 보고 고릅니다. 라펠 · 벤트 · 단추 · 안감까지 한 벌의 모든 선택을 합니다.",
    duration: "같은 날",
  },
  {
    key: "FITTING",
    title: "가봉",
    en: "Fitting",
    body: "가봉 상태의 옷을 입어 봅니다. 서고, 앉고, 팔을 들어 보며 맞지 않는 곳을 표시합니다.",
    duration: "2 – 3주 뒤",
  },
  {
    key: "ADJUSTMENT",
    title: "수정 · 완성",
    en: "Adjustment",
    body: "가봉에서 표시한 곳을 고쳐 완성합니다. 필요하면 가봉을 한 번 더 합니다.",
    duration: "2주",
  },
  {
    key: "DELIVERY",
    title: "수령",
    en: "Delivery",
    body: "매장에서 마지막으로 입어 보고 받아 가십니다. 치수는 기록으로 남아 다음 한 벌이 더 쉬워집니다.",
    duration: "총 5 – 6주",
  },
];
