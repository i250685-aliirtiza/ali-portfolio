import { readFile } from "node:fs/promises";
import { Store } from "./cache.js";
import { parseFlexTranscript } from "./flex-parser.js";
import { transcriptCacheSchema } from "../shared/contracts.js";

// Owner-provided local capture only. Does not assert authenticated/live provenance.
const path = process.argv[2];
if (!path) throw new Error("A private capture file path is required");
try {
  const store = new Store(process.env.DATA_DIR || "./data/local");
  const data = parseFlexTranscript(await readFile(path, "utf8"));
  await store.write(
    "transcript.json",
    {
      data,
      lastSuccessfulSync: new Date().toISOString(),
      source: "owner-capture",
    },
    transcriptCacheSchema,
  );
  console.log(
    `Imported owner-provided record: ${data.semesters.length} semesters. Live synchronization not verified.`,
  );
} catch {
  console.error("Capture import rejected; last good record preserved");
  process.exitCode = 1;
}
