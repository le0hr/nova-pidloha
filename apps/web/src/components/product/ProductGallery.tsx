"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductVariation } from "@/types/product";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

function getVariationLabel(variation: ProductVariation) {
  return [
    variation.decor?.name,
    variation.decor_color?.name,
    variation.decor_glass?.name,
  ]
    .filter(Boolean)
    .join(", ");
}

type Props = {
  edgeBadge?: string;
  variations: ProductVariation[];
  activeIndex: number;
  onSelectVariation: (variation: ProductVariation) => void;
};

export default function ProductGallery({
  edgeBadge,
  variations,
  activeIndex,
  onSelectVariation,
}: Props) {
  const touchStartX = useRef(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const [thumbnailScroll, setThumbnailScroll] = useState({
    overflows: false,
    canScrollLeft: false,
    canScrollRight: false,
  });
  const [open, setOpen] = useState(false);

  const activeVariation = variations[activeIndex];
  const hasActiveVariation = Boolean(activeVariation);

  useEffect(() => {
    const row = thumbnailsRef.current;
    if (!row) return;

    const updateScroll = () => {
      const maxScroll = row.scrollWidth - row.clientWidth;
      setThumbnailScroll({
        overflows: row.scrollWidth > (row.parentElement?.clientWidth ?? row.clientWidth) + 1,
        canScrollLeft: row.scrollLeft > 1,
        canScrollRight: row.scrollLeft < maxScroll - 1,
      });
    };

    const observer = new ResizeObserver(updateScroll);
    observer.observe(row);
    if (row.parentElement) observer.observe(row.parentElement);
    row.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", updateScroll);
    };
  }, [variations.length, hasActiveVariation]);

  useEffect(() => {
    const row = thumbnailsRef.current;
    const thumbnail = row?.children[activeIndex] as HTMLElement | undefined;
    if (!row || !thumbnail) return;

    const rowBounds = row.getBoundingClientRect();
    const thumbnailBounds = thumbnail.getBoundingClientRect();
    const delta = thumbnailBounds.left < rowBounds.left
      ? thumbnailBounds.left - rowBounds.left
      : Math.max(0, thumbnailBounds.right - rowBounds.right);
    row.scrollBy({
      left: delta,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [activeIndex, variations]);

  const scrollThumbnails = (direction: number) => {
    const row = thumbnailsRef.current;
    if (!row) return;
    row.scrollBy({
      left: direction * row.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  const slides = variations
    .filter((variation) => variation.image)
    .map((variation) => ({
      src: variation.image,
    }));

  const selectAt = (index: number) => {
    const variation = variations[index];
    if (variation) onSelectVariation(variation);
  };

  const prev = () =>
    selectAt(activeIndex === 0 ? variations.length - 1 : activeIndex - 1);
  const next = () =>
    selectAt(activeIndex === variations.length - 1 ? 0 : activeIndex + 1);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -40) next();
    else if (deltaX > 40) prev();
  };

  if (!activeVariation) return null;

  return (
    <div className="product-detail-gallery flex min-w-0 flex-col gap-3 md:gap-4 w-full">
      <div
        className="product-detail-image relative w-full aspect-[4/5] md:aspect-[1/1] overflow-hidden border border-[#e0e0e0] bg-[#f7f7f7]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={activeVariation.image}
          alt={getVariationLabel(activeVariation) || "Фото товару"}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={activeIndex}
          slides={slides}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 3,    
            zoomInMultiplier: 1.5,
          }}
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-4 top-4 flex p-[10px] justify-center items-center bg-[#F7F7F7]"
          aria-label="Відкрити фото"
        >
          <div className="flex w-[18px] h-[18px] content-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M15.7503 15.7503L12.4878 12.4878M8.25 6V10.5M6 8.25H10.5M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>

        {edgeBadge && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-[#1a1a1a] flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-1.5">
            <span className="block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white shrink-0" />
            <span className="font-['Outfit',sans-serif] font-semibold text-[11px] md:text-[12px] text-white whitespace-nowrap">
              {edgeBadge}
            </span>
          </div>
        )}

        {variations.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border border-[#e0e0e0] hover:bg-[#f7f7f7] transition-colors"
              aria-label="Попереднє фото"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border border-[#e0e0e0] hover:bg-[#f7f7f7] transition-colors"
              aria-label="Наступне фото"
            >
              ›
            </button>
          </>
        )}
      </div>

      {variations.length > 1 && (
        <>
          <div className="hidden md:flex min-w-0 items-center gap-2.5">
            {thumbnailScroll.overflows && (
              <button
                type="button"
                onClick={() => scrollThumbnails(-1)}
                disabled={!thumbnailScroll.canScrollLeft}
                aria-label="Прокрутити мініатюри назад"
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#e0e0e0] bg-white text-2xl hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹
              </button>
            )}
            <div
              ref={thumbnailsRef}
              className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto py-px"
            >
            {variations.map((variation, index) => (
              <button
                key={`${getVariationLabel(variation)}-${index}`}
                type="button"
                onClick={() => selectAt(index)}
                aria-label={getVariationLabel(variation) || `Фото ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={`relative shrink-0 w-14 h-14 overflow-hidden transition-all ${
                  activeIndex === index
                    ? "outline outline-2 outline-[#e53935] outline-offset-[-1px]"
                    : "outline outline-1 outline-[#e0e0e0] hover:outline-[#bbb]"
                }`}
              >
                {variation.image && (
                  <img
                    src={variation.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                )}
              </button>
            ))}
            </div>
            {thumbnailScroll.overflows && (
              <button
                type="button"
                onClick={() => scrollThumbnails(1)}
                disabled={!thumbnailScroll.canScrollRight}
                aria-label="Прокрутити мініатюри вперед"
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#e0e0e0] bg-white text-2xl hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ›
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center justify-center">
            {variations.map((variation, index) => (
              <button
                key={`${getVariationLabel(variation)}-dot-${index}`}
                type="button"
                onClick={() => selectAt(index)}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    activeIndex === index ? "#E53935" : "#E0E0E0",
                }}
                aria-label={getVariationLabel(variation) || `Фото ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
