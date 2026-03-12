import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";

import type { StudentLessonsResponseDto } from "@/lib/api/student-contracts";
import { mapLessonsForStudent } from "@/lib/server/student-lessons";

export const studentLessonsHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<StudentLessonsResponseDto | { error: string }>,
) => {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
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
