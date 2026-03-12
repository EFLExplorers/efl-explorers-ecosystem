import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          role?: string;
          approved?: boolean;
          subscriptionTier?: string;
          firstName?: string;
          lastName?: string;
        };
        token.role = u.role;
        token.approved = u.approved;
        token.subscriptionTier =
          (u.subscriptionTier ?? "free") as "free" | "premium";
        token.firstName = u.firstName ?? null;
        token.lastName = u.lastName ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "teacher";
        session.user.approved = Boolean(token.approved);
        session.user.subscriptionTier =
          (token.subscriptionTier as "free" | "premium" | undefined) ?? "free";
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn:
      (process.env.NEXT_PUBLIC_LANDING_PAGE_URL ?? "") + "/Auth/login/teacher",
  },
};
