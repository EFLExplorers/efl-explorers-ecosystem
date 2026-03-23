import type {
  ConnectivityData,
  CurriculumExplorerData,
  IdentityBridgeData,
  LandingLogicData,
  SchemaGraphData,
  SchemaHealthData,
} from "@/types/db-visualizer";

export type SyncSnapshotMeta = {
  serverQueryMs: number;
  generatedAt: string;
};

export type NormalizedDatabaseSyncSnapshot = {
  landing: LandingLogicData;
  auth: IdentityBridgeData;
  curriculum: CurriculumExplorerData;
  connectivity: ConnectivityData;
  health: SchemaHealthData;
  schemaGraph: SchemaGraphData;
  meta: SyncSnapshotMeta;
};

export type SchemaDriftReport = {
  topLevelUnknownKeys: readonly string[];
  metaZodFailed: boolean;
};
