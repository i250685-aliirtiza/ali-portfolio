# Portfolio 2.0 Roadmap

Repository: `ali-portfolio`  
Baseline commit: `01817f1` (`Add approved LinkedIn and email contact links`)  
Audit date: 2026-11-06 (Asia/Karachi)  
Current phase: **PHASE 02 — BEAUTIFUL HERO SECTION**  
Status: **COMPLETED**

## Phase status

| Phase | Name | Status | Commit | Evidence |
|---|---|---|---|---|
| 00 | Full baseline audit and design specification | COMPLETED | `67d77a3` | `docs/evidence/phase-00/` |
| 01 | Premium design system | COMPLETED | `f156d33` | `docs/evidence/phase-01/` |
| 02 | Beautiful hero section | COMPLETED | `PENDING` | `docs/evidence/phase-02/` |
| 03 | Navigation, scrolling and page transitions | NOT STARTED | — | — |
| 04 | Featured project showcase redesign | NOT STARTED | — | — |
| 05 | Individual project case-study pages | NOT STARTED | — | — |
| 06 | Interactive neural network demo | NOT STARTED | — | — |
| 07 | Arcanum Editor & Tumblepop showcase | NOT STARTED | — | — |
| 08 | FLEX Watcher interactive demonstration | NOT STARTED | — | — |
| 09 | Content, competitions, about and contact | NOT STARTED | — | — |
| 10 | Academics dashboard and API experience | NOT STARTED | — | — |
| 11 | Complete mobile and cross-browser polish | NOT STARTED | — | — |
| 12 | Performance and animation optimization | NOT STARTED | — | — |
| 13 | SEO, social previews and professional polish | NOT STARTED | — | — |
| 14 | Security, reliability and automated test expansion | NOT STARTED | — | — |
| 15 | Production deployment to Oracle VM | NOT STARTED | — | — |
| 16 | Final production boss test | NOT STARTED | — | — |

## Phase 00 — Baseline audit

### Scope inspected

- React 19 + TypeScript 7 + Vite 8 client in `src/main.tsx` and `src/style.css`.
- Shared editorial content, project allowlist, media metadata and Zod contracts in `shared/`.
- Native Node API, GitHub synchronizer, transcript parser/cache and worker scheduling in `server/`.
- Browser, unit and backend tests in `tests/`; Playwright and Vitest configuration.
- Deployment scripts, Nginx config, systemd units and rollback documentation in `deploy/` and `docs/`.
- Existing accessibility, error-boundary, stale-cache and API outage behavior.

### Current page inventory

1. Header with wordmark, desktop navigation and keyboard-capable mobile menu.
2. Hero with identity, two CTAs and dark “The Workbench” focus panel.
3. Selected Work: four authored projects in a featured-first grid.
4. Current Focus / in-progress interests.
5. Academics dashboard with CGPA provenance, semester selector and course table.
6. Competitive Programming section with verified milestone links.
7. Competitions archive with NaSCon ’26 event details and authentic image.
8. Beyond Code / badminton story with authentic image.
9. Notes placeholder state (empty until authored posts exist).
10. Contact CTA and footer.

### Baseline visual findings

- The current aesthetic is coherent and restrained: warm off-white canvas, forest-green accent, dark technical panel, IBM Plex Sans/Mono, thin borders and editorial section labels.
- The long page has a clear section rhythm and strong factual restraint. The four project cards remain visible when metadata APIs fail.
- Desktop hierarchy is solid but conservative. The hero headline and work section are the strongest anchors; later sections become visually similar because most use the same two-column heading/content pattern.
- The project grid is readable but card geometry is repetitive. The primary Neural Network card has useful visual weight; the other three cards have less distinct interaction or visual storytelling.
- The page is information-dense at 1440px and becomes very tall. This is acceptable for a portfolio, but future phases should improve wayfinding and section transitions without hiding content.
- Mobile baseline is functional and stacked. The long page and dense project copy make scanability the main opportunity; touch targets and menu behavior are already covered by browser tests.
- Existing CSS includes reduced-motion handling, responsive breakpoints at 960px/680px, and mostly transition-based interactions. There are no continuous particle or canvas effects.

### Functional and reliability findings

- `/api/public/projects` and `/api/public/academics` are schema-validated in the browser with ten-second aborts and stale-safe authored fallbacks.
- The React error boundary preserves a useful recovery path to GitHub.
- The backend preserves last-good snapshots and keeps transcript fields explicitly bounded; private IDs, cookies and raw captures stay outside the public contract.
- The four featured repository links are exact and allowlisted: `Neural-Network`, `Blackwood-Hargrove-Editor`, `PF_Project`, `FLEX-WATCHER`.
- Existing browser coverage verifies API outage rendering, HTML escaping, semester switching, keyboard menu behavior, no horizontal overflow, image loading, route anchors and axe WCAG 2A/2AA/2.1AA checks.
- No implementation changes were made in Phase 00.

## Design specification for Phase 01 onward

### Direction

Keep the existing editorial/technical identity and make it more intentional: warmer paper-like surfaces, deeper ink contrast, a slightly more expressive green range, stronger typographic scale, and clearer distinctions between featured work, supporting information and utility states. Avoid neon gradients, glassmorphism and decorative particle fields.

### Tokens

