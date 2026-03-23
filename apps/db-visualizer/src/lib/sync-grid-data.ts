import type { NormalizedDatabaseSyncSnapshot } from "@/types/sync-snapshot";

export type SyncGridResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  hint?: string;
};

const columnsFromRows = (rows: Record<string, unknown>[]): string[] => {
  const keys = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((k) => keys.add(k));
  }
  return [...keys].sort();
};

const empty = (hint: string): SyncGridResult => ({
  columns: [],
  rows: [],
  hint,
});

export const getSyncGridDataForTable = (
  tableId: string,
  snapshot: NormalizedDatabaseSyncSnapshot,
): SyncGridResult => {
  switch (tableId) {
    case "auth.users": {
      const rows = snapshot.auth.users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        approved: u.approved,
        createdAt: u.createdAt.toISOString(),
      }));
      return { columns: columnsFromRows(rows), rows };
    }
    case "shared.pages": {
      const rows = snapshot.landing.pages.map((p) => ({
        id: p.id,
        route: p.route,
        title: p.title,
        sectionCount: p.sections.length,
        contentItemCount: p.contentItems.length,
      }));
      return { columns: columnsFromRows(rows), rows };
    }
    case "shared.content_items": {
      const rows = snapshot.landing.contentNodes.map((n) => ({
        id: n.id,
        pageId: n.pageId,
        slug: n.slug,
        title: n.title,
        contentType: n.contentType,
      }));
      return { columns: columnsFromRows(rows), rows };
    }
    case "shared.content_relationships": {
      const rows = snapshot.landing.contentEdges.map((e) => ({
        id: e.id,
        parentId: e.parentId,
        childId: e.childId,
        relationshipType: e.relationshipType,
        sortOrder: e.sortOrder,
      }));
      return { columns: columnsFromRows(rows), rows };
    }
    case "teachers.students": {
      const fromMatches = snapshot.connectivity.matches.map((m) => ({
        id: m.studentId,
        fullName: m.studentName,
        level: m.studentLevel,
        matchedCurriculumSlug: m.curriculumLevelSlug,
        programTitle: m.programTitle,
        match: "exact",
      }));
      const fromUnmatched = snapshot.connectivity.unmatchedStudents.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        level: s.level,
        matchedCurriculumSlug: null,
        programTitle: null,
        match: "unmatched",
      }));
      const rows = [...fromMatches, ...fromUnmatched];
      return {
        columns: columnsFromRows(rows),
        rows,
        hint:
          rows.length >= 5000
            ? "Rows may be capped by CONNECTIVITY_STUDENTS_MAX in sync-all."
            : undefined,
      };
    }
    case "curriculum.programs": {
      const rows = snapshot.curriculum.programs.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        levelCount: p.levels.length,
      }));
      return { columns: columnsFromRows(rows), rows };
    }
    case "curriculum.levels": {
      const rows = snapshot.curriculum.programs.flatMap((p) =>
        p.levels.map((l) => ({
          id: l.id,
          programTitle: p.title,
          slug: l.slug,
          title: l.title,
          orderIndex: l.orderIndex,
          status: l.status,
          unitCount: l.units.length,
        })),
      );
      return { columns: columnsFromRows(rows), rows };
    }
    case "curriculum.units": {
      const rows = snapshot.curriculum.programs.flatMap((p) =>
        p.levels.flatMap((l) =>
          l.units.map((u) => ({
            id: u.id,
            programTitle: p.title,
            levelSlug: l.slug,
            slug: u.slug,
            title: u.title,
            orderIndex: u.orderIndex,
            isArchived: u.isArchived,
          })),
        ),
      );
      return { columns: columnsFromRows(rows), rows };
    }
    case "__sync.schema_health_checks": {
      const rows = snapshot.health.checks.map((c) => ({
        id: c.id,
        schema: c.schema,
        table: c.table,
        status: c.status,
        message: c.message,
      }));
      return { columns: columnsFromRows(rows), rows };
    }
    default:
      return empty(
        "No rows shipped in this sync snapshot for this table. Open a domain view (Landing, Auth, …) for full context.",
      );
  }
};

/** Virtual table for health checks (not in information_schema tree). */
export const VIRTUAL_HEALTH_TABLE_ID = "__sync.schema_health_checks";
