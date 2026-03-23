import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SYNC_HEADER = "x-efl-internal-sync";

export const middleware = (request: NextRequest) => {
  const secret = process.env.EFL_INTERNAL_SYNC_SECRET?.trim();
  if (!secret) {
    return NextResponse.next();
  }
  const presented = request.headers.get(SYNC_HEADER)?.trim();
  if (presented !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
};

export const config = {
  matcher: "/api/efl/internal/:path*",
};
