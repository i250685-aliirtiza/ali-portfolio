# PROJECT.md — Ali Irtiza's Personal Portfolio

> **Your role:** You are Codex, the responsible lead engineer for this entire project. Build, verify, publish, and deploy the product. This file is the implementation contract, not a request for a plan or a partial scaffold.
>
> **Owner:** Ali Irtiza — BS Computer Science student, FAST-NUCES Islamabad.
>
> **Final deliverable:** A beautiful, working, responsive, accessible, publicly reachable personal portfolio, with periodically refreshed GitHub projects and an authorized, securely cached academic transcript integration, deployed on the owner's EXISTING Oracle Cloud Ubuntu VM. Source must be committed and pushed to a NEW GitHub repository under `i250685-aliirtiza` (prefer `ali-portfolio`; check availability first).

---

## 0. Execution contract — read first, obey throughout

**YOU are the engineer.** Own requirements clarification, architecture, implementation, testing, fixes, publishing, Oracle setup, secure configuration, and final live verification. Do not hand implementation back to the owner. The owner will provide only information, authentication/access, approvals, and any unavoidable action in his accounts.

1. **Act, don't merely advise.** Inspect the working directory and available tools, choose an implementation, write all files, install dependencies, run tests/builds, fix failures, create the GitHub repository, push, and deploy. A proposal, checklist, mockup, code snippets in chat, or “here is how you can deploy” is NOT task completion.
2. **Never voluntarily stop at a progress report.** After each milestone, immediately proceed to the next. Do not end a response with “I have done X; next I would do Y,” “please say continue,” or “ready for the next phase.” Keep making tool calls until the project is live or a *genuine external blocker* requires the owner.
3. **Ask only actionable, minimum-necessary questions at the point of need.** If you can proceed safely with defaults, do so. Batch genuine blockers in ONE clear request. When the user responds, resume from the saved state without re-planning or asking them to restate things. After local build/tests and GitHub push, request Oracle connection details or a secure terminal-access handoff, then actually complete deployment.
4. **Treat this document as standing authorization** to create a NEW portfolio repository in the owner's GitHub account, commit/push its code, and deploy a NEW isolated service/site to his existing Oracle VM once access is provided. **NOT** authorization to disrupt or rewrite existing watchers, alter security rules indiscriminately, publish private records without approval, buy a domain, or incur paid cloud charges.
5. **No fake success.** Record exact commands and their results. If an environment does not provide GitHub/SSH/Oracle access, say precisely which access or one-time user action is needed, then continue when available. Never claim a test passed, a repo was pushed, or a site went live without verifying it.
6. **Avoid endless analysis.** Choose proven simple technology and implement it. Investigate new unknowns only as needed. Do not ask the owner to choose between frameworks, colors, layouts, or packages.
7. **Write production-quality code.** Typed interfaces, input validation, non-leaky error handling, testable integration boundaries, deployment scripts, setup docs, and safe defaults. No fake APIs, fake grades, meaningless metrics, unfinished placeholders, or silent failure modes.
8. **Persist work continuously.** Save files, make logical commits, and maintain a concise `PROGRESS.md` (work done, tests/results, pending external blocker only). If your runtime resets, resume from repo status and this document. Progress documentation never substitutes for implementation.
9. **Do not replace completion with a Codex prompt for another Codex.** This is already your engineering assignment.
10. **Be privacy-first and respectful of account boundaries.** Never circumvent login/CAPTCHA/Turnstile, guess credentials, scrape others' records, expose cookies, or treat a private academic system as a public API.

### Definition of COMPLETE

You may mark the project `COMPLETE` only after ALL of the following are true, with evidence:
- Full site actually implemented, visually reviewed at desktop and mobile sizes, and all links/interactions working.
- GitHub refresh and stale-cache fallback tested with success, outage, and rate-limit responses.
- Academic UI and backend fully implemented; last-known-good fallback and session-expiry handling tested using synthetic fixtures. Real transcript integration validated against authorized owner-provided page/access when feasible; never claim real-data validation if blocked.
- Unit/integration tests, production build, accessibility/basic responsive checks, and security/secrets checks pass, or any specific exception is clearly disclosed.
- New GitHub repository created, complete source pushed, remote commit SHA checked.
- Site deployed on the existing Oracle Ubuntu VM *without breaking* FLEX-WATCHER or CP-WATCHER; externally reachable URL checked, services healthy, reboot persistence checked/verified where possible.
- Owner is given the live URL, repo URL, exact status of GitHub and transcript feeds, how to update a FLEX session safely, and minimal maintenance steps.

