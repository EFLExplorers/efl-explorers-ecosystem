"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { AppSidebarNav } from "@/components/layout/AppSidebarNav";
import { SchemaHealthPanel } from "@/components/dashboard/SchemaHealthPanel";
import {
  DatabaseSnapshotProvider,
  useDatabaseSnapshot,
} from "@/context/DatabaseSnapshotProvider";
import { getSyncGridDataForTable } from "@/lib/sync-grid-data";

import { DenseDataGrid } from "./DenseDataGrid";
import { SchemaModelTree } from "./SchemaModelTree";
import { SyncMetricsRail } from "./SyncMetricsRail";

import styles from "./DashboardShellClient.module.css";

type DashboardShellBodyProps = Readonly<{
  children: ReactNode;
  envIssues: readonly string[];
  runtimeEnvironment: string;
  deploymentRegion: string;
  shortCommitSha: string;
}>;

const DashboardShellBody = ({
  children,
  envIssues,
  runtimeEnvironment,
  deploymentRegion,
  shortCommitSha,
}: DashboardShellBodyProps) => {
  const {
    snapshot,
    drift,
    schemaOutOfSync,
    lastError,
    clientTtfbMs,
    isFetching,
    isBackingOff,
    backoffRemainingMs,
    documentPollingPaused,
    selectedTableId,
    setSelectedTableId,
    slowServerQuery,
    slowClientTtfb,
  } = useDatabaseSnapshot();

  const gridData = useMemo(() => {
    if (!selectedTableId) {
      return { columns: [] as string[], rows: [] as Record<string, unknown>[], hint: "Select a table." };
    }
    return getSyncGridDataForTable(selectedTableId, snapshot);
  }, [selectedTableId, snapshot]);

  return (
    <main className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <header className={styles.header} role="banner">
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <p className={styles.productName}>EFL Ecosystem DB Visualizer</p>
            <div className={styles.opsBadges} aria-label="Deployment metadata">
              <span className={styles.badge}>env: {runtimeEnvironment}</span>
              <span className={styles.badge}>region: {deploymentRegion}</span>
              <span className={styles.badge}>commit: {shortCommitSha}</span>
            </div>
          </div>
          <p className={styles.tagline}>
            Read-only sync-all inspector — shared, auth, teachers, students, curriculum.
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Visualizer navigation and schema health">
          <AppSidebarNav />
          {envIssues.length > 0 ? (
            <div className={styles.envBanner} role="alert">
              <strong>Environment</strong>
              <ul>
                {envIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
              <Link className={styles.envBannerLink} href="/deployment">
                Open deployment / env report
              </Link>
            </div>
          ) : null}
          <SchemaHealthPanel data={snapshot.health} />
        </aside>

        <section
          id="main-content"
          className={styles.content}
          tabIndex={-1}
          aria-label="Main content"
        >
          <div className={styles.pageArea}>{children}</div>
          <div className={styles.gridPanel}>
            <h2 className={styles.gridHeading}>
              Row preview
              {selectedTableId ? (
                <span className={styles.gridTableId}> — {selectedTableId}</span>
              ) : null}
            </h2>
            <DenseDataGrid
              columns={gridData.columns}
              rows={gridData.rows}
              hint={gridData.hint}
            />
          </div>
        </section>

        <div className={styles.metricsSlot}>
          <SyncMetricsRail
            clientTtfbMs={clientTtfbMs}
            serverQueryMs={snapshot.meta.serverQueryMs}
            isFetching={isFetching}
            documentPollingPaused={documentPollingPaused}
            isBackingOff={isBackingOff}
            backoffRemainingMs={backoffRemainingMs}
            lastError={lastError}
            slowServerQuery={slowServerQuery}
            slowClientTtfb={slowClientTtfb}
          />
          <SchemaModelTree
            tables={snapshot.schemaGraph.tables}
            selectedTableId={selectedTableId}
            onSelectTable={(id) => setSelectedTableId(id)}
          />
        </div>
      </div>

      <footer className={styles.footer} role="contentinfo">
        <span
          className={
            snapshot.health.summary.error === 0 ? styles.footerOk : styles.footerWarn
          }
        >
          Schema checks: {snapshot.health.summary.ok} ok / {snapshot.health.summary.error}{" "}
          errors
        </span>
        {schemaOutOfSync ? (
          <span className={styles.footerDrift}>
            Schema out-of-sync
            {drift.metaZodFailed ? " (meta)" : ""}
            {drift.topLevelUnknownKeys.length > 0
              ? `: ${drift.topLevelUnknownKeys.slice(0, 8).join(", ")}${drift.topLevelUnknownKeys.length > 8 ? "…" : ""}`
              : ""}
          </span>
        ) : (
          <span className={styles.footerMuted}>Snapshot shape matches contract.</span>
        )}
      </footer>
    </main>
  );
};

export type DashboardShellClientProps = Readonly<{
  children: ReactNode;
  initialPayload: unknown;
  initialLoadError?: string;
  envIssues: readonly string[];
  runtimeEnvironment: string;
  deploymentRegion: string;
  shortCommitSha: string;
}>;

export const DashboardShellClient = ({
  children,
  initialPayload,
  initialLoadError = "",
  envIssues,
  runtimeEnvironment,
  deploymentRegion,
  shortCommitSha,
}: DashboardShellClientProps) => {
  return (
    <DatabaseSnapshotProvider
      initialPayload={initialPayload}
      initialLoadError={initialLoadError}
    >
      <DashboardShellBody
        envIssues={envIssues}
        runtimeEnvironment={runtimeEnvironment}
        deploymentRegion={deploymentRegion}
        shortCommitSha={shortCommitSha}
      >
        {children}
      </DashboardShellBody>
    </DatabaseSnapshotProvider>
  );
};
