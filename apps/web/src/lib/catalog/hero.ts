import type { HeroSlide, HeroBlock } from "@/types/home";

export type RawHeroSlide = {
  body?: HeroBlock[] | null;
  badge?: string | null;
  mobileImage?: { url: string } | null;
  alignment?: "left" | "center" | "right";
  enabled?: boolean;
  kind: "promotion" | "map";
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  mobileDescription?: string | null;
  image?: { url: string } | null;
  imageAlt?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  secondaryButtonLabel?: string | null;
  secondaryButtonUrl?: string | null;
  mapEmbedUrl?: string | null;
  mapTitle?: string | null;
};
export type HeroSettings = {
  heroEnabled?: boolean;
  heroSlides?: RawHeroSlide[] | null;
  heroMap?: Partial<RawHeroSlide> | null;
};
const text = (value?: string | null) => value?.trim() || undefined;

export function heroLink(value?: string | null): string | undefined {
  const link = text(value);
  if (!link || /[\u0000-\u0020\\]/.test(link)) return undefined;
  if (link.startsWith("/") && !link.startsWith("//") || link.startsWith("#")) return link;
  try {
    const url = new URL(link);
    return ["https:", "http:", "tel:", "mailto:"].includes(url.protocol) ? link : undefined;
  } catch { return undefined; }
}
export function mapEmbed(value?: string | null): string | undefined {
  try {
    const url = new URL(value ?? "");
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    const google = ["www.google.com", "maps.google.com"].includes(url.hostname) &&
      (url.pathname === "/maps/embed" || url.pathname.startsWith("/maps/embed/") ||
        url.pathname === "/maps" && url.searchParams.get("output") === "embed");
    const osm = ["www.openstreetmap.org", "openstreetmap.org"].includes(url.hostname) &&
      url.pathname === "/export/embed.html";
    return google || osm ? url.toString() : undefined;
  } catch { return undefined; }
}
function normalizeSlides(slides: RawHeroSlide[]): HeroSlide[] {
  return slides.filter((slide) => slide.enabled !== false && text(slide.title)).map((slide) => {
    let image: string | undefined;
    if (slide.image?.url) {
      try {
        const url = new URL(slide.image.url, process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337");
        if (["http:", "https:"].includes(url.protocol)) image = url.toString();
      } catch { /* A text-only slide remains usable without its image. */ }
    }
    return {
      body: Array.isArray(slide.body) ? slide.body : undefined,
      badge: text(slide.badge),
      mobileImage: mediaImage(slide.mobileImage?.url),
      alignment: slide.alignment,
      kind: slide.kind,
      title: slide.title.trim(),
      eyebrow: text(slide.eyebrow),
      description: text(slide.description),
      mobileDescription: text(slide.mobileDescription),
      image,
      imageAlt: text(slide.imageAlt),
      label: text(slide.buttonLabel),
      href: heroLink(slide.buttonUrl),
      secondaryLabel: text(slide.secondaryButtonLabel),
      secondaryHref: heroLink(slide.secondaryButtonUrl),
      mapEmbedUrl: mapEmbed(slide.mapEmbedUrl),
      mapTitle: text(slide.mapTitle),
    };
  });
}

function mediaImage(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337");
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch { return undefined; }
}

export function normalizeHero(settings: HeroSettings | null): HeroSlide[] {
  const permanentMap: HeroSlide = {
    kind: "map",
    title: "Наші магазини",
    eyebrow: "Нова Підлога та Двері",
    description: "Підлога та двері у Черкасах. Обирайте наживо у наших виставкових залах.",
    mapTitle: "Мапа магазинів Нова Підлога та Двері",
  };
  const banners = settings?.heroSlides?.filter((slide) => slide.kind !== "map");
  const promotions = settings?.heroEnabled === false ? [] : normalizeSlides(banners ?? []);
  return [permanentMap, ...promotions];
}
