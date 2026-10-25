import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { Store } from "../server/cache.js";
import { syncGithub, projectsView, githubTTL } from "../server/github.js";
import {
  parseTranscript,
  syncTranscript,
  academicsView,
  publicationPolicy,
} from "../server/transcript.js";
import {
  academicFields,
  academicsSchema,
  projectsSchema,
  transcriptCacheSchema,
  owner,
} from "../shared/contracts.js";
import { createApi } from "../server/api.js";
import { html, profile } from "./fixtures.js";
import { retryStatus, workerStatusSchema } from "../server/schedule.js";

let store: Store;
const now = Date.parse("2026-10-25T09:00:00Z");
const fake = (value: unknown, status = 200, type = "application/json") =>
  (async () =>
    new Response(typeof value === "string" ? value : JSON.stringify(value), {
      status,
      headers: { "content-type": type },
    })) as typeof fetch;
const repo = (name = "FLEX-WATCHER", extras = {}) => ({
  name,
  description: "Public tool",
  html_url: `https://github.com/${owner}/${name}`,
  language: "JavaScript",
  updated_at: new Date(now).toISOString(),
  private: false,
  fork: false,
  archived: false,
  size: 12,
  owner: { login: owner },
  ...extras,
});
const settings = {
  url: "https://flexstudent.nu.edu.pk/authorized-example",
  cookie: "test_session=synthetic",
  profile,
};
beforeEach(async () => {
  store = new Store(await mkdtemp(join(tmpdir(), "portfolio-test-")));
});
afterEach(async () => {
  await rm(store.directory, { recursive: true, force: true });
});

