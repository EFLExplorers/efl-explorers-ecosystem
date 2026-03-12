import Head from "next/head";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import pageStyles from "@/components/student/portal-page.module.css";
import { fetchStudentProgress } from "@/lib/api/student-client";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const ProgressPage = () => {
  const { data: progressResponse } = useQuery({
    queryKey: ["/api/student/progress"],
    queryFn: fetchStudentProgress,
  });

  const progressData = progressResponse?.data;
  const progressView = useMemo(
    () => ({
      unitsCompleted: progressData?.unitsCompleted ?? 3,
      unitsTotal: progressData?.unitsTotal ?? 30,
      stars: progressData?.stars ?? MOCK_STUDENT_PORTAL_DATA.student.stars,
      nextGate: progressData?.nextGate ?? "Unit 4 Review",
      checkpoints:
        progressData?.checkpoints ?? [
          {
            id: "fallback-1",
            title: "Task Block 1 (Units 1-4)",
            subtitle: "In progress - review gate at Unit 4",
            percent: 75,
            status: "ACTIVE" as const,
          },
          {
            id: "fallback-2",
            title: "Task Block 2 (Units 5-8)",
            subtitle: "Locked until Task Block 1 review",
            percent: 0,
            status: "LOCKED" as const,
          },
          {
            id: "fallback-3",
            title: "Task Block 3 (Units 9-12)",
            subtitle: "Planned next in Garden Planet journey",
            percent: 0,
            status: "LOCKED" as const,
          },
        ],
    }),
    [progressData],
  );
  const completedCheckpoints = progressView.checkpoints.filter(
    (checkpoint) => checkpoint.status === "COMPLETED",
  ).length;

  return (
    <>
      <Head>
        <title>Star Journey</title>
      </Head>
      <StudentLayout
        title="Star Journey"
        description="See your stars, unlocks, and the next checkpoint on your adventure."
        learnerName={MOCK_STUDENT_PORTAL_DATA.student.name}
        learningMode={MOCK_STUDENT_PORTAL_DATA.student.mode}
      >
        <section className={pageStyles.grid}>
          <article className={`${pageStyles.hero} ${pageStyles.full}`}>
            <h2 className={pageStyles.heroTitle}>Adventure progress</h2>
            <p className={pageStyles.heroSubtitle}>
              Follow your checkpoint trail to see what is unlocked, what is active,
              and what treasure comes next.
            </p>
            {completedCheckpoints > 0 ? (
              <div className={pageStyles.celebrationStrip}>
                <span className={pageStyles.celebrationSpark}>✨</span>
                <span>
                  You have completed {completedCheckpoints} checkpoint
                  {completedCheckpoints === 1 ? "" : "s"}!
                </span>
              </div>
            ) : null}
            <div className={pageStyles.stats}>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Units done</p>
                <p className={pageStyles.statValue}>
                  {progressView.unitsCompleted} / {progressView.unitsTotal}
                </p>
              </div>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Stars</p>
                <p className={pageStyles.statValue}>{progressView.stars}</p>
              </div>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Next gate</p>
                <p className={pageStyles.statValue}>{progressView.nextGate}</p>
              </div>
            </div>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Current planet</h2>
            <p className={pageStyles.text}>
              {MOCK_STUDENT_PORTAL_DATA.student.levelLabel} -{" "}
              {MOCK_STUDENT_PORTAL_DATA.student.planetLabel}
            </p>
            <p className={pageStyles.meta}>
              {MOCK_STUDENT_PORTAL_DATA.student.unitProgressLabel}
            </p>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Reward stars</h2>
            <p className={pageStyles.text}>Each completed mission helps your star total grow.</p>
            <p className={pageStyles.meta}>Stars collected: {progressView.stars}</p>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Checkpoint trail</h2>
            <ul className={pageStyles.list}>
              {progressView.checkpoints.map((checkpoint) => (
                <li key={checkpoint.id} className={pageStyles.listItem}>
                  <div className={pageStyles.row}>
                    <strong>{checkpoint.title}</strong>
                    <span
                      className={
                        checkpoint.status === "COMPLETED"
                          ? `${pageStyles.badge} ${pageStyles.badgeSuccess}`
                          : checkpoint.status === "ACTIVE"
                            ? `${pageStyles.badge} ${pageStyles.badgeActive}`
                            : `${pageStyles.badge} ${pageStyles.badgeLocked}`
                      }
                    >
                      {checkpoint.status === "LOCKED"
                        ? "Locked"
                        : checkpoint.status === "ACTIVE"
                          ? "Ready now"
                          : "Completed"}
                    </span>
                  </div>
                  <p className={pageStyles.subtle}>{checkpoint.subtitle}</p>
                  {checkpoint.completionSource ? (
                    <p className={pageStyles.subtle}>
                      Verified by: {checkpoint.completionSource}
                    </p>
                  ) : null}
                  <progress
                    className={pageStyles.progressBar}
                    value={checkpoint.percent}
                    max={100}
                    aria-label={`${checkpoint.title} completion`}
                  />
                </li>
              ))}
            </ul>
          </article>
        </section>
      </StudentLayout>
    </>
  );
};

export default ProgressPage;
