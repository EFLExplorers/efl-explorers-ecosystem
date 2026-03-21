import { LandingLogicPanel } from "@/components/phases/LandingLogicPanel";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { getLandingLogicData } from "@/server/queries/landing";
import type { LandingLogicData } from "@/types/db-visualizer";

const EMPTY_LANDING_DATA: LandingLogicData = {
  pages: [],
  contentNodes: [],
  contentEdges: [],
  alienAssets: [],
};

export const LandingRoutePage = async () => {
  let warning = "";
  let data = EMPTY_LANDING_DATA;

  try {
    data = await getLandingLogicData();
  } catch (error) {
    warning = error instanceof Error ? error.message : "Landing data unavailable.";
  }

  return (
    <>
      {warning ? <RouteWarning message={`Landing data unavailable: ${warning}`} /> : null}
      <LandingLogicPanel data={data} />
    </>
  );
};

export default LandingRoutePage;
