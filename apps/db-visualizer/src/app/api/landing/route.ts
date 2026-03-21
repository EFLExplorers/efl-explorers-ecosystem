import { NextResponse } from "next/server";

import { getLandingLogicData } from "@/server/queries/landing";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const data = await getLandingLogicData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
