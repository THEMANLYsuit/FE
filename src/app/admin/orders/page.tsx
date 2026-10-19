import type { Metadata } from "next";

import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "맞춤 주문" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/orders/"
      title="맞춤 주문"
      description="단계를 옮기거나 안내를 남기면 손님에게 메일이 가고 마이페이지 진행 기록에 남습니다. 새 주문은 회원 화면에서 엽니다."
    >
      <AdminOrders />
    </AdminShell>
  );
}
