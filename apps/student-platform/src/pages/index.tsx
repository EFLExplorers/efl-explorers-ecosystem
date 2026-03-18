import Head from "next/head";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { StudentDashboardFlow } from "@/components/student/StudentDashboardFlow";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import {
  fetchStudentAssignments,
  fetchStudentDashboard,
} from "@/lib/api/student-client";
import { EMPTY_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

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
    return {
      ...EMPTY_STUDENT_PORTAL_DATA,
      assignments: assignmentsResponse?.data ?? [],
    };
  }, [assignmentsResponse?.data]);

  const dueSoonCount = dashboardResponse?.data?.assignmentCounts?.dueSoon ?? 0;
  const dashboardDescription =
    dueSoonCount > 0
      ? `You have ${dueSoonCount} mission(s) to complete soon. Pick one and keep your star streak going.`
      : "Your next discovery is ready. Jump in and collect more stars.";

  return (
    <>
      <Head>
        <title>Student Dashboard</title>
        <meta
          name="description"
          content="Kid-friendly student mission dashboard."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <StudentLayout
        title="Home Base"
        description={dashboardDescription}
        learnerName={portalData.student.name}
        learningMode={portalData.student.mode}
      >
        <StudentDashboardFlow
          portalData={portalData}
          missionControl={dashboardResponse?.data?.missionControl}
        />
      </StudentLayout>
    </>
  );
};

export default StudentsHomePage;
