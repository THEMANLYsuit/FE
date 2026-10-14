import { API_CONNECTED, FETCH_BASE } from "@/lib/site";

/**
 * 원단 · 스타일 카탈로그 — **빌드할 때** 서버에서 받는다 (BE /api/fabrics · /api/style-options).
 * API 주소가 없으면 임시 목록, 주소가 있는데 응답하지 않으면 빌드를 실패시킨다 — 조용히 임시 목록을 내보내면 안 된다.
 * 이 파일은 서버 컴포넌트(빌드)에서만 쓴다.
 */

export interface Fabric {
  code: string;
  name: string;
  mill: string;
  composition: string;
  weightGsm: number | null;
  color: string;
  pattern: string;
  season: "ALL" | "SS" | "FW";
  priceFromKrw: number | null;
  description: string;
  imageUrl: string | null;
  soldOut: boolean;
}

export interface StyleOption {
  category: string;
  categoryLabel: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isDefault: boolean;
}

/** 화면 확인용 임시 원단 — API 가 없을 때만. 실제 원단은 관리자가 등록한다. */
export const SAMPLE_FABRICS: Fabric[] = [
  { code: "VBC-1021", name: "네이비 트로피컬", mill: "Vitale Barberis Canonico", composition: "울 100%", weightGsm: 260, color: "네이비", pattern: "솔리드", season: "ALL", priceFromKrw: 1200000, description: "사계절 네이비. 처음 맞추는 한 벌에 가장 많이 고르는 원단입니다.", imageUrl: null, soldOut: false },
  { code: "LP-7708", name: "차콜 플란넬", mill: "Loro Piana", composition: "울 100%", weightGsm: 320, color: "차콜", pattern: "솔리드", season: "FW", priceFromKrw: 1900000, description: "겨울의 무게. 부드럽게 떨어지는 플란넬.", imageUrl: null, soldOut: false },
  { code: "HL-3310", name: "그레이 글렌체크", mill: "Holland & Sherry", composition: "울 96% 캐시미어 4%", weightGsm: 290, color: "그레이", pattern: "글렌체크", season: "ALL", priceFromKrw: 1650000, description: "무늬가 있는 수트의 첫 선택.", imageUrl: null, soldOut: false },
  { code: "DR-5020", name: "브라운 호프삭", mill: "Drago", composition: "울 100%", weightGsm: 280, color: "브라운", pattern: "호프삭", season: "SS", priceFromKrw: 1350000, description: "짜임이 보이는 여름 재킷감.", imageUrl: null, soldOut: true },
];

const KRW = new Intl.NumberFormat("ko-KR");
export const won = (krw: number | null) => (krw === null ? "상담 시 안내" : `${KRW.format(krw)}원부터`);

async function load<T>(path: string): Promise<T> {
  const res = await fetch(`${FETCH_BASE}${path}`);
  if (!res.ok) throw new Error(`${path} 응답 실패: ${res.status}`);
  return (await res.json()) as T;
}

export async function getFabrics(): Promise<Fabric[]> {
  if (!API_CONNECTED) return SAMPLE_FABRICS;
  return load<Fabric[]>("/api/fabrics");
}

export async function getStyleOptions(): Promise<StyleOption[]> {
  if (!API_CONNECTED) return [];
  return load<StyleOption[]>("/api/style-options");
}
