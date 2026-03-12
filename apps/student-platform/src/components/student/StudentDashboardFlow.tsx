import styles from "./dashboard-flow.module.css";
import type { StudentDashboardResponseDto } from "@/lib/api/student-contracts";
import type { StudentPortalData } from "@/lib/mock/student-portal-data";

type StudentDashboardFlowProps = {
  readonly portalData: StudentPortalData;
  readonly missionControl?: StudentDashboardResponseDto["data"]["missionControl"];
};

export const StudentDashboardFlow = ({
  portalData,
  missionControl,
}: StudentDashboardFlowProps) => {
  const dueSoonAssignments = portalData.assignments.filter(
    (assignment) => assignment.status === "due-soon" || assignment.status === "in-progress",
  );
  const nextLesson = portalData.lessons.find((lesson) => lesson.status === "next");
  const missionTitle = missionControl?.title || "Today's mission";
  const missionDetail = missionControl?.detail
    ? missionControl.detail
    : nextLesson
      ? `Finish ${nextLesson.unitLabel} and build confidence with ${nextLesson.focus.toLowerCase()}.`
      : "Continue your next lesson and collect a reward star.";
  const missionCta = missionControl?.ctaLabel || "Start today's activity";
  const missionMode = missionControl?.mode || "next-discovery";
  const missionModeLabel =
    missionMode === "live-lesson"
      ? "Live class"
      : missionMode === "priority-mission"
        ? "Priority mission"
        : "Next discovery";
  const assignedHeading = dueSoonAssignments.length > 0 ? "Coach missions" : "Great work";
  const assignedBody =
    dueSoonAssignments.length > 0
      ? `${portalData.teacher.name} has shared ${dueSoonAssignments.length} mission(s) for you.`
      : "No urgent missions right now. Keep going with your next discovery.";

  return (
    <section className={styles.grid} aria-label="Student daily flow">
      <article className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.cardTitle}>{missionTitle}</h2>
          <span className={styles.stateBadge}>{missionModeLabel}</span>
        </div>
        <p className={styles.cardText}>{missionDetail}</p>
        <p className={styles.meta}>
          Estimated time: {nextLesson?.estimatedMinutes ?? 12} minutes
        </p>
        <button type="button" className={styles.button}>
          {missionCta}
        </button>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>{assignedHeading}</h2>
        <p className={styles.cardText}>{assignedBody}</p>
        <ul className={styles.list}>
          {dueSoonAssignments.length > 0 ? (
            dueSoonAssignments.map((assignment) => (
              <li key={assignment.id}>
                {assignment.unitLabel}: {assignment.title}
              </li>
            ))
          ) : (
            <li>Try your next lesson to earn more stars.</li>
          )}
        </ul>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Star snapshot</h2>
        <p className={styles.cardText}>
          You are on {portalData.student.levelLabel} {portalData.student.planetLabel},{" "}
          {portalData.student.unitProgressLabel}.
        </p>
        <p className={styles.meta}>Stars collected: {portalData.student.stars}</p>
        <p className={styles.helper}>Tracking responsibility: System + teacher override</p>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Next treasure unlock</h2>
        <p className={styles.cardText}>
          Complete your Unit 4 review to unlock the next mission block.
        </p>
        <p className={styles.meta}>Checkpoint target: end of Week 3</p>
      </article>

      <article className={`${styles.card} ${styles.full}`}>
        <h2 className={styles.cardTitle}>Explorer tools</h2>
        <p className={styles.cardText}>
          Listen, repeat, slow mode, and helper icons are ready for each lesson
          adventure.
        </p>
      </article>
    </section>
  );
};
