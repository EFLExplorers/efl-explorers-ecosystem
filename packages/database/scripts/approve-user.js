/**
 * Approve a teacher user by email so they can log in.
 * Usage: node scripts/approve-user.js <email>
 * Example: node scripts/approve-user.js teacher@example.com
 */
const path = require("path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

config({ path: path.join(__dirname, "..", ".env") });

const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
if (!directUrl) {
  console.error("Missing DIRECT_URL or DATABASE_URL. Set one in packages/database/.env");
  process.exit(1);
}

const pool = new Pool({ connectionString: directUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const email = process.argv[2]?.trim()?.toLowerCase();
if (!email) {
  console.error("Usage: node scripts/approve-user.js <email>");
  process.exit(1);
}

async function run() {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  if (user.approved) {
    console.log(`User ${email} is already approved.`);
    await pool.end();
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { approved: true },
  });

  console.log(`Approved user: ${email} (${user.role})`);
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
