import { CurriculumExplorerPanel } from "@/components/phases/CurriculumExplorerPanel";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { getCurriculumExplorerData } from "@/server/queries/curriculum";
import type { CurriculumExplorerData } from "@/types/db-visualizer";

const EMPTY_CURRICULUM_DATA: CurriculumExplorerData = {
  programs: [],
  liveSnapshotsByLevel: {},
};

export const CurriculumRoutePage = async () => {
  let warning = "";
  let data = EMPTY_CURRICULUM_DATA;

  try {
    data = await getCurriculumExplorerData();
  } catch (error) {
    warning = error instanceof Error ? error.message : "Curriculum explorer data unavailable.";
  }

  return (
    <>
      {warning ? <RouteWarning message={`Curriculum data unavailable: ${warning}`} /> : null}
      <CurriculumExplorerPanel data={data} />
    </>
  );
};

export default CurriculumRoutePage;
