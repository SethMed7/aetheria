import type { MetadataRoute } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${basePath}/`,
    name: "Aetheria — Generative Background Studio",
    short_name: "Aetheria",
    description: "Shape, save, and export cinematic procedural backgrounds.",
    start_url: `${basePath}/`,
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
        src: `${basePath}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: `${basePath}/aetheria-preview.webp`,
        sizes: "1440x900",
        type: "image/webp",
        form_factor: "wide",
        label: "Aetheria generative background studio",
      },
    ],
  };
}
