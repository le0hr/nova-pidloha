"use client";

import { useRef, useState, type MouseEvent } from "react";

/** At most this many variation photos per card (keeps the catalog light). */
const MAX_IMAGES = 6;

/**
 * Card photos of the product's variations.
 * Mouse: the horizontal cursor position picks the photo (card split into equal zones).
 * Touch: a native horizontal swipe with snap; a tap still opens the product.
 * Both drive one scroll container, so the segment bar below works the same way.
 */
export default function CardImages({ images, alt, className }: { images: string[]; alt: string; className: string }) {
  const list = images.slice(0, MAX_IMAGES);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const show = (index: number) => {
    const element = track.current;
    if (!element || index === active) return;
    element.scrollTo({ left: index * element.clientWidth, behavior: "instant" });
    setActive(index);
  };

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    show(Math.min(list.length - 1, Math.max(0, Math.floor(((event.clientX - box.left) / box.width) * list.length))));
  };

  const onScroll = () => {
    const element = track.current;
    if (element) setActive(Math.round(element.scrollLeft / Math.max(1, element.clientWidth)));
  };

  if (!list.length) {
    return <span className={`${className} flex items-center justify-center bg-[#f5f5f5] font-outfit text-sm text-[#666]`}>Фото готується</span>;
  }

  return (
    <div className={`${className} relative`}>
      <div
        ref={track}
        onMouseMove={list.length > 1 ? onMouseMove : undefined}
        onMouseLeave={list.length > 1 ? () => show(0) : undefined}
        onScroll={list.length > 1 ? onScroll : undefined}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [@media(hover:hover)]:overflow-x-hidden"
      >
        {list.map((src, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={index ? `${alt}, варіант ${index + 1}` : alt} loading={index ? "lazy" : undefined}
            draggable={false} className="h-full w-full shrink-0 snap-start object-cover" />
        ))}
      </div>
      {list.length > 1 && (
        <div className="pointer-events-none absolute inset-x-3 bottom-2 flex gap-1" aria-hidden>
          {list.map((src, index) => (
            <span key={src} className={`h-[3px] flex-1 transition-colors ${index === active ? "bg-[#e53935]" : "bg-white/70"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
