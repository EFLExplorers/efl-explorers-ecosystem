import { env } from "@/lib/env";

const parseBootstrapAllowlist = () => {
  const raw = env.CURRICULUM_BOOTSTRAP_ALLOWLIST ?? "";
  const emails = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return new Set(emails);
};

export const isBootstrapAllowlisted = (email: string) => {
  const allowlist = parseBootstrapAllowlist();
  return allowlist.has(email.trim().toLowerCase());
};
