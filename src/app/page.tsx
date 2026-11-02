import { BodyStory } from "@/components/home/BodyStory";
import { MainHero } from "@/components/home/MainHero";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * 메인 — 2026-11-02 디자이너 시안(더맨리는 레오네페리토보다 뎁스가 얇다).
 *
 *   첫 화면     풀스크린 영상 + 스크롤 안내 (MainHero)
 *   체형 → 맞춤  붙잡힌 화면에서 네 장면 — Various Body Types → 화살표 → Custom Fit → 설명 글 (BodyStory)
 *
 * 헤더는 엠블럼과 햄버거뿐이고 끝까지 투명하다(film). 메뉴는 상담 & 문의 · 렌탈 · 기성복 셋.
 * 그 아래 구간(시안의 빨간 표시 페이지)은 아직 정해지지 않았다 — 정해지면 BodyStory 뒤에 잇는다.
 * 예전 장(章)들(원단 · 과정 · 가까이 보기 …)의 컴포넌트는 components/home 에 그대로 있다 — 시안이 다시 쓰면 꺼내 쓴다.
 */
export default function Home() {
  return (
    <>
      <Header film />
      <main id="main" className="flex-1 bg-black">
        <MainHero />
        <BodyStory />
      </main>
      <Footer />
    </>
  );
}
