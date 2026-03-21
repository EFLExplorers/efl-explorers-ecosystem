import styles from "./ConnectivityPanel.module.css";

import type { ConnectivityData } from "@/types/db-visualizer";

type ConnectivityPanelProps = {
  data: ConnectivityData;
};

export const ConnectivityPanel = ({ data }: ConnectivityPanelProps) => {
  return (
    <section className={styles.panel}>
      <article className={styles.notice}>
        <strong>Schema caveat:</strong> `teachers.Student.level` is not a foreign key to
        `curriculum.CurriculumLevel`. Matches below are read-only exact string matches.
      </article>

      <div className={styles.grid}>
        <article className={styles.card}>
          <h3>Exact Matches</h3>
          {data.matches.length === 0 ? (
            <p className={styles.emptyState}>No exact level matches found.</p>
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

        <article className={styles.card}>
          <h3>Unmatched Students</h3>
          {data.unmatchedStudents.length === 0 ? (
            <p className={styles.emptyState}>All student levels found exact curriculum matches.</p>
          ) : (
            <ul className={styles.matchList}>
              {data.unmatchedStudents.map((student) => (
                <li key={student.id}>
                  <strong>{student.fullName}</strong> - `{student.level}`
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
};
