import type { CSSProperties } from "react";

import type { SchemaGraphEdge } from "@/types/db-visualizer";

/** Qualified id is `schema.table` (Postgres `information_schema` shape). */
export const schemaFromQualifiedTableId = (tableId: string): string => {
  const dot = tableId.indexOf(".");
  return dot === -1 ? tableId : tableId.slice(0, dot);
};

/**
 * Visual categories:
 * - **Scope:** same-schema (cool) vs cross-schema (warm) stroke.
 * - **ON DELETE:** CASCADE (emphasized width); SET NULL / SET DEFAULT (dashed).
 */
export const getSchemaGraphEdgeStrokeStyle = (
  edge: SchemaGraphEdge,
): Pick<CSSProperties, "stroke" | "strokeWidth" | "strokeDasharray"> => {
  const fromSchema = schemaFromQualifiedTableId(edge.fromTableId);
  const toSchema = schemaFromQualifiedTableId(edge.toTableId);
  const crossSchema = fromSchema !== toSchema;
  const dr = (edge.deleteRule ?? "NO ACTION").toUpperCase();

  const stroke = crossSchema ? "rgba(255, 165, 98, 0.55)" : "rgba(124, 168, 255, 0.45)";
  const strokeWidth = dr === "CASCADE" ? 2.35 : 1.5;

  let strokeDasharray: string | undefined;
  if (dr === "SET NULL" || dr === "SET DEFAULT") {
    strokeDasharray = "5 4";
  }

  return { stroke, strokeWidth, strokeDasharray };
};
