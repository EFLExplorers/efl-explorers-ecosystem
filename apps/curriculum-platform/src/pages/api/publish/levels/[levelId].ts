import { prisma, type Prisma } from "@repo/database";
import type { NextApiRequest, NextApiResponse } from "next";

import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";
import {
  buildAssignmentHooksPayload,
  validateAssignmentConfig,
} from "@/lib/assignmentHooks";
import { requireCurriculumApiSession } from "@/lib/requireCurriculumApiSession";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return respondMethodNotAllowed(req, res, ["POST"]);
  }

  const session = await requireCurriculumApiSession(req, res);
  if (!session) {
    return;
  }

  const levelIdResult = parsePositiveIntQueryParam(req.query.levelId, "level id");
  if (!levelIdResult.ok) {
    return res.status(400).json({ error: levelIdResult.error });
  }
  const levelId = levelIdResult.value;

  const level = await prisma.curriculumLevel.findUnique({
    where: { id: levelId },
    include: {
      program: {
        select: { id: true, slug: true, title: true },
      },
      units: {
        where: { isArchived: false },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!level) {
    return res.status(404).json({ error: "Level not found" });
  }

  if (level.status === "archived") {
    return res.status(409).json({ error: "Cannot publish an archived level" });
  }

  if (level.units.length === 0) {
    return res.status(400).json({ error: "Cannot publish empty level" });
  }

  const invalidUnits = level.units
    .map((unit) => {
      const result = validateAssignmentConfig(unit.assignmentConfig);
      if (result.success) {
        return null;
      }
      return {
        unitId: unit.id,
        unitSlug: unit.slug,
        errors: result.error.flatten(),
      };
    })
    .filter((item) => item !== null);

  if (invalidUnits.length > 0) {
    return res.status(400).json({
      error: "Cannot publish level with invalid assignmentConfig in units",
      invalidUnits,
    });
  }

  const latest = await prisma.curriculumPublishSnapshot.findFirst({
    where: { levelId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (latest?.version ?? 0) + 1;
  const now = new Date();

  const assignmentHooks = buildAssignmentHooksPayload({
    program: level.program,
    level: {
      id: level.id,
      slug: level.slug,
      title: level.title,
    },
    units: level.units.map((unit) => ({
      id: unit.id,
      slug: unit.slug,
      title: unit.title,
      orderIndex: unit.orderIndex,
      estimatedMinutes: unit.estimatedMinutes,
      assignmentConfig: unit.assignmentConfig,
    })),
    snapshotVersion: nextVersion,
  });
  const assignmentHooksJson = assignmentHooks as Prisma.InputJsonValue;

  const snapshot = await prisma.$transaction(async (tx) => {
    await tx.curriculumPublishSnapshot.updateMany({
      where: { levelId, isCurrent: true },
      data: { isCurrent: false },
    });

    const created = await tx.curriculumPublishSnapshot.create({
      data: {
        levelId,
        version: nextVersion,
        isCurrent: true,
        publishedAt: now,
        publishedByManagerId: session.managerId,
        snapshotPayload: {
          program: level.program,
          level: {
            id: level.id,
            slug: level.slug,
            title: level.title,
            orderIndex: level.orderIndex,
          },
          unitCount: level.units.length,
          assignmentHooks: assignmentHooksJson,
        } as Prisma.InputJsonValue,
      },
      select: { id: true, version: true },
    });

    await tx.curriculumPublishSnapshotUnit.createMany({
      data: level.units.map((unit) => ({
        snapshotId: created.id,
        sourceUnitId: unit.id,
        orderIndex: unit.orderIndex,
        slug: unit.slug,
        title: unit.title,
        summary: unit.summary,
        storyMarkdown: unit.storyMarkdown,
        estimatedMinutes: unit.estimatedMinutes,
        mediaManifest: unit.mediaManifest ?? {},
        assignmentConfig: unit.assignmentConfig ?? {},
      })),
    });

    await tx.curriculumLevel.update({
      where: { id: levelId },
      data: {
        status: "published",
        lastPublishedAt: now,
        updatedByManagerId: session.managerId,
      },
    });

    return created;
  });

  return res.status(201).json({ snapshot, assignmentHooks });
}
