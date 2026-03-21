import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(scriptDir, "..", ".env"), override: true });

const normalizeEmail = (value: string) => value.trim().toLowerCase();

async function main() {
  const [{ hash }, { prisma }] = await Promise.all([
    import("bcryptjs"),
    import("../src/index"),
  ]);

  const emailRaw =
    process.env.CURRICULUM_SEED_ADMIN_EMAIL ??
    process.env.CURRICULUM_MANAGER_EMAIL;
  const password =
    process.env.CURRICULUM_SEED_ADMIN_PASSWORD ??
    process.env.CURRICULUM_MANAGER_PASSWORD;
  const nameRaw =
    process.env.CURRICULUM_SEED_ADMIN_NAME ??
    process.env.CURRICULUM_MANAGER_NAME ??
    "Curriculum Admin";

  if (!emailRaw?.trim()) {
    throw new Error(
      "Set CURRICULUM_SEED_ADMIN_EMAIL (or CURRICULUM_MANAGER_EMAIL) to your manager email before running this seed."
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    throw new Error(
      "Set CURRICULUM_SEED_ADMIN_PASSWORD (or CURRICULUM_MANAGER_PASSWORD) to a temporary password of at least 8 characters."
    );
  }

  const email = normalizeEmail(emailRaw);
  const name = nameRaw.trim();
  if (!name) {
    throw new Error("CURRICULUM_SEED_ADMIN_NAME cannot be empty.");
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? "10");
  const passwordHash = await hash(password, saltRounds);

  const result = await prisma.curriculumManager.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      isActive: true,
    },
    update: {
      name,
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

  console.log("Curriculum manager (admin) seed complete.");
  console.log("  ID:", result.id);
  console.log("  Name:", result.name);
  console.log("  Email:", result.email);
  console.log("  Active:", result.isActive);
  console.log("Sign in at the curriculum platform /login with the seeded email and password.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
