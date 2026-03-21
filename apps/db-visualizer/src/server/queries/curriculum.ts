import { prisma } from "@repo/database";

import type {
  CurriculumExplorerData,
  LevelLiveSnapshot,
} from "@/types/db-visualizer";

const getMostRelevantSnapshot = (snapshots: LevelLiveSnapshot[]) => {
  const current = snapshots.find((snapshot) => snapshot.isCurrent);
  if (current) {
    return current;
  }

  return snapshots.sort(
    (left, right) => right.publishedAt.getTime() - left.publishedAt.getTime()
  )[0];
};

export const getCurriculumExplorerData = async (): Promise<CurriculumExplorerData> => {
  const programs = await prisma.curriculumProgram.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      levels: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          orderIndex: true,
          status: true,
          units: {
            where: { isArchived: false },
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              orderIndex: true,
              isArchived: true,
              mediaManifest: true,
              assignmentConfig: true,
            },
          },
        },
      },
    },
  });

  const levelIds = programs.flatMap((program) => program.levels.map((level) => level.id));
  const snapshots = levelIds.length
    ? await prisma.curriculumPublishSnapshot.findMany({
        where: { levelId: { in: levelIds } },
        orderBy: [{ levelId: "asc" }, { publishedAt: "desc" }],
        select: {
          id: true,
          levelId: true,
          version: true,
          isCurrent: true,
          publishedAt: true,
          level: {
            select: {
              slug: true,
              title: true,
            },
          },
          units: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              sourceUnitId: true,
              slug: true,
              title: true,
              mediaManifest: true,
              assignmentConfig: true,
            },
          },
        },
      })
    : [];

  const groupedSnapshots = snapshots.reduce<Record<number, LevelLiveSnapshot[]>>(
    (accumulator, snapshot) => {
      const levelSnapshotList = accumulator[snapshot.levelId] ?? [];
      levelSnapshotList.push({
        levelId: snapshot.levelId,
        levelSlug: snapshot.level.slug,
        levelTitle: snapshot.level.title,
        snapshotId: snapshot.id,
        version: snapshot.version,
        isCurrent: snapshot.isCurrent,
        publishedAt: snapshot.publishedAt,
        units: snapshot.units,
      });
      accumulator[snapshot.levelId] = levelSnapshotList;

      return accumulator;
    },
    {}
  );

  const liveSnapshotsByLevel = Object.entries(groupedSnapshots).reduce<
    Record<number, LevelLiveSnapshot>
  >((accumulator, [levelId, levelSnapshots]) => {
    const selectedSnapshot = getMostRelevantSnapshot(levelSnapshots);
    if (selectedSnapshot) {
      accumulator[Number(levelId)] = selectedSnapshot;
    }
    return accumulator;
  }, {});

  return {
    programs: programs.map((program) => ({
      ...program,
      levels: program.levels.map((level) => ({
        ...level,
        status: level.status,
      })),
    })),
    liveSnapshotsByLevel,
  };
};
