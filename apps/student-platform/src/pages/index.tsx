import Head from "next/head";
import { StudentDashboardFlow } from "@/components/student/StudentDashboardFlow";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const StudentsHomePage = () => {
  return (
    <>
      <Head>
        <title>Student Dashboard</title>
        <meta
          name="description"
          content="Student dashboard shell aligned with interaction contracts."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <StudentLayout
        title="Dashboard"
        description="Start your next activity quickly, track progress, and finish delegated tasks."
        learnerName={MOCK_STUDENT_PORTAL_DATA.student.name}
        learningMode={MOCK_STUDENT_PORTAL_DATA.student.mode}
      >
        <StudentDashboardFlow portalData={MOCK_STUDENT_PORTAL_DATA} />
      </StudentLayout>
    </>
  );
};

export default StudentsHomePage;
