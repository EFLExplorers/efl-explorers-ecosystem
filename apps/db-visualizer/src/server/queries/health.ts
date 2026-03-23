import { prisma } from "@repo/database";
import type { Prisma } from "@repo/database";

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
  action: () => Promise<unknown>,
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

type HealthTx = Prisma.TransactionClient;

export const getSchemaHealthData = async (): Promise<SchemaHealthData> => {
  /* One transaction = one backend session for all checks (reduces 53300 pressure on tiny pools). */
  return prisma.$transaction(async (tx: HealthTx) => {
    const checks = [
      await runCheck("shared-page", "shared", "pages", () =>
        tx.page.findFirst({ select: { id: true } }),
      ),
      await runCheck("auth-user", "auth", "users", () =>
        tx.user.findFirst({ select: { id: true } }),
      ),
      await runCheck("students-mapping", "students", "student_user_mappings", () =>
        tx.studentUserMapping.findFirst({ select: { id: true } }),
      ),
      await runCheck("teachers-student", "teachers", "students", () =>
        tx.student.findFirst({ select: { id: true } }),
      ),
      await runCheck("curriculum-level", "curriculum", "levels", () =>
        tx.curriculumLevel.findFirst({ select: { id: true } }),
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
      { ok: 0, error: 0 },
    );

    return { checks, summary };
  });
};
