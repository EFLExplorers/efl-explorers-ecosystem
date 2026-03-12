import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
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

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;

  if (!session?.user) {
    return NextResponse.redirect(resolveLandingUrl(signInPath, req));
  }

  const role = session.user.role;
  if (role && role !== "teacher") {
    return NextResponse.redirect(resolveLandingUrl(signInPath, req));
  }

  const subscriptionTier =
    (session.user.subscriptionTier as string | undefined) ?? "free";
  if (
    subscriptionTier !== "premium" &&
    isPremiumRoute(req.nextUrl.pathname)
  ) {
    return NextResponse.redirect(
      resolveLandingUrl(`${pricingPath}?from=teacher`, req)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect EVERYTHING in the app EXCEPT the /sso receiver page, API routes, and static files (images, css)
    "/((?!sso|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
