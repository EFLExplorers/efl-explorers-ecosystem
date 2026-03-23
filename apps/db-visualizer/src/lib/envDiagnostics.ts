import type {
  DeploymentEnvReport,
  DeploymentEnvVarRow,
  DeploymentEnvVarStatus,
  DeploymentRuntimeContext,
} from "@/types/db-visualizer";

const isBlank = (value: string | undefined): boolean =>
  value === undefined || value.trim().length === 0;

const looksLikePostgresOrAccelerate = (value: string): boolean => {
  const v = value.trim();
  if (/^prisma:\/\//i.test(v)) {
    return true;
  }
  return /^postgres(ql)?:\/\//i.test(v);
};

const classifyConnectionString = (
  raw: string | undefined,
): DeploymentEnvVarStatus => {
  if (isBlank(raw)) {
    return "missing";
  }
  return looksLikePostgresOrAccelerate(raw!) ? "ok" : "suspicious";
};

const classifyPoolMax = (raw: string | undefined): DeploymentEnvVarStatus => {
  if (isBlank(raw)) {
    return "ok";
  }
  const n = Number.parseInt(raw!.trim(), 10);
  if (!Number.isFinite(n) || n < 1) {
    return "suspicious";
  }
  return "ok";
};

const runtimeContext = (): DeploymentRuntimeContext => {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
  return {
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    vercelEnv: process.env.VERCEL_ENV ?? null,
    vercelRegion: process.env.VERCEL_REGION ?? null,
    commitShort: commitSha.slice(0, 8),
  };
};

const hasViableDatabaseConfig = (
  databaseUrlStatus: DeploymentEnvVarStatus,
  directUrlStatus: DeploymentEnvVarStatus,
  databaseUrlRaw: string | undefined,
  directUrlRaw: string | undefined,
): boolean => {
  const dbOk =
    databaseUrlStatus === "ok" &&
    !isBlank(databaseUrlRaw) &&
    looksLikePostgresOrAccelerate(databaseUrlRaw!);
  const directOk =
    directUrlStatus === "ok" &&
    !isBlank(directUrlRaw) &&
    /^postgres(ql)?:\/\//i.test(directUrlRaw!.trim());
  return dbOk || directOk;
};

export const getCriticalEnvIssues = (): string[] => {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const du = classifyConnectionString(databaseUrl);
  const dr = classifyConnectionString(directUrl);

  if (!hasViableDatabaseConfig(du, dr, databaseUrl, directUrl)) {
    return [
      "No valid DATABASE_URL (Postgres or Prisma Accelerate) or DIRECT_URL (Postgres) — Prisma cannot connect. Open /deployment for details.",
    ];
  }
  if (du === "suspicious" && dr !== "ok") {
    return [
      "DATABASE_URL is set but does not look like postgres:// or prisma://, and DIRECT_URL is not a usable Postgres URL. See /deployment.",
    ];
  }
  return [];
};

export const getDeploymentEnvReport = (): DeploymentEnvReport => {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const poolMax = process.env.DATABASE_POOL_MAX;

  const du = classifyConnectionString(databaseUrl);
  const dr = classifyConnectionString(directUrl);
  const pm = classifyPoolMax(poolMax);

  const directOkEnough =
    dr === "missing" && du === "ok" && hasViableDatabaseConfig(du, dr, databaseUrl, directUrl);

  const directDisplayStatus: DeploymentEnvVarStatus = directOkEnough ? "ok" : dr;
  const directHint = (() => {
    if (dr === "suspicious") {
      return "When set, expected postgresql:// or postgres:// (often used with Accelerate on DATABASE_URL).";
    }
    if (directOkEnough) {
      return "Not set — acceptable when DATABASE_URL already supplies runtime (Postgres or Accelerate).";
    }
    if (dr === "missing") {
      return "Set a Postgres URL when DATABASE_URL is absent or not a supported runtime connection string.";
    }
    return undefined;
  })();

  const variables: DeploymentEnvVarRow[] = [
    {
      key: "DATABASE_URL",
      importance: "required",
      status: du,
      hint:
        du === "suspicious"
          ? "Expected a non-empty postgres:// or postgresql:// URL, or prisma:// for Accelerate."
          : du === "missing" && dr === "ok"
            ? "Missing — using DIRECT_URL for runtime (per @repo/database precedence)."
            : du === "missing"
              ? "Set a pooled or direct Postgres URL, or prisma:// for Accelerate (see @repo/database)."
              : undefined,
    },
    {
      key: "DIRECT_URL",
      importance: "optional",
      status: directDisplayStatus,
      hint: directHint,
    },
    {
      key: "DATABASE_POOL_MAX",
      importance: "optional",
      status: pm,
      hint:
        pm === "suspicious"
          ? "When set, must be a positive integer (caps pg pool per process)."
          : isBlank(poolMax)
            ? "Not set — @repo/database uses defaults from URL hints and NODE_ENV."
            : undefined,
    },
  ];

  const criticalIssues: string[] = [];
  if (!hasViableDatabaseConfig(du, dr, databaseUrl, directUrl)) {
    criticalIssues.push(
      "No viable database connection configuration detected for this runtime.",
    );
  } else if (du === "suspicious" && dr !== "ok") {
    criticalIssues.push(
      "DATABASE_URL shape is unexpected and DIRECT_URL is not a valid Postgres URL.",
    );
  }

  return {
    context: runtimeContext(),
    variables,
    criticalIssues,
  };
};

const sanitizeProbeMessage = (error: unknown): string => {
  if (!(error instanceof Error) || !error.message) {
    return "Database probe failed.";
  }
  const msg = error.message;
  if (
    /postgres(ql)?:\/\//i.test(msg) ||
    /prisma:\/\//i.test(msg) ||
    /@\S+:\d+/.test(msg)
  ) {
    return "Database probe failed (details omitted for safety).";
  }
  if (msg.length > 200) {
    return `${msg.slice(0, 200)}…`;
  }
  return msg;
};

export type DatabaseProbeResult = {
  readonly ok: boolean;
  readonly message: string;
};

export const probeDatabaseReachability = async (): Promise<DatabaseProbeResult> => {
  try {
    const { prisma } = await import("@repo/database");
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: "Database responded to SELECT 1." };
  } catch (error) {
    return {
      ok: false,
      message: sanitizeProbeMessage(error),
    };
  }
};
