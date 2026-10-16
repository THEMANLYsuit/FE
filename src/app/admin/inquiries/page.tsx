import type { Metadata } from "next";

import { AdminInquiries } from "@/components/admin/AdminInquiries";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "문의" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/inquiries/"
      title="문의"
      description="답 기다리는 문의부터 보입니다. 답하면 손님에게 메일이 가고, 회원이면 마이페이지 문의 탭에도 보입니다."
    >
      <AdminInquiries />
    </AdminShell>
  );
}
