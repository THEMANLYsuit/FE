import type { Metadata } from "next";

/** 관리자 화면 — 검색에 나오지 않게. 사이트의 헤더 · 푸터 없이 관리자 틀(AdminShell)만 쓴다. */
export const metadata: Metadata = {
  title: { default: "관리자", template: "%s | THE MANLY 관리자" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
