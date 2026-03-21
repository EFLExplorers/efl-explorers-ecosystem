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

/** Same precedence as `createPrismaClient` — used only to read pool hints from the URL. */
const resolveRuntimePostgresUrl = (): string | null => {
  if (databaseUrl && isPostgresUrl(databaseUrl)) {
    return databaseUrl;
  }
  if (directUrl && isPostgresUrl(directUrl)) {
    return directUrl;
  }
  return null;
};

const urlUsesPgBouncerFlag = (url: string): boolean => {
  try {
    const v = new URL(url).searchParams.get("pgbouncer")?.trim().toLowerCase();
    return v === "true";
  } catch {
    return /\bpgbouncer=true\b/i.test(url);
  }
};

const parseUrlConnectionLimit = (url: string): number | null => {
  try {
    const raw = new URL(url).searchParams.get("connection_limit")?.trim();
    if (!raw) {
      return null;
    }
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 100) : null;
  } catch {
    return null;
  }
};

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

/**
 * Max connections per Node isolate for `pg` (each app / worker × this counts against pooler or Postgres limits).
 * When `DATABASE_POOL_MAX` is unset, we still respect `?connection_limit=` and `?pgbouncer=true` on the runtime URL.
 */
const poolMaxConnections = (() => {
  const prodDefault = 10;
  const devDefault = 2;
  const raw = process.env.DATABASE_POOL_MAX?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) {
      return process.env.NODE_ENV === "production" ? prodDefault : devDefault;
    }
    return Math.min(n, 100);
  }

  let max = process.env.NODE_ENV === "production" ? prodDefault : devDefault;
  const runtimeUrl = resolveRuntimePostgresUrl();
  if (runtimeUrl) {
    if (urlUsesPgBouncerFlag(runtimeUrl)) {
      max = Math.min(max, 1);
    }
    const urlLimit = parseUrlConnectionLimit(runtimeUrl);
    if (urlLimit != null) {
      max = Math.min(max, urlLimit);
    }
  }

  return Math.max(1, max);
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
  /**
   * Runtime connections are already pooled in-process via `pg.Pool` (reuse across queries).
   * What still multiplies load: each Node process (each dev server, each serverless worker) gets its own pool.
   * Prefer `DATABASE_URL` when it is Postgres so a host **pooler** (PgBouncer, Neon pooler, etc.) can
   * multiplex many app connections onto fewer server sessions. Reserve `DIRECT_URL` for migrations and
   * scripts that need a non-pooled session (see Prisma `directUrl`).
   *
   * **Prisma Accelerate** (`prisma://…` on `DATABASE_URL`) must be checked before falling back to
   * `DIRECT_URL` — otherwise a paired `DIRECT_URL=postgresql://…` would incorrectly steal runtime traffic.
   */
  if (databaseUrl && isPrismaAccelerateUrl(databaseUrl)) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }

  if (databaseUrl && isPostgresUrl(databaseUrl)) {
    return new PrismaClient({
      adapter: new PrismaPg(
        getPgPool(sanitizePostgresConnectionString(databaseUrl)),
      ),
    });
  }

  if (directUrl && isPostgresUrl(directUrl)) {
    return new PrismaClient({
      adapter: new PrismaPg(getPgPool(sanitizePostgresConnectionString(directUrl))),
    });
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
