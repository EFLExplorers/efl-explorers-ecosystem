import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createHash } from "crypto";
import { prisma } from "@repo/database";
import { env } from "@/lib/env";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "sso",
      name: "SSO",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token;
        if (!token || typeof token !== "string") {
          console.warn("[SSO] student authorize: missing or invalid token");
          return null;
        }

        try {
          const tokenHash = hashToken(token);
          const now = new Date();

          const ssoRecord = await prisma.ssoToken.findFirst({
            where: {
              tokenHash,
              platform: "student",
              expiresAt: { gt: now },
              usedAt: null,
            },
            include: { user: true },
          });

          if (!ssoRecord?.user) {
            console.warn(
              "[SSO] student authorize: token not found, expired, or already used"
            );
            return null;
          }

          if (ssoRecord.user.role !== "student") {
            console.warn("[SSO] student authorize: role mismatch");
            return null;
          }

          await prisma.ssoToken.update({
            where: { id: ssoRecord.id },
            data: { usedAt: now },
          });

          const u = ssoRecord.user;
          return {
            id: u.id,
            email: u.email ?? undefined,
            name: u.name ?? undefined,
            role: u.role,
            approved: u.approved,
            subscriptionTier: u.subscriptionTier ?? "free",
            firstName: u.firstName ?? undefined,
            lastName: u.lastName ?? undefined,
          };
        } catch (error) {
          console.error("[SSO] student authorize error:", error);
          return null;
        }
      },
    }),
  ],
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
        token.subscriptionTier = (u.subscriptionTier ?? "free") as
          | "free"
          | "premium";
        token.firstName = u.firstName ?? null;
        token.lastName = u.lastName ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "student";
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
    signIn: `${env.NEXT_PUBLIC_LANDING_PAGE_URL ?? ""}/Auth/login/student`,
    error: `${env.NEXT_PUBLIC_LANDING_PAGE_URL ?? ""}/Auth/login/student`,
  },
  secret: env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
