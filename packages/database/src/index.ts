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

const sanitizePostgresConnectionString = (connectionString: string) => {
  try {
    const parsed = new URL(connectionString);
    // Some providers export ssl file params with value "system" (libpq style),
    // which causes pg to try opening a local file named "system".
    ["sslcert", "sslkey", "sslrootcert", "sslcrl"].forEach((param) => {
      const value = parsed.searchParams.get(param)?.trim().toLowerCase();
      if (value === "system") {
        parsed.searchParams.delete(param);
      }
    });
    return parsed.toString();
  } catch {
    return connectionString;
  }
};

type GlobalPrisma = {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

/** Max connections per Node isolate for `pg` (each serverless worker × this counts against Postgres `max_connections`). */
const poolMaxConnections = (() => {
  const raw = process.env.DATABASE_POOL_MAX?.trim();
  if (!raw) {
    return 10;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 100) : 10;
})();

const getPgPool = (connectionString: string) => {
  if (!globalForPrisma.prismaPool) {
    globalForPrisma.prismaPool = new Pool({
      connectionString,
      max: poolMaxConnections,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
    });
  }
  return globalForPrisma.prismaPool;
};

const createPrismaClient = () => {
  if (directUrl && isPostgresUrl(directUrl)) {
    return new PrismaClient({
      adapter: new PrismaPg(getPgPool(sanitizePostgresConnectionString(directUrl))),
    });
  }

  if (databaseUrl && isPostgresUrl(databaseUrl)) {
    return new PrismaClient({
      adapter: new PrismaPg(
        getPgPool(sanitizePostgresConnectionString(databaseUrl))
      ),
    });
  }

  if (databaseUrl && isPrismaAccelerateUrl(databaseUrl)) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }

  throw new Error("Missing DATABASE_URL or DIRECT_URL for Prisma client.");
};

/** One client + one pool per runtime (dev HMR, serverless warm instance, `next start` worker). */
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}
export const prisma = globalForPrisma.prisma;

export { PrismaClient };
export * from "@prisma/client";
