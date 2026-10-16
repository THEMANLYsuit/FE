import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "로그인" };

/** 관리자 로그인 — 메뉴 없이 가운데. 손님 로그인(/login)과 따로다. */
export default function Page() {
  return (
    <main
      id="main"
      className="flex min-h-svh flex-1 items-center justify-center px-5 py-16"
    >
      <div className="w-full max-w-sm">
        <p className="font-display text-primary text-center text-2xl tracking-[0.22em]">
          THE MANLY
        </p>
        <p className="text-accent tracking-label mt-2 text-center text-2xs">
          ADMIN
        </p>
        <div className="mt-10">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
