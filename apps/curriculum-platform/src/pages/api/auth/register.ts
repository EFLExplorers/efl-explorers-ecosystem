import { Prisma, prisma } from "@repo/database";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { isBootstrapAllowlisted } from "@/lib/invitePolicy";
import { hashPassword } from "@/lib/password";
import { respondMethodNotAllowed } from "@/lib/apiResponses";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  password: z.string().min(8).max(128),
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return respondMethodNotAllowed(req, res, ["POST"]);
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid registration payload" });
  }

  const email = normalizeEmail(parsed.data.email);
  const name = parsed.data.name.trim();
  if (!name) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  const now = new Date();
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    await prisma.$transaction(async (tx) => {
      const existingManager = await tx.curriculumManager.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingManager) {
        throw new Error("ACCOUNT_EXISTS");
      }

      const managerCount = await tx.curriculumManager.count();
      const invite = await tx.curriculumInvite.findUnique({
        where: { email },
        select: {
          id: true,
          acceptedAt: true,
          revokedAt: true,
          expiresAt: true,
        },
      });

      const hasValidInvite =
        !!invite &&
        !invite.acceptedAt &&
        !invite.revokedAt &&
        (!invite.expiresAt || invite.expiresAt > now);

      const canBootstrap = managerCount === 0 && isBootstrapAllowlisted(email);

      if (!hasValidInvite && !canBootstrap) {
        throw new Error("INVITE_REQUIRED");
      }

      const manager = await tx.curriculumManager.create({
        data: {
          email,
          name,
          passwordHash,
        },
        select: { id: true },
      });

      if (invite?.id) {
        await tx.curriculumInvite.update({
          where: { id: invite.id },
          data: {
            acceptedAt: now,
            acceptedByManagerId: manager.id,
          },
        });
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ACCOUNT_EXISTS") {
        return res
          .status(409)
          .json({ error: "Account already exists for this email" });
      }
      if (error.message === "INVITE_REQUIRED") {
        return res.status(403).json({
          error: "Registration is invite-only. Please request an invite.",
        });
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ error: "Account already exists for this email" });
    }

    console.error("Failed to register curriculum manager:", error);
    return res.status(500).json({ error: "Failed to register manager account" });
  }

  return res.status(201).json({ success: true });
}
