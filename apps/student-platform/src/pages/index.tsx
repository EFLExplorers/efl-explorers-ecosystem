import Head from "next/head";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { StudentDashboardFlow } from "@/components/student/StudentDashboardFlow";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import {
  fetchStudentAssignments,
  fetchStudentDashboard,
} from "@/lib/api/student-client";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const StudentsHomePage = () => {
  const { data: assignmentsResponse } = useQuery({
    queryKey: ["/api/student/assignments", "dashboard-flow"],
    queryFn: fetchStudentAssignments,
  });
  const { data: dashboardResponse } = useQuery({
    queryKey: ["/api/student/dashboard"],
    queryFn: fetchStudentDashboard,
  });

  const portalData = useMemo(() => {
    if (!assignmentsResponse?.data) {
      return MOCK_STUDENT_PORTAL_DATA;
    }

    return {
      ...MOCK_STUDENT_PORTAL_DATA,
      assignments: assignmentsResponse.data,
    };
  }, [assignmentsResponse?.data]);

  const dueSoonCount = dashboardResponse?.data.assignmentCounts.dueSoon ?? 0;
  const dashboardDescription =
    dueSoonCount > 0
      ? `Start your next activity quickly, then complete ${dueSoonCount} due-soon task(s).`
      : "Start your next activity quickly, track progress, and finish delegated tasks.";

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
        description={dashboardDescription}
        learnerName={portalData.student.name}
        learningMode={portalData.student.mode}
      >
        <StudentDashboardFlow portalData={portalData} />
      </StudentLayout>
    </>
  );
};

export default StudentsHomePage;
