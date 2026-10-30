"use client";

import {
  Buildings,
  CalendarCheck,
  ChatCircleText,
  ClipboardText,
  FilmStrip,
  House,
  ListBullets,
  Scissors,
  ShieldCheck,
  SignOut,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  adminLogout,
  isAdmin,
  isSuperAdmin,
  listInquiries,
  me,
} from "@/lib/admin";
import type { CurrentUser } from "@/lib/api";
import { API_CONNECTED } from "@/lib/site";

/**
 * THE MANLY 관리자 화면의 틀 (2026-10-16) — 왼쪽 메뉴 + 위 줄(누가 들어와 있는지 · 사이트로 · 로그아웃) + 본문.
 *
 * 들어올 때 한 번 본다: 로그인 안 했거나 관리자가 아니면 → 관리자 로그인, 임시 비밀번호면 → 비밀번호 바꾸기.
 * 진짜 문지기는 서버다(/api/admin/** = ADMIN) — 여기서 보는 건 길 안내일 뿐, 화면을 열어도 서버가 데이터를 주지 않는다.
 *
 * 메뉴의 ready 를 false 로 두면 "준비 중" 으로 보인다(새 메뉴를 먼저 걸어 둘 때).
 */
type Icon = typeof House;
type Item = {
  href: string;
  label: string;
  icon: Icon;
  ready: boolean;
  superOnly?: boolean;
  badge?: "inquiries";
};

const NAV: Item[] = [
  { href: "/admin/", label: "대시보드", icon: House, ready: true },
  {
    href: "/admin/inquiries/",
    label: "문의",
    icon: ChatCircleText,
    ready: true,
    badge: "inquiries",
  },
  {
    href: "/admin/bookings/",
    label: "예약",
    icon: CalendarCheck,
    ready: true,
  },
  {
    href: "/admin/orders/",
    label: "맞춤 주문",
    icon: ClipboardText,
    ready: true,
  },
  { href: "/admin/members/", label: "회원 · 치수", icon: Users, ready: true },
  {
    href: "/admin/fabrics/",
    label: "원단 · 스타일",
    icon: Scissors,
    ready: true,
  },
  {
    href: "/admin/film/",
    label: "메인 영상 · 사진",
    icon: FilmStrip,
    ready: true,
  },
  { href: "/admin/business/", label: "푸터 · 사업자 정보", icon: Buildings, ready: true },
  {
    href: "/admin/access-logs/",
    label: "접속 기록",
    icon: ShieldCheck,
    ready: true,
    superOnly: true,
  },
];

export function AdminShell({
  active,
  title,
  description,
  children,
}: {
  active: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);
  const [openInquiries, setOpenInquiries] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!API_CONNECTED) return;
    let alive = true;
    me()
      .then((u) => {
        if (!alive) return;
        if (!isAdmin(u)) {
          router.replace(
            `/admin/login/?next=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }
        if (
          u!.mustChangePassword &&
          !window.location.pathname.startsWith("/admin/password")
        ) {
          router.replace("/admin/password/");
          return;
        }
        setUser(u);
        // 메뉴 배지 — 답 기다리는 문의 수. 실패해도 화면은 그대로. 임시 비밀번호 동안은 서버가 막으니(403) 부르지 않는다
        if (!u!.mustChangePassword)
          listInquiries("OPEN", 0)
            .then((p) => alive && setOpenInquiries(p.openCount))
            .catch(() => {});
      })
      .catch(() => alive && router.replace("/admin/login/"));
    return () => {
      alive = false;
    };
  }, [router]);

  if (!API_CONNECTED) {
    return (
      <Frame>
        <p className="border-subtle bg-surface text-muted border px-5 py-4 text-sm">
          화면 확인 단계입니다. 관리자 서버는 아직 연결되지 않았습니다.
        </p>
      </Frame>
    );
  }
  if (user === undefined) {
    return (
      <Frame>
        <p aria-busy="true" className="text-muted text-sm">
          확인하는 중
        </p>
      </Frame>
    );
  }

  const items = NAV.filter((n) => !n.superOnly || isSuperAdmin(user));
  const menu = (
    <ul className="flex flex-col gap-1">
      {items.map((n) => {
        const on = n.href === active;
        const Icon = n.icon;
        const inner = (
          <>
            <Icon
              size={17}
              weight={on ? "regular" : "light"}
              aria-hidden="true"
              className="shrink-0"
            />
            <span className="flex-1">{n.label}</span>
            {n.badge === "inquiries" && openInquiries ? (
              <span
                className="bg-accent text-on-accent rounded-full px-2 py-0.5 text-[0.65rem] tabular-nums"
                aria-label={`답 기다리는 문의 ${openInquiries}건`}
              >
                {openInquiries}
              </span>
            ) : null}
            {!n.ready && (
              <span className="text-muted text-[0.6rem]">준비 중</span>
            )}
          </>
        );
        const cls = `ease-fluid flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-300 ${
          on
            ? "bg-surface text-primary"
            : n.ready
              ? "text-secondary hover:bg-surface/60 hover:text-primary"
              : "text-muted/70 cursor-default"
        }`;
        return (
          <li key={n.href}>
            {n.ready ? (
              <Link
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={cls}
                onClick={() => setMenuOpen(false)}
              >
                {inner}
              </Link>
            ) : (
              <span className={cls} aria-disabled="true">
                {inner}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex min-h-svh flex-1">
      {/* 데스크톱 — 왼쪽 메뉴 고정 */}
      <aside className="border-subtle bg-band hidden w-64 shrink-0 flex-col border-r px-4 py-6 lg:flex">
        <Link
          href="/admin/"
          className="font-display text-primary px-3 text-lg tracking-[0.22em]"
        >
          THE MANLY
        </Link>
        <p className="text-accent tracking-label mt-1 px-3 text-[0.6rem]">
          ADMIN
        </p>
        <nav aria-label="관리자 메뉴" className="mt-8">
          {menu}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-subtle flex h-16 items-center justify-between gap-4 border-b px-5 md:px-8">
          <button
            type="button"
            className="text-secondary flex h-11 items-center gap-2 text-sm lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <ListBullets size={20} weight="light" aria-hidden="true" />
            메뉴
          </button>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted hidden sm:inline">
              {user!.name} · {isSuperAdmin(user) ? "최고 관리자" : "관리자"}
            </span>
            <Link
              href="/"
              className="text-secondary hover:text-accent min-h-11 content-center"
            >
              사이트로
            </Link>
            <button
              type="button"
              onClick={() =>
                adminLogout().finally(() => router.replace("/admin/login/"))
              }
              className="text-secondary hover:text-accent flex min-h-11 items-center gap-1.5"
            >
              <SignOut size={14} weight="light" aria-hidden="true" />
              로그아웃
            </button>
          </div>
        </header>

        {menuOpen && (
          <nav
            id="admin-menu"
            aria-label="관리자 메뉴"
            className="border-subtle bg-band border-b px-4 py-4 lg:hidden"
          >
            {menu}
          </nav>
        )}

        <main id="main" className="flex-1 px-5 py-8 md:px-8 md:py-10">
          <h1 className="font-display text-primary leading-display text-2xl md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-secondary mt-2 max-w-[64ch] text-sm leading-relaxed">
              {description}
            </p>
          )}
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** 확인 전 · 서버 없음 — 메뉴 없이 가운데 한 줄 */
function Frame({ children }: { children: ReactNode }) {
  return (
    <main
      id="main"
      className="flex min-h-svh flex-1 items-center justify-center px-5"
    >
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
