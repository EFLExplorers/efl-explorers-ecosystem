export type LandingPageNode = {
  id: string;
  route: string;
  title: string | null;
  sections: {
    id: string;
    sectionKey: string;
    sectionType: string;
    title: string | null;
    sortOrder: number;
    active: boolean;
  }[];
  contentItems: {
    id: string;
    slug: string | null;
    title: string | null;
    contentType: string;
    sectionKey: string | null;
    sortOrder: number;
    active: boolean;
  }[];
};

export type ContentTreeEdge = {
  id: string;
  parentId: string;
  childId: string;
  relationshipType: string;
  sortOrder: number;
};

export type ContentTreeNode = {
  id: string;
  pageId: string | null;
  slug: string | null;
  title: string | null;
  contentType: string;
};

export type AlienMediaAsset = {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  caption: string | null;
  mimeType: string;
  metadata: unknown;
};

export type LandingLogicData = {
  pages: LandingPageNode[];
  contentNodes: ContentTreeNode[];
  contentEdges: ContentTreeEdge[];
  alienAssets: AlienMediaAsset[];
};

export type IdentityBridgeData = {
  users: {
    id: string;
    email: string | null;
    name: string | null;
    role: string;
    approved: boolean;
    createdAt: Date;
  }[];
  selectedUser: {
    id: string;
    email: string | null;
    name: string | null;
    role: string;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  studentMapping: {
    id: number;
    authUserId: string;
    createdAt: Date;
  } | null;
  teacherMapping: {
    id: number;
    authUserId: string;
    createdAt: Date;
  } | null;
  linkedStudents: {
    id: number;
    fullName: string;
    email: string | null;
    level: string;
    unitId: string;
    performanceLevel: string | null;
    attendanceRate: number | null;
  }[];
};

export type CurriculumProgramTree = {
  id: number;
  slug: string;
  title: string;
  levels: {
    id: number;
    slug: string;
    title: string;
    orderIndex: number;
    status: string;
    units: {
      id: number;
      slug: string;
      title: string;
      summary: string | null;
      orderIndex: number;
      isArchived: boolean;
      mediaManifest: unknown;
      assignmentConfig: unknown;
    }[];
  }[];
};

export type LevelLiveSnapshot = {
  levelId: number;
  levelSlug: string;
  levelTitle: string;
  snapshotId: string;
  version: number;
  isCurrent: boolean;
  publishedAt: Date;
  units: {
    id: number;
    sourceUnitId: number;
    slug: string;
    title: string;
    mediaManifest: unknown;
    assignmentConfig: unknown;
  }[];
};

export type CurriculumExplorerData = {
  programs: CurriculumProgramTree[];
  liveSnapshotsByLevel: Record<number, LevelLiveSnapshot>;
};

export type ConnectivityMatch = {
  studentId: number;
  studentName: string;
  studentLevel: string;
  curriculumLevelId: number;
  curriculumLevelSlug: string;
  curriculumLevelTitle: string;
  programSlug: string;
  programTitle: string;
  confidence: "exact";
};

export type ConnectivityData = {
  matches: ConnectivityMatch[];
  unmatchedStudents: {
    id: number;
    fullName: string;
    level: string;
  }[];
  levels: {
    id: number;
    slug: string;
    title: string;
    programSlug: string;
    programTitle: string;
  }[];
};

export type SchemaHealthCheck = {
  id: string;
  schema: "shared" | "auth" | "students" | "teachers" | "curriculum";
  table: string;
  status: "ok" | "error";
  message: string;
};

export type SchemaHealthData = {
  checks: SchemaHealthCheck[];
  summary: {
    ok: number;
    error: number;
  };
};

export type SchemaGraphColumn = {
  name: string;
};

export type SchemaGraphTable = {
  id: string;
  schema: string;
  name: string;
  columns: SchemaGraphColumn[];
};

export type SchemaGraphEdge = {
  id: string;
  fromTableId: string;
  fromColumn: string;
  toTableId: string;
  toColumn: string;
  /** Postgres `information_schema.referential_constraints.delete_rule` */
  deleteRule: string;
  /** Postgres `information_schema.referential_constraints.update_rule` */
  updateRule: string;
};

export type SchemaGraphData = {
  tables: SchemaGraphTable[];
  edges: SchemaGraphEdge[];
  schemas: readonly string[];
};

export type DeploymentEnvVarStatus = "ok" | "missing" | "suspicious";

export type DeploymentEnvVarRow = {
  readonly key: string;
  readonly importance: "required" | "optional";
  readonly status: DeploymentEnvVarStatus;
  readonly hint?: string;
};

export type DeploymentRuntimeContext = {
  readonly nodeEnv: string;
  readonly vercelEnv: string | null;
  readonly vercelRegion: string | null;
  readonly commitShort: string;
};

export type DeploymentEnvReport = {
  readonly context: DeploymentRuntimeContext;
  readonly variables: DeploymentEnvVarRow[];
  readonly criticalIssues: string[];
};
