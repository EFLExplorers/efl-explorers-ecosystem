import { NextResponse } from "next/server";

import {
  getDeploymentEnvReport,
  probeDatabaseReachability,
} from "@/lib/envDiagnostics";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const report = getDeploymentEnvReport();
  const probe = await probeDatabaseReachability();

  return NextResponse.json(
    {
      ...report,
      databaseReachable: probe.ok,
      databaseProbeMessage: probe.message,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
};
