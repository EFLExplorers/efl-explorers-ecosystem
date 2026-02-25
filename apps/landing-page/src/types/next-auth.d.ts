import { type DefaultSession } from "next-auth";
import { type UserRole } from "@repo/database";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: UserRole;
      approved: boolean;
      subscriptionTier?: "free" | "premium";
      firstName?: string | null;
      lastName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    approved: boolean;
    subscriptionTier?: "free" | "premium";
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    approved?: boolean;
    subscriptionTier?: "free" | "premium";
    firstName?: string | null;
    lastName?: string | null;
  }
}
