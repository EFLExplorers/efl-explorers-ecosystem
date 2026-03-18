import { z } from "zod";

const scoringSchema = z
  .object({
    passingScore: z.number().min(0).max(100).optional(),
    masteryThreshold: z.number().min(0).max(100).optional(),
  })
  .optional();

const reportingEventSchema = z.object({
  eventKey: z.string().trim().min(1).max(80),
  eventType: z.enum([
    "unit_started",
    "checkpoint_submitted",
    "checkpoint_passed",
    "checkpoint_failed",
    "unit_completed",
  ]),
  required: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export const assignmentConfigSchema = z.object({
  mode: z.enum(["self_paced", "teacher_led"]).default("self_paced"),
  dueDays: z.number().int().positive().max(365).optional(),
  maxAttempts: z.number().int().positive().max(20).optional(),
  estimatedMinutes: z.number().int().positive().max(600).optional(),
  scoring: scoringSchema,
  reporting: z
    .object({
      events: z.array(reportingEventSchema).default([]),
      emitUnitCompletion: z.boolean().default(true),
    })
    .default({ events: [], emitUnitCompletion: true }),
});

export type AssignmentConfig = z.infer<typeof assignmentConfigSchema>;

type LevelUnitForHooks = {
  id: number;
  slug: string;
  title: string;
  orderIndex: number;
  estimatedMinutes: number | null;
  assignmentConfig: unknown;
};

type HookBuildInput = {
  program: { id: number; slug: string; title: string };
  level: { id: number; slug: string; title: string };
  units: LevelUnitForHooks[];
  snapshotVersion?: number;
};

export const normalizeAssignmentConfig = (raw: unknown): AssignmentConfig => {
  const parsed = assignmentConfigSchema.parse(raw ?? {});
  return parsed;
};

export const validateAssignmentConfig = (raw: unknown) => {
  return assignmentConfigSchema.safeParse(raw ?? {});
};

export const buildAssignmentHooksPayload = (input: HookBuildInput) => {
  return {
    hookVersion: "2026-03-18",
    scope: "curriculum_level",
    program: input.program,
    level: input.level,
    snapshotVersion: input.snapshotVersion ?? null,
    generatedAt: new Date().toISOString(),
    assignments: input.units
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((unit) => {
        const config = normalizeAssignmentConfig(unit.assignmentConfig);
        return {
          unitId: unit.id,
          unitSlug: unit.slug,
          unitTitle: unit.title,
          orderIndex: unit.orderIndex,
          estimatedMinutes: unit.estimatedMinutes ?? config.estimatedMinutes ?? null,
          config,
        };
      }),
  };
};
