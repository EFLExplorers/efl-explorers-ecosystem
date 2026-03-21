import { ConnectivityPanel } from "@/components/phases/ConnectivityPanel";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { getConnectivityData } from "@/server/queries/connectivity";
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
    data = await getConnectivityData();
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
