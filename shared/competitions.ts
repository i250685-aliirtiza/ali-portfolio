import type { EditorialImage } from "./media.js";

export type CompetitionEvent = {
  id: string;
  name: string;
  year: number;
  /** ISO calendar date, only when known. */
  date?: string;
  organizer: string;
  location?: string;
  categories: { name: string; result: string }[];
  commentary?: string;
  photographs?: EditorialImage[];
  references?: { label: string; url: string }[];
  distinctions?: { category: string; award?: string; ranking?: string }[];
};

export function newestFirst(
  entries: readonly CompetitionEvent[],
): CompetitionEvent[] {
  return [...entries].sort(
    (a, b) => b.year - a.year || (b.date ?? "").localeCompare(a.date ?? ""),
  );
}

export const competitions: readonly CompetitionEvent[] = [
  {
    id: "nascon-2026",
    name: "NaSCon ’26",
    year: 2026,
    organizer: "FAST-NUCES Islamabad",
    location: "Islamabad",
    categories: [
      { name: "Bug Busters", result: "Advanced to the final round" },
      { name: "Code Craft", result: "Advanced to Round 2" },
      { name: "C++ Face Off", result: "Participated" },
      { name: "Speed Programming", result: "Participated" },
    ],
    photographs: [
      {
        src: "/images/nascon-2026.webp",
        width: 1200,
        height: 900,
        alt: "Three participants wearing event lanyards, seated together at NaSCon 2026.",
        caption: "NaSCon 2026 · FAST-NUCES Islamabad.",
      },
    ],
  },
];
