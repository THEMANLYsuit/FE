import type { Metadata } from "next";

import { AdminFilm } from "@/components/admin/AdminFilm";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "메인 영상" };

export default function Page() {
  return (
    <AdminShell
      active="/admin/film/"
      title="메인 영상"
      description="메인 첫 화면의 스크롤 필름. 영상을 올리면 서버가 사진 묶음으로 바꿔 바로 겁니다."
    >
      <AdminFilm />
    </AdminShell>
  );
}
