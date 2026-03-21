import type {
  ConnectivityData,
  CurriculumExplorerData,
  IdentityBridgeData,
  LandingLogicData,
  SchemaHealthData,
} from "@/types/db-visualizer";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const asNullableString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const asNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const asNullableNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const asBoolean = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const asDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date(0);
};

export const normalizeLandingData = (raw: unknown): LandingLogicData => {
  if (!isRecord(raw)) {
    return { pages: [], contentNodes: [], contentEdges: [], alienAssets: [] };
  }

  const pages = asArray(raw.pages).map((page) => {
    const pageRecord = isRecord(page) ? page : {};
    return {
      id: asString(pageRecord.id),
      route: asString(pageRecord.route),
      title: asNullableString(pageRecord.title),
      sections: asArray(pageRecord.sections).map((section) => {
        const sectionRecord = isRecord(section) ? section : {};
        return {
          id: asString(sectionRecord.id),
          sectionKey: asString(sectionRecord.sectionKey),
          sectionType: asString(sectionRecord.sectionType),
          title: asNullableString(sectionRecord.title),
          sortOrder: asNumber(sectionRecord.sortOrder),
          active: asBoolean(sectionRecord.active),
        };
      }),
      contentItems: asArray(pageRecord.contentItems).map((item) => {
        const itemRecord = isRecord(item) ? item : {};
        return {
          id: asString(itemRecord.id),
          slug: asNullableString(itemRecord.slug),
          title: asNullableString(itemRecord.title),
          contentType: asString(itemRecord.contentType),
          sectionKey: asNullableString(itemRecord.sectionKey),
          sortOrder: asNumber(itemRecord.sortOrder),
          active: asBoolean(itemRecord.active),
        };
      }),
    };
  });

  const contentNodes = asArray(raw.contentNodes).map((node) => {
    const nodeRecord = isRecord(node) ? node : {};
    return {
      id: asString(nodeRecord.id),
      pageId: asNullableString(nodeRecord.pageId),
      slug: asNullableString(nodeRecord.slug),
      title: asNullableString(nodeRecord.title),
      contentType: asString(nodeRecord.contentType),
    };
  });

  const contentEdges = asArray(raw.contentEdges).map((edge) => {
    const edgeRecord = isRecord(edge) ? edge : {};
    return {
      id: asString(edgeRecord.id),
      parentId: asString(edgeRecord.parentId),
      childId: asString(edgeRecord.childId),
      relationshipType: asString(edgeRecord.relationshipType),
      sortOrder: asNumber(edgeRecord.sortOrder),
    };
  });

  const alienAssets = asArray(raw.alienAssets).map((asset) => {
    const assetRecord = isRecord(asset) ? asset : {};
    return {
      id: asString(assetRecord.id),
      filename: asString(assetRecord.filename),
      url: asString(assetRecord.url),
      altText: asNullableString(assetRecord.altText),
      caption: asNullableString(assetRecord.caption),
      mimeType: asString(assetRecord.mimeType),
      metadata: assetRecord.metadata,
    };
  });

  return { pages, contentNodes, contentEdges, alienAssets };
};

export const normalizeIdentityData = (raw: unknown): IdentityBridgeData => {
  if (!isRecord(raw)) {
    return {
      users: [],
      selectedUser: null,
      studentMapping: null,
      teacherMapping: null,
      linkedStudents: [],
    };
  }

  const users = asArray(raw.users).map((user) => {
    const userRecord = isRecord(user) ? user : {};
    return {
      id: asString(userRecord.id),
      email: asNullableString(userRecord.email),
      name: asNullableString(userRecord.name),
      role: asString(userRecord.role),
      approved: asBoolean(userRecord.approved),
      createdAt: asDate(userRecord.createdAt),
    };
  });

  const selectedUser = isRecord(raw.selectedUser)
    ? {
        id: asString(raw.selectedUser.id),
        email: asNullableString(raw.selectedUser.email),
        name: asNullableString(raw.selectedUser.name),
        role: asString(raw.selectedUser.role),
        approved: asBoolean(raw.selectedUser.approved),
        createdAt: asDate(raw.selectedUser.createdAt),
        updatedAt: asDate(raw.selectedUser.updatedAt),
      }
    : null;

  const studentMapping = isRecord(raw.studentMapping)
    ? {
        id: asNumber(raw.studentMapping.id),
        authUserId: asString(raw.studentMapping.authUserId),
        createdAt: asDate(raw.studentMapping.createdAt),
      }
    : null;

  const teacherMapping = isRecord(raw.teacherMapping)
    ? {
        id: asNumber(raw.teacherMapping.id),
        authUserId: asString(raw.teacherMapping.authUserId),
        createdAt: asDate(raw.teacherMapping.createdAt),
      }
    : null;

  const linkedStudents = asArray(raw.linkedStudents).map((student) => {
    const studentRecord = isRecord(student) ? student : {};
    return {
      id: asNumber(studentRecord.id),
      fullName: asString(studentRecord.fullName),
      email: asNullableString(studentRecord.email),
      level: asString(studentRecord.level),
      unitId: asString(studentRecord.unitId),
      performanceLevel: asNullableString(studentRecord.performanceLevel),
      attendanceRate: asNullableNumber(studentRecord.attendanceRate),
    };
  });

  return {
    users,
    selectedUser,
    studentMapping,
    teacherMapping,
    linkedStudents,
  };
};

