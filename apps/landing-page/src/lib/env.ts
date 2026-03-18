import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_LANDING_PAGE_URL: z.string().url(),
  NEXT_PUBLIC_TEACHER_URL: z.string().url(),
  NEXT_PUBLIC_STUDENT_URL: z.string().url(),
  EFL_API_KEY: z.string().min(1).optional(),
  BCRYPT_SALT_ROUNDS: z.string().regex(/^\d+$/).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid landing-page environment variables: ${details}`);
}

export const env = parsedEnv.data;
export const bcryptSaltRounds = Number(env.BCRYPT_SALT_ROUNDS ?? "10");
