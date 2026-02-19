import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { PrismaClient } from "@repo/database";
import { compare } from "bcryptjs";
import { prisma } from "@repo/database";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as PrismaClient),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        platform: { label: "Platform", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;
        const platform = credentials?.platform;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        if (
          platform &&
          (platform === "student" || platform === "teacher") &&
          user.role !== platform
        ) {
          throw new Error(
            `This account is registered as a ${user.role}, not a ${platform}`
          );
        }

        if (user.role === "teacher" && !user.approved) {
          throw new Error("Your teacher account is pending approval");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          approved: user.approved,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.approved = user.approved;
        token.firstName = user.firstName ?? null;
        token.lastName = user.lastName ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "student";
        session.user.approved = Boolean(token.approved);
        session.user.firstName = token.firstName ?? null;
        session.user.lastName = token.lastName ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/Auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
