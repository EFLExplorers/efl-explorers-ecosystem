/**
 * Maps low-level driver/Prisma messages to operator-facing hints (esp. connection limits).
 */
export const toPublicDbErrorMessage = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  if (
    /53300|remaining connection slots are reserved|too many connections for role/i.test(
      message,
    )
  ) {
    return [
      "PostgreSQL refused the connection: the server has no free connection slots for this role.",
      "Fix: point DATABASE_URL at your host’s pooled connection (PgBouncer / Supabase pooler / Neon pooled / etc.),",
      "and/or set DATABASE_POOL_MAX to a small number per instance (often 1–5 for serverless).",
      "See docs/operations.md (PostgreSQL connection limits).",
    ].join(" ");
  }
  return message;
};
