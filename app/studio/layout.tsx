import type { Viewport } from "next";

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#080b0f",
  viewportFit: "cover",
};

export default function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
