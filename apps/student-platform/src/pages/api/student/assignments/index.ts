import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";

import type { StudentAssignmentsResponseDto } from "@/lib/api/student-contracts";
import { mapTaskToStudentAssignment } from "@/lib/server/student-assignments";

const parseUserId = (value: string | string[] | undefined) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return parsed;
};

export const studentAssignmentsHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<StudentAssignmentsResponseDto | { error: string }>,
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

    const data = tasks.map(mapTaskToStudentAssignment);

    return response.status(200).json({
      data,
      meta: {
        total: data.length,
      },
      error: null,
    });
  } catch {
    return response.status(500).json({ error: "Failed to load assignments" });
  }
};

export default studentAssignmentsHandler;
