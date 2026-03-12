import Head from "next/head";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import pageStyles from "@/components/student/portal-page.module.css";
import { fetchStudentLessons } from "@/lib/api/student-client";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const LessonsPage = () => {
  const { data: lessonsResponse } = useQuery({
    queryKey: ["/api/student/lessons"],
    queryFn: fetchStudentLessons,
  });

  const portalData = useMemo(() => {
    if (!lessonsResponse?.data) {
      return MOCK_STUDENT_PORTAL_DATA;
    }

    return {
      ...MOCK_STUDENT_PORTAL_DATA,
      lessons: lessonsResponse.data.lessons,
      classes: lessonsResponse.data.classes,
    };
  }, [lessonsResponse?.data]);

  const getLessonPercent = (status: string) => {
    if (status === "next") {
      return 65;
    }
    if (status === "upcoming") {
      return 20;
    }
    return 90;
  };

  return (
    <>
      <Head>
        <title>Lesson Path</title>
      </Head>
      <StudentLayout
        title="Lesson Path"
        description="Pick your next discovery and get ready for your live class adventure."
        learnerName={portalData.student.name}
        learningMode={portalData.student.mode}
      >
        <section className={pageStyles.grid}>
          <article className={`${pageStyles.hero} ${pageStyles.full}`}>
            <h2 className={pageStyles.heroTitle}>Your discovery trail</h2>
            <p className={pageStyles.heroSubtitle}>
              Keep moving through your lessons with fun speaking and vocabulary
              missions.
            </p>
            <div className={pageStyles.actions}>
              <button type="button" className={pageStyles.buttonPrimary}>
                Start next discovery
              </button>
              <button type="button" className={pageStyles.buttonGhost}>
                See this week
              </button>
            </div>
            <div className={pageStyles.stats}>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Current</p>
                <p className={pageStyles.statValue}>
                  {portalData.lessons[0]?.unitLabel}
                </p>
              </div>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Queue</p>
                <p className={pageStyles.statValue}>
                  {portalData.lessons.length} lessons
                </p>
              </div>
              <div className={pageStyles.stat}>
                <p className={pageStyles.statLabel}>Next Class</p>
                <p className={pageStyles.statValue}>
                  {portalData.classes[0]?.startLabel}
                </p>
              </div>
            </div>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Live class prep</h2>
            <p className={pageStyles.text}>
              Your next class begins at {portalData.classes[0]?.startLabel}.
            </p>
            <p className={pageStyles.meta}>
              Teacher: {portalData.classes[0]?.teacherName}
            </p>
            <div className={pageStyles.chipRow}>
              <span className={pageStyles.chip}>Live speaking</span>
              <span className={pageStyles.chip}>Q&A practice</span>
              <span className={pageStyles.chip}>Vocabulary check</span>
            </div>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Mission queue</h2>
            <ul className={pageStyles.list}>
              {portalData.lessons.map((lesson) => (
                <li key={lesson.id} className={pageStyles.listItem}>
                  <div className={pageStyles.row}>
                    <strong>
                      {lesson.unitLabel}: {lesson.title}
                    </strong>
                    <span className={pageStyles.badge}>{lesson.status}</span>
                  </div>
                  <p className={pageStyles.subtle}>{lesson.focus}</p>
                  <progress
                    className={pageStyles.progressBar}
                    value={getLessonPercent(lesson.status)}
                    max={100}
                    aria-label={`${lesson.title} completion`}
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

export default LessonsPage;
