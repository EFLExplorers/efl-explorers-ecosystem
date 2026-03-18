import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";

import type { StudentProgressResponseDto } from "@/lib/api/student-contracts";
import { mapTaskToStudentAssignment } from "@/lib/server/student-assignments";
import { respondMethodNotAllowed } from "@/lib/apiResponses";
import { requireStudentApiSession } from "@/lib/requireStudentApiSession";

const TOTAL_UNITS = 30;

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const studentProgressHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<StudentProgressResponseDto | { error: string }>,
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
      orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
    });

    const assignments = tasks.map(mapTaskToStudentAssignment);
    const completed = assignments.filter((item) => item.status === "completed").length;
    const inProgress = assignments.filter(
      (item) => item.status === "in-progress" || item.status === "due-soon",
    ).length;

    const unitsCompleted = Math.max(1, completed + 2);
    const stars = completed * 4 + inProgress * 2 + 8;
    const blockOnePercent = clampPercent((unitsCompleted / 4) * 100);
    const blockTwoUnlocked = unitsCompleted >= 4;
    const blockTwoPercent = blockTwoUnlocked
      ? clampPercent(((unitsCompleted - 4) / 4) * 100)
      : 0;
    const blockThreeUnlocked = unitsCompleted >= 8;
    const blockThreePercent = blockThreeUnlocked
      ? clampPercent(((unitsCompleted - 8) / 4) * 100)
      : 0;

    return response.status(200).json({
      data: {
        unitsCompleted,
        unitsTotal: TOTAL_UNITS,
        stars,
        nextGate: unitsCompleted < 4 ? "Unit 4 Review" : "Unit 8 Review",
        checkpoints: [
          {
            id: "block-1",
            title: "Task Block 1 (Units 1-4)",
            subtitle: blockOnePercent >= 100 ? "Completed" : "In progress",
            percent: blockOnePercent,
            status: blockOnePercent >= 100 ? "COMPLETED" : "ACTIVE",
            completionSource: blockOnePercent >= 100 ? "SYSTEM_RULE" : undefined,
          },
          {
            id: "block-2",
            title: "Task Block 2 (Units 5-8)",
            subtitle: blockTwoUnlocked
              ? "In progress"
              : "Locked until Task Block 1 review",
            percent: blockTwoPercent,
            status: !blockTwoUnlocked
              ? "LOCKED"
              : blockTwoPercent >= 100
                ? "COMPLETED"
                : "ACTIVE",
            completionSource: blockTwoPercent >= 100 ? "SYSTEM_RULE" : undefined,
          },
          {
            id: "block-3",
            title: "Task Block 3 (Units 9-12)",
            subtitle: blockThreeUnlocked
              ? "In progress"
              : "Planned next in Garden Planet journey",
            percent: blockThreePercent,
            status: !blockThreeUnlocked
              ? "LOCKED"
              : blockThreePercent >= 100
                ? "COMPLETED"
                : "ACTIVE",
            completionSource: blockThreePercent >= 100 ? "SYSTEM_RULE" : undefined,
          },
        ],
      },
      error: null,
    });
  } catch {
    return response.status(500).json({ error: "Failed to load progress" });
  }
};

export default studentProgressHandler;
