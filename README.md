# Ali Irtiza — portfolio

A restrained, responsive React portfolio with a cached GitHub feed and a private-by-default academic transcript boundary. Built for an isolated service on an existing Oracle Ubuntu VM.

The project showcase contains exactly four always-visible projects: Neural Network, Arcanum Editor, Tumblepop and FLEX Watcher. GitHub discovery cannot expand this allowlist. See [source review and selection policy](docs/project-showcase.md).

**Transcript integration:** The actual /Student/Transcript layout is validated against an authorized redacted capture. Imported records are labeled owner-provided until a successful authenticated refresh. In-progress semesters do not display a zero SGPA. Only synthetic fixtures are committed. Live refresh requires a valid authorized session.

## Develop and verify

Node **24.x** (developed with 24.18.0), npm, and Git are required. Versions are locked in `package-lock.json`.

```sh
npm ci
npm run build
npm start
# In a second terminal:
npm run dev
```

The development page is served by Vite; `/api` proxies to `127.0.0.1:4317`. The production API binds only to loopback. Run `npm run sync:github` to refresh public project metadata; no token is normally required. Without a cache the editorial project notes remain useful and explicitly lack live metadata.

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm audit --audit-level=high
npm run scan
```

Browser checks use synthetic responses, test phone/tablet/desktop layouts, keyboard navigation, semester selection, HTML escaping, and axe accessibility checks. Screenshots are ignored under `test-results/`. All real academic data, cookies, captures and caches stay outside Git.

## Structure

- `src/`: semantic React page, local IBM Plex fonts, responsive CSS.
- `shared/`: runtime-validated contracts and owner-editable editorial content.
- `server/`: native Node HTTP API, atomic cache, independent refresh workers and configurable transcript parser.
- `tests/`: synthetic parser, failure, HTTP boundary and browser checks.
- `deploy/`: dedicated systemd units, restricted Nginx virtual host, preflight/install scripts and rollback.
- `docs/`: architecture, privacy, transcript integration and operations.

## Configuration

Production configuration is `/etc/ali-portfolio.env`, root-owned mode `0600`, loaded by systemd. For local commands set environment variables in your terminal; no `.env` file is automatically loaded. Never place real values into source files.

| Variable                   | Meaning / default                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `PORT`                     | Loopback API port, 4317                                                                     |
| `DATA_DIR`                 | Private state directory; local fallback `./data/local`, production `/var/lib/ali-portfolio` |
| `GITHUB_TOKEN`             | Optional least-privilege server-side GitHub API credential                                  |
| `PUBLIC_ACADEMICS_ENABLED` | `false` until explicit owner approval                                                       |
| `PUBLIC_ACADEMIC_FIELDS`   | Empty by default; approved comma-separated names listed below                               |
| `FLEX_TRANSCRIPT_URL`      | https://flexstudent.nu.edu.pk/Student/Transcript; no query parameters                       |
| `FLEX_COOKIE`              | Owner’s manually obtained full cookie header; protected configuration only                  |
| `FLEX_PARSER_CONFIG`       | Optional alternate reviewed profile; empty uses the built-in FLEX parser                    |

Approved field names: `cgpa,semesterLabel,sgpa,courseCode,courseTitle,grade,credits`. Each is opt-in; source-specific identifiers never appear in the public schema. CGPA stays explicitly self-reported if its verified value is not approved.

## Deployment and maintenance

First perform the read-only [preflight](deploy/scripts/preflight.sh), inspect existing watcher units/ports/resources, and follow [operations](docs/operations.md). Use Node 24 without replacing the watchers’ runtime. The first-install script creates only the portfolio identity, paths, units, and vhost. Shared package/network/TLS changes require actual VM inspection.

```sh
# On the VM after preflight, using the pushed full SHA and verified runtime prefix:
sudo bash deploy/scripts/install.sh FULL_SHA HOST NODE24_PREFIX
```

Updates use immutable releases and an atomic `current` symlink; see [operations](docs/operations.md). See [rollback](deploy/rollback.md) for recovery. Do not rerun the first-install script over a TLS vhost.

Renew a FLEX session with `sudoedit /etc/ali-portfolio.env`, never via chat or command arguments, then start only `ali-portfolio-transcript-sync.service` after the retry gate is cleared as documented. This does not alter FLEX-WATCHER. Full integration instructions: [transcript authentication](docs/transcript-auth.md).

Edit `shared/content.ts` for project ordering, case studies, genuinely authored notes and verified milestones. Add an approved contact link/photo only when supplied. No analytics, external font requests or fabricated achievements are included.

See `PROGRESS.md` for verified execution results and remaining external gates.