- Canvas: warm ivory/off-white; elevated surfaces: quiet white; technical surfaces: deep forest charcoal.
- Ink: near-black green-charcoal; muted text: cool olive-gray; rules: low-contrast sage-gray.
- Accent: forest green for links, status and primary actions; pale green tint for selected/secondary surfaces.
- Geometry: small, consistent radii for controls; larger radius only for major panels; 1px rules and restrained shadows.
- Type: IBM Plex Sans for prose/headings and IBM Plex Mono for metadata, labels and system states. Use fluid `clamp()` sizes and preserve readable line lengths.

### Layout conventions

- Keep a max content width around 1168px with mobile-safe side padding.
- Use a consistent section rhythm with deliberate variation between feature sections and data sections.
- Reserve the strongest scale and contrast for the hero and featured projects.
- Keep all content available without JavaScript; animations reveal or accent content rather than gate it.
- Ensure 320px, 375/390px, tablet and 1440px layouts have no horizontal overflow.

### Component conventions

- Buttons: clear primary/secondary hierarchy, 44px+ touch target, visible keyboard focus and useful arrow affordance.
- Cards: distinct featured, supporting and data-card treatments; consistent metadata and status placement.
- Links: obvious external-link treatment and preserved exact destinations.
- Data states: loading, stale, unavailable and empty states remain explicit and calm.
- Media: authentic supplied images only; preserve alt text, dimensions and lazy loading.

### Motion conventions

- Use short transform/opacity reveals and hover transitions with CSS or a small motion primitive.
- Prefer one-shot section entrances and restrained card affordances over continuous effects.
- Honor `prefers-reduced-motion: reduce` by disabling transforms, transitions and animation delays.
- Avoid layout-thrashing scroll listeners and expensive background animation.

### Accessibility and QA gates

Every phase must re-run typecheck/build, unit tests and browser tests as applicable; capture desktop and mobile screenshots; check console errors, horizontal overflow and axe results; and inspect rendered screenshots rather than relying on source or build output alone.

## Phase 00 verification record

### Commands

- `npm run build` — PASS
- `npm test` — PASS (3 files, 51 tests)
- `npm run test:browser` — PASS (7 tests, Chromium)
- Playwright screenshots captured at 375px, 768px and 1440px, including homepage, work, competitions and academics states.

### Evidence

- [Desktop homepage baseline](evidence/phase-00/baseline-home-1440.png)
- [Mobile homepage baseline](evidence/phase-00/baseline-home-375.png)
- [Desktop work baseline](evidence/phase-00/baseline-work-1440.png)
- [Mobile academics baseline](evidence/phase-00/baseline-academics-375.png)

### Remaining issues / accepted compromises

- Browser boss tests currently exercise Chromium only; Safari/WebKit and real-device checks remain future phase work.
- Baseline screenshots are automated Chromium captures, not claims of physical-device verification.
- Phase 00 intentionally makes no website implementation changes.

### Commit

- Commit SHA: `26b3f93`
- Branch: `codex/portfolio-phase-00`
- Push: `origin/codex/portfolio-phase-00`


## Phase 01 — Premium design system

### Completed

- Added shared surface, ink, muted, border, accent, radius, shadow, spacing and easing tokens.
- Added fluid heading sizing with `clamp()` and a shared section spacing token.
- Standardized button geometry, hover/active feedback, focus rings and select states.
- Improved card and notes-panel geometry with restrained elevation.
- Preserved the existing IBM Plex typography, responsive breakpoints, content, integrations and reduced-motion behavior.

### Verification

- `npm run build` — PASS
- `npm test` — PASS (51 tests)
- `npm run test:browser` — PASS (7 Chromium tests at 375px, 768px and 1440px)
- Rendered screenshot review — PASS; no overflow, readability or hierarchy regressions observed.

### Files affected

- `src/style.css`
- `docs/PORTFOLIO_2_ROADMAP.md`

### Remaining issues

- The hero, navigation and project-specific visual storytelling remain intentionally unchanged for their dedicated phases.
- Cross-browser and real-device verification remain scheduled for Phase 11.

### Commit

- Commit SHA: `a47d870`
- Branch: `codex/portfolio-phase-00`
- Push: `origin/codex/portfolio-phase-00`


## Phase 02 — Beautiful hero section

### Completed

- Strengthened the hero’s responsive scale with fluid typography and spacing.
- Added a staged, transform/opacity-only entrance for the hero copy and workbench.
- Improved the workbench panel with stronger hierarchy, quiet elevation and a restrained accent marker.
- Added subtle row hover feedback without changing content or interaction semantics.
- Preserved meaningful technical focus content, working CTAs, mobile stacking and reduced-motion fallback.

### Verification

- `npm run build` — PASS
- `npm test` — PASS (51 tests)
- `npm run test:browser` — PASS (7 Chromium tests at 375px, 768px and 1440px)
- Screenshot review — PASS; hero remains readable and balanced on desktop and mobile.

### Files affected

- `src/style.css`
- `docs/PORTFOLIO_2_ROADMAP.md`

### Remaining issues

- Header behavior, active navigation and scroll-linked transitions remain scheduled for Phase 03.
- Project-specific visual interaction remains scheduled for Phase 04.

### Commit

- Commit SHA: `PENDING`
- Branch: `codex/portfolio-phase-00`
- Push: `PENDING`
