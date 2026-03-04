export type SubscriptionTier = "free" | "premium";

export const PREMIUM_ROUTE_PREFIXES = [
  "/dashboard/reports",
  "/dashboard/materials",
  "/dashboard/curriculum",
] as const;

export const isPremiumRoute = (pathname: string) =>
  PREMIUM_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
