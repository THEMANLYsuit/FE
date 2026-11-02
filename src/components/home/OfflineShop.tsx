import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { GOLD_PILL } from "@/components/home/ProcessPromo";
import { DropSection } from "@/components/home/Snap";
import { SHOP } from "@/data/business";
import { SHOP_PHOTO } from "@/data/story";
import type { BusinessInfo } from "@/lib/business";
import { dropAt } from "@/lib/drop";

/**
 * 메인 넷째 화면 — 오프라인 매장 (2026-11-02 디자이너 "레오네페리토 그대로 하되, 배경 블랙 · 텍스트 화이트, 지도보기 #E0C486").
 *
 * 레오네페리토 메인의 OFFLINE SHOP 구성 그대로다: 왼쪽 사진 위 왼쪽 아래에 «OFFLINE SHOP», 오른쪽 위에 상호,
 * 사진 아랫선에 맞춰 주소 · 운영시간과 «지도보기». 각진 사진(둥글리지 않는다)도 같다. 같은 매장이라 지도도 같은 링크다.
 * 주소는 관리자 › 사업자 정보 값(빌드 때 받는다), 운영시간은 예약 규칙과 같은 SHOP.
 */
export function OfflineShop({ business }: { business: BusinessInfo }) {
  return (
    <DropSection id="offline-shop" label="오프라인 매장" className="flex items-center bg-black">
      <div className="mx-auto grid w-full max-w-[1320px] gap-0 px-5 py-24 md:grid-cols-[minmax(0,11fr)_minmax(0,14fr)] md:px-15 md:py-20">
        <div style={dropAt(0)} className="drop relative aspect-[4/3] overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#6E1420_0%,#3A0A12_60%,#140608_100%)] md:aspect-auto md:min-h-[min(520px,calc(100dvh-10rem))]">
          {SHOP_PHOTO.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={SHOP_PHOTO.image} alt={SHOP_PHOTO.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.15)_52%,rgba(0,0,0,0)_100%)]" />
          <h2 className="font-display pointer-events-none absolute bottom-7 left-7 text-3xl tracking-[0.04em] text-white md:bottom-12 md:left-12 md:text-4xl">
            OFFLINE SHOP
          </h2>
        </div>

        <div className="flex flex-col justify-between gap-10 pt-8 md:pt-2 md:pl-14">
          <p style={dropAt(1)} className="drop font-display text-2xl tracking-[0.18em] text-white md:text-3xl">
            THE MANLY
          </p>
          <div className="flex flex-col gap-8">
            <dl className="flex flex-col gap-9">
              <div style={dropAt(2)} className="drop">
                <dt className="text-sm font-semibold text-white">주소</dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/75">{business.address}</dd>
              </div>
              <div style={dropAt(3)} className="drop">
                <dt className="text-sm font-semibold text-white">운영시간</dt>
                <dd className="mt-2 flex flex-col gap-1 text-sm leading-relaxed text-white/75">
                  <span>운영일 : {SHOP.openDays}</span>
                  <span>휴무일 : {SHOP.closedDays}</span>
                  <span>{SHOP.hours}</span>
                </dd>
              </div>
            </dl>
            <div style={dropAt(4)} className="drop">
              <a href={SHOP.mapUrl} target="_blank" rel="noopener noreferrer" className={GOLD_PILL}>
                지도보기
                <ArrowRight size={14} weight="regular" aria-hidden="true" className="ease-fluid transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="sr-only">(네이버 지도에서 매장 위치, 새 창)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </DropSection>
  );
}
