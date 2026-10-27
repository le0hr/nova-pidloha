import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