describe("GitHub refresh", () => {
  it("filters private, fork, archived, empty and wrong-owner repositories and curates order", async () => {
    const value = await syncGithub(
      store,
      fake([
        repo("Other"),
        repo("CP-WATCHER"),
        repo(),
        repo("Secret", { private: true }),
        repo("Fork", { fork: true }),
        repo("Old", { archived: true }),
        repo("Empty", { size: 0 }),
        repo("Wrong", { owner: { login: "someone-else" } }),
      ]),
      now,
    );
    expect(value.projects.map((r) => r.name)).toEqual([
      "FLEX-WATCHER",
      "CP-WATCHER",
      "Other",
    ]);
    expect(value.stale).toBe(false);
  });
  it("reuses a fresh cache without a network call", async () => {
    await syncGithub(store, fake([repo()]), now);
    const result = await syncGithub(
      store,
      (() => {
        throw new Error("network must not run");
      }) as typeof fetch,
      now + 10,
    );
    expect(result.projects).toHaveLength(1);
  });
  it.each([403, 404, 429, 500])(
    "preserves the cache on HTTP %i",
    async (status) => {
      const saved = await syncGithub(store, fake([repo()]), now);
      await expect(
        syncGithub(store, fake({}, status), now + githubTTL * 3),
      ).rejects.toThrow();
      expect(await store.read("github.json", projectsSchema)).toEqual(saved);
      expect((await projectsView(store, now + githubTTL * 3)).stale).toBe(true);
    },
  );
  it("preserves cache for invalid data and timeouts", async () => {
    const saved = await syncGithub(store, fake([repo()]), now);
    await expect(
      syncGithub(store, fake([{ invalid: true }]), now + githubTTL * 3),
    ).rejects.toThrow();
    await expect(
      syncGithub(
        store,
        (async () => {
          throw new DOMException("Timeout", "TimeoutError");
        }) as typeof fetch,
        now + githubTTL * 3,
      ),
    ).rejects.toThrow();
    expect(await store.read("github.json", projectsSchema)).toEqual(saved);
  });
  it("removes deleted repositories on a successful refresh and handles missing descriptions", async () => {
    await syncGithub(store, fake([repo()]), now);
    const value = await syncGithub(
      store,
      fake([repo("Other", { description: null, language: null })]),
      now + githubTTL * 3,
    );
    expect(value.projects.map((p) => p.name)).toEqual(["Other"]);
    expect(value.projects[0].description).toBeNull();
  });
  it("does not follow untrusted links or send the token outside the fixed API", async () => {
    await syncGithub(
      store,
      (async (url, init) => {
        expect(String(url)).toMatch(
          /^https:\/\/api.github.com\/users\/i250685-aliirtiza\/repos\?/,
        );
        expect(init?.redirect).toBe("error");
        return new Response(JSON.stringify([repo()]));
      }) as typeof fetch,
      now,
      "synthetic",
    );
  });
  it("paginates without losing projects", async () => {
    let calls = 0;
    const result = await syncGithub(
      store,
      (async () =>
        new Response(
          JSON.stringify(
            ++calls === 1
              ? Array.from({ length: 100 }, (_, i) => repo(`Repo-${i}`))
              : [repo()],
          ),
        )) as typeof fetch,
      now,
    );
    expect(calls).toBe(2);
    expect(result.projects).toHaveLength(101);
  });
});
describe("transcript parser and privacy", () => {
  it("parses multi-term synthetic final grades in source order without computing GPA", () => {
    const result = parseTranscript(html, profile);
    expect(result.cgpa).toBe(2.7);
    expect(result.semesters.map((s) => s.order)).toEqual([1, 2]);
    expect(result.semesters.map((s) => s.sgpa)).toEqual([2.5, 2.9]);
    expect(result.semesters[1].courses[1].grade).toBe("W");
  });
  it("supports a second explicitly mapped synthetic format", () => {
    const alternate = html
      .replaceAll('class="semester"', 'class="term"')
      .replaceAll('class="cgpa"', 'class="aggregate"');
    expect(
      parseTranscript(alternate, {
        ...profile,
        semester: ".term",
        cgpa: ".aggregate",
      }).semesters,
    ).toHaveLength(2);
  });
  it.each([
    '<input type="password">',
    "<p>cf-turnstile</p>",
    "<p>Assessment marks only</p>",
  ])("rejects unauthenticated/unrecognized HTML", (bad) => {
    expect(() => parseTranscript(bad, profile)).toThrow();
  });
  it("rejects truncated, ambiguous, duplicate, numeric-junk, empty or changed markup", () => {
    for (const bad of [
      html.slice(0, html.indexOf("</section>")),
      html.replace("2.70", "2.70oops"),
      html.replace('data-order="2"', 'data-order="1"'),
      html.replace('class="cgpa"', 'class="new-cgpa"'),
      html.replace(
        '<p class="cgpa">2.70</p>',
        '<p class="cgpa">2.70</p><p class="cgpa">2.70</p>',
      ),
      html.replace("TEST203", "TEST202"),
    ])
      expect(() => parseTranscript(bad, profile)).toThrow();
  });
  it("keeps incomplete/withdrawn grades, nullable SGPA, optional credits", () => {
    const result = parseTranscript(
      html.replace("2.90", "-").replace(">B<", ">I<"),
      { ...profile, credits: undefined },
    );
    expect(result.semesters[1].sgpa).toBeNull();
    expect(result.semesters[1].courses[0].grade).toBe("I");
    expect(result.semesters[1].courses[0].credits).toBeUndefined();
  });
  it("publishes no details by default, and only selected fields after approval", async () => {
    await syncTranscript(store, settings, fake(html, 200, "text/html"), now);
    const off = await academicsView(
      store,
      { enabled: false, fields: [...academicFields] },
      now,
    );
    expect(off.cgpa).toBe(2.43);
    expect(off.semesters).toEqual([]);
    const result = await academicsView(
      store,
      { enabled: true, fields: ["cgpa", "semesterLabel", "grade"] },
      now,
    );
    expect(result.cgpa).toBe(2.7);
    expect(result.semesters[0].courses[0]).toEqual({ grade: "C+" });
    expect(JSON.stringify(result)).not.toMatch(
      /TEST101|Synthetic Foundations|test_session|evidenceSha256/,
    );
  });
  it("strips extraneous private fields at the schema boundary", async () => {
    const data = {
      ...parseTranscript(html, profile),
      studentId: "SYNTHETIC-PRIVATE-ID",
      fees: "SYNTHETIC-FEES",
      cookie: "SYNTHETIC-COOKIE",
    };
    await store.write(
      "transcript.json",
      { data, lastSuccessfulSync: new Date(now).toISOString() },
      transcriptCacheSchema,
    );
    const result = await academicsView(
      store,
      { enabled: true, fields: [...academicFields] },
      now,
    );
    expect(JSON.stringify(result)).not.toMatch(
      /PRIVATE-ID|FEES|COOKIE|studentId|cookie/,
    );
  });
  it.each([401, 403, 302, 500])(
    "keeps last good transcript and timestamp on HTTP %i",
    async (status) => {
      const saved = await syncTranscript(
        store,
        settings,
        fake(html, 200, "text/html"),
        now,
      );
      await expect(
        syncTranscript(
          store,
          settings,
          fake("", status, "text/html"),
          now + 99999999,
        ),
      ).rejects.toThrow();
      expect(
        await store.read("transcript.json", transcriptCacheSchema),
      ).toEqual(saved);
      expect(
        (
          await academicsView(
            store,
            { enabled: true, fields: [...academicFields] },
            now + 99999999,
          )
        ).stale,
      ).toBe(true);
    },
  );
  it("keeps last good on login HTML, changed DOM, timeout and wrong content type", async () => {
    const saved = await syncTranscript(
      store,
      settings,
      fake(html, 200, "text/html"),
      now,
    );
    for (const fetcher of [
      fake('<input type="password">', 200, "text/html"),
      fake("<p>changed</p>", 200, "text/html"),
      fake(html),
      (async () => {
        throw new Error("timeout");
      }) as typeof fetch,
    ])
      await expect(
        syncTranscript(store, settings, fetcher, now + 99999999),
      ).rejects.toThrow();
    expect(await store.read("transcript.json", transcriptCacheSchema)).toEqual(
      saved,
    );
  });
  it("retains script-like course text as text without executing anything", () => {
    expect(
      parseTranscript(
        html.replace(
          "Synthetic Foundations",
          "&lt;script&gt;alert(1)&lt;/script&gt;",
        ),
        profile,
      ).semesters[0].courses[0].title,
    ).toBe("<script>alert(1)</script>");
  });
  it.each([
    "http://flexstudent.nu.edu.pk/example",
    "https://evil.example/",
    "https://flexstudent.nu.edu.pk@evil.example/",
    "https://flexstudent.nu.edu.pk/Student/StudentMarks",
  ])("refuses unsafe endpoint %s", async (url) => {
    await expect(
      syncTranscript(
        store,
        { ...settings, url },
        fake(html, 200, "text/html"),
        now,
      ),
    ).rejects.toThrow();
  });
  it("rejects unknown publication fields", () => {
    expect(() =>
      publicationPolicy({ PUBLIC_ACADEMIC_FIELDS: "studentId" }),
    ).toThrow();
  });
});
describe("storage and public HTTP boundary", () => {
  it("applies low-frequency bounded backoff and reports a failed recent refresh as saved", async () => {
    expect(retryStatus("transcript", 1, now).nextAttempt).toBe(now + 43200000);
    expect(retryStatus("transcript", 20, now).nextAttempt).toBe(
      now + 172800000,
    );
    expect(retryStatus("github", 2, now).nextAttempt).toBe(now + 7200000);
    await syncGithub(store, fake([repo()]), now);
    await store.write(
      "github-status.json",
      retryStatus("github", 1, now),
      workerStatusSchema,
    );
    expect((await projectsView(store, now)).stale).toBe(true);
    await syncTranscript(store, settings, fake(html, 200, "text/html"), now);
    await store.write(
      "transcript-status.json",
      retryStatus("transcript", 1, now),
      workerStatusSchema,
    );
    expect(
      (
        await academicsView(
          store,
          { enabled: true, fields: [...academicFields] },
          now,
        )
      ).stale,
    ).toBe(true);
  });
  it("recovers the backup after a corrupt primary file", async () => {
    await syncGithub(store, fake([repo()]), now);
    await syncGithub(store, fake([repo("Other")]), now + githubTTL * 3);
    await writeFile(join(store.directory, "github.json"), "broken");
    expect((await projectsView(store, now)).projects[0].name).toBe(
      "FLEX-WATCHER",
    );
  });
  it("does not overwrite good storage on invalid input", async () => {
    await syncGithub(store, fake([repo()]), now);
    const before = await readFile(join(store.directory, "github.json"), "utf8");
    await expect(
      store.write("github.json", {} as never, projectsSchema),
    ).rejects.toThrow();
    expect(await readFile(join(store.directory, "github.json"), "utf8")).toBe(
      before,
    );
  });
  it("serves empty, fresh, stale responses and rejects writes, query selectors and private paths", async () => {
    const api = createApi(store, {
      PUBLIC_ACADEMICS_ENABLED: "true",
      PUBLIC_ACADEMIC_FIELDS: academicFields.join(","),
    });
    await new Promise<void>((resolve) => api.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${(api.address() as AddressInfo).port}`;
    try {
      expect(
        academicsSchema.parse(
          await (await fetch(base + "/api/public/academics")).json(),
        ).cgpa,
      ).toBe(2.43);
      expect(
        (await (await fetch(base + "/api/public/projects")).json()).projects,
      ).toEqual([]);
      await syncTranscript(
        store,
        settings,
        fake(html, 200, "text/html"),
        Date.now(),
      );
      expect(
        (await (await fetch(base + "/api/public/academics")).json()).provenance,
      ).toBe("verified");
      await syncGithub(store, fake([repo()]), Date.now() - githubTTL * 3);
      expect(
        (await (await fetch(base + "/api/public/projects")).json()).stale,
      ).toBe(true);
      expect(
        (await fetch(base + "/api/public/academics", { method: "POST" }))
          .status,
      ).toBe(405);
      for (const path of [
        "/api/admin",
        "/.env",
        "/data/transcript.json",
        "/api/public/academics?student=another",
      ])
        expect((await fetch(base + path)).status).toBe(404);
      const text = await (await fetch(base + "/api/public/status")).text();
      expect(text).not.toMatch(
        /cookie|auth|session|path|studentId|stack|env|systemd/,
      );
      expect(Object.keys(JSON.parse(text))).toEqual(["projects", "academics"]);
    } finally {
      await new Promise<void>((resolve, reject) =>
        api.close((e) => (e ? reject(e) : resolve())),
      );
    }
  });
});
