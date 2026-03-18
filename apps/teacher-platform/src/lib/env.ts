import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_LANDING_PAGE_URL: z.string().url(),
  CURRICULUM_PLATFORM_URL: z.string().url().optional(),
  CURRICULUM_API_SHARED_SECRET: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid teacher-platform environment variables: ${details}`);
}

const authSecret = parsedEnv.data.NEXTAUTH_SECRET ?? parsedEnv.data.AUTH_SECRET;

if (!authSecret) {
  throw new Error(
    "Invalid teacher-platform environment variables: NEXTAUTH_SECRET (or AUTH_SECRET) is required"
  );
}

export const env = {
  ...parsedEnv.data,
  AUTH_SECRET: authSecret,
};
