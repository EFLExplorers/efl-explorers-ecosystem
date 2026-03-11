import styles from "./dashboard-flow.module.css";
import type { StudentPortalData } from "@/lib/mock/student-portal-data";

type StudentDashboardFlowProps = {
  readonly portalData: StudentPortalData;
};

export const StudentDashboardFlow = ({ portalData }: StudentDashboardFlowProps) => {
  const dueSoonAssignments = portalData.assignments.filter(
    (assignment) => assignment.status === "due-soon" || assignment.status === "in-progress",
  );
  const nextLesson = portalData.lessons.find((lesson) => lesson.status === "next");

  return (
    <section className={styles.grid} aria-label="Student daily flow">
      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Today&apos;s mission</h2>
        <p className={styles.cardText}>
          {nextLesson
            ? `Finish ${nextLesson.unitLabel} and build confidence with ${nextLesson.focus.toLowerCase()}.`
            : "Continue your next lesson and collect a reward star."}
        </p>
        <p className={styles.meta}>
          Estimated time: {nextLesson?.estimatedMinutes ?? 12} minutes
        </p>
        <button type="button" className={styles.button}>
          Start today&apos;s activity
        </button>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Assigned by teacher</h2>
        <p className={styles.cardText}>
          {portalData.teacher.name} has delegated {dueSoonAssignments.length} activities.
        </p>
        <ul className={styles.list}>
          {dueSoonAssignments.map((assignment) => (
            <li key={assignment.id}>
              {assignment.unitLabel}: {assignment.title}
            </li>
          ))}
        </ul>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Progress snapshot</h2>
        <p className={styles.cardText}>
          You are on {portalData.student.levelLabel} {portalData.student.planetLabel},{" "}
          {portalData.student.unitProgressLabel}.
        </p>
        <p className={styles.meta}>Stars collected: {portalData.student.stars}</p>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Next unlock</h2>
        <p className={styles.cardText}>
          Complete Unit 4 review to unlock the next task block.
        </p>
        <p className={styles.meta}>Checkpoint: end of Week 3</p>
      </article>

      <article className={`${styles.card} ${styles.full}`}>
        <h2 className={styles.cardTitle}>Learning tools</h2>
        <p className={styles.cardText}>
          Speaker, repeat, slow, fast, look, and listen icons are ready to map to
          lesson activities as we wire each unit.
        </p>
      </article>
    </section>
  );
};
