# Architecture

Nginx serves only the Vite `dist` tree and three exact public GET routes. Native Node runs on loopback as an unprivileged system user. Browser responses are validated again with shared Zod schemas; text is rendered by React, never injected HTML.

The GitHub worker reads official public repository metadata, with explicit public/owner/fork/archive/size filtering and pinned ordering. All requests target a fixed API origin with redirects disabled. Pagination is bounded; any failed/invalid page rejects the entire refresh. Missing repositories disappear only after a complete successful refresh. The API reuses saved metadata through outages. Hourly refresh avoids request-per-visitor upstream access.

The transcript worker is independent of existing watchers. It requires an explicit official-origin URL, a manually authorized session, and a reviewed selector profile made from real source evidence. It never navigates login/challenge pages or computes final grades from assessment marks. HTTP status, redirect, content type, size, markup completeness, unique fields, source order and grade/GPA values are validated before persistence. A timestamp changes only after a complete validated refresh.

Snapshots are written as mode-0600 temporary files, fsynced and atomically renamed; a validated last-good backup is retained. On Linux the directory is also fsynced. Read failures can fall back to a schema-valid backup. Private directories are mode 0700. API publication is an explicit projection from an approved field allowlist; disabling publication immediately returns the self-reported default.

Each worker has a process lock, persistent failure counter, bounded exponential backoff and a systemd timeout. GitHub starts hourly, transcript every twelve hours. No browser endpoint triggers either worker. The scheduler is deliberately separate from the long-running API and both existing watchers.

## Limits

This version expects a complete transcript in one authorized HTML response. A real multi-page or AJAX transcript needs a reviewed collector extension before enabling it. There is intentionally no fabricated default FLEX profile. The parser accepts explicitly mapped formats and rejects missing/ambiguous structures, but only real-page validation can establish source correctness. It does not send email alerts; private worker status and journald are the maintenance signals.

Nginx and systemd templates must be tested on the actual Ubuntu host. They are not proof of deployment by themselves. A domain-specific canonical URL and sitemap are added after the public hostname is known.
