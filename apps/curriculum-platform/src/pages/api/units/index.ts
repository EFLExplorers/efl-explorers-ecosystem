import { prisma, type Prisma } from "@repo/database";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";
import {
  normalizeAssignmentConfig,
  validateAssignmentConfig,
} from "@/lib/assignmentHooks";
import { requireCurriculumApiSession } from "@/lib/requireCurriculumApiSession";
import { slugify } from "@/lib/slug";

const createUnitSchema = z.object({
  levelId: z.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  slug: z.string().min(1).max(220).optional(),
  summary: z.string().max(2000).optional(),
  storyMarkdown: z.string().optional(),
  assignmentConfig: z.record(z.unknown()).optional(),
  orderIndex: z.number().int().min(0).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
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
    const levelIdResult = parsePositiveIntQueryParam(req.query.levelId, "level id");
    if (!levelIdResult.ok) {
      return res.status(400).json({ error: levelIdResult.error });
    }

    const units = await prisma.curriculumUnit.findMany({
      where: { levelId: levelIdResult.value, isArchived: false },
      orderBy: { orderIndex: "asc" },
    });
    return res.status(200).json({ units });
  }

  if (req.method === "POST") {
    const parsed = createUnitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid unit payload" });
    }

    const slug = slugify(parsed.data.slug ?? parsed.data.title);
    const parentLevel = await prisma.curriculumLevel.findUnique({
      where: { id: parsed.data.levelId },
      select: { id: true, status: true },
    });
    if (!parentLevel || parentLevel.status === "archived") {
      return res.status(404).json({ error: "Level not found or archived" });
    }

    if (!slug) {
      return res.status(400).json({ error: "Unit slug cannot be empty" });
    }

    const existing = await prisma.curriculumUnit.findFirst({
      where: { levelId: parsed.data.levelId, slug },
      select: { id: true },
    });
    if (existing) {
      return res.status(409).json({ error: "Unit slug already exists in level" });
    }

    if (parsed.data.assignmentConfig !== undefined) {
      const assignmentValidation = validateAssignmentConfig(
        parsed.data.assignmentConfig
      );
      if (!assignmentValidation.success) {
        return res.status(400).json({
          error: "Invalid assignmentConfig payload",
          details: assignmentValidation.error.flatten(),
        });
      }
    }

    const maxUnit = await prisma.curriculumUnit.findFirst({
      where: { levelId: parsed.data.levelId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });

    const unit = await prisma.curriculumUnit.create({
      data: {
        levelId: parsed.data.levelId,
        title: parsed.data.title,
        slug,
        summary: parsed.data.summary?.trim() ?? null,
        storyMarkdown: parsed.data.storyMarkdown ?? "",
        orderIndex: parsed.data.orderIndex ?? (maxUnit?.orderIndex ?? -1) + 1,
        estimatedMinutes: parsed.data.estimatedMinutes ?? null,
        mediaManifest: {} as Prisma.InputJsonValue,
        assignmentConfig: normalizeAssignmentConfig(
          parsed.data.assignmentConfig
        ) as Prisma.InputJsonValue,
        createdByManagerId: session.managerId,
      },
    });
    return res.status(201).json({ unit });
  }

  return respondMethodNotAllowed(req, res, ["GET", "POST"]);
}
