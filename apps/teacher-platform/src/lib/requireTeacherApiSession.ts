import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type TeacherSession = {
  userId: string;
  teacherRecordUserId: number;
};

const resolveTeacherRecordUserId = async (
  authUserId: string
): Promise<number> => {
  const mapping = await prisma.teacherUserMapping.upsert({
    where: { authUserId },
    update: {},
    create: { authUserId },
    select: { id: true },
  });

  if (!mapping.id || mapping.id <= 0) {
    throw new Error("Unable to resolve teacher record ID.");
  }

  return mapping.id;
};

export const requireTeacherApiSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<TeacherSession | null> => {
  const session = await auth(req, res);

  const userId = session?.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const role = typeof session.user?.role === "string" ? session.user.role : undefined;
  if (role && role !== "teacher") {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }

  try {
    const teacherRecordUserId = await resolveTeacherRecordUserId(userId);
    return { userId, teacherRecordUserId };
  } catch (error) {
    console.error("Failed to resolve teacher identity mapping:", error);
    res.status(500).json({ message: "Failed to resolve teacher identity" });
    return null;
  }
};
