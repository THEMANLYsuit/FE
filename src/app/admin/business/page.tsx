import type { Metadata } from "next";

import { AdminBusiness } from "@/components/admin/AdminBusiness";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "사업자 정보" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/business/"
      title="푸터 · 사업자 정보"
      description="모든 페이지 맨 아래와 문의 페이지에 나오는 사업자 정보입니다. 법으로 표시해야 하는 항목이라 사업자등록증과 한 글자도 다르지 않게 적어 주세요. 저장하면 손님 화면을 다시 만듭니다(1~2분)."
    >
      <AdminBusiness />
    </AdminShell>
  );
}
