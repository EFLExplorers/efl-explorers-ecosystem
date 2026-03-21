import type { ReactNode } from "react";

import { AppSidebarNav } from "@/components/layout/AppSidebarNav";
import { SchemaHealthPanel } from "@/components/dashboard/SchemaHealthPanel";
import { fetchFromApi } from "@/server/api-client";
import { normalizeSchemaHealthData } from "@/server/normalize-api-data";
import type { SchemaHealthData } from "@/types/db-visualizer";

import styles from "./layout.module.css";

const EMPTY_SCHEMA_HEALTH_DATA: SchemaHealthData = {
  checks: [],
  summary: {
    ok: 0,
    error: 0,
  },
};

const runtimeEnvironment = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";
const deploymentRegion = process.env.VERCEL_REGION ?? "n/a";
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
const shortCommitSha = commitSha.slice(0, 8);

export const DashboardShellLayout = async ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  let healthData = EMPTY_SCHEMA_HEALTH_DATA;
  let healthWarning = "";

  try {
    const rawHealthData = await fetchFromApi<unknown>("/api/health");
    healthData = normalizeSchemaHealthData(rawHealthData);
  } catch (error) {
    healthWarning =
      error instanceof Error ? error.message : "Schema health check unavailable.";
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <h1>EFL Ecosystem DB Visualizer</h1>
            <div className={styles.opsBadges}>
              <span className={styles.badge}>env: {runtimeEnvironment}</span>
              <span className={styles.badge}>region: {deploymentRegion}</span>
              <span className={styles.badge}>commit: {shortCommitSha}</span>
            </div>
          </div>
          <p className={styles.tagline}>
            Route-based read-only inspector for shared, auth, teachers, students, and
            curriculum schemas.
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <AppSidebarNav />
          {healthWarning ? <p className={styles.healthWarning}>{healthWarning}</p> : null}
          <SchemaHealthPanel data={healthData} />
        </aside>

        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
};

export default DashboardShellLayout;
