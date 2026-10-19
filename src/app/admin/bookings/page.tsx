import type { Metadata } from "next";

import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "예약" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/bookings/"
      title="예약"
      description="확인 기다리는 신청부터 보입니다. 확정 · 시간 변경 · 취소는 손님에게 메일이 갑니다. 새 예약은 회원 화면에서 잡습니다."
    >
      <AdminBookings />
    </AdminShell>
  );
}
