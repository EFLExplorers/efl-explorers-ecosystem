import ui from "@/components/layout/dashboardUi.module.css";

import styles from "./ConnectivityPanel.module.css";

import type { ConnectivityData } from "@/types/db-visualizer";

type ConnectivityPanelProps = {
  data: ConnectivityData;
};

export const ConnectivityPanel = ({ data }: ConnectivityPanelProps) => {
  return (
    <section className={ui.pageStack}>
      <p className={ui.callout}>
        <strong>Schema caveat:</strong> <code>teachers.Student.level</code> is not a foreign key to{" "}
        <code>curriculum.CurriculumLevel</code>. Matches below are read-only exact string matches.
      </p>

      <div className={styles.grid}>
        <article className={ui.card}>
          <h2 className={ui.cardTitle}>Exact matches</h2>
          {data.matches.length === 0 ? (
            <p className={ui.empty}>No exact level matches found.</p>
          ) : (
            <ul className={styles.matchList}>
              {data.matches.map((match) => (
                <li key={`${match.studentId}-${match.curriculumLevelId}`}>
                  <strong>{match.studentName}</strong> ({match.studentLevel}) {"->"} {match.programTitle} /{" "}
                  {match.curriculumLevelTitle}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={ui.card}>
          <h2 className={ui.cardTitle}>Unmatched students</h2>
          {data.unmatchedStudents.length === 0 ? (
            <p className={ui.empty}>All student levels found exact curriculum matches.</p>
          ) : (
            <ul className={styles.matchList}>
              {data.unmatchedStudents.map((student) => (
                <li key={student.id}>
                  <strong>{student.fullName}</strong> — <code>{student.level}</code>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
};
