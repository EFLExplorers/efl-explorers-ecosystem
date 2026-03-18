import { prisma } from "@repo/database";
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
  if (req.method !== "GET") {
    return respondMethodNotAllowed(req, res, ["GET"]);
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
      program: { select: { id: true, slug: true, title: true } },
      units: {
        where: { isArchived: false },
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          orderIndex: true,
          estimatedMinutes: true,
          assignmentConfig: true,
        },
      },
      snapshots: {
        where: { isCurrent: true },
        orderBy: { version: "desc" },
        take: 1,
        select: { version: true },
      },
    },
  });

  if (!level) {
    return res.status(404).json({ error: "Level not found" });
  }

  if (level.units.length === 0) {
    return res.status(400).json({ error: "No active units available for preview" });
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
      error: "Cannot build preview with invalid assignmentConfig in units",
      invalidUnits,
    });
  }

  const currentSnapshotVersion = level.snapshots[0]?.version ?? 0;
  const previewSnapshotVersion = currentSnapshotVersion + 1;

  const payload = buildAssignmentHooksPayload({
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
    snapshotVersion: previewSnapshotVersion,
  });

  return res.status(200).json({
    currentSnapshotVersion: currentSnapshotVersion || null,
    previewSnapshotVersion,
    payload,
  });
}
