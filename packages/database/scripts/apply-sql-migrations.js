const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { config } = require("dotenv");
const { Pool } = require("pg");

config({ path: path.join(__dirname, "..", ".env") });

const dbDir = path.join(__dirname, "..", "db");
const migrationNamePattern = /^\d{8}_[a-z0-9_]+\.sql$/i;

/** When set, checksum mismatches on already-applied files UPDATE the row only (never re-run SQL). Use once after CRLF/LF or metadata drift — not if migration SQL meaningfully changed. */
const repairChecksums =
  process.argv.includes("--repair-checksums") ||
  process.env.SQL_MIGRATIONS_REPAIR_CHECKSUMS === "1";

const getConnectionString = () =>
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

const isPostgresUrl = (value) => /^postgres(ql)?:/i.test(value ?? "");

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

const getChecksum = (contents) =>
  crypto.createHash("sha256").update(contents).digest("hex");

/** LF-normalized SQL so checksums match across Windows (CRLF) and Unix (LF) checkouts. */
const normalizeSql = (contents) =>
  contents.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const ensureMigrationTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.manual_sql_migrations (
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const getMigrationFiles = async () => {
  const entries = await fs.readdir(dbDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && migrationNamePattern.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

const run = async () => {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL.");
  }
  if (!isPostgresUrl(connectionString)) {
    throw new Error("Expected a Postgres connection string for SQL migrations.");
  }

  const pool = new Pool({
    connectionString: sanitizePostgresConnectionString(connectionString),
    max: 1,
  });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await ensureMigrationTable(client);
    await client.query("COMMIT");

    const files = await getMigrationFiles();
    if (files.length === 0) {
      console.log("No SQL migration files found.");
      return;
    }

    for (const fileName of files) {
      const fullPath = path.join(dbDir, fileName);
      const raw = await fs.readFile(fullPath, "utf-8");
      const sql = normalizeSql(raw);
      const checksum = getChecksum(sql);

      await client.query("BEGIN");
      const existing = await client.query(
        "SELECT checksum FROM public.manual_sql_migrations WHERE name = $1",
        [fileName]
      );

      if (existing.rowCount && existing.rows[0].checksum !== checksum) {
        if (repairChecksums) {
          console.warn(
            `[repair-checksums] Updating stored hash for ${fileName} (migration SQL is not re-executed).`
          );
          await client.query(
            "UPDATE public.manual_sql_migrations SET checksum = $2 WHERE name = $1",
            [fileName, checksum]
          );
          await client.query("COMMIT");
          continue;
        }
        throw new Error(
          `Checksum mismatch for already-applied migration ${fileName}. ` +
            `If the database already matches this file (e.g. line-ending drift), run once: ` +
            `pnpm db:repair-sql-migration-checksums`
        );
      }

      if (existing.rowCount) {
        console.log(`Skipping ${fileName} (already applied).`);
        await client.query("COMMIT");
        continue;
      }

      await client.query(sql);
      await client.query(
        "INSERT INTO public.manual_sql_migrations (name, checksum) VALUES ($1, $2)",
        [fileName, checksum]
      );
      await client.query("COMMIT");
      console.log(`Applied ${fileName}`);
    }
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

run()
  .catch((error) => {
    console.error("SQL migration run failed:", error);
    process.exit(1);
  });
