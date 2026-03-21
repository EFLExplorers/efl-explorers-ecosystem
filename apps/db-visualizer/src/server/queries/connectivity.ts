import { prisma } from "@repo/database";

import type { ConnectivityData } from "@/types/db-visualizer";

export const getConnectivityData = async (): Promise<ConnectivityData> => {
  const [students, levels] = await Promise.all([
    prisma.student.findMany({
      select: {
        id: true,
        fullName: true,
        level: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.curriculumLevel.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        program: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
      orderBy: [{ program: { title: "asc" } }, { orderIndex: "asc" }],
    }),
  ]);

  const levelsBySlug = new Map(levels.map((level) => [level.slug, level]));
  const matches: ConnectivityData["matches"] = [];
  const unmatchedStudents: ConnectivityData["unmatchedStudents"] = [];

  for (const student of students) {
    const matchingLevel = levelsBySlug.get(student.level);
    if (!matchingLevel) {
      unmatchedStudents.push(student);
      continue;
    }

    matches.push({
      studentId: student.id,
      studentName: student.fullName,
      studentLevel: student.level,
      curriculumLevelId: matchingLevel.id,
      curriculumLevelSlug: matchingLevel.slug,
      curriculumLevelTitle: matchingLevel.title,
      programSlug: matchingLevel.program.slug,
      programTitle: matchingLevel.program.title,
      confidence: "exact",
    });
  }

  return {
    matches,
    unmatchedStudents,
    levels: levels.map((level) => ({
      id: level.id,
      slug: level.slug,
      title: level.title,
      programSlug: level.program.slug,
      programTitle: level.program.title,
    })),
  };
};
