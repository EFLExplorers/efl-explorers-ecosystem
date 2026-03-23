"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

import styles from "@/components/dashboard/DashboardShell.module.css";

const NAV_ITEMS: readonly { readonly href: string; readonly label: string }[] =
  [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/programs", label: "Programs" },
    { href: "/dashboard/publish", label: "Publish" },
    { href: "/dashboard/invites", label: "Invites" },
    { href: "/settings", label: "Settings" },
  ];

export type DashboardShellProps = {
  readonly children: ReactNode;
  readonly pageTitle: string;
  readonly pageSubtitle?: string;
  /** When set, shown in header instead of waiting on session (optional). */
  readonly userEmailOverride?: string | null;
};

export const DashboardShell = ({
  children,
  pageTitle,
  pageSubtitle = "[wireframe] Layout shell — scale per docs",
  userEmailOverride,
}: DashboardShellProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const pathname = router.pathname;

  const email =
    userEmailOverride ??
    session?.user?.email ??
    (status === "loading" ? "…" : "—");

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar} aria-label="Primary navigation">
        <div className={styles.brand}>Curriculum platform</div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <p className={styles.pageSubtitle}>{pageSubtitle}</p>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.userChip} title={email}>
              {email}
            </span>
            <button
              className={styles.signOut}
              type="button"
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </button>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
