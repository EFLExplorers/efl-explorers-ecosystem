import type { GetServerSideProps } from "next";
import { prisma } from "@repo/database";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireActiveCurriculumManager } from "@/lib/curriculumDashboardGuard";
import styles from "@/pages/settings/index.module.css";

type SettingsPageProps = {
  readonly managerName: string;
  readonly managerEmail: string;
  readonly createdAtLabel: string;
};

export const getServerSideProps: GetServerSideProps<SettingsPageProps> = async (
  context
) => {
  const access = await requireActiveCurriculumManager(context);
  if ("redirect" in access) {
    return access;
  }

  const manager = await prisma.curriculumManager.findUnique({
    where: { id: access.managerId },
    select: {
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!manager) {
    return {
      redirect: { destination: "/unauthorized", permanent: false },
    };
  }

  return {
    props: {
      managerName: manager.name,
      managerEmail: manager.email,
      createdAtLabel: manager.createdAt.toISOString(),
    },
  };
};

export const SettingsPage = ({
  managerName,
  managerEmail,
  createdAtLabel,
}: SettingsPageProps) => {
  const created = new Date(createdAtLabel);
  const createdDisplay = Number.isNaN(created.getTime())
    ? createdAtLabel
    : created.toLocaleString();

  return (
    <DashboardShell
      pageTitle="Settings"
      pageSubtitle="[wireframe] Manager profile · extend with prefs & security"
      userEmailOverride={managerEmail}
    >
      <div className={styles.profileRoot}>
        <section className={styles.card}>
          <div className={styles.row}>
            <span className={styles.label}>Name</span>
            <p className={styles.value}>{managerName}</p>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Email</span>
            <p className={styles.value}>{managerEmail}</p>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Account created</span>
            <p className={styles.value}>{createdDisplay}</p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default SettingsPage;
