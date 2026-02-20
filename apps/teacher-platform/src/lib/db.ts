import { prisma } from "@repo/database";

export { prisma };

export function getPrisma() {
  return prisma;
}

export async function disconnectPrisma() {
  // Keep signature for legacy callers; shared client handles lifecycle.
}
