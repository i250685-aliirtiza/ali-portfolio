import { load } from "cheerio";
import { z } from "zod";
import {
  academicFields,
  academicsSchema,
  emptyAcademics,
  transcriptCacheSchema,
  transcriptSchema,
  type AcademicField,
  type Academics,
} from "../shared/contracts.js";
import type { Store } from "./cache.js";
import { workerStatusSchema } from "./schedule.js";

// No production DOM profile ships: the real FLEX transcript has not been inspected.
// A reviewed profile is created from an authorized capture, never guessed from StudentMarks.
export const profileSchema = z
  .object({
    evidenceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    root: z.string().min(1),
    cgpa: z.string().min(1),
    semester: z.string().min(1),
    semesterLabel: z.string().min(1),
    orderAttribute: z.string().min(1),
    sgpa: z.string().min(1),
    row: z.string().min(1),
    code: z.string().min(1),
    title: z.string().min(1),
    grade: z.string().min(1),
    credits: z.string().min(1).optional(),
  })
  .strict();
export type Profile = z.infer<typeof profileSchema>;
export function parseTranscript(html: string, inputProfile: Profile) {
  const p = profileSchema.parse(inputProfile);
  if (
    !html.trim() ||
    html.length > 2_000_000 ||
    /cf-chl-|challenge-platform|cf-turnstile|verify you are human|checking your browser/i.test(
      html,
    )
  )
    throw new Error("transcript_unverified");
  const $ = load(html, { sourceCodeLocationInfo: true });
  if (
    $(
      'input[type="password"], form[action*="login" i], script[src*="challenges.cloudflare.com"]',
    ).length
  )
    throw new Error("transcript_auth_required");
  const root = $(p.root);
  function one(nodes: ReturnType<typeof $>) {
    if (nodes.length !== 1) throw new Error("transcript_structure_changed");
    const node = nodes[0] as unknown as {
      sourceCodeLocation?: { endTag?: unknown };
    };
    if (!node.sourceCodeLocation?.endTag)
      throw new Error("transcript_incomplete");
    return nodes.text().replace(/\s+/g, " ").trim();
  }
  function number(value: string, nullable = false): number | null {
    if (nullable && ["-", "N/A", ""].includes(value)) return null;
    if (!/^\d+(?:\.\d+)?$/.test(value))
      throw new Error("transcript_ambiguous_number");
    return Number(value);
  }
  one(root);
  const cgpa = number(one(root.find(p.cgpa)));
  const semesters = root
    .find(p.semester)
    .toArray()
    .map((el) => {
      const sem = $(el);
      one(sem);
      const order = number(sem.attr(p.orderAttribute) ?? "");
      const courses = sem
        .find(p.row)
        .toArray()
        .map((row) => {
          const r = $(row);
          one(r);
          const course = {
            code: one(r.find(p.code)),
            title: one(r.find(p.title)),
            grade: one(r.find(p.grade)),
            ...(p.credits ? { credits: number(one(r.find(p.credits))) } : {}),
          };
          return course;
        });
      return {
        label: one(sem.find(p.semesterLabel)),
        order,
        sgpa: number(one(sem.find(p.sgpa)), true),
        courses,
      };
    });
  const result = transcriptSchema.parse({ cgpa, semesters });
  result.semesters.sort((a, b) => a.order - b.order);
  return result;
}

export function publicationPolicy(env: NodeJS.ProcessEnv) {
  const fields = (env.PUBLIC_ACADEMIC_FIELDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fields.some((f) => !(academicFields as readonly string[]).includes(f)))
    throw new Error("invalid_publication_policy");
  return {
    enabled: env.PUBLIC_ACADEMICS_ENABLED === "true",
    fields: fields as AcademicField[],
  };
}
export async function academicsView(
  store: Store,
  policy: { enabled: boolean; fields: AcademicField[] },
  now = Date.now(),
): Promise<Academics> {
  if (!policy.enabled) return emptyAcademics;
  const cache = await store.read("transcript.json", transcriptCacheSchema);
  if (!cache) return emptyAcademics;
  const status = await store.read("transcript-status.json", workerStatusSchema);
  const allow = (field: AcademicField) => policy.fields.includes(field);
  return academicsSchema.parse({
    cgpa: allow("cgpa") ? cache.data.cgpa : 2.43,
    provenance: allow("cgpa") ? "verified" : "self-reported",
    lastSuccessfulSync: cache.lastSuccessfulSync,
    stale:
      status?.result === "failed" ||
      now - Date.parse(cache.lastSuccessfulSync) > 24 * 60 * 60 * 1000,
    semesters: cache.data.semesters
      .map((s, i) => ({
        key: `semester-${i + 1}`,
        ...(allow("semesterLabel") ? { label: s.label } : {}),
        ...(allow("sgpa") ? { sgpa: s.sgpa } : {}),
        courses: s.courses
          .map((c) => ({
            ...(allow("courseCode") ? { code: c.code } : {}),
            ...(allow("courseTitle") ? { title: c.title } : {}),
            ...(allow("grade") ? { grade: c.grade } : {}),
            ...(allow("credits") && c.credits !== undefined
              ? { credits: c.credits }
              : {}),
          }))
          .filter((c) => Object.keys(c).length > 0),
      }))
      .filter(
        (s) =>
          s.label !== undefined || s.sgpa !== undefined || s.courses.length > 0,
      ),
  });
}

export async function syncTranscript(
  store: Store,
  config: { url: string; cookie: string; profile: Profile },
  fetcher: typeof fetch = fetch,
  now = Date.now(),
) {
  const url = new URL(config.url);
  if (
    url.origin !== "https://flexstudent.nu.edu.pk" ||
    url.username ||
    url.password ||
    url.hash ||
    /studentmarks|login|signin/i.test(url.pathname)
  )
    throw new Error("transcript_invalid_endpoint");
  if (!config.cookie || /[\r\n]/.test(config.cookie))
    throw new Error("transcript_missing_session");
  profileSchema.parse(config.profile);
  const response = await fetcher(url, {
    headers: { Cookie: config.cookie, Accept: "text/html" },
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });
  if (
    response.status === 401 ||
    response.status === 403 ||
    (response.status >= 300 && response.status < 400)
  )
    throw new Error("transcript_auth_required");
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("text/html")
  )
    throw new Error("transcript_unavailable");
  if (response.url && response.url !== url.href)
    throw new Error("transcript_unexpected_url");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("transcript_empty");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) throw new Error("transcript_too_large");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const data = parseTranscript(
    Buffer.concat(chunks).toString("utf8"),
    config.profile,
  );
  const snapshot = transcriptCacheSchema.parse({
    data,
    lastSuccessfulSync: new Date(now).toISOString(),
  });
  await store.write("transcript.json", snapshot, transcriptCacheSchema);
  return snapshot;
}
