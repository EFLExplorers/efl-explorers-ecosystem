import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createHash } from "crypto";
import { prisma } from "@repo/database";
import { authConfig } from "./auth.config";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
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
            console.warn(
              "[SSO] authorize: token not found, expired, or already used"
            );
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
        } catch (err) {
          console.error("[SSO] authorize error:", err);
          return null;
        }
      },
    }),
  ],
});
