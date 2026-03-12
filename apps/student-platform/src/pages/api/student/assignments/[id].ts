import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";

import type { StudentAssignmentMutationResponseDto } from "@/lib/api/student-contracts";
import { mapTaskToStudentAssignment } from "@/lib/server/student-assignments";

type RequestBody = {
  readonly completed?: boolean;
  readonly userId?: number;
};

const parseTaskId = (value: string | string[] | undefined) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
};

export const studentAssignmentByIdHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<
    StudentAssignmentMutationResponseDto | { error: string }
  >,
) => {
  if (request.method !== "PATCH") {
    response.setHeader("Allow", "PATCH");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const taskId = parseTaskId(request.query.id);
  if (!taskId) {
    return response.status(400).json({ error: "Invalid assignment id" });
  }

  const body = request.body as RequestBody;
  if (typeof body.completed !== "boolean") {
    return response.status(400).json({ error: "Missing completed boolean" });
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return response.status(404).json({ error: "Assignment not found" });
    }

    if (typeof body.userId === "number" && existingTask.userId !== body.userId) {
      return response.status(403).json({ error: "Assignment ownership mismatch" });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: body.completed,
      },
    });

    return response.status(200).json({
      data: mapTaskToStudentAssignment(task),
      error: null,
    });
  } catch {
    return response.status(500).json({ error: "Failed to update assignment" });
  }
};

export default studentAssignmentByIdHandler;
