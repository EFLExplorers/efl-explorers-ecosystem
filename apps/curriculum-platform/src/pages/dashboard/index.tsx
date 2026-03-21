import type { GetServerSideProps } from "next";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
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
    <DashboardShell
      pageTitle="Dashboard"
      pageSubtitle="[wireframe] High-level regions — replace with metrics & shortcuts"
      userEmailOverride={userEmail}
    >
      <div className={styles.grid}>
        <article className={styles.block}>
          <h2 className={styles.blockTitle}>Overview</h2>
          <p className={styles.blockBody}>
            Signed in as <strong>{userEmail}</strong>.
          </p>
          <p className={styles.placeholder}>
            [placeholder] KPIs · recent edits · system status
          </p>
        </article>

        <article className={styles.block}>
          <h2 className={styles.blockTitle}>Authoring</h2>
          <p className={styles.blockBody}>
            Programs, levels, units — use sidebar → Programs.
          </p>
          <p className={styles.placeholder}>
            [placeholder] Continue editing · draft counts
          </p>
        </article>

        <article className={styles.block}>
          <h2 className={styles.blockTitle}>Publishing</h2>
          <p className={styles.blockBody}>
            Snapshots for downstream apps — sidebar → Publish.
          </p>
          <p className={styles.placeholder}>
            [placeholder] Last publish · version diff
          </p>
        </article>

        <article className={styles.block}>
          <h2 className={styles.blockTitle}>Access</h2>
          <p className={styles.blockBody}>
            Invites and manager policy — sidebar → Invites.
          </p>
          <p className={styles.placeholder}>
            [placeholder] Pending invites · audit
          </p>
        </article>
      </div>
    </DashboardShell>
  );
};

export default DashboardPage;
