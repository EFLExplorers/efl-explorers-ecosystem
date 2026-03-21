import { NextResponse } from "next/server";

import { getCurriculumExplorerData } from "@/server/queries/curriculum";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const data = await getCurriculumExplorerData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
