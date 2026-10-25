export const featured = [
  "FLEX-WATCHER",
  "CP-WATCHER",
  "Sorting-Visualizer",
] as const;
export const caseStudies: Record<
  string,
  { intro: string; decision: string; tags: string[] }
> = {
  "FLEX-WATCHER": {
    intro:
      "A small service that watches for released or changed assessment marks and sends an email when something changes.",
    decision:
      "Authenticated responses are checked before parsing. A last-good snapshot keeps temporary failures from becoming false notifications.",
    tags: ["Node.js", "HTML parsing", "Automation"],
  },
  "CP-WATCHER": {
    intro:
      "Competitive programming opportunities, collected from contest platforms and official feeds in one place.",
    decision:
      "Source adapters fail independently. Normalized events in SQLite and stable source IDs keep repeated discoveries from becoming repeated alerts.",
    tags: ["Node.js", "SQLite", "Scheduled jobs"],
  },
  "Sorting-Visualizer": {
    intro:
      "A closer look at sorting: step through an algorithm, inspect its state, and move backward to understand a decision.",
    decision:
      "Built with JavaScript modules, with synchronized pseudocode and contextual visualizations for different algorithms.",
    tags: ["JavaScript", "Algorithms", "Visualization"],
  },
};
// Add only owner-authored writing and verified events. Empty arrays are intentional.
export const notes: { title: string; date: string; url: string }[] = [];
export const milestones: { title: string; date: string; evidence: string }[] =
  [];
