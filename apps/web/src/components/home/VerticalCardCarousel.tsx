"use client";

import { useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { scrollCard, cancelCardScroll } from "@/lib/scroll-card";
import { CardAutoplayContext } from "./RandomCardGroup";

export default function VerticalCardCarousel({ slides, label, className = "" }: {
  slides: { key: string; content: ReactNode }[];
  label: string;
  className?: string;
}) {
  const register = useContext(CardAutoplayContext);
  const viewport = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const element = viewport.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReducedMotion(media.matches); setHidden(document.hidden); };
    update();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.5 });
    if (root.current) observer.observe(root.current);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      observer.disconnect();
      if (element) cancelCardScroll(element);
    };
  }, []);

  useEffect(() => {
    if (!register || slides.length < 2 || hovered || focused || touching || !visible || reducedMotion || hidden) return;
    return register(() => {
      const element = viewport.current;
      if (element) scrollCard(element, (active + 1) % slides.length);
    });
  }, [register, active, slides.length, hovered, focused, touching, visible, reducedMotion, hidden]);
  const multiple = slides.length > 1;
  const select = (index: number) => {
    const element = viewport.current;
    if (!element) return;
    scrollCard(element, index);
  };

  return (
    <div ref={root} data-home-reveal=""
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      className={`relative isolate min-w-0 border border-[#e0e0e0] transition-[border-color,translate] duration-150 ease-out hover:border-[#e53935] motion-safe:hover:-translate-y-1 motion-reduce:transition-none ${className}`}
      role="region" aria-label={label} aria-roledescription={multiple ? "карусель" : undefined}>
      <div ref={viewport} onWheel={() => { if (viewport.current) cancelCardScroll(viewport.current); }} onTouchStart={() => { setTouching(true); if (viewport.current) cancelCardScroll(viewport.current); }} onTouchEnd={() => setTouching(false)} onTouchCancel={() => setTouching(false)} className="h-full snap-y snap-mandatory overflow-y-auto"
        onScroll={(event) => {
          const element = event.currentTarget;
          if (element.clientHeight) setActive(Math.round(element.scrollTop / element.clientHeight));
        }}
        onKeyDown={(event) => {
          if (!multiple || !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          select(event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : Math.max(0, Math.min(slides.length - 1, active + (event.key === "ArrowDown" ? 1 : -1))));
        }}>
        {slides.map((slide, index) => <div key={slide.key} className="h-full snap-start snap-always" role="group" aria-roledescription="слайд" aria-label={`${index + 1} з ${slides.length}`} inert={index !== active}>
          {slide.content}
        </div>)}
      </div>
      {multiple && (
        <button type="button" onClick={() => select((active + 1) % slides.length)} aria-label={`Наступна картка: ${label}`}
          className="absolute right-3 top-[118px] flex size-7 items-center justify-center rounded-full border border-[#e0e0e0] bg-white/80 text-[#1a1a1a] transition-colors hover:border-[#e53935] hover:text-[#e53935] focus-visible:outline-2 focus-visible:outline-[#e53935] md:top-[140px]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 10 4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
    </div>
  );
}
