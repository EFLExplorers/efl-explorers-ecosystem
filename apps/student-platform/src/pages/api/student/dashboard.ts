import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";

import type { StudentDashboardResponseDto } from "@/lib/api/student-contracts";
import { mapTaskToStudentAssignment } from "@/lib/server/student-assignments";

const parseUserId = (value: string | string[] | undefined) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return parsed;
};

export const studentDashboardHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<StudentDashboardResponseDto | { error: string }>,
) => {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = parseUserId(request.query.userId);
    const [tasks, nextLesson] = await Promise.all([
      prisma.task.findMany({
        where: { userId },
        orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      }),
      prisma.lesson.findFirst({
        where: {
          OR: [{ status: null }, { status: { not: "completed" } }],
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      }),
    ]);

    const assignments = tasks.map(mapTaskToStudentAssignment);
    const priorityMission = assignments.find(
      (item) => item.status === "due-soon" || item.status === "in-progress",
    );

    const dueSoon = assignments.filter((item) => item.status === "due-soon").length;
    const completed = assignments.filter((item) => item.status === "completed").length;
    const inProgress = assignments.filter(
      (item) => item.status === "in-progress",
    ).length;
    const isLiveLessonWindow = (() => {
      if (!nextLesson) {
        return false;
      }
      const today = new Date();
      const lessonDate = nextLesson.date;
      const isSameDay =
        today.getFullYear() === lessonDate.getFullYear() &&
        today.getMonth() === lessonDate.getMonth() &&
        today.getDate() === lessonDate.getDate();
      return isSameDay;
    })();

    const missionControl = (() => {
      if (isLiveLessonWindow && nextLesson) {
        return {
          mode: "live-lesson" as const,
          title: "Join live lesson",
          detail: `Teacher-led session for ${nextLesson.subject} is available now.`,
          ctaLabel: "Join live lesson",
        };
      }

      if (priorityMission) {
        return {
          mode: "priority-mission" as const,
          title: "Priority mission",
          detail: `${priorityMission.unitLabel}: ${priorityMission.title}`,
          ctaLabel: "Open priority mission",
        };
      }

      if (nextLesson) {
        return {
          mode: "next-discovery" as const,
          title: "Next discovery",
          detail: `${nextLesson.title} - ${nextLesson.subject}`,
          ctaLabel: "Resume next discovery",
        };
      }

      return {
        mode: "next-discovery" as const,
        title: "Next discovery",
        detail: "Continue your active checkpoint journey.",
        ctaLabel: "Resume journey",
      };
    })();

    return response.status(200).json({
      data: {
        assignmentCounts: {
          dueSoon,
          inProgress,
          completed,
          total: assignments.length,
        },
        missionControl,
        lastUpdatedAt: new Date().toISOString(),
      },
      error: null,
    });
  } catch {
    return response.status(500).json({ error: "Failed to load dashboard" });
  }
};

export default studentDashboardHandler;
