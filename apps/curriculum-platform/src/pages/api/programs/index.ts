import { prisma } from "@repo/database";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { respondMethodNotAllowed } from "@/lib/apiResponses";
import { requireCurriculumApiSession } from "@/lib/requireCurriculumApiSession";
import { slugify } from "@/lib/slug";

const createProgramSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: z.string().min(1).max(180).optional(),
  description: z.string().max(2000).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireCurriculumApiSession(req, res);
  if (!session) {
    return;
  }

  if (req.method === "GET") {
    const includeArchived = req.query.includeArchived === "true";
    const programs = await prisma.curriculumProgram.findMany({
      where: includeArchived ? undefined : { isArchived: false },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { levels: true },
        },
      },
    });
    return res.status(200).json({ programs });
  }

  if (req.method === "POST") {
    const parsed = createProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid program payload" });
    }

    const slug = slugify(parsed.data.slug ?? parsed.data.title);
    if (!slug) {
      return res.status(400).json({ error: "Program slug cannot be empty" });
    }

    const existing = await prisma.curriculumProgram.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      return res.status(409).json({ error: "Program slug already exists" });
    }

    const program = await prisma.curriculumProgram.create({
      data: {
        title: parsed.data.title,
        slug,
        description: parsed.data.description?.trim() ?? null,
        createdByManagerId: session.managerId,
      },
    });

    return res.status(201).json({ program });
  }

  return respondMethodNotAllowed(req, res, ["GET", "POST"]);
}
