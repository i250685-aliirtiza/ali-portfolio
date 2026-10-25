import { z } from "zod";
import { owner, projectsSchema, type Projects } from "../shared/contracts.js";
import { featured } from "../shared/content.js";
import type { Store } from "./cache.js";
import { workerStatusSchema } from "./schedule.js";

const repoSchema = z.object({
  name: z.string(),
  description: z.string().max(500).nullable(),
  html_url: z.string().url(),
  language: z.string().nullable(),
  updated_at: z.string().datetime(),
  private: z.boolean(),
  fork: z.boolean(),
  archived: z.boolean(),
  size: z.number(),
  owner: z.object({ login: z.string() }),
});
export const githubTTL = 60 * 60 * 1000;
export async function projectsView(
  store: Store,
  now = Date.now(),
): Promise<Projects> {
  const cache = await store.read("github.json", projectsSchema);
  const status = await store.read("github-status.json", workerStatusSchema);
  return cache
    ? {
        ...cache,
        stale:
          cache.stale ||
          status?.result === "failed" ||
          !cache.lastUpdated ||
          now - Date.parse(cache.lastUpdated) > githubTTL * 2,
      }
    : { projects: [], lastUpdated: null, stale: true };
}
export async function syncGithub(
  store: Store,
  fetcher: typeof fetch = fetch,
  now = Date.now(),
  token?: string,
) {
  const cache = await store.read("github.json", projectsSchema);
  if (cache?.lastUpdated && now - Date.parse(cache.lastUpdated) < githubTTL)
    return cache;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ali-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const repos: z.infer<typeof repoSchema>[] = [];
  // Follow our own bounded page URLs, never untrusted Link headers.
  for (let page = 1; page <= 10; page++) {
    const response = await fetcher(
      `https://api.github.com/users/${owner}/repos?type=owner&per_page=100&page=${page}`,
      { headers, redirect: "error", signal: AbortSignal.timeout(15000) },
    );
    if (!response.ok)
      throw new Error(
        response.status === 403 || response.status === 429
          ? "github_rate_limit"
          : "github_unavailable",
      );
    const batch = z.array(repoSchema).parse(await response.json());
    repos.push(...batch);
    if (batch.length < 100) break;
    if (page === 10) throw new Error("github_incomplete");
  }
  const rank = (name: string) => {
    const i = (featured as readonly string[]).indexOf(name);
    return i === -1 ? 999 : i;
  };
  const result = projectsSchema.parse({
    projects: repos
      .filter(
        (r) =>
          !r.private &&
          !r.fork &&
          !r.archived &&
          r.size > 0 &&
          r.owner.login === owner &&
          r.html_url === `https://github.com/${owner}/${r.name}`,
      )
      .sort(
        (a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name),
      )
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        updatedAt: r.updated_at,
      })),
    lastUpdated: new Date(now).toISOString(),
    stale: false,
  });
  await store.write("github.json", result, projectsSchema);
  return result;
}
