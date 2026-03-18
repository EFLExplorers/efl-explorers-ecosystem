import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  CURRICULUM_BOOTSTRAP_ALLOWLIST: z.string().optional(),
  CURRICULUM_API_SHARED_SECRET: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(
    `Invalid curriculum-platform environment variables: ${details}`
  );
}

export const env = parsedEnv.data;
