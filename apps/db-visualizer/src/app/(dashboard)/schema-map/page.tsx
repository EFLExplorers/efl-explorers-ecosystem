import { DashboardPageHeader } from "@/components/layout/DashboardPageHeader";
import { SchemaGraphCanvas } from "@/components/schema/SchemaGraphCanvas";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { getSchemaGraphData } from "@/server/queries/schema-graph";
import type { SchemaGraphData } from "@/types/db-visualizer";

export const dynamic = "force-dynamic";

const EMPTY: SchemaGraphData = {
  tables: [],
  edges: [],
  schemas: [],
};

export const SchemaMapPage = async () => {
  let warning = "";
  let data = EMPTY;

  try {
    /* Load in-process: avoids server-side self-fetch (host/proto mismatches, loopback quirks). */
    data = await getSchemaGraphData();
  } catch (error) {
    warning =
      error instanceof Error ? error.message : "Schema graph could not be loaded.";
  }

  return (
    <>
      <DashboardPageHeader
        title="Schema map"
        description="Postgres information_schema graph: tables, columns, and foreign keys. Pan, zoom, and drag nodes; layout persists locally per table set."
      />
      {warning ? (
        <RouteWarning message={`Schema map unavailable: ${warning}`} />
      ) : null}
      <SchemaGraphCanvas data={data} />
    </>
  );
};

export default SchemaMapPage;

