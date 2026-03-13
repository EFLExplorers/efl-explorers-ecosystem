import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use placeholder for prisma generate (build/CI) when env vars are not set.
// prisma generate does not connect to the DB; runtime requires real DATABASE_URL.
const databaseUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export const prismaConfig = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node ./scripts/seed-planetscale.js",
  },
  datasource: {
    url: databaseUrl,
  },
});

export default prismaConfig;
