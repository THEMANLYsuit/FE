import type { Metadata } from "next";

import { AdminCatalog } from "@/components/admin/AdminCatalog";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "원단 · 스타일" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/fabrics/"
      title="원단 · 스타일"
      description="손님 화면의 원단 목록과 맞춤 주문의 스타일 선택지를 만듭니다."
    >
      <AdminCatalog />
    </AdminShell>
  );
}
