import { prisma } from "@repo/database";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { requireCurriculumApiSession } from "@/lib/requireCurriculumApiSession";
import { respondMethodNotAllowed } from "@/lib/apiResponses";

const createInviteSchema = z.object({
  email: z.string().email(),
  expiresAt: z.string().datetime().optional(),
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await requireCurriculumApiSession(req, res);
    if (!session) {
      return;
    }

    const invites = await prisma.curriculumInvite.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        createdAt: true,
        expiresAt: true,
        acceptedAt: true,
        revokedAt: true,
      },
    });

    return res.status(200).json({ invites });
  }

  if (req.method === "POST") {
    const session = await requireCurriculumApiSession(req, res);
    if (!session) {
      return;
    }

    const parsed = createInviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid invite payload" });
    }

    const email = normalizeEmail(parsed.data.email);
    const expiresAt = parsed.data.expiresAt
      ? new Date(parsed.data.expiresAt)
      : null;
    const now = new Date();

    if (expiresAt && expiresAt <= now) {
      return res.status(400).json({ error: "Invite expiry must be in the future" });
    }

    const existingManager = await prisma.curriculumManager.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingManager) {
      return res
        .status(409)
        .json({ error: "This email already has a manager account" });
    }

    const existingInvite = await prisma.curriculumInvite.findUnique({
      where: { email },
      select: { id: true },
    });

    const invite = await prisma.curriculumInvite.upsert({
      where: { email },
      update: {
        invitedByManagerId: session.managerId,
        expiresAt,
        revokedAt: null,
        acceptedAt: null,
        acceptedByManagerId: null,
      },
      create: {
        email,
        invitedByManagerId: session.managerId,
        expiresAt,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return res.status(existingInvite ? 200 : 201).json({ invite });
  }

  return respondMethodNotAllowed(req, res, ["GET", "POST"]);
}
