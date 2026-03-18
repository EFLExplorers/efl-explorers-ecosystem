import { prisma } from "@repo/database";
import type { NextApiRequest, NextApiResponse } from "next";

import { respondMethodNotAllowed } from "@/lib/apiResponses";
import { env } from "@/lib/env";

const hasValidSharedSecret = (req: NextApiRequest) => {
  const configured = env.CURRICULUM_API_SHARED_SECRET;
  if (!configured) {
    return true;
  }
  return req.headers["x-curriculum-shared-secret"] === configured;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return respondMethodNotAllowed(req, res, ["GET"]);
  }

  if (!hasValidSharedSecret(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const programSlug = req.query.programSlug;
  const levelSlug = req.query.levelSlug;
  if (typeof programSlug !== "string" || typeof levelSlug !== "string") {
    return res.status(400).json({ error: "Invalid slugs" });
  }

  const level = await prisma.curriculumLevel.findFirst({
    where: {
      slug: levelSlug,
      status: "published",
      program: { slug: programSlug },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      lastPublishedAt: true,
      program: {
        select: { id: true, title: true, slug: true },
      },
      snapshots: {
        where: { isCurrent: true },
        orderBy: { version: "desc" },
        take: 1,
        include: {
          units: {
            orderBy: { orderIndex: "asc" },
            select: {
              orderIndex: true,
              slug: true,
              title: true,
              summary: true,
              storyMarkdown: true,
              estimatedMinutes: true,
              mediaManifest: true,
              assignmentConfig: true,
            },
          },
        },
      },
    },
  });

  if (!level || level.snapshots.length === 0) {
    return res.status(404).json({ error: "Published level not found" });
  }

  const snapshot = level.snapshots[0];
  if (!snapshot) {
    return res.status(404).json({ error: "Published level not found" });
  }
  return res.status(200).json({
    level: {
      id: level.id,
      title: level.title,
      slug: level.slug,
      status: level.status,
      lastPublishedAt: level.lastPublishedAt,
    },
    program: level.program,
    snapshot: {
      version: snapshot.version,
      publishedAt: snapshot.publishedAt,
      units: snapshot.units,
    },
  });
}
