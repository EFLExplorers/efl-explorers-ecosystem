"use client";

import { DashboardPageHeader } from "@/components/layout/DashboardPageHeader";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { SchemaGraphCanvas } from "@/components/schema/SchemaGraphCanvas";
import { useDatabaseSnapshot } from "@/context/DatabaseSnapshotProvider";

export const SchemaMapPage = () => {
  const { snapshot, lastError } = useDatabaseSnapshot();

  return (
    <>
      <DashboardPageHeader
        title="Schema map"
        description="Postgres information_schema graph: tables, columns, and foreign keys. Pan, zoom, and drag nodes; layout persists locally per table set."
      />
      {lastError ? <RouteWarning message={`Sync: ${lastError}`} /> : null}
      <SchemaGraphCanvas data={snapshot.schemaGraph} />
    </>
  );
};

export default SchemaMapPage;
