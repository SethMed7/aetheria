import type { Metadata } from "next";
import { Studio } from "@/components/Studio";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Explore seven procedural styles, shape the flow, and preview your full-resolution wallpaper before downloading.",
  alternates: {
    canonical: "/studio",
  },
  openGraph: {
    title: "Aetheria Studio",
    description:
      "A fast, local-first WebGL instrument for cinematic procedural backgrounds.",
    url: "/studio",
  },
};

export default function StudioPage() {
  return <Studio />;
}
