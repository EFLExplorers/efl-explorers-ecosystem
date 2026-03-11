export type LearningMode = "teacher-led" | "parent-led";

export type StudentAssignment = {
  readonly id: string;
  readonly title: string;
  readonly unitLabel: string;
  readonly dueLabel: string;
  readonly status: "due-soon" | "in-progress" | "completed";
  readonly source: "teacher" | "parent";
};

export type StudentLesson = {
  readonly id: string;
  readonly title: string;
  readonly unitLabel: string;
  readonly focus: string;
  readonly status: "next" | "upcoming" | "review";
  readonly estimatedMinutes: number;
};

export type StudentClassSession = {
  readonly id: string;
  readonly teacherName: string;
  readonly startLabel: string;
  readonly format: "live" | "recorded";
  readonly focus: string;
};

export type StudentPortalData = {
  readonly student: {
    readonly name: string;
    readonly levelLabel: string;
    readonly planetLabel: string;
    readonly unitProgressLabel: string;
    readonly stars: number;
    readonly mode: LearningMode;
  };
  readonly teacher: {
    readonly name: string;
    readonly verified: boolean;
  };
  readonly assignments: readonly StudentAssignment[];
  readonly lessons: readonly StudentLesson[];
  readonly classes: readonly StudentClassSession[];
};

export const MOCK_STUDENT_PORTAL_DATA: StudentPortalData = {
  student: {
    name: "Riley",
    levelLabel: "Level 0",
    planetLabel: "Garden Planet",
    unitProgressLabel: "Unit 3 of 30",
    stars: 14,
    mode: "teacher-led",
  },
  teacher: {
    name: "Teacher Shinade",
    verified: true,
  },
  assignments: [
    {
      id: "a1",
      title: "Who's this? speaking drill",
      unitLabel: "Unit 2",
      dueLabel: "Due tomorrow",
      status: "due-soon",
      source: "teacher",
    },
    {
      id: "a2",
      title: "Family picture response",
      unitLabel: "Unit 3",
      dueLabel: "In progress",
      status: "in-progress",
      source: "teacher",
    },
    {
      id: "a3",
      title: "Happy birthday number review",
      unitLabel: "Unit 2",
      dueLabel: "Completed",
      status: "completed",
      source: "parent",
    },
  ],
  lessons: [
    {
      id: "l1",
      title: "Introduce yourself",
      unitLabel: "Unit 1",
      focus: "What's your name? How are you?",
      status: "next",
      estimatedMinutes: 12,
    },
    {
      id: "l2",
      title: "Family words mission",
      unitLabel: "Unit 2",
      focus: "Mom, dad, this is my...",
      status: "upcoming",
      estimatedMinutes: 10,
    },
    {
      id: "l3",
      title: "Garden checkpoint review",
      unitLabel: "Unit 4",
      focus: "Review key vocabulary and speaking confidence",
      status: "review",
      estimatedMinutes: 14,
    },
  ],
  classes: [
    {
      id: "c1",
      teacherName: "Teacher Shinade",
      startLabel: "Today 5:30 PM",
      format: "live",
      focus: "Unit 3 story practice",
    },
    {
      id: "c2",
      teacherName: "Teacher Shinade",
      startLabel: "Friday 5:30 PM",
      format: "live",
      focus: "Unit 4 review class",
    },
  ],
};
