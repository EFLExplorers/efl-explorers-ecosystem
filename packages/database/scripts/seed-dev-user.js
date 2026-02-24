const path = require("path");
const { config } = require("dotenv");
const { hash } = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// Load .env from package root so DATABASE_URL / DIRECT_URL are set when run from repo root or packages/database
config({ path: path.join(__dirname, "..", ".env") });

const getDirectDatabaseUrl = () =>
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

const isPostgresUrl = (url) => /^postgres(ql)?:/i.test(url ?? "");

const directUrl = getDirectDatabaseUrl();
if (!directUrl) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL. Set one in packages/database/.env (or root .env).");
}

if (!isPostgresUrl(directUrl)) {
  throw new Error(
    "seed-dev-user requires a Postgres connection string (DIRECT_URL or DATABASE_URL)."
  );
}

const pool = new Pool({ connectionString: directUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEFAULT_EMAIL = "dev@example.com";
const DEFAULT_PASSWORD = "Password1!";
const DEFAULT_FIRST_NAME = "Dev";
const DEFAULT_LAST_NAME = "Teacher";
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? "10");

async function run() {
  const email = (process.env.DEV_USER_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();
  const password = process.env.DEV_USER_PASSWORD ?? DEFAULT_PASSWORD;

  if (typeof password !== "string" || password.length < 6) {
    throw new Error("DEV_USER_PASSWORD (or default) must be at least 6 characters.");
  }

  const passwordHash = await hash(password, saltRounds);
  const firstName = (process.env.DEV_USER_FIRST_NAME ?? DEFAULT_FIRST_NAME).trim();
  const lastName = (process.env.DEV_USER_LAST_NAME ?? DEFAULT_LAST_NAME).trim();
  const computedName = `${firstName} ${lastName}`.trim();
  const name = (process.env.DEV_USER_NAME ?? computedName).trim() || "Teacher";

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: "teacher",
      approved: true,
      firstName,
      lastName,
      name,
    },
    update: {
      passwordHash,
      approved: true,
      firstName,
      lastName,
      name,
    },
  });

  console.log("Dev teacher user seeded successfully.");
  console.log("  Name:", name);
  console.log("Log in on the landing page at /Auth/login/teacher with:");
  console.log("  Email:", email);
  console.log("  Password:", password);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
