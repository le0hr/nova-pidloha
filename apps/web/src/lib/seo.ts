import type { Metadata } from "next";
import { graphqlFetch, mediaUrl } from "@/lib/client";

/**
 * SEO helpers. Every page builds its title/description from catalog data; the optional CMS component
 * `seo` (plugin @strapi-community/plugin-seo, `shared.seo`) overrides any field the manager filled in.
 */
export const SITE_NAME = "Нова Підлога та Двері";
export const SITE_CITY = "Черкаси";

/** Public origin of the site (WEB_PUBLIC_URL), used for canonical URLs, sitemap and structured data. */
export function siteUrl(): string {
  return (process.env.WEB_PUBLIC_URL || "http://localhost:3000").replace(/\/$/, "");
}
export const absoluteUrl = (path: string) => new URL(path, `${siteUrl()}/`).toString();

/**
 * Indexing is allowed only on the real HTTPS domain: the site on a bare IP or localhost must not get into Google
 * (it would compete with the domain as a duplicate). SEO_INDEXING=false turns it off explicitly, =true forces it.
 */
export function indexable(): boolean {
  const flag = process.env.SEO_INDEXING;
  if (flag === "true") return true;
  if (flag === "false") return false;
  try {
    const url = new URL(siteUrl());
    return url.protocol === "https:" && url.hostname !== "localhost" && !/^[\d.]+$/.test(url.hostname);
  } catch {
    return false;
  }
}

export type CmsSeo = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImage?: { url?: string | null; alternativeText?: string | null } | null;
  keywords?: string | null;
  metaRobots?: string | null;
  canonicalURL?: string | null;
  structuredData?: unknown;
  openGraph?: {
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: { url?: string | null } | null;
  } | null;
};

/** GraphQL selection for the `seo` component. */
export const SEO_FIELDS = `seo {
  metaTitle metaDescription keywords metaRobots canonicalURL structuredData
  metaImage { url alternativeText }
  openGraph { ogTitle ogDescription ogImage { url } }
}`;

/**
 * Fetches the `seo` component of one entry. Returns null on any error, so a CMS without the component
 * (rolling deploy) or a broken override never takes a page down.
 */
type SeoRow = { seo?: CmsSeo | null } | null;
type SeoResponse = { global?: SeoRow; products?: SeoRow[]; categories?: SeoRow[] };

export async function fetchSeo(query: string, variables: Record<string, unknown>, pick: (data: SeoResponse) => CmsSeo | null | undefined): Promise<CmsSeo | null> {
  try {
    return pick(await graphqlFetch<SeoResponse>(query, variables, { revalidate: 300 })) ?? null;
  } catch {
    return null;
  }
}

export const mediaUrlOrUndefined = (path: string | null | undefined) => (path ? mediaUrl(path) : undefined);

const text = (value: string | null | undefined) => value?.trim() || undefined;

/** Markdown/HTML to one line of plain text. */
export function plainText(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cuts at a word boundary, adds an ellipsis. */
export function clip(value: string, max: number): string {
  const line = value.replace(/\s+/g, " ").trim();
  if (line.length <= max) return line;
  const cut = line.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[\s,;:.–—-]+$/, "")}…`;
}

export const formatUah = (value: number) => `${Math.round(value).toLocaleString("uk-UA").replace(/ /g, " ")} ₴`;

function robots(value: string | null | undefined, fallback?: Metadata["robots"]): Metadata["robots"] {
  if (!indexable()) return { index: false, follow: false };
  const tokens = (value ?? "").toLowerCase().split(/[\s,]+/).filter(Boolean);
  if (!tokens.length) return fallback;
  return { index: !tokens.includes("noindex"), follow: !tokens.includes("nofollow") };
}

/**
 * Page metadata: automatic values from the catalog, each overridden by the CMS seo component when filled in.
 * `title` is the page part; the layout template appends " | Нова Підлога та Двері".
 */
export function pageMetadata(auto: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
}, seo?: CmsSeo | null): Metadata {
  const title = text(seo?.metaTitle) ?? auto.title;
  const description = clip(text(seo?.metaDescription) ?? auto.description, 160);
  const canonical = text(seo?.canonicalURL) ?? auto.path;
  const imagePath = seo?.openGraph?.ogImage?.url ?? seo?.metaImage?.url;
  const image = imagePath ? mediaUrl(imagePath) : auto.image;
  return {
    title,
    description,
    keywords: text(seo?.keywords),
    alternates: { canonical },
    robots: robots(seo?.metaRobots, auto.robots),
    openGraph: {
      type: auto.type ?? "website",
      siteName: SITE_NAME,
      locale: "uk_UA",
      url: canonical,
      title: text(seo?.openGraph?.ogTitle) ?? title,
      description: clip(text(seo?.openGraph?.ogDescription) ?? description, 200),
      ...(image ? { images: [{ url: image, alt: text(seo?.metaImage?.alternativeText) ?? auto.imageAlt ?? title }] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary" },
  };
}

/** Breadcrumb trail as schema.org BreadcrumbList. */
export function breadcrumbLd(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

/** Extra structured data the manager pasted into the CMS seo component (object or array of objects). */
export function cmsStructuredData(seo?: CmsSeo | null): object[] {
  const data = seo?.structuredData;
  if (!data || typeof data !== "object") return [];
  return (Array.isArray(data) ? data : [data]).filter((item) => item && typeof item === "object");
}
