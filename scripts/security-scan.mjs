import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const signatures = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  [
    "GitHub credential",
    /\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  ],
  ["AWS key", /\bAKIA[A-Z0-9]{16}\b/],
  ["session value", /ASP\.NET_SessionId=[a-z0-9]{20,}/i],
  ["JWT", /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/],
  [
    "configured password",
    /(?:SMTP_PASSWORD|SMTP_PASS|FLEX_COOKIE|GITHUB_TOKEN)[ \t]*=[ \t]*["']?[A-Za-z0-9_+\/-]{16,}/,
  ],
];
const problems = [];
function scan(content, label) {
  for (const [name, pattern] of signatures)
    if (pattern.test(content)) problems.push(`${label}: ${name}`);
}
for (const path of tracked) {
  if (
    /(?:^|\/)(?:\.env(?!\.example$)|captures|operator|data\/(?!fixtures))|\.(?:pem|key|sqlite|db|log|bak)$/.test(
      path,
    )
  )
    problems.push(`${path}: prohibited tracked path`);
  scan(await readFile(path, "utf8"), path);
}
try {
  const objects = execFileSync("git", ["rev-list", "--objects", "--all"], {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);
  for (const line of objects) {
    const [sha] = line.split(" ");
    if (
      execFileSync("git", ["cat-file", "-t", sha], {
        encoding: "utf8",
      }).trim() === "blob"
    )
      scan(
        execFileSync("git", ["cat-file", "blob", sha], { encoding: "utf8" }),
        `history blob ${sha}`,
      );
  }
} catch {
  problems.push("Git history could not be scanned; refusing a clean result.");
}
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) await walk(path);
    else if (/\.(js|css|html|json|txt)$/.test(path)) {
      const value = await readFile(path, "utf8");
      scan(value, path);
      if (
        /FLEX_COOKIE|GITHUB_TOKEN|FLEX_TRANSCRIPT_URL|ASP\.NET_SessionId|SYNTHETIC-PRIVATE-ID|studentId|feeInfo|parser-profile\.json/.test(
          value,
        )
      )
        problems.push(`${path}: private/server-only marker in public output`);
    }
  }
}
await walk("dist");
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Security scan passed: ${tracked.length} tracked files, history blobs and compiled public text assets. No matching secrets or private payload markers.`,
  );
