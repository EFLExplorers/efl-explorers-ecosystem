import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import { respondMethodNotAllowed } from "@/lib/apiResponses";

type UsageByKind = {
  kind: string;
  count: number;
  totalSizeBytes: number;
};

type MaterialsUsageResponse = {
  totalCount: number;
  totalSizeBytes: number;
  byKind: UsageByKind[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MaterialsUsageResponse | { message: string }>
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  if (req.method !== "GET") {
    return respondMethodNotAllowed(req, res, ["GET"]);
  }

  try {
    const where = { createdBy: session.teacherRecordUserId };

    const [materials, totalCount] = await Promise.all([
      prisma.material.findMany({
        where,
        select: {
          kind: true,
          sizeBytes: true,
        },
      }),
      prisma.material.count({ where }),
    ]);

    const byKindMap = new Map<string, UsageByKind>();
    for (const material of materials) {
      const kind = material.kind || "other";
      const size = material.sizeBytes ?? 0;
      const current = byKindMap.get(kind);
      if (current) {
        current.count += 1;
        current.totalSizeBytes += size;
      } else {
        byKindMap.set(kind, {
          kind,
          count: 1,
          totalSizeBytes: size,
        });
      }
    }

    const byKind = Array.from(byKindMap.values()).sort((a, b) =>
      a.kind.localeCompare(b.kind)
    );
    const totalSizeBytes = byKind.reduce(
      (sum, entry) => sum + entry.totalSizeBytes,
      0
    );

    return res.status(200).json({
      totalCount,
      totalSizeBytes,
      byKind,
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch material usage" });
  }
}
