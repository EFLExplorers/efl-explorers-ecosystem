import type { SchemaGraphTable } from "@/types/db-visualizer";

const SCHEMA_LAYOUT_ORDER = [
  "shared",
  "auth",
  "students",
  "teachers",
  "curriculum",
  "public",
] as const;

export const SCHEMA_GRAPH_NODE_W = 228;
const GAP_X = 40;
const GAP_Y = 10;
const PAD = 28;

export type SchemaGraphBox = { x: number; y: number; w: number; h: number };

/** Matches column list cap in `SchemaTableNode` (first 24 + optional overflow row). */
export const schemaTableNodeHeight = (table: SchemaGraphTable): number => {
  const rowCount = Math.max(table.columns.length, 1);
  return 52 + Math.min(rowCount, 10) * 17 + (rowCount > 10 ? 14 : 0);
};

/**
 * Columnar layout by schema (fixed order + alpha for unknown schemas).
 * Used as the default seed for the schema map; user drags persist in `localStorage` when fingerprint matches.
 */
export const layoutSchemaGraphTables = (tables: SchemaGraphTable[]) => {
  const bySchema = new Map<string, SchemaGraphTable[]>();
  for (const t of tables) {
    const list = bySchema.get(t.schema) ?? [];
    list.push(t);
    bySchema.set(t.schema, list);
  }
  for (const [, list] of bySchema) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const schemaKeys = [
    ...SCHEMA_LAYOUT_ORDER.filter((s) => bySchema.has(s)),
    ...[...bySchema.keys()]
      .filter((s) => !SCHEMA_LAYOUT_ORDER.includes(s as (typeof SCHEMA_LAYOUT_ORDER)[number]))
      .sort(),
  ];

  const positions = new Map<string, SchemaGraphBox>();
  let col = 0;
  let maxBottom = PAD;

  for (const schema of schemaKeys) {
    const list = bySchema.get(schema) ?? [];
    let y = PAD;
    const x = PAD + col * (SCHEMA_GRAPH_NODE_W + GAP_X);

    for (const table of list) {
      const h = schemaTableNodeHeight(table);
      positions.set(table.id, { x, y, w: SCHEMA_GRAPH_NODE_W, h });
      y += h + GAP_Y;
    }

    maxBottom = Math.max(maxBottom, y);
    col += 1;
  }

  const totalW = PAD * 2 + Math.max(col, 1) * (SCHEMA_GRAPH_NODE_W + GAP_X) - GAP_X;
  const totalH = Math.max(maxBottom + PAD, 400);

  return { positions, totalW, totalH };
};
