import type { Metadata } from "next";

import { AdminMembers } from "@/components/admin/AdminMembers";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "회원 · 치수" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/members/"
      title="회원 · 치수"
      description="손님을 찾아 치수를 적고, 맞춤 주문을 열고, 예약을 잡습니다."
    >
      <AdminMembers />
    </AdminShell>
  );
}
