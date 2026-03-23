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
import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

/** Bumped when layout logic changes — avoids stale or invalid cached coordinates hiding the graph. */
const LS_KEY = "db-visualizer-schema-map-positions-v4";

/**
 * React Flow uses ids in DOM/querySelector paths; dots in `auth.users` can break rendering.
 * Postgres `schema.table` stays on `node.data.table` for display; flow id is URL-safe ascii.
 */
const flowNodeId = (table: SchemaGraphTable) => {
  const payload = `${table.schema}\x1e${table.name}`;
  return `sg_${encodeURIComponent(payload).replace(/%/g, "_")}`;
};

const flowEdgeId = (edgeId: string) =>
  `e_${encodeURIComponent(edgeId).replace(/%/g, "_")}`;

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
    return sanitizeSavedPositions(parsed.positions);
  } catch {
    return null;
  }
};

const sanitizeSavedPositions = (
  raw: Record<string, { x: number; y: number }> | undefined,
): Record<string, { x: number; y: number }> | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const out: Record<string, { x: number; y: number }> = {};
  for (const [id, pos] of Object.entries(raw)) {
    if (!pos || typeof pos !== "object") {
      continue;
    }
    const x = Number(pos.x);
    const y = Number(pos.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      out[id] = { x, y };
    }
  }
  return Object.keys(out).length > 0 ? out : null;
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
  /** Increment to refit the viewport after the graph container changes size (e.g. maximize). */
  recenterSignal: number;
};

const requestElementFullscreen = (el: HTMLElement) => {
  if (el.requestFullscreen) {
    return el.requestFullscreen();
  }
  const wk = (el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen;
  if (wk) {
    wk.call(el);
    return Promise.resolve();
  }
  return Promise.reject(new Error("Fullscreen API not supported"));
};

const exitDocumentFullscreen = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  const wk = (document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen;
  if (wk) {
    wk.call(document);
    return Promise.resolve();
  }
  return Promise.resolve();
};

const getFullscreenElement = () =>
  document.fullscreenElement ??
  (document as unknown as { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ??
  null;

const SchemaGraphFlowInner = ({ data, recenterSignal }: FlowInnerProps) => {
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
      const fid = flowNodeId(table);
      const fromDisk = saved?.[fid];
      const position =
        fromDisk && Number.isFinite(fromDisk.x) && Number.isFinite(fromDisk.y)
          ? fromDisk
          : { x: box.x, y: box.y };
      const node: SchemaTableFlowNode = {
        id: fid,
        type: "schemaTable",
        position,
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

    const tableByQualifiedId = new Map(data.tables.map((t) => [t.id, t]));

    const nextEdges: Edge[] = [];
    for (const edge of data.edges) {
      if (!positions.has(edge.fromTableId) || !positions.has(edge.toTableId)) {
        continue;
      }
      const fromT = tableByQualifiedId.get(edge.fromTableId);
      const toT = tableByQualifiedId.get(edge.toTableId);
      if (!fromT || !toT) {
        continue;
      }
      nextEdges.push({
        id: flowEdgeId(edge.id),
        source: flowNodeId(fromT),
        target: flowNodeId(toT),
        sourceHandle: HANDLE_SOURCE,
        targetHandle: HANDLE_TARGET,
        ...defaultEdgeOptions,
      });
    }

    setNodes(nextNodes);
    setEdges(nextEdges);

    /* Frame the graph whenever data loads. Saved positions only affect node x/y, not viewport;
       skipping fitView when localStorage existed left many users staring at an empty pane. */
    const t = window.setTimeout(() => {
      requestAnimationFrame(() => {
        fitView({ padding: 0.12, maxZoom: 1.35, duration: 220 });
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [data, fingerprint, fitView, setEdges, setNodes]);

  useEffect(() => {
    if (recenterSignal <= 0) {
      return;
    }
    const id = window.requestAnimationFrame(() => {
      fitView({ padding: 0.12, maxZoom: 1.35, duration: 200 });
    });
    return () => window.cancelAnimationFrame(id);
  }, [recenterSignal, fitView]);

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
  const shellRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [nativeFs, setNativeFs] = useState(false);

  const bumpRecenter = useCallback(() => {
    setRecenterSignal((n) => n + 1);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((v) => {
      if (v && getFullscreenElement()) {
        void exitDocumentFullscreen();
      }
      return !v;
    });
    bumpRecenter();
  }, [bumpRecenter]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") {
        return;
      }
      /* Let the browser exit native fullscreen first; do not also tear down the expanded shell. */
      if (getFullscreenElement()) {
        return;
      }
      setIsExpanded(false);
      bumpRecenter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isExpanded, bumpRecenter]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isExpanded]);

  useEffect(() => {
    const onFs = () => {
      setNativeFs(Boolean(getFullscreenElement()));
      bumpRecenter();
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs as EventListener);
    };
  }, [bumpRecenter]);

  const onTrueFullscreen = useCallback(async () => {
    const el = shellRef.current;
    if (!el) {
      return;
    }
    try {
      if (getFullscreenElement()) {
        await exitDocumentFullscreen();
      } else {
        await requestElementFullscreen(el);
      }
    } catch {
      /* user denied or unsupported */
    }
    bumpRecenter();
  }, [bumpRecenter]);

  if (data.tables.length === 0) {
    return (
      <div className={styles.wrap}>
        <p className={styles.empty}>
          No tables returned for the allowlisted schemas (auth, curriculum, shared, students,
          teachers, public). If you expect data, apply migrations to this database and confirm{" "}
          <code className={styles.emptyCode}>DATABASE_URL</code> /{" "}
          <code className={styles.emptyCode}>DIRECT_URL</code> in{" "}
          <code className={styles.emptyCode}>packages/database/.env</code> match the instance you
          migrated. The <code className={styles.emptyCode}>/api/schema-graph</code> response in the
          Network tab should show the same table count as this page.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={`${styles.wrap} ${isExpanded ? styles.wrapExpanded : ""}`}
    >
      <div className={styles.toolbar}>
        <div>
          <strong>Live graph</strong> — {data.tables.length} tables · {data.edges.length} foreign keys
          (Postgres metadata)
        </div>
        <div className={styles.toolbarRight}>
          <span className={styles.toolbarHint}>
            Wheel zoom · drag pan · drag tables · positions saved locally
          </span>
          <div className={styles.toolbarActions}>
            {isExpanded ? (
              <button
                type="button"
                className={styles.toolBtn}
                onClick={onTrueFullscreen}
                aria-pressed={nativeFs}
                aria-label={
                  nativeFs ? "Exit browser fullscreen" : "Browser fullscreen (hide browser UI)"
                }
              >
                {nativeFs ? "Exit F11 fullscreen" : "Browser fullscreen"}
              </button>
            ) : null}
            <button
              type="button"
              className={styles.toolBtn}
              onClick={toggleExpanded}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Restore map size" : "Maximize map to fill the window"}
            >
              {isExpanded ? (
                <>
                  <Minimize2 size={14} aria-hidden />
                  Restore
                </>
              ) : (
                <>
                  <Maximize2 size={14} aria-hidden />
                  Maximize map
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={styles.flowRoot}
        role="application"
        aria-label="Database schema graph. Use the mouse wheel to zoom, drag the background to pan, and drag table nodes to rearrange."
      >
        <ReactFlowProvider>
          <SchemaGraphFlowInner data={data} recenterSignal={recenterSignal} />
        </ReactFlowProvider>
      </div>
    </div>
  );
};
