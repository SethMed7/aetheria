import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const staticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  basePath,
  ...(staticExport ? {
    output: "export" as const,
    trailingSlash: true,
  } : {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ],
        },
        {
          source: "/sw.js",
          headers: [
            { key: "Content-Type", value: "application/javascript; charset=utf-8" },
            { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
            { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
