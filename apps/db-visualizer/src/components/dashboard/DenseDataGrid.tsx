"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";

import styles from "./DenseDataGrid.module.css";

const columnHelper = createColumnHelper<Record<string, unknown>>();

const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[object]";
    }
  }
  return String(value);
};

export type DenseDataGridProps = Readonly<{
  columns: string[];
  rows: Record<string, unknown>[];
  hint?: string;
}>;

export const DenseDataGrid = ({ columns: columnKeys, rows, hint }: DenseDataGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(
    () =>
      columnKeys.map((key) =>
        columnHelper.accessor((row) => row[key], {
          id: key,
          header: key,
          cell: (info) => formatCell(info.getValue()),
        }),
      ),
    [columnKeys],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowModel = table.getRowModel().rows;

  const gridTemplateColumns = useMemo(
    () => columnKeys.map(() => "minmax(72px, 1fr)").join(" "),
    [columnKeys],
  );

  const rowVirtualizer = useVirtualizer({
    count: rowModel.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 14,
  });

  if (hint && rows.length === 0) {
    return <p className={styles.hint}>{hint}</p>;
  }

  if (rows.length === 0) {
    return <p className={styles.hint}>No rows.</p>;
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const headerGroup = table.getHeaderGroups()[0];

  return (
    <div className={styles.wrap}>
      {hint ? <p className={styles.hintBanner}>{hint}</p> : null}
      <div ref={parentRef} className={styles.scroll}>
        <div className={styles.stickyHeader}>
          <div className={styles.headerRow} style={{ gridTemplateColumns }}>
            {headerGroup?.headers.map((header) => (
              <div key={header.id} className={styles.headerCell}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))}
          </div>
        </div>
        <div
          className={styles.virtualBody}
          style={{
            height: `${totalSize}px`,
            position: "relative",
          }}
        >
          {virtualRows.map((virtualRow) => {
            const row = rowModel[virtualRow.index];
            if (!row) {
              return null;
            }
            return (
              <div
                key={row.id}
                className={`${styles.dataRow} ${virtualRow.index % 2 ? styles.dataRowAlt : ""}`}
                style={{
                  gridTemplateColumns,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className={styles.dataCell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
