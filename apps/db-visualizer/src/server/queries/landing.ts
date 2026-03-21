import { prisma } from "@repo/database";

import type { LandingLogicData } from "@/types/db-visualizer";

const hasAlienMetadata = (metadata: unknown) => {
  if (!metadata) {
    return false;
  }

  const serialized = JSON.stringify(metadata).toLowerCase();
  return serialized.includes("alien");
};

export const getLandingLogicData = async (): Promise<LandingLogicData> => {
  const [pages, contentRelationships, contentNodes, mediaAssets] = await Promise.all([
    prisma.page.findMany({
      orderBy: { route: "asc" },
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
    prisma.contentRelationship.findMany({
      orderBy: [{ relationshipType: "asc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        parentId: true,
        childId: true,
        relationshipType: true,
        sortOrder: true,
      },
    }),
    prisma.contentItem.findMany({
      select: {
        id: true,
        pageId: true,
        slug: true,
        title: true,
        contentType: true,
      },
    }),
    prisma.mediaAsset.findMany({
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
