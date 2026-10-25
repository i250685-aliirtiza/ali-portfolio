# Progress

## Verified locally — 25 October 2026

- Read PROJECT.md fully; inspected the existing public watcher source read-only. No watcher changes made.
- Implemented all portfolio sections, mobile navigation, project notes, academic semester table and honest empty states. Self-hosted IBM Plex fonts.
- Implemented strict shared schemas, GET-only loopback API, separate GitHub/transcript workers, atomic private last-good caches, persistent backoff, and opt-in field projection.
- Real GitHub sync: 10 eligible public repositories, last successful refresh `2026-10-25T18:45:34.805Z`. CLI authentication verified for the requested owner; preferred repository name available.
- `npm test`: 34 passing tests covering public filtering, pagination, rate limits/404/500/timeouts, cache reuse and preservation, multi-semester synthetic parsing, changed DOM/login failures, field privacy, public HTTP behavior and backoff.
- `npm run build`: passed (strict TypeScript, Vite production frontend, compiled Node server).
- `npm run test:browser`: 5 passed. 375/768/1440px layouts have no horizontal overflow; axe WCAG A/AA checks report no violations. Keyboard navigation, engineering notes, synthetic semester switching, escaped script-like text and API outage behavior pass.
- Desktop/mobile full-page screenshots captured and visually inspected. Fixed diagram contrast and semester selector labeling found during initial checks.
- `npm audit --audit-level=high`: zero vulnerabilities. `npm run scan`: tracked source/public bundle clean; repeat after final commit to cover history.
- Local production API: GitHub fresh; academics unavailable with self-reported 2.43 only. Transcript worker correctly reports pending authorized configuration.
- Deployment installer/preflight pass Bash syntax checking. Actual Nginx/systemd verification requires the VM.

## Remaining external gates

- Published https://github.com/i250685-aliirtiza/ali-portfolio; initial implementation remote SHA verified as `ede2db0ab60a344d4a53eafeea262fe6a046c98d`.
- GitHub Ubuntu CI passed all checks, including browser/accessibility tests: https://github.com/i250685-aliirtiza/ali-portfolio/actions/runs/40223159176. Local formatting lint and Git-history secret scan also pass.
- Oracle public IP/hostname, SSH user, authorized local key path or agent, optional domain. No VM connection or public launch has occurred yet.
- Authorized real transcript URL/capture/session and explicit approval of published fields. No real transcript validation claimed. Default details remain disabled.

## Resume

Workspace: `D:/Portfolio/ali-portfolio`. Node 24.18.0; npm 11.16.0. CLI installed at `C:/Program Files/GitHub CLI/gh.exe`. Runtime caches and screenshots are ignored. Use deployment preflight before changing the VM; compare watcher states before/after. Do not mark the project complete until public deployment and verification are evidenced.

## Deployment / transcript work — 26 October 2026

- Oracle SSH preflight completed. Ubuntu 24.04, x86_64, approximately 466 MB available RAM at baseline. Existing Node 20 runtime left unchanged.
- Baseline: FLEX-WATCHER running/enabled, main PID 17956. CP-WATCHER timer active/enabled; its one-shot service inactive with exit status 0. Baseline saved privately on the VM.
- Installed only Nginx and nginx-common (no upgrades). Installed separate Node 24.18.0 under portfolio paths after verifying the official SHA-256 checksum. Existing watcher states unchanged.
- Added and persisted only an inbound TCP-80 accept rule; preserved the prior firewall rules and saved a private backup. Nginx local HTTP responds 200. External HTTP timed out before reaching the host; narrow Oracle security-list/NSG ingress action requested.
- Implemented the actual `/Student/Transcript` parser from the owner's redacted capture. All three semesters and 26 course entries parsed. In-progress grades are explicit and unfinished SGPA is null. No actual transcript or raw authenticated HTML committed.
- Owner explicitly approved all academic allowlist fields. Imported snapshot provenance remains owner-provided until a successful authenticated fetch. The dedicated root-owned 0600 portfolio environment file is ready; authorized cookie configuration requested securely.
- Tests including external redacted capture: 50 passed before final missing-history guard. Populated dashboard browser/accessibility checks pass at 375/1440px; all 7 browser tests pass. Final checks rerun before publishing.

## Verified public launch — 26 October 2026

- Public HTTP site now serves at `http://140.245.29.231/`. Owner opened only Oracle ingress TCP 80; the API remains loopback-only and external TCP 4317 times out.
- Built on Oracle from pushed source with a separate Node 24.18.0 runtime. Fixed the dedicated user's npm-cache permissions. Nginx syntax passes; API and both portfolio timers are enabled. API restart recovery verified.
- Public page, JS/CSS/fonts and semester switching work with no browser console errors. Approved imported transcript shows three semesters/26 courses, source CGPA and nine in-progress results, without a fabricated completed zero SGPA.
- Owner's temporary cookie file was read only in memory, securely sent over SSH into root-owned mode-0600 configuration, then deleted locally after configuration confirmation. No credential was printed, committed or written to public output.
- Live FLEX request returned HTTP 302 to login with the session cookie present. The collector preserved the approved imported record and retained honest owner-provided provenance. Fresh authorized session requested; no live-sync success claimed.
- Existing watcher baseline remains unchanged: FLEX main PID 17956 active/enabled; CP timer active/enabled; CP one-shot inactive between scheduled runs, previous exit status 0.
- Public dotfile/env/db/admin routes return 404; academic POST rejected; public projection contains approved fields only. Security headers present.
- Local parser suite with external redacted capture: 52 passed. Seven browser tests pass including populated desktop/mobile dashboard and accessibility checks. GitHub Ubuntu CI passed for the deployed code. Real capture remains outside Git; only synthetic fixture values are committed.
