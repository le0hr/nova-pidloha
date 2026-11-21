/**
 * Resized WebP copies of site and CMS photos through Next's image optimizer, for plain <img> tags (card sliders,
 * gallery, thumbnails) where next/image does not fit. Other URLs (external, SVG) are returned unchanged.
 * The zoom (lightbox) keeps the CMS original, so a TV or a close look gets the full photo.
 */
const CMS = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");
// Next's default deviceSizes + imageSizes: only these widths are accepted by /_next/image.
const WIDTHS = [128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

export function optimizable(src: string | null | undefined): src is string {
  if (!src || /\.svg(\?|$)/i.test(src)) return false;
  return (src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/_next/")) || src.startsWith(`${CMS}/uploads/`);
}

/** URL of a copy `width` px wide (rounded up to an allowed width). */
export function imageSrc(src: string, width: number, quality = 75): string {
  if (!optimizable(src)) return src;
  const w = WIDTHS.find((allowed) => allowed >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`;
}

/** srcset from `min` to `max` px; pair it with a `sizes` attribute. */
export function imageSrcSet(src: string, max = 3840, min = 256): string | undefined {
  if (!optimizable(src)) return undefined;
  return WIDTHS.filter((w) => w >= min && w <= max).map((w) => `${imageSrc(src, w)} ${w}w`).join(", ");
}
