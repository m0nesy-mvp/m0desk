import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const trackedFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  {
  encoding: "utf8",
  },
)
  .split("\0")
  .filter(Boolean);

const forbiddenNames = [
  /(^|\/)cookies(?:-[^/]+)?\.txt$/i,
  /\.cookies$/i,
  /(^|\/)\.env(?:\..+)?$/i,
];

const contentPatterns = [
  { name: "Supabase auth cookie", pattern: /sb-[a-z0-9]+-auth-token/i },
  { name: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: "Supabase service-role configuration",
    pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s$<{][^\s]*/i,
  },
];

const findings = [];

for (const file of trackedFiles) {
  if (!existsSync(file)) continue;

  const normalized = file.replaceAll("\\", "/");
  if (
    normalized !== ".env.example" &&
    forbiddenNames.some((pattern) => pattern.test(normalized))
  ) {
    findings.push(`${file}: forbidden credential/session filename`);
  }

  if (normalized === "scripts/check-secrets.mjs") continue;

  let content;
  try {
    content = readFileSync(path.resolve(file), "utf8");
  } catch {
    continue;
  }

  for (const { name, pattern } of contentPatterns) {
    if (pattern.test(content)) findings.push(`${file}: possible ${name}`);
  }
}

if (findings.length > 0) {
  console.error("Potential secrets found in tracked files:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Secret check passed (${trackedFiles.length} tracked files scanned).`);
