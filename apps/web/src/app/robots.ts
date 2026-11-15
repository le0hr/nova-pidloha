import type { MetadataRoute } from "next";
import { absoluteUrl, indexable } from "@/lib/seo";

// Depends on WEB_PUBLIC_URL at run time, not at image build time.
export const dynamic = "force-dynamic";

/** On the real HTTPS domain: everything except cart, checkout and API. Elsewhere (IP, localhost): nothing. */
export default function robots(): MetadataRoute.Robots {
  if (!indexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
