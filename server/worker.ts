import { readFile, mkdir, open, unlink, stat } from "node:fs/promises";
import { join } from "node:path";
import { Store } from "./cache.js";
import { syncGithub } from "./github.js";
import { profileSchema, syncTranscript } from "./transcript.js";
import { workerStatusSchema as statusSchema, retryStatus } from "./schedule.js";

const kind = process.argv[2];
if (kind !== "github" && kind !== "transcript")
  throw new Error("Choose github or transcript");
const store = new Store(process.env.DATA_DIR || "./data/local");
await mkdir(store.directory, { recursive: true, mode: 0o700 });
const lockPath = join(store.directory, `${kind}.lock`);
// A worker is bounded by systemd to 5 minutes. Recover an abandoned lock after 30.
if (
  await stat(lockPath)
    .then((s) => Date.now() - s.mtimeMs > 1800000)
    .catch(() => false)
)
  await unlink(lockPath);
const lock = await open(lockPath, "wx", 0o600).catch(() => null);
if (!lock) process.exit(0);
try {
  const status = await store.read(`${kind}-status.json`, statusSchema);
  if (status && Date.now() < status.nextAttempt) process.exitCode = 0;
  else if (
    kind === "transcript" &&
    (!process.env.FLEX_PARSER_CONFIG ||
      !process.env.FLEX_TRANSCRIPT_URL ||
      !process.env.FLEX_COOKIE)
  ) {
    await store.write(
      `${kind}-status.json`,
      { failures: 0, nextAttempt: 0, result: "pending-configuration" },
      statusSchema,
    );
    console.log("transcript: pending authorized configuration");
  } else {
    try {
      if (kind === "github")
        await syncGithub(store, fetch, Date.now(), process.env.GITHUB_TOKEN);
      else
        await syncTranscript(store, {
          url: process.env.FLEX_TRANSCRIPT_URL!,
          cookie: process.env.FLEX_COOKIE!,
          profile: profileSchema.parse(
            JSON.parse(await readFile(process.env.FLEX_PARSER_CONFIG!, "utf8")),
          ),
        });
      await store.write(
        `${kind}-status.json`,
        {
          failures: 0,
          nextAttempt: Date.now() + (kind === "github" ? 3600000 : 43200000),
          result: "ok",
        },
        statusSchema,
      );
      console.log(`${kind}: refreshed`);
    } catch {
      const failures = (status?.failures ?? 0) + 1;
      await store.write(
        `${kind}-status.json`,
        retryStatus(kind, failures, Date.now()),
        statusSchema,
      );
      // No upstream error text, HTML, request URLs, headers or identifiers are logged.
      console.error(
        `${kind}: refresh failed; last good data preserved; retry deferred`,
      );
      process.exitCode = 1;
    }
  }
} finally {
  await lock.close();
  await unlink(lockPath);
}
