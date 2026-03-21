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
  /* Sequential: avoids N concurrent checkouts against a tiny pool (53300 on shared Postgres). */
  const checks = [
    await runCheck("shared-page", "shared", "pages", () =>
      prisma.page.findFirst({ select: { id: true } })
    ),
    await runCheck("auth-user", "auth", "users", () =>
      prisma.user.findFirst({ select: { id: true } })
    ),
    await runCheck("students-mapping", "students", "student_user_mappings", () =>
      prisma.studentUserMapping.findFirst({ select: { id: true } })
    ),
    await runCheck("teachers-student", "teachers", "students", () =>
      prisma.student.findFirst({ select: { id: true } })
    ),
    await runCheck("curriculum-level", "curriculum", "levels", () =>
      prisma.curriculumLevel.findFirst({ select: { id: true } })
    ),
  ];

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
