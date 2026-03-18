import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";

import type { StudentLessonsResponseDto } from "@/lib/api/student-contracts";
import { mapLessonsForStudent } from "@/lib/server/student-lessons";
import { respondMethodNotAllowed } from "@/lib/apiResponses";
import { requireStudentApiSession } from "@/lib/requireStudentApiSession";

export const studentLessonsHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<StudentLessonsResponseDto | { error: string }>,
) => {
  if (request.method !== "GET") {
    return respondMethodNotAllowed(request, response, ["GET"]);
  }

  const session = await requireStudentApiSession(request, response);
  if (!session) {
    return;
  }

  try {
    const lessons = await prisma.lesson.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 10,
    });

    const data = mapLessonsForStudent(lessons);

    return response.status(200).json({
      data,
      error: null,
    });
  } catch {
    return response.status(500).json({ error: "Failed to load lessons" });
  }
};

export default studentLessonsHandler;
