# Security and privacy boundaries

- No public administration or write routes. No user-controlled student IDs, upstream hosts or local file paths.
- FLEX requests accept only `https://flexstudent.nu.edu.pk` with no alternate port, userinfo, fragment, marks endpoint or automatic redirects. Sessions stay in protected server configuration.
- All persisted/public shapes are explicitly validated. Unknown source fields are stripped; publication is field-by-field opt-in. Never render raw HTML or Markdown from a repository or transcript.
- Academic collection is disabled until an authorized source and reviewed parser profile exist. Detailed publication is a separate approval.
- Files: private directory 0700, snapshot/backup/lock 0600, root-owned production environment 0600. No cookies inside snapshot files. systemd applies an unprivileged identity, read-only API filesystem, worker-only state writes and resource limits.
- Logs use fixed failure messages, never upstream bodies, error stacks, URLs, cookies or fingerprints. Portfolio Nginx access logging is disabled to avoid request query strings entering logs. Public status reveals only coarse freshness.
- Nginx serves only build output and exact API paths. It denies dotfiles and secret/database extensions, adds browser security headers, and exposes no internal service port.
- CSP currently permits inline CSS for decorative bar heights; scripts remain self-only, with objects/frames/forms disabled. No analytics, external fonts, third-party scripts or AI portraits.
- `npm run scan` scans tracked working files, historical Git blobs and compiled public assets for common credential patterns. It also rejects private file paths from the index and server-only identifiers in frontend output. This is a focused automated check, not a guarantee against every possible secret encoding.

Only synthetic fixtures may be committed. Never add official transcripts, saved private HTML, session dumps, production state or screenshots containing academic PII. The public GitHub handle is intentionally the one supplied by the owner; no separate student identifier field is added.
