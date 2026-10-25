// The entire showcase allowlist, in editorial order. Discovery never expands it.
export const featured = [
  "Neural-Network",
  "Blackwood-Hargrove-Editor",
  "PF_Project",
  "FLEX-WATCHER",
] as const;
export type FeaturedProject = (typeof featured)[number];
type CaseStudy = {
  title: string;
  category: string;
  intro: string;
  decision: string;
  tags: string[];
};
export const caseStudies: Record<FeaturedProject, CaseStudy> = {
  "Neural-Network": {
    title: "Neural Network from Scratch",
    category: "MACHINE LEARNING / FROM FIRST PRINCIPLES",
    intro:
      "A C++ neural-network library built without an external ML framework. Scalar computation graphs power reverse-mode automatic differentiation, backpropagation, and composable neuron, layer, and MLP classes.",
    decision:
      "Backpropagation walks the graph in reverse topological order and accumulates gradients through the chain rule. Hidden neurons use tanh; the output layer is linear. Separate arena allocators keep weights and biases alive while temporary graph memory is reset for each training sample.",
    tags: ["C++", "Automatic differentiation", "MLP", "Arena allocation"],
  },
  "Blackwood-Hargrove-Editor": {
    title: "Blackwood & Hargrove — The Arcanum Editor",
    category: "NATIVE WINDOWS / TEXT EDITING",
    intro:
      "A native C++ editor built with the Win32 API, a custom wide-character text buffer, and independent editor instances for multiple tabs.",
    decision:
      "A line, column, and page hierarchy connects buffer offsets to wrapping, rendering, selection, and cursor positions. Insertions shift the flat buffer. Case-insensitive search is scoped to the current page, with highlighted matches and a search history.",
    tags: ["C++", "Win32 API", "Text buffers", "Custom layout"],
  },
  PF_Project: {
    title: "Tumblepop — Programming Fundamentals Project",
    category: "GAME PROGRAMMING / COURSE PROJECT",
    intro:
      "A C++ and SFML arcade-platformer project with tile-based levels, animated ghosts and skeletons, and directional vacuum-capture logic.",
    decision:
      "A character grid represents the level for gravity and collision checks. Sprite-sheet regions provide animation frames, while separate functions handle movement and enemy capture. The source includes a character-selection screen and two level layouts.",
    tags: ["C++", "SFML", "Tile maps", "Sprite animation"],
  },
  "FLEX-WATCHER": {
    title: "FLEX Watcher",
    category: "SUPPORTING PROJECT / AUTOMATION",
    intro:
      "A Node.js service on Oracle Ubuntu that monitors authenticated FLEX assessment marks, detects changes against a persistent snapshot, and sends email notifications.",
    decision:
      "Responses are checked for login and challenge failures before parsing. Change detection runs against the last valid snapshot; failed requests preserve that baseline. Authentication uses a manually authorized session rather than automated login.",
    tags: ["Node.js", "Change detection", "Email", "Oracle Ubuntu"],
  },
};
// Only owner-authored writing and verified events belong here.
export const notes: { title: string; date: string; url: string }[] = [];
export const milestones: { title: string; date: string; evidence: string }[] =
  [];
