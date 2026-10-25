# Media and competitions

Project image sources, alt text, dimensions and captions live in `shared/media.ts`. Replace the editor entry's local asset path and dimensions to change its screenshot; the layout preserves proportions. Images are bounded, lazy-loaded and served locally, with no third-party browser requests. FLEX Watcher retains its restrained process diagram.

## Asset provenance

- `neural-network.svg`: original schematic illustration of an MLP and gradient flow. It is representative, not a claim about one exact trained architecture.
- `arcanum-editor.webp`: owner-supplied Blackwood & Hargrove screenshot, resized proportionally to 1200 × 587.
- `tumblepop-reference.webp`: original arcade gameplay reference from [GOG's TumblePop page](https://www.gog.com/dreamlist/game/tumblepop-1991), downloaded from its images.gog.com image service. Copyright in original game imagery remains with its rights holders; this is not an open-license asset or a screenshot of PF_Project. The visible caption attributes GOG / Data East and labels it as an original-game reference. Converted to a bounded 640 × 360 WebP; no game execution claimed.
- `nascon-2026.webp`: owner's supplied NaSCon photograph, resized proportionally to 1200 × 900. EXIF metadata is not copied. The source file and unoptimized originals are not committed.

## Adding an event

Append a `CompetitionEvent` to `shared/competitions.ts`. Include the event year, organizer and individual category results. Use an exact ISO date only when known. Optional photographs have local paths, dimensions and descriptive alt text. Optional commentary, official reference links and earned distinctions are supported; omit unsupported fields. Sorting uses descending year then known date and preserves input order for ties. A neutral reserved area renders when an event has no photograph.

NaSCon 2026 outcomes and event context are owner-provided. No exact date, awards, ranking or wins are asserted. All four categories belong to one event. The supplied photograph replaces the initially requested placeholder.
