import { LandingLogicPanel } from "@/components/phases/LandingLogicPanel";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { fetchFromApi } from "@/server/api-client";
import { normalizeLandingData } from "@/server/normalize-api-data";
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
    const rawLandingData = await fetchFromApi<unknown>("/api/landing");
    data = normalizeLandingData(rawLandingData);
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
