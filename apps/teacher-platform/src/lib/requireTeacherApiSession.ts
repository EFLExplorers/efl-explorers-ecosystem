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
  const mapping = await prisma.teacherUserMapping.findUnique({
    where: { authUserId },
    select: { id: true },
  });

  if (!mapping?.id || mapping.id <= 0) {
    throw new Error("Teacher account mapping is missing.");
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
    const message =
      error instanceof Error &&
      error.message === "Teacher account mapping is missing."
        ? "Teacher account is not provisioned."
        : "Failed to resolve teacher identity";
    const statusCode = message === "Teacher account is not provisioned." ? 403 : 500;
    res.status(statusCode).json({ message });
    return null;
  }
};
