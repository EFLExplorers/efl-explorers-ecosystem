import { prisma } from "@repo/database";

import { getIdentityBridgeData } from "@/server/queries/auth-mapping";
import { getConnectivityData } from "@/server/queries/connectivity";
import { getCurriculumExplorerData } from "@/server/queries/curriculum";
import { getSchemaHealthDataWithClient } from "@/server/queries/health";
import { getLandingLogicData } from "@/server/queries/landing";
import { getSchemaGraphData } from "@/server/queries/schema-graph";

export type BuildDatabaseSyncSnapshotOptions = {
  selectedUserId?: string;
};

export const buildDatabaseSyncSnapshot = async (
  options: BuildDatabaseSyncSnapshotOptions = {},
) => {
  const t0 = Date.now();
  const [core, schemaGraph] = await Promise.all([
    prisma.$transaction(async (tx) => {
      const landing = await getLandingLogicData(tx);
      const auth = await getIdentityBridgeData(options.selectedUserId, tx);
      const curriculum = await getCurriculumExplorerData(tx);
      const connectivity = await getConnectivityData(tx);
      const health = await getSchemaHealthDataWithClient(tx);
      return { landing, auth, curriculum, connectivity, health };
    }),
    getSchemaGraphData(),
  ]);
  const serverQueryMs = Date.now() - t0;
  return {
    ...core,
    schemaGraph,
    meta: {
      serverQueryMs,
      generatedAt: new Date().toISOString(),
    },
  };
};

export type DatabaseSyncSnapshotPayload = Awaited<ReturnType<typeof buildDatabaseSyncSnapshot>>;
