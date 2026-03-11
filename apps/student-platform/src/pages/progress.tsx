import Head from "next/head";

import pageStyles from "@/components/student/portal-page.module.css";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const ProgressPage = () => {
  return (
    <>
      <Head>
        <title>Student Progress</title>
      </Head>
      <StudentLayout
        title="Progress"
        description="See your learning journey, stars, and review checkpoints."
        learnerName={MOCK_STUDENT_PORTAL_DATA.student.name}
        learningMode={MOCK_STUDENT_PORTAL_DATA.student.mode}
      >
        <section className={pageStyles.grid}>
          <article className={`${pageStyles.hero} ${pageStyles.full}`}>
            <h2 className={pageStyles.heroTitle}>Journey progress</h2>
            <p className={pageStyles.heroSubtitle}>
              Level 0 is tracked by task blocks so you always know what is unlocked,
              what is in progress, and what comes next.
            </p>
            <div className={pageStyles.stats}>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Units done</p>
                <p className={pageStyles.statValue}>3 / 30</p>
              </div>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Stars</p>
                <p className={pageStyles.statValue}>
                  {MOCK_STUDENT_PORTAL_DATA.student.stars}
                </p>
              </div>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Next gate</p>
                <p className={pageStyles.statValue}>Unit 4 Review</p>
              </div>
            </div>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Current level</h2>
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
            <p className={pageStyles.text}>Stars show consistent effort and progress.</p>
            <p className={pageStyles.meta}>
              Stars collected: {MOCK_STUDENT_PORTAL_DATA.student.stars}
            </p>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Checkpoint timeline</h2>
            <ul className={pageStyles.list}>
              <li className={pageStyles.listItem}>
                <strong>Task Block 1 (Units 1-4)</strong>
                <p className={pageStyles.subtle}>In progress - review gate at Unit 4</p>
                <div className={pageStyles.track}>
                  <div className={pageStyles.fill} style={{ width: "75%" }} />
                </div>
              </li>
              <li className={pageStyles.listItem}>
                <strong>Task Block 2 (Units 5-8)</strong>
                <p className={pageStyles.subtle}>Locked until Task Block 1 review</p>
                <div className={pageStyles.track}>
                  <div className={pageStyles.fill} style={{ width: "0%" }} />
                </div>
              </li>
              <li className={pageStyles.listItem}>
                <strong>Task Block 3 (Units 9-12)</strong>
                <p className={pageStyles.subtle}>Planned next in Garden Planet journey</p>
                <div className={pageStyles.track}>
                  <div className={pageStyles.fill} style={{ width: "0%" }} />
                </div>
              </li>
            </ul>
          </article>
        </section>
      </StudentLayout>
    </>
  );
};

export default ProgressPage;
