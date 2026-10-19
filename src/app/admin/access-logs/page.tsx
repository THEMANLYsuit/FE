import type { Metadata } from "next";

import { AdminAccessLogs } from "@/components/admin/AdminAccessLogs";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "접속 기록" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/access-logs/"
      title="접속 기록"
      description="관리자가 손님 정보를 언제 열고 바꿨는지 남은 기록입니다. 최고 관리자만 봅니다."
    >
      <AdminAccessLogs />
    </AdminShell>
  );
}
