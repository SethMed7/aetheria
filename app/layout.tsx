import type { Metadata, Viewport } from "next";
import { PwaRegistration } from "@/components/PwaRegistration";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Aetheria",
  title: "Aetheria — Generative Background Studio",
  description: "Shape, save, and export cinematic procedural backgrounds from a fast WebGL canvas.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aetheria",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Aetheria — Generative Background Studio",
    description: "A live generative instrument for cinematic backgrounds.",
    siteName: "Aetheria",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#05070d",
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
