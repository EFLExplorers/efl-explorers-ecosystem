import Head from "next/head";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import pageStyles from "@/components/student/portal-page.module.css";
import {
  fetchStudentAssignments,
  markStudentAssignmentCompleted,
} from "@/lib/api/student-client";
import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

export const AssignmentsPage = () => {
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/student/assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/student/dashboard"] }),
      ]);
    },
  });

  const handleCompleteTopPriority = async () => {
    if (!firstOpenAssignment) {
      return;
    }

    await completeAssignmentMutation.mutateAsync(firstOpenAssignment.id);
  };

  return (
    <>
      <Head>
        <title>Student Assignments</title>
      </Head>
      <StudentLayout
        title="Assignments"
        description="Track delegated tasks from your teacher and home practice from parents."
        learnerName={MOCK_STUDENT_PORTAL_DATA.student.name}
        learningMode={MOCK_STUDENT_PORTAL_DATA.student.mode}
      >
        <section className={pageStyles.grid}>
          <article className={`${pageStyles.hero} ${pageStyles.full}`}>
            <h2 className={pageStyles.heroTitle}>Assigned work center</h2>
            <p className={pageStyles.heroSubtitle}>
              Complete due tasks before class so your teacher can focus on speaking
              and feedback time.
            </p>
            <div className={pageStyles.actions}>
              <button type="button" className={pageStyles.buttonPrimary}>
                Open top priority task
              </button>
              <button
                type="button"
                className={pageStyles.buttonGhost}
                onClick={handleCompleteTopPriority}
                disabled={!firstOpenAssignment || completeAssignmentMutation.isPending}
              >
                {completeAssignmentMutation.isPending
                  ? "Updating..."
                  : "Mark homework complete"}
              </button>
            </div>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Due soon</h2>
            <p className={pageStyles.text}>
              Complete due-soon assignments before your next class.
            </p>
            <p className={pageStyles.meta}>
              {
                assignments.filter(
                  (item) => item.status === "due-soon",
                ).length
              }{" "}
              assignment(s) due soon
            </p>
          </article>

          <article className={pageStyles.card}>
            <h2 className={pageStyles.title}>Teacher support</h2>
            <p className={pageStyles.text}>
              {MOCK_STUDENT_PORTAL_DATA.teacher.name} reviews your progress each
              session.
            </p>
            <p className={pageStyles.meta}>Verified teacher: Yes</p>
          </article>

          <article className={`${pageStyles.card} ${pageStyles.full}`}>
            <h2 className={pageStyles.title}>Task board</h2>
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
            <h2 className={pageStyles.title}>Assignment list</h2>
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
                          Complete
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
