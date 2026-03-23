import { prisma } from "@repo/database";
import type { Prisma } from "@repo/database";

import type { LandingLogicData } from "@/types/db-visualizer";

/** Caps sync-all payload size; raise only if CMS growth is measured. */
export const LANDING_PAGES_MAX = 500;
export const LANDING_CONTENT_NODES_MAX = 2500;

const hasAlienMetadata = (metadata: unknown) => {
  if (!metadata) {
    return false;
  }

  const serialized = JSON.stringify(metadata).toLowerCase();
  return serialized.includes("alien");
};

type LandingDb = Prisma.TransactionClient | typeof prisma;

export const getLandingLogicData = async (
  db: LandingDb = prisma,
): Promise<LandingLogicData> => {
  const [pages, contentRelationships, contentNodes, mediaAssets] = await Promise.all([
    db.page.findMany({
      orderBy: { route: "asc" },
      take: LANDING_PAGES_MAX,
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            sectionKey: true,
            sectionType: true,
            title: true,
            sortOrder: true,
            active: true,
          },
        },
        contentItems: {
          orderBy: [{ sectionKey: "asc" }, { sortOrder: "asc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            contentType: true,
            sectionKey: true,
            sortOrder: true,
            active: true,
          },
        },
      },
    }),
    db.contentRelationship.findMany({
      orderBy: [{ relationshipType: "asc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        parentId: true,
        childId: true,
        relationshipType: true,
        sortOrder: true,
      },
    }),
    db.contentItem.findMany({
      orderBy: { id: "asc" },
      take: LANDING_CONTENT_NODES_MAX,
      select: {
        id: true,
        pageId: true,
        slug: true,
        title: true,
        contentType: true,
      },
    }),
    db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 150,
      select: {
        id: true,
        filename: true,
        url: true,
        altText: true,
        caption: true,
        mimeType: true,
        metadata: true,
      },
    }),
  ]);

  return {
    pages,
    contentEdges: contentRelationships,
    contentNodes,
    alienAssets: mediaAssets.filter((asset) => hasAlienMetadata(asset.metadata)),
  };
};
