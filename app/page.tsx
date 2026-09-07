import type { Metadata } from "next";
import { Landing } from "@/components/Landing";

export const metadata: Metadata = {
  title: "Free Generative Backgrounds",
  description:
    "Download free 4K procedural backgrounds or create your own in Aetheria, an open-source WebGL studio.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Aetheria | Free Generative Backgrounds",
    description:
      "Download free 4K procedural backgrounds or shape your own in an open-source WebGL studio.",
    url: "/",
  },
};

export default function Home() {
  return <Landing />;
}
