import { prisma } from "@repo/database";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";
import { requireCurriculumApiSession } from "@/lib/requireCurriculumApiSession";
import { slugify } from "@/lib/slug";

const createLevelSchema = z.object({
  programId: z.number().int().positive(),
  title: z.string().trim().min(1).max(160),
  slug: z.string().min(1).max(180).optional(),
  orderIndex: z.number().int().min(0).optional(),
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
    const programIdResult = parsePositiveIntQueryParam(
      req.query.programId,
      "program id"
    );
    if (!programIdResult.ok) {
      return res.status(400).json({ error: programIdResult.error });
    }

    const levels = await prisma.curriculumLevel.findMany({
      where: { programId: programIdResult.value, status: { not: "archived" } },
      orderBy: { orderIndex: "asc" },
      include: { _count: { select: { units: true } } },
    });
    return res.status(200).json({ levels });
  }

  if (req.method === "POST") {
    const parsed = createLevelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid level payload" });
    }

    const slug = slugify(parsed.data.slug ?? parsed.data.title);
    const parentProgram = await prisma.curriculumProgram.findUnique({
      where: { id: parsed.data.programId },
      select: { id: true, isArchived: true },
    });
    if (!parentProgram || parentProgram.isArchived) {
      return res
        .status(404)
        .json({ error: "Program not found or archived for new levels" });
    }

    if (!slug) {
      return res.status(400).json({ error: "Level slug cannot be empty" });
    }

    const existing = await prisma.curriculumLevel.findFirst({
      where: {
        programId: parsed.data.programId,
        slug,
      },
      select: { id: true },
    });
    if (existing) {
      return res.status(409).json({ error: "Level slug already exists in program" });
    }

    const maxLevel = await prisma.curriculumLevel.findFirst({
      where: { programId: parsed.data.programId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });

    const level = await prisma.curriculumLevel.create({
      data: {
        programId: parsed.data.programId,
        title: parsed.data.title,
        slug,
        orderIndex: parsed.data.orderIndex ?? (maxLevel?.orderIndex ?? -1) + 1,
        createdByManagerId: session.managerId,
      },
    });
    return res.status(201).json({ level });
  }

  return respondMethodNotAllowed(req, res, ["GET", "POST"]);
}
