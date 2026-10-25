import { describe, expect, it } from "vitest";
import { competitions, newestFirst } from "../shared/competitions";

describe("competition chronology", () => {
  it("orders years and known dates newest first without mutating input", () => {
    const base = competitions[0];
    const entries = [
      { ...base, id: "old", year: 2025 },
      { ...base, id: "early", date: "2026-02-01" },
      { ...base, id: "late", date: "2026-09-01" },
    ];
    expect(newestFirst(entries).map((e) => e.id)).toEqual([
      "late",
      "early",
      "old",
    ]);
    expect(entries[0].id).toBe("old");
  });
});
