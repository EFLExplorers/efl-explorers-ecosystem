const path = require("path");
const { config } = require("dotenv");
const { hash } = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

config({ path: path.join(__dirname, "..", ".env") });

const getDirectDatabaseUrl = () =>
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

const isPostgresUrl = (url) => /^postgres(ql)?:/i.test(url ?? "");

const sanitizePostgresConnectionString = (connectionString) => {
  try {
    const parsed = new URL(connectionString);
    ["sslcert", "sslkey", "sslrootcert", "sslcrl"].forEach((param) => {
      const value = parsed.searchParams.get(param)?.trim().toLowerCase();
      if (value === "system") {
        parsed.searchParams.delete(param);
      }
    });
    return parsed.toString();
  } catch {
    return connectionString;
  }
};

const directUrl = getDirectDatabaseUrl();
if (!directUrl) {
  throw new Error(
    "Missing DIRECT_URL or DATABASE_URL. Set one in packages/database/.env (or root .env)."
  );
}

if (!isPostgresUrl(directUrl)) {
  throw new Error(
    "seed-curriculum-manager requires a Postgres connection string (DIRECT_URL or DATABASE_URL)."
  );
}

const pool = new Pool({
  connectionString: sanitizePostgresConnectionString(directUrl),
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEFAULT_MANAGER_EMAIL = "curriculum.manager@example.com";
const DEFAULT_MANAGER_PASSWORD = "Password1!";
const DEFAULT_MANAGER_NAME = "Curriculum Manager";
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? "10");

const normalizeEmail = (value) => value.trim().toLowerCase();

const manager = {
  email: normalizeEmail(
    process.env.CURRICULUM_MANAGER_EMAIL ?? DEFAULT_MANAGER_EMAIL
  ),
  password: process.env.CURRICULUM_MANAGER_PASSWORD ?? DEFAULT_MANAGER_PASSWORD,
  name: (process.env.CURRICULUM_MANAGER_NAME ?? DEFAULT_MANAGER_NAME).trim(),
};

async function run() {
  if (typeof manager.password !== "string" || manager.password.length < 8) {
    throw new Error("CURRICULUM_MANAGER_PASSWORD must be at least 8 characters.");
  }

  if (!manager.name) {
    throw new Error("CURRICULUM_MANAGER_NAME cannot be empty.");
  }

  const passwordHash = await hash(manager.password, saltRounds);

  const result = await prisma.curriculumManager.upsert({
    where: { email: manager.email },
    create: {
      email: manager.email,
      name: manager.name,
      passwordHash,
      isActive: true,
    },
    update: {
      name: manager.name,
      passwordHash,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log("Curriculum manager seeded successfully.");
  console.log("  ID:", result.id);
  console.log("  Name:", result.name);
  console.log("  Email:", result.email);
  console.log("  Active:", result.isActive);
  console.log("Log in on the curriculum platform at /login with:");
  console.log("  Email:", manager.email);
  console.log("  Password:", manager.password);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
