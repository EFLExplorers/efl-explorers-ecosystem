import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";
import { requireApiKey } from "../../utils/apiAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  if (!requireApiKey(req, res)) {
    return;
  }

  const { userId } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "User ID is required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return res.status(400).json({ error: "User role not found" });
  }

  return res.status(200).json({ role: user.role });
}
