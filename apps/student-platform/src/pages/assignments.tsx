import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import pageStyles from "@/components/student/portal-page.module.css";
import {
  fetchStudentAssignments,
  markStudentAssignmentCompleted,
} from "@/lib/api/student-client";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const AssignmentsPage = () => {
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: assignmentsResponse } = useQuery({
    queryKey: ["/api/student/assignments", "assignments-page"],
    queryFn: fetchStudentAssignments,
  });

  const assignments = assignmentsResponse?.data ?? MOCK_STUDENT_PORTAL_DATA.assignments;

  const firstOpenAssignment = useMemo(
    () => assignments.find((assignment) => assignment.status !== "completed"),
    [assignments],
  );

  const completeAssignmentMutation = useMutation({
    mutationFn: markStudentAssignmentCompleted,
    onSuccess: async (result) => {
      setCelebrationMessage(`Great job! "${result.data.title}" is now complete.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/student/assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/student/dashboard"] }),
      ]);
    },
  });

  useEffect(() => {
    if (!celebrationMessage) {
      return;
    }
    const timeoutId = window.setTimeout(() => setCelebrationMessage(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [celebrationMessage]);

  const handleCompleteTopPriority = async () => {
    if (!firstOpenAssignment) {
      return;
    }

    await completeAssignmentMutation.mutateAsync(firstOpenAssignment.id);
  };

  return (
    <>
      <Head>
        <title>Missions</title>
      </Head>
      <StudentLayout
        title="Missions"
        description="Finish your priority missions and earn stars before class."
        learnerName={MOCK_STUDENT_PORTAL_DATA.student.name}
        learningMode={MOCK_STUDENT_PORTAL_DATA.student.mode}
      >
        <section className={pageStyles.grid}>
          {celebrationMessage ? (
            <article className={`${pageStyles.celebration} ${pageStyles.full}`} role="status">
              <p className={pageStyles.celebrationText}>{celebrationMessage}</p>
            </article>
          ) : null}
          <article className={`${pageStyles.hero} ${pageStyles.full}`}>
            <h2 className={pageStyles.heroTitle}>Mission center</h2>
            <p className={pageStyles.heroSubtitle}>
              Finish missions before class so live time can focus on speaking and
              confidence.
            </p>
            <div className={pageStyles.actions}>
              <button type="button" className={pageStyles.buttonPrimary}>
                Open priority mission
              </button>
              <button
                type="button"
                className={pageStyles.buttonGhost}
                onClick={handleCompleteTopPriority}
                disabled={!firstOpenAssignment || completeAssignmentMutation.isPending}
              >
                {completeAssignmentMutation.isPending
                  ? "Saving..."
                  : "Mark mission done"}
              </button>
            </div>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Due soon</h2>
            <p className={pageStyles.text}>
              Try to finish these before your next class starts.
            </p>
            <p className={pageStyles.meta}>
              {
                assignments.filter(
                  (item) => item.status === "due-soon",
                ).length
              }{" "}
              mission(s) due soon
            </p>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Coach support</h2>
            <p className={pageStyles.text}>
              {MOCK_STUDENT_PORTAL_DATA.teacher.name} reviews your progress each
              session.
            </p>
            <p className={pageStyles.meta}>Verified teacher: Yes</p>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Mission board</h2>
            <div className={pageStyles.board}>
              <div className={pageStyles.column}>
                <h3 className={pageStyles.columnTitle}>Due soon</h3>
                <ul className={pageStyles.list}>
                  {assignments
                    .filter((assignment) => assignment.status === "due-soon")
                    .map((assignment) => (
                      <li key={assignment.id} className={pageStyles.listItem}>
                        <strong>{assignment.unitLabel}</strong>
                        <p className={pageStyles.subtle}>{assignment.title}</p>
                      </li>
                    ))}
                </ul>
              </div>
              <div className={pageStyles.column}>
                <h3 className={pageStyles.columnTitle}>In progress</h3>
                <ul className={pageStyles.list}>
                  {assignments
                    .filter((assignment) => assignment.status === "in-progress")
                    .map((assignment) => (
                      <li key={assignment.id} className={pageStyles.listItem}>
                        <strong>{assignment.unitLabel}</strong>
                        <p className={pageStyles.subtle}>{assignment.title}</p>
                      </li>
                    ))}
                </ul>
              </div>
              <div className={pageStyles.column}>
                <h3 className={pageStyles.columnTitle}>Completed</h3>
                <ul className={pageStyles.list}>
                  {assignments
                    .filter((assignment) => assignment.status === "completed")
                    .map((assignment) => (
                      <li key={assignment.id} className={pageStyles.listItem}>
                        <strong>{assignment.unitLabel}</strong>
                        <p className={pageStyles.subtle}>{assignment.title}</p>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Mission list</h2>
            <ul className={pageStyles.list}>
              {assignments.map((assignment) => (
                <li key={assignment.id} className={pageStyles.listItem}>
                  <div className={pageStyles.row}>
                    <strong>
                      {assignment.unitLabel}: {assignment.title}
                    </strong>
                    <div className={pageStyles.row}>
                      <span className={pageStyles.badge}>{assignment.status}</span>
                      {assignment.status !== "completed" ? (
                        <button
                          type="button"
                          className={pageStyles.buttonGhost}
                          onClick={() =>
                            completeAssignmentMutation.mutate(assignment.id)
                          }
                          disabled={completeAssignmentMutation.isPending}
                        >
                          Done
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p className={pageStyles.subtle}>
                    {assignment.dueLabel} - Source: {assignment.source}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </StudentLayout>
    </>
  );
};

export default AssignmentsPage;
