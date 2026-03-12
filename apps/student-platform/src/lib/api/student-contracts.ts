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
    readonly missionControl: {
      readonly mode: "live-lesson" | "priority-mission" | "next-discovery";
      readonly title: string;
      readonly detail: string;
      readonly ctaLabel: string;
    };
    readonly lastUpdatedAt: string;
  };
  readonly error: null;
};

export type StudentAssignmentMutationResponseDto = {
  readonly data: StudentAssignmentDto;
  readonly error: null;
};

export type StudentLessonStatus = "next" | "upcoming" | "review";

export type StudentLessonDto = {
  readonly id: string;
  readonly title: string;
  readonly unitLabel: string;
  readonly focus: string;
  readonly status: StudentLessonStatus;
  readonly estimatedMinutes: number;
};

export type StudentClassSessionDto = {
  readonly id: string;
  readonly teacherName: string;
  readonly startLabel: string;
  readonly format: "live" | "recorded";
  readonly focus: string;
};

export type StudentLessonsResponseDto = {
  readonly data: {
    readonly lessons: readonly StudentLessonDto[];
    readonly classes: readonly StudentClassSessionDto[];
  };
  readonly error: null;
};

export type StudentProgressCheckpointDto = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly percent: number;
  readonly status: "LOCKED" | "ACTIVE" | "COMPLETED";
  readonly completionSource?: "SYSTEM_RULE" | "TEACHER_OVERRIDE";
};

export type StudentProgressResponseDto = {
  readonly data: {
    readonly unitsCompleted: number;
    readonly unitsTotal: number;
    readonly stars: number;
    readonly nextGate: string;
    readonly checkpoints: readonly StudentProgressCheckpointDto[];
  };
  readonly error: null;
};
