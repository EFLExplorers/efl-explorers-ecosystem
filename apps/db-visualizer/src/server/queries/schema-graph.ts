import { prisma } from "@repo/database";

import type { SchemaGraphData, SchemaGraphEdge, SchemaGraphTable } from "@/types/db-visualizer";

const ALLOWED_SCHEMAS = [
  "auth",
  "curriculum",
  "shared",
  "students",
  "teachers",
  "public",
] as const;

type RawTable = {
  table_schema: string;
  table_name: string;
};

type RawColumn = {
  table_schema: string;
  table_name: string;
  column_name: string;
  ordinal_position: number;
};

type RawFk = {
  from_schema: string;
  from_table: string;
  from_column: string;
  to_schema: string;
  to_table: string;
  to_column: string;
  constraint_name: string;
};

const tableId = (schema: string, name: string) => `${schema}.${name}`;

export const getSchemaGraphData = async (): Promise<SchemaGraphData> => {
  const tables = await prisma.$queryRaw<RawTable[]>`
    SELECT t.table_schema, t.table_name
    FROM information_schema.tables t
    WHERE t.table_type = 'BASE TABLE'
      AND t.table_schema IN ('auth', 'curriculum', 'shared', 'students', 'teachers', 'public')
      AND t.table_name NOT IN ('_prisma_migrations')
    ORDER BY t.table_schema, t.table_name
  `;

  const columns = await prisma.$queryRaw<RawColumn[]>`
    SELECT c.table_schema, c.table_name, c.column_name, c.ordinal_position
    FROM information_schema.columns c
    WHERE c.table_schema IN ('auth', 'curriculum', 'shared', 'students', 'teachers', 'public')
    ORDER BY c.table_schema, c.table_name, c.ordinal_position
  `;

  const fkRows = await prisma.$queryRaw<RawFk[]>`
    SELECT
      kcu.table_schema AS from_schema,
      kcu.table_name AS from_table,
      kcu.column_name AS from_column,
      ccu.table_schema AS to_schema,
      ccu.table_name AS to_table,
      ccu.column_name AS to_column,
      tc.constraint_name AS constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_schema = kcu.constraint_schema
      AND tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_schema = tc.constraint_schema
      AND ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema IN ('auth', 'curriculum', 'shared', 'students', 'teachers', 'public')
  `;

  const columnMap = new Map<string, { name: string }[]>();
  for (const row of columns) {
    const id = tableId(row.table_schema, row.table_name);
    const list = columnMap.get(id) ?? [];
    list.push({ name: row.column_name });
    columnMap.set(id, list);
  }

  const graphTables: SchemaGraphTable[] = tables.map((row) => ({
    id: tableId(row.table_schema, row.table_name),
    schema: row.table_schema,
    name: row.table_name,
    columns: columnMap.get(tableId(row.table_schema, row.table_name)) ?? [],
  }));

  const tableIds = new Set(graphTables.map((t) => t.id));

  const edges: SchemaGraphEdge[] = [];
  const seenEdge = new Set<string>();

  for (const row of fkRows) {
    const fromId = tableId(row.from_schema, row.from_table);
    const toId = tableId(row.to_schema, row.to_table);
    if (!tableIds.has(fromId) || !tableIds.has(toId)) {
      continue;
    }
    const eid = `${row.constraint_name}:${fromId}.${row.from_column}->${toId}.${row.to_column}`;
    if (seenEdge.has(eid)) {
      continue;
    }
    seenEdge.add(eid);
    edges.push({
      id: eid,
      fromTableId: fromId,
      fromColumn: row.from_column,
      toTableId: toId,
      toColumn: row.to_column,
    });
  }

  return {
    tables: graphTables,
    edges,
    schemas: [...ALLOWED_SCHEMAS],
  };
};
