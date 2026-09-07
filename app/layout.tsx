import type { Metadata, Viewport } from "next";
import { PwaRegistration } from "@/components/PwaRegistration";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Aetheria",
  metadataBase: new URL("https://aetheria.sethmedina.com"),
  title: {
    default: "Aetheria | Generative Background Studio",
    template: "%s | Aetheria",
  },
  description:
    "Download free 4K procedural backgrounds or shape your own in an open-source WebGL studio.",
  authors: [{ name: "Seth Medina", url: "https://sethmedina.com" }],
  creator: "Seth Medina",
  category: "design",
  keywords: [
    "generative art",
    "procedural backgrounds",
    "WebGL",
    "wallpaper generator",
    "open source design tool",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aetheria",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Aetheria | Generative Background Studio",
    description:
      "Free 4K procedural backgrounds and a local-first WebGL studio.",
    url: "/",
    siteName: "Aetheria",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#e8eeee",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
