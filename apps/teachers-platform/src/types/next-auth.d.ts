import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role?: string;
      approved?: boolean;
      subscriptionTier?: "free" | "premium";
      firstName?: string | null;
      lastName?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    approved?: boolean;
    subscriptionTier?: "free" | "premium";
    firstName?: string | null;
    lastName?: string | null;
  }
}
