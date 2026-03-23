/**
 * Production / staging smoke checks for deployed apps.
 *
 * You cannot read Vercel env vars from the outside; this script only HTTP-checks
 * that each origin responds without 5xx (and not 404 on `/`), which catches many
 * misconfiguration and runtime errors after deploy.
 *
 * Usage (PowerShell example):
 *   $env:SMOKE_LANDING_URL="https://your-landing.vercel.app"
 *   $env:SMOKE_TEACHER_URL="https://your-teacher.vercel.app"
 *   ... (set any subset)
 *   pnpm smoke:prod
 *
 * Optional:
 *   SMOKE_TIMEOUT_MS=20000
 *   SMOKE_INSECURE=1   # allow http:// for local tunnels (default: warn on non-https in prod check)
 *
 * CI: inject the same URL secrets as env vars on the workflow, then run pnpm smoke:prod
 */

const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 20000);

/** @type {{ name: string, envVar: string }[]} */
const TARGETS = [
  { name: "landing-page", envVar: "SMOKE_LANDING_URL" },
  { name: "teacher-platform", envVar: "SMOKE_TEACHER_URL" },
  { name: "student-platform", envVar: "SMOKE_STUDENT_URL" },
  { name: "curriculum-platform", envVar: "SMOKE_CURRICULUM_URL" },
  { name: "db-visualizer", envVar: "SMOKE_DB_VISUALIZER_URL" },
  { name: "docs", envVar: "SMOKE_DOCS_URL" },
];

function normalizeBase(url) {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed || null;
}

function isHttps(url) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * @param {string} url
 * @returns {Promise<{ ok: boolean, status: number, error?: string }>}
 */
async function probeRoot(url) {
  const root = `${normalizeBase(url)}/`;
  try {
    const response = await fetch(root, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    const status = response.status;
    if (status >= 500) {
      return { ok: false, status, error: "server error" };
    }
    if (status === 404) {
      return { ok: false, status, error: "not found at /" };
    }
    return { ok: true, status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, error: message };
  }
}

async function main() {
  const active = TARGETS.filter((t) => {
    const raw = process.env[t.envVar];
    return typeof raw === "string" && raw.trim().length > 0;
  });

  if (active.length === 0) {
    console.error(
      "No SMOKE_*_URL variables set. Set at least one, for example:\n" +
        "  SMOKE_LANDING_URL=https://...\n" +
        "  SMOKE_CURRICULUM_URL=https://...\n" +
        "Then: pnpm smoke:prod",
    );
    process.exitCode = 1;
    return;
  }

  if (process.env.SMOKE_INSECURE !== "1") {
    for (const t of active) {
      const base = normalizeBase(process.env[t.envVar] ?? "");
      if (base && !isHttps(base)) {
        console.warn(
          `[warn] ${t.name}: ${t.envVar} is not https://. Set SMOKE_INSECURE=1 to silence (e.g. local tunnels).`,
        );
      }
    }
  }

  let failed = false;
  for (const t of active) {
    const base = normalizeBase(process.env[t.envVar] ?? "");
    if (!base) continue;
    process.stdout.write(`${t.name} (${base}) … `);
    const result = await probeRoot(base);
    if (result.ok) {
      console.log(`OK (${result.status})`);
    } else {
      failed = true;
      console.log(
        `FAIL${result.status ? ` (${result.status})` : ""}${result.error ? `: ${result.error}` : ""}`,
      );
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

await main();
