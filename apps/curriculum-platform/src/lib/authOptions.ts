import { prisma } from "@repo/database";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { verifyPassword } from "@/lib/password";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Curriculum Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const emailRaw = credentials?.email;
        const password = credentials?.password;

        if (
          typeof emailRaw !== "string" ||
          typeof password !== "string" ||
          !emailRaw.trim() ||
          !password
        ) {
          return null;
        }

        const email = normalizeEmail(emailRaw);

        const manager = await prisma.curriculumManager.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            isActive: true,
          },
        });

        if (!manager || !manager.isActive) {
          return null;
        }

        const isValid = await verifyPassword(password, manager.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: manager.id,
          email: manager.email,
          name: manager.name,
          role: "curriculum_manager" as const,
          managerId: manager.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "curriculum_manager";
        token.managerId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = "curriculum_manager";
        session.user.managerId = (token.managerId as string | undefined) ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
