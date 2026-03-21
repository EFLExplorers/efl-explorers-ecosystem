import { ConnectivityPanel } from "@/components/phases/ConnectivityPanel";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { fetchFromApi } from "@/server/api-client";
import { normalizeConnectivityData } from "@/server/normalize-api-data";
import type { ConnectivityData } from "@/types/db-visualizer";

const EMPTY_CONNECTIVITY_DATA: ConnectivityData = {
  matches: [],
  unmatchedStudents: [],
  levels: [],
};

export const ConnectivityRoutePage = async () => {
  let warning = "";
  let data = EMPTY_CONNECTIVITY_DATA;

  try {
    const rawConnectivityData = await fetchFromApi<unknown>("/api/connectivity");
    data = normalizeConnectivityData(rawConnectivityData);
  } catch (error) {
    warning = error instanceof Error ? error.message : "Global connectivity data unavailable.";
  }

  return (
    <>
      {warning ? <RouteWarning message={`Global connectivity unavailable: ${warning}`} /> : null}
      <ConnectivityPanel data={data} />
    </>
  );
};

export default ConnectivityRoutePage;
