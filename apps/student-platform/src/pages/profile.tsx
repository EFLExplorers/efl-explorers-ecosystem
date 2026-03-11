import Head from "next/head";

import pageStyles from "@/components/student/portal-page.module.css";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const ProfilePage = () => {
  return (
    <>
      <Head>
        <title>Student Profile</title>
      </Head>
      <StudentLayout
        title="Profile"
        description="Student profile, learning mode, and teacher relationship details."
        learnerName={MOCK_STUDENT_PORTAL_DATA.student.name}
        learningMode={MOCK_STUDENT_PORTAL_DATA.student.mode}
      >
        <section className={pageStyles.grid}>
          <article className={`${pageStyles.hero} ${pageStyles.full}`}>
            <h2 className={pageStyles.heroTitle}>Learner profile center</h2>
            <p className={pageStyles.heroSubtitle}>
              Keep your learner details and support preferences up to date so your
              teacher can personalize class sessions.
            </p>
            <div className={pageStyles.actions}>
              <button type="button" className={pageStyles.buttonPrimary}>
                Save profile
              </button>
              <button type="button" className={pageStyles.buttonGhost}>
                View parent summary
              </button>
            </div>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Student</h2>
            <p className={pageStyles.text}>{MOCK_STUDENT_PORTAL_DATA.student.name}</p>
            <p className={pageStyles.subtle}>
              {MOCK_STUDENT_PORTAL_DATA.student.levelLabel} -{" "}
              {MOCK_STUDENT_PORTAL_DATA.student.planetLabel}
            </p>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Learning mode</h2>
            <p className={pageStyles.text}>{MOCK_STUDENT_PORTAL_DATA.student.mode}</p>
            <p className={pageStyles.subtle}>
              Sign-in starts on landing page; this app assumes authenticated student
              context.
            </p>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Profile details</h2>
            <div className={pageStyles.formGrid}>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Display name</span>
                <input
                  className={pageStyles.input}
                  defaultValue={MOCK_STUDENT_PORTAL_DATA.student.name}
                />
              </label>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Preferred class time</span>
                <select className={pageStyles.select} defaultValue="evening">
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </label>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Learning confidence</span>
                <select className={pageStyles.select} defaultValue="building">
                  <option value="building">Building confidence</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="advanced">Advanced pace</option>
                </select>
              </label>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Help style</span>
                <select className={pageStyles.select} defaultValue="visual">
                  <option value="visual">Visual prompts</option>
                  <option value="audio">Audio repetition</option>
                  <option value="mixed">Mixed support</option>
                </select>
              </label>
            </div>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Teacher relationship</h2>
            <ul className={pageStyles.list}>
              <li className={pageStyles.listItem}>
                <strong>Name:</strong> {MOCK_STUDENT_PORTAL_DATA.teacher.name}
              </li>
              <li className={pageStyles.listItem}>
                <strong>Verified:</strong>{" "}
                {MOCK_STUDENT_PORTAL_DATA.teacher.verified ? "Yes" : "No"}
              </li>
              <li className={pageStyles.listItem}>
                <strong>Class format:</strong> Live scheduled sessions + assigned
                follow-up tasks
              </li>
            </ul>
          </article>
        </section>
      </StudentLayout>
    </>
  );
};

export default ProfilePage;
