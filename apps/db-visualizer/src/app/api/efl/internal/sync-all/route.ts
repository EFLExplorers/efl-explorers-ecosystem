import { NextResponse } from "next/server";

import { buildDatabaseSyncSnapshot } from "@/server/sync/build-snapshot";

export const dynamic = "force-dynamic";

const SYNC_HEADER = "x-efl-internal-sync";

export const GET = async (request: Request) => {
  const secret = process.env.EFL_INTERNAL_SYNC_SECRET?.trim();
  if (secret) {
    const presented = request.headers.get(SYNC_HEADER)?.trim();
    if (presented !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(request.url);
  const selectedUserId = url.searchParams.get("userId") ?? undefined;

  try {
    const data = await buildDatabaseSyncSnapshot({ selectedUserId });
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
        "Server-Timing": `db;dur=${data.meta.serverQueryMs}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
