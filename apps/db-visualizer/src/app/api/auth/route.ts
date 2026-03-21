import { NextResponse } from "next/server";

import { getIdentityBridgeData } from "@/server/queries/auth-mapping";

export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? undefined;

  const data = await getIdentityBridgeData(userId);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
