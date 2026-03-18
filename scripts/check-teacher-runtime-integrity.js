const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();
const dashboardDir = path.join(
  repoRoot,
  "apps",
  "teacher-platform",
  "src",
  "pages",
  "dashboard"
);

const fileNames = [
  "messages.tsx",
  "bookmarks.tsx",
  "materials.tsx",
  "reports.tsx",
];

const checks = [
  {
    name: "Synthetic modulo logic",
    regex: /\bid\s*%/g,
  },
  {
    name: "Hardcoded demo contact names",
    regex: /\b(Sarah Wilson|Robert Miller)\b/g,
  },
  {
    name: "Hardcoded user id assignment",
    regex: /\bcurrentUserId\s*=\s*1\b/g,
  },
  {
    name: "Runtime mock markers",
    regex: /\bmock\b/gi,
  },
];

const findings = [];

for (const fileName of fileNames) {
  const filePath = path.join(dashboardDir, fileName);
  const content = fs.readFileSync(filePath, "utf8");

  for (const check of checks) {
    const matches = [...content.matchAll(check.regex)];
    for (const match of matches) {
      const index = match.index ?? 0;
      const line = content.slice(0, index).split("\n").length;
      findings.push({
        file: path.relative(repoRoot, filePath),
        line,
        check: check.name,
        snippet: match[0],
      });
    }
  }
}

if (findings.length > 0) {
  console.error("Teacher runtime integrity check failed:");
  for (const finding of findings) {
    console.error(
      `- ${finding.file}:${finding.line} [${finding.check}] => "${finding.snippet}"`
    );
  }
  process.exit(1);
}

console.log("Teacher runtime integrity check passed.");
