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

const DEFAULT_TEACHER_EMAIL = "dev@example.com";
const DEFAULT_TEACHER_PASSWORD = "Password1!";
const DEFAULT_TEACHER_FIRST_NAME = "Dev";
const DEFAULT_TEACHER_LAST_NAME = "Teacher";

const DEFAULT_STUDENT_EMAIL = "student@example.com";
const DEFAULT_STUDENT_PASSWORD = "Password1!";
const DEFAULT_STUDENT_FIRST_NAME = "Demo";
const DEFAULT_STUDENT_LAST_NAME = "Student";
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? "10");

const normalizeEmail = (value) => value.trim().toLowerCase();

const getAccountConfig = () => {
  const teacherFirstName = (
    process.env.DEV_TEACHER_FIRST_NAME ?? DEFAULT_TEACHER_FIRST_NAME
  ).trim();
  const teacherLastName = (
    process.env.DEV_TEACHER_LAST_NAME ?? DEFAULT_TEACHER_LAST_NAME
  ).trim();
  const teacherComputedName = `${teacherFirstName} ${teacherLastName}`.trim();

  const studentFirstName = (
    process.env.DEV_STUDENT_FIRST_NAME ?? DEFAULT_STUDENT_FIRST_NAME
  ).trim();
  const studentLastName = (
    process.env.DEV_STUDENT_LAST_NAME ?? DEFAULT_STUDENT_LAST_NAME
  ).trim();
  const studentComputedName = `${studentFirstName} ${studentLastName}`.trim();

  return [
    {
      role: "teacher",
      email: normalizeEmail(
        process.env.DEV_TEACHER_EMAIL ??
          process.env.DEV_USER_EMAIL ??
          DEFAULT_TEACHER_EMAIL
      ),
      password:
        process.env.DEV_TEACHER_PASSWORD ??
        process.env.DEV_USER_PASSWORD ??
        DEFAULT_TEACHER_PASSWORD,
      firstName: teacherFirstName,
      lastName: teacherLastName,
      name:
        (process.env.DEV_TEACHER_NAME ??
          process.env.DEV_USER_NAME ??
          teacherComputedName) ||
        "Teacher",
      approved: true,
      loginPath: "/Auth/login/teacher",
      label: "Dev teacher user",
    },
    {
      role: "student",
      email: normalizeEmail(process.env.DEV_STUDENT_EMAIL ?? DEFAULT_STUDENT_EMAIL),
      password: process.env.DEV_STUDENT_PASSWORD ?? DEFAULT_STUDENT_PASSWORD,
      firstName: studentFirstName,
      lastName: studentLastName,
      name: (process.env.DEV_STUDENT_NAME ?? studentComputedName) || "Student",
      approved: true,
      loginPath: "/Auth/login/student",
      label: "Dev student user",
    },
  ];
};

async function run() {
  const accounts = getAccountConfig();

  for (const account of accounts) {
    if (typeof account.password !== "string" || account.password.length < 6) {
      throw new Error(
        `${account.role.toUpperCase()} password must be at least 6 characters.`
      );
    }

    const passwordHash = await hash(account.password, saltRounds);

    await prisma.user.upsert({
      where: { email: account.email },
      create: {
        email: account.email,
        passwordHash,
        role: account.role,
        approved: account.approved,
        firstName: account.firstName,
        lastName: account.lastName,
        name: account.name,
      },
      update: {
        passwordHash,
        approved: account.approved,
        firstName: account.firstName,
        lastName: account.lastName,
        name: account.name,
      },
    });

    console.log(`${account.label} seeded successfully.`);
    console.log("  Name:", account.name);
    console.log(`Log in on the landing page at ${account.loginPath} with:`);
    console.log("  Email:", account.email);
    console.log("  Password:", account.password);
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
