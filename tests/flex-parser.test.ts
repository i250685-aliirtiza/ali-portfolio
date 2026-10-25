import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load } from "cheerio";
import { parseFlexTranscript } from "../server/flex-parser.js";
import { syncTranscript, academicsView } from "../server/transcript.js";
import { Store } from "../server/cache.js";
import { academicFields, transcriptCacheSchema } from "../shared/contracts.js";

const synthetic = await readFile(
  new URL("./fixtures/flex-synthetic.html", import.meta.url),
  "utf8",
);
const sources = [
  { name: "synthetic reviewed FLEX structure", html: synthetic },
];
// The real owner capture remains OUTSIDE Git. Run this gate locally with an explicit path.
if (process.env.TRANSCRIPT_CAPTURE_PATH)
  sources.push({
    name: "authorized external redacted capture",
    html: await readFile(process.env.TRANSCRIPT_CAPTURE_PATH, "utf8"),
  });
let store: Store;
beforeEach(async () => {
  store = new Store(await mkdtemp(join(tmpdir(), "portfolio-flex-")));
});
afterEach(async () => {
  await rm(store.directory, { recursive: true, force: true });
});
const config = {
  url: "https://flexstudent.nu.edu.pk/Student/Transcript",
  cookie: "test_session=synthetic",
};
const response = (body: string, status = 200) =>
  (async () =>
    new Response(body, {
      status,
      headers: { "content-type": "text/html" },
    })) as typeof fetch;

describe.each(sources)("$name", ({ html }) => {
  it("extracts every course and all source GPAs, with chronological terms", () => {
    const data = parseFlexTranscript(html);
    const $ = load(html);
    expect(data.semesters).toHaveLength(3);
    expect(data.semesters.map((s) => s.courses.length)).toEqual([9, 8, 9]);
    const sourceRows = $("tbody tr")
      .toArray()
      .map((r) =>
        $(r)
          .children("td")
          .map((_, c) => $(c).text().trim())
          .get(),
      );
    const courses = data.semesters.flatMap((s) => s.courses);
    expect(
      courses.map((c) => [c.code, c.title, String(c.credits), c.grade]),
    ).toEqual(sourceRows.map((r) => [r[0], r[1], r[3], r[4]]));
    expect(data.semesters[2].status).toBe("in-progress");
    expect(data.semesters[2].sgpa).toBeNull();
    expect(data.semesters[2].courses.every((c) => c.grade === "I")).toBe(true);
    expect(data.cgpa).toBe(data.semesters[2].cgpa);
    expect(
      data.semesters
        .slice(0, 2)
        .every((s) => s.status === "completed" && s.sgpa! > 0),
    ).toBe(true);
  });
  it("keeps owner-capture provenance honest until an authenticated success", async () => {
    const stamp = new Date().toISOString();
    await store.write(
      "transcript.json",
      {
        data: parseFlexTranscript(html),
        lastSuccessfulSync: stamp,
        source: "owner-capture",
      },
      transcriptCacheSchema,
    );
    const policy = { enabled: true, fields: [...academicFields] };
    const imported = await academicsView(store, policy);
    expect(imported.provenance).toBe("owner-provided");
    expect(imported.lastSuccessfulSync).toBeNull();
    expect(imported.recordImportedAt).toBe(stamp);
    await syncTranscript(store, config, response(html));
    const synced = await academicsView(store, policy);
    expect(synced.provenance).toBe("verified");
    expect(synced.lastSuccessfulSync).not.toBeNull();
    expect(synced.recordImportedAt).toBeUndefined();
    expect(JSON.stringify(synced)).not.toMatch(
      /cookie|studentId|Section|Remarks|Points|rawHtml/,
    );
  });
  it("rejects a well-formed response that silently loses a previously saved course", async () => {
    const saved = await syncTranscript(store, config, response(html));
    const $ = load(html);
    $("tbody tr").first().remove();
    await expect(
      syncTranscript(store, config, response($.html())),
    ).rejects.toThrow();
    expect(await store.read("transcript.json", transcriptCacheSchema)).toEqual(
      saved,
    );
  });
  it.each([401, 403, 302, 500])(
    "preserves last good on HTTP %i",
    async (status) => {
      const saved = await syncTranscript(store, config, response(html));
      await expect(
        syncTranscript(store, config, response("", status)),
      ).rejects.toThrow();
      expect(
        await store.read("transcript.json", transcriptCacheSchema),
      ).toEqual(saved);
    },
  );
  it("rejects login, challenges, missing columns, duplicate semesters, and truncated tables", async () => {
    const saved = await syncTranscript(store, config, response(html));
    const $ = load(html);
    const first = $("h5").first().text();
    const second = $("h5").eq(1).text();
    const bad = [
      html + '<input type="password">',
      "<p>cf-turnstile</p>",
      html.replace("CrdHrs", "Credit???"),
      html.replace(second, first),
      html.slice(0, html.lastIndexOf("</table>")),
    ];
    for (const body of bad)
      await expect(
        syncTranscript(store, config, response(body)),
      ).rejects.toThrow();
    expect(await store.read("transcript.json", transcriptCacheSchema)).toEqual(
      saved,
    );
  });
});
it("retains an authentic zero SGPA for a completed term", () => {
  const $ = load(synthetic);
  $(".pull-right")
    .first()
    .children("span")
    .filter((_, e) => $(e).text().startsWith("SGPA:"))
    .text("SGPA:0");
  expect(parseFlexTranscript($.html()).semesters[0].sgpa).toBe(0);
});
it("rejects captured query parameters for the built-in collector", async () => {
  await expect(
    syncTranscript(
      store,
      { ...config, url: config.url + "?dump=example" },
      response(synthetic),
    ),
  ).rejects.toThrow();
});
