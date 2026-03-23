import type { ReactNode } from "react";

import { DashboardShellClient } from "@/components/dashboard/DashboardShellClient";
import { getCriticalEnvIssues } from "@/lib/envDiagnostics";
import { buildDatabaseSyncSnapshot } from "@/server/sync/build-snapshot";

const runtimeEnvironment = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";
const deploymentRegion = process.env.VERCEL_REGION ?? "n/a";
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
const shortCommitSha = commitSha.slice(0, 8);

export const DashboardShellLayout = async ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const envIssues = getCriticalEnvIssues();
  let initialPayload: unknown = {};
  let initialLoadError = "";

  try {
    const snapshot = await buildDatabaseSyncSnapshot();
    initialPayload = JSON.parse(JSON.stringify(snapshot)) as unknown;
  } catch (error) {
    initialLoadError =
      error instanceof Error ? error.message : "Initial database snapshot unavailable.";
  }

  return (
    <DashboardShellClient
      initialPayload={initialPayload}
      initialLoadError={initialLoadError}
      envIssues={envIssues}
      runtimeEnvironment={runtimeEnvironment}
      deploymentRegion={deploymentRegion}
      shortCommitSha={shortCommitSha}
    >
      {children}
    </DashboardShellClient>
  );
};

export default DashboardShellLayout;
