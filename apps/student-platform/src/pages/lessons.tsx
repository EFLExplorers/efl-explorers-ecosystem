import Head from "next/head";

import pageStyles from "@/components/student/portal-page.module.css";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const LessonsPage = () => {
  return (
    <>
      <Head>
        <title>Student Lessons</title>
      </Head>
      <StudentLayout
        title="Lessons"
        description="Follow your next lesson path and stay ready for teacher-led sessions."
        learnerName={MOCK_STUDENT_PORTAL_DATA.student.name}
        learningMode={MOCK_STUDENT_PORTAL_DATA.student.mode}
      >
        <section className={pageStyles.grid}>
          <article className={`${pageStyles.hero} ${pageStyles.full}`}>
            <h2 className={pageStyles.heroTitle}>Garden Planet lesson path</h2>
            <p className={pageStyles.heroSubtitle}>
              Continue your guided unit sequence with teacher support and visual
              vocabulary activities.
            </p>
            <div className={pageStyles.actions}>
              <button type="button" className={pageStyles.buttonPrimary}>
                Resume next lesson
              </button>
              <button type="button" className={pageStyles.buttonGhost}>
                Preview weekly plan
              </button>
            </div>
            <div className={pageStyles.stats}>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Current</p>
                <p className={pageStyles.statValue}>
                  {MOCK_STUDENT_PORTAL_DATA.lessons[0]?.unitLabel}
                </p>
              </div>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Queue</p>
                <p className={pageStyles.statValue}>
                  {MOCK_STUDENT_PORTAL_DATA.lessons.length} lessons
                </p>
              </div>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Next Class</p>
                <p className={pageStyles.statValue}>
                  {MOCK_STUDENT_PORTAL_DATA.classes[0]?.startLabel}
                </p>
              </div>
            </div>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Class prep</h2>
            <p className={pageStyles.text}>
              Your next live class is {MOCK_STUDENT_PORTAL_DATA.classes[0]?.startLabel}
              .
            </p>
            <p className={pageStyles.meta}>
              Teacher: {MOCK_STUDENT_PORTAL_DATA.classes[0]?.teacherName}
            </p>
            <div className={pageStyles.chipRow}>
              <span className={pageStyles.chip}>Live speaking</span>
              <span className={pageStyles.chip}>Q&A practice</span>
              <span className={pageStyles.chip}>Vocabulary check</span>
            </div>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Lesson queue</h2>
            <ul className={pageStyles.list}>
              {MOCK_STUDENT_PORTAL_DATA.lessons.map((lesson) => (
                <li key={lesson.id} className={pageStyles.listItem}>
                  <div className={pageStyles.row}>
                    <strong>
                      {lesson.unitLabel}: {lesson.title}
                    </strong>
                    <span className={pageStyles.badge}>{lesson.status}</span>
                  </div>
                  <p className={pageStyles.subtle}>{lesson.focus}</p>
                  <div className={pageStyles.track}>
                    <div
                      className={pageStyles.fill}
                      style={{ width: lesson.status === "next" ? "65%" : lesson.status === "upcoming" ? "20%" : "90%" }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </StudentLayout>
    </>
  );
};

export default LessonsPage;
