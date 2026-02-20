import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const envCandidates = [
  path.resolve(process.cwd(), "packages", "database", ".env"),
  path.resolve(process.cwd(), "..", "..", "packages", "database", ".env"),
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
if (envPath) {
  loadEnv({ path: envPath, override: true });
}

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

const isPrismaAccelerateUrl = (url?: string) =>
  typeof url === "string" && url.startsWith("prisma://");

const isPostgresUrl = (url?: string) => /^postgres(ql)?:/i.test(url ?? "");

type GlobalPrisma = {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

const getPgPool = (connectionString: string) => {
  if (!globalForPrisma.prismaPool) {
    globalForPrisma.prismaPool = new Pool({ connectionString });
  }
  return globalForPrisma.prismaPool;
};

const createPrismaClient = () => {
  if (directUrl && isPostgresUrl(directUrl)) {
    return new PrismaClient({ adapter: new PrismaPg(getPgPool(directUrl)) });
  }

  if (databaseUrl && isPostgresUrl(databaseUrl)) {
    return new PrismaClient({ adapter: new PrismaPg(getPgPool(databaseUrl)) });
  }

  if (databaseUrl && isPrismaAccelerateUrl(databaseUrl)) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }

  throw new Error("Missing DATABASE_URL or DIRECT_URL for Prisma client.");
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export * from "@prisma/client";
