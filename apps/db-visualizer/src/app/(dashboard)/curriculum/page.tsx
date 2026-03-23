"use client";

import { DashboardPageHeader } from "@/components/layout/DashboardPageHeader";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { CurriculumExplorerPanel } from "@/components/phases/CurriculumExplorerPanel";
import { useDatabaseSnapshot } from "@/context/DatabaseSnapshotProvider";

export const CurriculumRoutePage = () => {
  const { snapshot, lastError } = useDatabaseSnapshot();

  return (
    <>
      <DashboardPageHeader
        title="Curriculum engine"
        description="Programs, levels, units, and live publish snapshots as stored for the curriculum platform."
      />
      {lastError ? <RouteWarning message={`Sync: ${lastError}`} /> : null}
      <CurriculumExplorerPanel data={snapshot.curriculum} />
    </>
  );
};

export default CurriculumRoutePage;
