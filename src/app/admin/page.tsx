import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "대시보드" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/"
      title="대시보드"
      description="오늘 예약 · 확인 기다리는 예약 · 진행 중 맞춤 주문 · 답 기다리는 문의."
    >
      <AdminDashboard />
    </AdminShell>
  );
}
