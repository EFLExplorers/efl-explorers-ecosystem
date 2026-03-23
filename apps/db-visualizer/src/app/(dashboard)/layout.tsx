import Link from "next/link";
import type { ReactNode } from "react";

import { AppSidebarNav } from "@/components/layout/AppSidebarNav";
import { SchemaHealthPanel } from "@/components/dashboard/SchemaHealthPanel";
import { getCriticalEnvIssues } from "@/lib/envDiagnostics";
import { getSchemaHealthData } from "@/server/queries/health";
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
  const envIssues = getCriticalEnvIssues();
  let healthData = EMPTY_SCHEMA_HEALTH_DATA;
  let healthWarning = "";

  try {
    /* In-process: avoids server self-fetch competing for a pool slot with parallel page data loads. */
    healthData = await getSchemaHealthData();
  } catch (error) {
    healthWarning =
      error instanceof Error ? error.message : "Schema health check unavailable.";
  }

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
            Read-only route inspector — shared, auth, teachers, students, curriculum.
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
          {healthWarning ? (
            <p className={styles.healthWarning} role="status">
              {healthWarning}
            </p>
          ) : null}
          <SchemaHealthPanel data={healthData} />
        </aside>

        <section
          id="main-content"
          className={styles.content}
          tabIndex={-1}
          aria-label="Main content"
        >
          {children}
        </section>
      </div>
    </main>
  );
};

export default DashboardShellLayout;
