import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL in environment.");
}

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
