"use client";

import { useEffect, useRef } from "react";

export default function RollingNumber({ value }: { value: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || !("IntersectionObserver" in window)) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (media.matches) return;
      const reels = element.querySelectorAll<HTMLElement>("[data-digit]");
      let completed = 0;
      element.dataset.rolling = "running";
      reels.forEach((reel, index) => {
        const digit = Number(reel.dataset.digit);
        const animation = reel.animate([
          { transform: "translateY(0)" },
          { transform: `translateY(-${20 + digit}em)` },
        ], { duration: 1400 + index * 120, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" });
        animations.push(animation);
        animation.onfinish = () => {
          // Underlying style shows the same digit without retaining an animation.
          animation.cancel();
          if (++completed === reels.length) element.dataset.rolling = "done";
        };
      });
    }, { threshold: 0.4 });
    observer.observe(element);
    const stop = () => {
      if (!media.matches) return;
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      element.dataset.rolling = "done";
    };
    media.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", stop);
      animations.forEach(animation => animation.cancel());
    };
  }, [value]);

  return <span ref={root} className="inline-flex tabular-nums" data-rolling-number={value}>
    <span className="sr-only">{value}</span>
    <span aria-hidden="true" className="inline-flex">
      {[...value].map((character, index) => /\d/.test(character)
        ? <span key={index} className="inline-block h-[1em] w-[0.65em] overflow-hidden">
            <span data-digit={character} className="flex flex-col" style={{ transform: `translateY(-${Number(character)}em)` }}>
              {Array.from({ length: 30 }, (_, digit) => <span key={digit} className="h-[1em] shrink-0 text-center leading-[1]">{digit % 10}</span>)}
            </span>
          </span>
        : <span key={index}>{character}</span>)}
    </span>
  </span>;
}
