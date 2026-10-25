# Architecture

Nginx serves the Vite `dist` tree and exactly three public GET endpoints. Native Node runs on loopback as the dedicated `ali-portfolio` user. Shared Zod schemas validate private records and public responses. React renders all data as escaped text.

The hourly GitHub worker targets only the official API, filters private/fork/archived/empty repositories, paginates within a limit and keeps exactly four allowlisted repositories in curated order. Shared validation filters legacy caches as well. The UI always renders the four authored cards, even with absent metadata. A failed page rejects the whole refresh; saved projects remain available. No browser request triggers upstream polling.

The independent transcript worker targets the authorized `/Student/Transcript` route with a manually supplied session. Its built-in parser was reviewed against the owner's redacted capture. It recognizes the transcript heading, semester panels, exact column meanings and complete course rows. Term/year labels establish chronology; GPA values come from labeled source fields. In-progress grades retain their source letter, with null SGPA for unfinished terms. It never derives grades from assessment marks. A reviewed selector profile remains optional for alternate layouts.

The collector rejects redirects, login/challenge pages, wrong content types, excessive size, missing/ambiguous markup, invalid values and loss of previously saved courses or semesters. Failures preserve the last good snapshot. A deliberate correction removing historical records needs private operator review rather than silent replacement.

Snapshots distinguish owner-provided captures from authenticated FLEX responses. Captures expose an import timestamp and an explicit live-sync-pending label. Only an authenticated successful fetch records a live-sync timestamp and verified provenance. The owner approved the public field allowlist on 26 October 2026; names, IDs, sections, remarks, fees, cookies and raw source HTML are not part of the public contract.

State files are mode 0600 inside a 0700 directory. Writes validate, fsync and atomically rename; a last-good backup is retained. Linux directory metadata is also fsynced. The API reads state without filesystem write permission. Each worker has an overlap lock, persistent bounded backoff and a systemd timeout. GitHub refreshes hourly; transcript every twelve hours.

The deployment uses immutable GitHub releases, an atomic `current` symlink, an app-specific Node 24 runtime and isolated systemd units. Existing watcher runtimes, units, cookies and data are untouched. Updates preserve Nginx/TLS configuration and can roll back the release symlink on failed API health checks.

## Limits

The reviewed source is one complete HTML response. A future multi-page/AJAX source needs a reviewed collector extension. No automated login, challenge bypass or email-alert subsystem is included. The IP-only launch uses HTTP as requested. Session acceptance depends on FLEX; an imported record is never labeled as a successful live fetch.
