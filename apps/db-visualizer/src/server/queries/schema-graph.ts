import { Client } from "pg";

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

type MetadataRows = {
  tables: RawTable[];
  columns: RawColumn[];
  fkRows: RawFk[];
};

const tableId = (schema: string, name: string) => `${schema}.${name}`;

const isAccelerateUrl = (url: string) => url.startsWith("prisma://");

const isPostgresUrl = (url: string) => /^postgres(ql)?:/i.test(url);

const sanitizePostgresConnectionString = (connectionString: string) => {
  try {
    const parsed = new URL(connectionString);
    ["sslcert", "sslkey", "sslrootcert", "sslcrl"].forEach((param) => {
      const value = parsed.searchParams.get(param)?.trim().toLowerCase();
      if (value === "system") {
        parsed.searchParams.delete(param);
      }
    });
    return parsed.toString();
  } catch {
    return connectionString;
  }
};

const SQL_TABLES = `
  SELECT t.table_schema, t.table_name
  FROM information_schema.tables t
  WHERE t.table_type = 'BASE TABLE'
    AND t.table_schema IN ('auth', 'curriculum', 'shared', 'students', 'teachers', 'public')
    AND t.table_name NOT IN ('_prisma_migrations')
  ORDER BY t.table_schema, t.table_name
`;

const SQL_COLUMNS = `
  SELECT c.table_schema, c.table_name, c.column_name, c.ordinal_position
  FROM information_schema.columns c
  WHERE c.table_schema IN ('auth', 'curriculum', 'shared', 'students', 'teachers', 'public')
  ORDER BY c.table_schema, c.table_name, c.ordinal_position
`;

const SQL_FKS = `
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

/**
 * Prisma Accelerate is a bad fit for interactive transactions + information_schema `$queryRaw`.
 * Use one short-lived direct session (counts against your direct / non-Accelerate pool only while open).
 */
const fetchMetadataViaDirectPg = async (connectionString: string): Promise<MetadataRows> => {
  const client = new Client({
    connectionString: sanitizePostgresConnectionString(connectionString),
  });
  await client.connect();
  try {
    const t = await client.query<RawTable>(SQL_TABLES);
    const c = await client.query<RawColumn>(SQL_COLUMNS);
    const f = await client.query<RawFk>(SQL_FKS);
    return {
      tables: t.rows,
      columns: c.rows,
      fkRows: f.rows,
    };
  } finally {
    await client.end();
  }
};

/** Postgres URL runtime: sequential raw queries (no interactive `$transaction`). */
const fetchMetadataViaPrisma = async (): Promise<MetadataRows> => {
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

  return { tables, columns, fkRows };
};

const buildGraph = ({ tables, columns, fkRows }: MetadataRows): SchemaGraphData => {
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

export const getSchemaGraphData = async (): Promise<SchemaGraphData> => {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  const directUrl = process.env.DIRECT_URL?.trim() ?? "";

  if (isAccelerateUrl(databaseUrl)) {
    if (!directUrl || !isPostgresUrl(directUrl)) {
      throw new Error(
        "Schema map needs DIRECT_URL=postgresql://… when DATABASE_URL uses Prisma Accelerate. " +
          "The graph reads Postgres information_schema via a short direct session; Accelerate does not support that path.",
      );
    }
    const rows = await fetchMetadataViaDirectPg(directUrl);
    return buildGraph(rows);
  }

  const rows = await fetchMetadataViaPrisma();
  return buildGraph(rows);
};
