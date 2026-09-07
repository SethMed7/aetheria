import type { MetadataRoute } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${basePath}/studio/`,
    name: "Aetheria | Generative Background Studio",
    short_name: "Aetheria",
    description: "Shape, save, and export cinematic procedural backgrounds.",
    start_url: `${basePath}/studio/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#05070d",
    orientation: "any",
    categories: ["design", "graphics", "productivity"],
    icons: [
      {
        src: `${basePath}/icons/aetheria-mark.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/aetheria-mark.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
