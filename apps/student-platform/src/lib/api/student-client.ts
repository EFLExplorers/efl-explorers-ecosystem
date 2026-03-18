import type {
  StudentAssignmentMutationResponseDto,
  StudentAssignmentsResponseDto,
  StudentDashboardResponseDto,
  StudentLessonsResponseDto,
  StudentProgressResponseDto,
} from "@/lib/api/student-contracts";

export const fetchStudentAssignments =
  async (): Promise<StudentAssignmentsResponseDto> => {
    const response = await fetch("/api/student/assignments", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unable to fetch assignments");
    }

    return response.json();
  };

export const fetchStudentDashboard =
  async (): Promise<StudentDashboardResponseDto> => {
    const response = await fetch("/api/student/dashboard", {
      credentials: "include",
    });

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
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to update assignment");
  }

  return response.json();
};

export const fetchStudentLessons = async (): Promise<StudentLessonsResponseDto> => {
  const response = await fetch("/api/student/lessons", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch lessons");
  }

  return response.json();
};

export const fetchStudentProgress =
  async (): Promise<StudentProgressResponseDto> => {
    const response = await fetch("/api/student/progress", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unable to fetch progress");
    }

    return response.json();
  };
