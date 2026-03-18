import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";

import type { StudentAssignmentMutationResponseDto } from "@/lib/api/student-contracts";
import { mapTaskToStudentAssignment } from "@/lib/server/student-assignments";
import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";
import { requireStudentApiSession } from "@/lib/requireStudentApiSession";

type RequestBody = {
  readonly completed?: boolean;
};

export const studentAssignmentByIdHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<
    StudentAssignmentMutationResponseDto | { error: string }
  >,
) => {
  if (request.method !== "PATCH") {
    return respondMethodNotAllowed(request, response, ["PATCH"]);
  }

  const session = await requireStudentApiSession(request, response);
  if (!session) {
    return;
  }

  const parsedTaskId = parsePositiveIntQueryParam(
    request.query.id,
    "assignment ID"
  );
  if (!parsedTaskId.ok) {
    return response.status(400).json({ error: parsedTaskId.message });
  }
  const taskId = parsedTaskId.value;

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

    if (existingTask.userId !== session.studentRecordUserId) {
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
