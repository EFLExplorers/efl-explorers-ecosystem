"use client";

import { DashboardPageHeader } from "@/components/layout/DashboardPageHeader";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { LandingLogicPanel } from "@/components/phases/LandingLogicPanel";
import { useDatabaseSnapshot } from "@/context/DatabaseSnapshotProvider";

export const LandingRoutePage = () => {
  const { snapshot, lastError } = useDatabaseSnapshot();

  return (
    <>
      <DashboardPageHeader
        title="Landing logic"
        description="Marketing pages, sections, content tree edges, and shared media assets wired to the same database."
      />
      {lastError ? <RouteWarning message={`Sync: ${lastError}`} /> : null}
      <LandingLogicPanel data={snapshot.landing} />
    </>
  );
};

export default LandingRoutePage;
