import type { GetServerSideProps } from "next";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { requireActiveCurriculumManager } from "@/lib/curriculumDashboardGuard";
import styles from "@/pages/dashboard/index.module.css";

type DashboardPageProps = {
  readonly userEmail: string;
};

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async (
  context
) => {
  const access = await requireActiveCurriculumManager(context);
  if ("redirect" in access) {
    return access;
  }

  return {
    props: {
      userEmail: access.userEmail ?? "Unknown user",
    },
  };
};

export const DashboardPage = ({ userEmail }: DashboardPageProps) => {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Curriculum Manager Dashboard</h1>
          <p className={styles.subtitle}>Signed in as {userEmail}</p>
        </div>
        <button
          className={styles.button}
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </button>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Authoring</h2>
          <p>Create programs, levels, and units for story-driven learning.</p>
          <Link className={styles.link} href="/dashboard/programs">
            Open programs
          </Link>
        </article>

        <article className={styles.card}>
          <h2>Publishing</h2>
          <p>Generate immutable snapshots for teacher/student consumption.</p>
          <Link className={styles.link} href="/dashboard/publish">
            Open publish workspace
          </Link>
        </article>

        <article className={styles.card}>
          <h2>Access Management</h2>
          <p>Create and monitor invite-only manager registrations.</p>
          <Link className={styles.link} href="/dashboard/invites">
            Manage invites
          </Link>
        </article>

        <article className={styles.card}>
          <h2>Your profile</h2>
          <p>View your manager account details.</p>
          <Link className={styles.link} href="/settings">
            Open settings
          </Link>
        </article>
      </section>
    </main>
  );
};

export default DashboardPage;
