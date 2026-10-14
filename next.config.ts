import type { NextConfig } from "next";

/**
 * 레오네페리토와 같은 정적 내보내기(SSG). 서버가 상주하지 않고, 빌드 때 API 에서 받은 것(원단 목록 등)을 HTML 에 굳힌다.
 * 로그인 · 예약처럼 사람마다 다른 것은 브라우저에서 API 로 직접 간다(lib/api.ts).
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
