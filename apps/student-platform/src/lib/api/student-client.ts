import type {
  StudentAssignmentMutationResponseDto,
  StudentAssignmentsResponseDto,
  StudentDashboardResponseDto,
} from "@/lib/api/student-contracts";

const DEFAULT_STUDENT_USER_ID = 1;

export const fetchStudentAssignments =
  async (): Promise<StudentAssignmentsResponseDto> => {
    const response = await fetch(
      `/api/student/assignments?userId=${DEFAULT_STUDENT_USER_ID}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Unable to fetch assignments");
    }

    return response.json();
  };

export const fetchStudentDashboard =
  async (): Promise<StudentDashboardResponseDto> => {
    const response = await fetch(
      `/api/student/dashboard?userId=${DEFAULT_STUDENT_USER_ID}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Unable to fetch dashboard");
    }

    return response.json();
  };

export const markStudentAssignmentCompleted = async (
  assignmentId: string,
): Promise<StudentAssignmentMutationResponseDto> => {
  const response = await fetch(`/api/student/assignments/${assignmentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      completed: true,
      userId: DEFAULT_STUDENT_USER_ID,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to update assignment");
  }

  return response.json();
};
