import { SchemaGraphCanvas } from "@/components/schema/SchemaGraphCanvas";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { fetchFromApi } from "@/server/api-client";
import { normalizeSchemaGraphData } from "@/server/normalize-api-data";
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
    const raw = await fetchFromApi<unknown>("/api/schema-graph");
    data = normalizeSchemaGraphData(raw);
  } catch (error) {
    warning =
      error instanceof Error ? error.message : "Schema graph could not be loaded.";
  }

  return (
    <>
      {warning ? (
        <RouteWarning message={`Schema map unavailable: ${warning}`} />
      ) : null}
      <SchemaGraphCanvas data={data} />
    </>
  );
};

export default SchemaMapPage;

