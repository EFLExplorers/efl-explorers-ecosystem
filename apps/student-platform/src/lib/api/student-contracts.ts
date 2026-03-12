export type StudentAssignmentStatus = "due-soon" | "in-progress" | "completed";

export type StudentAssignmentDto = {
  readonly id: string;
  readonly title: string;
  readonly unitLabel: string;
  readonly dueLabel: string;
  readonly status: StudentAssignmentStatus;
  readonly source: "teacher" | "parent";
};

export type StudentAssignmentsResponseDto = {
  readonly data: readonly StudentAssignmentDto[];
  readonly meta: {
    readonly total: number;
  };
  readonly error: null;
};

export type StudentDashboardResponseDto = {
  readonly data: {
    readonly assignmentCounts: {
      readonly dueSoon: number;
      readonly inProgress: number;
      readonly completed: number;
      readonly total: number;
    };
    readonly lastUpdatedAt: string;
  };
  readonly error: null;
};

export type StudentAssignmentMutationResponseDto = {
  readonly data: StudentAssignmentDto;
  readonly error: null;
};
