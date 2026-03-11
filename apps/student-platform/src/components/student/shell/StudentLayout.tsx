import type { PropsWithChildren } from "react";

import { StudentNav } from "./StudentNav";
import styles from "./student-layout.module.css";

type StudentLayoutProps = PropsWithChildren<{
  readonly title: string;
  readonly description: string;
  readonly learnerName?: string;
  readonly learningMode?: "parent-led" | "teacher-led";
}>;

export const StudentLayout = ({
  children,
  title,
  description,
  learnerName = "Explorer",
  learningMode = "teacher-led",
}: StudentLayoutProps) => {
  const learningModeLabel =
    learningMode === "teacher-led" ? "Teacher-led journey" : "Parent-led journey";

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <p className={styles.brand}>EFL Explorers</p>
          <p className={styles.sidebarSubtitle}>Student Platform</p>
        </div>
        <StudentNav />
      </aside>

      <div className={styles.contentShell}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div>
              <p className={styles.headerKicker}>Level 0 - Garden Planet</p>
              <h1 className={styles.title}>{title}</h1>
            </div>
            <div className={styles.headerMeta}>
              <span className={styles.metaPill}>{learningModeLabel}</span>
              <span className={styles.meta}>Hi, {learnerName}</span>
            </div>
          </div>
          <p className={styles.description}>{description}</p>
        </header>

        <main className={styles.content}>
          <section>{children}</section>
        </main>
      </div>
    </div>
  );
};
