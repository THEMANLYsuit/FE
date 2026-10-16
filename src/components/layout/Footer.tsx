import Link from "next/link";

import { BUSINESS, KAKAO_CHANNEL, SHOP, SNS } from "@/data/business";

/** 전역 푸터. 사업자 정보와 약관 링크는 전자상거래법 제10조의 표기 의무다 (data/business.ts). */
export function Footer() {
  const rows: [string, string][] = [
    ["상호", BUSINESS.companyName],
    ["대표자", BUSINESS.representative],
    ["사업자등록번호", BUSINESS.registrationNumber],
    ["통신판매업 신고번호", BUSINESS.mailOrderNumber],
    ["사업장 주소", BUSINESS.address],
    ["대표 전화", BUSINESS.phone],
    ["이메일", BUSINESS.email],
    ["개인정보 보호책임자", BUSINESS.privacyOfficer],
    ["호스팅 서비스 제공자", BUSINESS.hosting],
  ];
  return (
    <footer className="bg-band border-subtle mt-auto border-t">
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-15 md:py-28">
        <p className="font-display text-primary text-2xl tracking-[0.22em]">THE MANLY</p>
        <p className="text-secondary mt-4 max-w-md text-sm">{BUSINESS.brandKo} · 수원 영통 매장 · {SHOP.hours} · {SHOP.closedDays}</p>

        <nav aria-label="둘러보기" className="mt-10 flex flex-wrap gap-x-7">
          {[
            { href: "/fabrics/", label: "FABRICS" },
            { href: "/process/", label: "PROCESS" },
            { href: "/booking/", label: "BOOKING" },
            { href: "/contact/", label: "CONTACT" },
            { href: "/mypage/", label: "MY" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="text-secondary hover:text-primary tracking-label ease-fluid inline-flex min-h-11 items-center text-2xs transition-colors duration-300">
              {item.label}
            </Link>
          ))}
          <a href={SNS.instagram} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary tracking-label ease-fluid inline-flex min-h-11 items-center text-2xs transition-colors duration-300">
            INSTAGRAM<span className="sr-only">(새 창)</span>
          </a>
          <a href={KAKAO_CHANNEL.chat} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary tracking-label ease-fluid inline-flex min-h-11 items-center text-2xs transition-colors duration-300">
            KAKAO<span className="sr-only">(새 창)</span>
          </a>
        </nav>

        <div className="border-subtle mt-6 border-t pt-6">
          <nav aria-label="약관 및 정책" className="flex flex-wrap gap-x-7">
            <Link href="/terms/" className="text-secondary hover:text-primary ease-fluid inline-flex min-h-11 items-center text-xs transition-colors duration-300">
              이용약관
            </Link>
            <Link href="/privacy/" className="text-primary hover:text-accent ease-fluid inline-flex min-h-11 items-center text-xs font-semibold transition-colors duration-300">
              개인정보처리방침
            </Link>
          </nav>
          <dl className="mt-6 grid gap-x-12 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(([label, value]) => (
              <div key={label} className="text-2xs flex gap-2.5">
                <dt className="text-muted w-32 shrink-0">{label}</dt>
                <dd className="text-secondary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-muted tracking-label text-2xs mt-12">© {new Date().getFullYear()} THE MANLY</p>
      </div>
    </footer>
  );
}
