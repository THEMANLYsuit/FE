import type { Metadata } from "next";

import { AdminPasswordForm } from "@/components/admin/AdminPasswordForm";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "비밀번호 바꾸기" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/password/"
      title="비밀번호 바꾸기"
      description="임시 비밀번호로 들어오셨습니다. 새 비밀번호로 바꾸면 관리자 화면이 열립니다."
    >
      <AdminPasswordForm />
    </AdminShell>
  );
}
