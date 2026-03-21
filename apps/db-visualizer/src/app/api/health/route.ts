import { NextResponse } from "next/server";

import { getSchemaHealthData } from "@/server/queries/health";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const data = await getSchemaHealthData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
