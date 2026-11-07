import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import HomeIcon from "./HomeIcon";

/** Shared carousel size for homepage cards; the "next" button sits 40px above the bottom of the photo. */
export const homeCardCarousel = {
  className: "h-[355px] bg-white md:h-[397px]",
  controlClassName: "top-[160px] md:top-[210px]",
};

/** Homepage card used by both "Популярні товари" and "Наші категорії". */
export default function HomeCard({ title, href, image, imagePortrait, badge, description, footer, actionLabel, linkContent = false }: {
  title: string;
  href: string;
  image: string | null;
  /** Tall photos (doors) are shown whole instead of cropped. */
  imagePortrait?: boolean;
  badge?: string;
  description?: string;
  /** Left side of the bottom row, e.g. the price. */
  footer?: ReactNode;
  actionLabel: string;
  /** Also link the photo and title; otherwise only the button navigates. */
  linkContent?: boolean;
}) {
  const media = <>
    {image
      ? <Image src={image} alt={title} fill sizes="(min-width: 1024px) 24vw, 48vw" unoptimized={image.startsWith("http")} className={imagePortrait ? "object-contain py-2" : "object-cover"} />
      : <span className="flex h-full items-center justify-center bg-[#f5f5f5] text-sm text-[#666]">Фото готується</span>}
    {badge && <span className="absolute top-2 left-2 bg-[#e53935] px-2 py-1 text-[10px] font-bold text-white md:top-3 md:left-3 md:text-xs">{badge}</span>}
  </>;
  const mediaClass = "relative block h-[200px] shrink-0 overflow-hidden md:h-[250px]";

  return (
    <article className="flex h-full min-w-0 flex-col bg-white">
      {linkContent
        ? <Link href={href} className={`group ${mediaClass} focus-visible:outline-2 focus-visible:outline-[#e53935]`}>{media}</Link>
        : <div className={mediaClass}>{media}</div>}
      <div className="flex flex-1 flex-col gap-2 px-2.5 pt-2.5 pb-2 md:gap-3 md:px-4 md:pt-3 md:pb-3">
        <h3 className="line-clamp-1 text-xs font-medium leading-snug md:text-sm" title={title}>
          {linkContent ? <Link href={href} className="hover:text-[#e53935]">{title}</Link> : title}
        </h3>
        {description && <p className="line-clamp-2 text-[11px] leading-[1.4] text-[#666] md:text-xs">{description}</p>}
        <div className={`mt-auto flex flex-col gap-2 md:flex-row md:items-end ${footer ? "md:justify-between" : "md:justify-end"}`}>
          {footer}
          <Link href={href} aria-label={`${actionLabel}: ${title}`} className="flex min-h-11 items-center justify-center gap-2 bg-[#e53935] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#c62828] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e53935]"><span>{actionLabel}</span><HomeIcon name="arrow-white" size={14} /></Link>
        </div>
      </div>
    </article>
  );
}
