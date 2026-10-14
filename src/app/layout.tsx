import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_KR, Spectral } from "next/font/google";
import "./globals.css";
import { BRAND_DESCRIPTION, SITE_URL } from "@/lib/site";

/**
 * 폰트 — 영문 세리프 / 국문 고딕 (레오네페리토와 같은 원리, styles/tokens/typography.css).
 * 라틴 폰트에 한글 글리프가 없어야 글리프 단위 폴백이 성립한다.
 */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-latin",
  display: "swap",
});

const body = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body-latin",
  display: "swap",
});

/** 한글 전담 고딕. preload 하지 않는다 — 한글 글리프는 라틴보다 수십 배 커서 첫 화면이 늦어진다. */
const korean = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  variable: "--font-korean",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "THE MANLY 맞춤정장", template: "%s | THE MANLY" },
  description: BRAND_DESCRIPTION,
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  openGraph: { type: "website", siteName: "THE MANLY", locale: "ko_KR", title: "THE MANLY 맞춤정장", description: BRAND_DESCRIPTION },
  // 오픈 전까지 검색 노출 차단. robots.txt(public/) 와 짝이다.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${display.variable} ${body.variable} ${korean.variable} h-full antialiased`}>
      <body className="bg-base text-primary film-grain flex min-h-full flex-col">
        <a
          href="#main"
          className="bg-accent text-on-accent sr-only rounded-full text-sm focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:px-5 focus-visible:py-3"
        >
          본문으로 건너뛰기
        </a>
        {/*
          장면 연출을 JS 가 있을 때만 켠다. CSS 기본값을 "숨김" 으로 두면 스크립트가 안 돌 때 본문이 영영 안 보인다.
          기본은 보이는 상태, 이 스크립트가 붙어야 숨김 + 나타남이 켜진다 (globals.css html[data-motion="on"]).
        */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.motion="on"` }} />
        {children}
      </body>
    </html>
  );
}