export const normalizeCurriculumData = (raw: unknown): CurriculumExplorerData => {
  if (!isRecord(raw)) {
    return { programs: [], liveSnapshotsByLevel: {} };
  }

  const programs = asArray(raw.programs).map((program) => {
    const programRecord = isRecord(program) ? program : {};
    return {
      id: asNumber(programRecord.id),
      slug: asString(programRecord.slug),
      title: asString(programRecord.title),
      levels: asArray(programRecord.levels).map((level) => {
        const levelRecord = isRecord(level) ? level : {};
        return {
          id: asNumber(levelRecord.id),
          slug: asString(levelRecord.slug),
          title: asString(levelRecord.title),
          orderIndex: asNumber(levelRecord.orderIndex),
          status: asString(levelRecord.status),
          units: asArray(levelRecord.units).map((unit) => {
            const unitRecord = isRecord(unit) ? unit : {};
            return {
              id: asNumber(unitRecord.id),
              slug: asString(unitRecord.slug),
              title: asString(unitRecord.title),
              summary: asNullableString(unitRecord.summary),
              orderIndex: asNumber(unitRecord.orderIndex),
              isArchived: asBoolean(unitRecord.isArchived),
              mediaManifest: unitRecord.mediaManifest,
              assignmentConfig: unitRecord.assignmentConfig,
            };
          }),
        };
      }),
    };
  });

  const liveSnapshotsByLevel = isRecord(raw.liveSnapshotsByLevel)
    ? Object.entries(raw.liveSnapshotsByLevel).reduce<
        CurriculumExplorerData["liveSnapshotsByLevel"]
      >((accumulator, [levelKey, snapshot]) => {
        const levelId = Number(levelKey);
        if (!Number.isFinite(levelId) || !isRecord(snapshot)) {
          return accumulator;
        }
        accumulator[levelId] = {
          levelId: asNumber(snapshot.levelId, levelId),
          levelSlug: asString(snapshot.levelSlug),
          levelTitle: asString(snapshot.levelTitle),
          snapshotId: asString(snapshot.snapshotId),
          version: asNumber(snapshot.version),
          isCurrent: asBoolean(snapshot.isCurrent),
          publishedAt: asDate(snapshot.publishedAt),
          units: asArray(snapshot.units).map((unit) => {
            const unitRecord = isRecord(unit) ? unit : {};
            return {
              id: asNumber(unitRecord.id),
              sourceUnitId: asNumber(unitRecord.sourceUnitId),
              slug: asString(unitRecord.slug),
              title: asString(unitRecord.title),
              mediaManifest: unitRecord.mediaManifest,
              assignmentConfig: unitRecord.assignmentConfig,
            };
          }),
        };
        return accumulator;
      }, {})
    : {};

  return { programs, liveSnapshotsByLevel };
};

export const normalizeConnectivityData = (raw: unknown): ConnectivityData => {
  if (!isRecord(raw)) {
    return { matches: [], unmatchedStudents: [], levels: [] };
  }

  const matches = asArray(raw.matches).map((match) => {
    const matchRecord = isRecord(match) ? match : {};
    return {
      studentId: asNumber(matchRecord.studentId),
      studentName: asString(matchRecord.studentName),
      studentLevel: asString(matchRecord.studentLevel),
      curriculumLevelId: asNumber(matchRecord.curriculumLevelId),
      curriculumLevelSlug: asString(matchRecord.curriculumLevelSlug),
      curriculumLevelTitle: asString(matchRecord.curriculumLevelTitle),
      programSlug: asString(matchRecord.programSlug),
      programTitle: asString(matchRecord.programTitle),
      confidence: "exact" as const,
    };
  });

  const unmatchedStudents = asArray(raw.unmatchedStudents).map((student) => {
    const studentRecord = isRecord(student) ? student : {};
    return {
      id: asNumber(studentRecord.id),
      fullName: asString(studentRecord.fullName),
      level: asString(studentRecord.level),
    };
  });

  const levels = asArray(raw.levels).map((level) => {
    const levelRecord = isRecord(level) ? level : {};
    return {
      id: asNumber(levelRecord.id),
      slug: asString(levelRecord.slug),
      title: asString(levelRecord.title),
      programSlug: asString(levelRecord.programSlug),
      programTitle: asString(levelRecord.programTitle),
    };
  });

  return { matches, unmatchedStudents, levels };
};

export const normalizeSchemaHealthData = (raw: unknown): SchemaHealthData => {
  if (!isRecord(raw)) {
    return { checks: [], summary: { ok: 0, error: 0 } };
  }

  const checks: SchemaHealthData["checks"] = asArray(raw.checks).map((check, index) => {
    const checkRecord = isRecord(check) ? check : {};
    const status: "ok" | "error" = checkRecord.status === "ok" ? "ok" : "error";
    const schemaValue = checkRecord.schema;
    const schema: SchemaHealthData["checks"][number]["schema"] =
      schemaValue === "shared" ||
      schemaValue === "auth" ||
      schemaValue === "students" ||
      schemaValue === "teachers" ||
      schemaValue === "curriculum"
        ? schemaValue
        : "shared";
    return {
      id: asString(checkRecord.id, `check-${index}`),
      schema,
      table: asString(checkRecord.table),
      status,
      message: asString(checkRecord.message, status === "ok" ? "Read access confirmed" : "Error"),
    };
  });

  const summaryRecord = isRecord(raw.summary) ? raw.summary : {};
  return {
    checks,
    summary: {
      ok: asNumber(summaryRecord.ok),
      error: asNumber(summaryRecord.error),
    },
  };
};
