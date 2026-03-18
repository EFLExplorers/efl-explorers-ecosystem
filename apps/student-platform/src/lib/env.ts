import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXT_PUBLIC_LANDING_PAGE_URL: z.string().url(),
  CURRICULUM_PLATFORM_URL: z.string().url(),
  CURRICULUM_API_SHARED_SECRET: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid student-platform environment variables: ${details}`);
}

export const env = parsedEnv.data;
