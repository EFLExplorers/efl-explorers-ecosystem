import type { GetServerSideProps } from "next";

import { ProcessHubCard } from "@/components/dashboard/ProcessHubCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireActiveCurriculumManager } from "@/lib/curriculumDashboardGuard";
import { prisma } from "@repo/database";

import styles from "@/pages/dashboard/index.module.css";

export type DashboardMetrics = {
  readonly programCount: number;
  readonly levelCount: number;
  readonly unitCount: number;
  readonly publishedLevelCount: number;
  readonly pendingInviteCount: number;
};

type DashboardPageProps = {
  readonly userEmail: string;
  readonly metrics: DashboardMetrics;
};

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async (
  context
) => {
  const access = await requireActiveCurriculumManager(context);
  if ("redirect" in access) {
    return access;
  }

  const [
    programCount,
    levelCount,
    unitCount,
    publishedLevelCount,
    pendingInviteCount,
  ] = await Promise.all([
    prisma.curriculumProgram.count({ where: { isArchived: false } }),
    prisma.curriculumLevel.count({ where: { status: { not: "archived" } } }),
    prisma.curriculumUnit.count({ where: { isArchived: false } }),
    prisma.curriculumLevel.count({ where: { status: "published" } }),
    prisma.curriculumInvite.count({
      where: { acceptedAt: null, revokedAt: null },
    }),
  ]);

  return {
    props: {
      userEmail: access.userEmail ?? "Unknown user",
      metrics: {
        programCount,
        levelCount,
        unitCount,
        publishedLevelCount,
        pendingInviteCount,
      },
    },
  };
};

export const DashboardPage = ({ userEmail, metrics }: DashboardPageProps) => {
  return (
    <DashboardShell
      pageTitle="Dashboard"
      pageSubtitle="Start a workflow or jump back into authoring and publishing."
      userEmailOverride={userEmail}
    >
      <p className={styles.welcome}>
        Signed in as <strong>{userEmail}</strong>. Use the cards below to open
        each process.
      </p>

      <div className={styles.grid}>
        <ProcessHubCard
          title="Author curriculum"
          description="Create programs, levels, and units. Edit lesson copy, media manifest JSON, and assignment settings."
          href="/dashboard/programs"
          actionLabel="Open programs workspace"
          meta={`${metrics.programCount} program(s) · ${metrics.unitCount} active unit(s)`}
        />
        <ProcessHubCard
          title="Publish to teacher & student apps"
          description="Create an immutable snapshot for a level so downstream APIs can serve stable content."
          href="/dashboard/publish"
          actionLabel="Go to publish"
          meta={`${metrics.publishedLevelCount} published level(s) · ${metrics.levelCount} active level(s) total`}
        />
        <ProcessHubCard
          title="Team access"
          description="Invite other curriculum managers by email. Invites must be accepted before registration."
          href="/dashboard/invites"
          actionLabel="Manage invites"
          meta={
            metrics.pendingInviteCount > 0
              ? `${metrics.pendingInviteCount} pending invite(s)`
              : "No pending invites"
          }
        />
        <ProcessHubCard
          title="Account"
          description="View your manager profile on this curriculum deployment."
          href="/settings"
          actionLabel="Open settings"
        />
      </div>
    </DashboardShell>
  );
};

export default DashboardPage;
