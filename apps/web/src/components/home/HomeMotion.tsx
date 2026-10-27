"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || !root.current || !("IntersectionObserver" in window)) return;
    const targets = root.current.querySelectorAll<HTMLElement>("[data-home-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        const element = target as HTMLElement;
        element.dataset.homeReveal = "visible";
        observer.unobserve(element);
      });
    }, { threshold: 0.08 });
    targets.forEach((element) => {
      element.dataset.homeReveal = "pending";
      const siblings = element.parentElement?.querySelectorAll(":scope > [data-home-reveal]");
      const index = siblings ? Array.from(siblings).indexOf(element) : 0;
      element.style.setProperty("--home-reveal-delay", `${Math.max(0, index) * 55}ms`);
      observer.observe(element);
    });
    const revealAll = () => {
      if (!media.matches) return;
      observer.disconnect();
      targets.forEach((element) => { element.dataset.homeReveal = "done"; });
    };
    media.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", revealAll);
      targets.forEach((element) => { element.dataset.homeReveal = "done"; });
    };
  }, []);

  return <div ref={root} className="bg-white font-['Outfit',sans-serif] text-[#1a1a1a]">{children}</div>;
}
