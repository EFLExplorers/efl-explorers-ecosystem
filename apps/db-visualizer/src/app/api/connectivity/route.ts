import { NextResponse } from "next/server";

import { getConnectivityData } from "@/server/queries/connectivity";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const data = await getConnectivityData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
