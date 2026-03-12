import type { Lesson } from "@repo/database";

import type {
  StudentClassSessionDto,
  StudentLessonDto,
  StudentLessonStatus,
} from "@/lib/api/student-contracts";

const formatStartLabel = (date: Date, startTime: string) => {
  const today = new Date();
  const isSameDay =
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate();

  if (isSameDay) {
    return `Today ${startTime}`;
  }

  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  return `${weekday} ${startTime}`;
};

export const mapLessonsForStudent = (lessons: readonly Lesson[]) => {
  const sorted = [...lessons].sort(
    (first, second) => first.date.getTime() - second.date.getTime(),
  );

  let hasNext = false;

  const studentLessons: StudentLessonDto[] = sorted.map((lesson) => {
    let status: StudentLessonStatus = "upcoming";

    if (lesson.status === "completed") {
      status = "review";
    } else if (!hasNext) {
      status = "next";
      hasNext = true;
    }

    return {
      id: String(lesson.id),
      title: lesson.title,
      unitLabel: `Class ${lesson.classId}`,
      focus: lesson.description || `${lesson.subject} speaking and comprehension`,
      status,
      estimatedMinutes: 12,
    };
  });

  const classes: StudentClassSessionDto[] = sorted.slice(0, 3).map((lesson) => ({
    id: `class-${lesson.id}`,
    teacherName: "Assigned Teacher",
    startLabel: formatStartLabel(lesson.date, lesson.startTime),
    format: "live",
    focus: lesson.subject,
  }));

  return {
    lessons: studentLessons,
    classes,
  };
};
