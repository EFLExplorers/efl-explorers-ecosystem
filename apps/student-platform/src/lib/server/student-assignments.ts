import type { Task } from "@repo/database";

import type {
  StudentAssignmentDto,
  StudentAssignmentStatus,
} from "@/lib/api/student-contracts";

const DUE_SOON_WINDOW_MS = 1000 * 60 * 60 * 48;

const formatDueLabel = (dueDate: Date | null, completed: boolean) => {
  if (completed) {
    return "Completed";
  }

  if (!dueDate) {
    return "In progress";
  }

  const dueTime = dueDate.getTime();
  const now = Date.now();
  const differenceMs = dueTime - now;

  if (differenceMs <= 0) {
    return "Due now";
  }

  if (differenceMs <= DUE_SOON_WINDOW_MS) {
    return "Due soon";
  }

  return `Due ${dueDate.toLocaleDateString()}`;
};

const getAssignmentStatus = (task: Task): StudentAssignmentStatus => {
  if (task.completed) {
    return "completed";
  }

  if (!task.dueDate) {
    return "in-progress";
  }

  const differenceMs = task.dueDate.getTime() - Date.now();
  return differenceMs <= DUE_SOON_WINDOW_MS ? "due-soon" : "in-progress";
};

export const mapTaskToStudentAssignment = (task: Task): StudentAssignmentDto => {
  const status = getAssignmentStatus(task);

  return {
    id: String(task.id),
    title: task.title,
    unitLabel: "Teacher Task",
    dueLabel: formatDueLabel(task.dueDate, task.completed),
    status,
    source: "teacher",
  };
};
