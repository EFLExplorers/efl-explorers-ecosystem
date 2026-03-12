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
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });

    const assignments = tasks.map(mapTaskToStudentAssignment);

    const dueSoon = assignments.filter((item) => item.status === "due-soon").length;
    const completed = assignments.filter((item) => item.status === "completed").length;
    const inProgress = assignments.filter(
      (item) => item.status === "in-progress",
    ).length;

    return response.status(200).json({
      data: {
        assignmentCounts: {
          dueSoon,
          inProgress,
          completed,
          total: assignments.length,
        },
        lastUpdatedAt: new Date().toISOString(),
      },
      error: null,
    });
  } catch {
    return response.status(500).json({ error: "Failed to load dashboard" });
  }
};

export default studentDashboardHandler;
