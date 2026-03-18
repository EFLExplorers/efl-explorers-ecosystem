import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";

import type { StudentAssignmentsResponseDto } from "@/lib/api/student-contracts";
import { mapTaskToStudentAssignment } from "@/lib/server/student-assignments";
import { respondMethodNotAllowed } from "@/lib/apiResponses";
import { requireStudentApiSession } from "@/lib/requireStudentApiSession";

export const studentAssignmentsHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<StudentAssignmentsResponseDto | { error: string }>,
) => {
  if (request.method !== "GET") {
    return respondMethodNotAllowed(request, response, ["GET"]);
  }

  const session = await requireStudentApiSession(request, response);
  if (!session) {
    return;
  }

  try {
    const userId = session.studentRecordUserId;
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