**If the real transcript cannot be accessed yet, deploy a functioning site with the secure transcript adapter + cached/unavailable behavior, mark that integration `AWAITING AUTHORIZED SESSION / REAL-PAGE VALIDATION`, and arrange the exact minimal follow-up. This is a partial launch, not full transcript-integration completion.** Do not delay the whole website for this single external blocker.

---

## 1. Product identity and editorial direction

**Name:** Ali Irtiza  
**Header wordmark:** `ali.irtiza`  
**Academic affiliation:** FAST-NUCES Islamabad, BS Computer Science.  
**Public GitHub account:** https://github.com/i250685-aliirtiza  
**Voice:** Plainspoken, technical, understated, human. Not corporate boilerplate.

**Hero copy (approved conceptual direction, refine as needed):**

- Small eyebrow: `COMPUTER SCIENCE STUDENT · ISLAMABAD`
- H1: `Ali Irtiza.`
- Subtitle: `I build useful software, study algorithms, and explore how systems work.`
- Primary CTA: `View projects`
- Secondary CTA: `See academic record`

**Absolute content prohibitions:**
- DO NOT include any **target SGPA, target GPA, grade goal, projected improvement, motivational grade promise, comeback framing, shame narrative, grade-improvement goal card, or comparison of actual GPA against a target** anywhere in public UI, metadata, mockups, structured data, or README screenshots. The owner explicitly rejected this.
- The portfolio MAY show **only his actual current CGPA** and authenticated historical semester SGPAs/course grades. Current known owner-reported CGPA: **2.43**. Until verified from FLEX, label it `Self-reported · awaiting transcript sync`, not official/live. Once a properly validated official transcript is available, prefer the source value and label accuracy accordingly.
- NEVER invent an achievement, medal, award, scholarship, leadership position, company internship, Codeforces rating, solved-problem count, course grade, semester SGPA, work experience, badminton award, or project feature.
- NEVER represent an uncompleted ambition as an accomplishment.
- No “aspiring billionaire,” aggressive hustle clichés, stock motivational quotes, emojis in every section, or AI-generic filler paragraphs.

The site should be credible today and grow naturally as verified achievements are added later. It is a portfolio, not an awards résumé.

---

## 2. Non-negotiable visual design system

Create a **calm, editorial, premium engineering portfolio**. Think excellent typography, fine borders, tight hierarchy, thoughtful spacing, and credible technical detail. Do not create a flashy SaaS landing page.

### Theme tokens (use these unless a clearly better accessible variant is necessary)

```css
:root {
  --bg: #F8F8F6;             /* warm off-white */
  --surface: #FFFFFF;
  --ink: #18211F;            /* deep charcoal green */
  --muted: #66716D;
  --line: #DEE3DF;
  --accent: #285E50;         /* restrained evergreen */
  --accent-soft: #E9F0EB;
  --dark: #17221F;
  --dark-ink: #F4F5F1;
  --radius: 10px;
  --content-width: 1120px;
}
```

- Typography: **IBM Plex Sans** (or equally refined readable sans) for display/body; **IBM Plex Mono** for metadata, tags, timestamps, and technical labels. Use sensible local fallbacks. Two font families maximum. Load responsibly with `font-display: swap` if webfonts are used.
- Headings: slightly tight tracking, clear hierarchy. Actual body text >= 16px; readable line length ~60–72 characters.
- Grid: max width 1120px, desktop 12-column layout, 2-column projects, generous negative space, mobile single column. Side gutters 24px desktop / 18px mobile; consistent 8px spacing scale.
- Borders 1px quiet gray; subtle shadows at most. Prefer crisp edges and restrained radius over pill-shaped everything.
- Header: neat wordmark left, anchored navigation right; small mobile menu with keyboard accessibility. Sticky only if it truly helps.
- Hero: spacious, strong name typography; concise intro; exactly two useful CTAs. Avoid giant image placeholders. The home hero can include a compact dark technical panel showing current focus without any fake terminal animation.
- Color: off-white/charcoal/evergreen, no RGB gradients, no neon, no purple-blue blobs, no glassmorphism, no noisy decoration, no animated particle fields.
- Motion: subtle hover/focus transitions ~120–180 ms; respect `prefers-reduced-motion`. No scrolljacking, parallax, animated counters, typewriter effects, or bouncing elements.
- Icons: consistent small line icon set used sparingly. Avoid huge icon blocks/cards without content.
- Images: optional. No AI-generated portrait, fake school photos, stock sports shots posing as owner. If no approved real photograph, make typography carry the design.
- Dark mode is OPTIONAL; prioritize a polished single light theme. If implementing dark mode, make it fully tested and accessible, not an unfinished toggle.
- All states (loading, stale, unavailable, empty, error) deserve good design, not generic placeholders.

