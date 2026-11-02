import { BodyStory } from "@/components/home/BodyStory";
import { MainHero } from "@/components/home/MainHero";
import { OfflineShop } from "@/components/home/OfflineShop";
import { ProcessPromo } from "@/components/home/ProcessPromo";
import { SnapHome } from "@/components/home/Snap";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getBusiness } from "@/lib/business";

/**
 * 메인 — 2026-11-02 디자이너 시안(더맨리는 레오네페리토보다 뎁스가 얇다).
 *
 *   첫 화면      풀스크린 영상 + 스크롤 안내 (MainHero)
 *   체형 → 맞춤  붙잡힌 화면에서 네 장면 — Various Body Types → 화살표 → Custom Fit → 설명 글 (BodyStory)
 *   제작 순서    왼쪽 사진 · 오른쪽 순서 · 기간 · 예약하기 · 렌탈 (ProcessPromo)
 *   오프라인 매장 레오네페리토 구성 그대로, 검정 바탕 · 골드 지도보기 (OfflineShop)
 *
 * 스크롤 한 번에 한 화면씩 붙고(SnapHome), 화면에 들어오면 글 · 사진이 위에서 또르륵 떨어진다(DropSection).
 * 헤더는 엠블럼과 햄버거뿐이고 끝까지 투명하다(film). 메뉴는 상담 & 문의 · 렌탈 · 기성복 셋.
 * 예전 장(章)들(원단 · 과정 · 가까이 보기 …)의 컴포넌트는 components/home 에 그대로 있다 — 시안이 다시 쓰면 꺼내 쓴다.
 */
export default async function Home() {
  const business = await getBusiness();
  return (
    <>
      <SnapHome />
      <Header film />
      <main id="main" className="flex-1 bg-black">
        <MainHero />
        <BodyStory />
        <ProcessPromo />
        <OfflineShop business={business} />
      </main>
      <Footer />
      {/* 맨 끝 표지 — 붙는 스크롤에서도 푸터까지 내려갈 수 있게 */}
      <span aria-hidden="true" className="block h-px snap-end" />
    </>
  );
}
