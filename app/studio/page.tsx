import type { Metadata } from "next";
import { Studio } from "@/components/Studio";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Shape, save, share, and export a procedural halftone background from your browser.",
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
