export const parsePrismaJson = <T = Record<string, any>>(
  value: unknown
): T | null => {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      const normalized = value.trim().replace(/::jsonb?$/i, "");
      const unwrapped =
        normalized.startsWith("'") && normalized.endsWith("'")
          ? normalized.slice(1, -1).replace(/''/g, "'")
          : normalized;
      return JSON.parse(unwrapped) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") {
    return value as T;
  }
  return null;
};
