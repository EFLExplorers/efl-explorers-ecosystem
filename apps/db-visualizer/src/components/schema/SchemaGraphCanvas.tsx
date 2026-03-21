"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";

import {
  SCHEMA_GRAPH_NODE_W,
  layoutSchemaGraphTables,
} from "@/lib/schema-graph-layout";
import type { SchemaGraphData, SchemaGraphTable } from "@/types/db-visualizer";

import {
  HANDLE_SOURCE,
  HANDLE_TARGET,
  SchemaTableNode,
  type SchemaTableFlowNode,
} from "./SchemaTableNode";
import styles from "./SchemaGraphCanvas.module.css";

const LS_KEY = "db-visualizer-schema-map-positions";

const nodeTypes = { schemaTable: SchemaTableNode };

const defaultEdgeOptions = {
  type: "smoothstep" as const,
  style: { stroke: "rgba(200, 200, 200, 0.22)", strokeWidth: 1.5 },
  interactionWidth: 28,
};

const tableFingerprint = (tables: SchemaGraphTable[]) =>
  tables
    .map((t) => t.id)
    .sort()
    .join("|");

const fkColumnsByTable = (tables: SchemaGraphTable[], data: SchemaGraphData) => {
  const map = new Map<string, string[]>();
  for (const t of tables) {
    map.set(t.id, []);
  }
  for (const e of data.edges) {
    const list = map.get(e.fromTableId);
    if (list && !list.includes(e.fromColumn)) {
      list.push(e.fromColumn);
    }
  }
  return map;
};

const loadSavedLayout = (
  fingerprint: string,
): Record<string, { x: number; y: number }> | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as {
      fingerprint: string;
      positions: Record<string, { x: number; y: number }>;
    };
    if (parsed.fingerprint !== fingerprint) {
      return null;
    }
    return parsed.positions ?? null;
  } catch {
    return null;
  }
};

const saveLayout = (
  fingerprint: string,
  positions: Record<string, { x: number; y: number }>,
) => {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify({ fingerprint, positions }));
  } catch {
    /* quota / private mode */
  }
};

type FlowInnerProps = {
  data: SchemaGraphData;
};

const SchemaGraphFlowInner = ({ data }: FlowInnerProps) => {
  const { fitView, getNodes } = useReactFlow();
  const fingerprint = useMemo(() => tableFingerprint(data.tables), [data.tables]);

  const [nodes, setNodes, onNodesChange] = useNodesState<SchemaTableFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (data.tables.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { positions } = layoutSchemaGraphTables(data.tables);
    const saved = loadSavedLayout(fingerprint);
    const fkMap = fkColumnsByTable(data.tables, data);

    const nextNodes: SchemaTableFlowNode[] = [];
    for (const table of data.tables) {
      const box = positions.get(table.id);
      if (!box) {
        continue;
      }
      const fromDisk = saved?.[table.id];
      const node: SchemaTableFlowNode = {
        id: table.id,
        type: "schemaTable",
        position: fromDisk ?? { x: box.x, y: box.y },
        width: SCHEMA_GRAPH_NODE_W,
        height: box.h,
        data: {
          table,
          fkColumns: fkMap.get(table.id) ?? [],
        },
        draggable: true,
      };
      nextNodes.push(node);
    }

    const nextEdges: Edge[] = [];
    for (const edge of data.edges) {
      if (!positions.has(edge.fromTableId) || !positions.has(edge.toTableId)) {
        continue;
      }
      nextEdges.push({
        id: edge.id,
        source: edge.fromTableId,
        target: edge.toTableId,
        sourceHandle: HANDLE_SOURCE,
        targetHandle: HANDLE_TARGET,
        ...defaultEdgeOptions,
      });
    }

    setNodes(nextNodes);
    setEdges(nextEdges);

    const hasSaved = saved && Object.keys(saved).length > 0;
    const t = window.setTimeout(() => {
      if (!hasSaved) {
        fitView({ padding: 0.15, maxZoom: 1.25, duration: 200 });
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [data, fingerprint, fitView, setEdges, setNodes]);

  const persistPositions = useCallback(() => {
    const list = getNodes();
    const positions: Record<string, { x: number; y: number }> = {};
    for (const n of list) {
      positions[n.id] = { x: n.position.x, y: n.position.y };
    }
    saveLayout(fingerprint, positions);
  }, [fingerprint, getNodes]);

  const onNodeDragStop = useCallback(() => {
    persistPositions();
  }, [persistPositions]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={onNodeDragStop}
      defaultEdgeOptions={defaultEdgeOptions}
      minZoom={0.08}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="rgba(80, 80, 80, 0.35)" gap={22} size={1} />
      <Controls showInteractive={false} className={styles.flowControls} />
      <MiniMap
        className={styles.flowMinimap}
        maskColor="rgba(10, 10, 10, 0.92)"
        nodeColor={() => "#2a2a2a"}
      />
    </ReactFlow>
  );
};

export type SchemaGraphCanvasProps = {
  data: SchemaGraphData;
};

export const SchemaGraphCanvas = ({ data }: SchemaGraphCanvasProps) => {
  if (data.tables.length === 0) {
    return (
      <div className={styles.wrap}>
        <p className={styles.empty}>No tables returned for the allowlisted schemas.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div>
          <strong>Schema map</strong> — {data.tables.length} tables · {data.edges.length} foreign
          keys (Postgres metadata)
        </div>
        <span>
          Wheel or trackpad to zoom · drag the background to pan · drag tables · positions persist
          locally when the table set matches
        </span>
      </div>

      <div className={styles.flowRoot}>
        <ReactFlowProvider>
          <SchemaGraphFlowInner data={data} />
        </ReactFlowProvider>
      </div>
    </div>
  );
};
