import { createServer } from "node:http";
import { academicsView, publicationPolicy } from "./transcript.js";
import { projectsView } from "./github.js";
import type { Store } from "./cache.js";

export function createApi(store: Store, env: NodeJS.ProcessEnv = process.env) {
  const policy = publicationPolicy(env);
  return createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; frame-ancestors 'none'",
    );
    const reply = (status: number, value: unknown) => {
      res.writeHead(status);
      res.end(JSON.stringify(value));
    };
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return reply(405, { error: "Method not allowed" });
    }
    try {
      // Exact paths only: no student selectors, parameters, files, admin or raw captures.
      if (req.url === "/api/public/projects")
        return reply(200, await projectsView(store));
      if (req.url === "/api/public/academics")
        return reply(200, await academicsView(store, policy));
      if (req.url === "/api/public/status") {
        const [projects, academics] = await Promise.all([
          projectsView(store),
          academicsView(store, policy),
        ]);
        return reply(200, {
          projects: projects.lastUpdated
            ? projects.stale
              ? "saved"
              : "fresh"
            : "unavailable",
          academics:
            academics.lastSuccessfulSync || academics.recordImportedAt
              ? academics.stale
                ? "saved"
                : "fresh"
              : "unavailable",
        });
      }
      return reply(404, { error: "Not found" });
    } catch {
      return reply(503, { error: "Temporarily unavailable" });
    }
  });
}