**Homepage page structure, in this order:**
1. Compact header/nav.
2. Strong typographic hero.
3. `Selected work` — 3–4 curated, genuinely existing repos, with featured project case-study treatment.
4. `What I'm working on` — algorithms/competitive programming, software tools, interest in graphics.
5. `Academics` — current CGPA visible as plain data; semester explorer, course-grade tables, and sync provenance; no GPA goals.
6. `Competitive programming` — measured learning/competition journey, future verified milestones.
7. `Beyond code` — played badminton well at school; a concise personal paragraph, no manufactured awards.
8. `Notes / learning log` — a small editable section for future writing, may initially show only real authored content or an honest empty state.
9. Footer with working public links and optional owner-approved contact address.

**Navigation anchors/routes:** `Work`, `Academics`, `CP`, `About`, `Contact`. A single superb page with optionally routed project details is preferable to many half-built pages.

### Section specifications

**Selected Work:** Each card shows actual repo name, validated short description, meaningful technical tags, a functional source link, dates/last updated only if retrieved, and optional working demo. Feature FLEX-WATCHER and CP-WATCHER; consider BRB-Trees-Visualizer, Sorting-Visualizer, Neural-Network, or Blackwood-Hargrove-Editor *after reading repo content*. Explain what was built, key engineering decisions, and what technology it uses; do not claim an unverified impact, traffic, production scale, or feature.

**Academics:** Current CGPA `2.43` (owner-reported until source-verified), tasteful number typography without giant motivational comparison. Semester selector (`Semester 1`, `Semester 2`, ... based on actual transcript), source-provided SGPA, course name/code, grade, and optional credit hours if present. A simple truthful GPA trend chart is permissible **only when >=2 authentic numeric semester records exist**, with non-misleading axes, clear labels, and no predicted/target series. A small `Last successful academic sync: ...` timestamp and `Showing saved record` state. If data has never been collected, show **current self-reported CGPA** and an honest “Detailed semester results not yet synchronized” message; never populate fake grades.

**Competitive Programming:** Current concentration on graphs, dynamic programming, algorithms, blind problem solving, and Codeforces/ICPC preparation. Do not show a Codeforces rating or profile URL until supplied/verified. Timeline with actual events when known, future achievements stored as optional data entries — never pre-populate awards. Keep phrases modest and verifiable. Do not assert user has won contests.

**Beyond Code:** A short real statement such as `Badminton was a big part of my school years. I enjoyed competing and getting better at it.` No fabricated tournaments, photos, rankings, team captaincy, or certificates.

**Currently Exploring:** C++, data structures, algorithmic problem-solving, software automation, graphics programming / interest in a self-built game engine. Label long-term ideas as `Interests` or `Future exploration`, not released projects.

**Contact:** GitHub link definitely; LinkedIn, email, photo, résumé PDF, location details beyond city/campus only with owner-provided information. Never expose a phone number, roll number, personal address, FLEX identifiers, or student private identifiers.

---

## 3. Technology and repository structure

