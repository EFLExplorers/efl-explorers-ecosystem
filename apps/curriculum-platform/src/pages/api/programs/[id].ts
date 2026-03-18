import { prisma } from "@repo/database";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";
import { requireCurriculumApiSession } from "@/lib/requireCurriculumApiSession";
import { slugify } from "@/lib/slug";

const patchProgramSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  slug: z.string().min(1).max(180).optional(),
  description: z.string().max(2000).nullable().optional(),
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

  const programIdResult = parsePositiveIntQueryParam(req.query.id, "program id");
  if (!programIdResult.ok) {
    return res.status(400).json({ error: programIdResult.error });
  }
  const programId = programIdResult.value;

  if (req.method === "GET") {
    const program = await prisma.curriculumProgram.findUnique({
      where: { id: programId },
      include: {
        levels: {
          orderBy: { orderIndex: "asc" },
          include: { _count: { select: { units: true } } },
        },
      },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    return res.status(200).json({ program });
  }

  if (req.method === "PATCH") {
    const parsed = patchProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid program update payload" });
    }

    if (parsed.data.slug) {
      const slug = slugify(parsed.data.slug);
      const existing = await prisma.curriculumProgram.findFirst({
        where: {
          slug,
          NOT: { id: programId },
        },
        select: { id: true },
      });
      if (existing) {
        return res.status(409).json({ error: "Program slug already exists" });
      }
    }

    const program = await prisma.curriculumProgram.update({
      where: { id: programId },
      data: {
        ...(parsed.data.title ? { title: parsed.data.title } : {}),
        ...(parsed.data.slug ? { slug: slugify(parsed.data.slug) } : {}),
        ...(parsed.data.description !== undefined
          ? {
              description:
                parsed.data.description === null
                  ? null
                  : parsed.data.description.trim(),
            }
          : {}),
        ...(parsed.data.isArchived !== undefined
          ? { isArchived: parsed.data.isArchived }
          : {}),
      },
    });

    return res.status(200).json({ program });
  }

  if (req.method === "DELETE") {
    const existingProgram = await prisma.curriculumProgram.findUnique({
      where: { id: programId },
      select: { id: true },
    });
    if (!existingProgram) {
      return res.status(404).json({ error: "Program not found" });
    }

    await prisma.curriculumProgram.update({
      where: { id: programId },
      data: { isArchived: true },
    });
    return res.status(200).json({ success: true });
  }

  return respondMethodNotAllowed(req, res, ["GET", "PATCH", "DELETE"]);
}
