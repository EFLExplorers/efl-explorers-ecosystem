import { z } from "zod";

import {
  normalizeConnectivityData,
  normalizeCurriculumData,
  normalizeIdentityData,
  normalizeLandingData,
  normalizeSchemaGraphData,
  normalizeSchemaHealthData,
} from "@/lib/normalize-api-data";
import type {
  NormalizedDatabaseSyncSnapshot,
  SchemaDriftReport,
} from "@/types/sync-snapshot";

const ROOT_KEYS = [
  "landing",
  "auth",
  "curriculum",
  "connectivity",
  "health",
  "schemaGraph",
  "meta",
] as const;

type RootKey = (typeof ROOT_KEYS)[number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const MetaSchema = z
  .object({
    serverQueryMs: z.number(),
    generatedAt: z.string(),
  })
  .strict();

export type ParseSyncSnapshotResult = {
  snapshot: NormalizedDatabaseSyncSnapshot;
  drift: SchemaDriftReport;
};

const emptySnapshot = (): NormalizedDatabaseSyncSnapshot => ({
  landing: { pages: [], contentNodes: [], contentEdges: [], alienAssets: [] },
  auth: {
    users: [],
    selectedUser: null,
    studentMapping: null,
    teacherMapping: null,
    linkedStudents: [],
  },
  curriculum: { programs: [], liveSnapshotsByLevel: {} },
  connectivity: { matches: [], unmatchedStudents: [], levels: [] },
  health: { checks: [], summary: { ok: 0, error: 0 } },
  schemaGraph: { tables: [], edges: [], schemas: [] },
  meta: { serverQueryMs: 0, generatedAt: new Date(0).toISOString() },
});

export const parseSyncSnapshotPayload = (raw: unknown): ParseSyncSnapshotResult => {
  if (!isRecord(raw)) {
    return {
      snapshot: emptySnapshot(),
      drift: { topLevelUnknownKeys: [], metaZodFailed: true },
    };
  }

  const topLevelUnknownKeys = Object.keys(raw).filter(
    (key): key is string => !ROOT_KEYS.includes(key as RootKey),
  );

  const metaParsed = MetaSchema.safeParse(raw.meta);
  const metaZodFailed = !metaParsed.success;
  const meta = metaParsed.success
    ? metaParsed.data
    : { serverQueryMs: 0, generatedAt: new Date(0).toISOString() };

  const snapshot: NormalizedDatabaseSyncSnapshot = {
    landing: normalizeLandingData(raw.landing),
    auth: normalizeIdentityData(raw.auth),
    curriculum: normalizeCurriculumData(raw.curriculum),
    connectivity: normalizeConnectivityData(raw.connectivity),
    health: normalizeSchemaHealthData(raw.health),
    schemaGraph: normalizeSchemaGraphData(raw.schemaGraph),
    meta,
  };

  return {
    snapshot,
    drift: {
      topLevelUnknownKeys,
      metaZodFailed,
    },
  };
};
