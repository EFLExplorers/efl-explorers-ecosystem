import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isPremiumRoute } from "@/lib/entitlements";

const landingBaseUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL ?? "";
const signInPath = "/Auth/login/teacher";
const pricingPath = "/pricing";

const resolveLandingUrl = (path: string, request: NextRequest) => {
  if (landingBaseUrl) {
    return new URL(path, landingBaseUrl);
  }
  return new URL(path, request.url);
};

export default async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(resolveLandingUrl(signInPath, request));
  }

  if (token.role && token.role !== "teacher") {
    return NextResponse.redirect(resolveLandingUrl(signInPath, request));
  }

  const subscriptionTier = (token.subscriptionTier as string | undefined) ?? "free";
  if (subscriptionTier !== "premium" && isPremiumRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(
      resolveLandingUrl(`${pricingPath}?from=teacher`, request)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect EVERYTHING in the app EXCEPT the /sso receiver page, API routes, and static files (images, css)
    "/((?!sso|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
