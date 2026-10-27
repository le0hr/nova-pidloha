"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "@/types/home";
import HomeIcon from "./HomeIcon";
import ShopMap from "./ShopMap";
import HeroBody from "./HeroBody";

export default function Hero({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mapInteractive, setMapInteractive] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const elapsed = useRef(0);
  const progress = useRef<HTMLDivElement>(null);
  const rotating = slides.length > 1 && !hovered && !focused && !hidden && !reducedMotion && !mapInteractive;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReducedMotion(media.matches); setHidden(document.hidden); };
    update();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { media.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); };
  }, []);
  useEffect(() => {
    if (!rotating) return;
    let previous = performance.now();
    let frame: number;
    const tick = (now: number) => {
      elapsed.current = Math.min(7000, elapsed.current + now - previous);
      previous = now;
      if (progress.current) progress.current.style.transform = `scaleX(${elapsed.current / 7000})`;
      if (elapsed.current >= 7000) {
        elapsed.current = 0;
        if (progress.current) progress.current.style.transform = "scaleX(0)";
        setActive((current) => (current + 1) % slides.length);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [rotating, slides.length, active]);

  if (!slides.length) return null;
  const currentIndex = active % slides.length;
  const slide = slides[currentIndex];
  const isMap = slide.kind === "map";
  const selectSlide = (index: number) => {
    elapsed.current = 0;
    if (progress.current) progress.current.style.transform = "scaleX(0)";
    setActive((index + slides.length) % slides.length);
    setMapInteractive(false);
  };
  const alignment = slide.alignment === "right" ? "md:ml-auto" : slide.alignment === "center" ? "mx-auto items-center text-center" : "items-start";

  return (
    <section aria-label="Пропозиції та магазини" aria-roledescription="карусель"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (mapInteractive || (event.target as HTMLElement).closest("input, textarea, select")) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault(); selectSlide(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}
      onTouchStart={(event) => {
        if (!mapInteractive && event.touches.length === 1) touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={(event) => {
        const start = touchStart.current; touchStart.current = null;
        if (!start || mapInteractive) return;
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) selectSlide(currentIndex + (dx < 0 ? 1 : -1));
      }}
      className="home-hero relative isolate w-full overflow-hidden bg-[#35332e] text-white">
      {slides.map((background, index) => <div key={`${index}:${background.title}`} aria-hidden={index !== currentIndex} inert={index !== currentIndex}
        className={`hero-media absolute inset-0 bg-[#35332e] ${index === currentIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        {background.kind === "map" ? <ShopMap interactive={index === currentIndex && mapInteractive} /> : <>
          {background.image && <Image src={background.image} alt={background.imageAlt ?? ""} fill sizes="100vw"
            className={`hero-photo object-cover ${background.mobileImage ? "hidden md:block" : ""}`} priority={index === currentIndex} unoptimized={background.image.startsWith("http")} />}
          {background.mobileImage && <Image src={background.mobileImage} alt={background.imageAlt ?? ""} fill sizes="100vw" className="hero-photo object-cover md:hidden" priority={index === currentIndex} unoptimized={background.mobileImage.startsWith("http")} />}
        </>}
      </div>)}
      {!mapInteractive && <div className={`pointer-events-none absolute inset-0 z-[1] ${isMap ? "bg-gradient-to-r from-black/85 via-black/55 to-transparent" : "bg-black/45"}`} />}
      <div className={`content-container page-gutter relative z-[2] flex min-h-[340px] items-center !pt-8 !pb-24 md:min-h-[400px] md:!pt-10 lg:min-h-[440px] ${mapInteractive ? "pointer-events-none" : ""}`}>
        {!mapInteractive && <div key={currentIndex} className={`hero-copy flex w-full max-w-[720px] flex-col gap-3 md:gap-4 ${alignment} ${isMap ? "md:!max-w-[48%]" : ""}`} aria-live={rotating ? "off" : "polite"} aria-atomic="true">
          {slide.eyebrow && <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide md:text-sm"><span className="h-[3px] w-8 bg-[#e53935]" />{slide.eyebrow}</p>}
          {slide.badge && <span className="bg-[#e53935] px-3 py-1 text-sm font-bold">{slide.badge}</span>}
          <h1 className="max-w-[320px] text-[28px] font-medium leading-[1.1] md:max-w-[680px] md:text-[40px] md:font-extrabold md:leading-[1.15] lg:text-[48px]">{slide.title}</h1>
          {(slide.description || slide.mobileDescription) && <p className="text-sm leading-relaxed text-white/90 md:text-base"><span className="md:hidden">{slide.mobileDescription || slide.description}</span><span className="hidden md:inline">{slide.description}</span></p>}
          {!!slide.body?.length && <HeroBody blocks={slide.body} />}
          <div className="flex w-full flex-wrap gap-3 pt-1 md:w-auto md:pt-3">
            {isMap && <button type="button" onClick={() => setMapInteractive(true)} className="flex min-h-12 items-center justify-center gap-3 bg-[#e53935] px-6 py-3 text-sm font-bold hover:bg-[#c62828] md:px-8 md:py-4 md:text-base">Знайти магазини<HomeIcon name="map-pin" /></button>}
            {slide.href && slide.label && <Link href={slide.href} className="flex min-h-12 items-center justify-center gap-3 bg-[#e53935] px-6 py-3 text-sm font-bold hover:bg-[#c62828] md:px-8 md:py-4 md:text-base">{slide.label}<HomeIcon name="arrow-white" /></Link>}
            {slide.secondaryHref && slide.secondaryLabel && <Link href={slide.secondaryHref} className="flex min-h-12 items-center gap-3 border-2 border-white px-6 py-3 font-bold hover:bg-white/15">{slide.secondaryLabel}<HomeIcon name="arrow-white" /></Link>}
          </div>
        </div>}
      </div>
      {isMap && <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="absolute bottom-1 right-0 z-[3] bg-white/90 px-2 py-0.5 text-[10px] text-[#333]">© OpenStreetMap contributors</a>}
      {mapInteractive && <button type="button" onClick={() => setMapInteractive(false)} className="absolute top-4 left-4 z-[3] bg-[#35332e] px-4 py-3 text-sm font-bold shadow">Закрити мапу ×</button>}
      {slides.length > 1 && <div className="absolute bottom-7 left-0 right-0 z-[3] flex items-center justify-center gap-2 px-3">
        <button type="button" aria-label="Попередній слайд" onClick={() => selectSlide(currentIndex - 1)} className="flex size-10 items-center justify-center rounded-full border border-white/40 bg-black/40 hover:bg-black/60"><HomeIcon name="chevron-left" /></button>
        <div className="flex flex-wrap justify-center rounded-full bg-black/35 px-2">
          {slides.map((item, index) => <button key={`${index}-${item.title}`} type="button" onClick={() => selectSlide(index)} aria-label={`Слайд ${index + 1}: ${item.title}`} aria-current={currentIndex === index ? "true" : undefined} className="flex size-9 items-center justify-center rounded-full"><span className={`size-2 rounded-full ${currentIndex === index ? "bg-white" : "bg-white/40"}`} /></button>)}
        </div>
        <button type="button" aria-label="Наступний слайд" onClick={() => selectSlide(currentIndex + 1)} className="flex size-10 items-center justify-center rounded-full border border-white/40 bg-black/40 hover:bg-black/60"><HomeIcon name="chevron-right" /></button>

      </div>}
      {slides.length > 1 && !reducedMotion && <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[4] h-[3px] bg-white/20">
        <div ref={progress} className="hero-progress h-full origin-left bg-[#e53935]" style={{ transform: "scaleX(0)" }} />
      </div>}
    </section>
  );
}
