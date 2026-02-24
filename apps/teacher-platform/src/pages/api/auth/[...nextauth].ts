import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createHash } from "crypto";
import { prisma } from "@repo/database";

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
          console.warn("[SSO] authorize: missing or invalid token");
          return null;
        }

        try {
          const tokenHash = hashToken(token);
          const now = new Date();

          const ssoRecord = await prisma.ssoToken.findFirst({
            where: {
              tokenHash,
              platform: "teacher",
              expiresAt: { gt: now },
              usedAt: null,
            },
            include: { user: true },
          });

          if (!ssoRecord?.user) {
            console.warn("[SSO] authorize: token not found, expired, or already used");
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
            firstName: u.firstName ?? undefined,
            lastName: u.lastName ?? undefined,
          };
        } catch (err) {
          console.error("[SSO] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: string; approved?: boolean; firstName?: string; lastName?: string };
        token.role = u.role;
        token.approved = u.approved;
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
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: process.env.NEXT_PUBLIC_LANDING_PAGE_URL + "/Auth/login/teacher",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
