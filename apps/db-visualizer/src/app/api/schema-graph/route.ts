import { NextResponse } from "next/server";

import { getSchemaGraphData } from "@/server/queries/schema-graph";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const data = await getSchemaGraphData();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Schema graph query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