Prefer boring, maintainable tech:
- **Frontend:** React + Vite + TypeScript, semantic HTML, CSS/Tailwind as useful; choose ONE clear styling approach, no giant UI framework dependency for basic portfolio components.
- **Server:** Minimal Node.js + TypeScript HTTP API (Express/Fastify or native Node, engineer's choice), bound **only to `127.0.0.1`** behind Nginx on Oracle. Never bind private admin routes to all interfaces.
- **Persistence:** SQLite (or carefully atomic JSON files where appropriate) for cached GitHub responses, cached transcript snapshots, timestamps, and status. Protected file permissions; never store a raw session cookie in a public DB.
- **Jobs:** systemd services/timers or a small robust scheduler, with one refresh worker for GitHub and another distinct, low-frequency transcript sync. Tests can inject fake clock and mock network. No cross-service dependencies on existing watchers.
- **Web server:** Nginx serving the Vite dist and reverse-proxying only public read-only API endpoints.
- **Node version:** Use a supported current LTS runtime compatible with the instance. The existing watchers may use another Node version; do NOT unilaterally upgrade or remove their runtime. Prefer an app-local runtime or safe compatible installation. Document the exact version.
- **Build tooling:** `npm`, locked dependency versions, `.env.example`, clear scripts.
- **Testing:** Vitest or Node's native test runner for units/integration; Playwright (or equivalent) for key browser smoke tests/screenshot reviews where accessible.

Suggested repo layout (refine as needed):

```text
ali-portfolio/
  PROJECT.md
  README.md
  PROGRESS.md
  .env.example
  package.json
  package-lock.json
  apps/
    web/                       # React/Vite/TS site
    api/                       # public read-only endpoints
  packages/
    shared/                    # TS contracts & Zod or equivalent schemas
  workers/
    github-sync/               # public repo metadata collector/cache
    transcript-sync/           # authorized FLEX transcript collector
  data/fixtures/               # SYNTHETIC test data only
  tests/
  deploy/
    nginx/
    systemd/
    scripts/
    rollback.md
  docs/
    architecture.md
    transcript-auth.md
    security.md
    operations.md
```

If a simpler layout delivers the same quality, use it, and keep the source cohesive. Do not put operational secrets or official transcript data in Git. Include `data/`, real `.env*` except `.env.example`, cookies, SQLite production files, backups, logs, keys, screenshots with PII, and generated artifacts in `.gitignore` where appropriate.

### Public API contracts

Provide a narrow, validated, GET-only public API, such as:
- `GET /api/public/projects` — curated GitHub metadata (server cached); `lastUpdated`, `stale` boolean.
- `GET /api/public/academics` — APPROVED PUBLIC FIELDS ONLY: cgpa, semester labels, course labels/codes, grades, SGPA, optional credits, `lastSuccessfulSync`, provenance/staleness. Nothing else.
- `GET /api/public/status` — coarse, non-sensitive cache freshness; DO NOT reveal cookie status, private paths, FLEX session fingerprints, internal stack traces, environment variables, account IDs, or systemd internals.

Use shared schema validation on API responses. Never create public endpoints for changing configuration, starting FLEX polls, reading raw HTML, reading source snapshots, or updating academic publication settings. Admin actions remain CLI/SSH-only or bound to a secured local interface.

---

## 4. GitHub projects integration — actually refresh, do not fake “live”

Account: `i250685-aliirtiza`.

Verified candidate repositories known to exist:
- https://github.com/i250685-aliirtiza/FLEX-WATCHER
- https://github.com/i250685-aliirtiza/CP-WATCHER
- https://github.com/i250685-aliirtiza/BRB-Trees-Visualizer
- https://github.com/i250685-aliirtiza/Sorting-Visualizer
- https://github.com/i250685-aliirtiza/Neural-Network
- https://github.com/i250685-aliirtiza/Blackwood-Hargrove-Editor

**Implementation:**
1. Fetch public repos through GitHub's official API using modest server-side periodic refresh (e.g. 30–60 minutes), with caching to respect API rate limits. Authenticate only if needed, with a least-privilege token kept server-side.
2. Filter private/fork/archived/empty repos sensibly; owner can opt in to special entries. Do not expose private repository names or data.
3. Maintain a curated pinned-project allowlist/order in owner-editable config, with dynamic metadata. New eligible repos can be surfaced in an `Other projects` section without replacing featured selections unexpectedly.
4. Handle deleted repos, missing descriptions, unavailable demo URLs, rate-limit failures, and network outages. Stale cache must remain visible with a truthful `Last synced` timestamp. An API failure must not blank the entire portfolio.
5. Validate outbound links and avoid rendering untrusted GitHub README HTML unsanitized. If interpreting Markdown, sanitize and restrict to safe content.
6. Include tests for normal refresh, caching, 403 rate limits, 404 repos, invalid data, timeout, and public/private filtering.
7. If showing a repo language, stars or recent commit timestamps, derive all from the actual API, not guesswork. Stars should not become noisy vanity widgets.

GitHub is one supporting data source, not the site's sole runtime dependency. The page MUST load beautifully while GitHub is down.

---

## 5. Academic transcript integration — CRITICAL ENGINEERING REQUIREMENT

### What is already known (checked against existing source)

Existing production repo: https://github.com/i250685-aliirtiza/FLEX-WATCHER

- Current FLEX-WATCHER monitors authenticated `Student/StudentMarks?semid=...` using the owner's manually supplied, expiring `ASP.NET_SessionId`/cookie on `flexstudent.nu.edu.pk`.
- Existing `src/flex/auth.js` checks login/challenge/redirect failures rather than trusting HTTP 200.
- Existing `src/flex/session.js` handles cookies for its requests.
- Existing `src/flex/parser.js` parses per-course assessment marks for ONE selected semester.
- Existing `src/snapshot.js` validates a saved assessment snapshot; the watcher keeps last good marks data after failure.
- Existing Oracle deployment uses a systemd service, secret env config and local snapshot; the watcher relies on an actively authorized FLEX session.
- **IMPORTANT:** Its current `StudentMarks` parser and marks snapshot do **NOT** establish that it already supports the official TRANSCRIPT page, final course grades, SGPA or CGPA. Do not misuse assessment marks as final grades. Inspect actual authenticated transcript HTML separately.

### Required safe architecture

Build a **separate** `portfolio-transcript-sync` component that reads the owner's academic transcript under a legitimately authenticated owner session and stores the last successfully **validated** normalized transcript snapshot. The public portfolio reads a **published allowlisted projection** of that snapshot. Leave FLEX-WATCHER's functioning polling, code, database and systemd service untouched.

**Design:**

```text
Authorized FLEX Transcript HTML
       |  (owner's active, manually authorized session)
       v
Separate transcript collector / parser / validator
       |
       +--> on success: atomic last-good private snapshot
       |            --> filtered/approved public projection
       |
       +--> on expiration, outage, HTML change or error:
                    KEEP existing last-good snapshot untouched
                                   |
                                   v
                      Portfolio public academics API
                                   |
                                   v
                 Semester explorer + course grades + CGPA
                 [last successfully synced at ...]
```

### How to obtain transcript data

1. Inspect the existing FLEX-WATCHER repository **read-only** for reusable security and request patterns. Do not change its source, binary, environment file, service, timer, or running process unless the owner separately explicitly requests a scoped change.
2. Discover the real transcript endpoint and response structure using authorized owner-provided evidence (such as a redacted saved HTML capture or local session handled securely). **Do not guess endpoint paths, fabricate HTML, or assume the marks page includes final grades.** The exact page URL and HTML structure remain to be confirmed. Ask the owner for the **non-secret transcript page URL**, and if needed a locally captured REDACTED HTML/DOM sample. A secret session cookie must be entered through protected local/server configuration, not pasted in chat, tracked files, screenshots, or shell history.
3. If authorized access is available from Codex's runtime, validate same-origin HTTPS, expected response path and positive evidence of transcript content; detect 401/403, login redirects, challenges, incomplete markup, unexpected content type, malformed tables, and structural changes. Never bypass CAPTCHAs, anti-bot checks or institutional access controls. Respect university policies and reasonable request rates.
4. Implement a pure HTML-to-normalized-data parser with fixture-based tests. Extract only verified fields that actually exist, as available: semesters, semester identifier/order, SGPA, CGPA, course code/title, letter grade, course credit hours. Preserve source provenance and `lastSuccessfulSync` timestamp. Reject ambiguous or incomplete data instead of silently publishing inaccurate grades.
5. Poll at modest low frequency (default every 6–12 hours with backoff, or manual trigger; **NOT** every 15 seconds). The transcript is not a quiz-score ticker. Avoid redundant high-volume authenticated requests to FLEX.
6. Persist snapshots privately under an app-specific location such as `/var/lib/ali-portfolio/`, readable only by the service identity. Use atomic replace (write temp file, validate, fsync/rename where appropriate) and retain a backed-up last-good copy. NEVER replace valid data with login HTML, empty parse, partially fetched results, or unverified structures.
7. When session expires, public academic data continues showing **last valid approved grades and last update**. Show a subtle `Saved academic record` label, not an ugly public `INVALID COOKIE` error. Privately log the auth issue without secrets; give the owner exact renewal instructions and optional private email alert if already supported/configured. Never expose the user's authentication status in public API.
8. If no successful transcript capture exists, render an honest empty state; current CGPA `2.43` may be initially self-reported with an explicit source label. **Do not invent course grades or semester GPAs to fill the layout.**
9. Handle multiple semester transcript formats and missing/withdrawn/incomplete grades defensively. Sort semesters using source metadata; do not guess the official order from arbitrary string names.
10. **Privacy gate:** Before publishing a real transcript-derived dataset, obtain the owner's explicit approval of what is public. Provide configurable `PUBLIC_ACADEMICS_ENABLED` and field-level allowlists. Default to only the owner's already requested self-reported CGPA and a disabled/empty detailed transcript until approval. Whitelist only semester labels, SGPA, course names/codes, final grades and optionally credits. Strip student name repetitions, university ID/roll number, CNIC, DOB, fees, addresses, cookies, full page HTML, etc. Do not expose private snapshot paths. Site visitors must never be able to ask for a different student's grades.
11. Use synthetic fixtures in tests and screenshots. Never commit actual official transcripts, personally identifying academic data, session cookies, or capture dumps.
12. If access cannot be granted during implementation, **finish the full parser architecture with test fixtures and a robust pending-integration workflow; deploy the rest of the site and ask for the minimal authorized data at the final integration gate.** Do not halt all coding because the session isn't available yet.

**Acceptance tests (required):**
- A valid multi-semester fixture parses all available SGPA/final-grade entries and computes **nothing** falsely from assessment scores.
- No prior cache -> designed unavailable state (plus self-reported CGPA only if configured).
- Valid official response -> validated normalized private snapshot and filtered public projection, with sync timestamp.
- Expired cookie/login HTML/403 -> old public grades remain unchanged, timestamp unchanged, retry/backoff and private status recorded.
- Changed DOM/ambiguous fields -> reject new snapshot, preserve old; don't mislabel data as current.
- Transient timeout/500 -> stale last-good data served, no leaked stack trace.
- Course field containing HTML/script-like text -> rendered as escaped text, not executable markup.
- Unapproved sensitive fields (student ID, name, fee info, auth cookie) never appear in public API responses, generated frontend bundle, access logs, or git history.

---

## 6. Real content, not résumé inflation

Use only supported facts:
- Ali Irtiza studies BS Computer Science at FAST-NUCES Islamabad.
- Interested in algorithms, systems, C++, software automation and graphics.
- Working on competitive programming with emphasis on graphs and dynamic programming; preparing for contest problem solving and ICPC-oriented skills.
- Played badminton during school and considers it an important interest.
- Existing GitHub repos listed above (verify current state and capabilities rather than inventing descriptions).
- CGPA currently owner-reported as **2.43**. No target, prediction, comparison to goals, narrative of shame, or academic redemption marketing.

Content storage should make future additions straightforward. Define typed, editable data for:
- Featured-project order and manually edited case-study blurbs.
- Verified contest participations, placements and awards (empty if none verified).
- Learning-log entries authored by the owner (do not fabricate blog posts).
- Future links/photo/résumé only with approval.

Do not add a `0 awards` counter, an empty achievements trophy wall, or fake social proof. A modest `Milestones` section can appear later when real entries exist. Do not put competition goals in fake completed timeline entries.

---

## 7. Build quality and functionality

**Core functional requirements:**
- Responsive on common desktop, tablet and phone widths; no horizontal overflow.
- Accessible semantic headings, navigation, focus indicators, ARIA only where needed, keyboard-operable menus, color contrast, reduced-motion support.
- Fast first meaningful paint; avoid heavy JS/animation libraries; optimize bundle and any approved images.
- SEO: accurate page title, description, OpenGraph title/description with no fabricated portrait/image, robots and sitemap as appropriate, canonical when domain is known, valid favicon.
- Real links validated. No dead demo button or disabled CTA that looks clickable.
- Clear date/time formats and timezone indication if showing update dates.
- Error boundaries and graceful empty states when external data is unavailable.
- Ensure no development console errors in production.
- Mobile screenshot and desktop screenshot captured for visual inspection; fix spacing/contrast/typographic problems before shipping.
- Practical application health checks and logs. No public stack traces or debug traces.
- Avoid public visitor analytics trackers by default; only add if approved and privacy-conscious.

### Tests and checks

Implement/run:
- Lint/typecheck (TypeScript strict recommended).
- Unit tests for transcript validation, cache preservation, sanitizer/public projection, GitHub adapter.
- API integration tests for happy path, stale mode, no data, invalid data, and safe response shapes.
- Production `npm run build` / corresponding workspace build.
- Browser smoke test: home loads, header anchors work, projects have real URLs, semester switching works with fixture mode, no invalid target-GPA text, no layout overflow at ~375px and ~1440px, all active controls keyboard-usable.
- Dependency audit or an equivalent vulnerability scan; resolve critical issues.
- Automated secret scanner (`git grep` or dedicated scanning tool) for session IDs, SMTP credentials, private keys, personal identifiers, raw transcript content. Never log secrets even in failed-command outputs.
- Check compiled public assets for leaked credentials and unapproved transcript fields.

No production build should depend on FLEX being reachable at build time.

---

## 8. GitHub publishing — do this yourself

After the website and tests are implemented:
1. Check authenticated GitHub CLI/API/connector access and repo-name availability. Create a **NEW** repository, ideally `i250685-aliirtiza/ali-portfolio`. Do NOT place this website in the existing FLEX-WATCHER or CP-WATCHER repositories.
2. Initialize git if necessary. Commit complete source, docs, env template, tests, deployment configs and this `PROJECT.md` (but no secrets, caches or raw transcript data).
3. Push to `main`. Verify the remote repo URL and its latest SHA; do not just print proposed git commands.
4. Prefer a private repo during sensitive integration until review, or a public repo after verifying that committed source, fixtures, history, and build outputs are free of sensitive data; ask only if GitHub visibility needs owner choice. Portfolio itself will be public.
5. Make `README.md` clear, with architecture, local development, environment variable list (no real values), test commands, deployment/update/rollback commands, and privacy model.
6. If GitHub access fails, finish and test locally, preserve complete working tree and exact commit, then ask for authentication/access. Resume push immediately once unblocked.

**No pre-existing repo may be deleted, rewritten, force-pushed, or made public as a side effect.**

---

## 9. Deploy to owner's EXISTING Oracle Cloud Ubuntu VM

### Context already known

Owner already operates two independent Node-based services on the VM:
- FLEX-WATCHER (existing academic marks watcher; do not interfere).
- CP-WATCHER (existing contest notification watcher; do not interfere).

Do not assume either service name, user, runtime, port, paths or resource profile without checking the **actual machine**. Some repositories contain README examples that differ from production. The known CP-WATCHER docs mention `/opt/cp-watcher`, `/var/lib/cp-watcher`, and `cp-watcher.timer`; the FLEX repo documentation mentions `/opt/flex-marks-notifier` and `flex-marks-notifier.service`. Verify reality instead of assuming it.

### Oracle access gate — ask AFTER build and GitHub push, then deploy

Ask the owner for the minimum:
- Oracle public IP or hostname; default SSH user if known (likely `ubuntu`, but verify).
- The SSH key **FILE PATH** on the machine where Codex runs, or an authorized secure SSH agent/access mechanism. **NEVER ask to paste the private key text into chat.**
- Whether the owner has a domain/subdomain he wants to use. **Domain is optional**; if none, proceed with a publicly reachable IP-based test site and disclose HTTP/HTTPS limitations. Do not make paid purchases.
- One-time owner approval of publicly displayed **verified transcript fields** and an authorized secure way to configure FLEX session if real transcript validation is pending.

If Codex is running remotely and cannot access the user's local SSH key, offer exact safe one-time access setup that does not expose the private key, or ask the user to run a minimal required local action, then resume deployment. Do not request VM/root passwords in chat.

### Safe deployment sequence

1. **Preflight, read-only:** Connect via SSH; check identity, OS, network, disk, RAM, free CPU, `systemctl` status of existing watchers, occupied ports (especially 80/443), Nginx status/config, firewall, existing domains, installed Node versions. Record baseline in private operator notes. If the VM lacks safe resources, choose an appropriately lightweight/static approach; do not degrade watchers.
2. **Isolate everything:** Use paths such as `/opt/ali-portfolio` and `/var/lib/ali-portfolio`; dedicated unprivileged `ali-portfolio` service user; separate `/etc/ali-portfolio.env` owned by root with mode `0600`; own systemd units `ali-portfolio-api.service`, `ali-portfolio-github-sync.timer`, `ali-portfolio-transcript-sync.timer` or equivalent. Work in separate ports under 127.0.0.1 only. Leave watcher systemd units, user accounts, environment files, data and timers unchanged.
3. **Get source from GitHub:** Clone the newly pushed repository. Install locked dependencies, build app. No arbitrary remote `curl | sudo bash` installation if a safer official/package-manager approach exists. Never run the web app as root.
4. **Nginx:** Create a new isolated `server` block, serving static frontend and reverse-proxying only `/api/public/*` to `127.0.0.1:PORT`. If an Nginx installation already serves another site, add a virtual host carefully — don't replace the global config. Test `nginx -t` before reload. Block dotfiles, config/secret paths, DB and backup locations from web exposure.
5. **Networking:** Check Oracle VCN/security list or NSG and Ubuntu firewall; open only minimum inbound TCP 80/443 where appropriate. Do not expose API internal port, databases, SSH credentials, or other watcher ports. If OCI console action cannot be performed with provided access, ask for only the specific VCN/NSG rule change needed, then retry the external URL.
6. **TLS:** Prefer trusted HTTPS with a user-owned domain or free subdomain if available and the owner approves. Obtain/auto-renew a trusted certificate through a supported ACME method. Do not claim HTTPS with a self-signed cert. If only an IP URL is available and trusted HTTPS cannot be set up reliably, provide a working HTTP IP test link, explain clearly that it lacks HTTPS, and offer a no-cost hostname path; do not invent certificate capabilities or buy anything.
7. **Service lifecycle:** Enable only newly created systemd units/timers to start on boot; use restart limits, small resource footprint, journald logs, timeouts. Keep secrets out of environment dumps and logs.
8. **Backups/rollback:** Before any change to shared Nginx config, save a timestamped backup. Supply exact rollback to last known good site configuration. Existing watchers must remain unaffected. Be especially careful with global package upgrades or firewall changes.
9. **Live checks:** From outside the VM when possible, request the real public URL, verify HTTP response, header/nav, CSS/JS loading, API data, health, GitHub cache, cache timestamps, and no leaking of hidden env/db routes. On VM, check service status and logs. Also verify both pre-existing watchers still have their original running/enabled state after deployment.
10. **Restart test:** At least restart the **new** units and verify site recovery. Do NOT reboot the VM casually since that could disrupt watchers; check systemd enablement/readiness instead, unless owner separately approves a reboot.

If blocked by a cloud-console setting, ask the owner for the exact action, NOT a vague full tutorial. Once they confirm, recheck externally. Prefer deployment now over “instructions for the owner to deploy later.”

---

## 10. Security, privacy and robustness checklist

- Treat authenticated FLEX data as **private by default**, even if owner wants to share selected grades.
- Credentials/cookies live only in protected config/secret stores; never frontend, git history, test snapshots, console screenshots, API output, URLs, query strings, or generic debug logs.
- No bypass of Cloudflare/Turnstile/CAPTCHA or terms/policies.
- Avoid SSRF: constrain FLEX origin to the official expected HTTPS hostname; constrain GitHub requests to official allowed API hosts.
- Control timeouts, retries, backoff, and concurrent polling. Do not duplicate work upon restarts.
- Private snapshot immutable on invalid refresh; public projection only from approved validated data.
- Require explicit approval before making any complete transcript dataset public; sanitize metadata and course fields.
- Apply basic security headers (reasonable CSP, X-Content-Type-Options, Referrer-Policy, and others as compatible) and TLS where available.
- Never ship admin endpoints publicly, unrestricted filesystem routes, exposed `.git` directories, unprotected dotenv/SQLite files, or directory listing.
- Keep any session expiry alerts private. Do not display a public “FLEX cookie expired” state.
- Validate all external API responses, and escape or sanitize all untrusted text before rendering.
- No secrets in `PROGRESS.md`, README, deployment reports, or commit messages.
- Gracefully handle public APIs being offline without blanking the site.

---

## 11. Step-by-step autonomous execution order

Do these without waiting for additional permission unless a specific external access/security gate requires it:

**Phase A — Inspect and implement**
1. Check local directory, git, GitHub access, environment/runtime, and read existing watcher repos only as necessary for compatibility.
2. Implement React UI/design system and all sections with authentic content/empty states.
3. Implement server API with strict public schemas and secure cache persistence.
4. Implement GitHub scheduled sync and curated projects.
5. Implement transcript collector/parser with isolated config, fixture testing, private last-good cache and public allowlist; do not fabricate a verified FLEX transcript format.
6. Implement all automated and visual quality checks; run and fix until green.

**Phase B — Publish**
7. Create NEW repo; commit/push source. Verify repo URL and SHA.

**Phase C — Deploy**
8. Ask for Oracle SSH/hostname details only if not already accessible; obtain access securely.
9. Inspect VM, isolate application, install/build/configure service + Nginx + networking/TLS when feasible.
10. Prove the public URL works and that existing watchers remain healthy.

**Phase D — Integrate real transcript data and handoff**
11. If real transcript URL/capture/session/public-field approval hasn't been provided, ask precisely for these and finish validation when available. An early public launch can still proceed with the honest empty academic detail state.
12. Run end-to-end production checks, update docs/README, commit any final improvements, repush, redeploy if needed.
13. Report only verified results in concise final handoff.

### Conversation behavior / anti-stop protocol

- During active work, a short status update is fine, **but keep working in the same execution until a real blocker or actual completion**.
- A tool command error is a debugging task, not an excuse to stop. Diagnose, fix, retry safely.
- A failing test means fix it; don't report a greenlight based on partial tests.
- If implementation takes many tool calls, continue across them rather than waiting for a prompt like `continue`.
- If genuinely blocked by owner input, explain exactly: `Completed: ... / Blocked on: ... / Please provide: ... / Next action after input: ...`. Then resume on reply, without asking for reapproval of already authorized ordinary tasks.
- Never use sample content or dummy endpoints to quietly declare production integration complete.

---

## 12. Final response format to owner

After all available work, report:

```text
Portfolio: [live URL, and is it HTTPS?]
GitHub: [repo URL] at [verified commit SHA]
Visuals: [desktop/mobile verification result]
GitHub feed: [LIVE / CACHED / BLOCKED, last successful refresh]
Transcript: [VERIFIED LIVE / VERIFIED CACHED / AWAITING AUTHORIZED SESSION];
            [which public fields the owner approved, last good sync if any]
Oracle: [new units/paths, Nginx status, health status]
Existing watchers: [checked unchanged, healthy status or specific discrepancy]
Tests: [commands and results]
Privacy: [secret scan and public API projection result]
Open external blocker(s): [specific information/action ONLY if still blocked]
Maintenance: [how to update site and renew FLEX session safely]
```

Include NO secret values, private keys, cookies or raw transcript HTML in this report.

---

## 13. Immediate first action

**Start coding now.** Inspect the current workspace and available GitHub tools. Implement a genuinely polished MVP and the backend integrations, run the tests, create/push the new repository, then request only the Oracle access or private-data approvals you truly need and deploy. You are responsible for carrying it to a verified public URL. **Do not stop at a project plan, a mockup, a development screenshot, or a “ready to deploy” message.**
