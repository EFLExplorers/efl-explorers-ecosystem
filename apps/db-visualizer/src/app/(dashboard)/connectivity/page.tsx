"use client";

import { DashboardPageHeader } from "@/components/layout/DashboardPageHeader";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { ConnectivityPanel } from "@/components/phases/ConnectivityPanel";
import { useDatabaseSnapshot } from "@/context/DatabaseSnapshotProvider";

export const ConnectivityRoutePage = () => {
  const { snapshot, lastError } = useDatabaseSnapshot();

  return (
    <>
      <DashboardPageHeader
        title="Global connectivity"
        description="Cross-schema level alignment between students and curriculum (read-only string matches, not FK guarantees)."
      />
      {lastError ? <RouteWarning message={`Sync: ${lastError}`} /> : null}
      <ConnectivityPanel data={snapshot.connectivity} />
    </>
  );
};

export default ConnectivityRoutePage;
