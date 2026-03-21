import { prisma } from "@repo/database";

import type { SchemaHealthCheck, SchemaHealthData } from "@/types/db-visualizer";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unknown database access error";
};

const runCheck = async (
  id: string,
  schema: SchemaHealthCheck["schema"],
  table: string,
  action: () => Promise<unknown>
): Promise<SchemaHealthCheck> => {
  try {
    await action();
    return {
      id,
      schema,
      table,
      status: "ok",
      message: "Read access confirmed",
    };
  } catch (error) {
    return {
      id,
      schema,
      table,
      status: "error",
      message: getErrorMessage(error),
    };
  }
};

export const getSchemaHealthData = async (): Promise<SchemaHealthData> => {
  const checks = await Promise.all([
    runCheck("shared-page", "shared", "pages", () =>
      prisma.page.findFirst({ select: { id: true } })
    ),
    runCheck("auth-user", "auth", "users", () =>
      prisma.user.findFirst({ select: { id: true } })
    ),
    runCheck("students-mapping", "students", "student_user_mappings", () =>
      prisma.studentUserMapping.findFirst({ select: { id: true } })
    ),
    runCheck("teachers-student", "teachers", "students", () =>
      prisma.student.findFirst({ select: { id: true } })
    ),
    runCheck("curriculum-level", "curriculum", "levels", () =>
      prisma.curriculumLevel.findFirst({ select: { id: true } })
    ),
  ]);

  const summary = checks.reduce(
    (accumulator, check) => {
      if (check.status === "ok") {
        accumulator.ok += 1;
      } else {
        accumulator.error += 1;
      }
      return accumulator;
    },
    { ok: 0, error: 0 }
  );

  return { checks, summary };
};
