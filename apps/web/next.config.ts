import type { NextConfig } from "next";

// Photos come from the CMS uploads; Next resizes them per screen and converts to WebP (cached on the web server).
const cms = new URL(process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{
      protocol: cms.protocol.replace(":", "") as "http" | "https",
      hostname: cms.hostname,
      port: cms.port,
      pathname: "/uploads/**",
    }],
    formats: ["image/webp"],
    // Upload file names carry a hash, a changed photo gets a new URL.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Local development: the CMS runs on localhost.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  async redirects() {
    return [
      {
        source: "/catalog/mizhkimnatni-dveri",
        destination: "/catalog/mizhkimnatni",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
