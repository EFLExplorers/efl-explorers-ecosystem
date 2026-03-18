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

const patchUnitSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: z.string().min(1).max(220).optional(),
  summary: z.string().max(2000).nullable().optional(),
  storyMarkdown: z.string().optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  mediaManifest: z.record(z.unknown()).optional(),
  assignmentConfig: z.record(z.unknown()).optional(),
  orderIndex: z.number().int().min(0).optional(),
  isArchived: z.boolean().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireCurriculumApiSession(req, res);
  if (!session) {
    return;
  }

  const unitIdResult = parsePositiveIntQueryParam(req.query.id, "unit id");
  if (!unitIdResult.ok) {
    return res.status(400).json({ error: unitIdResult.error });
  }
  const unitId = unitIdResult.value;

  if (req.method === "PATCH") {
    const parsed = patchUnitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid unit update payload" });
    }

    const currentUnit = await prisma.curriculumUnit.findUnique({
      where: { id: unitId },
      select: { id: true, levelId: true },
    });
    if (!currentUnit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    if (parsed.data.slug) {
      const slug = slugify(parsed.data.slug);
      const existing = await prisma.curriculumUnit.findFirst({
        where: {
          levelId: currentUnit.levelId,
          slug,
          NOT: { id: unitId },
        },
        select: { id: true },
      });
      if (existing) {
        return res.status(409).json({ error: "Unit slug already exists in level" });
      }
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

    const unit = await prisma.curriculumUnit.update({
      where: { id: unitId },
      data: {
        ...(parsed.data.title ? { title: parsed.data.title } : {}),
        ...(parsed.data.slug ? { slug: slugify(parsed.data.slug) } : {}),
        ...(parsed.data.summary !== undefined
          ? {
              summary:
                parsed.data.summary === null ? null : parsed.data.summary.trim(),
            }
          : {}),
        ...(parsed.data.storyMarkdown !== undefined
          ? { storyMarkdown: parsed.data.storyMarkdown }
          : {}),
        ...(parsed.data.estimatedMinutes !== undefined
          ? { estimatedMinutes: parsed.data.estimatedMinutes }
          : {}),
        ...(parsed.data.mediaManifest !== undefined
          ? {
              mediaManifest:
                parsed.data.mediaManifest as Prisma.InputJsonValue,
            }
          : {}),
        ...(parsed.data.assignmentConfig !== undefined
          ? {
              assignmentConfig:
                normalizeAssignmentConfig(
                  parsed.data.assignmentConfig
                ) as Prisma.InputJsonValue,
            }
          : {}),
        ...(parsed.data.orderIndex !== undefined
          ? { orderIndex: parsed.data.orderIndex }
          : {}),
        ...(parsed.data.isArchived !== undefined
          ? { isArchived: parsed.data.isArchived }
          : {}),
        updatedByManagerId: session.managerId,
      },
    });

    return res.status(200).json({ unit });
  }

  if (req.method === "DELETE") {
    const existingUnit = await prisma.curriculumUnit.findUnique({
      where: { id: unitId },
      select: { id: true },
    });
    if (!existingUnit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    await prisma.curriculumUnit.update({
      where: { id: unitId },
      data: {
        isArchived: true,
        updatedByManagerId: session.managerId,
      },
    });
    return res.status(200).json({ success: true });
  }

  return respondMethodNotAllowed(req, res, ["PATCH", "DELETE"]);
}
