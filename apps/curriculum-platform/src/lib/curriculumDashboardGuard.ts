import type { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@repo/database";

import { authOptions } from "@/lib/authOptions";

export type CurriculumDashboardRedirect = {
  redirect: { destination: string; permanent: false };
};

export async function requireActiveCurriculumManager(
  context: GetServerSidePropsContext
): Promise<
  { managerId: string; userEmail: string | null } | CurriculumDashboardRedirect
> {
  const session = await getServerSession(context.req, context.res, authOptions);
  const managerId = session?.user?.managerId;

  if (!session?.user?.id || !managerId) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  let manager: { id: string; isActive: boolean } | null;
  try {
    manager = await prisma.curriculumManager.findUnique({
      where: { id: managerId },
      select: { id: true, isActive: true },
    });
  } catch (error) {
    console.error("[requireActiveCurriculumManager] prisma.curriculumManager.findUnique failed:", error);
    return {
      redirect: { destination: "/unauthorized", permanent: false },
    };
  }

  if (!manager || !manager.isActive) {
    return {
      redirect: { destination: "/unauthorized", permanent: false },
    };
  }

  return {
    managerId,
    userEmail: session.user?.email ?? null,
  };
}
