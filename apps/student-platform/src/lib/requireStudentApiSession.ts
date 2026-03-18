import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@repo/database";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

type StudentSession = {
  userId: string;
  studentRecordUserId: number;
};

const resolveStudentRecordUserId = async (
  authUserId: string
): Promise<number> => {
  const mapping = await prisma.studentUserMapping.upsert({
    where: { authUserId },
    update: {},
    create: { authUserId },
    select: { id: true },
  });

  if (!mapping.id || mapping.id <= 0) {
    throw new Error("Unable to resolve student record ID.");
  }

  return mapping.id;
};

export const requireStudentApiSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<StudentSession | null> => {
  const session = await getServerSession(req, res, authOptions);

  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const role = session.user?.role;
  if (role && role !== "student") {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }

  try {
    const studentRecordUserId = await resolveStudentRecordUserId(userId);
    return { userId, studentRecordUserId };
  } catch (error) {
    console.error("Failed to resolve student identity mapping:", error);
    res.status(500).json({ error: "Failed to resolve student identity" });
    return null;
  }
};
