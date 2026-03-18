import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@repo/database";

import { authOptions } from "@/lib/authOptions";

type CurriculumSession = {
  userId: string;
  managerId: string;
};

export const requireCurriculumApiSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<CurriculumSession | null> => {
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  const managerId = session?.user?.managerId;
  const role = session?.user?.role;

  if (!userId || !managerId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (role && role !== "curriculum_manager") {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }

  const manager = await prisma.curriculumManager.findUnique({
    where: { id: managerId },
    select: { id: true, isActive: true },
  });
  if (!manager || !manager.isActive) {
    res.status(403).json({ error: "Manager account is inactive" });
    return null;
  }

  return { userId, managerId };
};
