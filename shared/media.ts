export type EditorialImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  reference?: { label: string; url: string };
};

// Replace an image here without changing the card layout. All assets are local.
export const projectImages: Partial<
  Record<import("./content.js").FeaturedProject, EditorialImage>
> = {
  "FLEX-WATCHER": {
    src: "/images/flex.webp",
    width: 480,
    height: 1040,
    alt: "Phone lock screen showing a FLEX marks update email notification, with the email address obscured.",
    caption: "FLEX marks notification · supplied screenshot.",
  },
  "Neural-Network": {
    src: "/images/neural-network.svg",
    width: 800,
    height: 600,
    alt: "Schematic multilayer neural network, with forward values and backward gradients.",
    caption: "A schematic view of layers and gradient flow.",
  },
  "Blackwood-Hargrove-Editor": {
    src: "/images/arcanum-editor.webp",
    width: 1200,
    height: 587,
    alt: "Blackwood & Hargrove running on Windows, showing a two-column text page and document statistics.",
    caption: "The Arcanum Editor · application screenshot.",
  },
  PF_Project: {
    src: "/images/tumblepop-reference.webp",
    width: 640,
    height: 360,
    alt: "Original Tumble Pop arcade gameplay with characters on layered platforms.",
    caption: "Original arcade game · visual reference for the project.",
    reference: {
      label: "Image: GOG / Data East",
      url: "https://www.gog.com/dreamlist/game/tumblepop-1991",
    },
  },
};
