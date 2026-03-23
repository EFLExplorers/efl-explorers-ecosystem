"use client";

import { useMemo } from "react";

import { VIRTUAL_HEALTH_TABLE_ID } from "@/lib/sync-grid-data";
import type { SchemaGraphTable } from "@/types/db-visualizer";

import styles from "./SchemaModelTree.module.css";

export type SchemaModelTreeProps = Readonly<{
  tables: SchemaGraphTable[];
  selectedTableId: string | null;
  onSelectTable: (id: string) => void;
}>;

export const SchemaModelTree = ({
  tables,
  selectedTableId,
  onSelectTable,
}: SchemaModelTreeProps) => {
  const grouped = useMemo(() => {
    const map = new Map<string, SchemaGraphTable[]>();
    for (const table of tables) {
      const list = map.get(table.schema) ?? [];
      list.push(table);
      map.set(table.schema, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tables]);

  return (
    <div className={styles.wrap}>
      <p className={styles.heading}>Schema (Postgres)</p>
      <ul className={styles.schemaList}>
        {grouped.map(([schema, schemaTables]) => (
          <li key={schema} className={styles.schemaItem}>
            <span className={styles.schemaName}>{schema}</span>
            <ul className={styles.tableList}>
              {schemaTables.map((t) => {
                const active = selectedTableId === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={`${styles.tableBtn} ${active ? styles.tableBtnActive : ""}`}
                      onClick={() => onSelectTable(t.id)}
                    >
                      {t.name}
                      <span className={styles.colCount}>{t.columns.length}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
      <p className={styles.heading}>Inspector</p>
      <button
        type="button"
        className={`${styles.tableBtn} ${selectedTableId === VIRTUAL_HEALTH_TABLE_ID ? styles.tableBtnActive : ""}`}
        onClick={() => onSelectTable(VIRTUAL_HEALTH_TABLE_ID)}
      >
        schema_health_checks
        <span className={styles.colCount}>virtual</span>
      </button>
    </div>
  );
};
