import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { z } from "zod";

const BUILD_TIME_NEXTAUTH_SECRET =
  "__next_build_placeholder_do_not_use_in_production__";

function envForValidation(): NodeJS.ProcessEnv {
  if (process.env.NEXTAUTH_SECRET) return process.env;
  if (
    process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD ||
    process.env.SKIP_ENV_VALIDATION === "true"
  ) {
    return { ...process.env, NEXTAUTH_SECRET: BUILD_TIME_NEXTAUTH_SECRET };
  }
  return process.env;
}

const envSchema = z.object({
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1),
  CURRICULUM_BOOTSTRAP_ALLOWLIST: z.string().optional(),
  CURRICULUM_API_SHARED_SECRET: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse(envForValidation());

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(
    `Invalid curriculum-platform environment variables: ${details}`
  );
}

export const env = parsedEnv.data;
