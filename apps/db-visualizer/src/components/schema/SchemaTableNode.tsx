"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import type { SchemaGraphTable } from "@/types/db-visualizer";

import styles from "./SchemaTableNode.module.css";

export type SchemaTableNodeData = {
  table: SchemaGraphTable;
  fkColumns: string[];
};

export type SchemaTableFlowNode = Node<SchemaTableNodeData, "schemaTable">;

export const HANDLE_TARGET = "in";
export const HANDLE_SOURCE = "out";

export const SchemaTableNode = memo((props: NodeProps<SchemaTableFlowNode>) => {
  const { data } = props;
  const { table, fkColumns } = data;
  const fkSet = new Set(fkColumns);

  return (
    <div className={styles.root}>
      <Handle className={styles.handle} type="target" position={Position.Top} id={HANDLE_TARGET} />
      <div className={styles.tableHeader}>
        <span className={styles.schemaTag}>{table.schema}</span>
        <p className={styles.tableName}>{table.name}</p>
      </div>
      <ul className={styles.columnList}>
        {table.columns.slice(0, 24).map((c) => (
          <li key={c.name} className={fkSet.has(c.name) ? styles.fkHint : undefined}>
            {c.name}
            {fkSet.has(c.name) ? " · FK" : ""}
          </li>
        ))}
        {table.columns.length > 24 ? <li>… +{table.columns.length - 24} more</li> : null}
      </ul>
      <Handle className={styles.handle} type="source" position={Position.Bottom} id={HANDLE_SOURCE} />
    </div>
  );
});

SchemaTableNode.displayName = "SchemaTableNode";
