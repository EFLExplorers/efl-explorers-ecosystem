import { DashboardPageHeader } from "@/components/layout/DashboardPageHeader";
import { CurriculumExplorerPanel } from "@/components/phases/CurriculumExplorerPanel";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { fetchFromApi } from "@/server/api-client";
import { normalizeCurriculumData } from "@/server/normalize-api-data";
import type { CurriculumExplorerData } from "@/types/db-visualizer";

const EMPTY_CURRICULUM_DATA: CurriculumExplorerData = {
  programs: [],
  liveSnapshotsByLevel: {},
};

export const CurriculumRoutePage = async () => {
  let warning = "";
  let data = EMPTY_CURRICULUM_DATA;

  try {
    const rawCurriculumData = await fetchFromApi<unknown>("/api/curriculum");
    data = normalizeCurriculumData(rawCurriculumData);
  } catch (error) {
    warning = error instanceof Error ? error.message : "Curriculum explorer data unavailable.";
  }

  return (
    <>
      <DashboardPageHeader
        title="Curriculum engine"
        description="Programs, levels, units, and live publish snapshots as stored for the curriculum platform."
      />
      {warning ? <RouteWarning message={`Curriculum data unavailable: ${warning}`} /> : null}
      <CurriculumExplorerPanel data={data} />
    </>
  );
};

export default CurriculumRoutePage;
